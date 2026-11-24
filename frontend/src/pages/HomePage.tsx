import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ListingBrowser } from '../components/ListingBrowser';

export function HomePage() {
  const { user } = useAuth();

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Made for your campus</span>
          <h1>Pass it on.<br />Pick it up.</h1>
          <p className="hero-lead">
            A simple place for students to give useful study items a second
            life—without losing offers in busy group chats.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link className="button" to="/listings/new">
                Create a listing
              </Link>
            ) : (
              <Link className="button" to="/register">
                Join with university email
              </Link>
            )}
            <a className="text-link" href="#how-it-works">
              See how it works <span aria-hidden="true">↓</span>
            </a>
          </div>
          <p className="trust-line">
            <span aria-hidden="true">✓</span> Free to join · University students
            only
          </p>
        </div>

        <div className="hero-visual" aria-label="Example UniSwap items">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <article className="item-card item-card-main">
            <div className="item-icon" aria-hidden="true">📘</div>
            <span className="status-dot">Available</span>
            <h2>Statistics textbook</h2>
            <p>Good condition · Campus pickup</p>
            <span className="free-tag">Free</span>
          </article>
          <article className="mini-card mini-card-calculator">
            <span aria-hidden="true">🧮</span>
            <div><strong>Calculator</strong><small>Ready to swap</small></div>
          </article>
          <article className="mini-card mini-card-lamp">
            <span aria-hidden="true">💡</span>
            <div><strong>Desk lamp</strong><small>Free</small></div>
          </article>
        </div>
      </section>

      <ListingBrowser />

      <section className="how-section" id="how-it-works">
        <div className="section-heading">
          <span className="eyebrow">One shared place</span>
          <h2>A clearer way to reuse on campus</h2>
          <p>
            Sprint 1 puts the secure account foundation in place for the
            exchange features coming next.
          </p>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <span className="feature-number">01</span>
            <div className="feature-icon" aria-hidden="true">✉</div>
            <h3>Campus access</h3>
            <p>Join using your university email so offers stay within the community.</p>
          </article>
          <article className="feature-card">
            <span className="feature-number">02</span>
            <div className="feature-icon" aria-hidden="true">⌕</div>
            <h3>Easy to find</h3>
            <p>Listings will be searchable instead of disappearing in old messages.</p>
          </article>
          <article className="feature-card">
            <span className="feature-number">03</span>
            <div className="feature-icon" aria-hidden="true">↔</div>
            <h3>Give or exchange</h3>
            <p>Useful items can reach another student rather than gathering dust.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
