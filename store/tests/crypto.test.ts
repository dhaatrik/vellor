import { describe, it, expect, beforeAll, vi } from 'vitest';
import { importKeyFromBase64, exportKeyToBase64, generateSalt, decryptObject, encryptObject, jsonReviver, deriveKey } from '../../src/crypto';
import { z } from "zod";

// Polyfill for crypto.subtle in jsdom environment if needed, but vitest globals=true with jsdom usually provides it, or we can use Node's crypto
import { webcrypto } from 'crypto';

describe('generateSalt', () => {
  beforeAll(() => {
    // Ensure crypto is available in the test environment
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }
  });

  it('returns a Uint8Array of length 16', () => {
    const salt = generateSalt();
    expect(salt).toBeInstanceOf(Uint8Array);
    expect(salt.length).toBe(16);
  });

  it('generates random values on subsequent calls', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();

    // They shouldn't be exactly the same
    expect(salt1).not.toEqual(salt2);
  });

  it('calls crypto.getRandomValues with a 16-byte Uint8Array', () => {
    const originalGetRandomValues = crypto.getRandomValues.bind(crypto);
    const spy = vi.fn(originalGetRandomValues);

    // Replace temporarily
    Object.defineProperty(globalThis.crypto, 'getRandomValues', {
      value: spy,
      configurable: true,
      writable: true,
    });

    generateSalt();

    expect(spy).toHaveBeenCalledTimes(1);
    const arg = spy.mock.calls[0][0];
    expect(arg).toBeInstanceOf(Uint8Array);
    expect((arg as Uint8Array).length).toBe(16);

    // Restore original
    Object.defineProperty(globalThis.crypto, 'getRandomValues', {
      value: originalGetRandomValues,
      configurable: true,
      writable: true,
    });
  });
});

describe('exportKeyToBase64', () => {
  beforeAll(() => {
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }
  });

  it('successfully exports a CryptoKey to base64', async () => {
    // Generate a real key for testing
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    const base64Str = await exportKeyToBase64(key);

    // Should be a string
    expect(typeof base64Str).toBe('string');
    // Base64 strings have length a multiple of 4 (with padding)
    expect(base64Str.length % 4).toBe(0);
    // For a 256-bit (32-byte) key, base64 encoding without padding is 43 chars, with padding is 44 chars
    expect(base64Str.length).toBe(44);

    // We should be able to import it back and it should be a valid key
    const importedKey = await importKeyFromBase64(base64Str);
    expect(importedKey).toBeDefined();
    expect(importedKey.type).toBe('secret');
    expect(importedKey.algorithm.name).toBe('AES-GCM');
  });

  it('throws an error for invalid key parameter', async () => {
    // Pass something that isn't a CryptoKey. Bypass TS error explicitly.
    // @ts-expect-error - Testing invalid input
    await expect(exportKeyToBase64({})).rejects.toThrow();
    // @ts-expect-error - Testing invalid input
    await expect(exportKeyToBase64(null)).rejects.toThrow();
  });
});

describe('importKeyFromBase64', () => {
  beforeAll(() => {
    // Ensure crypto is available in the test environment (jsdom might not have it fully implemented)
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }
  });

  it('successfully imports a valid base64 key', async () => {
    // A pre-generated 256-bit AES-GCM key exported to raw, then base64 encoded
    const validBase64Key = '0RGoNs9kNzJa3LLq+i/hoUbA39sfrGJs5YpYj7vRYa4=';

    const key = await importKeyFromBase64(validBase64Key);

    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
    expect(key.algorithm.name).toBe('AES-GCM');

    // Check usages
    expect(key.usages).toContain('encrypt');
    expect(key.usages).toContain('decrypt');
  });

  it('throws an error for invalid base64 string', async () => {
    // This is not valid base64
    const invalidBase64 = 'invalid-base64-string!@#';

    // atob should throw DOMException
    await expect(importKeyFromBase64(invalidBase64)).rejects.toThrow();
  });

  it('throws an error for incorrect key length', async () => {
    // Valid base64, but not 256 bits (32 bytes). This is just 4 bytes "test".
    const shortBase64 = btoa('test');

    // importKey should throw when expecting a 256-bit AES key but given different length
    await expect(importKeyFromBase64(shortBase64)).rejects.toThrow();
  });

  it('successfully handles base64 keys without padding', async () => {
    const validKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const exportedStr = await exportKeyToBase64(validKey);
    const base64Str = exportedStr.replace(/=+$/, "");
    const importedKey = await importKeyFromBase64(base64Str);
    expect(importedKey).toBeDefined();
  });
});

