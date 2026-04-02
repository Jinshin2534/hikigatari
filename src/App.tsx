import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthState } from './hooks/useAuth';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { LibraryPage } from './pages/LibraryPage';
import { SongViewPage } from './pages/SongViewPage';
import { SongEditPage } from './pages/SongEditPage';
import { useAuth } from './hooks/useAuth';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">読み込み中...</div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthState();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/songs/new" element={<SongEditPage />} />
            <Route path="/songs/:id" element={<SongViewPage />} />
            <Route path="/songs/:id/edit" element={<SongEditPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
