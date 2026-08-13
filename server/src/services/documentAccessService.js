import DocumentRequest from "../models/DocumentRequest.js";

export async function canUserAccessDocument({
  document,
  userId,
  organizationId,
}) {
  if (!document || String(document.organization) !== String(organizationId)) {
    return false;
  }

  const uploadedById = document.uploadedBy?._id || document.uploadedBy;

  if (String(uploadedById) === String(userId)) {
    return true;
  }

  const request = await DocumentRequest.exists({
    organization: organizationId,
    document: document._id,
    $or: [
      { requestedBy: userId },
      { recipient: userId },
    ],
    status: {
      $nin: ["rejected", "cancelled"],
    },
  });

  return Boolean(request);
}
