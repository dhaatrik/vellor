import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storageEngine, useStore } from '../../store';
import localforage from 'localforage';
import { encryptObject, decryptObject } from '../../src/crypto';

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

vi.mock('../../src/crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/crypto')>();
  return {
    ...actual,
    decryptObject: vi.fn(actual.decryptObject),
  };
});

describe('store.ts - storageEngine', () => {
  let mockKey: CryptoKey;

  beforeEach(async () => {
    vi.clearAllMocks();
    useStore.getState().setMasterKey(null);
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
      useStore.getState().setMasterKey(mockKey);
      const testData = { state: { foo: 'bar' } };
      const encryptedData = await encryptObject(testData, mockKey);

      vi.mocked(localforage.getItem).mockResolvedValueOnce(encryptedData);
      const result = await storageEngine.getItem('test-key');
      expect(result).toBe(JSON.stringify(testData));
    });

    it('throws error when invalid encrypted payload is given', async () => {
      useStore.getState().setMasterKey(mockKey);

      // Invalid JSON or format will cause decryptObject to throw
      vi.mocked(localforage.getItem).mockResolvedValueOnce('invalid-encrypted-data');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(storageEngine.getItem('test-key')).rejects.toThrow();
      consoleSpy.mockRestore();
    });

    it('throws error if decryption fails', async () => {
      // 🧪 Testing Improvement: Ensure explicit coverage for the error path during storageEngine decryption.
      // This test specifically triggers the try/catch block around decryptObject at store.ts:144
      // by mocking localforage to return raw data and decryptObject to throw, mimicking a decryption failure.
      useStore.getState().setMasterKey(mockKey);
      vi.mocked(localforage.getItem).mockResolvedValueOnce('some-encrypted-data');

      const mockError = new Error('Decryption Error');
      vi.mocked(decryptObject).mockRejectedValueOnce(mockError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(storageEngine.getItem('test-key')).rejects.toThrow('Decryption Error');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Decryption failed for key:', 'test-key', mockError);

      consoleErrorSpy.mockRestore();
    });

    it('re-throws error when decryptObject fails during storageEngine decryption', async () => {
      useStore.getState().setMasterKey(mockKey);
      vi.mocked(localforage.getItem).mockResolvedValueOnce('mocked-raw-data');

      const mockError = new Error('Decryption Error Path');
      vi.mocked(decryptObject).mockRejectedValueOnce(mockError);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(storageEngine.getItem('another-test-key')).rejects.toThrow('Decryption Error Path');

      expect(consoleErrorSpy).toHaveBeenCalledWith('Decryption failed for key:', 'another-test-key', mockError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('setItem', () => {
    it('sets unencrypted value if globalMasterKey is not set', async () => {
      const valueToSet = JSON.stringify({ key: 'value' });
      await storageEngine.setItem('test-key', valueToSet);
      expect(localforage.setItem).toHaveBeenCalledWith('test-key', valueToSet);
    });

    it('sets encrypted value if globalMasterKey is set', async () => {
      useStore.getState().setMasterKey(mockKey);

      const valueToSet = JSON.stringify({ key: 'value' });
      await storageEngine.setItem('test-key', valueToSet);

      // We filter calls by the expected key because Zustand might trigger automatic persistence calls to 'vellor-storage'
      const relevantCalls = vi.mocked(localforage.setItem).mock.calls.filter(call => call[0] === 'test-key');
      expect(relevantCalls.length).toBe(1);

      const setCallArg = relevantCalls[0][1] as string;
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
