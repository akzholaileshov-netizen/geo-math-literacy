import { Link, Navigate, useParams } from 'react-router-dom';
import { VisualBlock } from '../components/VisualBlock';
import { buttonClass } from '../components/ui/Button';
import { GlassPanel } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
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

      <SectionHeader eyebrow={m('theory')} title={t(subsection.title)} lead={m('sameQuiz')} />

      <GlassPanel className="p-5 sm:p-7">
        <h2 className="font-serif text-3xl">{m('rules')}</h2>
        <ul className="mt-4 space-y-3">
          {subsection.rules.map((rule, index) => (
            <li key={index} className="flex gap-3 leading-relaxed">
              <span className="mt-1 text-brass">▸</span>
              <span>{t(rule)}</span>
            </li>
          ))}
        </ul>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-7">
        <h2 className="font-serif text-3xl leading-tight">{m('formulas')}</h2>
        <ul className="mt-4 space-y-3">
          {subsection.formulas.map((formula, index) => (
            <li
              key={index}
              className="rounded-2xl border border-line bg-bg/70 px-4 py-3 font-serif text-xl leading-snug"
            >
              {t(formula)}
            </li>
          ))}
        </ul>
      </GlassPanel>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">{m('examples')}</h2>
        {subsection.examples.map((example, index) => (
          <GlassPanel key={index} className="p-5 sm:p-7">
            <h3 className="font-serif text-2xl text-brass">
              {m('example')} {index + 1}
            </h3>
            <p className="mt-3 leading-relaxed">{t(example.problem)}</p>
            {example.visual ? (
              <div className="mt-4">
                <VisualBlock visual={example.visual} />
              </div>
            ) : null}
            <p className="mt-4 whitespace-pre-wrap leading-relaxed text-ink">{t(example.solution)}</p>
          </GlassPanel>
        ))}
      </section>

      <Link
        to={`/quiz/${section.id}`}
        className={buttonClass('primary', 'px-6')}
      >
        {m('start')}
      </Link>
    </article>
  );
}
