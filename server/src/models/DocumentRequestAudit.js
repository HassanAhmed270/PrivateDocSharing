import mongoose from "mongoose";

const documentRequestAuditSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    documentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentRequest",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "created",
        "opened",
        "reviewed",
        "discussed",
        "accepted",
        "rejected",
        "signed",
        "completed",
        "cancelled",
      ],
      required: true,
    },

    actorType: {
      type: String,
      enum: ["internal_user", "external_recipient"],
      required: true,
    },

    actor: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "actorModel",
      default: null,
    },

    actorModel: {
      type: String,
      enum: ["User", "ExternalRecipient"],
      default: null,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

documentRequestAuditSchema.index({
  organization: 1,
  documentRequest: 1,
  createdAt: -1,
});

const DocumentRequestAudit = mongoose.model(
  "DocumentRequestAudit",
  documentRequestAuditSchema
);

export default DocumentRequestAudit;