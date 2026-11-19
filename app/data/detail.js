// Pure view-model helpers for the inner bubble (resource category detail).
// Everything comes from content.js; missing items are omitted, never fabricated.
import { offers as allOffers } from './content.js';

// Hex twins of BUBBLE_COLORS in app/scene/bubbles/colors.js (kept three.js-free so
// the DOM can use them). A test keeps both lists in sync.
export const BUBBLE_HEX = ['#ffd333', '#8c00ff', '#ff94b6', '#ff0090'];

const slug = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');

function uniqueKey(base, seen) {
  const normalized = base || 'item';
  const count = seen.get(normalized) ?? 0;
  seen.set(normalized, count + 1);
  return count ? `${normalized}-${count + 1}` : normalized;
}

/**
 * Ordered detail items for a resource category:
 * - `{ key, type: 'resource', name, url, host, description }`
 * - `{ key, type: 'book', title, author, publisherYear, level, levelTone, description, note }`
 * - `{ key, type: 'guidance', eyebrow, paragraphs }`
 * Incomplete or empty entries are dropped.
 */
export function buildDetail(category) {
  if (!category) return [];
  const items = [];
  const seen = new Map();

  for (const resource of category.resources ?? []) {
    const name = cleanText(resource?.name);
    const url = cleanText(resource?.url);
    const description = cleanText(resource?.description);
    const host = cleanText(resource?.host) || (url.startsWith('https://') ? url.replace(/^https:\/\//, '') : '');
    if (!name || !url) continue;
    items.push({
      key: uniqueKey(slug(name), seen),
      type: 'resource',
      name,
      url,
      host,
      description,
    });
  }

  for (const book of category.books ?? []) {
    const title = cleanText(book?.title);
    const description = cleanText(book?.description);
    if (!title || !description) continue;
    items.push({
      key: uniqueKey(slug(title), seen),
      type: 'book',
      title,
      author: cleanText(book?.author),
      publisherYear: cleanText(book?.publisherYear),
      level: cleanText(book?.level),
      levelTone: cleanText(book?.levelTone) || 'default',
      description,
      note: cleanText(book?.note),
    });
  }

  const paragraphs = (category.guidance?.paragraphs ?? []).map(cleanText).filter(Boolean);
  if (paragraphs.length > 0) {
    items.push({
      key: uniqueKey(slug(category.id || 'criterio'), seen),
      type: 'guidance',
      eyebrow: cleanText(category.guidance?.eyebrow),
      paragraphs,
    });
  }

  return items;
}

/** Previous / next category around `id`, wrapping at both ends. */
export function adjacentOffers(id, list = allOffers) {
  const index = list.findIndex((offer) => offer.id === id);
  if (index < 0 || list.length === 0) return { prev: null, next: null };
  return {
    prev: list[(index - 1 + list.length) % list.length],
    next: list[(index + 1) % list.length],
  };
}

/** Bubble color of a category, same index rule as the 3D bubbles. */
export function tintFor(id, list = allOffers) {
  const index = Math.max(0, list.findIndex((offer) => offer.id === id));
  return BUBBLE_HEX[index % BUBBLE_HEX.length];
}
