import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('index.tsx', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';
  });

  it('throws an error if the root element is not found', async () => {
    await expect(import('./index.tsx')).rejects.toThrow("Could not find root element to mount to");
  });
});
