import api from './api.js';

export async function sendAgentCommand(message) {
  const { data } = await api.post(
  "/api/agent/command",
  { message }
);
  return data;
}
