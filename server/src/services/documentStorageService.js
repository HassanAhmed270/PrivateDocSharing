import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { encryptBuffer, decryptBuffer } from "../utils/encryption.js";

const uploadsDirectory = path.resolve(process.cwd(), "uploads");

function assertSafeUploadPath(filePath) {
  if (!filePath || typeof filePath !== "string") {
    throw new Error("A valid upload file path is required.");
  }

  const resolved = path.resolve(process.cwd(), filePath);
  const relative = path.relative(uploadsDirectory, resolved);

  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error("Document file path must be inside the uploads directory.");
  }

  return resolved;
}

export async function encryptExistingFile(filePath) {
  const sourcePath = assertSafeUploadPath(filePath);
  const plaintext = await fs.readFile(sourcePath);
  const { ciphertext, iv, authTag } = encryptBuffer(plaintext);

  await fs.mkdir(uploadsDirectory, { recursive: true });

  const encryptedName = `${crypto.randomUUID()}.enc`;
  const encryptedPath = path.join(uploadsDirectory, encryptedName);
  const temporaryPath = `${encryptedPath}.tmp`;

  try {
    await fs.writeFile(temporaryPath, ciphertext, { flag: "wx" });
    await fs.rename(temporaryPath, encryptedPath);

    if (sourcePath !== encryptedPath) {
      await fs.unlink(sourcePath);
    }
  } catch (error) {
    await fs.rm(temporaryPath, { force: true });
    await fs.rm(encryptedPath, { force: true });
    throw error;
  }

  return {
    filePath: path.relative(process.cwd(), encryptedPath),
    encryptionIv: iv.toString("hex"),
    encryptionAuthTag: authTag.toString("hex"),
    isEncrypted: true,
  };
}

export async function decryptDocumentBuffer(document) {
  if (!document?.isEncrypted) {
    throw new Error("Document is not stored in encrypted format.");
  }

  if (!document.filePath || !document.encryptionIv || !document.encryptionAuthTag) {
    throw new Error("Document encryption metadata is incomplete.");
  }

  const encryptedPath = assertSafeUploadPath(document.filePath);
  const ciphertext = await fs.readFile(encryptedPath);

  return decryptBuffer(
    ciphertext,
    Buffer.from(document.encryptionIv, "hex"),
    Buffer.from(document.encryptionAuthTag, "hex")
  );
}

export async function getDecryptedDocumentText(document) {
  const buffer = await decryptDocumentBuffer(document);
  const mimeType = (document.mimeType || "").toLowerCase();
  const extension = path.extname(document.fileName || "").toLowerCase();

  const textLike =
    mimeType.startsWith("text/") ||
    [
      "application/json",
      "application/xml",
      "application/javascript",
      "application/x-javascript",
    ].includes(mimeType) ||
    [".txt", ".md", ".csv", ".json", ".xml", ".html", ".htm", ".js", ".css"].includes(extension);

  if (!textLike) {
    return {
      supported: false,
      text: "",
      reason: "This document type cannot be safely converted to text by the current MVP."
    };
  }

  const text = buffer.toString("utf8");
  const replacementCount = (text.match(/\uFFFD/g) || []).length;

  if (replacementCount > Math.max(2, text.length * 0.01)) {
    return {
      supported: false,
      text: "",
      reason: "The stored document does not contain safely decodable text."
    };
  }

  return {
    supported: true,
    text,
    reason: null,
  };
}
