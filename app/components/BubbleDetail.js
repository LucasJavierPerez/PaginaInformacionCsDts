// Inner bubble: the detail view of one resource category, drawn as HTML over the canvas.
// Render function (no SFC) so it can be unit tested with plain Vitest + jsdom.
//
// Focus moves to the heading on open and whenever the category changes; Escape and
// the back button emit `close`, prev / next emit `navigate` with the adjacent id.
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { KIND_LABELS } from '../data/content.js';
import { adjacentOffers, buildDetail, tintFor } from '../data/detail.js';

const external = (href, children, extra = {}) =>
  h('a', { href, target: '_blank', rel: 'noopener noreferrer', ...extra }, children);

const LEVEL_BADGE_CLASSES = {
  default: 'bg-lilac/80 text-ink',
  hard: 'bg-error/15 text-ink border border-error/30',
  mid: 'bg-success/20 text-ink',
};

function renderResourceItem(item) {
  return [
    h('h3', { class: 'text-base font-bold leading-snug' }, [
      external(
        item.url,
        [h('span', item.name), h('span', { class: 'ml-1.5 opacity-60', 'aria-hidden': 'true' }, '↗')],
        { class: 'detail-link', 'data-resource-link': '' },
      ),
    ]),
    item.description ? h('p', { class: 'mt-2 text-sm leading-snug' }, item.description) : null,
    item.host ? h('p', { class: 'mt-2 font-mono text-xs opacity-70 break-all' }, item.host) : null,
  ];
}

function renderBookItem(item) {
  const badgeClass = LEVEL_BADGE_CLASSES[item.levelTone] ?? LEVEL_BADGE_CLASSES.default;
  return [
    h('div', { class: 'flex flex-wrap items-center gap-2 text-xs font-medium' }, [
      item.publisherYear ? h('span', { class: 'font-mono opacity-75' }, item.publisherYear) : null,
      item.level ? h('span', { class: ['rounded-full px-2.5 py-0.5 uppercase tracking-wide', badgeClass] }, item.level) : null,
    ]),
    h('h3', { class: 'mt-2 text-lg font-bold leading-snug' }, item.title),
    item.author ? h('p', { class: 'mt-0.5 text-sm font-medium opacity-80' }, item.author) : null,
    h('p', { class: 'mt-2 text-sm leading-relaxed' }, item.description),
    item.note ? h('p', { class: 'mt-2 text-sm font-medium opacity-90' }, item.note) : null,
  ];
}

function renderGuidanceItem(item) {
  return [
    item.eyebrow ? h('h3', { class: 'text-xs font-bold tracking-wide uppercase opacity-75' }, item.eyebrow) : null,
    h(
      'div',
      { class: 'mt-2 space-y-3 text-base leading-relaxed' },
      item.paragraphs.map((paragraph, i) => h('p', { key: i }, paragraph)),
    ),
  ];
}

function renderItem(item, index, total) {
  const isWide = item.type === 'book' || item.type === 'guidance';
  const children =
    item.type === 'book'
      ? renderBookItem(item)
      : item.type === 'guidance'
        ? renderGuidanceItem(item)
        : renderResourceItem(item);

  return h(
    'li',
    {
      key: item.key,
      'data-detail-item': item.key,
      class: ['detail-item', { 'col-span-full': isWide }],
      style: { animationDelay: `${-((index * 1.7) % 7)}s`, zIndex: total - index },
    },
    children,
  );
}

