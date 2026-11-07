import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { originAllowed } from '@/lib/app-origin.mjs';
import { detectFileType, INVOICE_SCHEMA, INVOICE_SYSTEM, invoicePrompt, MAX_INVOICE_BYTES, normalizeInvoice } from '@/lib/recettes.mjs';

// Lecture d'une facture fournisseur (photo ou PDF) par Claude, pour mettre à jour le coût des matières premières.
// Le fichier n'est pas conservé : les lignes lues sont renvoyées au navigateur, où le client les vérifie
// avant toute mise à jour. Chaque lecture est comptée dans la table invoices (30 par jour au plus).
// Variables Netlify : ANTHROPIC_API_KEY (obligatoire) ; ANTHROPIC_MODEL (facultatif, claude-opus-5-5 par défaut).
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';
// Modèles qui acceptent le relais automatique vers un autre modèle quand une requête est refusée
const FALLBACK = /^claude-(opus-5|fable-5|sonnet-5-5)/;

const json = (body, status = 200) => NextResponse.json(body, { status });

export async function POST(request) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!originAllowed(request.headers.get('origin'), host)) return json({ error: 'Origine refusée' }, 403);
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: "La lecture automatique des factures n'est pas encore activée. Saisissez les prix à la main." }, 503);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: 'Connexion requise' }, 401);

  let file;
  try {
    file = (await request.formData()).get('file');
  } catch {
    return json({ error: 'Envoi invalide.' }, 400);
  }
  if (!file || typeof file.arrayBuffer !== 'function') return json({ error: 'Aucun fichier reçu.' }, 400);
  if (file.size > MAX_INVOICE_BYTES) return json({ error: 'Fichier trop lourd : 4 Mo au maximum.' }, 413);
  const bytes = Buffer.from(await file.arrayBuffer());
  const type = detectFileType(bytes);
  if (!type) return json({ error: 'Format non reconnu : envoyez une photo (JPEG, PNG, WebP) ou un PDF.' }, 415);

  // Compteur anti-abus : la base refuse la ligne au-delà de 30 lectures par jour (voir prepare_invoice)
  const { data: invoice, error: countError } = await supabase.from('invoices').insert({ status: 'Lecture' }).select('id').single();
  if (countError) {
    if (countError.message?.includes('limite_factures')) {
      return json({ error: 'Limite atteinte : 30 factures par jour et 300 par mois. Réessayez demain.' }, 429);
    }
    console.error('Facture', countError.message);
    return json({ error: 'Lecture impossible pour le moment. Réessayez.' }, 502);
  }
  const fail = async (status, error) => {
    await supabase.from('invoices').update({ status: 'Échec' }).eq('id', invoice.id);
    return json({ error }, status);
  };

  // Matières du client : Claude rattache chaque ligne à une matière existante quand c'est le même produit
  const { data: ingredients } = await supabase.from('ingredients').select('name,unit').order('name').limit(500);

  const source = { type: 'base64', media_type: type, data: bytes.toString('base64') };
  const params = {
    model: MODEL,
    max_tokens: 16000,
    system: INVOICE_SYSTEM,
    // Recopier une facture demande peu de réflexion : effort bas, pour une réponse rapide
    output_config: { effort: 'low', format: { type: 'json_schema', schema: INVOICE_SCHEMA } },
    messages: [
      {
        role: 'user',
        content: [
          type === 'application/pdf' ? { type: 'document', source } : { type: 'image', source },
          { type: 'text', text: invoicePrompt(ingredients || []) },
        ],
      },
    ],
  };

  let response;
  try {
    // Une seule tentative de 50 secondes au plus : les fonctions Netlify s'arrêtent à 60 secondes
    const client = new Anthropic({ timeout: 50_000, maxRetries: 0 });
    response = FALLBACK.test(MODEL)
      ? await client.beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
      : await client.messages.create(params);
  } catch (e) {
    if (e instanceof Anthropic.APIConnectionTimeoutError) {
      return fail(504, 'La lecture a pris trop de temps. Réessayez avec une photo plus nette, ou une seule page.');
    }
    if (e instanceof Anthropic.BadRequestError) {
      console.error('Claude (requête refusée)', e.message);
      return fail(422, 'Ce fichier ne peut pas être lu. Essayez une photo bien éclairée de la facture.');
    }
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) {
      console.error('Claude (clé API)', e.message);
      return fail(503, 'La lecture automatique est indisponible pour le moment. Saisissez les prix à la main.');
    }
    if (e instanceof Anthropic.RateLimitError || e instanceof Anthropic.InternalServerError) {
      return fail(503, 'Le service de lecture est saturé. Réessayez dans une minute.');
    }
    if (e instanceof Anthropic.APIError) {
      console.error('Claude', e.status, e.message);
      return fail(502, 'Lecture impossible pour le moment. Réessayez.');
    }
    throw e;
  }

  if (response.stop_reason === 'refusal') return fail(422, "Cette facture n'a pas pu être lue. Saisissez les prix à la main.");
  if (response.stop_reason === 'max_tokens') return fail(422, 'Facture trop longue : envoyez-la page par page.');
  const text = response.content.find((b) => b.type === 'text')?.text;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('Claude : réponse illisible', response.stop_reason);
    return fail(502, 'Lecture impossible pour le moment. Réessayez.');
  }

  const result = normalizeInvoice(parsed);
  const { error: saveError } = await supabase
    .from('invoices')
    .update({ status: 'Lue', supplier: result.supplier, invoice_date: result.date, total_ht: result.total, line_count: result.lines.length })
    .eq('id', invoice.id);
  if (saveError) console.error('Facture', saveError.message);

  return json({ invoice_id: invoice.id, ...result });
}
