import mongoose from "mongoose";

const agentAuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      maxlength: 100,
    },

    result: {
      type: String,
      enum: ["executed", "rejected", "blocked"],
      required: true,
    },

    reason: {
      type: String,
      maxlength: 500,
      default: null,
    },
  },
  { timestamps: true }
);

agentAuditLogSchema.index({
  organization: 1,
  user: 1,
  createdAt: -1,
});

export default mongoose.model("AgentAuditLog", agentAuditLogSchema);
