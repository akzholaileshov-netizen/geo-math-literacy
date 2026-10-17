import { sections } from '../data/catalog';
import type { AttemptRecord, DashboardStats, SectionProgress } from '../data/store/types';

export function buildProgress(attempts: AttemptRecord[]): {
  sections: SectionProgress[];
  stats: DashboardStats;
} {
  const bySection = new Map<string, AttemptRecord[]>();
  for (const attempt of attempts) {
    const list = bySection.get(attempt.sectionId) ?? [];
    list.push(attempt);
    bySection.set(attempt.sectionId, list);
  }

  const sectionRows: SectionProgress[] = sections.map((section) => {
    const list = bySection.get(section.id) ?? [];
    const newest = [...list].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
    return {
      sectionId: section.id,
      attempts: list.length,
      bestPercent: list.reduce((max, item) => Math.max(max, item.percent), 0),
      bestPoints: list.reduce((max, item) => Math.max(max, item.points), 0),
      lastPercent: newest[0]?.percent ?? 0,
      totalCorrect: list.reduce((sum, item) => sum + item.correct, 0),
      totalQuestions: list.reduce((sum, item) => sum + item.total, 0),
      totalPoints: list.reduce((sum, item) => sum + item.points, 0),
      totalTimeSeconds: list.reduce((sum, item) => sum + item.timeSpentSeconds, 0),
    };
  });

  const testsTaken = attempts.length;
  const totalCorrect = attempts.reduce((sum, item) => sum + item.correct, 0);
  const totalQuestions = attempts.reduce((sum, item) => sum + item.total, 0);
  const played = sectionRows.filter((row) => row.attempts > 0);
  const best = [...played].sort(
    (a, b) => b.bestPercent - a.bestPercent || b.totalPoints - a.totalPoints || a.sectionId.localeCompare(b.sectionId),
  )[0];

  return {
    sections: sectionRows,
    stats: {
      testsTaken,
      overallPercent: totalQuestions === 0 ? 0 : Math.round((totalCorrect / totalQuestions) * 100),
      averageScore:
        testsTaken === 0 ? 0 : Math.round(attempts.reduce((sum, item) => sum + item.percent, 0) / testsTaken),
      totalPoints: attempts.reduce((sum, item) => sum + item.points, 0),
      totalTimeSeconds: attempts.reduce((sum, item) => sum + item.timeSpentSeconds, 0),
      bestSectionId: best?.sectionId ?? null,
      solved: totalCorrect,
    },
  };
}
