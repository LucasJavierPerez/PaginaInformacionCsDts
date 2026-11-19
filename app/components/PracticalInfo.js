// Persistent guide footer: introduces the DS & AI career coordination,
// states how to browse the page, and links to the official iTec site.
// The parent opens the drawer by default only on the desktop home screen
// (see data/layout.js). Its rendered height is published as the
// `--practical-info-height` CSS variable so the UI above can keep clear of it.
import { defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue';
import { coordination, links } from '../data/content.js';

const PANEL_ID = 'practical-info-panel';

const link = (href, text, external = false) =>
  h(
    'a',
    {
      href,
      class: 'practical-info__link',
      ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
    },
    text,
  );

export default defineComponent({
  name: 'PracticalInfo',
  props: {
    expanded: { type: Boolean, default: false },
  },
  emits: ['update:expanded'],
  setup(props, { emit }) {
    const footer = ref(null);
    let observer = null;
    const publishHeight = () => {
      const height = footer.value?.offsetHeight ?? 0;
      document.documentElement.style.setProperty('--practical-info-height', `${height}px`);
    };
    onMounted(() => {
      publishHeight();
      if (typeof ResizeObserver === 'function' && footer.value) {
        observer = new ResizeObserver(publishHeight);
        observer.observe(footer.value);
      }
    });
    onBeforeUnmount(() => {
      observer?.disconnect();
      document.documentElement.style.removeProperty('--practical-info-height');
    });

    const column = (title, children) =>
      h('div', { class: 'practical-info__column' }, [h('h3', { class: 'practical-info__subtitle' }, title), ...children]);

    return () =>
      h('footer', { ref: footer, class: 'practical-info', 'aria-labelledby': 'practical-info-title' }, [
        h(
          'div',
          {
            id: PANEL_ID,
            class: 'practical-info__panel',
            hidden: !props.expanded,
          },
          [
            column('Qué vas a encontrar', [
              h('p', 'Páginas, libros y canales que recomendamos para seguir aprendiendo fuera de clase.'),
            ]),
            column('Acceso', [h('p', 'Todo es gratuito, salvo que se indique lo contrario.')]),
            column('Cómo usar esta página', [
              h('p', 'Cada burbuja agrupa una categoría de recursos. Entrá para abrir los enlaces o consultar los libros.'),
            ]),
            column('Coordinación', [
              h('p', coordination.footer),
              h('p', { class: 'mt-1' }, [link(links.officialSite, 'Sitio oficial del iTec', true)]),
            ]),
          ],
        ),
        h('div', { class: 'practical-info__bar' }, [
          h(
            'h2',
            { id: 'practical-info-title', class: 'practical-info__title max-md:sr-only' },
            'Cómo usar esta página',
          ),
          h('p', { class: 'practical-info__contacts' }, [
            h('span', coordination.name),
            h('span', { class: 'max-md:sr-only' }, 'Todo es gratuito, salvo que se indique lo contrario.'),
            h('span', [link(links.officialSite, 'Sitio del iTec', true)]),
          ]),
          h(
            'button',
            {
              type: 'button',
              class: 'btn-pill settings-pill',
              'aria-expanded': String(props.expanded),
              'aria-controls': PANEL_ID,
              onClick: () => emit('update:expanded', !props.expanded),
            },
            [
              h(
                'span',
                { class: 'max-md:sr-only' },
                props.expanded ? 'Ocultar guía' : 'Sobre esta guía',
              ),
              h('span', { class: 'md:hidden', 'aria-hidden': 'true' }, props.expanded ? 'Ocultar' : 'Guía'),
            ],
          ),
        ]),
      ]);
  },
});
