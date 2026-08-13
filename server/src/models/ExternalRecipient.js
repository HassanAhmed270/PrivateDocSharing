import mongoose from "mongoose";

const externalRecipientSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
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

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
      index: true,
    },

    company: {
      type: String,
      trim: true,
      maxlength: 255,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

externalRecipientSchema.index({
  organization: 1,
  email: 1,
});

externalRecipientSchema.index({
  organization: 1,
  createdAt: -1,
});

const ExternalRecipient = mongoose.model(
  "ExternalRecipient",
  externalRecipientSchema
);

export default ExternalRecipient;