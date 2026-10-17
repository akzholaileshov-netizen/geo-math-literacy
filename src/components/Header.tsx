import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { profileLabel, useStore } from '../hooks/StoreContext';
import { useI18n } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

export function Header() {
  const { lang, setLang, m } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { profile, ready, signOut } = useStore();
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1.5 text-sm transition ${
      isActive ? 'bg-brass/15 text-ink' : 'text-muted hover:text-ink'
    }`;

  const links = [
    { to: '/', label: m('home'), end: true },
    { to: '/dashboard', label: m('dashboard'), end: false },
    { to: '/leaderboard', label: m('leaderboard'), end: false },
    { to: '/favorites', label: m('favorites'), end: false },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link to="/" className="min-w-0 flex-1" onClick={() => setOpen(false)}>
          <div className="truncate font-serif text-xl leading-none text-ink sm:text-2xl">{m('brand')}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-brass">{m('eyebrow')}</div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="main">
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
            className="hidden rounded-full border border-line px-3 py-1.5 text-sm text-ink hover:border-brass lg:inline"
          >
            {m('signOut')}
          </button>
        ) : ready ? (
          <NavLink to="/auth" className="hidden rounded-full border border-line px-3 py-1.5 text-sm lg:inline">
            {m('signIn')}
          </NavLink>
        ) : null}

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-line px-3 py-1.5 text-sm text-ink transition hover:border-brass"
          aria-label={theme === 'dark' ? m('themeToLight') : m('themeToDark')}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <div className="flex rounded-full border border-line p-0.5" role="group" aria-label={m('langLabel')}>
          <button
            type="button"
            onClick={() => setLang('kk')}
            className={`rounded-full px-2.5 py-1 text-sm ${lang === 'kk' ? 'bg-brass text-bg' : 'text-muted'}`}
            aria-pressed={lang === 'kk'}
          >
            Қаз
          </button>
          <button
            type="button"
            onClick={() => setLang('ru')}
            className={`rounded-full px-2.5 py-1 text-sm ${lang === 'ru' ? 'bg-brass text-bg' : 'text-muted'}`}
            aria-pressed={lang === 'ru'}
          >
            Рус
          </button>
        </div>

        <button
          type="button"
          className="rounded-full border border-line px-3 py-1.5 text-sm lg:hidden"
          aria-expanded={open}
          aria-label={open ? m('close') : m('menu')}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-line px-4 py-3 lg:hidden" aria-label="mobile">
          <div className="mx-auto flex max-w-5xl flex-col gap-2">
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
                  className="rounded-full px-3 py-1.5 text-left text-sm text-muted"
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
