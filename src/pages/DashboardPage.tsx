import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClaimForm } from '../components/ClaimForm';
import { MistakeReview } from '../components/MistakeReview';
import { SavedQuestionCard } from '../components/SavedQuestionCard';
import { findSection, questionById } from '../data/catalog';
import type { AttemptRecord, DashboardStats, SectionProgress } from '../data/store/types';
import { profileLabel, useStore } from '../hooks/StoreContext';
import { useI18n } from '../i18n/LanguageContext';
import { formatDuration } from '../quiz/time';

export function DashboardPage() {
  const { t, m } = useI18n();
  const { store, profile, ready, favorites, removeFavorite, revision } = useStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [sections, setSections] = useState<SectionProgress[]>([]);
  const [attempts, setAttempts] = useState<AttemptRecord[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !profile) return;
    let cancel = false;
    void Promise.all([store.dashboardStats(), store.sectionProgress(), store.listAttempts()]).then(
      ([nextStats, nextSections, nextAttempts]) => {
        if (cancel) return;
        setStats(nextStats);
        setSections(nextSections);
        setAttempts(nextAttempts);
      },
    );
    return () => {
      cancel = true;
    };
  }, [profile, ready, revision, store]);

  if (!ready) return null;
  if (!profile) {
    return (
      <div className="rounded-2xl border border-line bg-elev p-6">
        <h1 className="font-serif text-4xl">{m('dashboard')}</h1>
        <p className="mt-3 text-muted">{m('emptyDash')}</p>
        <Link to="/auth" className="mt-4 inline-flex text-brass">
          {m('goAuth')} →
        </Link>
      </div>
    );
  }

  const saved = favorites.map((id) => questionById.get(id)).filter((item) => item !== undefined);
  const best = stats?.bestSectionId ? findSection(stats.bestSectionId) : undefined;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-brass">{m('summaryStrip')}</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{profileLabel(profile, m('guest'))}</h1>
      </header>

      {profile.isGuest ? <ClaimForm /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label={m('testsTaken')} value={String(stats?.testsTaken ?? 0)} />
        <Stat label={m('overallPercent')} value={`${stats?.overallPercent ?? 0}%`} />
        <Stat label={m('averageScore')} value={`${stats?.averageScore ?? 0}%`} />
        <Stat label={m('totalPoints')} value={String(stats?.totalPoints ?? 0)} />
        <Stat label={m('totalTime')} value={formatDuration(stats?.totalTimeSeconds ?? 0)} />
        <Stat label={m('bestSection')} value={best ? t(best.title) : m('noBest')} />
      </section>

      <section className="rounded-2xl border border-line bg-elev p-5 shadow-card sm:p-6">
        <h2 className="font-serif text-3xl">{m('sectionProgress')}</h2>
        <ul className="mt-4 space-y-4">
          {sections.map((row) => {
            const section = findSection(row.sectionId);
            if (!section) return null;
            return (
              <li key={row.sectionId}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{t(section.title)}</span>
                  <span className="tabular text-muted">
                    {row.bestPercent}% · {row.attempts}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
                  <div className="h-full bg-brass" style={{ width: `${Math.max(0, Math.min(100, row.bestPercent))}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">{m('savedHard')}</h2>
        <p className="text-sm text-muted">{m('practiceLead')}</p>
        {saved.length === 0 ? <p className="text-muted">{m('emptyFav')}</p> : null}
        {saved.map((question) => (
          <SavedQuestionCard key={question.id} question={question} onRemove={() => void removeFavorite(question.id)} />
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">{m('recentAttempts')}</h2>
        {attempts.length === 0 ? <p className="text-muted">{m('noAttempts')}</p> : null}
        {attempts.map((attempt) => {
          const section = findSection(attempt.sectionId);
          const open = openId === attempt.id;
          return (
            <article key={attempt.id} className="rounded-2xl border border-line bg-elev p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-2xl">{section ? t(section.title) : attempt.sectionId}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {attempt.correct}/{attempt.total} · {attempt.percent}% · {attempt.points} {m('points')} ·{' '}
                    {formatDuration(attempt.timeSpentSeconds)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : attempt.id)}
                  className="rounded-full border border-line px-4 py-2 text-sm hover:border-brass"
                >
                  {open ? m('hideReview') : m('openReview')}
                </button>
              </div>
              {open ? (
                <div className="mt-4">
                  <h4 className="mb-3 font-serif text-2xl">{m('errors')}</h4>
                  <MistakeReview sectionId={attempt.sectionId} attempts={attempt.answers} />
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-elev px-5 py-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="font-serif text-3xl leading-tight">{value}</div>
    </div>
  );
}
