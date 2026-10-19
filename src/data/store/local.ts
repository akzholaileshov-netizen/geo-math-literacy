import { STORAGE } from '../../lib/storage';
import { summarizeAnswers } from '../../services/attemptStats';
import { buildProgress } from '../../services/progress';
import { rankRows, type RankInput } from '../../services/ranking';
import { demoStudents } from './seed';
import { avatarColorOrDefault } from './palette';
import { assertNickname, sameNickname } from './nickname';
import type {
  AttemptRecord,
  DataStore,
  DashboardStats,
  Profile,
  SaveAttemptInput,
  SectionProgress,
} from './types';
import { StoreError } from './types';

export type KeyValueStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

type LocalProfile = Profile & {
  isDemo: boolean;
  demo?: { points: number; timeSpentSeconds: number; solved: number };
};

type Db = {
  version: 1;
  profiles: LocalProfile[];
  sessionId: string | null;
  favorites: Record<string, string[]>;
  attempts: AttemptRecord[];
  legacyFavoritesMigrated: boolean;
};

const DEMO_CREATED = '2024-09-01T00:00:00.000Z';

export function createLocalStore(storage: KeyValueStore): DataStore {
  const load = (): Db => {
    const raw = storage.getItem(STORAGE.store);
    if (!raw) return freshDb();
    try {
      const parsed = JSON.parse(raw) as Db;
      if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.profiles)) return freshDb();
      return parsed;
    } catch {
      return freshDb();
    }
  };

  const save = (db: Db) => {
    storage.setItem(STORAGE.store, JSON.stringify(db));
  };

  const requireSession = (db: Db): LocalProfile => {
    const profile = db.profiles.find((item) => item.id === db.sessionId && !item.isDemo);
    if (!profile) throw new StoreError('not_signed_in');
    return profile;
  };

  const toPublic = (profile: LocalProfile): Profile => ({
    id: profile.id,
    nickname: profile.nickname,
    avatarColor: profile.avatarColor,
    createdAt: profile.createdAt,
    isGuest: profile.isGuest,
  });

  const migrateFavorites = (db: Db, profileId: string) => {
    if (db.legacyFavoritesMigrated) return;
    const legacy = readStringList(storage.getItem(STORAGE.favorites));
    const current = db.favorites[profileId] ?? [];
    const merged = [...current];
    for (const id of legacy) {
      if (!merged.includes(id)) merged.push(id);
    }
    db.favorites[profileId] = merged;
    db.legacyFavoritesMigrated = true;
    storage.removeItem(STORAGE.favorites);
  };

  const taken = (db: Db, nickname: string, exceptId?: string) =>
    db.profiles.some((profile) => profile.id !== exceptId && sameNickname(profile.nickname, nickname));

  return {
    mode: 'local',

    async getSession() {
      const db = load();
      const profile = db.profiles.find((item) => item.id === db.sessionId && !item.isDemo);
      return profile ? toPublic(profile) : null;
    },

    async registerNickname(nickname, avatarColor) {
      const db = load();
      const current = db.profiles.find((item) => item.id === db.sessionId && !item.isDemo);
      if (current?.isGuest) return this.claimGuest(nickname, avatarColor);
      if (current) return this.updateProfile(nickname, avatarColor);
      const name = assertNickname(nickname);
      if (taken(db, name)) throw new StoreError('nickname_taken');
      const profile = makeUser(name, avatarColorOrDefault(avatarColor), false);
      db.profiles.push(profile);
      db.sessionId = profile.id;
      migrateFavorites(db, profile.id);
      save(db);
      return toPublic(profile);
    },

    async signInNickname(nickname) {
      const name = assertNickname(nickname);
      const db = load();
      const profile = db.profiles.find((item) => !item.isDemo && !item.isGuest && sameNickname(item.nickname, name));
      if (!profile) throw new StoreError('nickname_unknown');
      db.sessionId = profile.id;
      migrateFavorites(db, profile.id);
      save(db);
      return toPublic(profile);
    },

    async updateProfile(nickname, avatarColor) {
      const db = load();
      const profile = requireSession(db);
      if (profile.isGuest) return this.claimGuest(nickname, avatarColor);
      const name = assertNickname(nickname);
      if (taken(db, name, profile.id)) throw new StoreError('nickname_taken');
      profile.nickname = name;
      profile.avatarColor = avatarColorOrDefault(avatarColor);
      save(db);
      return toPublic(profile);
    },

    async signOut() {
      const db = load();
      db.sessionId = null;
      save(db);
    },

    async claimGuest(nickname, avatarColor) {
      const db = load();
      const profile = requireSession(db);
      if (!profile.isGuest) throw new StoreError('auth_failed');
      const name = assertNickname(nickname);
      if (taken(db, name, profile.id)) throw new StoreError('nickname_taken');
      profile.nickname = name;
      profile.avatarColor = avatarColorOrDefault(avatarColor);
      profile.isGuest = false;
      save(db);
      return toPublic(profile);
    },

    async ensureGuest() {
      const db = load();
      const existing = db.profiles.find((item) => item.id === db.sessionId && !item.isDemo);
      if (existing) return toPublic(existing);
      const profile = makeUser('', AVATAR_COLORS_FIRST, true);
      db.profiles.push(profile);
      db.sessionId = profile.id;
      migrateFavorites(db, profile.id);
      save(db);
      return toPublic(profile);
    },

    async listFavorites() {
      const db = load();
      if (!db.sessionId) return [];
      return [...(db.favorites[db.sessionId] ?? [])];
    },

    async setFavorite(questionId, saved) {
      const db = load();
      const profile = requireSession(db);
      const current = db.favorites[profile.id] ?? [];
      const next = saved
        ? current.includes(questionId)
          ? current
          : [...current, questionId]
        : current.filter((id) => id !== questionId);
      db.favorites[profile.id] = next;
      save(db);
      return [...next];
    },

    async saveAttempt(input) {
      const db = load();
      const profile = requireSession(db);
      const existing = db.attempts.find((item) => item.id === input.id);
      if (existing) {
        if (existing.profileId !== profile.id) throw new StoreError('auth_failed');
        return existing;
      }
      const record = toRecord(profile.id, input);
      db.attempts.push(record);
      save(db);
      return record;
    },

    async listAttempts() {
      const db = load();
      if (!db.sessionId) return [];
      return db.attempts
        .filter((item) => item.profileId === db.sessionId)
        .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
    },

    async sectionProgress() {
      return progressFor(load()).sections;
    },

    async dashboardStats() {
      return progressFor(load()).stats;
    },

    async leaderboard(limit, sort) {
      const db = load();
      const ranked = rankRows(rowsOf(db), sort);
      const me = ranked.find((row) => row.profileId === db.sessionId) ?? null;
      const size = limit === 50 ? 50 : 10;
      return { rows: ranked.slice(0, size), me };
    },

    onAuthChange() {
      return () => {};
    },
  };
}

