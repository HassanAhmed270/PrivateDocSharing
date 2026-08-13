import DocumentRequestAudit from "../models/DocumentRequestAudit.js";

export const getDocumentRequestAuditHistory = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const history = await DocumentRequestAudit.find({
      organization: req.organizationId,
      documentRequest: id,
    })
      .populate("actor", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: {
        history,
      },
    });
  } catch (error) {
    console.error(
      "Get document request audit history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching request history.",
    });
  }
};