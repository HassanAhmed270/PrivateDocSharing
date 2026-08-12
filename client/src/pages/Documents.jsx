import { Link } from 'react-router-dom';
import ProtectedPagePlaceholder from '../components/ProtectedPagePlaceholder.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { isRoleAllowed, OWNER_REVIEWER_ROLES } from '../utils/roles.js';

function Documents() {
  const { user } = useAuth();
  const canUpload = isRoleAllowed(user?.role, OWNER_REVIEWER_ROLES);

  return (
    <ProtectedPagePlaceholder
      eyebrow="Documents"
      title="Documents placeholder"
      description="Authenticated users can reach the documents route. Listing, filtering, and previews are deferred to the document phase."
    >
      {canUpload ? (
        <Link
          to="/documents/upload"
          className="inline-flex rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-600"
        >
          Verify owner/reviewer upload route
        </Link>
      ) : (
        <p className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
          Members can view documents when implemented, but upload access is restricted to owners and reviewers.
        </p>
      )}
    </ProtectedPagePlaceholder>
  );
}

export default Documents;
