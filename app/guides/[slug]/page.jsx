import Link from 'next/link';
import { notFound } from 'next/navigation';
import { GUIDES, guideBySlug } from '@/lib/guides';

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }) {
  const g = guideBySlug((await params).slug);
  if (!g) return {};
  return { title: `${g.title} | Equimarge`, description: g.description, alternates: { canonical: `/guides/${g.slug}` } };
}

const frDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function GuidePage({ params }) {
  const g = guideBySlug((await params).slug);
  if (!g) notFound();
  return (
    <article className="guide">
      <p className="note"><Link href="/guides">Guides</Link></p>
      <h1>{g.title}</h1>
      <p className="lead">{g.intro}</p>
      {g.sections.map((s) => (
        <section key={s.title}>
          <h2>{s.title}</h2>
          {s.body.map((b, i) =>
            typeof b === 'string' ? <p key={i}>{b}</p> : <ul key={i}>{b.list.map((li) => <li key={li}>{li}</li>)}</ul>,
          )}
        </section>
      ))}
      <section className="guide-sources">
        <h2>Sources</h2>
        <ul>
          {g.sources.map((s) => (
            <li key={s.href}><a href={s.href} rel="noopener noreferrer" target="_blank">{s.label}</a></li>
          ))}
        </ul>
        <p className="note">
          Mis à jour le {frDate(g.updated)}. Ce guide donne une information générale. Il ne remplace pas l’analyse de votre
          situation.
        </p>
      </section>
      <div className="band">
        <div>
          <h2>Faire le point sur votre situation</h2>
          <p>Nous répondons à toute demande de devis sous 48&nbsp;h ouvrées.</p>
        </div>
        <div className="row">
          <Link href="/conformite#devis" className="btn lg">Demander un devis</Link>
          <Link href={g.related.href} className="btn ghost lg">{g.related.label}</Link>
        </div>
      </div>
    </article>
  );
}
