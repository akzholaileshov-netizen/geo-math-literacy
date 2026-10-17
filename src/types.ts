export type Lang = 'kk' | 'ru';

export type Localized = {
  kk: string;
  ru: string;
};

export type BarVisual = {
  type: 'bar';
  items: { label: Localized; value: number }[];
  unit?: Localized;
};

export type LineVisual = {
  type: 'line';
  points: { label: Localized; value: number }[];
  unit?: Localized;
};

export type TableVisual = {
  type: 'table';
  headers: Localized[];
  rows: Localized[][];
};

export type Visual = BarVisual | LineVisual | TableVisual;

export type Question = {
  id: string;
  prompt: Localized;
  options: [Localized, Localized, Localized, Localized];
  correctIndex: 0 | 1 | 2 | 3;
  hint: Localized;
  solution: Localized;
  visual?: Visual;
};

export type Example = {
  problem: Localized;
  solution: Localized;
  visual?: Visual;
};

export type Subsection = {
  id: string;
  title: Localized;
  rules: Localized[];
  formulas: Localized[];
  examples: [Example, Example];
};

export type Section = {
  id: string;
  title: Localized;
  blurb: Localized;
  subsections: [Subsection, Subsection, Subsection];
};

export type Attempt = {
  questionId: string;
  selectedIndex: number | null;
  timedOut: boolean;
};

export type QuizResult = {
  sectionId: string;
  attempts: Attempt[];
};
