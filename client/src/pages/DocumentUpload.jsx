import ProtectedPagePlaceholder from '../components/ProtectedPagePlaceholder.jsx';

function DocumentUpload() {
  return (
    <ProtectedPagePlaceholder
      eyebrow="Document upload"
      title="Owner/reviewer upload placeholder"
      description="This role-restricted route is available only to owners and reviewers. File upload forms are deferred to the document upload phase."
    />
  );
}

export default DocumentUpload;
