import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { VisualBlock } from '../components/VisualBlock';
import { findSection, questionsBySection } from '../data/catalog';
import { useFavorites } from '../favorites/useFavorites';
import { useI18n } from '../i18n/LanguageContext';
import { STORAGE } from '../lib/storage';
import { formatClock, QUESTION_SECONDS } from '../quiz/time';
import type { Attempt, QuizResult } from '../types';

export function QuizPage() {
  const { sectionId = '' } = useParams();
  const section = findSection(sectionId);
  const questions = questionsBySection[sectionId];
  const { t, m } = useI18n();
  const favorites = useFavorites();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [left, setLeft] = useState(QUESTION_SECONDS);
  const [finished, setFinished] = useState<QuizResult | null>(null);
  const attemptsRef = useRef<Attempt[]>([]);
  const indexRef = useRef(0);
  const lockRef = useRef(false);
  const startedAtRef = useRef(new Date().toISOString());
  const endsAtRef = useRef(0);

  useEffect(() => {
    attemptsRef.current = [];
    indexRef.current = 0;
    lockRef.current = false;
    startedAtRef.current = new Date().toISOString();
    setIndex(0);
    setSelected(null);
    setHintOpen(false);
  }, [sectionId]);

  useEffect(() => {
    if (!questions) return;
    lockRef.current = false;
    setSelected(null);
    setHintOpen(false);
    setLeft(QUESTION_SECONDS);
    const endsAt = Date.now() + QUESTION_SECONDS * 1000;
    endsAtRef.current = endsAt;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining <= 0 && commit(null, true)) {
        window.clearInterval(timer);
      }
    }, 200);
    return () => window.clearInterval(timer);
    // commit is stable via refs; restart only when the question index changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, sectionId]);

  if (!section || !questions || questions.length !== 30) return <Navigate to="/" replace />;
  if (finished) return <Navigate to={`/results/${finished.sectionId}`} replace state={finished} />;

  const question = questions[index];
  const saved = favorites.has(question.id);

  function commit(choice: number | null, timedOut: boolean) {
    if (lockRef.current || !questions || !section) return false;
    lockRef.current = true;
    const current = questions[indexRef.current];
    const secondsLeft = timedOut ? 0 : Math.max(0, Math.ceil((endsAtRef.current - Date.now()) / 1000));
    const attempt: Attempt = {
      questionId: current.id,
      selectedIndex: timedOut ? null : choice,
      timedOut,
      secondsLeft,
    };
    const nextAttempts = [...attemptsRef.current, attempt];
    attemptsRef.current = nextAttempts;
    if (indexRef.current + 1 >= questions.length) {
      const result: QuizResult = {
        id: crypto.randomUUID(),
        sectionId: section.id,
        attempts: nextAttempts,
        startedAt: startedAtRef.current,
        finishedAt: new Date().toISOString(),
      };
      sessionStorage.setItem(STORAGE.result, JSON.stringify(result));
      setFinished(result);
      return true;
    }
    indexRef.current += 1;
    setIndex(indexRef.current);
    return true;
  }

  const urgent = left <= 30;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brass">{t(section.title)}</p>
          <h1 className="font-serif text-3xl sm:text-4xl">
            {m('question')} {index + 1} / 30
          </h1>
        </div>
        <div
          className={`rounded-2xl border px-4 py-2 text-right ${urgent ? 'border-bad text-bad' : 'border-line text-ink'}`}
          role="timer"
          aria-label={m('timeLeft')}
          aria-live="off"
        >
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted">{m('timeLeft')}</div>
          <div className="font-serif text-4xl leading-none tabular">{formatClock(left)}</div>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-line" aria-hidden>
        <div className="h-full bg-brass transition-all" style={{ width: `${(index / 30) * 100}%` }} />
      </div>
      <p className="text-sm text-muted">{m('quizNote')}</p>

      <section className="rounded-2xl border border-line bg-elev p-5 shadow-card sm:p-7">
        <h2 className="font-serif text-2xl leading-snug sm:text-3xl">{t(question.prompt)}</h2>
        {question.visual ? (
          <div className="mt-5">
            <VisualBlock visual={question.visual} />
          </div>
        ) : null}

        <div className="mt-5 grid gap-3" role="radiogroup">
          {question.options.map((option, optionIndex) => {
            const active = selected === optionIndex;
            return (
              <button
                key={optionIndex}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(optionIndex)}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  active ? 'border-brass bg-brass/15' : 'border-line hover:border-brass/60'
                }`}
              >
                <span className="mr-3 font-serif text-brass">{String.fromCharCode(65 + optionIndex)}</span>
                {t(option)}
              </button>
            );
          })}
        </div>

        {hintOpen ? (
          <p className="mt-4 rounded-xl border border-brass/40 bg-brass/10 px-4 py-3 text-sm leading-relaxed">
            {t(question.hint)}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => setHintOpen((open) => !open)}
            className="rounded-full border border-line px-4 py-2 text-sm hover:border-brass"
          >
            {hintOpen ? m('hideHint') : m('hint')}
          </button>
          <button
            type="button"
            onClick={() => favorites.toggle(question.id)}
            aria-pressed={saved}
            className={`rounded-full border px-4 py-2 text-sm ${
              saved ? 'border-brass bg-brass/15' : 'border-line hover:border-brass'
            }`}
          >
            {saved ? m('saved') : m('save')}
          </button>
          <button
            type="button"
            disabled={selected === null}
            onClick={() => {
              if (selected === null) return;
              commit(selected, false);
            }}
            className="rounded-full bg-brass px-5 py-2 text-sm font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-40"
          >
            {m('confirm')}
          </button>
        </div>
      </section>
    </div>
  );
}
