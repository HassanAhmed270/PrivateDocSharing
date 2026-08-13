import mongoose from "mongoose";

const documentRequestSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientType: {
      type: String,
      enum: ["internal", "external"],
      required: true,
      default: "internal",
      index: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
      index: true,
    },

    externalRecipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExternalRecipient",
      default: null,
      index: true,
    },

    externalAccessTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    externalAccessTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    externalAccessUsedAt: {
      type: Date,
      default: null,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "opened",
        "in_review",
        "discussion",
        "accepted",
        "rejected",
        "signed",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    recipientComment: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    signature: {
      type: String,
      default: null,
      select: false,
    },

    signedAt: {
      type: Date,
      default: null,
    },


    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

documentRequestSchema.index({
  organization: 1,
  createdAt: -1,
});

documentRequestSchema.index({
  document: 1,
  status: 1,
});

documentRequestSchema.index({
  recipient: 1,
  status: 1,
});

const DocumentRequest = mongoose.model(
  "DocumentRequest",
  documentRequestSchema
);

export default DocumentRequest;