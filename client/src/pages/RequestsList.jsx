import LinkButton from '../components/LinkButton.jsx';
import ProtectedPagePlaceholder from '../components/ProtectedPagePlaceholder.jsx';

function RequestsList() {
  return (
    <ProtectedPagePlaceholder
      eyebrow="Requests"
      title="Requests list placeholder"
      description="Authenticated users can reach the requests route. Request listing and status workflows are deferred to a later phase."
    >
      <LinkButton to="/requests/demo-request-id">Verify request detail route</LinkButton>
    </ProtectedPagePlaceholder>
  );
}

export default RequestsList;
