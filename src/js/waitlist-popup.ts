type PopupView = 'form' | 'done';

const POPUP_ID = 'waitlist-popup';
const FORM_ID = 'waitlist-form';
const DONE_AUTO_CLOSE_MS = 5_000;
const OPEN_SELECTOR = '[data-waitlist-open]';
const CLOSE_SELECTOR = '[data-popup-close]';
const VIEW_SELECTOR = '[data-popup-view]';

let doneAutoCloseTimer: ReturnType<typeof setTimeout> | null = null;

function clearDoneAutoCloseTimer(): void {
  if (doneAutoCloseTimer === null) return;

  clearTimeout(doneAutoCloseTimer);
  doneAutoCloseTimer = null;
}

function scheduleDoneAutoClose(): void {
  clearDoneAutoCloseTimer();

  doneAutoCloseTimer = setTimeout(() => {
    doneAutoCloseTimer = null;
    closePopup();
  }, DONE_AUTO_CLOSE_MS);
}

function getPopup(): HTMLElement | null {
  return document.getElementById(POPUP_ID);
}

function getViews(popup: HTMLElement): NodeListOf<HTMLElement> {
  return popup.querySelectorAll<HTMLElement>(VIEW_SELECTOR);
}

function setView(popup: HTMLElement, view: PopupView): void {
  getViews(popup).forEach((panel) => {
    const isActive = panel.dataset.popupView === view;
    panel.hidden = !isActive;
  });
}

function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

function lockBodyScroll(): void {
  document.documentElement.style.setProperty(
    '--scrollbar-width',
    `${getScrollbarWidth()}px`,
  );
  document.body.classList.add('is-popup-open');
}

function unlockBodyScroll(): void {
  document.body.classList.remove('is-popup-open');
  document.documentElement.style.removeProperty('--scrollbar-width');
}

function openPopup(trigger?: HTMLElement | null): void {
  const popup = getPopup();
  if (!popup) return;

  clearDoneAutoCloseTimer();
  popup.classList.add('is-open');
  popup.setAttribute('aria-hidden', 'false');
  lockBodyScroll();
  setView(popup, 'form');

  if (trigger) {
    popup.dataset.lastTrigger = trigger.id || 'waitlist-trigger';
    if (!trigger.id) {
      trigger.id = popup.dataset.lastTrigger;
    }
  }

  const emailInput = popup.querySelector<HTMLInputElement>('.popup__input');
  emailInput?.focus();
}

function closePopup(): void {
  const popup = getPopup();
  if (!popup) return;

  clearDoneAutoCloseTimer();
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden', 'true');
  unlockBodyScroll();

  const form = document.getElementById(FORM_ID) as HTMLFormElement | null;
  form?.reset();
  setView(popup, 'form');

  const triggerId = popup.dataset.lastTrigger;
  if (triggerId) {
    document.getElementById(triggerId)?.focus();
  }
}

function handleFormSubmit(event: SubmitEvent): void {
  event.preventDefault();

  const form = event.currentTarget as HTMLFormElement;
  const emailInput = form.querySelector<HTMLInputElement>(
    'input[type="email"]',
  );

  if (!emailInput?.value.trim() || !emailInput.checkValidity()) {
    emailInput?.focus();
    emailInput?.reportValidity();
    return;
  }

  const popup = getPopup();
  if (!popup) return;

  setView(popup, 'done');
  scheduleDoneAutoClose();
}

function handleKeydown(event: KeyboardEvent): void {
  const popup = getPopup();
  if (!popup?.classList.contains('is-open')) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    closePopup();
  }
}

export function initWaitlistPopup(): void {
  const popup = getPopup();
  if (!popup) return;

  document.querySelectorAll<HTMLElement>(OPEN_SELECTOR).forEach((trigger) => {
    trigger.addEventListener('click', () => openPopup(trigger));
  });

  popup.querySelectorAll<HTMLElement>(CLOSE_SELECTOR).forEach((element) => {
    element.addEventListener('click', closePopup);
  });

  const form = document.getElementById(FORM_ID);
  form?.addEventListener('submit', handleFormSubmit);
  document.addEventListener('keydown', handleKeydown);
}
