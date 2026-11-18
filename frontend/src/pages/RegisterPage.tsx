import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const universityDomain = (
  import.meta.env.VITE_UNIVERSITY_EMAIL_DOMAIN ?? 'unibz.it'
)
  .replace(/^@/, '')
  .toLowerCase();

export function RegisterPage() {
  const { user, isLoading, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to="/listings/new" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith(`@${universityDomain}`)) {
      setError(`Use a university email ending in @${universityDomain}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({ name: name.trim(), email: normalizedEmail, password });
      navigate('/listings/new', { replace: true });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Registration could not be completed.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <span className="eyebrow">Student community</span>
        <h1>Give good things a new semester.</h1>
        <p>
          Create your campus account, then you’ll be ready to pass on the items
          you no longer need.
        </p>
        <ul className="benefit-list">
          <li><span>✓</span> Verified university community</li>
          <li><span>✓</span> No payments or delivery required</li>
          <li><span>✓</span> Built for phones and laptops</li>
        </ul>
      </section>

      <section className="form-card" aria-labelledby="register-title">
        <span className="form-kicker">Create account</span>
        <h2 id="register-title">Join UniSwap</h2>
        <p className="form-subtitle">Use your university details to get started.</p>

        {error && <div className="alert" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
            placeholder="Your full name"
          />

          <label htmlFor="register-email">University email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            maxLength={254}
            required
            placeholder={`name@${universityDomain}`}
            aria-describedby="email-hint"
          />
          <small id="email-hint" className="field-hint">
            Only @{universityDomain} addresses can register.
          </small>

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={72}
            required
            placeholder="At least 8 characters"
          />

          <button className="button button-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="form-switch">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
