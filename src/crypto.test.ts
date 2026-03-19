import { describe, it, expect } from 'vitest';
import { deriveKey } from './crypto';

describe('deriveKey', () => {
    const enc = new TextEncoder();

    it('should return a valid CryptoKey object', async () => {
        const salt = enc.encode('somesalt');
        const key = await deriveKey('password123', salt);

        expect(key).toBeDefined();
        expect(key.type).toBe('secret');
        expect(key.extractable).toBe(true);
        expect(key.algorithm.name).toBe('AES-GCM');
        // Type casting is needed because typescript's lib.dom.d.ts doesn't expose length for AesKeyAlgorithm in the same way
        expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
        expect(key.usages).toContain('encrypt');
        expect(key.usages).toContain('decrypt');
    });

    it('should generate the same key for the same password and salt', async () => {
        const password = 'mySecretPassword';
        const salt = enc.encode('consistentSalt');

        const key1 = await deriveKey(password, salt);
        const key2 = await deriveKey(password, salt);

        // Export keys to compare their raw buffer data
        const exportedKey1 = await crypto.subtle.exportKey('raw', key1);
        const exportedKey2 = await crypto.subtle.exportKey('raw', key2);

        const array1 = Array.from(new Uint8Array(exportedKey1));
        const array2 = Array.from(new Uint8Array(exportedKey2));

        expect(array1).toEqual(array2);
    });

    it('should generate different keys for different passwords', async () => {
        const salt = enc.encode('consistentSalt');

        const key1 = await deriveKey('passwordOne', salt);
        const key2 = await deriveKey('passwordTwo', salt);

        const exportedKey1 = await crypto.subtle.exportKey('raw', key1);
        const exportedKey2 = await crypto.subtle.exportKey('raw', key2);

        const array1 = Array.from(new Uint8Array(exportedKey1));
        const array2 = Array.from(new Uint8Array(exportedKey2));

        expect(array1).not.toEqual(array2);
    });

    it('should generate different keys for different salts', async () => {
        const password = 'samePassword';
        const salt1 = enc.encode('saltOne');
        const salt2 = enc.encode('saltTwo');

        const key1 = await deriveKey(password, salt1);
        const key2 = await deriveKey(password, salt2);

        const exportedKey1 = await crypto.subtle.exportKey('raw', key1);
        const exportedKey2 = await crypto.subtle.exportKey('raw', key2);

        const array1 = Array.from(new Uint8Array(exportedKey1));
        const array2 = Array.from(new Uint8Array(exportedKey2));

        expect(array1).not.toEqual(array2);
    });

    it('should handle empty password', async () => {
        const salt = enc.encode('somesalt');
        const key = await deriveKey('', salt);

        expect(key).toBeDefined();
        expect(key.type).toBe('secret');
        expect(key.algorithm.name).toBe('AES-GCM');
    });

    it('should handle empty salt', async () => {
        const salt = new Uint8Array(0);
        const key = await deriveKey('password123', salt);

        expect(key).toBeDefined();
        expect(key.type).toBe('secret');
        expect(key.algorithm.name).toBe('AES-GCM');
    });
});
