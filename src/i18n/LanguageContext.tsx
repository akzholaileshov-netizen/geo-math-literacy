import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { messages } from './messages';
import { STORAGE } from '../lib/storage';
import type { Lang, Localized } from '../types';

type LanguageValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (copy: Localized) => string;
  m: (key: keyof typeof messages.kk) => string;
};

const LanguageContext = createContext<LanguageValue | null>(null);

function readLang(): Lang {
  try {
    return localStorage.getItem(STORAGE.lang) === 'ru' ? 'ru' : 'kk';
  } catch {
    return 'kk';
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE.lang, next);
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'kk' ? 'kk' : 'ru';
    document.title =
      lang === 'kk'
        ? 'Математикалық сауаттылық · ҰБТ'
        : 'Математическая грамотность · ЕНТ';
  }, [lang]);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      t: (copy) => copy[lang],
      m: (key) => messages[lang][key],
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useI18n must be used within LanguageProvider');
  return value;
}
