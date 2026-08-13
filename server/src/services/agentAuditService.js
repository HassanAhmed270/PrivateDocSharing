import AgentAuditLog from "../models/AgentAuditLog.js";

export async function writeAgentAuditLog({
  userId,
  organizationId,
  action,
  result,
  reason = null,
}) {
  return AgentAuditLog.create({
    user: userId,
    organization: organizationId,
    action,
    result,
    reason,
  });
}
