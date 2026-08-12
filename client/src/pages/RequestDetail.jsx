import { useParams } from 'react-router-dom';
import ProtectedPagePlaceholder from '../components/ProtectedPagePlaceholder.jsx';

function RequestDetail() {
  const { id } = useParams();

  return (
    <ProtectedPagePlaceholder
      eyebrow="Request detail"
      title="Request detail placeholder"
      description="This protected dynamic route confirms that assigned request pages can be routed. Document view, discussion, and actions are deferred."
    >
      <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10">
        <p className="text-sm text-slate-400">Route parameter</p>
        <p className="mt-1 break-all font-mono text-brand-100">{id}</p>
      </div>
    </ProtectedPagePlaceholder>
  );
}

export default RequestDetail;
