import { initFaq } from './faq';
import { initHowItWorksSteps } from './how-it-works-steps';
import { initHowItWorksSwipe } from './how-it-works-swipe';

function init(): void {
  document.documentElement.classList.add('js');
  initHowItWorksSteps();
  initHowItWorksSwipe();
  initFaq();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
