import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { VisualBlock } from '../components/VisualBlock';
import { findSection, questionsBySection } from '../data/catalog';
import { useI18n } from '../i18n/LanguageContext';
import { STORAGE, readSessionJson } from '../lib/storage';
import { grade, scoreOf } from '../quiz/score';
import type { QuizResult } from '../types';

function isResult(value: unknown, sectionId: string): value is QuizResult {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as QuizResult;
  return candidate.sectionId === sectionId && Array.isArray(candidate.attempts) && candidate.attempts.length === 30;
}

export function ResultsPage() {
  const { sectionId = '' } = useParams();
  const location = useLocation();
  const section = findSection(sectionId);
  const questions = questionsBySection[sectionId];
  const { t, m } = useI18n();

  const fromState = isResult(location.state, sectionId) ? location.state : null;
  const stored = readSessionJson<QuizResult | null>(STORAGE.result, null);
  const result = fromState ?? (isResult(stored, sectionId) ? stored : null);

  if (!section || !questions || !result) return <Navigate to="/" replace />;

  const graded = grade(questions, result.attempts);
  const score = scoreOf(graded);
  const mistakes = graded.filter((item) => !item.correct);
  const missed = graded.filter((item) => item.attempt.timedOut || item.attempt.selectedIndex === null).length;
  const wrong = mistakes.length - missed;

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
        <Stat label={m('correctLabel')} value={score.correct} />
        <div className="grid gap-3">
          <Stat label={m('wrongLabel')} value={wrong} />
          <Stat label={m('missedLabel')} value={missed} />
        </div>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="rounded-full border border-line px-5 py-2.5 text-center hover:border-brass">
          {m('backHome')}
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
        {mistakes.length === 0 ? <p className="text-muted">{m('allCorrect')}</p> : null}
        {mistakes.map((item, mistakeIndex) => {
          const chosen =
            item.attempt.selectedIndex === null
              ? null
              : item.question.options[item.attempt.selectedIndex];
          return (
            <article key={item.question.id} className="rounded-2xl border border-line bg-elev p-5 shadow-card sm:p-6">
              <h3 className="font-serif text-2xl">
                {mistakeIndex + 1}. {t(item.question.prompt)}
              </h3>
              {item.question.visual ? (
                <div className="mt-4">
                  <VisualBlock visual={item.question.visual} />
                </div>
              ) : null}
              <dl className="mt-4 space-y-2 text-sm sm:text-base">
                <div>
                  <dt className="text-muted">{m('yourAnswer')}</dt>
                  <dd className="text-bad">
                    {chosen ? t(chosen) : m('noAnswer')}
                    {item.attempt.timedOut ? ` · ${m('timedOutNote')}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">{m('correctAnswer')}</dt>
                  <dd className="text-good">{t(item.question.options[item.question.correctIndex])}</dd>
                </div>
              </dl>
              <h4 className="mt-4 font-serif text-xl">{m('solution')}</h4>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{t(item.question.solution)}</p>
            </article>
          );
        })}
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
