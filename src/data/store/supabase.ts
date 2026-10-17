import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { summarizeAnswers } from '../../services/attemptStats';
import { buildProgress } from '../../services/progress';
import { rankRows, type RankInput } from '../../services/ranking';
import { avatarColorOrDefault } from './palette';
import { assertNickname } from './nickname';
import type { AttemptRecord, DataStore, Profile, ScoredAnswer } from './types';
import { StoreError } from './types';

type AttemptRow = {
  id: string;
  profile_id: string;
  section_id: string;
  started_at: string;
  finished_at: string;
  correct: number;
  total: number;
  percent: number;
  points: number;
  time_spent_seconds: number;
  attempt_answers?: AnswerRow[] | null;
};

type AnswerRow = {
  question_id: string;
  selected_index: number | null;
  timed_out: boolean;
  seconds_left: number;
  points: number;
  position: number;
};

type ProfileRow = {
  id: string;
  nickname: string;
  avatar_color: string;
  created_at: string;
};

type BoardRow = {
  profile_id: string;
  nickname: string;
  avatar_color: string;
  points: number;
  time_spent_seconds: number;
  solved: number;
};

export function createSupabaseStore(url: string, anonKey: string): DataStore {
  const supabase = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  const requireUser = async () => {
    const session = await currentSession(supabase);
    if (!session?.user) throw new StoreError('not_signed_in');
    return session.user;
  };

  const profileFromSession = async (session: Session | null): Promise<Profile | null> => {
    if (!session?.user) return null;
    const row = await ensureProfileRow(supabase, session, null, null);
    return toProfile(row, session.user.email ?? null);
  };

  return {
    mode: 'supabase',

    async getSession() {
      return profileFromSession(await currentSession(supabase));
    },

    async registerNickname() {
      throw new StoreError('email_required');
    },

    async signInNickname() {
      throw new StoreError('email_required');
    },

    async registerEmail(email, password, nickname, avatarColor) {
      const name = assertNickname(nickname);
      const color = avatarColorOrDefault(avatarColor);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { nickname: name, avatar_color: color } },
      });
      if (error || !data.user) throw new StoreError('auth_failed');
      if (!data.session) return { profile: null, needsConfirmation: true };
      const row = await ensureProfileRow(supabase, data.session, name, color);
      return { profile: toProfile(row, data.user.email ?? null), needsConfirmation: false };
    },

    async signInEmail(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error || !data.session) throw new StoreError('auth_failed');
      const row = await ensureProfileRow(supabase, data.session, null, null);
      return toProfile(row, data.user.email ?? null);
    },

    async sendMagicLink(email) {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw new StoreError('auth_failed');
    },

    async updateProfile(nickname, avatarColor) {
      const user = await requireUser();
      const name = assertNickname(nickname);
      const color = avatarColorOrDefault(avatarColor);
      const { data, error } = await supabase
        .from('profiles')
        .update({ nickname: name, avatar_color: color })
        .eq('id', user.id)
        .select('id, nickname, avatar_color, created_at')
        .single();
      if (error || !data) throw new StoreError('auth_failed');
      return toProfile(data as ProfileRow, user.email ?? null);
    },

    async signOut() {
      const { error } = await supabase.auth.signOut();
      if (error) throw new StoreError('auth_failed');
    },

    async claimGuest() {
      throw new StoreError('email_required');
    },

    async ensureGuest() {
      throw new StoreError('not_signed_in');
    },

    async listFavorites() {
      const user = await requireUser();
      const { data, error } = await supabase
        .from('favorites')
        .select('question_id')
        .eq('profile_id', user.id);
      if (error) throw new StoreError('auth_failed');
      return (data ?? []).map((row) => String(row.question_id));
    },

    async setFavorite(questionId, saved) {
      const user = await requireUser();
      if (saved) {
        const { error } = await supabase
          .from('favorites')
          .upsert({ profile_id: user.id, question_id: questionId }, { onConflict: 'profile_id,question_id' });
        if (error) throw new StoreError('auth_failed');
      } else {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('profile_id', user.id)
          .eq('question_id', questionId);
        if (error) throw new StoreError('auth_failed');
      }
      return this.listFavorites();
    },

    async saveAttempt(input) {
      const user = await requireUser();
      const existing = await this.listAttempts();
      const already = existing.find((item) => item.id === input.id);
      if (already) return already;
      const summary = summarizeAnswers(input.answers);
      const { error } = await supabase.from('attempts').insert({
        id: input.id,
        profile_id: user.id,
        section_id: input.sectionId,
        started_at: input.startedAt,
        finished_at: input.finishedAt,
        correct: summary.correct,
        total: summary.total,
        percent: summary.percent,
        points: summary.points,
        time_spent_seconds: summary.timeSpentSeconds,
      });
      if (error && error.code !== '23505') throw new StoreError('auth_failed');
      if (!error) {
        const { error: answerError } = await supabase.from('attempt_answers').insert(
          summary.answers.map((answer, position) => ({
            attempt_id: input.id,
            question_id: answer.questionId,
            selected_index: answer.selectedIndex,
            timed_out: answer.timedOut,
            seconds_left: answer.secondsLeft,
            points: answer.points,
            position,
          })),
        );
        if (answerError) throw new StoreError('auth_failed');
      }
      const saved = (await this.listAttempts()).find((item) => item.id === input.id);
      if (!saved) throw new StoreError('auth_failed');
      return saved;
    },

    async listAttempts() {
      const user = await requireUser();
      const { data, error } = await supabase
        .from('attempts')
        .select('*, attempt_answers(*)')
        .eq('profile_id', user.id)
        .order('finished_at', { ascending: false });
      if (error) throw new StoreError('auth_failed');
      return ((data ?? []) as AttemptRow[]).map(mapAttempt);
    },

    async sectionProgress() {
      const attempts = await this.listAttempts();
      return buildProgress(attempts).sections;
    },

    async dashboardStats() {
      const attempts = await this.listAttempts();
      return buildProgress(attempts).stats;
    },

    async leaderboard(limit, sort) {
      const session = await currentSession(supabase);
      const { data, error } = await supabase.rpc('leaderboard_rows');
      if (error) throw new StoreError('auth_failed');
      const rows: RankInput[] = ((data ?? []) as BoardRow[]).map((row) => ({
        profileId: row.profile_id,
        nickname: row.nickname,
        avatarColor: row.avatar_color,
        points: row.points,
        timeSpentSeconds: row.time_spent_seconds,
        solved: row.solved,
        isGuest: false,
        isDemo: false,
      }));
      const ranked = rankRows(rows, sort);
      const me = ranked.find((row) => row.profileId === session?.user.id) ?? null;
      const size = limit === 50 ? 50 : 10;
      return { rows: ranked.slice(0, size), me };
    },

    onAuthChange(listener) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        void profileFromSession(session).then(listener);
      });
      return () => data.subscription.unsubscribe();
    },
  };
}

