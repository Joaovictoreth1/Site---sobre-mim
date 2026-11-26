import { copyTextToClipboard } from './clipboard.js';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Initializes the accessible email contact dialog with keyboard navigation,
 * focus trapping, backdrop dismissal, and clipboard copy feedback.
 *
 * @param {{
 *   trigger: HTMLElement | null,
 *   modal: HTMLElement | null,
 *   backdrop: HTMLElement | null,
 *   closeButton: HTMLElement | null,
 *   copyButton: HTMLElement | null,
 *   emailElement: HTMLElement | null,
 *   feedbackElement: HTMLElement | null,
 *   document?: Document,
 *   copyFn?: (text: string) => Promise<boolean>,
 *   feedbackDurationMs?: number
 * }} elements
 */
export function initEmailModal(elements) {
  const {
    trigger,
    modal,
    backdrop,
    closeButton,
    copyButton,
    emailElement,
    feedbackElement,
    document: doc = globalThis.document,
    copyFn = copyTextToClipboard,
    feedbackDurationMs = 2000,
  } = elements;

  if (!trigger || !modal || !closeButton || !copyButton || !emailElement) {
    return null;
  }

  let isOpen = false;
  let feedbackTimerId = null;

  function getFocusableElements() {
    return Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR));
  }

  function clearFeedbackTimer() {
    if (feedbackTimerId !== null) {
      globalThis.clearTimeout(feedbackTimerId);
      feedbackTimerId = null;
    }
  }

  function open() {
    if (isOpen) {
      return;
    }
    isOpen = true;
    modal.hidden = false;
    if (backdrop) {
      backdrop.hidden = false;
    }
    trigger.setAttribute('aria-expanded', 'true');
    copyButton.focus();
  }

  function close() {
    if (!isOpen) {
      return;
    }
    isOpen = false;
    modal.hidden = true;
    if (backdrop) {
      backdrop.hidden = true;
    }
    trigger.setAttribute('aria-expanded', 'false');
    clearFeedbackTimer();
    copyButton.textContent = 'Copiar';
    if (feedbackElement) {
      feedbackElement.textContent = '';
    }
    trigger.focus();
  }

  function handleKeydown(event) {
    if (!isOpen) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'Tab') {
      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  async function handleCopy() {
    const email = emailElement.textContent?.trim() ?? '';
    const copied = await copyFn(email);

    clearFeedbackTimer();

    if (copied) {
      copyButton.textContent = 'Copiado!';
      if (feedbackElement) {
        feedbackElement.textContent = 'Email copiado para a área de transferência.';
      }
    } else if (feedbackElement) {
      feedbackElement.textContent = 'Não foi possível copiar automaticamente. Selecione o email.';
    }

    feedbackTimerId = globalThis.setTimeout(() => {
      copyButton.textContent = 'Copiar';
      if (feedbackElement) {
        feedbackElement.textContent = '';
      }
      feedbackTimerId = null;
    }, feedbackDurationMs);
  }

  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', open);
  closeButton.addEventListener('click', close);
  if (backdrop) {
    backdrop.addEventListener('click', close);
  }
  copyButton.addEventListener('click', handleCopy);
  doc.addEventListener('keydown', handleKeydown);

  return {
    open,
    close,
    isOpen: () => isOpen,
    destroy() {
      clearFeedbackTimer();
      trigger.removeEventListener('click', open);
      closeButton.removeEventListener('click', close);
      if (backdrop) {
        backdrop.removeEventListener('click', close);
      }
      copyButton.removeEventListener('click', handleCopy);
      doc.removeEventListener('keydown', handleKeydown);
    },
  };
}
