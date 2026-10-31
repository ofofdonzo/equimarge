import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  // Les apostrophes du texte français sont voulues
  { rules: { 'react/no-unescaped-entities': 'off' } },
  { ignores: ['.next/**', 'node_modules/**', '.netlify/**'] },
];

export default config;
