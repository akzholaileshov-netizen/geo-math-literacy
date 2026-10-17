import { QUESTION_SECONDS } from '../quiz/time';

/** Points for one correct answer before the speed bonus. */
export const POINT_BASE = 10;

/** One extra point for each full block of remaining seconds. */
export const POINT_SPEED_CHUNK = 30;

/**
 * Points for a single answer.
 * Correct: 10 + floor(secondsLeft / 30), clamped to the 300s question clock (max 20).
 * Wrong or timeout: 0.
 */
export function pointsForAnswer(correct: boolean, secondsLeft: number): number {
  if (!correct) return 0;
  const left = clampSeconds(secondsLeft);
  return POINT_BASE + Math.floor(left / POINT_SPEED_CHUNK);
}

/** Seconds used on one question. A timeout spends the full 300s. */
export function secondsSpent(secondsLeft: number): number {
  return QUESTION_SECONDS - clampSeconds(secondsLeft);
}

function clampSeconds(secondsLeft: number): number {
  if (!Number.isFinite(secondsLeft)) return 0;
  return Math.max(0, Math.min(QUESTION_SECONDS, Math.floor(secondsLeft)));
}
