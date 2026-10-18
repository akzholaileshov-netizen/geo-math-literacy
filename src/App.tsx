import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { Layout } from './components/Layout';
import { StoreProvider } from './hooks/StoreContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { HomePage } from './pages/HomePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { QuizPage } from './pages/QuizPage';
import { ResultsPage } from './pages/ResultsPage';
import { SubsectionPage } from './pages/SubsectionPage';
import { ThemeProvider } from './theme/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <StoreProvider>
          <AppErrorBoundary>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/section/:sectionId/:subsectionId" element={<SubsectionPage />} />
                  <Route path="/quiz/:sectionId" element={<QuizPage />} />
                  <Route path="/results/:sectionId" element={<ResultsPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </AppErrorBoundary>
        </StoreProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
