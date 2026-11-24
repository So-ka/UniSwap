import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/client';

const CATEGORIES = [
  { value: 'textbooks', label: 'Textbooks' },
  { value: 'calculators', label: 'Calculators' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'other', label: 'Other' },
];

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export function CreateListingPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [exchangeFor, setExchangeFor] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setError('');

    if (file && !PHOTO_TYPES.includes(file.type)) {
      setError('Photo must be a JPG, PNG or WebP image.');
      event.target.value = '';
      setPhoto(null);
      return;
    }
    if (file && file.size > MAX_PHOTO_BYTES) {
      setError('Photo must be 2 MB or smaller.');
      event.target.value = '';
      setPhoto(null);
      return;
    }

    setPhoto(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setCreated(false);

    if (!title.trim()) return setError('Title is required.');
    if (!description.trim()) return setError('Description is required.');
    if (!category) return setError('Choose a category.');
    if (!isFree && !exchangeFor.trim()) {
      return setError('Describe what you want in exchange.');
    }

    const body = new FormData();
    body.append('title', title.trim());
    body.append('description', description.trim());
    body.append('category', category);
    body.append('isFree', String(isFree));
    if (!isFree) body.append('exchangeFor', exchangeFor.trim());
    if (photo) body.append('photo', photo);

    setIsSubmitting(true);
    try {
      await apiRequest('/listings', { method: 'POST', body });
      setCreated(true);
      setTitle('');
      setDescription('');
      setCategory('');
      setIsFree(true);
      setExchangeFor('');
      setPhoto(null);
      (event.target as HTMLFormElement).reset();
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'The listing could not be created.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="form-card" aria-labelledby="listing-title">
        <span className="form-kicker">New listing</span>
        <h2 id="listing-title">Create a listing</h2>
        <p className="form-subtitle">
          Your listing is saved as Available and linked to your account.
        </p>

        {error && <div className="alert" role="alert">{error}</div>}
        {created && (
          <div className="alert" role="status">
            Listing created. <Link to="/">Back to home</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="listing-title-input">Title</label>
          <input
            id="listing-title-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            required
            placeholder="Statistics textbook"
          />

          <label htmlFor="listing-description">Description</label>
          <textarea
            id="listing-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={4}
            required
            placeholder="Condition, edition, pickup details…"
          />

          <label htmlFor="listing-category">Category</label>
          <select
            id="listing-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <label htmlFor="listing-free">
            <input
              id="listing-free"
              type="checkbox"
              checked={isFree}
              onChange={(event) => setIsFree(event.target.checked)}
            />{' '}
            Free to take
          </label>

          {!isFree && (
            <>
              <label htmlFor="listing-exchange">Exchange for</label>
              <input
                id="listing-exchange"
                type="text"
                value={exchangeFor}
                onChange={(event) => setExchangeFor(event.target.value)}
                maxLength={200}
                required
                placeholder="What would you like in return?"
              />
            </>
          )}

          <label htmlFor="listing-photo">Photo (optional)</label>
          <input
            id="listing-photo"
            type="file"
            accept={PHOTO_TYPES.join(',')}
            onChange={handlePhoto}
          />
          <small className="field-hint">JPG, PNG or WebP, up to 2 MB.</small>

          <button className="button button-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Create listing'}
          </button>
        </form>
      </section>
    </main>
  );
}
