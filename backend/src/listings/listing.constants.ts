export const LISTING_CATEGORIES = [
  'textbooks',
  'calculators',
  'electronics',
  'furniture',
  'other',
] as const;

export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

export const ALLOWED_PHOTO_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
