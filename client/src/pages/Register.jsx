import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuthCard from '../components/AuthCard.jsx';
import FormField from '../components/FormField.jsx';
import { registerUser } from '../services/auth.js';
import { getRuntimeConfig } from '../utils/env.js';

const { organizationEmailDomain } = getRuntimeConfig();

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    'Unable to register. Please try again.'
  );
}

function isAcceptedOrganizationEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedDomain = organizationEmailDomain.trim().toLowerCase().replace(/^@/, '');

  return normalizedEmail.endsWith(`@${normalizedDomain}`);
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined, form: undefined }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Name is required.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!isAcceptedOrganizationEmail(form.email)) {
      nextErrors.email = `Use your ${organizationEmailDomain} organization email address.`;
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
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
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      toast.success('Registration successful. Please log in.');
      navigate('/login', { replace: true });
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
      eyebrow="Register"
      title="Create your account"
      description={`Registration is limited to ${organizationEmailDomain} organization email addresses. The backend performs the final validation.`}
    >
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {errors.form ? (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">
            {errors.form}
          </div>
        ) : null}

        <FormField
          id="name"
          label="Name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
          value={form.name}
          onChange={updateField}
          error={errors.name}
          required
        />

        <FormField
          id="email"
          label="Organization email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={`you@${organizationEmailDomain}`}
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
          autoComplete="new-password"
          placeholder="Create a secure password"
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
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link className="font-semibold text-brand-100 hover:text-white" to="/login">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

export default Register;
