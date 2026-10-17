import { AVATAR_COLORS } from './palette';

export type DemoSeed = {
  id: string;
  nickname: string;
  avatarColor: string;
  points: number;
  timeSpentSeconds: number;
  solved: number;
};

const NAMES = [
  'Айгерім',
  'Нұрлан',
  'Данияр',
  'Мария',
  'Ерлан',
  'Асель',
  'Тимур',
  'Камила',
  'Бекзат',
  'София',
  'Арман',
  'Диана',
  'Санжар',
  'Аружан',
  'Илья',
  'Мадина',
  'Руслан',
  'Айсулу',
  'Дамир',
  'Виктория',
  'Ерасыл',
  'Амина',
  'Бауыржан',
  'Ксения',
  'Нұрсұлтан',
  'Алина',
  'Мерей',
  'Сабина',
  'Олжас',
  'Дария',
] as const;

/** Thirty offline classmates so the leaderboard is useful before anyone else signs in. */
export function demoStudents(): DemoSeed[] {
  return NAMES.map((nickname, index) => ({
    id: `demo-${String(index + 1).padStart(2, '0')}`,
    nickname,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    points: 1920 - index * 58,
    solved: 140 - index * 4,
    timeSpentSeconds: 18000 - index * 420,
  }));
}
