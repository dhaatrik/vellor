export const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
};

export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptObject = async (obj: any, key: CryptoKey): Promise<string> => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encoded = enc.encode(JSON.stringify(obj));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoded
  );
  
  // Optimization: Pre-allocated arrays are significantly faster than Array.from for TypedArrays
  const ivArray = new Array(iv.length);
  for (let i = 0; i < iv.length; i++) {
    ivArray[i] = iv[i];
  }

  const uint8Cipher = new Uint8Array(ciphertext);
  const cipherArray = new Array(uint8Cipher.length);
  for (let i = 0; i < uint8Cipher.length; i++) {
    cipherArray[i] = uint8Cipher[i];
  }

  return btoa(JSON.stringify({ iv: ivArray, ct: cipherArray }));
};

export const jsonReviver = (key: string, value: any) => {
  if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
    return undefined;
  }
  return value;
};

export const decryptObject = async <T = any>(
  encryptedBase64: string,
  key: CryptoKey,
  schema?: import('zod').ZodSchema<T>,
  onLegacyData?: (data: T) => void | Promise<void>
): Promise<T | null> => {
  try {
    const parsed = JSON.parse(atob(encryptedBase64), jsonReviver);
    if (!parsed.iv || !parsed.ct) {
      throw new Error("Invalid encrypted wrapper");
    }
    const ivArray = new Uint8Array(parsed.iv);
    const ctArray = new Uint8Array(parsed.ct);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivArray },
      key,
      ctArray
    );
    const dec = new TextDecoder();
    const parsedData = JSON.parse(dec.decode(decrypted), jsonReviver);
    return schema ? schema.parse(parsedData) : parsedData;
  } catch (error) {
    // Fallback for old unencrypted or old btoa() data
    try {
      const raw = atob(encryptedBase64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
      }
      const decodedData = new TextDecoder().decode(bytes);
      const parsedData = JSON.parse(decodedData, jsonReviver);
      const result = schema ? schema.parse(parsedData) : parsedData;
      if (onLegacyData && result) {
        // Run asynchronously without awaiting to prevent migration errors from failing the decryption
        Promise.resolve(onLegacyData(result)).catch(e => console.error("Legacy migration failed:", e));
      }
      return result;
    } catch (oldError) {
      return null;
    }
  }
};

export const exportKeyToBase64 = async (key: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey("raw", key);
  const uint8Exported = new Uint8Array(exported);

  // Optimization: Pre-allocated arrays are significantly faster than Array.from for TypedArrays
  const exportedArray = new Array(uint8Exported.length);
  for (let i = 0; i < uint8Exported.length; i++) {
    exportedArray[i] = uint8Exported[i];
  }

  return btoa(String.fromCharCode(...exportedArray));
};

export const importKeyFromBase64 = async (base64Str: string): Promise<CryptoKey> => {
  const raw = atob(base64Str);
  const keyData = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    keyData[i] = raw.charCodeAt(i);
  }
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
};
