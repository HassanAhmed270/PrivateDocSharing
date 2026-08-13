import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    recipientType: {
      type: String,
      enum: ["internal_user", "external_recipient"],
      required: true,
      index: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "recipientModel",
      required: true,
    },

    recipientModel: {
      type: String,
      enum: ["User", "ExternalRecipient"],
      required: true,
    },

    type: {
      type: String,
      enum: [
        "document_request",
        "document_request_accepted",
        "document_request_rejected",
        "document_request_signed",
        "document_request_completed",
      ],
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    documentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocumentRequest",
      default: null,
      index: true,
    },

    actionUrl: {
      type: String,
      default: null,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  organization: 1,
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;