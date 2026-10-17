import { useState } from 'react';
import { VisualBlock } from './VisualBlock';
import { useI18n } from '../i18n/LanguageContext';
import type { Question } from '../types';

export function SavedQuestionCard({ question, onRemove }: { question: Question; onRemove: () => void }) {
  const { t, m } = useI18n();
  const [open, setOpen] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);

  const revealed = picked !== null;
  const correct = picked === question.correctIndex;

  return (
    <article className="rounded-2xl border border-line bg-elev p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-2xl leading-snug">{t(question.prompt)}</h3>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 rounded-full border border-line px-3 py-1 text-sm hover:border-bad hover:text-bad"
        >
          {m('remove')}
        </button>
      </div>
      <button
        type="button"
        className="mt-3 text-sm text-brass"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? m('hideReview') : m('practiceLead')}
      </button>
      {open ? (
        <div className="mt-4 space-y-3">
          {question.visual ? <VisualBlock visual={question.visual} /> : null}
          <div className="grid gap-2">
            {question.options.map((option, index) => {
              const active = picked === index;
              const showCorrect = revealed && index === question.correctIndex;
              const showWrong = revealed && active && !correct;
              return (
                <button
                  key={index}
                  type="button"
                  disabled={revealed}
                  onClick={() => setPicked(index)}
                  className={`rounded-xl border px-4 py-3 text-left ${
                    showCorrect
                      ? 'border-good bg-good/10'
                      : showWrong
                        ? 'border-bad bg-bad/10'
                        : 'border-line hover:border-brass/60'
                  }`}
                >
                  <span className="mr-2 font-serif text-brass">{String.fromCharCode(65 + index)}</span>
                  {t(option)}
                </button>
              );
            })}
          </div>
          {revealed ? <p className={correct ? 'text-good' : 'text-bad'}>{correct ? m('correctLabel') : m('pickedWrong')}</p> : null}
          <button
            type="button"
            onClick={() => setHintOpen((value) => !value)}
            className="rounded-full border border-line px-4 py-2 text-sm hover:border-brass"
          >
            {hintOpen ? m('hideHint') : m('hint')}
          </button>
          {hintOpen ? <p className="rounded-xl border border-brass/40 bg-brass/10 px-4 py-3 text-sm">{t(question.hint)}</p> : null}
          {revealed ? (
            <>
              <h4 className="font-serif text-xl">{m('solution')}</h4>
              <p className="whitespace-pre-wrap leading-relaxed">{t(question.solution)}</p>
            </>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
