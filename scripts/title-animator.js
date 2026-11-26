/**
 * Progressively enhances a heading element with staggered per-character reveal spans
 * while keeping screen readers reading the full heading cleanly via aria-label.
 *
 * @param {HTMLElement | null} heading
 * @param {{
 *   prefersReducedMotion?: boolean,
 *   delayStepSeconds?: number,
 *   document?: Document,
 *   onReady?: () => void
 * }} [options]
 * @returns {boolean} True when character animation markup was applied.
 */
export function initTitleAnimation(heading, options = {}) {
  if (!heading) {
    return false;
  }

  const rawText = heading.textContent?.trim().replace(/\s+/g, ' ') ?? '';
  if (!rawText) {
    return false;
  }

  const prefersReducedMotion =
    options.prefersReducedMotion ??
    Boolean(globalThis.window?.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

  if (prefersReducedMotion) {
    return false;
  }

  const doc = options.document ?? heading.ownerDocument ?? globalThis.document;
  const delayStepSeconds = options.delayStepSeconds ?? 0.025;

  heading.setAttribute('aria-label', rawText);
  heading.textContent = '';

  const words = rawText.split(' ');
  let charIndex = 0;

  words.forEach((word, wordIdx) => {
    const wordSpan = doc.createElement('span');
    wordSpan.className = 'animate-characters-word';
    wordSpan.setAttribute('aria-hidden', 'true');

    for (const char of Array.from(word)) {
      const charSpan = doc.createElement('span');
      charSpan.className = 'animate-characters-character';
      charSpan.textContent = char;
      charSpan.style.transitionDelay = `${(charIndex * delayStepSeconds).toFixed(3)}s`;
      wordSpan.appendChild(charSpan);
      charIndex += 1;
    }

    heading.appendChild(wordSpan);

    if (wordIdx < words.length - 1) {
      heading.appendChild(doc.createTextNode(' '));
    }
  });

  if (typeof options.onReady === 'function') {
    options.onReady();
  }

  return true;
}
