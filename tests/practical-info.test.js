import { describe, it, expect, afterEach } from 'vitest';
import { createApp, h } from 'vue';
import PracticalInfo from '../app/components/PracticalInfo.js';
import { coordination, links } from '../app/data/content.js';

let app;
let root;

function mount(props = {}) {
  root = document.createElement('div');
  document.body.appendChild(root);
  app = createApp({ render: () => h(PracticalInfo, props) });
  app.mount(root);
  return root;
}

const hrefs = (el) => [...el.querySelectorAll('a')].map((a) => a.getAttribute('href'));

afterEach(() => {
  app?.unmount();
  root?.remove();
});

describe('PracticalInfo', () => {
  it('is a labelled footer region', () => {
    const el = mount();
    const footer = el.querySelector('footer');
    expect(footer).not.toBeNull();
    expect(el.querySelector('h2').textContent).toBe('Cómo usar esta página');
  });

  it('always shows coordination name and official iTec site link in the bar', () => {
    const el = mount({ expanded: false });
    const text = el.querySelector('.practical-info__bar').textContent;
    expect(text).toContain(coordination.name);
    expect(hrefs(el)).toContain(links.officialSite);
  });

  it('shows guidance columns and no admission/login copy when expanded', () => {
    const el = mount({ expanded: true });
    const text = el.textContent;
    expect(text).toContain('Todo es gratuito, salvo que se indique lo contrario.');
    expect(text).toContain(coordination.footer);
    expect(el.querySelector('input, form')).toBeNull();
    expect(text).not.toMatch(/ingreso|inscripci[oó]n|WhatsApp|iniciar sesi[oó]n/i);
  });

  it('keeps the guide panel in the DOM but hidden when collapsed, and toggles', () => {
    let expanded = false;
    const el = mount({
      get expanded() {
        return expanded;
      },
      'onUpdate:expanded': (v) => (expanded = v),
    });
    const toggle = el.querySelector('button[aria-controls]');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    const panel = el.querySelector(`#${toggle.getAttribute('aria-controls')}`);
    expect(panel.hidden).toBe(true);
    toggle.click();
    expect(expanded).toBe(true);
  });
});
