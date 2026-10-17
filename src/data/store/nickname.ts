import { StoreError } from './types';

export function normalizeNickname(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function assertNickname(raw: string): string {
  const nickname = normalizeNickname(raw);
  if (!/^[\p{L}\p{N}][\p{L}\p{N} .'_-]{1,23}$/u.test(nickname)) {
    throw new StoreError('invalid_nickname');
  }
  return nickname;
}

export function sameNickname(a: string, b: string): boolean {
  return a.toLocaleLowerCase() === b.toLocaleLowerCase();
}
