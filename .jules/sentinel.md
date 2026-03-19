## 2024-05-24 - Deprecated `escape` usage for Base64 Decoding
**Vulnerability:** Used `decodeURIComponent(escape(atob(encryptedBase64)))` to parse old data. The `escape` function is deprecated and does not safely or robustly handle UTF-8/Unicode strings, potentially leading to injection or data corruption.
**Learning:** Legacy string conversion tricks for converting binary Base64 strings to UTF-8 are unsafe.
**Prevention:** Use standard, robust encoding/decoding APIs (e.g., `Uint8Array` + `TextDecoder`) for parsing binary strings instead of deprecated string functions.
## 2024-03-24 - Insecure Decryption Fallback
**Vulnerability:** The `decryptObject` function in `src/crypto.ts` catches decryption errors and falls back to parsing the data as unencrypted text or old decoded base64 strings.
**Learning:** If an attacker modifies the ciphertext or an invalid encrypted string is presented, the decryption fail-open behavior could bypass the encryption and return arbitrary parsed JSON (potentially attacker-controlled unencrypted strings if the input isn't validated or if local storage is modified). The system prompt also explicitly specifies: "The `src/crypto.ts` module provides cryptographic utilities using AES-GCM for object encryption/decryption and PBKDF2 for key derivation. Decryption functions must not fall back to parsing unencrypted data."
**Prevention:** Remove fallback parsing blocks in decryption routines. If decryption fails, the function should explicitly throw an error or return a safe default, not attempt to parse raw input.
