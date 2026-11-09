import NewPasswordForm from './NewPasswordForm';

export const metadata = { title: 'Nouveau mot de passe | Equimarge', robots: { index: false } };

export default function Page() {
  return (
    <div className="auth" style={{ gridTemplateColumns: 'minmax(0, 480px)', justifyContent: 'center' }}>
      <NewPasswordForm />
    </div>
  );
}
