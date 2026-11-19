import { describe, it, expect } from 'vitest';
import * as content from '../app/data/content.js';
import { offers, KINDS, KIND_LABELS, coordination, links } from '../app/data/content.js';

const EXPECTED_IDS = [
  'conceptos',
  'redes-neuronales',
  'practicar',
  'datos-reales',
  'libros',
  'canales',
  'criterio',
];

const EXPECTED_TITLES = [
  'Conceptos en acción',
  'Redes neuronales',
  'Practicar y copiar ejemplos',
  'Datos reales',
  'Libros para el verano',
  'Canales de YouTube',
  'Cómo elegir fuentes',
];

function collectStrings(value, out = []) {
  if (typeof value === 'string') {
    out.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectStrings(v, out));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((v) => collectStrings(v, out));
  }
  return out;
}

function collectUrls(value, out = []) {
  return collectStrings(value, out).filter((s) => /^[a-z]+:\/\//i.test(s));
}

describe('content model', () => {
  it('has exactly 7 resource categories in the expected order', () => {
    expect(offers).toHaveLength(7);
    expect(offers.map((c) => c.id)).toEqual(EXPECTED_IDS);
    expect(offers.map((c) => c.title)).toEqual(EXPECTED_TITLES);
  });

  it('every category has id, valid kind, title, summary, image and imageAlt', () => {
    for (const category of offers) {
      expect(category.id, JSON.stringify(category)).toMatch(/^[a-z0-9-]+$/);
      expect(KINDS).toContain(category.kind);
      expect(KIND_LABELS[category.kind]).toBeTruthy();
      expect(category.title.trim()).not.toBe('');
      expect(category.summary.trim()).not.toBe('');
      expect(category.image).toBe(`/bubbles/${category.id}.webp`);
      expect(category.imageAlt.trim()).not.toBe('');
    }
  });

  it('has the expected item counts per category', () => {
    const byId = Object.fromEntries(offers.map((c) => [c.id, c]));
    expect(byId['conceptos'].resources).toHaveLength(6);
    expect(byId['redes-neuronales'].resources).toHaveLength(3);
    expect(byId['practicar'].resources).toHaveLength(4);
    expect(byId['datos-reales'].resources).toHaveLength(1);
    expect(byId['libros'].books).toHaveLength(3);
    expect(byId['canales'].resources).toHaveLength(4);
    expect(byId['criterio'].guidance.paragraphs.length).toBeGreaterThanOrEqual(2);
  });

  it('every resource has name, description, host and an https URL', () => {
    const withResources = offers.filter((c) => Array.isArray(c.resources));
    expect(withResources.length).toBe(5);
    for (const category of withResources) {
      for (const resource of category.resources) {
        expect(resource.name.trim(), resource.name).not.toBe('');
        expect(resource.description.trim(), resource.name).not.toBe('');
        expect(resource.host.trim(), resource.name).not.toBe('');
        expect(resource.url, resource.name).toMatch(/^https:\/\//);
      }
    }
  });

  it('includes the 3 books with metadata, Python 2.7 note on Grus, and NotebookLM tip', () => {
    const libros = offers.find((c) => c.id === 'libros');
    expect(libros.books.map((b) => b.title)).toEqual([
      'Data Science from Scratch',
      'Linear Algebra, Data Science, and Machine Learning',
      'Data Science for Decision Makers',
    ]);
    for (const book of libros.books) {
      expect(book.author.trim()).not.toBe('');
      expect(book.publisherYear.trim()).not.toBe('');
      expect(book.level.trim()).not.toBe('');
      expect(book.description.trim()).not.toBe('');
    }
    expect(libros.books[0].note).toContain('Python 2.7');
    expect(libros.callout.linkUrl).toBe('https://notebooklm.google.com');
  });

  it('includes the subtitles/English note in canales and clickbait examples in criterio', () => {
    const canales = offers.find((c) => c.id === 'canales');
    expect(canales.note).toMatch(/subt[ií]tulos autom[aá]ticos en espa[nñ]ol/i);

    const criterio = offers.find((c) => c.id === 'criterio');
    const text = criterio.guidance.paragraphs.join(' ');
    expect(text).toContain('esto DESTRUYE a');
    expect(text).toContain('se viene el fin de');
    expect(text).toContain('salió esto y cambia todo');
  });

  it('contains no .pdf or .epub links or references anywhere in the model', () => {
    const allStrings = collectStrings(content);
    for (const s of allStrings) {
      expect(s).not.toMatch(/\.(pdf|epub)\b/i);
    }
  });

  it('all URLs in the model use https', () => {
    const urls = collectUrls(content);
    expect(urls.length).toBeGreaterThanOrEqual(19);
    urls.forEach((url) => expect(url).toMatch(/^https:\/\//));
  });

  it('exposes coordination metadata and official iTec link without admission exports', () => {
    expect(coordination.name).toContain('Ciencia de Datos');
    expect(coordination.name).toContain('iTec Río Cuarto');
    expect(links.officialSite).toBe('https://www.itecriocuarto.org.ar/inicio');
    expect(content.campuses).toBeUndefined();
    expect(content.contacts).toBeUndefined();
    expect(links.cta).toBeUndefined();
  });
});
