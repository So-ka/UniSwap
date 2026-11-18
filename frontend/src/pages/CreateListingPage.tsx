import { useAuth } from '../auth/AuthContext';

export function CreateListingPage() {
  const { user } = useAuth();

  return (
    <main className="protected-page">
      <section className="protected-card">
        <div className="protected-icon protected-icon-pencil" aria-hidden="true">
          <svg viewBox="0 0 32 32" focusable="false">
            <path d="M6 23.5 5 27l3.5-1 12-12-2.5-2.5-12 12Z" />
            <path d="m20 9.5 2-2a2 2 0 0 1 2.8 0l.7.7a2 2 0 0 1 0 2.8l-2 2" />
            <path className="pencil-break" d="m14.5 15 3 3m-5-1 3 3" />
          </svg>
        </div>
        <span className="eyebrow">Page under construction</span>
        <h1>Create a listing</h1>
        <p>
          You’re signed in as <strong>{user?.email}</strong>. Only authenticated
          students can open this page.
        </p>
        <div className="sprint-note">
          <strong>We’re still sharpening the pencil</strong>
          <p>
            The listing editor is under construction. Please check back soon.
          </p>
        </div>
      </section>
    </main>
  );
}
