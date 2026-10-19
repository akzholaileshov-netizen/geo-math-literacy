import { useState } from 'react';
import { AVATAR_COLORS } from '../data/store/palette';
import { isStoreError } from '../data/store/types';
import { useStore } from '../hooks/StoreContext';
import { useI18n } from '../i18n/LanguageContext';
import { buttonClass } from './ui/Button';
import { ColorPicker } from './ColorPicker';

export function ClaimForm() {
  const { claimGuest } = useStore();
  const { m } = useI18n();
  const [nickname, setNickname] = useState('');
  const [color, setColor] = useState<string>(AVATAR_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="surface rounded-3xl border-brass/40 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        void claimGuest(nickname, color).catch((reason: unknown) => {
          if (isStoreError(reason) && reason.code === 'nickname_taken') setError(m('nicknameTaken'));
          else if (isStoreError(reason) && reason.code === 'invalid_nickname') setError(m('invalidNickname'));
          else setError(m('authFailed'));
        });
      }}
    >
      <h2 className="font-serif text-2xl">{m('claim')}</h2>
      <p className="mt-1 text-sm text-muted">{m('claimLead')}</p>
      <label className="mt-4 block text-sm text-muted" htmlFor="claim-name">
        {m('nickname')}
      </label>
      <input
        id="claim-name"
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        className="mt-1 min-h-11 w-full rounded-2xl border border-line bg-bg/80 px-3 text-ink"
        autoComplete="nickname"
      />
      <div className="mt-3">
        <ColorPicker value={color} onChange={setColor} label={m('avatarColor')} />
      </div>
      {error ? (
        <p className="mt-3 text-sm text-bad" role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className={buttonClass('primary', 'mt-4')}>
        {m('claim')}
      </button>
    </form>
  );
}
