import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';

const TEST_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

let originalEncryptionKey;

beforeEach(() => {
  originalEncryptionKey = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = TEST_KEY;
});

afterEach(() => {
  if (originalEncryptionKey === undefined) {
    delete process.env.ENCRYPTION_KEY;
  } else {
    process.env.ENCRYPTION_KEY = originalEncryptionKey;
  }
});

describe('AES-256-GCM buffer encryption utility', async () => {
  const { decryptBuffer, encryptBuffer } = await import('./encryption.js');

  it('encrypts then decrypts a buffer exactly', () => {
    const plaintext = Buffer.from('Private document content with unicode: 🔒', 'utf8');

    const { ciphertext, iv, authTag } = encryptBuffer(plaintext);
    const decrypted = decryptBuffer(ciphertext, iv, authTag);

    assert.deepEqual(decrypted, plaintext);
    assert.notDeepEqual(ciphertext, plaintext);
    assert.equal(iv.length, 12);
    assert.equal(authTag.length, 16);
  });

  it('fails decryption when ciphertext is tampered with', () => {
    const plaintext = Buffer.from('tamper-check-ciphertext', 'utf8');
    const encrypted = encryptBuffer(plaintext);
    const tamperedCiphertext = Buffer.from(encrypted.ciphertext);
    tamperedCiphertext[0] ^= 0xff;

    assert.throws(
      () => decryptBuffer(tamperedCiphertext, encrypted.iv, encrypted.authTag),
      /encrypted data or authentication tag is invalid/i,
    );
  });

  it('fails decryption when authTag is tampered with', () => {
    const plaintext = Buffer.from('tamper-check-auth-tag', 'utf8');
    const encrypted = encryptBuffer(plaintext);
    const tamperedAuthTag = Buffer.from(encrypted.authTag);
    tamperedAuthTag[0] ^= 0xff;

    assert.throws(
      () => decryptBuffer(encrypted.ciphertext, encrypted.iv, tamperedAuthTag),
      /encrypted data or authentication tag is invalid/i,
    );
  });

  it('throws a clear config error when ENCRYPTION_KEY is missing', () => {
    delete process.env.ENCRYPTION_KEY;

    assert.throws(
      () => encryptBuffer(Buffer.from('requires-key', 'utf8')),
      /ENCRYPTION_KEY is required.*32-byte key encoded as 64 hexadecimal characters/i,
    );
  });
});
