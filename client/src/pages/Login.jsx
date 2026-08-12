import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'Unable to log in. Please check your credentials and try again.'
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get('redirect');
    return redirect && redirect.startsWith('/') ? redirect : '/dashboard';
  }, [location.search]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      toast.success('Welcome back.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = getErrorMessage(error);
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Login"
      title="Welcome back"
      description="Use your organization credentials to continue."
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {errors.form ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
            {errors.form}
          </div>
        ) : null}

        <FormField
          id="email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@techtitanas.com"
          value={form.email}
          onChange={updateField}
          error={errors.email}
          required
        />

        <FormField
          id="password"
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={updateField}
          error={errors.password}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Need an account?{' '}
        <Link className="font-semibold text-brand-100 hover:text-white" to="/register">
          Register
        </Link>
      </p>
    </AuthCard>
  );
}

export default Login;
