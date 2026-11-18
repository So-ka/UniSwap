import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError('');
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/');
    } catch (error) {
      setLogoutError(
        error instanceof Error ? error.message : 'Could not log out. Try again.',
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <nav className="nav-wrap" aria-label="Main navigation">
          <Link className="brand" to="/" aria-label="UniSwap home">
            <span className="brand-mark" aria-hidden="true">
              <span>U</span>
            </span>
            <span>UniSwap</span>
          </Link>

          <div className="nav-actions">
            <NavLink className="nav-link" to="/listings/new">
              Create listing
            </NavLink>
            {!isLoading &&
              (user ? (
                <>
                  <span className="user-chip" title={user.email}>
                    {user.name}
                  </span>
                  <button
                    className="button button-small button-ghost"
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? 'Logging out…' : 'Log out'}
                  </button>
                </>
              ) : (
                <>
                  <NavLink className="nav-link" to="/login">
                    Log in
                  </NavLink>
                  <NavLink className="button button-small" to="/register">
                    Join UniSwap
                  </NavLink>
                </>
              ))}
          </div>
        </nav>
        {logoutError && (
          <p className="header-error" role="alert">
            {logoutError}
          </p>
        )}
      </header>

      <Outlet />

      <footer className="site-footer">
        <div>
          <strong>UniSwap</strong>
          <p>Useful items stay in the student community.</p>
        </div>
        <span>Sprint 1 · Account foundation</span>
      </footer>
    </div>
  );
}
