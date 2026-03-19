import { describe, it, expect } from 'vitest';
import { decryptObject, generateSalt, deriveKey, encryptObject } from './crypto';

describe('crypto', () => {
  describe('decryptObject', () => {
    it('should correctly decrypt a valid encrypted object', async () => {
      const salt = generateSalt();
      const key = await deriveKey('password', salt);
      const data = { test: 'value', number: 123 };

      const encrypted = await encryptObject(data, key);
      const decrypted = await decryptObject(encrypted, key);

      expect(decrypted).toEqual(data);
    });

    it('should fallback to old base64 unencrypted format', async () => {
      const salt = generateSalt();
      const key = await deriveKey('password', salt);
      const data = { old: 'format' };

      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
      const decrypted = await decryptObject(encoded, key);

      expect(decrypted).toEqual(data);
    });

    it('should fallback to raw JSON string', async () => {
      const salt = generateSalt();
      const key = await deriveKey('password', salt);
      const data = { raw: 'json' };

      const decrypted = await decryptObject(JSON.stringify(data), key);

      expect(decrypted).toEqual(data);
    });

    it('should return null when raw string is empty', async () => {
      const salt = generateSalt();
      const key = await deriveKey('password', salt);

      const decrypted = await decryptObject('', key);

      expect(decrypted).toBeNull();
    });

    it('should return null when raw string is not valid JSON', async () => {
      const salt = generateSalt();
      const key = await deriveKey('password', salt);
      const invalidData = 'not-valid-json-and-not-base64';

      const decrypted = await decryptObject(invalidData, key);

      expect(decrypted).toBeNull();
    });
  });
});
