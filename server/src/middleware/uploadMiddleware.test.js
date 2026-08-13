import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { uploadDocumentFile } from "./uploadMiddleware.js";

test("parses a multipart document upload", async () => {
  const boundary = "----privateai-test-boundary";
  const fileContent = Buffer.from("hello privateai");
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="name"\r\n\r\n` +
      `Test.txt\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="description"\r\n\r\n` +
      `Test description\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="Test.txt"\r\n` +
      `Content-Type: text/plain\r\n\r\n`
    ),
    fileContent,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const req = Readable.from([body]);
  req.headers = {
    "content-type": `multipart/form-data; boundary=${boundary}`,
  };
  req.is = (value) => value === "multipart/form-data";
  req.body = {};

  let middlewareError;
  await new Promise((resolve) => {
    uploadDocumentFile(req, {}, (error) => {
      middlewareError = error;
      resolve();
    });
  });

  assert.equal(middlewareError, undefined);
  assert.equal(req.body.name, "Test.txt");
  assert.equal(req.body.description, "Test description");
  assert.equal(req.file.originalname, "Test.txt");
  assert.equal(req.file.mimetype, "text/plain");
  assert.deepEqual(await fs.readFile(req.file.path), fileContent);

  await fs.rm(req.file.path, { force: true });
});