export default defineComponent({
  name: 'BubbleDetail',
  props: {
    offer: { type: Object, required: true },
    reducedMotion: { type: Boolean, default: false },
    // The WebGL scene shows the opened bubble: no duplicate HTML illustration.
    sceneActive: { type: Boolean, default: false },
  },
  emits: ['close', 'navigate'],
  setup(props, { emit, slots }) {
    const heading = ref(null);
    const region = ref(null);

    const items = computed(() => buildDetail(props.offer));
    const adjacent = computed(() => adjacentOffers(props.offer.id));
    const tint = computed(() => tintFor(props.offer.id));

    const focusHeading = () => heading.value?.focus();

    const onKeydown = (event) => {
      if (event.key === 'Escape' && !event.defaultPrevented) emit('close');
    };

    onMounted(() => {
      document.addEventListener('keydown', onKeydown);
      focusHeading();
    });
    onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));

    watch(
      () => props.offer.id,
      async () => {
        await nextTick();
        if (region.value) region.value.scrollTop = 0;
        focusHeading();
      },
    );

    const navButton = (action, label, target) =>
      target &&
      h(
        'button',
        {
          type: 'button',
          'data-action': action,
          class: 'btn-pill flex-col !items-start gap-1 text-left',
          onClick: () => emit('navigate', target.id),
        },
        [h('span', { class: 'text-xs uppercase' }, label), h('span', { class: 'text-sm' }, target.title)],
      );

    return () => {
      const { offer } = props;
      const list = items.value;
      const stage = props.sceneActive
        ? h('div', { class: 'detail-stage', 'aria-hidden': 'true' })
        : h('div', { class: 'detail-stage' }, [
            h('div', { class: 'detail-orb' }, [
              h('img', {
                src: offer.image,
                alt: offer.imageAlt,
                width: 224,
                height: 224,
                class: 'h-full w-full rounded-full object-cover',
              }),
            ]),
          ]);
      return h(
        'section',
        {
          ref: region,
          'aria-labelledby': 'bubble-title',
          class: ['bubble-detail', { 'is-static': props.reducedMotion, 'has-scene': props.sceneActive }],
          style: { '--tint': tint.value },
        },
        h('div', { class: 'mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6' }, [
          h('div', { class: 'flex justify-start' }, [
            h(
              'button',
              { type: 'button', 'data-action': 'close', class: 'btn-pill', onClick: () => emit('close') },
              '← Volver a las burbujas',
            ),
          ]),
          slots.hint ? h('div', { class: 'mt-4' }, slots.hint()) : null,
          h('div', { class: 'detail-layout mt-6' }, [
            h('div', { class: 'detail-copy' }, [
              h('p', { class: 'bubble-label' }, KIND_LABELS[offer.kind] ?? ''),
              h(
                'h2',
                {
                  id: 'bubble-title',
                  ref: heading,
                  tabindex: '-1',
                  class: 'mt-4 text-4xl leading-none font-bold outline-none sm:text-5xl',
                },
                offer.title,
              ),
              h('p', { class: 'detail-summary mt-4 text-lg leading-snug' }, offer.summary),
              offer.note
                ? h(
                    'p',
                    {
                      'data-category-note': '',
                      class: 'detail-item mt-5 text-sm leading-snug',
                    },
                    offer.note,
                  )
                : null,
              offer.access
                ? h(
                    'p',
                    {
                      'data-category-access': '',
                      class: 'detail-item mt-5 text-sm leading-snug',
                    },
                    [
                      offer.access.textBefore,
                      external(offer.access.linkUrl, offer.access.linkLabel, { class: 'detail-link' }),
                      offer.access.textAfter,
                    ],
                  )
                : null,
              h(
                'ul',
                { class: 'detail-items mt-8', 'aria-label': `Recursos de ${offer.title}` },
                list.map((item, index) => renderItem(item, index, list.length)),
              ),
              offer.callout
                ? h(
                    'div',
                    {
                      'data-category-callout': '',
                      class: 'detail-item mt-6',
                    },
                    [
                      h('h3', { class: 'text-xs font-bold tracking-wide uppercase opacity-75' }, offer.callout.label),
                      h('p', { class: 'mt-1.5 text-sm leading-relaxed' }, [
                        offer.callout.textBefore,
                        external(offer.callout.linkUrl, offer.callout.linkLabel, { class: 'detail-link' }),
                        offer.callout.textAfter,
                      ]),
                    ],
                  )
                : null,
            ]),
            stage,
          ]),
          h('nav', { 'aria-label': 'Otras categorías', class: 'mt-10 flex flex-wrap justify-between gap-3' }, [
            navButton('prev', '← Anterior', adjacent.value.prev),
            navButton('next', 'Siguiente →', adjacent.value.next),
          ]),
        ]),
      );
    };
  },
});
