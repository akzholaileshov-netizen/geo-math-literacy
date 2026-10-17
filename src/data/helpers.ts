import type { Localized, Question, Visual } from '../types';

export function l(kk: string, ru: string): Localized {
  return { kk, ru };
}

export function n(value: string | number): Localized {
  const text = String(value);
  return { kk: text, ru: text };
}

type QuestionInput = {
  id: string;
  prompt: Localized;
  options: [Localized, Localized, Localized, Localized];
  correctIndex: 0 | 1 | 2 | 3;
  hint: Localized;
  solution: Localized;
  visual?: Visual;
};

export function q(input: QuestionInput): Question {
  return input;
}
