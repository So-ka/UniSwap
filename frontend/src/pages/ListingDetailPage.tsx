import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ApiError, apiRequest, resolveApiUrl } from '../api/client';

interface ListingDetail {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  category: string;
  photoUrl: string | null;
  isFree: boolean;
  exchangeFor: string | null;
  status: string;
  createdAt: string;
}

interface ListingDetailResponse {
  listing: ListingDetail;
}

const CATEGORY_LABELS: Record<string, string> = {
  textbooks: 'Textbooks',
  calculators: 'Calculators',
  electronics: 'Electronics',
  furniture: 'Furniture',
  other: 'Other',
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Available',
  RESERVED: 'Reserved',
  EXCHANGED: 'Exchanged',
};

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [error, setError] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');
    setIsNotFound(false);

    apiRequest<ListingDetailResponse>(
      `/listings/${encodeURIComponent(id ?? '')}`,
    )
      .then((result) => {
        if (!cancelled) setListing(result.listing);
      })
      .catch((requestError: unknown) => {
        if (cancelled) return;

        if (requestError instanceof ApiError && requestError.status === 404) {
          setIsNotFound(true);
          return;
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'The listing could not be loaded.',
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <main className="route-state" aria-live="polite">
        <span className="spinner" aria-hidden="true" />
        <p>Loading listing…</p>
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main className="route-state">
        <span className="eyebrow">Not found</span>
        <h1>This listing isn’t here.</h1>
        <p>It may have been removed or the link may be incorrect.</p>
        <Link className="button" to="/">
          Return home
        </Link>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="route-state">
        <span className="eyebrow">Something went wrong</span>
        <h1>We couldn’t load this listing.</h1>
        <div className="alert" role="alert">
          {error || 'The listing could not be loaded.'}
        </div>
        <Link className="button" to="/">
          Return home
        </Link>
      </main>
    );
  }

  const statusLabel = STATUS_LABELS[listing.status] ?? listing.status;

  return (
    <main className="listing-detail">
      <Link className="text-link listing-back" to="/#listings">
        <span aria-hidden="true">←</span> Back to listings
      </Link>

      <article className="listing-detail-card" aria-labelledby="listing-detail-title">
        <div className="listing-detail-photo">
          {listing.photoUrl ? (
            <img src={resolveApiUrl(listing.photoUrl)} alt={listing.title} />
          ) : (
            <div
              className="listing-detail-placeholder"
              role="img"
              aria-label="No photo available"
            >
              📦
            </div>
          )}
        </div>

        <div className="listing-detail-body">
          <span className="eyebrow">
            {CATEGORY_LABELS[listing.category] ?? listing.category}
          </span>

          <div className="listing-detail-heading">
            <h1 id="listing-detail-title">{listing.title}</h1>
            <span className={`status-badge status-${listing.status.toLowerCase()}`}>
              {statusLabel}
            </span>
          </div>

          <p className="listing-detail-price">
            {listing.isFree
              ? 'Free to take'
              : `Exchange for: ${listing.exchangeFor ?? '—'}`}
          </p>

          <p className="listing-detail-description">{listing.description}</p>

          <dl className="listing-meta">
            <div>
              <dt>Posted by</dt>
              <dd>{listing.ownerName}</dd>
            </div>
            <div>
              <dt>Posted on</dt>
              <dd>{formatDate(listing.createdAt)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{statusLabel}</dd>
            </div>
          </dl>
        </div>
      </article>
    </main>
  );
}
