import { initTitleAnimation } from './title-animator.js';
import { initEmailModal } from './email-modal.js';

export function bootstrapPortfolio(doc = globalThis.document) {
  const titleHeading = doc.querySelector('[data-animate-title]');
  initTitleAnimation(titleHeading, {
    document: doc,
    onReady() {
      const schedule =
        typeof globalThis.requestAnimationFrame === 'function'
          ? globalThis.requestAnimationFrame
          : (cb) => globalThis.setTimeout(cb, 16);
      schedule(() => {
        doc.body.classList.add('title-animated');
      });
    },
  });

  const modalController = initEmailModal({
    trigger: doc.getElementById('emailTrigger'),
    modal: doc.getElementById('emailModal'),
    backdrop: doc.getElementById('emailModalBackdrop'),
    closeButton: doc.getElementById('closeModalButton'),
    copyButton: doc.getElementById('copyButton'),
    emailElement: doc.getElementById('emailAddress'),
    feedbackElement: doc.getElementById('copyFeedback'),
    document: doc,
  });

  return { modalController };
}

/* c8 ignore next 7 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bootstrapPortfolio(document));
  } else {
    bootstrapPortfolio(document);
  }
}
