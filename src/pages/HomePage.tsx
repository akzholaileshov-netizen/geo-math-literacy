import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AccordionPanel, Card, GlassPanel } from '../components/ui/Card';
import { buttonClass } from '../components/ui/Button';
import { sections } from '../data/catalog';
import type { DashboardStats } from '../data/store/types';
import { profileLabel, useStore } from '../hooks/StoreContext';
import { useI18n } from '../i18n/LanguageContext';

export function HomePage() {
  const { t, m } = useI18n();
  const { store, profile, ready, revision } = useStore();
  const [openId, setOpenId] = useState<string>(sections[0].id);
  const [summary, setSummary] = useState<{ stats: DashboardStats; rank: number | null } | null>(null);

  useEffect(() => {
    if (!ready || !profile) {
      setSummary(null);
      return;
    }
    let cancel = false;
    void Promise.all([store.dashboardStats(), store.leaderboard(10, 'points')])
      .then(([stats, board]) => {
        if (!cancel) setSummary({ stats, rank: board.me?.rank ?? null });
      })
      .catch(() => {
        if (!cancel) setSummary(null);
      });
    return () => {
      cancel = true;
    };
  }, [profile, ready, revision, store]);

  return (
    <div className="space-y-8">
      {profile && summary ? (
        <GlassPanel className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">{m('summaryStrip')}</p>
            <p className="font-serif text-2xl leading-tight">{profileLabel(profile, m('guest'))}</p>
          </div>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-muted">{m('points')}</dt>
              <dd className="tabular text-lg font-semibold">{summary.stats.totalPoints}</dd>
            </div>
            <div>
              <dt className="text-muted">{m('testsTaken')}</dt>
              <dd className="tabular text-lg font-semibold">{summary.stats.testsTaken}</dd>
            </div>
            <div>
              <dt className="text-muted">{m('rank')}</dt>
              <dd className="tabular text-lg font-semibold">{summary.rank ?? '—'}</dd>
            </div>
          </dl>
          <Link to="/dashboard" className={buttonClass('soft', 'self-start sm:self-center')}>
            {m('dashboard')}
          </Link>
        </GlassPanel>
      ) : null}
      <section className="measure">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brass">{m('eyebrow')}</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.12] text-ink sm:text-6xl">{m('brand')}</h1>
        <p className="mt-4 text-lg leading-relaxed text-ink">{m('hero')}</p>
        <p className="mt-2 leading-relaxed text-muted">{m('heroLead')}</p>
      </section>

      <div className="space-y-3">
        {sections.map((section, index) => {
          const open = openId === section.id;
          return (
            <Card key={section.id} lift className="overflow-hidden">
              <h2>
                <button
                  type="button"
                  className="flex min-h-11 w-full items-start gap-4 px-4 py-4 text-left sm:px-6"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? '' : section.id)}
                >
                  <span className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brass/15 font-serif text-xl text-brass">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-2xl leading-tight sm:text-3xl">{t(section.title)}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{t(section.blurb)}</span>
                  </span>
                  <span className="mt-2 text-xl text-brass" aria-hidden>
                    {open ? '−' : '+'}
                  </span>
                </button>
              </h2>
              <AccordionPanel open={open}>
                <ul className="border-t border-line">
                  {section.subsections.map((subsection) => (
                    <li key={subsection.id} className="border-b border-line last:border-b-0">
                      <Link
                        to={`/section/${section.id}/${subsection.id}`}
                        className="flex min-h-11 items-center justify-between gap-3 px-4 py-3 text-ink transition hover:bg-brass/10 sm:px-6"
                      >
                        <span className="leading-snug">{t(subsection.title)}</span>
                        <span aria-hidden className="text-brass">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionPanel>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
