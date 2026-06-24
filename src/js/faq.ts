const SECTION_SELECTOR = '.faq';
const ITEM_SELECTOR = '.faq__item';
const TRIGGER_SELECTOR = '.faq__item-trigger';
const PANEL_SELECTOR = '.faq__item-panel';

function openItem(item: HTMLElement): void {
  const trigger = item.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR);
  const panel = item.querySelector<HTMLElement>(PANEL_SELECTOR);

  item.classList.add('is-active');
  trigger?.setAttribute('aria-expanded', 'true');
  panel?.setAttribute('aria-hidden', 'false');
}

function closeItem(item: HTMLElement): void {
  const trigger = item.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR);
  const panel = item.querySelector<HTMLElement>(PANEL_SELECTOR);

  item.classList.remove('is-active');
  trigger?.setAttribute('aria-expanded', 'false');
  panel?.setAttribute('aria-hidden', 'true');
}

export function initFaq(): void {
  const section = document.querySelector<HTMLElement>(SECTION_SELECTOR);
  if (!section) return;

  const items = Array.from(
    section.querySelectorAll<HTMLElement>(ITEM_SELECTOR),
  );

  items.forEach((item) => {
    const trigger = item.querySelector<HTMLButtonElement>(TRIGGER_SELECTOR);
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isExpanded = item.classList.contains('is-active');

      items.forEach((otherItem) => {
        if (otherItem !== item) {
          closeItem(otherItem);
        }
      });

      if (isExpanded) {
        closeItem(item);
        return;
      }

      openItem(item);
    });
  });
}
