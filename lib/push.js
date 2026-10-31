// Clé publique des notifications (VAPID). Elle est publique par nature : le navigateur s'en sert
// pour s'abonner. La clé privée correspondante n'est jamais dans le code : variable Netlify VAPID_PRIVATE_KEY.
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BIUtBhe7Bg0lSatuBeabyogzJumyi-jVE3qvLzbu8Zuq-9FfQjqadasOF7fEtaDUmN9xTsMYZtS-6IZby_1WuPk';