async function currentSession(supabase: SupabaseClient): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new StoreError('auth_failed');
  return data.session;
}

async function ensureProfileRow(
  supabase: SupabaseClient,
  session: Session,
  nickname: string | null,
  avatarColor: string | null,
): Promise<ProfileRow> {
  const user = session.user;
  const { data } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_color, created_at')
    .eq('id', user.id)
    .maybeSingle();
  if (data && !nickname) return data as ProfileRow;
  const meta = user.user_metadata ?? {};
  const name =
    nickname ??
    (typeof meta.nickname === 'string' && meta.nickname.trim() ? meta.nickname : emailPrefix(user.email));
  const color = avatarColorOrDefault(
    avatarColor ?? (typeof meta.avatar_color === 'string' ? meta.avatar_color : undefined),
  );
  const { data: saved, error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, nickname: name, avatar_color: color },
      { onConflict: 'id' },
    )
    .select('id, nickname, avatar_color, created_at')
    .single();
  if (error || !saved) throw new StoreError('auth_failed');
  return saved as ProfileRow;
}

function toProfile(row: ProfileRow, email: string | null): Profile {
  return {
    id: row.id,
    nickname: row.nickname,
    avatarColor: row.avatar_color,
    createdAt: row.created_at,
    isGuest: false,
    email,
  };
}

function mapAttempt(row: AttemptRow): AttemptRecord {
  const answers = [...(row.attempt_answers ?? [])]
    .sort((a, b) => a.position - b.position)
    .map(
      (answer): ScoredAnswer => ({
        questionId: answer.question_id,
        selectedIndex: answer.selected_index,
        timedOut: answer.timed_out,
        secondsLeft: answer.seconds_left,
        points: answer.points,
      }),
    );
  return {
    id: row.id,
    profileId: row.profile_id,
    sectionId: row.section_id,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    correct: row.correct,
    total: row.total,
    percent: row.percent,
    points: row.points,
    timeSpentSeconds: row.time_spent_seconds,
    answers,
  };
}

function emailPrefix(email: string | undefined): string {
  const prefix = email?.split('@')[0]?.trim();
  if (prefix && prefix.length >= 2) return prefix.slice(0, 24);
  return 'Student';
}
