import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '../context/SupabaseAuthContext.tsx';

/**
 * Guards the internal admin area (/admin, /chat-history, /ai-studio,
 * /affiliate-admin). Access now requires a real Supabase session whose profile
 * has role = 'admin' — no more client-side hardcoded login.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useSupabaseAuth();
  const location = useLocation();

  // Wait for the session (and the profile that carries the role) to resolve
  // before deciding, so we don't briefly bounce a logged-in admin to /login.
  if (isLoading || (user && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#0f1c2e] to-[#0a1628] text-gray-300">
        <p className="text-sm">Verifying access…</p>
      </div>
    );
  }

  // Not signed in → send to the admin login, remembering where they were going.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Signed in but not an admin → not authorised for the internal area.
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
