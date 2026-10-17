import type { Attempt, QuizResult } from '../types';
import type { SaveAttemptInput } from '../data/store/types';

export function coerceQuizResult(value: unknown, sectionId: string): QuizResult | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<QuizResult>;
  if (candidate.sectionId !== sectionId || !Array.isArray(candidate.attempts) || candidate.attempts.length !== 30) {
    return null;
  }
  const attempts: Attempt[] = candidate.attempts.map((item) => {
    const attempt = item as Partial<Attempt>;
    return {
      questionId: typeof attempt.questionId === 'string' ? attempt.questionId : '',
      selectedIndex: typeof attempt.selectedIndex === 'number' ? attempt.selectedIndex : null,
      timedOut: Boolean(attempt.timedOut),
      secondsLeft: typeof attempt.secondsLeft === 'number' ? attempt.secondsLeft : 0,
    };
  });
  return {
    id: typeof candidate.id === 'string' ? candidate.id : crypto.randomUUID(),
    sectionId,
    attempts,
    startedAt: typeof candidate.startedAt === 'string' ? candidate.startedAt : new Date().toISOString(),
    finishedAt: typeof candidate.finishedAt === 'string' ? candidate.finishedAt : new Date().toISOString(),
  };
}

export function attemptInput(result: QuizResult): SaveAttemptInput {
  return {
    id: result.id,
    sectionId: result.sectionId,
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    answers: result.attempts.map((attempt) => ({
      questionId: attempt.questionId,
      selectedIndex: attempt.selectedIndex,
      timedOut: attempt.timedOut,
      secondsLeft: attempt.secondsLeft,
    })),
  };
}