describe('jsonReviver', () => {
  it('returns undefined for prototype pollution keys', () => {
    expect(jsonReviver('__proto__', 'value')).toBeUndefined();
    expect(jsonReviver('constructor', 'value')).toBeUndefined();
    expect(jsonReviver('prototype', 'value')).toBeUndefined();
  });

  it('parses valid ISO date strings to Date objects', () => {
    const dateStr = '2023-10-27T10:00:00.000Z';
    const result = jsonReviver('date', dateStr);
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).toISOString()).toBe(dateStr);
  });

  it('returns original value for non-date strings', () => {
    expect(jsonReviver('key', 'not a date')).toBe('not a date');
    expect(jsonReviver('key', '2023-10-27')).toBe('2023-10-27'); // Not full ISO format
  });

  it('returns original value for non-string values', () => {
    expect(jsonReviver('key', 123)).toBe(123);
    expect(jsonReviver('key', true)).toBe(true);
    expect(jsonReviver('key', null)).toBe(null);
    expect(jsonReviver('key', { a: 1 })).toEqual({ a: 1 });
  });
});

describe('encryptObject', () => {
  let validKey: CryptoKey;

  beforeAll(async () => {
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }
    validKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  });

  it('successfully encrypts an object into a base64 wrapper', async () => {
    const testObj = { message: 'hello world', num: 42 };
    const encryptedStr = await encryptObject(testObj, validKey);

    expect(typeof encryptedStr).toBe('string');
    expect(encryptedStr.length).toBeGreaterThan(0);

    const parsed = JSON.parse(atob(encryptedStr));
    expect(parsed).toHaveProperty('iv');
    expect(parsed).toHaveProperty('ct');

    expect(Array.isArray(parsed.iv)).toBe(true);
    expect(parsed.iv.length).toBe(12);

    expect(Array.isArray(parsed.ct)).toBe(true);
    expect(parsed.ct.length).toBeGreaterThan(0);
  });

  it('throws an error if an invalid key is provided', async () => {
    const testObj = { message: 'hello world' };
    // @ts-expect-error - Testing invalid input
    await expect(encryptObject(testObj, {})).rejects.toThrow();
    // @ts-expect-error - Testing invalid input
    await expect(encryptObject(testObj, null)).rejects.toThrow();
  });
});

describe('decryptObject', () => {
  let validKey: CryptoKey;
  let anotherKey: CryptoKey;

  beforeAll(async () => {
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }
    validKey = await importKeyFromBase64('0RGoNs9kNzJa3LLq+i/hoUbA39sfrGJs5YpYj7vRYa4=');
    anotherKey = await importKeyFromBase64('1RGoNs9kNzJa3LLq+i/hoUbA39sfrGJs5YpYj7vRYa4='); // Different key
  });

  it('throws an error for invalid base64 encoding', async () => {
    const invalidBase64 = 'invalid-base64-string!@#';
    await expect(decryptObject(invalidBase64, validKey)).rejects.toThrow();
  });

  it('throws an error when iv or ct is missing in the decrypted wrapper', async () => {
    const missingIv = btoa(JSON.stringify({ ct: [] }));
    const missingCt = btoa(JSON.stringify({ iv: [] }));
    const validJsonButNoWrapper = btoa(JSON.stringify({ someData: "value", noIvOrCt: true }));

    await expect(decryptObject(missingIv, validKey)).rejects.toThrow('Invalid encrypted wrapper');
    await expect(decryptObject(missingCt, validKey)).rejects.toThrow('Invalid encrypted wrapper');
    await expect(decryptObject(validJsonButNoWrapper, validKey)).rejects.toThrow('Invalid encrypted wrapper');
  });

  it('throws an error when decrypted with an invalid key', async () => {
    const data = { secret: 'message' };
    const encrypted = await encryptObject(data, validKey);

    // Decrypting with anotherKey should fail
    await expect(decryptObject(encrypted, anotherKey)).rejects.toThrow('Failed to decrypt data. Invalid password or corrupted data.');
  });

  it("successfully decrypts an object without schema validation", async () => {
    const data = { secret: "message" };
    const encrypted = await encryptObject(data, validKey);
    const decrypted = await decryptObject(encrypted, validKey);
    expect(decrypted).toEqual(data);
  });

  it("successfully decrypts an object and applies schema validation", async () => {
    const data = { secret: "message" };
    const encrypted = await encryptObject(data, validKey);
    const schema = z.object({ secret: z.string() });
    const decrypted = await decryptObject(encrypted, validKey, schema);
    expect(decrypted).toEqual(data);
  });

  it("throws an error if schema validation fails on decrypted object", async () => {
    const data = { secret: 123 as any };
    const encrypted = await encryptObject(data, validKey);
    const schema = z.object({ secret: z.string() });
    await expect(decryptObject(encrypted, validKey, schema)).rejects.toThrow('Failed to decrypt data. Invalid password or corrupted data.');
  });


  it("throws an error for corrupted ciphertext data", async () => {
    const data = { secret: "123" };
    const encrypted = await encryptObject(data, validKey);

    // Corrupt the ciphertext slightly
    const parsed = JSON.parse(atob(encrypted));
    if (parsed.ct && parsed.ct.length > 0) {
      parsed.ct[0] ^= 1; // flip a bit
    }
    const corruptedBase64 = btoa(JSON.stringify(parsed));

    await expect(decryptObject(corruptedBase64, validKey)).rejects.toThrow("Failed to decrypt data. Invalid password or corrupted data.");
  });
});

