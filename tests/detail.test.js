import { describe, it, expect } from 'vitest';
import { buildDetail, adjacentOffers, tintFor, BUBBLE_HEX } from '../app/data/detail.js';
import { offers, KIND_LABELS } from '../app/data/content.js';
import { BUBBLE_COLORS } from '../app/scene/bubbles/colors.js';

const byId = (id) => offers.find((offer) => offer.id === id);

describe('buildDetail', () => {
  it('turns every resource of a site or channel category into an ordered resource item', () => {
    const category = byId('conceptos');
    const items = buildDetail(category);
    expect(items).toHaveLength(6);
    expect(items.every((item) => item.type === 'resource')).toBe(true);
    expect(items.map((item) => item.name)).toEqual(category.resources.map((r) => r.name));
  });

  it('turns books into ordered book items with author, publisherYear, level and optional note', () => {
    const items = buildDetail(byId('libros'));
    expect(items).toHaveLength(3);
    expect(items.every((item) => item.type === 'book')).toBe(true);
    expect(items[0]).toMatchObject({
      title: 'Data Science from Scratch',
      author: 'Joel Grus',
      publisherYear: "O'Reilly · 2015",
      level: 'Intermedio',
    });
    expect(items[0].note).toContain('Python 2.7');
    expect(items[1].note).toBe('');
  });

  it('turns guidance into a guidance item for criterio', () => {
    const items = buildDetail(byId('criterio'));
    expect(items).toHaveLength(1);
    expect(items[0].type).toBe('guidance');
    expect(items[0].eyebrow).toBe('Antes de darle play');
    expect(items[0].paragraphs.length).toBeGreaterThanOrEqual(2);
  });

  it('gives each item a stable, unique, DOM-safe key', () => {
    const items = buildDetail(byId('conceptos'));
    const keys = items.map((item) => item.key);
    expect(new Set(keys).size).toBe(keys.length);
    keys.forEach((key) => expect(key).toMatch(/^[a-z0-9-]+$/));
  });

  it('omits incomplete resources, books, and empty guidance', () => {
    const items = buildDetail({
      id: 'x',
      resources: [
        { name: '', url: 'https://example.com' },
        { name: 'Sin URL', url: '' },
        { name: 'Ok', url: 'https://example.com', description: 'Desc' },
      ],
      books: [{ title: 'Sin descripción' }, { title: '', description: 'sin título' }],
      guidance: { paragraphs: ['   '] },
    });
    expect(items).toEqual([
      {
        key: 'ok',
        type: 'resource',
        name: 'Ok',
        url: 'https://example.com',
        host: 'example.com',
        description: 'Desc',
      },
    ]);
  });

  it('handles categories without items', () => {
    expect(buildDetail({ id: 'x' })).toEqual([]);
    expect(buildDetail(null)).toEqual([]);
  });

  it('every real category yields at least one item', () => {
    offers.forEach((category) => {
      const items = buildDetail(category);
      expect(items.length).toBeGreaterThan(0);
    });
  });

  it('kind labels exist for every category kind', () => {
    offers.forEach((category) => expect(KIND_LABELS[category.kind]).toBeTruthy());
  });
});

describe('adjacentOffers', () => {
  it('returns the previous and next category', () => {
    const { prev, next } = adjacentOffers(offers[3].id);
    expect(prev.id).toBe(offers[2].id);
    expect(next.id).toBe(offers[4].id);
  });

  it('wraps around at both ends', () => {
    expect(adjacentOffers(offers[0].id).prev.id).toBe(offers[offers.length - 1].id);
    expect(adjacentOffers(offers[offers.length - 1].id).next.id).toBe(offers[0].id);
  });

  it('returns nulls for unknown ids', () => {
    expect(adjacentOffers('nope')).toEqual({ prev: null, next: null });
  });
});

describe('tintFor', () => {
  it('matches the bubble color used by the scene', () => {
    expect(BUBBLE_HEX.map((hex) => parseInt(hex.slice(1), 16))).toEqual(BUBBLE_COLORS);
    offers.forEach((offer, i) => expect(tintFor(offer.id)).toBe(BUBBLE_HEX[i % BUBBLE_HEX.length]));
  });

  it('falls back to the first color for unknown ids', () => {
    expect(tintFor('nope')).toBe(BUBBLE_HEX[0]);
  });
});
