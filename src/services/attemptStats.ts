import { questionById } from '../data/catalog';
import type { RawAnswer, ScoredAnswer } from '../data/store/types';
import { isCorrect } from '../quiz/score';
import { pointsForAnswer, secondsSpent } from './points';

export type AttemptSummary = {
  answers: ScoredAnswer[];
  correct: number;
  total: number;
  percent: number;
  points: number;
  timeSpentSeconds: number;
};

export function answerIsCorrect(raw: RawAnswer): boolean {
  const question = questionById.get(raw.questionId);
  if (!question) return false;
  return isCorrect(question, {
    questionId: raw.questionId,
    selectedIndex: raw.selectedIndex,
    timedOut: raw.timedOut,
    secondsLeft: raw.secondsLeft,
  });
}

export function summarizeAnswers(raws: RawAnswer[]): AttemptSummary {
  const answers: ScoredAnswer[] = raws.map((raw) => {
    const correct = answerIsCorrect(raw);
    return { ...raw, points: pointsForAnswer(correct, raw.secondsLeft) };
  });
  const total = answers.length;
  const correct = answers.filter((answer) => answer.points > 0).length;
  const points = answers.reduce((sum, answer) => sum + answer.points, 0);
  const timeSpentSeconds = answers.reduce((sum, answer) => sum + secondsSpent(answer.secondsLeft), 0);
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { answers, correct, total, percent, points, timeSpentSeconds };
}
