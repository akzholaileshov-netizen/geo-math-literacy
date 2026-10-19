import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createDataStore } from '../data/store';
import type { AttemptRecord, DataStore, Profile, SaveAttemptInput } from '../data/store/types';
import { STORAGE } from '../lib/storage';

type StoreValue = {
  store: DataStore;
  ready: boolean;
  profile: Profile | null;
  favorites: string[];
  revision: number;
  registerNickname: (nickname: string, avatarColor: string) => Promise<void>;
  signInNickname: (nickname: string) => Promise<void>;
  updateProfile: (nickname: string, avatarColor: string) => Promise<void>;
  claimGuest: (nickname: string, avatarColor: string) => Promise<void>;
  signOut: () => Promise<void>;
  toggleFavorite: (questionId: string) => Promise<void>;
  removeFavorite: (questionId: string) => Promise<void>;
  persistQuiz: (input: SaveAttemptInput) => Promise<AttemptRecord | null>;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const store = useMemo(() => createDataStore(), []);
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [revision, setRevision] = useState(0);
  const profileRef = useRef<Profile | null>(null);

  const applyProfile = useCallback((next: Profile | null) => {
    profileRef.current = next;
    setProfile(next);
  }, []);

  const finishAuth = useCallback(
    async (next: Profile | null) => {
      applyProfile(next);
      if (next) setFavorites(await store.listFavorites());
      else setFavorites(readStringList(localStorage.getItem(STORAGE.favorites)));
      setRevision((value) => value + 1);
    },
    [applyProfile, store],
  );

  useEffect(() => {
    let cancel = false;
    void (async () => {
      try {
        const session = await store.getSession();
        if (cancel) return;
        await finishAuth(session);
      } catch {
        if (!cancel) applyProfile(null);
      }
      if (!cancel) setReady(true);
    })();
    const stop = store.onAuthChange((next) => {
      void finishAuth(next).catch(() => applyProfile(null));
    });
    return () => {
      cancel = true;
      stop();
    };
  }, [applyProfile, finishAuth, store]);

  const persistQuiz = useCallback(
    async (input: SaveAttemptInput) => {
      if (!profileRef.current) {
        const guest = await store.ensureGuest();
        applyProfile(guest);
      }
      const record = await store.saveAttempt(input);
      setFavorites(await store.listFavorites());
      setRevision((value) => value + 1);
      return record;
    },
    [applyProfile, store],
  );

  const toggleFavorite = useCallback(
    async (questionId: string) => {
      if (!profileRef.current) {
        const guest = await store.ensureGuest();
        applyProfile(guest);
      }
      const current = await store.listFavorites();
      const saved = !current.includes(questionId);
      setFavorites(await store.setFavorite(questionId, saved));
      setRevision((value) => value + 1);
    },
    [applyProfile, store],
  );

  const removeFavorite = useCallback(
    async (questionId: string) => {
      if (!profileRef.current) {
        const next = favorites.filter((id) => id !== questionId);
        localStorage.setItem(STORAGE.favorites, JSON.stringify(next));
        setFavorites(next);
        return;
      }
      setFavorites(await store.setFavorite(questionId, false));
      setRevision((value) => value + 1);
    },
    [favorites, store],
  );

  const value = useMemo<StoreValue>(
    () => ({
      store,
      ready,
      profile,
      favorites,
      revision,
      registerNickname: async (nickname, avatarColor) => {
        await finishAuth(await store.registerNickname(nickname, avatarColor));
      },
      signInNickname: async (nickname) => {
        await finishAuth(await store.signInNickname(nickname));
      },
      updateProfile: async (nickname, avatarColor) => {
        await finishAuth(await store.updateProfile(nickname, avatarColor));
      },
      claimGuest: async (nickname, avatarColor) => {
        await finishAuth(await store.claimGuest(nickname, avatarColor));
      },
      signOut: async () => {
        await store.signOut();
        await finishAuth(null);
      },
      toggleFavorite,
      removeFavorite,
      persistQuiz,
    }),
    [finishAuth, persistQuiz, profile, ready, favorites, revision, removeFavorite, store, toggleFavorite],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error('useStore must be used within StoreProvider');
  return value;
}

export function profileLabel(profile: Profile, guestLabel: string): string {
  if (profile.isGuest || profile.nickname.trim().length === 0) return guestLabel;
  return profile.nickname;
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
