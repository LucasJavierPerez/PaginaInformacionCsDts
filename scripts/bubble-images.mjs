// Generates deterministic category artwork (public/bubbles/<id>.webp, 1024x1024)
// as SVG illustrations rasterized with sharp.
//
//   npm run bubble-images
//
// No text, no logos, no external assets: only Node built-ins + sharp.
// All primary motifs stay within the central safe circle (radius ~350px around 512,512)
// so they remain legible when masked into 3D spheres or circular DOM orbs.

import { mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_OUT_DIR = path.join(ROOT, 'public/bubbles');
export const SIZE = 1024;
export const DEFAULT_SEED = 20261119;

export const CATEGORY_IDS = [
  'conceptos',
  'redes-neuronales',
  'practicar',
  'datos-reales',
  'libros',
  'canales',
  'criterio',
];

// Site tokens from app/assets/css/main.css and app/scene/bubbles/colors.js.
const TOKENS = {
  blue: '#8da0fb',
  purple: '#b88ff4',
  lilac: '#e1e2fe',
  yellow: '#fbc77a',
  cream: '#fffaed',
  ink: '#280b3c',
  success: '#56c6a7',
  error: '#e73333',
  bubbleYellow: '#ffd333',
  bubbleViolet: '#8c00ff',
  bubblePink: '#ff94b6',
  bubbleMagenta: '#ff0090',
};

// Deterministic PRNG (mulberry32).
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const f = (n) => Number(n.toFixed(2));

function ambientGlows(rand, colors) {
  const shapes = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = rand() * Math.PI * 2;
    const dist = 140 + rand() * 240;
    const cx = 512 + Math.cos(angle) * dist;
    const cy = 512 + Math.sin(angle) * dist;
    const r = 70 + rand() * 110;
    const color = colors[i % colors.length];
    const opacity = 0.14 + rand() * 0.14;
    shapes.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${color}" opacity="${f(opacity)}"/>`);
  }
  return shapes.join('\n  ');
}

function backgroundSvg(id, c1, c2, glowColor, rand, accents) {
  return `<defs>
    <linearGradient id="bg-${id}" x1="12%" y1="8%" x2="88%" y2="92%">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="halo-${id}" cx="50%" cy="48%" r="48%">
      <stop offset="0%" stop-color="${TOKENS.cream}" stop-opacity="0.82"/>
      <stop offset="62%" stop-color="${glowColor}" stop-opacity="0.24"/>
      <stop offset="100%" stop-color="${glowColor}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg-${id})"/>
  <circle cx="512" cy="512" r="460" fill="url(#halo-${id})"/>
  ${ambientGlows(rand, accents)}`;
}

function renderConceptos(rand) {
  // Scatter points + regression line + Gaussian bell curve inside central circle.
  const bg = backgroundSvg('conceptos', TOKENS.lilac, TOKENS.yellow, TOKENS.bubbleYellow, rand, [
    TOKENS.bubbleYellow,
    TOKENS.blue,
    TOKENS.purple,
  ]);

  // Subtle circular backdrop plate.
  const plate = `<circle cx="512" cy="512" r="320" fill="${TOKENS.cream}" opacity="0.82"/>`;

  // Bell curve along the lower half.
  const bellPoints = [];
  const baseY = 690;
  for (let i = 0; i <= 48; i += 1) {
    const t = i / 48;
    const x = 250 + t * 524;
    const z = (t - 0.5) * 4.4;
    const y = baseY - Math.exp(-0.5 * z * z) * 210;
    bellPoints.push(`${f(x)},${f(y)}`);
  }
  const bellFill = `M 250,${baseY} L ${bellPoints.join(' L ')} L 774,${baseY} Z`;
  const bellStroke = `M ${bellPoints.join(' L ')}`;

  // Coordinate axes.
  const axes = `
    <line x1="252" y1="690" x2="776" y2="690" stroke="${TOKENS.ink}" stroke-width="10" stroke-linecap="round"/>
    <line x1="278" y1="712" x2="278" y2="278" stroke="${TOKENS.ink}" stroke-width="10" stroke-linecap="round"/>
  `;

  // Regression band + line.
  const regLine = `
    <line x1="296" y1="636" x2="740" y2="338" stroke="${TOKENS.bubbleMagenta}" stroke-width="34" stroke-linecap="round" opacity="0.16"/>
    <line x1="296" y1="636" x2="740" y2="338" stroke="${TOKENS.bubbleMagenta}" stroke-width="12" stroke-linecap="round"/>
  `;

  // Deterministic scatter points around the regression line.
  const dotColors = [TOKENS.bubbleYellow, TOKENS.bubbleViolet, TOKENS.blue, TOKENS.success, TOKENS.bubblePink];
  const dots = [];
  for (let i = 0; i < 16; i += 1) {
    const t = (i + 0.5) / 16;
    const x = 310 + t * 412 + (rand() - 0.5) * 26;
    const lineY = 626 - t * 276;
    const y = lineY + (rand() - 0.5) * 116;
    const r = 13 + rand() * 8;
    const fill = dotColors[i % dotColors.length];
    dots.push(
      `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${TOKENS.ink}" stroke-width="5"/>`,
    );
  }

  return `${bg}
  ${plate}
  <path d="${bellFill}" fill="${TOKENS.blue}" opacity="0.32"/>
  <path d="${bellStroke}" fill="none" stroke="${TOKENS.bubbleViolet}" stroke-width="8" stroke-linecap="round"/>
  ${regLine}
  ${axes}
  ${dots.join('\n  ')}`;
}

