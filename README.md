# Recursos de Datos e IA

Resources site from the coordination of Ciencia de Datos e Inteligencia Artificial (iTec Río Cuarto):
every resource category is a bubble on a floating island. Built on the ItecBulles landing.
Content source: `docs/reference/recursos-v1.html`. Visual and technical reference:
`docs/referencia/bulles-teardown.md` (Projet Bulles). Task log: `odd/tasks/recursos-bulles.md`.

## Run

```bash
npm install      # also runs `nuxt prepare`
npm run dev      # Nuxt dev server
npm test         # Vitest (jsdom), content model + UI store
npm run build    # static site in .output/public (nuxt generate)
npm run preview  # serve the build
```

## Stack

Nuxt 4 + Vue 3, Pinia, Tailwind CSS v4, three.js, GSAP, Howler.js, Vitest. Same stack as Projet Bulles,
minus the CMS: content lives in a local file.

**SPA mode (`ssr: false`).** The experience is a client-only WebGL canvas with an HTML layer on top, so
server rendering adds nothing. `nuxt generate` still produces a static site that any static host can serve.

## Structure

- `app/data/content.js` — content model: 7 resource categories (`offers`), each with its resources and URLs. Resources come from the reference page only; book files are never linked.
- `app/stores/ui.js` — UI state machine: `home → intro → overworld ⇄ bubble`. Invalid transitions are no-ops; reduced motion skips the intro.
- `app/app.vue` — app shell; one section per step (the 3D scene arrives in later tasks).
- `app/assets/css/main.css` — Tailwind v4 tokens (`@theme`): Bulles palette, sky gradient, easings, `btn-pill`.
- `tests/` — Vitest specs.

## Island centerpiece

The middle of the floating island shows the circuit tree by default, which fits a data
and AI site. The other prototypes can still be swapped in with the URL query `?centro=`;
the centerpiece turns with the island while browsing the bubbles.

| Value | Centerpiece |
|-------|-------------|
| `edificio` | "Edificio iTec": the real building front (stone facade, green metal band, window ribbon, sign, "iTec" letters, glass door, "783"), modelled on the official admission photo. It does not idle-spin, so at rest the facade faces the camera. |
| `arbol` | The original pink low-poly tree. |
| `circuitos` (default) | "Árbol de circuitos": a tree of right-angle circuit traces on a chip, ending in pulsing glowing nodes. |
| `isotipo` | "La i de iTec": the logo's "i" with a red dot and five career icons orbiting it. |

Unknown values fall back to `circuitos`. On the home screen the camera frames the
centerpiece low, under the hero copy (per-aspect `HOME` / `INTRO_HOME` in
`app/scene/cameraStates.js`). Code: `app/scene/centerpieces/` (one module per
centerpiece, each `create()` → `{ object3D, update(elapsed, delta), dispose() }`).

## Bubble images

Each bubble displays an abstract, text-free illustration generated deterministically from SVG and rasterized
with `sharp` to `public/bubbles/<id>.webp` (1024×1024, byte-identical on re-run):

- `scripts/bubble-images.mjs` — uses a seeded PRNG (`mulberry32`) and the `@theme` / bubble palette
  (`app/assets/css/main.css`, `app/scene/bubbles/colors.js`) to render one topic motif inside the central
  safe circle for each category (`conceptos`, `redes-neuronales`, `practicar`, `datos-reales`, `libros`,
  `canales`, `criterio`), with no text, logos, or external photo dependencies.

```bash
npm run bubble-images                                # regenerate public/bubbles/*.webp
node scripts/contact-sheet.mjs /tmp/contact-sheet.png  # review all images masked in circles
```

## Sound

The sounds in `public/sounds/` are original and synthesized by `scripts/sounds.mjs` (no downloads, no
dependencies; deterministic, 16-bit mono WAV at 22050 Hz, ~590 KB in total): a seamless 10 s pad loop,
three hover "blops", two click pops with shimmer, a whoosh for the transition and a soft close.

```sh
npm run sounds   # regenerate public/sounds/*.wav
```

`app/audio/soundManager.js` imports howler and creates the Howls only after the first user gesture, rotates
variants per action, mutes globally (persisted in localStorage) and fades the ambience out while the tab is
hidden. `app/audio/connectSound.js` maps scene events and store changes to sounds.

Volume: the "Sonido" pill (top-right) opens a small panel with a "Volumen" slider (0–100 %, steps of 5,
arrow keys work) and a separate mute button. Tap or click toggles the panel, a mouse hover previews it,
Escape or a click elsewhere closes it. On phones the panel sits on the same row, left of the pill; from
640 px it sits right under the settings row, so it never covers the headings. The slider sets a master
volume (default 70 %) through `Howler.volume()`, on top of each sound's own volume, so the ambience fades
keep their per-sound targets. It is stored in the ui store (`volume`, `setVolume`), persisted under
`itec-bulles:volume` and applied as soon as howler loads (also when changed before the first gesture).
Volume 0 shows as muted, moving the slider up unmutes, and unmuting at 0 restores the default 70 %.
