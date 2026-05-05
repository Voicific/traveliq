import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.tsx';

const SupplierRegisterPage: React.FC = () => {
  const { signUp, isConfigured } = useSupabaseAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', companyName: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSubmitting(true);
    const { error } = await signUp(form.email, form.password, {
      full_name: form.fullName,
      company_name: form.companyName,
    });
    setSubmitting(false);
    if (error) { setError(error); return; }
    setSuccess(true);
    setTimeout(() => navigate('/supplier-portal/login'), 2500);
  };

  const inputClass = "mt-1 w-full px-4 py-3 text-white bg-[#0a1628]/80 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all placeholder-gray-500";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]">
        <div className="max-w-md w-full bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-10 text-center">
          <svg className="h-12 w-12 text-cyan-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-white">Account created</h2>
          <p className="mt-2 text-gray-300">Check your email to confirm your address, then log in to set up your supplier profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-heading text-white">Become a TravelIQ Supplier</h1>
          <p className="mt-3 text-gray-300">Set up your AI Sales Assistant and start engaging travel agents across the UK and Europe.</p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm">
            Supplier sign-up is not yet configured on this environment. Please contact <a className="underline" href="mailto:hello@beeancy.com">hello@beeancy.com</a>.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-300">Your Name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Jane Smith" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Company / Brand Name</label>
            <input name="companyName" value={form.companyName} onChange={handleChange} required placeholder="Your travel brand" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Work Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@brand.com" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} placeholder="At least 8 characters" className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Confirm Password</label>
            <input type="password" name="confirm" value={form.confirm} onChange={handleChange} required className={inputClass} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={submitting || !isConfigured} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
          <p className="text-sm text-gray-400 text-center">
            Already a supplier? <Link to="/supplier-portal/login" className="text-cyan-400 hover:underline">Log in</Link>
          </p>
          <p className="text-xs text-gray-500 text-center">By creating an account you agree to our <Link to="/terms" className="text-cyan-400 hover:underline">Terms</Link> and <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link>.</p>
        </form>
      </div>
    </div>
  );
};

export default SupplierRegisterPage;
