import { GoogleGenAI } from "@google/genai";
import {
  agentSystemPrompt,
  documentAnswerSystemPrompt,
} from "../config/agentPrompt.js";

const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not configured.");
}

const ai = new GoogleGenAI({ apiKey });

function validateMessage(message, fieldName = "Message") {
  if (
    !message ||
    typeof message !== "string" ||
    !message.trim()
  ) {
    throw new Error(`${fieldName} is required.`);
  }

  return message.trim();
}

export async function askAgent(message) {
  const cleanMessage = validateMessage(message);

  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction: agentSystemPrompt,
    },
    contents: cleanMessage,
  });

  return response.text?.trim() || "";
}

export async function interpretCommand(message) {
  const response = await askAgent(message);

  try {
    return JSON.parse(response);
  } catch {
    throw new Error("Agent returned invalid JSON.");
  }
}

export async function answerDocumentQuestion(
  question,
  documentText = ""
) {
  const cleanQuestion = validateMessage(
    question,
    "Document question"
  );

  const safeText =
    typeof documentText === "string"
      ? documentText.slice(0, 12000)
      : "";

  const response = await ai.models.generateContent({
    model,
    config: {
      systemInstruction: documentAnswerSystemPrompt,
    },
    contents: `
User question:
${cleanQuestion}

Document content:
---
${safeText}
---

Answer the user's question based on the document.
If the document does not contain enough information, clearly say so.
`,
  });

  return (
    response.text?.trim() ||
    "The agent could not produce an answer."
  );
}