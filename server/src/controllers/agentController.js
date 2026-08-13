import {
  interpretCommand,
} from "../services/agentService.js";
import { validateAgentIntent } from "../validators/agentIntentValidator.js";
import { checkAgentPermission } from "../services/agentPermissionService.js";
import {
  checkAgentGuardrails,
} from "../services/agentGuardrailService.js";
import {
  executeAgentIntent,
} from "../services/agentExecutionService.js";
import { writeAgentAuditLog } from "../services/agentAuditService.js";

async function safeAudit(payload) {
  try {
    await writeAgentAuditLog(payload);
  } catch (error) {
    console.error("Agent audit logging error:", error.message);
  }
}

function confirmationFor(intent) {
  switch (intent.action) {
    case "SEND_DOCUMENT":
      return `I will send "${intent.documentName}" to "${intent.recipientName}" through the normal document-request flow.`;
    case "SHOW_PENDING_REQUESTS":
      return "I will show your pending document requests.";
    case "SHOW_DOCUMENT_STATUS":
      return `I will show the status of "${intent.documentName}".`;
    case "FIND_DOCUMENTS_UNDER_DISCUSSION":
      return "I will find your documents currently under discussion.";
    case "VIEW_DOCUMENT_FOR_DISCUSSION":
      return "I will use the authorized document linked to this discussion request to answer your question.";
    default:
      return "The requested agent action was completed.";
  }
}

export const command = async (req, res) => {
  let action = "UNKNOWN";
  const userId = req.user?._id;
  const organizationId = req.organizationId;

  try {
    const { message } = req.body || {};

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      await safeAudit({
        userId,
        organizationId,
        action,
        result: "rejected",
        reason: "message is required and must be a non-empty string.",
      });

      return res.status(400).json({
        success: false,
        message: "message is required and must be a non-empty string.",
      });
    }

    const inputGuardrail = checkAgentGuardrails({
      user: req.user,
      message,
      intent: { action: "UNKNOWN" },
    });

    if (!inputGuardrail.allowed) {
      const reason = inputGuardrail.violations.join(", ");

      await safeAudit({
        userId,
        organizationId,
        action,
        result: "blocked",
        reason,
      });

      return res.status(403).json({
        success: false,
        message: "Agent request blocked by guardrails.",
      });
    }

    const intent = await interpretCommand(message);
    action = intent?.action || "UNKNOWN";

    const validation = validateAgentIntent(intent);

    if (!validation.valid) {
      await safeAudit({
        userId,
        organizationId,
        action,
        result: "rejected",
        reason: validation.reason,
      });

      return res.status(400).json({
        success: false,
        message: "The agent produced an invalid intent.",
        reason: validation.reason,
      });
    }

    const guardrailResult = checkAgentGuardrails({
      user: req.user,
      intent,
      message,
    });

    if (!guardrailResult.allowed) {
      const reason = guardrailResult.violations.join(", ");

      await safeAudit({
        userId,
        organizationId,
        action,
        result: "blocked",
        reason,
      });

      return res.status(403).json({
        success: false,
        message: "Agent request blocked by guardrails.",
      });
    }

    const permission = await checkAgentPermission(
      req.user,
      intent
    );

    if (!permission.allowed) {
      await safeAudit({
        userId,
        organizationId,
        action,
        result: "rejected",
        reason: permission.reason,
      });

      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
        reason: permission.reason,
      });
    }

    const result = await executeAgentIntent(
      intent,
      req.user,
      message
    );

    await safeAudit({
      userId,
      organizationId,
      action,
      result: "executed",
    });

    return res.status(200).json({
      success: true,
      intent,
      confirmation: confirmationFor(intent),
      result,
    });
  } catch (error) {
    const status = Number.isInteger(error.status)
      ? error.status
      : 500;

    await safeAudit({
      userId,
      organizationId,
      action,
      result: "rejected",
      reason:
        status >= 500
          ? "Agent execution failed."
          : error.message,
    });

    console.error("Agent command error:", error.message);

    return res.status(status).json({
      success: false,
      message:
        status >= 500
          ? "Unable to process the agent command."
          : error.message,
    });
  }
};