function renderRedesNeuronales(rand) {
  const bg = backgroundSvg('redes', TOKENS.lilac, TOKENS.blue, TOKENS.bubbleViolet, rand, [
    TOKENS.purple,
    TOKENS.bubblePink,
    TOKENS.bubbleViolet,
  ]);

  const layers = [
    { x: 288, ys: [362, 512, 662], fill: TOKENS.bubbleYellow },
    { x: 512, ys: [302, 442, 582, 722], fill: TOKENS.bubblePink },
    { x: 736, ys: [372, 512, 652], fill: TOKENS.success },
  ];

  const edges = [];
  for (let l = 0; l < layers.length - 1; l += 1) {
    const a = layers[l];
    const b = layers[l + 1];
    for (const ya of a.ys) {
      for (const yb of b.ys) {
        const strong = rand() > 0.42;
        const w = strong ? 7 : 4;
        const op = strong ? 0.72 : 0.28;
        const color = strong ? TOKENS.ink : TOKENS.bubbleViolet;
        const midX = (a.x + b.x) / 2;
        edges.push(
          `<path d="M ${a.x} ${ya} C ${midX} ${ya}, ${midX} ${yb}, ${b.x} ${yb}" fill="none" stroke="${color}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>`,
        );
      }
    }
  }

  // Soft pulse rings around two hidden nodes.
  const pulses = `
    <circle cx="512" cy="442" r="56" fill="none" stroke="${TOKENS.cream}" stroke-width="6" opacity="0.65"/>
    <circle cx="736" cy="512" r="60" fill="none" stroke="${TOKENS.bubbleYellow}" stroke-width="6" opacity="0.65"/>
  `;

  const nodes = [];
  for (const layer of layers) {
    for (const y of layer.ys) {
      nodes.push(
        `<circle cx="${layer.x}" cy="${y}" r="34" fill="${layer.fill}" stroke="${TOKENS.ink}" stroke-width="8"/>`,
        `<circle cx="${layer.x - 9}" cy="${y - 9}" r="9" fill="${TOKENS.cream}" opacity="0.85"/>`,
      );
    }
  }

  return `${bg}
  <circle cx="512" cy="512" r="326" fill="${TOKENS.cream}" opacity="0.45"/>
  ${edges.join('\n  ')}
  ${pulses}
  ${nodes.join('\n  ')}`;
}