describe('deriveKey', () => {
  beforeAll(() => {
    if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
      const { webcrypto } = require('crypto');
      Object.defineProperty(globalThis, 'crypto', {
        value: webcrypto,
      });
    }
  });

  it('successfully derives a CryptoKey from password and salt', async () => {
    const password = 'test-password';
    const salt = generateSalt();

    const key = await deriveKey(password, salt);

    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
    expect(key.algorithm.name).toBe('AES-GCM');
    expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
    expect(key.usages).toContain('encrypt');
    expect(key.usages).toContain('decrypt');
    expect(key.extractable).toBe(true);
  });


  it('successfully derives a key with an empty password', async () => {
    const salt = generateSalt();
    const key = await deriveKey('', salt);
    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
  });

  it('successfully derives a key with an empty salt', async () => {
    const password = 'test-password';
    const salt = new Uint8Array(0);
    const key = await deriveKey(password, salt);
    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
  });

  it('derives the same key for the same password and salt', async () => {
    const password = 'constant-password';
    const salt = new Uint8Array(16).fill(1);

    const key1 = await deriveKey(password, salt);
    const key2 = await deriveKey(password, salt);

    const exported1 = await crypto.subtle.exportKey('raw', key1);
    const exported2 = await crypto.subtle.exportKey('raw', key2);

    expect(new Uint8Array(exported1)).toEqual(new Uint8Array(exported2));
  });

  it('derives different keys for different passwords', async () => {
    const salt = new Uint8Array(16).fill(1);

    const key1 = await deriveKey('password-one', salt);
    const key2 = await deriveKey('password-two', salt);

    const exported1 = await crypto.subtle.exportKey('raw', key1);
    const exported2 = await crypto.subtle.exportKey('raw', key2);

    expect(new Uint8Array(exported1)).not.toEqual(new Uint8Array(exported2));
  });

  it('derives different keys for different salts', async () => {
    const password = 'constant-password';
    const salt1 = new Uint8Array(16).fill(1);
    const salt2 = new Uint8Array(16).fill(2);

    const key1 = await deriveKey(password, salt1);
    const key2 = await deriveKey(password, salt2);

    const exported1 = await crypto.subtle.exportKey('raw', key1);
    const exported2 = await crypto.subtle.exportKey('raw', key2);

    expect(new Uint8Array(exported1)).not.toEqual(new Uint8Array(exported2));
  });

  it('successfully derives a key with a custom iteration count', async () => {
    const password = 'test-password';
    const salt = generateSalt();
    const key = await deriveKey(password, salt, 10);
    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
  });

  it('successfully derives a key with a very long password string', async () => {
    const password = 'a'.repeat(10000);
    const salt = generateSalt();
    const key = await deriveKey(password, salt, 10); // Use low iterations for faster test
    expect(key).toBeDefined();
    expect(key.type).toBe('secret');
  });
});
