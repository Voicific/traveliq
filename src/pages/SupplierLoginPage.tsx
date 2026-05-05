import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.tsx';

const SupplierLoginPage: React.FC = () => {
  const { signIn, isConfigured } = useSupabaseAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) { setError(error); return; }
    navigate('/supplier-portal/dashboard');
  };

  const inputClass = "mt-1 w-full px-4 py-3 text-white bg-[#0a1628]/80 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all placeholder-gray-500";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-heading text-white">Supplier Portal</h1>
          <p className="mt-3 text-gray-300">Log in to manage your AI Sales Assistant and view your leads.</p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm">
            Supplier login is not yet configured on this environment.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-8 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className={inputClass} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={submitting || !isConfigured} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? 'Logging in…' : 'Log In'}
          </button>
          <p className="text-sm text-gray-400 text-center">
            New supplier? <Link to="/supplier-portal/register" className="text-cyan-400 hover:underline">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SupplierLoginPage;