function renderPracticar(rand) {
  const bg = backgroundSvg('practicar', TOKENS.cream, TOKENS.bubblePink, TOKENS.purple, rand, [
    TOKENS.bubblePink,
    TOKENS.bubbleYellow,
    TOKENS.blue,
  ]);

  // Stylized notebook frame centered inside the safe circle.
  const card = `
    <rect x="242" y="252" width="540" height="520" rx="44" fill="${TOKENS.cream}" stroke="${TOKENS.ink}" stroke-width="11"/>
    <rect x="242" y="252" width="540" height="72" rx="44" fill="${TOKENS.lilac}"/>
    <rect x="242" y="294" width="540" height="30" fill="${TOKENS.lilac}"/>
    <line x1="242" y1="324" x2="782" y2="324" stroke="${TOKENS.ink}" stroke-width="8"/>
    <circle cx="298" cy="288" r="12" fill="${TOKENS.bubblePink}" stroke="${TOKENS.ink}" stroke-width="4"/>
    <circle cx="338" cy="288" r="12" fill="${TOKENS.bubbleYellow}" stroke="${TOKENS.ink}" stroke-width="4"/>
    <circle cx="378" cy="288" r="12" fill="${TOKENS.success}" stroke="${TOKENS.ink}" stroke-width="4"/>
  `;

  // Cell 1: play gutter + code brackets + syntax pill bars.
  const barWidths = [150, 210, 130].map((w) => f(w + (rand() - 0.5) * 32));
  const cell1 = `
    <rect x="278" y="352" width="468" height="176" rx="26" fill="${TOKENS.lilac}" opacity="0.7" stroke="${TOKENS.ink}" stroke-width="6"/>
    <circle cx="326" cy="440" r="24" fill="${TOKENS.success}" stroke="${TOKENS.ink}" stroke-width="5"/>
    <polygon points="319,428 340,440 319,452" fill="${TOKENS.cream}"/>
    <path d="M 392 396 L 368 440 L 392 484" fill="none" stroke="${TOKENS.ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M 692 396 L 716 440 L 692 484" fill="none" stroke="${TOKENS.ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="424" y="392" width="${barWidths[0]}" height="20" rx="10" fill="${TOKENS.bubbleViolet}"/>
    <rect x="424" y="430" width="${barWidths[1]}" height="20" rx="10" fill="${TOKENS.blue}"/>
    <rect x="424" y="468" width="${barWidths[2]}" height="20" rx="10" fill="${TOKENS.bubbleMagenta}"/>
  `;

  // Cell 2: output chart gallery preview (bars + sparkline).
  const cell2Bars = [74, 112, 88, 132, 102].map((h, idx) => {
    const x = 328 + idx * 54;
    const y = 716 - h;
    const colors = [TOKENS.bubbleYellow, TOKENS.blue, TOKENS.bubblePink, TOKENS.success, TOKENS.purple];
    return `<rect x="${x}" y="${f(y)}" width="34" height="${h}" rx="12" fill="${colors[idx]}" stroke="${TOKENS.ink}" stroke-width="5"/>`;
  });

  const cell2 = `
    <rect x="278" y="552" width="468" height="188" rx="26" fill="${TOKENS.cream}" stroke="${TOKENS.ink}" stroke-width="6"/>
    ${cell2Bars.join('\n    ')}
    <path d="M 610 680 Q 642 600, 676 632 T 722 590" fill="none" stroke="${TOKENS.bubbleMagenta}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="722" cy="590" r="10" fill="${TOKENS.bubbleYellow}" stroke="${TOKENS.ink}" stroke-width="4"/>
  `;

  return `${bg}
  ${card}
  ${cell1}
  ${cell2}`;
}

