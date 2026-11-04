import Confirmed from './Confirmed';

export const metadata = { title: 'E-mail confirmé — Equimarge', robots: { index: false } };

// Arrivée depuis le lien de confirmation d'un compte créé dans l'application iPhone.
export default function Page() {
  return (
    <div className="auth" style={{ gridTemplateColumns: 'minmax(0, 520px)', justifyContent: 'center' }}>
      <Confirmed />
    </div>
  );
}
