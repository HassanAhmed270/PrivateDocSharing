const AES_256_KEY_BYTES = 32;
const HEX_ENCODED_AES_256_KEY_LENGTH = AES_256_KEY_BYTES * 2;

export function getEncryptionConfig(env = process.env) {
  const encryptionKey = env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    console.warn('ENCRYPTION_KEY not provided. Configure a 32-byte AES-256 key before enabling encrypted document storage.');
    return { encryptionKey: null, isConfigured: false };
  }

  if (!/^[a-f0-9]+$/i.test(encryptionKey) || encryptionKey.length !== HEX_ENCODED_AES_256_KEY_LENGTH) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte AES-256 key encoded as 64 hexadecimal characters.');
  }

  // Future improvement: support safe key rotation; out of scope for this MVP configuration step.
  return { encryptionKey, isConfigured: true };
}
