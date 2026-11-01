import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildXlsx, columnName, crc32 } from '../lib/xlsx.mjs';

// Lit le répertoire central d'une archive ZIP : nom, taille et position de chaque fichier.
function readZip(bytes) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const end = bytes.length - 22;
  assert.equal(v.getUint32(end, true), 0x06054b50, 'fin de répertoire central');
  const count = v.getUint16(end + 10, true);
  let p = v.getUint32(end + 16, true);
  const files = {};
  for (let i = 0; i < count; i++) {
    assert.equal(v.getUint32(p, true), 0x02014b50);
    const size = v.getUint32(p + 24, true);
    const nameLen = v.getUint16(p + 28, true);
    const offset = v.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
    const localNameLen = v.getUint16(offset + 26, true);
    const data = bytes.subarray(offset + 30 + localNameLen, offset + 30 + localNameLen + size);
    assert.equal(crc32(data), v.getUint32(p + 16, true), `CRC de ${name}`);
    files[name] = new TextDecoder().decode(data);
    p += 46 + nameLen;
  }
  return files;
}

test('columnName suit la numérotation Excel', () => {
  assert.equal(columnName(0), 'A');
  assert.equal(columnName(25), 'Z');
  assert.equal(columnName(26), 'AA');
  assert.equal(columnName(701), 'ZZ');
  assert.equal(columnName(702), 'AAA');
});

test('crc32 donne la valeur de référence', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
});

test('buildXlsx produit une archive avec une feuille par tableau', () => {
  const bytes = buildXlsx([
    { name: 'Plan d’action', rows: [['Action', 'Score'], ['Registre <RGPD> & DPO', { value: 0.5, format: 'pct' }], ['', 3]] },
    { name: 'Plan d’action', rows: [['Seule ligne']] },
    { name: 'Nom/interdit:[x]*?', rows: [] },
  ]);
  assert.equal(new TextDecoder().decode(bytes.subarray(0, 2)), 'PK');
  const files = readZip(bytes);
  assert.ok(files['[Content_Types].xml'].includes('/xl/worksheets/sheet3.xml'));
  const wb = files['xl/workbook.xml'];
  assert.ok(wb.includes('name="Plan d’action"') && wb.includes('name="Plan d’action (2)"'));
  assert.ok(wb.includes('name="Nom interdit  x"'));
  assert.ok(wb.includes("'Plan d’action'!$A$1:$B$3"));
  const s1 = files['xl/worksheets/sheet1.xml'];
  assert.ok(s1.includes('Registre &lt;RGPD&gt; &amp; DPO'));
  assert.ok(s1.includes('<c r="B2" s="2"><v>0.5</v></c>'));
  assert.ok(s1.includes('<autoFilter ref="A1:B3"/>'));
  assert.ok(!s1.includes('r="A3"'), 'une cellule vide n’est pas écrite');
  assert.ok(!files['xl/worksheets/sheet2.xml'].includes('autoFilter'));
});
