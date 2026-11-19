import { describe, it, expect, vi, afterEach } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import BubbleDetail from '../app/components/BubbleDetail.js';
import TutorialHint from '../app/components/TutorialHint.js';
import { offers, KIND_LABELS } from '../app/data/content.js';

let app;
let root;

function mount(component, props) {
  root = document.createElement('div');
  document.body.appendChild(root);
  app = createApp({ render: () => h(component, typeof props === 'function' ? props() : props) });
  app.mount(root);
  return root;
}

afterEach(() => {
  app?.unmount();
  root?.remove();
  app = null;
});

const conceptos = offers.find((offer) => offer.id === 'conceptos');
const libros = offers.find((offer) => offer.id === 'libros');
const canales = offers.find((offer) => offer.id === 'canales');
const criterio = offers.find((offer) => offer.id === 'criterio');

describe('BubbleDetail', () => {
  it('renders kind label, title, summary and illustration', () => {
    const el = mount(BubbleDetail, { offer: conceptos });
    expect(el.textContent).toContain(KIND_LABELS.sitios);
    expect(el.querySelector('h2').textContent).toBe(conceptos.title);
    expect(el.textContent).toContain(conceptos.summary);
    const img = el.querySelector('img');
    expect(img.getAttribute('src')).toBe(conceptos.image);
    expect(img.getAttribute('alt')).toBe(conceptos.imageAlt);
  });

  it('is a labelled region', () => {
    const el = mount(BubbleDetail, { offer: conceptos });
    const region = el.querySelector('section');
    const heading = el.querySelector('h2');
    expect(region.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('renders one external resource card per link with name, description and host', () => {
    const el = mount(BubbleDetail, { offer: conceptos });
    const items = el.querySelectorAll('[data-detail-item]');
    expect(items).toHaveLength(conceptos.resources.length);
    const links = [...el.querySelectorAll('[data-resource-link]')];
    expect(links).toHaveLength(conceptos.resources.length);
    links.forEach((a, i) => {
      expect(a.getAttribute('href')).toBe(conceptos.resources[i].url);
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.getAttribute('rel')).toContain('noopener');
      expect(a.textContent).toContain(conceptos.resources[i].name);
    });
    expect(items[0].textContent).toContain(conceptos.resources[0].description);
    expect(items[0].textContent).toContain(conceptos.resources[0].host);
  });

  it('renders books with author, publisherYear, level, Python 2.7 note and NotebookLM callout', () => {
    const el = mount(BubbleDetail, { offer: libros });
    const items = el.querySelectorAll('[data-detail-item]');
    expect(items).toHaveLength(3);
    expect(el.textContent).toContain('Joel Grus');
    expect(el.textContent).toContain("O'Reilly · 2015");
    expect(el.textContent).toContain('Intermedio');
    expect(el.textContent).toContain('Python 2.7');
    const callout = el.querySelector('[data-category-callout]');
    expect(callout).not.toBeNull();
    const nlm = callout.querySelector('a');
    expect(nlm.getAttribute('href')).toBe('https://notebooklm.google.com');
    expect(nlm.getAttribute('target')).toBe('_blank');
    expect(nlm.getAttribute('rel')).toContain('noopener');
  });

  it('renders the English/subtitles note on canales and clickbait examples on criterio', () => {
    const canalesEl = mount(BubbleDetail, { offer: canales });
    expect(canalesEl.querySelector('[data-category-note]').textContent).toContain(
      'subtítulos automáticos en español',
    );
    app.unmount();
    root.remove();

    const criterioEl = mount(BubbleDetail, { offer: criterio });
    expect(criterioEl.textContent).toContain('esto DESTRUYE a');
    expect(criterioEl.textContent).toContain('se viene el fin de');
    expect(criterioEl.textContent).toContain('salió esto y cambia todo');
  });

  it('contains no admission CTA copy or WhatsApp links', () => {
    const el = mount(BubbleDetail, { offer: conceptos });
    expect(el.querySelector('[data-cta="primary"]')).toBeNull();
    expect(el.textContent).not.toMatch(/Quiero \+ Info|WhatsApp|inscripci[oó]n/i);
  });

  it('closes with the back button and with Escape', async () => {
    const onClose = vi.fn();
    const el = mount(BubbleDetail, { offer: conceptos, onClose });
    el.querySelector('[data-action="close"]').click();
    expect(onClose).toHaveBeenCalledTimes(1);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('stops listening for Escape once unmounted', () => {
    const onClose = vi.fn();
    mount(BubbleDetail, { offer: conceptos, onClose });
    app.unmount();
    app = null;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('navigates to the previous and next categories with wrap-around', () => {
    const onNavigate = vi.fn();
    const el = mount(BubbleDetail, { offer: offers[0], onNavigate });
    const prev = el.querySelector('[data-action="prev"]');
    const next = el.querySelector('[data-action="next"]');
    expect(prev.textContent).toContain(offers[offers.length - 1].title);
    prev.click();
    next.click();
    expect(onNavigate).toHaveBeenNthCalledWith(1, offers[offers.length - 1].id);
    expect(onNavigate).toHaveBeenNthCalledWith(2, offers[1].id);
  });

  it('moves focus to the heading on open and when the category changes', async () => {
    const current = ref(offers[0]);
    const el = mount(BubbleDetail, () => ({ offer: current.value }));
    await nextTick();
    expect(document.activeElement).toBe(el.querySelector('h2'));
    el.querySelector('[data-action="close"]').focus();
    current.value = offers[1];
    await nextTick();
    await nextTick();
    expect(document.activeElement).toBe(el.querySelector('h2'));
    expect(el.querySelector('h2').textContent).toBe(offers[1].title);
  });
});

describe('TutorialHint', () => {
  it('shows the message and emits dismiss', () => {
    const onDismiss = vi.fn();
    const el = mount(TutorialHint, { message: 'Arrastrá para explorar', onDismiss });
    expect(el.textContent).toContain('Arrastrá para explorar');
    el.querySelector('button').click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('announces politely', () => {
    const el = mount(TutorialHint, { message: 'Hola' });
    expect(el.querySelector('[role="status"]')).not.toBeNull();
  });
});

describe('BubbleDetail composition (T7 fixes)', () => {
  it('drops the HTML illustration when the 3D bubble is on screen', () => {
    const el = mount(BubbleDetail, { offer: conceptos, sceneActive: true });
    expect(el.querySelector('.detail-orb')).toBeNull();
    expect(el.querySelector('.bubble-detail').classList.contains('has-scene')).toBe(true);
  });

  it('keeps the HTML illustration in static mode', () => {
    const el = mount(BubbleDetail, { offer: conceptos, sceneActive: false });
    expect(el.querySelector('.detail-orb img').getAttribute('src')).toBe(conceptos.image);
  });

  it('renders the hint slot right after the back button, before the title', () => {
    root = document.createElement('div');
    document.body.appendChild(root);
    app = createApp({
      render: () => h(BubbleDetail, { offer: conceptos }, { hint: () => h('p', { 'data-hint': '' }, 'Tip') }),
    });
    app.mount(root);
    const hint = root.querySelector('[data-hint]');
    const close = root.querySelector('[data-action="close"]');
    const title = root.querySelector('#bubble-title');
    expect(close.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hint.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
