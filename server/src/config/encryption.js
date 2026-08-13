const AES_256_KEY_BYTES = 32;
const HEX_ENCODED_AES_256_KEY_LENGTH = AES_256_KEY_BYTES * 2;

export function getEncryptionConfig(env = process.env) {
  const encryptionKey = env.ENCRYPTION_KEY;

  if (!encryptionKey) {
    throw new Error(
      "ENCRYPTION_KEY is required. Configure a 32-byte AES-256 key encoded as 64 hexadecimal characters."
    );
  }

  if (
    !/^[a-f0-9]+$/i.test(encryptionKey) ||
    encryptionKey.length !== HEX_ENCODED_AES_256_KEY_LENGTH
  ) {
    throw new Error(
      "ENCRYPTION_KEY must be a 32-byte AES-256 key encoded as 64 hexadecimal characters."
    );
  }

  // Future improvement: safe key rotation is out of scope for this MVP.
  return { encryptionKey, isConfigured: true };
}
