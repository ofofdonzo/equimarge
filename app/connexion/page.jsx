import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata = { title: 'Connexion — Equimarge', robots: { index: false } };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
