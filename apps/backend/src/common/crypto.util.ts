import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const ENCODING: BufferEncoding = 'hex';

/**
 * Get AES key from environment.
 * Must be 32 bytes (64 hex characters) for AES-256.
 */
function getKey(key: string): Buffer {
  if (!key) {
    throw new Error(
      'AES encryption key string not provided. Must be 32 bytes (64 hex characters) for AES-256.',
    );
  }
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns: iv:authTag:ciphertext (all hex-encoded)
 */
export function encrypt(plaintext: string, keyStr: string): string {
  const key = getKey(keyStr);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
  encrypted += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag();

  // Format: iv:tag:ciphertext
  return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
}

/**
 * Decrypt a string encrypted by encrypt().
 * Input format: iv:authTag:ciphertext (all hex-encoded)
 */
export function decrypt(encryptedData: string, keyStr: string): string {
  const key = getKey(keyStr);
  const parts = encryptedData.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivHex, tagHex, ciphertext] = parts;
  const iv = Buffer.from(ivHex, ENCODING);
  const authTag = Buffer.from(tagHex, ENCODING);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, ENCODING, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Check if a string looks like it's already encrypted (iv:tag:ciphertext format).
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  if (parts.length !== 3) return false;
  // Check if all parts are valid hex
  return parts.every((part) => /^[0-9a-f]+$/i.test(part));
}
