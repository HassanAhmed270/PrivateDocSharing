import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const GCM_IV_BYTES = 12;
const AES_256_KEY_BYTES = 32;
const HEX_KEY_LENGTH = AES_256_KEY_BYTES * 2;

function getEncryptionKey(env = process.env) {
  const value = env.ENCRYPTION_KEY;

  if (!value) {
    throw new Error(
      "ENCRYPTION_KEY is required to use AES-256-GCM encryption. Configure a 32-byte key encoded as 64 hexadecimal characters."
    );
  }

  if (!/^[a-f0-9]+$/i.test(value) || value.length !== HEX_KEY_LENGTH) {
    throw new Error(
      "ENCRYPTION_KEY must be a 32-byte AES-256 key encoded as 64 hexadecimal characters."
    );
  }

  return Buffer.from(value, "hex");
}

function assertBuffer(value, name) {
  if (!Buffer.isBuffer(value)) {
    throw new TypeError(`${name} must be a Buffer.`);
  }
}

export function encryptBuffer(buffer) {
  assertBuffer(buffer, "buffer");

  const iv = crypto.randomBytes(GCM_IV_BYTES);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv
  );

  const ciphertext = Buffer.concat([
    cipher.update(buffer),
    cipher.final(),
  ]);

  return {
    ciphertext,
    iv,
    authTag: cipher.getAuthTag(),
  };
}

export function decryptBuffer(ciphertext, iv, authTag) {
  assertBuffer(ciphertext, "ciphertext");
  assertBuffer(iv, "iv");
  assertBuffer(authTag, "authTag");

  try {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getEncryptionKey(),
      iv
    );
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
  } catch {
    throw new Error(
      "Failed to decrypt buffer: encrypted data or authentication tag is invalid."
    );
  }
}

