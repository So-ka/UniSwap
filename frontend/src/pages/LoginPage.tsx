import { useState, type FormEvent } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination =
    (location.state as LoginLocationState | null)?.from ?? '/listings/new';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });
      navigate(destination, { replace: true });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Login could not be completed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page auth-page-login">
      <section className="auth-intro">
        <span className="eyebrow">Welcome back</span>
        <h1>Your campus exchange starts here.</h1>
        <p>Log in to access the protected create-listing area.</p>
      </section>

      <section className="form-card" aria-labelledby="login-title">
        <span className="form-kicker">Your account</span>
        <h2 id="login-title">Log in</h2>
        <p className="form-subtitle">Enter the credentials you registered with.</p>

        {error && <div className="alert" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email">University email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="name@university.edu"
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="Your password"
          />

          <button className="button button-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="form-switch">
          New to UniSwap? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
