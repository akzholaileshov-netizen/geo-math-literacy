import { createLocalStore } from './local';
import type { DataStore } from './types';

export function createDataStore(): DataStore {
  if (typeof localStorage === 'undefined') {
    throw new Error('localStorage is unavailable');
  }
  return createLocalStore(localStorage);
}