const AVATAR_COLORS_FIRST = '#8d6a2e';

function progressFor(db: Db): { sections: SectionProgress[]; stats: DashboardStats } {
  const mine = db.sessionId ? db.attempts.filter((item) => item.profileId === db.sessionId) : [];
  return buildProgress(mine);
}

function rowsOf(db: Db): RankInput[] {
  return db.profiles.map((profile) => {
    if (profile.isDemo && profile.demo) {
      return {
        profileId: profile.id,
        nickname: profile.nickname,
        avatarColor: profile.avatarColor,
        points: profile.demo.points,
        timeSpentSeconds: profile.demo.timeSpentSeconds,
        solved: profile.demo.solved,
        isGuest: false,
        isDemo: true,
      };
    }
    const attempts = db.attempts.filter((item) => item.profileId === profile.id);
    return {
      profileId: profile.id,
      nickname: profile.nickname,
      avatarColor: profile.avatarColor,
      points: attempts.reduce((sum, item) => sum + item.points, 0),
      timeSpentSeconds: attempts.reduce((sum, item) => sum + item.timeSpentSeconds, 0),
      solved: attempts.reduce((sum, item) => sum + item.correct, 0),
      isGuest: profile.isGuest,
      isDemo: false,
    };
  });
}

function toRecord(profileId: string, input: SaveAttemptInput): AttemptRecord {
  const summary = summarizeAnswers(input.answers);
  return {
    id: input.id,
    profileId,
    sectionId: input.sectionId,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    ...summary,
  };
}

function makeUser(nickname: string, avatarColor: string, isGuest: boolean): LocalProfile {
  return {
    id: `${isGuest ? 'guest' : 'user'}-${crypto.randomUUID()}`,
    nickname,
    avatarColor,
    createdAt: new Date().toISOString(),
    isGuest,
    isDemo: false,
  };
}

function freshDb(): Db {
  return {
    version: 1,
    profiles: demoStudents().map((demo) => ({
      id: demo.id,
      nickname: demo.nickname,
      avatarColor: demo.avatarColor,
      createdAt: DEMO_CREATED,
      isGuest: false,
      isDemo: true,
      demo: {
        points: demo.points,
        timeSpentSeconds: demo.timeSpentSeconds,
        solved: demo.solved,
      },
    })),
    sessionId: null,
    favorites: {},
    attempts: [],
    legacyFavoritesMigrated: false,
  };
}

function readStringList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function memoryStorage(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}
