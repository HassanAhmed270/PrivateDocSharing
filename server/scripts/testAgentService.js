/*
  Simple test script to exercise the agentService.sendMessage function.
  This script is intentionally standalone and does not create any routes.

  Usage:
    NODE_ENV=development node server/scripts/testAgentService.js

  Requirements:
    - Set LLM_API_KEY and LLM_API_URL in server/.env or environment before running.
    - The script will print the raw response from the LLM service.
*/

import dotenv from 'dotenv';
dotenv.config({ path: new URL('../../server/.env', import.meta.url).pathname });

import { sendMessage } from '../src/services/agentService.js';

async function runTest() {
  try {
    const res = await sendMessage('Please produce a share_document intent for document id doc_abc with read access');
    console.log('LLM call succeeded. Raw response:');
    console.dir(res, { depth: null });
  } catch (err) {
    console.error('LLM call failed:', err.message);
    if (err.cause) console.error('Cause:', err.cause);
    process.exit(1);
  }
}

runTest();