function renderDatosReales(rand) {
  const bg = backgroundSvg('datos', TOKENS.lilac, TOKENS.success, TOKENS.blue, rand, [
    TOKENS.blue,
    TOKENS.success,
    TOKENS.bubbleYellow,
  ]);

  // Stylized globe centered left-of-center, bars rising on the right.
  const gx = 456;
  const gy = 486;
  const gr = 208;
  const globe = `
    <defs>
      <clipPath id="globe-clip">
        <circle cx="${gx}" cy="${gy}" r="${gr}"/>
      </clipPath>
    </defs>
    <circle cx="${gx}" cy="${gy}" r="${gr}" fill="${TOKENS.blue}" stroke="${TOKENS.ink}" stroke-width="11"/>
    <g clip-path="url(#globe-clip)">
      <path d="M 290 420 Q 360 365, 430 410 T 520 390 Q 560 440, 505 495 Q 430 510, 385 565 Q 320 555, 290 480 Z" fill="${TOKENS.success}" opacity="0.92"/>
      <path d="M 520 520 Q 595 490, 650 545 Q 635 635, 555 660 Q 495 620, 520 520 Z" fill="${TOKENS.bubbleYellow}" opacity="0.9"/>
      <ellipse cx="${gx}" cy="${gy}" rx="108" ry="${gr}" fill="none" stroke="${TOKENS.cream}" stroke-width="6" opacity="0.7"/>
      <line x1="${gx - gr}" y1="${gy}" x2="${gx + gr}" y2="${gy}" stroke="${TOKENS.cream}" stroke-width="6" opacity="0.7"/>
      <path d="M ${gx - gr} ${gy - 88} Q ${gx} ${gy - 58}, ${gx + gr} ${gy - 88}" fill="none" stroke="${TOKENS.cream}" stroke-width="5" opacity="0.6"/>
      <path d="M ${gx - gr} ${gy + 88} Q ${gx} ${gy + 58}, ${gx + gr} ${gy + 88}" fill="none" stroke="${TOKENS.cream}" stroke-width="5" opacity="0.6"/>
    </g>
    <circle cx="${gx}" cy="${gy}" r="${gr}" fill="none" stroke="${TOKENS.ink}" stroke-width="11"/>
  `;

  // Floating global data bars badge in front-bottom-right.
  const barHeights = [82, 134, 178, 224];
  const barColors = [TOKENS.bubbleYellow, TOKENS.bubblePink, TOKENS.purple, TOKENS.bubbleMagenta];
  const bars = barHeights.map((h, i) => {
    const x = 516 + i * 58;
    const y = 736 - h;
    return `<rect x="${x}" y="${y}" width="42" height="${h}" rx="14" fill="${barColors[i]}" stroke="${TOKENS.ink}" stroke-width="7"/>`;
  });

  // Orbiting data nodes along the unobstructed arc of the globe.
  const orbitAngles = [-2.55, -1.15, 2.25];
  const orbitDots = orbitAngles.map((baseAngle) => {
    const a = baseAngle + (rand() - 0.5) * 0.14;
    const x = gx + Math.cos(a) * 255;
    const y = gy + Math.sin(a) * 255;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="15" fill="${TOKENS.cream}" stroke="${TOKENS.ink}" stroke-width="6"/>`;
  });

  return `${bg}
  <circle cx="${gx}" cy="${gy}" r="255" fill="none" stroke="${TOKENS.ink}" stroke-width="5" stroke-dasharray="14 14" opacity="0.45"/>
  ${globe}
  ${orbitDots.join('\n  ')}
  <rect x="492" y="486" width="268" height="270" rx="34" fill="${TOKENS.cream}" opacity="0.92" stroke="${TOKENS.ink}" stroke-width="8"/>
  ${bars.join('\n  ')}`;
}

function renderLibros(rand) {
  const bg = backgroundSvg('libros', TOKENS.cream, TOKENS.yellow, TOKENS.bubbleYellow, rand, [
    TOKENS.bubbleYellow,
    TOKENS.bubblePink,
    TOKENS.purple,
  ]);

  // Helper for one horizontal rounded hardcover book with cream page block.
  const drawBook = ({ x, y, w, h, cover, spine, tilt }) => `
    <g transform="rotate(${tilt} ${x + w / 2} ${y + h / 2})">
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${cover}" stroke="${TOKENS.ink}" stroke-width="9"/>
      <rect x="${x + 28}" y="${y + 18}" width="${w - 46}" height="${h - 36}" rx="12" fill="${TOKENS.cream}" stroke="${TOKENS.ink}" stroke-width="6"/>
      <rect x="${x}" y="${y}" width="54" height="${h}" rx="20" fill="${spine}" stroke="${TOKENS.ink}" stroke-width="9"/>
      <line x1="${x + 76}" y1="${y + h / 2}" x2="${x + w - 42}" y2="${y + h / 2}" stroke="${TOKENS.lilac}" stroke-width="7" stroke-linecap="round"/>
    </g>
  `;

  const bookBottom = drawBook({
    x: 278,
    y: 590,
    w: 468,
    h: 112,
    cover: TOKENS.blue,
    spine: TOKENS.bubbleViolet,
    tilt: -2,
  });
  const bookMid = drawBook({
    x: 296,
    y: 472,
    w: 444,
    h: 108,
    cover: TOKENS.bubblePink,
    spine: TOKENS.bubbleMagenta,
    tilt: 2.5,
  });
  const bookTop = drawBook({
    x: 274,
    y: 356,
    w: 448,
    h: 104,
    cover: TOKENS.success,
    spine: TOKENS.blue,
    tilt: -3.5,
  });

  // Bookmark ribbon & sun/sparkle accents.
  const bookmark = `
    <path d="M 604 352 L 604 494 L 630 468 L 656 494 L 656 352 Z" fill="${TOKENS.bubbleYellow}" stroke="${TOKENS.ink}" stroke-width="7" stroke-linejoin="round"/>
  `;

  const sparkles = [];
  for (let i = 0; i < 4; i += 1) {
    const sx = 300 + i * 140 + (rand() - 0.5) * 30;
    const sy = 285 + (i % 2) * 32 + (rand() - 0.5) * 18;
    sparkles.push(
      `<path d="M ${f(sx)} ${f(sy - 18)} L ${f(sx + 6)} ${f(sy - 6)} L ${f(sx + 18)} ${f(sy)} L ${f(sx + 6)} ${f(sy + 6)} L ${f(sx)} ${f(sy + 18)} L ${f(sx - 6)} ${f(sy + 6)} L ${f(sx - 18)} ${f(sy)} L ${f(sx - 6)} ${f(sy - 6)} Z" fill="${TOKENS.bubbleYellow}" stroke="${TOKENS.ink}" stroke-width="4" stroke-linejoin="round"/>`,
    );
  }

  return `${bg}
  <ellipse cx="512" cy="728" rx="250" ry="30" fill="${TOKENS.ink}" opacity="0.14"/>
  ${bookBottom}
  ${bookMid}
  ${bookTop}
  ${bookmark}
  ${sparkles.join('\n  ')}`;
}

function renderCanales(rand) {
  const bg = backgroundSvg('canales', TOKENS.lilac, TOKENS.purple, TOKENS.bubblePink, rand, [
    TOKENS.bubbleViolet,
    TOKENS.bubbleMagenta,
    TOKENS.bubbleYellow,
  ]);

  // Signal waves behind screen.
  const waves = `
    <path d="M 224 410 Q 192 512, 224 614" fill="none" stroke="${TOKENS.cream}" stroke-width="10" stroke-linecap="round" opacity="0.8"/>
    <path d="M 800 410 Q 832 512, 800 614" fill="none" stroke="${TOKENS.cream}" stroke-width="10" stroke-linecap="round" opacity="0.8"/>
    <path d="M 186 446 Q 162 512, 186 578" fill="none" stroke="${TOKENS.bubbleYellow}" stroke-width="8" stroke-linecap="round" opacity="0.75"/>
    <path d="M 838 446 Q 862 512, 838 578" fill="none" stroke="${TOKENS.bubbleYellow}" stroke-width="8" stroke-linecap="round" opacity="0.75"/>
  `;

  // Player screen.
  const screen = `
    <rect x="248" y="318" width="528" height="352" rx="48" fill="${TOKENS.cream}" stroke="${TOKENS.ink}" stroke-width="12"/>
    <rect x="274" y="344" width="476" height="248" rx="30" fill="${TOKENS.lilac}"/>
  `;

  // Play badge (circle + rounded triangle, no brand rectangle).
  const playButton = `
    <defs>
      <linearGradient id="play-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${TOKENS.bubbleMagenta}"/>
        <stop offset="100%" stop-color="${TOKENS.bubbleViolet}"/>
      </linearGradient>
    </defs>
    <circle cx="512" cy="468" r="88" fill="url(#play-grad)" stroke="${TOKENS.ink}" stroke-width="10"/>
    <polygon points="486,424 562,468 486,512" fill="${TOKENS.cream}" stroke="${TOKENS.ink}" stroke-width="7" stroke-linejoin="round"/>
  `;

  // Scrubber timeline + chapter dots.
  const progress = 380 + Math.round(rand() * 140);
  const scrubber = `
    <line x1="298" y1="628" x2="726" y2="628" stroke="${TOKENS.lilac}" stroke-width="14" stroke-linecap="round"/>
    <line x1="298" y1="628" x2="${progress}" y2="628" stroke="${TOKENS.bubbleMagenta}" stroke-width="14" stroke-linecap="round"/>
    <circle cx="${progress}" cy="628" r="16" fill="${TOKENS.bubbleYellow}" stroke="${TOKENS.ink}" stroke-width="6"/>
    <circle cx="628" cy="628" r="9" fill="${TOKENS.success}" stroke="${TOKENS.ink}" stroke-width="4"/>
  `;

  return `${bg}
  ${waves}
  ${screen}
  ${playButton}
  ${scrubber}`;
}

function renderCriterio(rand) {
  const bg = backgroundSvg('criterio', TOKENS.lilac, TOKENS.bubblePink, TOKENS.yellow, rand, [
    TOKENS.bubblePink,
    TOKENS.success,
    TOKENS.yellow,
  ]);

  // Stylized article/headline card.
  const card = `
    <rect x="256" y="268" width="454" height="486" rx="40" fill="${TOKENS.cream}" stroke="${TOKENS.ink}" stroke-width="11"/>
    <rect x="304" y="324" width="224" height="32" rx="16" fill="${TOKENS.error}" opacity="0.85" stroke="${TOKENS.ink}" stroke-width="5"/>
    <rect x="546" y="324" width="110" height="32" rx="16" fill="${TOKENS.bubbleYellow}" stroke="${TOKENS.ink}" stroke-width="5"/>
    <rect x="304" y="384" width="352" height="18" rx="9" fill="${TOKENS.lilac}"/>
    <rect x="304" y="422" width="286" height="18" rx="9" fill="${TOKENS.lilac}"/>
    <rect x="304" y="486" width="210" height="22" rx="11" fill="${TOKENS.blue}"/>
    <rect x="304" y="530" width="260" height="22" rx="11" fill="${TOKENS.success}"/>
    <rect x="304" y="574" width="180" height="22" rx="11" fill="${TOKENS.purple}"/>
    <rect x="304" y="642" width="144" height="44" rx="22" fill="${TOKENS.lilac}" stroke="${TOKENS.ink}" stroke-width="5"/>
  `;

  // Magnifying glass inspecting the verified area.
  const lx = 558 + Math.round((rand() - 0.5) * 10);
  const ly = 532 + Math.round((rand() - 0.5) * 10);
  const lens = `
    <line x1="${lx + 96}" y1="${ly + 96}" x2="${lx + 194}" y2="${ly + 194}" stroke="${TOKENS.ink}" stroke-width="34" stroke-linecap="round"/>
    <line x1="${lx + 96}" y1="${ly + 96}" x2="${lx + 194}" y2="${ly + 194}" stroke="${TOKENS.bubblePink}" stroke-width="18" stroke-linecap="round"/>
    <circle cx="${lx}" cy="${ly}" r="138" fill="${TOKENS.cream}" fill-opacity="0.92" stroke="${TOKENS.ink}" stroke-width="14"/>
    <circle cx="${lx}" cy="${ly}" r="106" fill="${TOKENS.lilac}" opacity="0.55"/>
    <circle cx="${lx}" cy="${ly}" r="70" fill="${TOKENS.success}" stroke="${TOKENS.ink}" stroke-width="8"/>
    <path d="M ${lx - 32} ${ly + 2} L ${lx - 8} ${ly + 28} L ${lx + 38} ${ly - 24}" fill="none" stroke="${TOKENS.cream}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M ${lx - 82} ${ly - 58} A 98 98 0 0 1 ${lx - 26} ${ly - 96}" fill="none" stroke="${TOKENS.cream}" stroke-width="10" stroke-linecap="round"/>
  `;

  return `${bg}
  ${card}
  ${lens}`;
}

const RENDERERS = {
  conceptos: renderConceptos,
  'redes-neuronales': renderRedesNeuronales,
  practicar: renderPracticar,
  'datos-reales': renderDatosReales,
  libros: renderLibros,
  canales: renderCanales,
  criterio: renderCriterio,
};

export function renderCategorySvg(id, { seed = DEFAULT_SEED } = {}) {
  const render = RENDERERS[id];
  if (!render) {
    throw new Error(`Unknown category id "${id}". Expected one of: ${CATEGORY_IDS.join(', ')}`);
  }
  const rand = mulberry32((seed ^ hashString(id)) >>> 0);
  const body = render(rand);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${body}
</svg>
`;
}

export async function generateBubbleImages({
  outDir = DEFAULT_OUT_DIR,
  seed = DEFAULT_SEED,
  ids = CATEGORY_IDS,
  clean = false,
} = {}) {
  await mkdir(outDir, { recursive: true });
  if (clean) {
    const expected = new Set(ids.map((id) => `${id}.webp`));
    const entries = await readdir(outDir);
    for (const entry of entries) {
      if (entry.endsWith('.webp') && !expected.has(entry)) {
        await unlink(path.join(outDir, entry));
      }
    }
  }

  const results = [];
  for (const id of ids) {
    const svg = renderCategorySvg(id, { seed });
    const file = path.join(outDir, `${id}.webp`);
    const info = await sharp(Buffer.from(svg))
      .resize(SIZE, SIZE)
      .webp({ quality: 86, effort: 6 })
      .toFile(file);
    results.push({ id, file, kb: Math.round(info.size / 1024) });
  }
  return results;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const results = await generateBubbleImages({ clean: true });
  for (const result of results) {
    console.log(`${path.relative(ROOT, result.file)}  ${result.kb} KB`);
  }
}
