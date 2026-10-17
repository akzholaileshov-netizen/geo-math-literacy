import { describe, expect, it } from 'vitest';
import { messages } from './messages';

describe('messages', () => {
  it('has the same keys in Kazakh and Russian', () => {
    expect(Object.keys(messages.kk).sort()).toEqual(Object.keys(messages.ru).sort());
  });
});
