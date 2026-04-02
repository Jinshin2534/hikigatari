import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <Link to="/library" className="text-lg font-bold text-violet-700 tracking-tight">
        弾き語りシート
      </Link>
      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="hidden text-sm text-gray-500 sm:block">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              ログアウト
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
