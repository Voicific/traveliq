import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoIcon } from '../components/icons/LogoIcon.tsx';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const success = await auth.login(email, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "block w-full bg-gradient-to-br from-[#0f1c2e]/80 to-[#0d2d3d]/80 border border-cyan-400/20 rounded-md shadow-sm py-3 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gradient-to-br from-[#0f1c2e]/50 to-[#0d2d3d]/50 backdrop-blur-lg border border-cyan-400/20 p-8 rounded-2xl shadow-[0_0_40px_rgba(0,212,255,0.2)]">
        <div>
           <div className="flex justify-center">
             <LogoIcon className="h-16 w-auto" />
           </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold font-heading bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,212,255,0.3)]">
            Administrator Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} rounded-t-md`}
                placeholder="Email address"
              />
            </div>
            <div className="pt-4">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} rounded-b-md`}
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-md text-sm">
                {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 disabled:opacity-50 transition-all duration-300"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
