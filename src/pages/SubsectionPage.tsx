import { Link, Navigate, useParams } from 'react-router-dom';
import { VisualBlock } from '../components/VisualBlock';
import { findSection, findSubsection } from '../data/catalog';
import { useI18n } from '../i18n/LanguageContext';

export function SubsectionPage() {
  const { sectionId = '', subsectionId = '' } = useParams();
  const section = findSection(sectionId);
  const subsection = findSubsection(sectionId, subsectionId);
  const { t, m } = useI18n();

  if (!section || !subsection) return <Navigate to="/" replace />;

  return (
    <article className="space-y-8">
      <nav className="text-sm text-muted">
        <Link to="/" className="hover:text-ink">
          {m('home')}
        </Link>
        <span className="px-2">/</span>
        <span>{t(section.title)}</span>
      </nav>

      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-brass">{m('theory')}</p>
        <h1 className="mt-2 font-serif text-4xl leading-tight sm:text-5xl">{t(subsection.title)}</h1>
        <p className="mt-3 text-muted">{m('sameQuiz')}</p>
      </header>

      <section className="rounded-2xl border border-line bg-elev p-5 shadow-card sm:p-7">
        <h2 className="font-serif text-3xl">{m('rules')}</h2>
        <ul className="mt-4 space-y-3">
          {subsection.rules.map((rule, index) => (
            <li key={index} className="flex gap-3 leading-relaxed">
              <span className="mt-1 text-brass">▸</span>
              <span>{t(rule)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-line bg-elev p-5 shadow-card sm:p-7">
        <h2 className="font-serif text-3xl">{m('formulas')}</h2>
        <ul className="mt-4 space-y-3">
          {subsection.formulas.map((formula, index) => (
            <li
              key={index}
              className="rounded-xl border border-line bg-bg/70 px-4 py-3 font-serif text-xl leading-snug"
            >
              {t(formula)}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">{m('examples')}</h2>
        {subsection.examples.map((example, index) => (
          <div key={index} className="rounded-2xl border border-line bg-elev p-5 shadow-card sm:p-7">
            <h3 className="font-serif text-2xl text-brass">
              {m('example')} {index + 1}
            </h3>
            <p className="mt-3 leading-relaxed">{t(example.problem)}</p>
            {example.visual ? (
              <div className="mt-4">
                <VisualBlock visual={example.visual} />
              </div>
            ) : null}
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-ink/90">{t(example.solution)}</p>
          </div>
        ))}
      </section>

      <Link
        to={`/quiz/${section.id}`}
        className="inline-flex rounded-full bg-brass px-6 py-3 font-semibold text-bg transition hover:brightness-110"
      >
        {m('start')}
      </Link>
    </article>
  );
}
