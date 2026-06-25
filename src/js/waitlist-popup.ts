type PopupView = 'form' | 'done';

import { submitWaitlistEmail } from './waitlist-submit';

const POPUP_ID = 'waitlist-popup';
const FORM_ID = 'waitlist-form';
const DONE_AUTO_CLOSE_MS = 5_000;
const OPEN_SELECTOR = '[data-waitlist-open]';
const CLOSE_SELECTOR = '[data-popup-close]';
const VIEW_SELECTOR = '[data-popup-view]';
const SUBMIT_LABEL_SELECTOR = '.popup__submit-label';
const ERROR_SELECTOR = '.popup__error';
const DIALOG_SELECTOR = '.popup__dialog';
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

let doneAutoCloseTimer: ReturnType<typeof setTimeout> | null = null;
let lastTrigger: HTMLElement | null = null;
let focusTrapHandler: ((event: KeyboardEvent) => void) | null = null;

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => {
    if (element.hasAttribute('hidden')) return false;

    return element.getClientRects().length > 0;
  });
}

function trapFocusInDialog(event: KeyboardEvent): void {
  const popup = getPopup();
  const dialog = popup?.querySelector<HTMLElement>(DIALOG_SELECTOR);
  if (!dialog || event.key !== 'Tab') return;

  const focusable = getFocusableElements(dialog);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function enableFocusTrap(): void {
  if (focusTrapHandler) return;

  focusTrapHandler = trapFocusInDialog;
  document.addEventListener('keydown', focusTrapHandler);
}

function disableFocusTrap(): void {
  if (!focusTrapHandler) return;

  document.removeEventListener('keydown', focusTrapHandler);
  focusTrapHandler = null;
}

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
  const dialog = popup.querySelector<HTMLElement>('.popup__dialog');

  getViews(popup).forEach((panel) => {
    const isActive = panel.dataset.popupView === view;
    panel.hidden = !isActive;
  });

  dialog?.setAttribute(
    'aria-labelledby',
    view === 'done' ? 'waitlist-popup-done-title' : 'waitlist-popup-title',
  );
}

function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

function lockBodyScroll(): void {
  document.documentElement.style.setProperty(
    '--scrollbar-width',
    `${getScrollbarWidth()}px`,
  );
  document.documentElement.classList.add('is-popup-open');
}

function unlockBodyScroll(): void {
  document.documentElement.classList.remove('is-popup-open');
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
    lastTrigger = trigger;
  }

  const emailInput = popup.querySelector<HTMLInputElement>('.popup__input');
  emailInput?.focus();
  enableFocusTrap();
}

function clearFormError(form: HTMLFormElement): void {
  const error = form.querySelector<HTMLElement>(ERROR_SELECTOR);
  if (!error) return;

  error.hidden = true;
  error.textContent = '';
}

function showFormError(form: HTMLFormElement, message: string): void {
  const error = form.querySelector<HTMLElement>(ERROR_SELECTOR);
  if (!error) return;

  error.hidden = false;
  error.textContent = message;
}

function setFormSubmitting(form: HTMLFormElement, isSubmitting: boolean): void {
  const submitButton = form.querySelector<HTMLButtonElement>(
    'button[type="submit"]',
  );
  const submitLabel = form.querySelector<HTMLElement>(SUBMIT_LABEL_SELECTOR);

  if (!submitButton || !submitLabel) return;

  submitButton.disabled = isSubmitting;
  submitLabel.textContent = isSubmitting
    ? 'Submitting...'
    : 'Join the waitlist';
}

function closePopup(): void {
  const popup = getPopup();
  if (!popup) return;

  clearDoneAutoCloseTimer();
  disableFocusTrap();
  popup.classList.remove('is-open');
  popup.setAttribute('aria-hidden', 'true');
  unlockBodyScroll();

  const form = document.getElementById(FORM_ID) as HTMLFormElement | null;
  if (form) {
    clearFormError(form);
    setFormSubmitting(form, false);
    form.reset();
  }
  setView(popup, 'form');

  const trigger = lastTrigger;
  lastTrigger = null;

  requestAnimationFrame(() => {
    trigger?.focus({ preventScroll: true });
  });
}

async function handleFormSubmit(event: SubmitEvent): Promise<void> {
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

  clearFormError(form);
  setFormSubmitting(form, true);

  try {
    await submitWaitlistEmail(emailInput.value.trim());
    setView(popup, 'done');
    scheduleDoneAutoClose();

    const doneButton = popup.querySelector<HTMLButtonElement>(
      '[data-popup-view="done"] .btn-cta',
    );
    doneButton?.focus();
  } catch {
    showFormError(
      form,
      'Something went wrong. Please try again in a moment.',
    );
  } finally {
    setFormSubmitting(form, false);
  }
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
    element.addEventListener('click', (event) => {
      event.preventDefault();
      closePopup();
    });
  });

  const form = document.getElementById(FORM_ID);
  form?.addEventListener('submit', handleFormSubmit);
  document.addEventListener('keydown', handleKeydown);
}
