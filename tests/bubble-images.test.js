import { describe, it, expect } from 'vitest';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import {
  CATEGORY_IDS,
  DEFAULT_SEED,
  SIZE,
  generateBubbleImages,
  renderCategorySvg,
} from '../scripts/bubble-images.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bubblesDir = path.join(root, 'public/bubbles');

const EXPECTED_IDS = [
  'conceptos',
  'redes-neuronales',
  'practicar',
  'datos-reales',
  'libros',
  'canales',
  'criterio',
];

describe('bubble images', () => {
  it('defines the exact 7 category ids at 1024px', () => {
    expect(SIZE).toBe(1024);
    expect(CATEGORY_IDS).toEqual(EXPECTED_IDS);
  });

  it('configures package.json to run the generative script by default', () => {
    const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(pkg.scripts['bubble-images']).toBe('node scripts/bubble-images.mjs');
    expect(pkg.scripts.illustrate).toBeUndefined();
  });

  it('renders deterministic, text-free 1024x1024 SVGs for every category', () => {
    const seen = new Set();
    for (const id of EXPECTED_IDS) {
      const svgA = renderCategorySvg(id, { seed: DEFAULT_SEED });
      const svgB = renderCategorySvg(id, { seed: DEFAULT_SEED });
      expect(svgA, id).toBe(svgB);
      expect(svgA, id).toContain('<svg');
      expect(svgA, id).toContain('viewBox="0 0 1024 1024"');
      expect(svgA, id).not.toMatch(/<text[\s>]|<tspan[\s>]/i);
      seen.add(svgA);
    }
    expect(seen.size).toBe(EXPECTED_IDS.length);
  });

  it('rejects unknown category ids', () => {
    expect(() => renderCategorySvg('unknown-category')).toThrow();
  });

  it('rasterizes byte-identical 1024x1024 webp files for a given seed', async () => {
    const dirA = mkdtempSync(path.join(tmpdir(), 'bubbles-a-'));
    const dirB = mkdtempSync(path.join(tmpdir(), 'bubbles-b-'));
    try {
      await generateBubbleImages({ outDir: dirA, seed: DEFAULT_SEED });
      await generateBubbleImages({ outDir: dirB, seed: DEFAULT_SEED });

      for (const id of EXPECTED_IDS) {
        const fileA = path.join(dirA, `${id}.webp`);
        const fileB = path.join(dirB, `${id}.webp`);
        expect(existsSync(fileA), id).toBe(true);
        const bytesA = readFileSync(fileA);
        const bytesB = readFileSync(fileB);
        expect(bytesA.equals(bytesB), `${id} determinism`).toBe(true);

        const meta = await sharp(bytesA).metadata();
        expect(meta.format, id).toBe('webp');
        expect([meta.width, meta.height], id).toEqual([1024, 1024]);
      }
    } finally {
      rmSync(dirA, { recursive: true, force: true });
      rmSync(dirB, { recursive: true, force: true });
    }
  });

  it('commits exactly the 7 1024x1024 webp files under public/bubbles/', async () => {
    const files = readdirSync(bubblesDir).filter((f) => !f.startsWith('.')).sort();
    expect(files).toEqual(EXPECTED_IDS.map((id) => `${id}.webp`).sort());

    for (const id of EXPECTED_IDS) {
      const meta = await sharp(path.join(bubblesDir, `${id}.webp`)).metadata();
      expect(meta.format, id).toBe('webp');
      expect([meta.width, meta.height], id).toEqual([1024, 1024]);
    }
  });

  it('removes legacy ItecBulles photos', () => {
    const photosDir = path.join(root, 'assets/photos');
    const entries = existsSync(photosDir) ? readdirSync(photosDir) : [];
    expect(entries).toEqual([]);
  });
});
