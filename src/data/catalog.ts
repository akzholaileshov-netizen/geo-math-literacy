import type { Question, Section, Subsection } from '../types';
import { sections } from './sections';
import { chartQuestions } from './questions/charts';
import { combinatoricsQuestions } from './questions/combinatorics';
import { geometryQuestions } from './questions/geometry';
import { logicQuestions } from './questions/logic';
import { numberQuestions } from './questions/numbers';
import { percentQuestions } from './questions/percents';
import { wordQuestions } from './questions/word';

export { sections };

export const questionsBySection: Record<string, Question[]> = {
  numbers: numberQuestions,
  percents: percentQuestions,
  word: wordQuestions,
  charts: chartQuestions,
  logic: logicQuestions,
  geometry: geometryQuestions,
  combinatorics: combinatoricsQuestions,
};

export const allQuestions: Question[] = sections.flatMap((section) => questionsBySection[section.id] ?? []);

export const questionById = new Map(allQuestions.map((question) => [question.id, question]));

export function findSection(sectionId: string): Section | undefined {
  return sections.find((section) => section.id === sectionId);
}

export function findSubsection(sectionId: string, subsectionId: string): Subsection | undefined {
  return findSection(sectionId)?.subsections.find((subsection) => subsection.id === subsectionId);
}
