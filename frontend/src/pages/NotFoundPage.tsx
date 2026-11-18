import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="route-state">
      <span className="eyebrow">404</span>
      <h1>That page isn’t here.</h1>
      <p>The item may have moved, but the home page is still available.</p>
      <Link className="button" to="/">Return home</Link>
    </main>
  );
}
