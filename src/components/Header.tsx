import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { MoonIcon, SunIcon } from './ui/icons';
import { profileLabel, useStore } from '../hooks/StoreContext';
import { useI18n } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

export function Header() {
  const { lang, setLang, m } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { profile, ready, signOut } = useStore();
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-11 items-center rounded-full px-3 text-sm transition ${
      isActive ? 'bg-brass/15 text-ink shadow-glow' : 'text-muted hover:text-ink'
    }`;

  const links = [
    { to: '/', label: m('home'), end: true },
    { to: '/dashboard', label: m('dashboard'), end: false },
    { to: '/leaderboard', label: m('leaderboard'), end: false },
    { to: '/favorites', label: m('favorites'), end: false },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-elev/80 shadow-card backdrop-blur-xl">
      <div className="mx-auto max-w-5xl px-4 py-2 sm:px-6">
        <div className="flex items-center gap-2">
        <Link to="/" className="min-w-0 flex-1" onClick={() => setOpen(false)}>
          <div className="truncate font-serif text-lg leading-tight text-ink sm:text-2xl">{m('brand')}</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-brass">{m('eyebrow')}</div>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-elev/50 text-sm text-ink backdrop-blur-md transition hover:border-brass"
          aria-label={theme === 'dark' ? m('themeToLight') : m('themeToDark')}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="flex rounded-full border border-line bg-elev/50 p-0.5 backdrop-blur-md" role="group" aria-label={m('langLabel')}>
          <button
            type="button"
            onClick={() => setLang('kk')}
            className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm ${lang === 'kk' ? 'bg-brass text-onbrass shadow-glow' : 'text-muted'}`}
            aria-pressed={lang === 'kk'}
          >
            Қаз
          </button>
          <button
            type="button"
            onClick={() => setLang('ru')}
            className={`inline-flex min-h-11 items-center rounded-full px-3 text-sm ${lang === 'ru' ? 'bg-brass text-onbrass shadow-glow' : 'text-muted'}`}
            aria-pressed={lang === 'ru'}
          >
            Рус
          </button>
        </div>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line bg-elev/50 text-sm backdrop-blur-md xl:hidden"
          aria-expanded={open}
          aria-label={open ? m('close') : m('menu')}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '✕' : '☰'}
        </button>
        </div>
        </div>
        <div className="mt-1 hidden items-center justify-between gap-3 xl:flex">
          <nav className="flex items-center gap-1" aria-label="main">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>
          {ready && profile ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-elev/40 px-3 text-sm text-ink backdrop-blur-md hover:border-brass"
            >
              {m('signOut')}
            </button>
          ) : ready ? (
            <NavLink to="/auth" className="inline-flex min-h-11 items-center rounded-full border border-line bg-elev/40 px-3 text-sm backdrop-blur-md">
              {m('signIn')}
            </NavLink>
          ) : null}
        </div>
      </div>

      {open ? (
        <nav className="border-t border-line bg-elev/70 px-4 py-3 backdrop-blur-xl xl:hidden" aria-label="mobile">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 sm:px-2">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClass} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            {ready && profile ? (
              <>
                <p className="px-3 text-sm text-muted">{profileLabel(profile, m('guest'))}</p>
                <button
                  type="button"
                  className="inline-flex min-h-11 items-center rounded-full px-3 text-left text-sm text-muted"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                >
                  {m('signOut')}
                </button>
              </>
            ) : ready ? (
              <NavLink to="/auth" className={navClass} onClick={() => setOpen(false)}>
                {m('signIn')}
              </NavLink>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
