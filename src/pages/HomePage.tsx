import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const { session, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={session ? '/library' : '/login'} replace />;
}
