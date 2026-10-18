import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { ClaimForm } from '../components/ClaimForm';
import { MistakeReview } from '../components/MistakeReview';
import { findSection, questionsBySection } from '../data/catalog';
import { useStore } from '../hooks/StoreContext';
import { useI18n } from '../i18n/LanguageContext';
import { STORAGE, readSessionJson } from '../lib/storage';
import { grade, scoreOf } from '../quiz/score';
import { attemptInput, coerceQuizResult } from '../quiz/result';
import { summarizeAnswers } from '../services/attemptStats';
import type { QuizResult } from '../types';

export function ResultsPage() {
  const { sectionId = '' } = useParams();
  const location = useLocation();
  const section = findSection(sectionId);
  const questions = questionsBySection[sectionId];
  const { t, m } = useI18n();
  const { persistQuiz, profile, store } = useStore();
  const [saved, setSaved] = useState(false);
  const [pendingCloud, setPendingCloud] = useState(false);

  const stored = useMemo(() => readSessionJson<QuizResult | null>(STORAGE.result, null), [sectionId]);
  const result = useMemo(
    () => coerceQuizResult(location.state, sectionId) ?? coerceQuizResult(stored, sectionId),
    [location.state, sectionId, stored],
  );

  useEffect(() => {
    if (!result) return;
    let cancel = false;
    void persistQuiz(attemptInput(result))
      .then((record) => {
        if (cancel) return;
        if (record) setSaved(true);
        else setPendingCloud(true);
      })
      .catch(() => {
        if (!cancel) setPendingCloud(false);
      });
    return () => {
      cancel = true;
    };
  }, [persistQuiz, result]);

  if (!section || !questions || !result) return <Navigate to="/" replace />;

  const graded = grade(questions, result.attempts);
  const score = scoreOf(graded);
  const summary = summarizeAnswers(result.attempts);
  const missed = graded.filter((item) => item.attempt.timedOut || item.attempt.selectedIndex === null).length;
  const wrong = graded.filter((item) => !item.correct).length - missed;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.22em] text-brass">{t(section.title)}</p>
        <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{m('results')}</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-elev p-5 sm:col-span-2">
          <div className="text-sm text-muted">{m('percentLabel')}</div>
          <div className="font-serif text-6xl text-brass">{score.percent}%</div>
          <div className="mt-1 text-lg">
            {score.correct} / {score.total}
          </div>
        </div>
        <Stat label={m('points')} value={summary.points} />
        <div className="grid gap-3">
          <Stat label={m('correctLabel')} value={score.correct} />
          <Stat label={m('wrongLabel')} value={wrong} />
          <Stat label={m('missedLabel')} value={missed} />
        </div>
      </section>

      {saved ? <p className="text-sm text-good">{m('attemptSaved')}</p> : null}
      {pendingCloud ? (
        <p className="text-sm text-muted">
          {m('signInToSave')}{' '}
          <Link to="/auth" className="text-brass">
            {m('goAuth')}
          </Link>
        </p>
      ) : null}
      {profile?.isGuest && store.mode === 'local' ? <ClaimForm /> : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="rounded-full border border-line px-5 py-2.5 text-center hover:border-brass">
          {m('backHome')}
        </Link>
        <Link to="/dashboard" className="rounded-full border border-line px-5 py-2.5 text-center hover:border-brass">
          {m('dashboard')}
        </Link>
        <Link
          to={`/quiz/${section.id}`}
          className="rounded-full bg-brass px-5 py-2.5 text-center font-semibold text-bg"
        >
          {m('retry')}
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="font-serif text-3xl">{m('errors')}</h2>
        <MistakeReview sectionId={section.id} attempts={result.attempts} />
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-elev px-5 py-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="font-serif text-3xl">{value}</div>
    </div>
  );
}
