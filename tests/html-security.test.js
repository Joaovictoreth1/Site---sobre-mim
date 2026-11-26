import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const htmlContent = readFileSync(resolve(rootDir, 'index.html'), 'utf-8');
const parser = new DOMParser();
const doc = parser.parseFromString(htmlContent, 'text/html');

describe('index.html security, accessibility, and asset integrity', () => {
  it('defines a strict Content-Security-Policy meta tag without unsafe-inline', () => {
    const cspMeta = doc.querySelector('meta[http-equiv="Content-Security-Policy"]');
    expect(cspMeta).not.toBeNull();

    const policy = cspMeta.getAttribute('content') ?? '';
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("script-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).not.toContain('unsafe-inline');
    expect(policy).not.toContain('unsafe-eval');
  });

  it('contains no inline <style> blocks or inline <script> bodies', () => {
    expect(doc.querySelectorAll('style')).toHaveLength(0);
    const scripts = Array.from(doc.querySelectorAll('script'));
    expect(scripts.length).toBeGreaterThan(0);
    for (const script of scripts) {
      expect(script.getAttribute('src')).toBeTruthy();
      expect(script.textContent.trim()).toBe('');
    }
  });

  it('adds rel="noopener noreferrer" to every target="_blank" link', () => {
    const blankLinks = Array.from(doc.querySelectorAll('a[target="_blank"]'));
    expect(blankLinks.length).toBeGreaterThan(0);

    for (const link of blankLinks) {
      const relTokens = (link.getAttribute('rel') ?? '').split(/\s+/);
      expect(relTokens).toContain('noopener');
      expect(relTokens).toContain('noreferrer');
    }
  });

  it('references only existing local images and stylesheets (no expired WhatsApp/Giphy URLs)', () => {
    expect(htmlContent).not.toContain('cdn.whatsapp.net');
    expect(htmlContent).not.toContain('giphy.com');
    expect(htmlContent).not.toContain('upload.wikimedia.org');

    const localImages = Array.from(doc.querySelectorAll('img'));
    expect(localImages.length).toBeGreaterThanOrEqual(6);
    for (const img of localImages) {
      const src = img.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src.startsWith('http')).toBe(false);
      expect(existsSync(resolve(rootDir, src))).toBe(true);
    }

    const favicon = doc.querySelector('link[rel="icon"]');
    expect(existsSync(resolve(rootDir, favicon.getAttribute('href')))).toBe(true);
  });

  it('has semantic landmarks, skip link, and valid heading order', () => {
    expect(doc.querySelector('.skip-link')).not.toBeNull();
    expect(doc.querySelector('header nav')).not.toBeNull();
    expect(doc.querySelector('main')).not.toBeNull();
    expect(doc.querySelector('footer')).not.toBeNull();
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelectorAll('h2').length).toBeGreaterThanOrEqual(1);
    expect(doc.querySelectorAll('h3')).toHaveLength(0);
  });
});
