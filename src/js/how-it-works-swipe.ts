const SWIPE_ROOT_SELECTOR = '[data-how-it-works-swipe]';
const PHONE_SELECTOR = '[data-swipe-phone]';
const CARD_SELECTOR = '[data-swipe-card]';
const MOBILE_SWIPE_CLASS = 'how-it-works__swipe--mobile';
const PHONE_COUNT = 5;
const CARD_ID_PREFIX = 'how-it-works-swipe-card-';

const PHONE_IDLE_MS = 300;
const PHONE_TRANSITION_MS = 900;
const CARD_ENTER_MS = 280;
const CARD_IDLE_MS = 750;
const SWIPE_MS = 650;
const FINAL_PHONE_IDLE_MS = 2200;

const SWIPE_DIRECTIONS = ['right', 'left', 'left', 'right'] as const;

type SwipeDirection = (typeof SWIPE_DIRECTIONS)[number];

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getCardSrc(stepIndex: number): string | null {
  const source = document.getElementById(
    `${CARD_ID_PREFIX}${stepIndex + 1}`,
  ) as HTMLImageElement | null;

  if (!source?.src) return null;

  return source.currentSrc || source.src;
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

    if (!phones.length || !card || phones.length !== PHONE_COUNT) return;

    isRunning = true;
    const currentRunId = ++runId;

    const runLoop = async (): Promise<void> => {
      while (isRunning && currentRunId === runId) {
        for (let index = 0; index < PHONE_COUNT; index += 1) {
          if (!isRunning || currentRunId !== runId) return;

          await setActivePhone(phones, index);
          await wait(PHONE_IDLE_MS);

          const direction = SWIPE_DIRECTIONS[index];
          if (!direction) {
            await wait(FINAL_PHONE_IDLE_MS);
            continue;
          }

          const cardSrc = getCardSrc(index);
          if (!cardSrc) continue;

          await showCard(card, cardSrc, direction);
          await wait(CARD_IDLE_MS);
          await swipeCard(card, direction);
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
