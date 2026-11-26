import { describe, it, expect, vi } from 'vitest';
import { copyTextToClipboard } from '../scripts/clipboard.js';

describe('copyTextToClipboard', () => {
  it('returns false for empty or non-string input', async () => {
    expect(await copyTextToClipboard('')).toBe(false);
    expect(await copyTextToClipboard(null)).toBe(false);
    expect(await copyTextToClipboard(undefined)).toBe(false);
  });

  it('uses navigator.clipboard.writeText when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    const result = await copyTextToClipboard('joao@example.com', {
      clipboard: { writeText },
    });

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith('joao@example.com');
  });

  it('falls back to document.execCommand when clipboard API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Permission denied'));
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    const result = await copyTextToClipboard('joao@example.com', {
      clipboard: { writeText },
      document,
    });

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith('joao@example.com');
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('returns false and cleans up textarea when legacy execCommand throws', async () => {
    document.execCommand = vi.fn(() => {
      throw new Error('execCommand failed');
    });

    const result = await copyTextToClipboard('joao@example.com', {
      clipboard: {},
      document,
    });

    expect(result).toBe(false);
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('returns false when neither clipboard API nor execCommand is available', async () => {
    const fakeDoc = { body: null };
    const result = await copyTextToClipboard('joao@example.com', {
      clipboard: {},
      document: fakeDoc,
    });

    expect(result).toBe(false);
  });
});
