import { Link } from 'react-router-dom';

function LinkButton({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-600"
    >
      {children}
    </Link>
  );
}

export default LinkButton;
