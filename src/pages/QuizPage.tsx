import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { VisualBlock } from '../components/VisualBlock';
import { buttonClass, choiceClass } from '../components/ui/Button';
import { GlassPanel } from '../components/ui/Card';
import { BookmarkIcon, HintIcon } from '../components/ui/icons';
import { ProgressBar, ProgressRing } from '../components/ui/Progress';
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

  return (
    <div className="space-y-5 pb-40 md:pb-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="measure min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{t(section.title)}</p>
          <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
            {m('question')} {index + 1} / 30
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-muted sm:block">{m('timeLeft')}</p>
          <ProgressRing secondsLeft={left} total={QUESTION_SECONDS} caption={formatClock(left)} label={m('timeLeft')} />
        </div>
      </div>

      <ol className="grid grid-cols-10 gap-1.5 sm:grid-cols-[repeat(15,minmax(0,1fr))]" aria-label={m('progress')}>
        {questions.map((item, itemIndex) => {
          const state = itemIndex < index ? 'done' : itemIndex === index ? 'current' : 'upcoming';
          return (
            <li
              key={item.id}
              aria-current={state === 'current' ? 'step' : undefined}
              className={`grid h-7 place-items-center rounded-md text-[11px] tabular ${
                state === 'current'
                  ? 'bg-brass text-onbrass shadow-glow'
                  : state === 'done'
                    ? 'bg-brass/25 text-ink'
                    : 'bg-ink/10 text-muted dark:bg-white/10'
              }`}
            >
              {itemIndex + 1}
            </li>
          );
        })}
      </ol>
      <ProgressBar value={(index / 30) * 100} label={m('progress')} />
      <p className="measure text-sm leading-relaxed text-muted">{m('quizNote')}</p>

      <GlassPanel className="p-5 sm:p-7">
        <h2 className="measure font-serif text-2xl leading-snug sm:text-3xl">{t(question.prompt)}</h2>
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
                className={choiceClass(active ? 'selected' : 'idle')}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brass/15 font-serif text-brass">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="pt-1 leading-snug">{t(option)}</span>
              </button>
            );
          })}
        </div>

        {hintOpen ? (
          <p className="mt-4 rounded-2xl border border-brass/40 bg-brass/10 px-4 py-3 text-sm leading-relaxed">
            {t(question.hint)}
          </p>
        ) : null}
      </GlassPanel>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-elev/85 px-4 py-3 shadow-lift backdrop-blur-xl md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 md:flex md:flex-wrap">
          <button type="button" onClick={() => setHintOpen((open) => !open)} className={buttonClass('ghost')}>
            <HintIcon />
            {hintOpen ? m('hideHint') : m('hint')}
          </button>
          <button
            type="button"
            onClick={() => favorites.toggle(question.id)}
            aria-pressed={saved}
            className={buttonClass(saved ? 'soft' : 'ghost')}
          >
            <BookmarkIcon filled={saved} />
            {saved ? m('saved') : m('save')}
          </button>
          <button
            type="button"
            disabled={selected === null}
            onClick={() => {
              if (selected === null) return;
              commit(selected, false);
            }}
            className={buttonClass('primary', 'col-span-2 md:col-span-1 md:ml-auto')}
          >
            {m('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
