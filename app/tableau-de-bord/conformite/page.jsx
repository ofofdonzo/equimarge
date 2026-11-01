import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import SpaceNav from '@/components/SpaceNav';
import Workspace from './Workspace';

export const metadata = { title: 'Mon espace conformité — Equimarge', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion?suite=/tableau-de-bord/conformite');

  // Les règles d'accès de la base ne renvoient que les lignes du client connecté.
  const [answers, actions, records, risks] = await Promise.all([
    supabase.from('compliance_answers').select('question,answer'),
    supabase.from('compliance_actions').select('id,domain,title,owner,due_date,priority,status,source').order('created_at').limit(500),
    supabase
      .from('rgpd_records')
      .select('id,name,purpose,legal_basis,data_subjects,data_categories,sensitive,recipients,transfers,retention,security')
      .order('created_at')
      .limit(300),
    supabase.from('compliance_risks').select('id,domain,title,probability,impact,measure,status').order('created_at').limit(300),
  ]);
  // Tables absentes : le fichier supabase/schema.sql n'a pas encore été relancé
  const setupMissing = [answers, actions, records, risks].some((r) => r.error);

  return (
    <div className="stack">
      <SpaceNav current="conformite" />
      <Workspace
        userId={user.id}
        email={user.email}
        setupMissing={setupMissing}
        initial={{
          answers: Object.fromEntries((answers.data || []).map((a) => [a.question, a.answer])),
          actions: actions.data || [],
          records: records.data || [],
          risks: risks.data || [],
        }}
      />
    </div>
  );
}
