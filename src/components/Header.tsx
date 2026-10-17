import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useI18n } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

export function Header() {
  const { lang, setLang, m } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1.5 text-sm transition ${
      isActive ? 'bg-brass/15 text-ink' : 'text-muted hover:text-ink'
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link to="/" className="min-w-0 flex-1" onClick={() => setOpen(false)}>
          <div className="truncate font-serif text-xl leading-none text-ink sm:text-2xl">{m('brand')}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-brass">{m('eyebrow')}</div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="main">
          <NavLink to="/" end className={navClass}>
            {m('home')}
          </NavLink>
          <NavLink to="/favorites" className={navClass}>
            {m('favorites')}
          </NavLink>
        </nav>

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
          className="rounded-full border border-line px-3 py-1.5 text-sm md:hidden"
          aria-expanded={open}
          aria-label={open ? m('close') : m('menu')}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open ? (
        <nav className="border-t border-line px-4 py-3 md:hidden" aria-label="mobile">
          <div className="mx-auto flex max-w-5xl flex-col gap-2">
            <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}>
              {m('home')}
            </NavLink>
            <NavLink to="/favorites" className={navClass} onClick={() => setOpen(false)}>
              {m('favorites')}
            </NavLink>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
