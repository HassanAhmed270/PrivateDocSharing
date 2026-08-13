import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const uploadsDirectory = path.resolve(process.cwd(), "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
  "text/html",
  "application/javascript",
  "text/javascript",
  "image/png",
  "image/jpeg",
]);

function getBoundary(contentType) {
  const match = contentType?.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match?.[1] || match?.[2] || null;
}

function parseDisposition(value) {
  const name = value.match(/(?:^|;)\s*name="([^"]+)"/i)?.[1] || null;
  const filename = value.match(/(?:^|;)\s*filename="([^"]*)"/i)?.[1] || null;
  return { name, filename };
}

async function readBody(req) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_FILE_SIZE + 1024 * 1024) {
      const error = new Error("Document file exceeds the 10 MB upload limit.");
      error.code = "LIMIT_FILE_SIZE";
      throw error;
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

export async function uploadDocumentFile(req, _res, next) {
  if (!req.is("multipart/form-data")) {
    return next();
  }

  req.body = {};

  try {
    await fs.mkdir(uploadsDirectory, { recursive: true });

    const boundary = getBoundary(req.headers["content-type"]);
    if (!boundary) {
      return next(Object.assign(new Error("Invalid multipart request."), { status: 400 }));
    }

    const body = await readBody(req);
    const delimiter = Buffer.from(`--${boundary}`);
    const parts = [];
    let cursor = body.indexOf(delimiter);

    while (cursor !== -1) {
      const nextBoundary = body.indexOf(delimiter, cursor + delimiter.length);
      if (nextBoundary === -1) break;

      let part = body.subarray(cursor + delimiter.length, nextBoundary);
      if (part.subarray(0, 2).equals(Buffer.from("\r\n"))) {
        part = part.subarray(2);
      }
      if (part.subarray(-2).equals(Buffer.from("\r\n"))) {
        part = part.subarray(0, -2);
      }

      const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
      if (headerEnd !== -1) {
        const headerText = part.subarray(0, headerEnd).toString("utf8");
        const content = part.subarray(headerEnd + 4);
        const disposition = headerText
          .split("\r\n")
          .find((line) => line.toLowerCase().startsWith("content-disposition:"));

        if (disposition) {
          const { name, filename } = parseDisposition(disposition);
          const mimeType =
            headerText
              .split("\r\n")
              .find((line) => line.toLowerCase().startsWith("content-type:"))
              ?.split(":").slice(1).join(":").trim() || "application/octet-stream";

          if (filename !== null && name === "file") {
            if (!allowedMimeTypes.has(mimeType)) {
              return next(Object.assign(new Error("Unsupported document type."), { status: 400 }));
            }

            if (content.length > MAX_FILE_SIZE) {
              const error = new Error("Document file exceeds the 10 MB upload limit.");
              error.code = "LIMIT_FILE_SIZE";
              return next(error);
            }

            const extension = path.extname(filename).toLowerCase();
            const generatedName = `${crypto.randomUUID()}${extension}`;
            const filePath = path.join(uploadsDirectory, generatedName);

            await fs.writeFile(filePath, content, { flag: "wx" });

            req.file = {
              fieldname: "file",
              originalname: path.basename(filename),
              encoding: "7bit",
              mimetype: mimeType,
              destination: uploadsDirectory,
              filename: generatedName,
              path: filePath,
              size: content.length,
            };
          } else if (name) {
            req.body[name] = content.toString("utf8");
          }
        }
      }

      cursor = nextBoundary;
    }

    next();
  } catch (error) {
    next(error);
  }
}
