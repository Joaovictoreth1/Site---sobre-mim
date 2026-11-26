import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { bootstrapPortfolio } from '../scripts/main.js';

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');

describe('bootstrapPortfolio', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.body.className = '';
    vi.restoreAllMocks();
  });

  it('wires title animation and email modal on the real index.html markup', () => {
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });

    const parser = new DOMParser();
    const parsed = parser.parseFromString(indexHtml, 'text/html');
    document.body.innerHTML = parsed.body.innerHTML;

    const { modalController } = bootstrapPortfolio(document);

    expect(document.body.classList.contains('title-animated')).toBe(true);
    const h1 = document.getElementById('hero-title');
    expect(h1.getAttribute('aria-label')).toBe('Desenvolvedor com foco em IA e Programação');
    expect(h1.querySelectorAll('.animate-characters-character').length).toBeGreaterThan(20);

    expect(modalController).not.toBeNull();
    modalController.open();
    expect(document.getElementById('emailModal').hidden).toBe(false);
    modalController.close();
    expect(document.getElementById('emailModal').hidden).toBe(true);
    modalController.destroy();
  });

  it('falls back to setTimeout when requestAnimationFrame is unavailable', () => {
    vi.useFakeTimers();
    const originalRaf = globalThis.requestAnimationFrame;
    globalThis.requestAnimationFrame = undefined;

    try {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(indexHtml, 'text/html');
      document.body.innerHTML = parsed.body.innerHTML;

      const { modalController } = bootstrapPortfolio(document);
      vi.advanceTimersByTime(20);

      expect(document.body.classList.contains('title-animated')).toBe(true);
      modalController.destroy();
    } finally {
      globalThis.requestAnimationFrame = originalRaf;
      vi.useRealTimers();
    }
  });
});
