import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.tsx';
import { AffiliateIcon } from '../components/icons/TravelIQIcons.tsx';

const AffiliateHubLoginPage: React.FC = () => {
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
    navigate('/affiliate-hub');
  };

  const inputClass =
    'mt-1 w-full px-4 py-3 text-white bg-[#0a1628]/80 border border-cyan-400/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all placeholder-gray-500';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628]">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-4">
            <AffiliateIcon className="w-8 h-8 text-cyan-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-white">Affiliate Hub</h1>
          <p className="mt-2 text-gray-300">
            Your private partner workspace — training, materials, and earnings.
          </p>
        </div>

        {!isConfigured && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm">
            Affiliate login is not yet active on this environment.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/10 rounded-xl p-8 space-y-5"
        >
          <div>
            <label className="text-sm font-medium text-gray-300">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !isConfigured}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? 'Logging in…' : 'Enter Affiliate Hub'}
          </button>

          <p className="text-sm text-gray-400 text-center">
            Not yet an affiliate?{' '}
            <Link to="/affiliate-program" className="text-cyan-400 hover:underline">
              Apply to join the programme
            </Link>
          </p>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Access is granted to accepted TravelIQ affiliate partners only.
        </p>
      </div>
    </div>
  );
};

export default AffiliateHubLoginPage;
