import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 255,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    filePath: {
      type: String,
      required: true,
      trim: true,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },

    encryptionIv: {
      type: String,
      default: null,
      select: false,
    },

    encryptionAuthTag: {
      type: String,
      default: null,
      select: false,
    },

    isEncrypted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({
  organization: 1,
  createdAt: -1,
});

const Document = mongoose.model("Document", documentSchema);

export default Document;