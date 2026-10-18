import { Outlet } from 'react-router-dom';
import { useStore } from '../hooks/StoreContext';
import { useI18n } from '../i18n/LanguageContext';
import { Header } from './Header';

export function Layout() {
  const { remoteNotice } = useStore();
  const { m } = useI18n();
  return (
    <div className="min-h-screen">
      <Header />
      {remoteNotice ? (
        <p role="status" className="border-b border-brass/40 bg-brass/10 px-4 py-2 text-center text-sm text-ink">
          {m('supabaseFallback')}
        </p>
      ) : null}
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
        <Outlet />
      </main>
    </div>
  );
}
