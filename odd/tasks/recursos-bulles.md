# Feature: recursos-bulles

## Objective
Turn the ItecBulles immersive landing (3D floating island, one bubble per item) into a
resources site from the career coordination of Ciencia de Datos e IA (iTec Río Cuarto):
each bubble is a resource category; opening it shows its links, books or channels.

## Problem / Why
The coordinator wants students to have one attractive, shared place with recommended
DS/AI resources. The plain page (docs/reference/recursos-v1.html) has the content;
the user asked for the ItecBulles experience instead.

## Scope
- Content: replace the 11 educational offers with 7 resource categories (content source:
  `docs/reference/recursos-v1.html`, copy is final, Spanish).
- UI copy: hero, detail panel, practical-info area, page title/description.
- Bubble images: no photos exist, so generate deterministic artwork per category.
- Keep: island, intro, sound, reduced-motion static grid, accessibility, tests.
- Out of scope: forum, hosting/deploy, GitHub remote (user decisions).

## Constraints
- Book files (PDF/EPUB) are copyrighted: never host or link them.
- NotebookLM URL is https://notebooklm.google.com.
- Never invent resources, URLs or facts beyond the reference page.
- UI copy in Spanish (student-facing); code, comments, tests, commits in English.
- Workers: Gemini 4 Hydrogen via Antigravity (user request); Opus orchestrates.

## Category ids (shared contract)
| id | title |
|----|-------|
| `conceptos` | Conceptos en acción (6 sites) |
| `redes-neuronales` | Redes neuronales (3 sites) |
| `practicar` | Practicar y copiar ejemplos (4 sites) |
| `datos-reales` | Datos reales (1 site) |
| `libros` | Libros para el verano (3 books + NotebookLM tip) |
| `canales` | Canales de YouTube (4 channels + subtitles note) |
| `criterio` | Cómo elegir fuentes (anti-sensationalism note) |

## Tasks
- [x] T1 Bootstrap new repo from ItecBulles, install, baseline tests. Route: inline (mechanical). Evidence: commit 777d89d, vitest 22 files / 244 tests passed.
- [x] T2 Content model + detail panel + UI copy + tests for the 7 categories. Route: delegated (Gemini, writer trigger: 2+ non-trivial files). Risk: medium. Evidence: commit c2dc765; writer: content test RED 6 failed then GREEN, vitest 240 passed, nuxt prepare ok; parent spot check: full suite 240 passed, every resource URL of the reference page present in content.js.
- [x] T3 Generative bubble artwork per category id (`public/bubbles/<id>.webp`). Route: delegated (Gemini, parallel, disjoint files: scripts/, public/bubbles/, assets/photos/, tests/bubble-images.test.js). Risk: medium. Evidence: commit 51aa9ae; writer: bubble-images tests 7/7, re-run byte-identical; parent spot check: tests 7/7 re-run, contact sheet inspected (7 readable, text-free illustrations).
- [x] T4 Centerpiece default to fit the subject + README rewrite. Route: inline (two small files). Risk: medium. Evidence: centerpieces test RED (2 failed) then GREEN; full suite 22 files / 240 tests passed.
- [ ] T5 Build (`npm run build`) and visual check of home, overworld, one bubble, static grid. Route: delegated verification.

## Acceptance criteria
- 7 bubbles, ids above, every resource from the reference page present with its URL.
- `npx vitest run` green; `npm run build` succeeds.
- No ItecBulles admission copy left (ingreso, inscripción, carreras, contact form) in UI.

## Delivery
Strategy: ask-on-risk. Forecast > 400 authored lines (content + tests). Local commits only;
push / remote repo / deploy are user decisions.

## Progress
- T1-T4 done. Next: T5 build + visual check.
