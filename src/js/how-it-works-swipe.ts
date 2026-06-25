const SWIPE_ROOT_SELECTOR = '[data-how-it-works-swipe]';
const PHONE_SELECTOR = '[data-swipe-phone]';
const CARD_SELECTOR = '[data-swipe-card]';
const MOBILE_SWIPE_CLASS = 'how-it-works__swipe--mobile';

const PHONE_IDLE_MS = 300;
const PHONE_TRANSITION_MS = 900;
const CARD_ENTER_MS = 280;
const CARD_IDLE_MS = 750;
const SWIPE_MS = 650;
const FINAL_PHONE_IDLE_MS = 2200;

const PHONES = [
  '/images/phone-1.png',
  '/images/phone-2.png',
  '/images/phone-3.png',
  '/images/phone-4.png',
  '/images/phone-5.png',
] as const;

const SWIPES = [
  { card: '/images/card-1.png', direction: 'right' },
  { card: '/images/card-2.png', direction: 'left' },
  { card: '/images/card-3.png', direction: 'left' },
  { card: '/images/Question%20Crd.png', direction: 'right' },
] as const;

type SwipeDirection = (typeof SWIPES)[number]['direction'];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getPhones(root: HTMLElement): HTMLImageElement[] {
  return Array.from(root.querySelectorAll<HTMLImageElement>(PHONE_SELECTOR));
}

function setActivePhone(
  phones: HTMLImageElement[],
  index: number,
): Promise<void> {
  const currentIndex = phones.findIndex((phone) =>
    phone.classList.contains('is-active'),
  );
  const nextPhone = phones[index];
  const currentPhone = currentIndex >= 0 ? phones[currentIndex] : null;

  if (!nextPhone || currentIndex === index) {
    return Promise.resolve();
  }

  nextPhone.hidden = false;
  nextPhone.classList.remove('is-exiting');
  nextPhone.classList.add('is-active');

  if (currentPhone) {
    currentPhone.classList.remove('is-active');
    currentPhone.classList.add('is-exiting');
  }

  return wait(PHONE_TRANSITION_MS).then(() => {
    if (currentPhone) {
      currentPhone.classList.remove('is-exiting');
      currentPhone.hidden = true;
    }
  });
}

function resetCard(card: HTMLImageElement): void {
  card.classList.remove(
    'is-visible',
    'is-swiping-left',
    'is-swiping-right',
    'is-entering',
    'is-direction-left',
    'is-direction-right',
  );
  card.hidden = true;
  card.removeAttribute('src');
}

function resetPhones(phones: HTMLImageElement[]): void {
  phones.forEach((phone, phoneIndex) => {
    phone.classList.remove('is-exiting');
    phone.classList.toggle('is-active', phoneIndex === 0);
    phone.hidden = phoneIndex !== 0;
  });
}

async function showCard(
  card: HTMLImageElement,
  src: string,
  direction: SwipeDirection,
): Promise<void> {
  card.classList.remove('is-direction-left', 'is-direction-right');
  card.classList.add(
    direction === 'left' ? 'is-direction-left' : 'is-direction-right',
  );
  card.src = src;
  card.hidden = false;
  card.classList.add('is-entering');

  await wait(30);

  card.classList.add('is-visible');
  card.classList.remove('is-entering');
  await wait(CARD_ENTER_MS);
}

async function swipeCard(
  card: HTMLImageElement,
  direction: SwipeDirection,
): Promise<void> {
  card.classList.add(
    direction === 'left' ? 'is-swiping-left' : 'is-swiping-right',
  );
  await wait(SWIPE_MS);
  resetCard(card);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initSwipeInstance(root: HTMLElement): void {
  let runId = 0;
  let isRunning = false;

  const stop = (): void => {
    isRunning = false;
    runId += 1;

    const phones = getPhones(root);
    const card = root.querySelector<HTMLImageElement>(CARD_SELECTOR);

    resetPhones(phones);

    if (card) {
      resetCard(card);
    }
  };

  const start = (): void => {
    if (prefersReducedMotion()) return;

    const phones = getPhones(root);
    const card = root.querySelector<HTMLImageElement>(CARD_SELECTOR);

    if (!phones.length || !card || phones.length !== PHONES.length) return;

    isRunning = true;
    const currentRunId = ++runId;

    const runLoop = async (): Promise<void> => {
      while (isRunning && currentRunId === runId) {
        for (let index = 0; index < PHONES.length; index += 1) {
          if (!isRunning || currentRunId !== runId) return;

          await setActivePhone(phones, index);
          await wait(PHONE_IDLE_MS);

          const swipe = SWIPES[index];
          if (!swipe) {
            await wait(FINAL_PHONE_IDLE_MS);
            continue;
          }

          await showCard(card, swipe.card, swipe.direction);
          await wait(CARD_IDLE_MS);
          await swipeCard(card, swipe.direction);
        }
      }
    };

    void runLoop();
  };

  const restart = (): void => {
    stop();
    start();
  };

  if (root.classList.contains(MOBILE_SWIPE_CLASS)) {
    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting);

        if (isVisible) {
          restart();
          return;
        }

        stop();
      },
      { threshold: 0.35 },
    );

    observer.observe(root);
    return;
  }

  const panel = root.closest<HTMLElement>('.how-it-works__panel');
  if (!panel) return;

  const observer = new MutationObserver(() => {
    if (panel.classList.contains('is-active')) {
      restart();
      return;
    }

    stop();
  });

  observer.observe(panel, {
    attributes: true,
    attributeFilter: ['class'],
  });

  if (panel.classList.contains('is-active')) {
    start();
  }
}

export function initHowItWorksSwipe(): void {
  document
    .querySelectorAll<HTMLElement>(SWIPE_ROOT_SELECTOR)
    .forEach(initSwipeInstance);
}
