import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const AES_256_KEY_BYTES = 32;
const GCM_IV_BYTES = 12;
const HEX_ENCODED_AES_256_KEY_LENGTH = AES_256_KEY_BYTES * 2;

function getEncryptionKey(env = process.env) {
  const encryptionKey = env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error('ENCRYPTION_KEY is required to use AES-256-GCM encryption. Configure a 32-byte key encoded as 64 hexadecimal characters.');
  }

  if (!/^[a-f0-9]+$/i.test(encryptionKey) || encryptionKey.length !== HEX_ENCODED_AES_256_KEY_LENGTH) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte AES-256 key encoded as 64 hexadecimal characters.');
  }

  return Buffer.from(encryptionKey, 'hex');
}

function assertBuffer(value, name) {
  if (!Buffer.isBuffer(value)) {
    throw new TypeError(`${name} must be a Buffer.`);
  }
}

export function encryptBuffer(buffer) {
  assertBuffer(buffer, 'buffer');

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(GCM_IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return { ciphertext, iv, authTag };
}

export function decryptBuffer(ciphertext, iv, authTag) {
  assertBuffer(ciphertext, 'ciphertext');
  assertBuffer(iv, 'iv');
  assertBuffer(authTag, 'authTag');

  const key = getEncryptionKey();

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch (error) {
    throw new Error('Failed to decrypt buffer: encrypted data or authentication tag is invalid.');
  }
}

export const encryptionInternals = {
  getEncryptionKey,
};
