import { describe, it, expect, vi } from 'vitest';
import { initTitleAnimation } from '../scripts/title-animator.js';

describe('initTitleAnimation', () => {
  it('splits heading into accessible aria-hidden word and character spans with staggered delays', () => {
    const heading = document.createElement('h1');
    heading.textContent = 'IA e Código';
    const onReady = vi.fn();

    const applied = initTitleAnimation(heading, {
      prefersReducedMotion: false,
      delayStepSeconds: 0.05,
      document,
      onReady,
    });

    expect(applied).toBe(true);
    expect(heading.getAttribute('aria-label')).toBe('IA e Código');
    expect(onReady).toHaveBeenCalledTimes(1);

    const words = heading.querySelectorAll('.animate-characters-word');
    expect(words).toHaveLength(3);
    words.forEach((word) => {
      expect(word.getAttribute('aria-hidden')).toBe('true');
    });

    const chars = heading.querySelectorAll('.animate-characters-character');
    expect(chars).toHaveLength(9);
    expect(chars[0].textContent).toBe('I');
    expect(chars[0].style.transitionDelay).toBe('0s');
    expect(chars[1].textContent).toBe('A');
    expect(chars[1].style.transitionDelay).toBe('0.05s');
    expect(chars[8].textContent).toBe('o');
    expect(chars[8].style.transitionDelay).toBe('0.4s');
  });

  it('skips animation when prefers-reduced-motion is enabled', () => {
    const heading = document.createElement('h1');
    heading.textContent = 'Desenvolvedor';
    const onReady = vi.fn();

    const applied = initTitleAnimation(heading, {
      prefersReducedMotion: true,
      document,
      onReady,
    });

    expect(applied).toBe(false);
    expect(heading.textContent).toBe('Desenvolvedor');
    expect(heading.hasAttribute('aria-label')).toBe(false);
    expect(onReady).not.toHaveBeenCalled();
  });

  it('returns false for null or empty headings', () => {
    expect(initTitleAnimation(null)).toBe(false);

    const emptyHeading = document.createElement('h1');
    emptyHeading.textContent = '   \n\t  ';
    expect(initTitleAnimation(emptyHeading, { prefersReducedMotion: false })).toBe(false);
  });

  it('normalizes extra whitespace inside multiline HTML text', () => {
    const heading = document.createElement('h1');
    heading.textContent = '  Olá\n   Mundo  ';

    const applied = initTitleAnimation(heading, { prefersReducedMotion: false, document });

    expect(applied).toBe(true);
    expect(heading.getAttribute('aria-label')).toBe('Olá Mundo');
    expect(heading.querySelectorAll('.animate-characters-word')).toHaveLength(2);
  });

  it('respects window.matchMedia reduced-motion preference by default', () => {
    const heading = document.createElement('h1');
    heading.textContent = 'Portfólio';
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    try {
      expect(initTitleAnimation(heading)).toBe(false);
      expect(heading.textContent).toBe('Portfólio');
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
