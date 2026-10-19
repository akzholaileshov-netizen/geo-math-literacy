import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClaimForm } from '../components/ClaimForm';
import { MistakeReview } from '../components/MistakeReview';
import { SavedQuestionCard } from '../components/SavedQuestionCard';
import { buttonClass } from '../components/ui/Button';
import { GlassPanel } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/Progress';
import { SectionHeader } from '../components/ui/SectionHeader';
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
    void Promise.all([store.dashboardStats(), store.sectionProgress(), store.listAttempts()])
      .then(([nextStats, nextSections, nextAttempts]) => {
        if (cancel) return;
        setStats(nextStats);
        setSections(nextSections);
        setAttempts(nextAttempts);
      })
      .catch(() => {
        if (cancel) return;
        setStats(null);
        setSections([]);
        setAttempts([]);
      });
    return () => {
      cancel = true;
    };
  }, [profile, ready, revision, store]);

  if (!ready) return null;
  if (!profile) {
    return (
      <GlassPanel className="p-6">
        <h1 className="font-serif text-4xl leading-tight">{m('dashboard')}</h1>
        <p className="measure mt-3 text-muted">{m('emptyDash')}</p>
        <Link to="/auth" className={buttonClass('primary', 'mt-4')}>
          {m('goAuth')}
        </Link>
      </GlassPanel>
    );
  }

  const saved = favorites.map((id) => questionById.get(id)).filter((item) => item !== undefined);
  const best = stats?.bestSectionId ? findSection(stats.bestSectionId) : undefined;

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow={m('summaryStrip')} title={profileLabel(profile, m('guest'))} />

      {profile.isGuest ? <ClaimForm /> : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label={m('testsTaken')} value={String(stats?.testsTaken ?? 0)} />
        <Stat label={m('overallPercent')} value={`${stats?.overallPercent ?? 0}%`} />
        <Stat label={m('averageScore')} value={`${stats?.averageScore ?? 0}%`} />
        <Stat label={m('totalPoints')} value={String(stats?.totalPoints ?? 0)} />
        <Stat label={m('totalTime')} value={formatDuration(stats?.totalTimeSeconds ?? 0)} />
        <Stat label={m('bestSection')} value={best ? t(best.title) : m('noBest')} />
      </section>

      <GlassPanel className="p-5 sm:p-6">
        <h2 className="font-serif text-3xl leading-tight">{m('sectionProgress')}</h2>
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
                <div className="mt-2">
                  <ProgressBar value={row.bestPercent} label={t(section.title)} />
                </div>
              </li>
            );
          })}
        </ul>
      </GlassPanel>

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
            <GlassPanel key={attempt.id} className="p-5">
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
                  className={buttonClass('ghost')}
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
            </GlassPanel>
          );
        })}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <GlassPanel className="px-5 py-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="break-words font-serif text-2xl leading-tight sm:text-3xl">{value}</div>
    </GlassPanel>
  );
}
