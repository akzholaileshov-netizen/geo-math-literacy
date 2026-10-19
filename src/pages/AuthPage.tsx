import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClaimForm } from '../components/ClaimForm';
import { ColorPicker } from '../components/ColorPicker';
import { AVATAR_COLORS } from '../data/store/palette';
import { isStoreError, type StoreErrorCode } from '../data/store/types';
import { profileLabel, useStore } from '../hooks/StoreContext';
import { useI18n } from '../i18n/LanguageContext';
import { messages } from '../i18n/messages';

export function AuthPage() {
  const { m } = useI18n();
  const store = useStore();
  const [nickname, setNickname] = useState('');
  const [color, setColor] = useState<string>(AVATAR_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (store.profile && !store.profile.isGuest) setColor(store.profile.avatarColor);
  }, [store.profile]);

  const fail = (reason: unknown) => {
    setError(messageFor(reason, m));
  };

  if (!store.ready) return null;

  if (store.profile?.isGuest) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-serif text-4xl">{m('authTitle')}</h1>
        <ClaimForm />
        <button
          type="button"
          onClick={() => void store.signOut()}
          className="rounded-full border border-line px-4 py-2 text-sm hover:border-brass"
        >
          {m('signOut')}
        </button>
      </div>
    );
  }

  if (store.profile) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-serif text-4xl">{m('authTitle')}</h1>
        <p className="text-muted">
          {m('signedInAs')}: {profileLabel(store.profile, m('guest'))}
        </p>
        <form
          className="space-y-3 rounded-2xl border border-line bg-elev p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            void store.updateProfile(nickname || store.profile?.nickname || '', color).catch(fail);
          }}
        >
          <label className="block text-sm text-muted" htmlFor="edit-name">
            {m('nickname')}
          </label>
          <input
            id="edit-name"
            value={nickname}
            placeholder={store.profile.nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-3 py-2"
          />
          <ColorPicker value={color} onChange={setColor} label={m('avatarColor')} />
          {error ? (
            <p className="text-sm text-bad" role="alert">
              {error}
            </p>
          ) : null}
          <button type="submit" className="rounded-full bg-brass px-5 py-2 text-sm font-semibold text-bg">
            {m('saveNickname')}
          </button>
        </form>
        <div className="flex gap-3">
          <Link to="/dashboard" className="rounded-full border border-line px-4 py-2 text-sm hover:border-brass">
            {m('dashboard')}
          </Link>
          <button
            type="button"
            onClick={() => void store.signOut()}
            className="rounded-full border border-line px-4 py-2 text-sm hover:border-brass"
          >
            {m('signOut')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <header>
        <h1 className="font-serif text-4xl sm:text-5xl">{m('authTitle')}</h1>
        <p className="mt-2 text-muted">{m('authLeadLocal')}</p>
      </header>
      <form
        className="space-y-4 rounded-2xl border border-line bg-elev p-5 shadow-card"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="block text-sm text-muted" htmlFor="nick">
          {m('nickname')}
          <input
            id="nick"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-ink"
            autoComplete="nickname"
          />
        </label>
        <p className="text-xs text-muted">{m('nicknameHint')}</p>
        <ColorPicker value={color} onChange={setColor} label={m('avatarColor')} />
        {error ? (
          <p className="text-sm text-bad" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className="rounded-full bg-brass px-5 py-2 text-sm font-semibold text-bg"
            onClick={() => {
              setError(null);
              void store.registerNickname(nickname, color).catch(fail);
            }}
          >
            {m('register')}
          </button>
          <button
            type="button"
            className="rounded-full border border-line px-5 py-2 text-sm hover:border-brass"
            onClick={() => {
              setError(null);
              void store.signInNickname(nickname).catch(fail);
            }}
          >
            {m('signIn')}
          </button>
        </div>
      </form>
    </div>
  );
}

function messageFor(error: unknown, m: (key: keyof typeof messages.kk) => string): string {
  if (!isStoreError(error)) return m('authFailed');
  const code: StoreErrorCode = error.code;
  if (code === 'nickname_taken') return m('nicknameTaken');
  if (code === 'nickname_unknown') return m('nicknameUnknown');
  if (code === 'invalid_nickname') return m('invalidNickname');
  return m('authFailed');
}
