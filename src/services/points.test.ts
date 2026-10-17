import { describe, expect, it } from 'vitest';
import { QUESTION_SECONDS } from '../quiz/time';
import { POINT_BASE, POINT_SPEED_CHUNK, pointsForAnswer, secondsSpent } from './points';

describe('points', () => {
  it('keeps the per-question clock at 300 seconds', () => {
    expect(QUESTION_SECONDS).toBe(300);
    expect(POINT_SPEED_CHUNK).toBe(30);
    expect(POINT_BASE).toBe(10);
  });

  it('scores a correct answer by remaining time', () => {
    expect(pointsForAnswer(true, 300)).toBe(20);
    expect(pointsForAnswer(true, 30)).toBe(11);
    expect(pointsForAnswer(true, 29)).toBe(10);
    expect(pointsForAnswer(true, 0)).toBe(10);
    expect(pointsForAnswer(true, 999)).toBe(20);
    expect(pointsForAnswer(true, -4)).toBe(10);
  });

  it('gives nothing for a miss or a timeout', () => {
    expect(pointsForAnswer(false, 300)).toBe(0);
    expect(pointsForAnswer(false, 0)).toBe(0);
  });

  it('counts time spent as the part of the 300s that elapsed', () => {
    expect(secondsSpent(300)).toBe(0);
    expect(secondsSpent(240)).toBe(60);
    expect(secondsSpent(0)).toBe(300);
  });
});
