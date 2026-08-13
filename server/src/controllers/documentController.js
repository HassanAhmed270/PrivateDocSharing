import fs from "fs/promises";
import path from "path";
import Document from "../models/Document.js";
import DocumentRequest from "../models/DocumentRequest.js";
import { canUserAccessDocument } from "../services/documentAccessService.js";
import {
  encryptExistingFile,
  decryptDocumentBuffer,
} from "../services/documentStorageService.js";

function publicDocument(document) {
  const value = document.toObject
    ? document.toObject()
    : { ...document };

  delete value.encryptionIv;
  delete value.encryptionAuthTag;
  delete value.filePath;

  value.hasEncryptedContent = Boolean(document.isEncrypted);

  return value;
}

export const createDocument = async (req, res) => {
  try {
    const { name, description } = req.body;
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "A document file is required.",
      });
    }

    const documentName = String(name || uploadedFile.originalname || "").trim();

    if (!documentName) {
      await fs.rm(uploadedFile.path, { force: true });
      return res.status(400).json({
        success: false,
        message: "Document name is required.",
      });
    }

    let encryptedStorage;

    try {
      encryptedStorage = await encryptExistingFile(
        path.relative(process.cwd(), uploadedFile.path)
      );
    } catch (error) {
      await fs.rm(uploadedFile.path, { force: true });

      if (error.code === "ENOENT") {
        return res.status(400).json({
          success: false,
          message: "Document file could not be read.",
        });
      }

      console.error("Document encryption error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to securely store the document.",
      });
    }

    const document = await Document.create({
      organization: req.organizationId,
      uploadedBy: req.user._id,
      name: documentName,
      description: String(description || "").trim(),
      fileName: uploadedFile.originalname,
      filePath: encryptedStorage.filePath,
      mimeType: uploadedFile.mimetype,
      fileSize: uploadedFile.size,
      encryptionIv: encryptedStorage.encryptionIv,
      encryptionAuthTag: encryptedStorage.encryptionAuthTag,
      isEncrypted: true,
    });

    return res.status(201).json({
      success: true,
      message: "Document created and encrypted successfully.",
      data: {
        document: publicDocument(document),
      },
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.rm(req.file.path, { force: true }).catch(() => {});
    }

    console.error("Create document error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating document.",
    });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const requestDocumentIds = await DocumentRequest.distinct("document", {
      organization: req.organizationId,
      $or: [
        { requestedBy: req.user._id },
        { recipient: req.user._id },
      ],
      status: {
        $nin: ["rejected", "cancelled"],
      },
    });

    const documents = await Document.find({
      organization: req.organizationId,
      status: "active",
      $or: [
        { uploadedBy: req.user._id },
        { _id: { $in: requestDocumentIds } },
      ],
    })
      .populate("uploadedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        documents: documents.map(publicDocument),
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching documents.",
    });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      organization: req.organizationId,
      status: "active",
    })
      .select("+encryptionIv +encryptionAuthTag")
      .populate("uploadedBy", "name email role");

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    const hasAccess = await canUserAccessDocument({
      document,
      userId: req.user._id,
      organizationId: req.organizationId,
    });

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this document.",
      });
    }

    if (req.query.download === "true") {
      try {
        const content = await decryptDocumentBuffer(document);

        res.setHeader(
          "Content-Type",
          document.mimeType || "application/octet-stream"
        );
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(document.fileName)}"`
        );

        return res.status(200).send(content);
      } catch (error) {
        console.error("Document decryption error:", error.message);

        return res.status(500).json({
          success: false,
          message: "Unable to retrieve document.",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        document: publicDocument(document),
      },
    });
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching document.",
    });
  }
};

export const archiveDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOneAndUpdate(
      {
        _id: id,
        organization: req.organizationId,
        status: "active",
      },
      {
        status: "archived",
      },
      {
        new: true,
      }
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document archived successfully.",
      data: {
        document: publicDocument(document),
      },
    });
  } catch (error) {
    console.error("Archive document error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while archiving document.",
    });
  }
};
