import { initFaq } from './faq';
import { initHowItWorksSteps } from './how-it-works-steps';
import { initHowItWorksSwipe } from './how-it-works-swipe';
import { initStorePopup } from './store-popup';

function init(): void {
  document.documentElement.classList.add('js');
  initStorePopup();
  initHowItWorksSteps();
  initHowItWorksSwipe();
  initFaq();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
