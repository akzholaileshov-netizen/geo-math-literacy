import type { Attempt, Question } from '../types';

export type Graded = {
  question: Question;
  attempt: Attempt;
  correct: boolean;
};

export function isCorrect(question: Question, attempt: Attempt): boolean {
  if (attempt.timedOut || attempt.selectedIndex === null) return false;
  return attempt.selectedIndex === question.correctIndex;
}

export function grade(questions: Question[], attempts: Attempt[]): Graded[] {
  return questions.map((question, index) => {
    const attempt = attempts[index] ?? {
      questionId: question.id,
      selectedIndex: null,
      timedOut: true,
      secondsLeft: 0,
    };
    return { question, attempt, correct: isCorrect(question, attempt) };
  });
}

export function scoreOf(graded: Graded[]): { correct: number; total: number; percent: number } {
  const total = graded.length;
  const correct = graded.filter((item) => item.correct).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percent };
}
