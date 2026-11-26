/**
 * Copies plain text to the system clipboard using the Async Clipboard API
 * with a safe legacy fallback for restricted contexts.
 *
 * @param {string} text
 * @param {{ clipboard?: { writeText?: (value: string) => Promise<void> }, document?: Document }} [deps]
 * @returns {Promise<boolean>}
 */
export async function copyTextToClipboard(text, deps = {}) {
  if (typeof text !== 'string' || text.length === 0) {
    return false;
  }

  const clipboard = deps.clipboard ?? globalThis.navigator?.clipboard;
  if (clipboard && typeof clipboard.writeText === 'function') {
    try {
      await clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy execCommand fallback when clipboard API is rejected.
    }
  }

  const doc = deps.document ?? globalThis.document;
  if (!doc || !doc.body || typeof doc.execCommand !== 'function') {
    return false;
  }

  const textarea = doc.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';

  doc.body.appendChild(textarea);
  textarea.select();

  try {
    return Boolean(doc.execCommand('copy'));
  } catch {
    return false;
  } finally {
    doc.body.removeChild(textarea);
  }
}
