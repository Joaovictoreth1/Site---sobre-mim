import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initEmailModal } from '../scripts/email-modal.js';

function createModalDom() {
  document.body.innerHTML = `
    <button type="button" id="emailTrigger">Email</button>
    <div id="emailModalBackdrop" hidden></div>
    <div id="emailModal" role="dialog" aria-modal="true" hidden>
      <button type="button" id="closeModalButton" aria-label="Fechar">&times;</button>
      <p id="emailAddress">joaovictor.business2005@gmail.com</p>
      <button type="button" id="copyButton">Copiar</button>
      <a id="mailtoLink" href="mailto:joaovictor.business2005@gmail.com">Enviar email</a>
      <p id="copyFeedback" role="status"></p>
    </div>
  `;

  return {
    trigger: document.getElementById('emailTrigger'),
    modal: document.getElementById('emailModal'),
    backdrop: document.getElementById('emailModalBackdrop'),
    closeButton: document.getElementById('closeModalButton'),
    copyButton: document.getElementById('copyButton'),
    mailtoLink: document.getElementById('mailtoLink'),
    emailElement: document.getElementById('emailAddress'),
    feedbackElement: document.getElementById('copyFeedback'),
  };
}

describe('initEmailModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('returns null when required elements are missing', () => {
    expect(
      initEmailModal({
        trigger: null,
        modal: null,
        backdrop: null,
        closeButton: null,
        copyButton: null,
        emailElement: null,
        feedbackElement: null,
      })
    ).toBeNull();
  });

  it('opens and closes via trigger, close button, backdrop, and Escape key with focus management', () => {
    const els = createModalDom();
    const controller = initEmailModal({ ...els, document });

    expect(controller.isOpen()).toBe(false);
    expect(els.trigger.getAttribute('aria-expanded')).toBe('false');

    els.trigger.click();
    expect(controller.isOpen()).toBe(true);
    expect(els.modal.hidden).toBe(false);
    expect(els.backdrop.hidden).toBe(false);
    expect(els.trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(els.copyButton);

    // Clicking open while already open is a no-op
    controller.open();
    expect(controller.isOpen()).toBe(true);

    // Keydown while closed is a no-op; closing while closed is a no-op
    els.closeButton.click();
    controller.close();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(controller.isOpen()).toBe(false);
    expect(els.modal.hidden).toBe(true);
    expect(els.backdrop.hidden).toBe(true);
    expect(document.activeElement).toBe(els.trigger);

    // Close on backdrop click
    els.trigger.click();
    els.backdrop.click();
    expect(controller.isOpen()).toBe(false);

    // Close on Escape key
    els.trigger.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(controller.isOpen()).toBe(false);
    expect(document.activeElement).toBe(els.trigger);

    controller.destroy();
  });

  it('traps Tab and Shift+Tab focus within the open modal', () => {
    const els = createModalDom();
    const controller = initEmailModal({ ...els, document });

    controller.open();

    // Shift+Tab on first focusable wraps to last
    els.closeButton.focus();
    const shiftTabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      cancelable: true,
    });
    document.dispatchEvent(shiftTabEvent);
    expect(shiftTabEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(els.mailtoLink);

    // Tab on last focusable wraps to first
    const tabEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: false,
      cancelable: true,
    });
    document.dispatchEvent(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(els.closeButton);

    controller.destroy();
  });

  it('copies email, announces feedback, and resets button text after timeout', async () => {
    const els = createModalDom();
    const copyFn = vi.fn().mockResolvedValue(true);
    const controller = initEmailModal({ ...els, document, copyFn, feedbackDurationMs: 1500 });

    controller.open();
    els.copyButton.click();
    await vi.waitFor(() =>
      expect(copyFn).toHaveBeenCalledWith('joaovictor.business2005@gmail.com')
    );

    expect(els.copyButton.textContent).toBe('Copiado!');
    expect(els.feedbackElement.textContent).toContain('Email copiado');

    vi.advanceTimersByTime(1500);
    expect(els.copyButton.textContent).toBe('Copiar');
    expect(els.feedbackElement.textContent).toBe('');

    controller.destroy();
  });

  it('shows fallback message when copy fails', async () => {
    const els = createModalDom();
    const copyFn = vi.fn().mockResolvedValue(false);
    const controller = initEmailModal({ ...els, document, copyFn, feedbackDurationMs: 1000 });

    controller.open();
    els.copyButton.click();
    await vi.waitFor(() => expect(copyFn).toHaveBeenCalled());

    expect(els.copyButton.textContent).toBe('Copiar');
    expect(els.feedbackElement.textContent).toContain('Não foi possível copiar');

    vi.advanceTimersByTime(1000);
    expect(els.feedbackElement.textContent).toBe('');

    controller.destroy();
  });

  it('resets pending feedback timer on repeated copy clicks and handles optional elements', async () => {
    const els = createModalDom();
    const copyFn = vi.fn().mockResolvedValue(true);
    const controller = initEmailModal({
      ...els,
      backdrop: null,
      feedbackElement: null,
      document,
      copyFn,
      feedbackDurationMs: 1000,
    });

    controller.open();
    els.copyButton.click();
    await vi.waitFor(() => expect(copyFn).toHaveBeenCalledTimes(1));

    // Second click before timer expires clears prior timer
    vi.advanceTimersByTime(500);
    els.copyButton.click();
    await vi.waitFor(() => expect(copyFn).toHaveBeenCalledTimes(2));

    vi.advanceTimersByTime(600);
    expect(els.copyButton.textContent).toBe('Copiado!');

    vi.advanceTimersByTime(400);
    expect(els.copyButton.textContent).toBe('Copiar');

    // Non-Tab/non-Escape key is ignored while open
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(controller.isOpen()).toBe(true);

    controller.close();
    controller.destroy();
  });

  it('handles Tab safely when modal contains no focusable elements', () => {
    const els = createModalDom();
    const controller = initEmailModal({ ...els, document });
    controller.open();

    els.closeButton.disabled = true;
    els.copyButton.disabled = true;
    els.mailtoLink.removeAttribute('href');

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    document.dispatchEvent(tabEvent);
    expect(tabEvent.defaultPrevented).toBe(false);

    controller.destroy();
  });
});
