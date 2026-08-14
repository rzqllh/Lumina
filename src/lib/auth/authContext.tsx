import React, { useEffect, useState, useMemo } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { AuthContext } from './contexts';
import type { AuthContextValue, AuthStatus } from './types';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session restore
    supabase.auth
      .getSession()
      .then(({ data, error: sessionError }) => {
        if (!isMounted) return;
        if (sessionError) {
          setError(sessionError);
          setStatus('error');
          return;
        }
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setStatus(data.session ? 'authenticated' : 'unauthenticated');
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus('error');
      });

    // 2. Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setStatus(newSession ? 'authenticated' : 'unauthenticated');
      setError(null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (returnTo?: string): Promise<{ error: Error | null }> => {
    try {
      setError(null);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const redirectUrl = new URL('/auth/callback', origin);
      if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
        redirectUrl.searchParams.set('returnTo', returnTo);
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl.toString(),
          scopes: 'openid email profile',
        },
      });

      if (oauthError) {
        setError(oauthError);
        return { error: oauthError };
      }
      return { error: null };
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      return { error: errorObj };
    }
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError(signOutError);
        return { error: signOutError };
      }
      setSession(null);
      setUser(null);
      setStatus('unauthenticated');
      setError(null);
      return { error: null };
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      return { error: errorObj };
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      status,
      error,
      signInWithGoogle,
      signOut,
    }),
    [session, user, status, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
