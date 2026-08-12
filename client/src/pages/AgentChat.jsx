import ProtectedPagePlaceholder from '../components/ProtectedPagePlaceholder.jsx';

function AgentChat() {
  return (
    <ProtectedPagePlaceholder
      eyebrow="Agent chat"
      title="AI agent chat placeholder"
      description="All authenticated roles can reach the agent route. Confirm-before-execute chat behavior is intentionally deferred to the agent phase."
    />
  );
}

export default AgentChat;
