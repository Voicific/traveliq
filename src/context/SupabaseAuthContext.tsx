import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, Profile } from '../lib/supabase.ts';

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, meta: { full_name: string; company_name: string }) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (error) {
      console.warn('Failed to load profile:', error.message);
      setProfile(null);
      return;
    }
    setProfile(data as Profile);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id).finally(() => setIsLoading(false));
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadProfile(s.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp: SupabaseAuthContextType['signUp'] = async (email, password, meta) => {
    if (!isSupabaseConfigured) return { error: 'Supabase is not configured. Contact support.' };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
    return { error: error?.message ?? null };
  };

  const signIn: SupabaseAuthContextType['signIn'] = async (email, password) => {
    if (!isSupabaseConfigured) return { error: 'Supabase is not configured. Contact support.' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <SupabaseAuthContext.Provider value={{
      user, session, profile, isLoading, isConfigured: isSupabaseConfigured,
      signUp, signIn, signOut, refreshProfile,
    }}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export const useSupabaseAuth = () => {
  const ctx = useContext(SupabaseAuthContext);
  if (!ctx) throw new Error('useSupabaseAuth must be used inside SupabaseAuthProvider');
  return ctx;
};
