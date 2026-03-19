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
  
  const ivArray = Array.from(iv);
  const cipherArray = Array.from(new Uint8Array(ciphertext));
  return btoa(JSON.stringify({ iv: ivArray, ct: cipherArray }));
};

export const decryptObject = async (encryptedBase64: string, key: CryptoKey): Promise<any> => {
  try {
    const parsed = JSON.parse(atob(encryptedBase64));
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
    return JSON.parse(dec.decode(decrypted));
  } catch (error) {
    // Fallback for old unencrypted or old btoa() data
    try {
      const decodedData = decodeURIComponent(escape(atob(encryptedBase64))); 
      return JSON.parse(decodedData);
    } catch (oldError) {
      if (encryptedBase64 !== null && encryptedBase64 !== '') {
          try {
              return JSON.parse(encryptedBase64);
          } catch (e) {
              return null;
          }
      }
      return null;
    }
  }
};

export const exportKeyToBase64 = async (key: CryptoKey): Promise<string> => {
  const exported = await crypto.subtle.exportKey("raw", key);
  const exportedArray = Array.from(new Uint8Array(exported));
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
