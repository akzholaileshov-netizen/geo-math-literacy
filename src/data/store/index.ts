import { createLocalStore } from './local';
import { createSupabaseStore } from './supabase';
import type { DataStore } from './types';

export function supabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key);
}

export function createDataStore(): DataStore {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (url && key) return createSupabaseStore(url, key);
  if (typeof localStorage === 'undefined') {
    throw new Error('localStorage is unavailable');
  }
  return createLocalStore(localStorage);
}
