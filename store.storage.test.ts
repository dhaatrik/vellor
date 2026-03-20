import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageEngine, setGlobalMasterKey } from './store';
import localforage from 'localforage';
import { encryptObject } from './src/crypto';

// Polyfill webcrypto if necessary
if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = await import('crypto');
  globalThis.crypto = webcrypto as any;
}

// Mock canvas-confetti (often needed for Zustand slices relying on UI/Gamification)
vi.mock('canvas-confetti', () => {
   return { default: vi.fn() };
});

vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn()
  }
}));

describe('store.ts - storageEngine', () => {
  let mockKey: CryptoKey;

  beforeEach(async () => {
    vi.clearAllMocks();
    setGlobalMasterKey(null);
    mockKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  });

  describe('getItem', () => {
    it('returns null if localforage.getItem returns null', async () => {
      vi.mocked(localforage.getItem).mockResolvedValueOnce(null);
      const result = await storageEngine.getItem('test-key');
      expect(result).toBeNull();
      expect(localforage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('returns null if raw data exists but globalMasterKey is not set', async () => {
      vi.mocked(localforage.getItem).mockResolvedValueOnce('some-raw-data');
      const result = await storageEngine.getItem('test-key');
      expect(result).toBeNull();
    });

    it('decrypts data if globalMasterKey is set', async () => {
      setGlobalMasterKey(mockKey);
      const testData = { foo: 'bar' };
      const encryptedData = await encryptObject(testData, mockKey);

      vi.mocked(localforage.getItem).mockResolvedValueOnce(encryptedData);
      const result = await storageEngine.getItem('test-key');
      expect(result).toBe(JSON.stringify(testData));
    });

    it('handles decryption fallback correctly', async () => {
      setGlobalMasterKey(mockKey);

      // Invalid JSON or format will cause decryptObject to throw or return null based on fallback
      // In src/crypto.ts, decryptObject fallback might catch it and return null.
      // So if it returns null, JSON.stringify(null) will be "null".
      vi.mocked(localforage.getItem).mockResolvedValueOnce('invalid-encrypted-data');

      const result = await storageEngine.getItem('test-key');
      expect(result).toBe("null");
    });
  });

  describe('setItem', () => {
    it('sets unencrypted value if globalMasterKey is not set', async () => {
      const valueToSet = JSON.stringify({ key: 'value' });
      await storageEngine.setItem('test-key', valueToSet);
      expect(localforage.setItem).toHaveBeenCalledWith('test-key', valueToSet);
    });

    it('sets encrypted value if globalMasterKey is set', async () => {
      setGlobalMasterKey(mockKey);
      const valueToSet = JSON.stringify({ key: 'value' });
      await storageEngine.setItem('test-key', valueToSet);

      expect(localforage.setItem).toHaveBeenCalledTimes(1);

      const setCallArg = vi.mocked(localforage.setItem).mock.calls[0][1] as string;
      expect(setCallArg).not.toBe(valueToSet);

      expect(setCallArg).toBeTypeOf('string');
      const parsed = JSON.parse(atob(setCallArg));
      expect(parsed).toHaveProperty('iv');
      expect(parsed).toHaveProperty('ct');
    });
  });

  describe('removeItem', () => {
    it('removes item from localforage', async () => {
      await storageEngine.removeItem('test-key');
      expect(localforage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });
});
