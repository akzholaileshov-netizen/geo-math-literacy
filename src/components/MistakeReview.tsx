import { GlassPanel } from './ui/Card';
import { VisualBlock } from './VisualBlock';
import { questionsBySection } from '../data/catalog';
import { useI18n } from '../i18n/LanguageContext';
import { grade } from '../quiz/score';
import type { Attempt } from '../types';

export function MistakeReview({ sectionId, attempts }: { sectionId: string; attempts: Attempt[] }) {
  const questions = questionsBySection[sectionId];
  const { t, m } = useI18n();
  if (!questions) return null;

  const mistakes = grade(questions, attempts).filter((item) => !item.correct);
  if (mistakes.length === 0) return <p className="text-muted">{m('allCorrect')}</p>;

  return (
    <div className="space-y-4">
      {mistakes.map((item, mistakeIndex) => {
        const chosen =
          item.attempt.selectedIndex === null ? null : item.question.options[item.attempt.selectedIndex];
        return (
          <GlassPanel key={item.question.id} className="p-5 sm:p-6">
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
          </GlassPanel>
        );
      })}
    </div>
  );
}
