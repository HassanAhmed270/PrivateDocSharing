import fs from 'fs/promises';
import path from 'path';

const SYSTEM_PROMPT_PATH = path.resolve(new URL(import.meta.url).pathname, '../services/agentSystemPrompt.txt');

// Default model if caller doesn't specify one. Can be overridden by passing model param.
const DEFAULT_MODEL = 'gemini-1.0';

function ensureEnv() {
  const key = process.env.LLM_API_KEY;
  const url = process.env.LLM_API_URL;
  if (!key || !url) {
    const err = new Error('LLM_API_KEY and LLM_API_URL must be set in environment to use agent service');
    err.status = 500;
    throw err;
  }
  return { key, url };
}

async function loadSystemPrompt() {
  try {
    const filePath = path.resolve(new URL(import.meta.url).pathname, '../services/agentSystemPrompt.txt');
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (err) {
    // Surface a clear error for debugging but don't include sensitive details
    const e = new Error('Failed to load agent system prompt');
    e.cause = err;
    e.status = 500;
    throw e;
  }
}

/**
 * sendMessage - low level function that sends a chat-style message to the configured LLM API
 *
 * The function expects the external Gemini-compatible API to accept a JSON body with the
 * following shape:
 * {
 *   model: string,
 *   messages: [ { role: 'system'|'user'|'assistant', content: string } ]
 * }
 *
 * It returns the parsed JSON response from the LLM. The service does not interpret or
 * persist the response; higher-level code is expected to validate and act on the returned
 * structured JSON (Agent must not write to DB).
 *
 * @param {string} userMessage - the user's prompt/message
 * @param {Object} opts - optional parameters
 * @param {string} opts.model - optional model name to use
 */
export async function sendMessage(userMessage, opts = {}) {
  if (typeof userMessage !== 'string' || userMessage.trim() === '') {
    const err = new Error('userMessage must be a non-empty string');
    err.status = 400;
    throw err;
  }

  const { key, url } = ensureEnv();
  const model = opts.model || DEFAULT_MODEL;

  const systemPrompt = await loadSystemPrompt();

  // Compose messages according to Gemini/chat formats
  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    // Optional: a client-provided request id or other metadata could be added here
  };

  // Use global fetch (Node 18+). Do not add any new dependencies.
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const e = new Error('Failed to connect to LLM host');
    e.cause = err;
    e.status = 502; // Bad gateway
    throw e;
  }

  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    // If API returned non-JSON, include the raw text for debugging but do not leak secrets
    const e = new Error('LLM responded with non-JSON payload');
    e.cause = new Error(text);
    e.status = resp.status || 502;
    throw e;
  }

  // Return raw parsed JSON to the caller for higher-level validation
  return { status: resp.status, headers: Object.fromEntries(resp.headers.entries()), body: data };
}
