export type RankInput = {
  profileId: string;
  nickname: string;
  avatarColor: string;
  points: number;
  timeSpentSeconds: number;
  solved: number;
  isGuest: boolean;
  isDemo: boolean;
};

export type RankedRow = RankInput & { rank: number };

export type LeaderboardSort = 'points' | 'time' | 'solved';

/**
 * Points: higher first, then more solved, then less time.
 * Time: more seconds spent first, then more points.
 * Solved: more correct answers first, then more points, then less time.
 * profileId breaks any remaining tie.
 */
export function rankRows(rows: RankInput[], sort: LeaderboardSort): RankedRow[] {
  const sorted = [...rows].sort((a, b) => compareRows(a, b, sort));
  return sorted.map((row, index) => ({ ...row, rank: index + 1 }));
}

function compareRows(a: RankInput, b: RankInput, sort: LeaderboardSort): number {
  if (sort === 'time') {
    return (
      b.timeSpentSeconds - a.timeSpentSeconds ||
      b.points - a.points ||
      a.profileId.localeCompare(b.profileId)
    );
  }
  if (sort === 'solved') {
    return (
      b.solved - a.solved ||
      b.points - a.points ||
      a.timeSpentSeconds - b.timeSpentSeconds ||
      a.profileId.localeCompare(b.profileId)
    );
  }
  return (
    b.points - a.points ||
    b.solved - a.solved ||
    a.timeSpentSeconds - b.timeSpentSeconds ||
    a.profileId.localeCompare(b.profileId)
  );
}
