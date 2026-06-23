const SECTION_SELECTOR = '.how-it-works';
const TAB_SELECTOR = '.how-it-works__trigger[role="tab"]';
const PANEL_SELECTOR = '.how-it-works__panel';
const ITEM_SELECTOR = '.how-it-works__item';
const PREVIEW_SELECTOR = '.how-it-works__preview';
const TABLIST_SELECTOR = '.how-it-works__items[role="tablist"]';
const TABLET_MEDIA_QUERY = '(min-width: 768px)';

function isDesktopTabsEnabled(): boolean {
  return window.matchMedia(TABLET_MEDIA_QUERY).matches;
}

function activateStep(
  tabs: HTMLButtonElement[],
  items: HTMLElement[],
  panels: HTMLElement[],
  index: number,
): void {
  tabs.forEach((tab, tabIndex) => {
    const isActive = tabIndex === index;

    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  items.forEach((item, itemIndex) => {
    item.classList.toggle('is-active', itemIndex === index);
  });

  panels.forEach((panel, panelIndex) => {
    const isActive = panelIndex === index;

    panel.classList.toggle('is-active', isActive);
    panel.setAttribute('aria-hidden', String(!isActive));
  });
}

function setMobileMode(
  tabs: HTMLButtonElement[],
  items: HTMLElement[],
  panels: HTMLElement[],
  preview: HTMLElement | null,
  tablist: HTMLElement | null,
): void {
  items.forEach((item) => item.classList.add('is-active'));

  tabs.forEach((tab) => {
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('tabindex', '-1');
  });

  panels.forEach((panel) => {
    panel.classList.remove('is-active');
    panel.setAttribute('aria-hidden', 'true');
  });

  preview?.setAttribute('aria-hidden', 'true');
  tablist?.removeAttribute('role');
}

function setDesktopMode(
  tabs: HTMLButtonElement[],
  items: HTMLElement[],
  panels: HTMLElement[],
  preview: HTMLElement | null,
  tablist: HTMLElement | null,
): void {
  preview?.setAttribute('aria-hidden', 'false');
  tablist?.setAttribute('role', 'tablist');

  tabs.forEach((tab) => {
    tab.removeAttribute('tabindex');
  });

  activateStep(tabs, items, panels, 0);
}

export function initHowItWorksSteps(): void {
  const section = document.querySelector<HTMLElement>(SECTION_SELECTOR);
  if (!section) return;

  const tabs = Array.from(
    section.querySelectorAll<HTMLButtonElement>(TAB_SELECTOR),
  );
  const items = Array.from(
    section.querySelectorAll<HTMLElement>(ITEM_SELECTOR),
  );
  const panels = Array.from(
    section.querySelectorAll<HTMLElement>(PANEL_SELECTOR),
  );
  const preview = section.querySelector<HTMLElement>(PREVIEW_SELECTOR);
  const tablist = section.querySelector<HTMLElement>(TABLIST_SELECTOR);

  if (!tabs.length || tabs.length !== panels.length) return;

  const mediaQuery = window.matchMedia(TABLET_MEDIA_QUERY);

  const syncMode = (): void => {
    if (isDesktopTabsEnabled()) {
      setDesktopMode(tabs, items, panels, preview, tablist);
      return;
    }

    setMobileMode(tabs, items, panels, preview, tablist);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      if (!isDesktopTabsEnabled()) return;

      activateStep(tabs, items, panels, index);
    });
  });

  syncMode();
  mediaQuery.addEventListener('change', syncMode);
}
