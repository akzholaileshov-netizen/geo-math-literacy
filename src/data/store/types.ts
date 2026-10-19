import type { LeaderboardSort, RankedRow } from '../../services/ranking';

export type { LeaderboardSort, RankedRow };

export type StoreMode = 'local';

export type Profile = {
  id: string;
  nickname: string;
  avatarColor: string;
  createdAt: string;
  isGuest: boolean;
};

export type RawAnswer = {
  questionId: string;
  selectedIndex: number | null;
  timedOut: boolean;
  secondsLeft: number;
};

export type ScoredAnswer = RawAnswer & {
  points: number;
};

export type AttemptRecord = {
  id: string;
  profileId: string;
  sectionId: string;
  startedAt: string;
  finishedAt: string;
  correct: number;
  total: number;
  percent: number;
  points: number;
  timeSpentSeconds: number;
  answers: ScoredAnswer[];
};

export type SaveAttemptInput = {
  id: string;
  sectionId: string;
  startedAt: string;
  finishedAt: string;
  answers: RawAnswer[];
};

export type SectionProgress = {
  sectionId: string;
  attempts: number;
  bestPercent: number;
  bestPoints: number;
  lastPercent: number;
  totalCorrect: number;
  totalQuestions: number;
  totalPoints: number;
  totalTimeSeconds: number;
};

export type DashboardStats = {
  testsTaken: number;
  overallPercent: number;
  averageScore: number;
  totalPoints: number;
  totalTimeSeconds: number;
  bestSectionId: string | null;
  solved: number;
};

export type StoreErrorCode =
  | 'nickname_taken'
  | 'nickname_unknown'
  | 'invalid_nickname'
  | 'auth_failed'
  | 'not_signed_in';

export class StoreError extends Error {
  readonly code: StoreErrorCode;

  constructor(code: StoreErrorCode) {
    super(code);
    this.name = 'StoreError';
    this.code = code;
  }
}

export function isStoreError(error: unknown): error is StoreError {
  return error instanceof StoreError;
}

export type DataStore = {
  readonly mode: StoreMode;
  getSession(): Promise<Profile | null>;
  registerNickname(nickname: string, avatarColor: string): Promise<Profile>;
  signInNickname(nickname: string): Promise<Profile>;
  updateProfile(nickname: string, avatarColor: string): Promise<Profile>;
  signOut(): Promise<void>;
  claimGuest(nickname: string, avatarColor: string): Promise<Profile>;
  ensureGuest(): Promise<Profile>;
  listFavorites(): Promise<string[]>;
  setFavorite(questionId: string, saved: boolean): Promise<string[]>;
  saveAttempt(input: SaveAttemptInput): Promise<AttemptRecord>;
  listAttempts(): Promise<AttemptRecord[]>;
  sectionProgress(): Promise<SectionProgress[]>;
  dashboardStats(): Promise<DashboardStats>;
  leaderboard(
    limit: number,
    sort: LeaderboardSort,
  ): Promise<{ rows: RankedRow[]; me: RankedRow | null }>;
  onAuthChange(listener: (profile: Profile | null) => void): () => void;
};
