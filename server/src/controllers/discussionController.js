import {
  answerDocumentQuestion,
} from "../services/agentService.js";

// export const discussDocumentRequest = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { comment } = req.body;

//     if (!comment || typeof comment !== "string" || !comment.trim()) {
//       return res.status(400).json({
//         success: false,
//         message: "Comment is required.",
//       });
//     }

//     const request = await DocumentRequest.findOne({
//       _id: id,
//       organization: req.organizationId,
//       recipient: req.user._id,
//       status: {
//         $in: ["pending", "in_review", "discussion"],
//       },
//     }).populate("document");

//     if (!request) {
//       return res.status(404).json({
//         success: false,
//         message: "Document request not found.",
//       });
//     }

//     const cleanComment = comment.trim();

//     /*
//      * Move request into discussion mode.
//      */
//     request.status = "discussion";
//     request.recipientComment = cleanComment;

//     /*
//      * Get document content.
//      *
//      * IMPORTANT:
//      * Replace this with your actual document-text field
//      * or document extraction service.
//      */
//     const documentText =
//       request.document?.text ||
//       request.document?.extractedText ||
//       request.document?.content ||
//       "";

//     /*
//      * Ask AI agent about the document.
//      */
//     const agentResponse = await answerDocumentQuestion(
//       cleanComment,
//       documentText
//     );

//     await request.save();

//     /*
//      * Audit user discussion.
//      */
//     await createRequestAudit({
//       request,
//       action: "discussion",
//       actorType: "internal_user",
//       actor: req.user._id,
//       actorModel: "User",
//       metadata: {
//         comment: cleanComment,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Discussion started successfully.",
//       data: {
//         request,
//         discussion: {
//           userMessage: cleanComment,
//           agentResponse,
//         },
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Discuss document request error:",
//       error
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Server error while processing discussion.",
//     });
//   }
// };