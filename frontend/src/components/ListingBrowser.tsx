import { useEffect, useState } from 'react';
import { apiRequest, resolveApiUrl } from '../api/client';

interface Listing {
  id: string;
  title: string;
  category: string;
  photoUrl: string | null;
  isFree: boolean;
  exchangeFor: string | null;
  status: string;
}

interface ListingPage {
  items: Listing[];
  page: number;
  totalPages: number;
  total: number;
}

const PAGE_SIZE = 12;

const CATEGORY_LABELS: Record<string, string> = {
  textbooks: 'Textbooks',
  calculators: 'Calculators',
  electronics: 'Electronics',
  furniture: 'Furniture',
  other: 'Other',
};

export function ListingBrowser() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListingPage | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    apiRequest<ListingPage>(`/listings?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Listings could not be loaded.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return (
    <section className="how-section" id="listings" aria-labelledby="listings-title">
      <div className="section-heading">
        <span className="eyebrow">Browse</span>
        <h2 id="listings-title">Latest listings</h2>
      </div>

      {error && <div className="alert" role="alert">{error}</div>}
      {isLoading && !data && <p aria-live="polite">Loading listings…</p>}
      {data && data.items.length === 0 && <p>No listings yet. Check back soon.</p>}

      {data && data.items.length > 0 && (
        <div className="feature-grid">
          {data.items.map((listing) => (
            <article className="feature-card" key={listing.id}>
              {listing.photoUrl ? (
                <img
                  src={resolveApiUrl(listing.photoUrl)}
                  alt={listing.title}
                  loading="lazy"
                  style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="feature-icon"
                  aria-label="No photo"
                  style={{ width: '100%', aspectRatio: '4 / 3' }}
                >
                  📦
                </div>
              )}
              <h3>{listing.title}</h3>
              <p>{CATEGORY_LABELS[listing.category] ?? listing.category}</p>
              <p>
                {listing.isFree
                  ? 'Free'
                  : `Exchange for: ${listing.exchangeFor ?? '—'}`}
              </p>
            </article>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <nav className="hero-actions" aria-label="Listing pages">
          <button
            className="button button-small button-ghost"
            type="button"
            onClick={() => setPage((current) => current - 1)}
            disabled={isLoading || page <= 1}
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {data.page} of {data.totalPages}
          </span>
          <button
            className="button button-small button-ghost"
            type="button"
            onClick={() => setPage((current) => current + 1)}
            disabled={isLoading || page >= data.totalPages}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
