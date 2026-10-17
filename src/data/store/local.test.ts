import { describe, expect, it } from 'vitest';
import { questionsBySection } from '../catalog';
import { STORAGE } from '../../lib/storage';
import { createLocalStore, memoryStorage } from './local';
import { demoStudents } from './seed';
import { isStoreError } from './types';

describe('local store', () => {
  it('seeds thirty demo students and ranks the leader by points', async () => {
    const store = createLocalStore(memoryStorage());
    const board = await store.leaderboard(50, 'points');
    expect(demoStudents()).toHaveLength(30);
    expect(board.rows).toHaveLength(30);
    expect(board.rows[0]?.nickname).toBe('Айгерім');
    expect(board.rows[0]?.points).toBeGreaterThan(board.rows[1]?.points ?? 0);
    expect(board.me).toBeNull();
  });

  it('migrates legacy favorites into the new profile once', async () => {
    const storage = memoryStorage();
    storage.setItem(STORAGE.favorites, JSON.stringify(['num-01', 'num-02', 'num-01']));
    const store = createLocalStore(storage);
    const profile = await store.registerNickname('Айша', '#1f6b45');
    expect(profile.nickname).toBe('Айша');
    expect(await store.listFavorites()).toEqual(['num-01', 'num-02']);
    expect(storage.getItem(STORAGE.favorites)).toBeNull();
    await store.setFavorite('num-01', false);
    expect(await store.listFavorites()).toEqual(['num-02']);
  });

  it('rejects a taken or unknown nickname', async () => {
    const store = createLocalStore(memoryStorage());
    await expect(store.registerNickname('Айгерім', '#8d6a2e')).rejects.toMatchObject({ code: 'nickname_taken' });
    await expect(store.signInNickname('ЖоқАт')).rejects.toMatchObject({ code: 'nickname_unknown' });
    await expect(store.registerNickname('?', '#8d6a2e')).rejects.toMatchObject({ code: 'invalid_nickname' });
  });

  it('saves an attempt once, updates progress, and ranks the student', async () => {
    const store = createLocalStore(memoryStorage());
    await store.registerNickname('Тест', '#3d4f7c');
    const answers = questionsBySection.numbers.map((question) => ({
      questionId: question.id,
      selectedIndex: question.correctIndex,
      timedOut: false,
      secondsLeft: 300,
    }));
    const input = {
      id: 'attempt-1',
      sectionId: 'numbers',
      startedAt: '2026-10-17T00:00:00.000Z',
      finishedAt: '2026-10-17T00:10:00.000Z',
      answers,
    };
    const saved = await store.saveAttempt(input);
    const again = await store.saveAttempt(input);
    expect(again).toEqual(saved);
    expect(saved.points).toBe(600);
    expect(saved.correct).toBe(30);
    expect(saved.percent).toBe(100);
    expect(await store.listAttempts()).toHaveLength(1);

    const stats = await store.dashboardStats();
    expect(stats.testsTaken).toBe(1);
    expect(stats.totalPoints).toBe(600);
    expect(stats.bestSectionId).toBe('numbers');
    expect(stats.solved).toBe(30);

    const progress = await store.sectionProgress();
    expect(progress).toHaveLength(7);
    expect(progress.find((row) => row.sectionId === 'numbers')?.attempts).toBe(1);
    expect(progress.find((row) => row.sectionId === 'word')?.attempts).toBe(0);

    const better = demoStudents().filter((demo) => demo.points > 600).length;
    const board = await store.leaderboard(10, 'points');
    expect(board.me?.rank).toBe(better + 1);
    expect(board.me?.points).toBe(600);
    expect(board.rows.some((row) => row.profileId === board.me?.profileId)).toBe(false);

    const bySolved = await store.leaderboard(10, 'solved');
    expect(bySolved.rows[0]?.nickname).toBe('Айгерім');
  });

  it('lets a guest claim a nickname and keep the saved attempt', async () => {
    const store = createLocalStore(memoryStorage());
    const guest = await store.ensureGuest();
    expect(guest.isGuest).toBe(true);
    await store.saveAttempt({
      id: 'attempt-guest',
      sectionId: 'logic',
      startedAt: '2026-10-17T01:00:00.000Z',
      finishedAt: '2026-10-17T01:05:00.000Z',
      answers: [
        { questionId: 'num-01', selectedIndex: 1, timedOut: false, secondsLeft: 270 },
      ],
    });
    const claimed = await store.claimGuest('Мөлдір', '#8e342c');
    expect(claimed.isGuest).toBe(false);
    expect(claimed.id).toBe(guest.id);
    expect((await store.listAttempts())[0]?.points).toBe(19);
    await store.signOut();
    expect(await store.getSession()).toBeNull();
    const back = await store.signInNickname('Мөлдір');
    expect(back.id).toBe(guest.id);
    expect(await store.dashboardStats()).toMatchObject({ testsTaken: 1, totalPoints: 19 });
  });

  it('reports store errors with a code', async () => {
    const store = createLocalStore(memoryStorage());
    try {
      await store.saveAttempt({
        id: 'x',
        sectionId: 'numbers',
        startedAt: '2026-10-17T00:00:00.000Z',
        finishedAt: '2026-10-17T00:00:00.000Z',
        answers: [],
      });
      expect.fail('expected not_signed_in');
    } catch (error) {
      expect(isStoreError(error) && error.code).toBe('not_signed_in');
    }
  });
});
