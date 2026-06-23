import { initWaitlistPopup } from './waitlist-popup';

function init(): void {
  document.documentElement.classList.add('js');
  initWaitlistPopup();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}

