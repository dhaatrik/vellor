import { describe, it, expect, beforeAll } from 'vitest';
import { importKeyFromBase64, generateSalt, jsonReviver } from './crypto';

// Polyfill for crypto.subtle in jsdom environment if needed, but vitest globals=true with jsdom usually provides it, or we can use Node's crypto
import { webcrypto } from 'crypto';

describe('jsonReviver', () => {
  it('returns standard values as is', () => {
    expect(jsonReviver('name', 'John')).toBe('John');
    expect(jsonReviver('age', 30)).toBe(30);
    expect(jsonReviver('isActive', true)).toBe(true);
    const obj = { a: 1 };
    expect(jsonReviver('data', obj)).toBe(obj);
  });

  it('revives ISO date strings into Date objects', () => {
    const isoDate = '2023-10-27T10:00:00.000Z';
    const result = jsonReviver('date', isoDate);
    expect(result).toBeInstanceOf(Date);
    expect((result as Date).toISOString()).toBe(isoDate);
  });

  it('does not revive invalid ISO-like strings', () => {
    const invalidIso = '2023-13-45T25:61:61.000Z';
    expect(jsonReviver('date', invalidIso)).toBe(invalidIso);
  });

  it('returns undefined for sensitive keys to prevent prototype pollution', () => {
    expect(jsonReviver('__proto__', { attacker: 'props' })).toBeUndefined();
    expect(jsonReviver('constructor', { attacker: 'props' })).toBeUndefined();
    expect(jsonReviver('prototype', { attacker: 'props' })).toBeUndefined();
  });

  it('works correctly within JSON.parse', () => {
    const json = '{"name":"John","date":"2023-10-27T10:00:00.000Z","__proto__":{"polluted":"yes"},"nested":{"constructor":"test"}}';
    const parsed = JSON.parse(json, jsonReviver);

    expect(parsed.name).toBe('John');
    expect(parsed.date).toBeInstanceOf(Date);
    expect(Object.prototype.hasOwnProperty.call(parsed, "__proto__")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(parsed.nested, "constructor")).toBe(false);
    // The object itself should still be returned at the end of parsing
    expect(parsed).toBeDefined();
    expect(parsed.nested).toBeDefined();
  });
});

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

    await expect(decryptObject(missingIv, validKey)).rejects.toThrow('Invalid encrypted wrapper');
    await expect(decryptObject(missingCt, validKey)).rejects.toThrow('Invalid encrypted wrapper');
  });

  it('throws an error when decrypted with an invalid key', async () => {
    const data = { secret: 'message' };
    const encrypted = await encryptObject(data, validKey);

    // Decrypting with anotherKey should fail
    await expect(decryptObject(encrypted, anotherKey)).rejects.toThrow();
  });
});
