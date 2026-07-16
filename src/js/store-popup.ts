const OPEN_SELECTOR = '[data-store-open]';
const CLOSE_SELECTOR = '[data-store-close]';
const OPEN_CLASS = 'is-open';
const BODY_LOCK_CLASS = 'is-store-popup-open';

let activePopup: HTMLElement | null = null;
let lastFocus: HTMLElement | null = null;

function getPopup(store: string): HTMLElement | null {
  return document.querySelector(`[data-store-popup="${store}"]`);
}

function getFocusable(popup: HTMLElement): HTMLElement[] {
  return Array.from(
    popup.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function openPopup(store: string): void {
  const popup = getPopup(store);
  if (!popup || popup === activePopup) return;

  if (activePopup) {
    closePopup({ restoreFocus: false });
  }

  lastFocus = document.activeElement as HTMLElement | null;
  activePopup = popup;
  popup.classList.add(OPEN_CLASS);
  popup.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add(BODY_LOCK_CLASS);

  const closeButton = popup.querySelector<HTMLElement>(CLOSE_SELECTOR);
  closeButton?.focus();
}

function closePopup(options: { restoreFocus?: boolean } = {}): void {
  const { restoreFocus = true } = options;
  if (!activePopup) return;

  activePopup.classList.remove(OPEN_CLASS);
  activePopup.setAttribute('aria-hidden', 'true');
  document.documentElement.classList.remove(BODY_LOCK_CLASS);

  if (restoreFocus) {
    lastFocus?.focus();
  }

  activePopup = null;
  lastFocus = null;
}

function onDocumentClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const openTrigger = target.closest<HTMLElement>(OPEN_SELECTOR);
  if (openTrigger) {
    const store = openTrigger.dataset.storeOpen;
    if (store) {
      event.preventDefault();
      openPopup(store);
    }
    return;
  }

  if (target.closest(CLOSE_SELECTOR)) {
    closePopup();
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (!activePopup) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closePopup();
    return;
  }

  if (event.key !== 'Tab') return;

  const focusable = getFocusable(activePopup);
  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function initStorePopup(): void {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
}
