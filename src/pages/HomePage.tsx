import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sections } from '../data/catalog';
import { useI18n } from '../i18n/LanguageContext';

export function HomePage() {
  const { t, m } = useI18n();
  const [openId, setOpenId] = useState<string>(sections[0].id);

  return (
    <div className="space-y-8">
      <section className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.28em] text-brass">{m('eyebrow')}</p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-ink sm:text-6xl">{m('brand')}</h1>
        <p className="mt-4 max-w-2xl text-lg text-ink/90">{m('hero')}</p>
        <p className="mt-2 max-w-2xl text-muted">{m('heroLead')}</p>
      </section>

      <div className="space-y-3">
        {sections.map((section, index) => {
          const open = openId === section.id;
          return (
            <section key={section.id} className="overflow-hidden rounded-2xl border border-line bg-elev shadow-card">
              <h2>
                <button
                  type="button"
                  className="flex w-full items-start gap-4 px-4 py-4 text-left sm:px-6"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? '' : section.id)}
                >
                  <span className="mt-1 font-serif text-2xl text-brass">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-2xl leading-tight sm:text-3xl">{t(section.title)}</span>
                    <span className="mt-1 block text-sm text-muted">{t(section.blurb)}</span>
                  </span>
                  <span className="mt-2 text-brass" aria-hidden>
                    {open ? '−' : '+'}
                  </span>
                </button>
              </h2>
              {open ? (
                <ul className="border-t border-line">
                  {section.subsections.map((subsection) => (
                    <li key={subsection.id} className="border-b border-line last:border-b-0">
                      <Link
                        to={`/section/${section.id}/${subsection.id}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 text-ink transition hover:bg-brass/10 sm:px-6"
                      >
                        <span>{t(subsection.title)}</span>
                        <span aria-hidden className="text-brass">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
