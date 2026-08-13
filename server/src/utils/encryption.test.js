import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

const TEST_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

let originalKey;

beforeEach(() => {
  originalKey = process.env.ENCRYPTION_KEY;
  process.env.ENCRYPTION_KEY = TEST_KEY;
});

afterEach(() => {
  if (originalKey === undefined) delete process.env.ENCRYPTION_KEY;
  else process.env.ENCRYPTION_KEY = originalKey;
});

describe("AES-256-GCM", async () => {
  const { encryptBuffer, decryptBuffer } = await import("./encryption.js");

  it("round-trips a buffer exactly", () => {
    const input = Buffer.from("PrivateAI encrypted content 🔒");
    const encrypted = encryptBuffer(input);
    const output = decryptBuffer(
      encrypted.ciphertext,
      encrypted.iv,
      encrypted.authTag
    );

    assert.deepEqual(output, input);
    assert.equal(encrypted.iv.length, 12);
    assert.equal(encrypted.authTag.length, 16);
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encryptBuffer(Buffer.from("tamper"));
    encrypted.ciphertext[0] ^= 0xff;

    assert.throws(
      () =>
        decryptBuffer(
          encrypted.ciphertext,
          encrypted.iv,
          encrypted.authTag
        ),
      /encrypted data or authentication tag is invalid/i
    );
  });

  it("rejects tampered auth tags", () => {
    const encrypted = encryptBuffer(Buffer.from("tamper"));
    encrypted.authTag[0] ^= 0xff;

    assert.throws(
      () =>
        decryptBuffer(
          encrypted.ciphertext,
          encrypted.iv,
          encrypted.authTag
        ),
      /encrypted data or authentication tag is invalid/i
    );
  });

  it("rejects a missing key", () => {
    delete process.env.ENCRYPTION_KEY;

    assert.throws(
      () => encryptBuffer(Buffer.from("key required")),
      /ENCRYPTION_KEY is required/i
    );
  });
});
