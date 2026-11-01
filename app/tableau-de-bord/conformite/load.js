// Charge un dossier et tout son contenu (côté serveur). Les règles d'accès de la base ne renvoient
// que ce que l'utilisateur connecté a le droit de voir : son dossier, ou tous pour l'administrateur.
export async function loadDossier(supabase, id) {
  const by = (table, columns, order = true) => {
    const q = supabase.from(table).select(columns).eq('dossier_id', id);
    return order ? q.order('created_at').limit(500) : q;
  };
  const [dossier, answers, actions, records, risks, infos, documents] = await Promise.all([
    supabase.from('dossiers').select('id,company,contact_name,email,client_id,offer,status,created_at,updated_at').eq('id', id).maybeSingle(),
    by('dossier_answers', 'question,answer', false),
    by('dossier_actions', 'id,domain,title,owner,due_date,priority,status,source'),
    by('dossier_records', 'id,name,purpose,legal_basis,data_subjects,data_categories,sensitive,recipients,transfers,retention,security'),
    by('dossier_risks', 'id,domain,title,probability,impact,measure,status'),
    by('dossier_info_requests', 'id,title,details,due_date,status,response,answered_at,created_at'),
    by('dossier_documents', 'id,info_request_id,kind,name,path,size,created_at'),
  ]);
  const failed = [dossier, answers, actions, records, risks, infos, documents].some((r) => r.error);
  return {
    dossier: dossier.data,
    failed,
    initial: {
      answers: Object.fromEntries((answers.data || []).map((a) => [a.question, a.answer])),
      actions: actions.data || [],
      records: records.data || [],
      risks: risks.data || [],
      infos: infos.data || [],
      documents: documents.data || [],
    },
  };
}
