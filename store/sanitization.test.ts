// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { sanitizeString } from '../helpers';

describe('sanitizeString', () => {
  it('strips simple tags', () => {
    expect(sanitizeString('Hello <b>World</b>')).toBe('Hello World');
  });

  it('strips nested tags correctly', () => {
    // The previously failing case:
    const payload = '<<script>script>alert(1)</script>';
    // Regex would result in <script>alert(1)
    // Both DOMParser and character stripping will handle this.
    expect(sanitizeString(payload)).not.toContain('<script>');
  });

  it('handles attributes with events', () => {
    const payload = '<img src="x" onerror="alert(1)">';
    expect(sanitizeString(payload)).toBe('');
  });

  it('handles malformed tags', () => {
    const payload = '<img src="x" onerror="alert(1)"';
    // This previously failed with regex.
    expect(sanitizeString(payload)).toBe('');
  });

  it('returns empty string for undefined or null', () => {
    expect(sanitizeString(undefined)).toBe('');
    expect(sanitizeString(null as any)).toBe('');
  });

  it('preserves plain text', () => {
    expect(sanitizeString('Just some plain text')).toBe('Just some plain text');
  });

  it('handles mixed content', () => {
      expect(sanitizeString('Click <a href="javascript:alert(1)">here</a> to win!')).toBe('Click here to win!');
  });
});
