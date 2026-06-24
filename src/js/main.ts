import { initFaq } from './faq';
import { initHowItWorksSteps } from './how-it-works-steps';
import { initWaitlistPopup } from './waitlist-popup';

function init(): void {
  document.documentElement.classList.add('js');
  initWaitlistPopup();
  initHowItWorksSteps();
  initFaq();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

