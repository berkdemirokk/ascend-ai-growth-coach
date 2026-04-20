import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase, SUPABASE_CONFIGURED } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  // Bootstrap: hydrate session, subscribe to changes
  useEffect(() => {
    let unsub;

    (async () => {
      try {
        if (!SUPABASE_CONFIGURED) {
          // Supabase not configured — fall back to guest mode so the app
          // still works locally.
          setGuestMode(true);
          setLoading(false);
          return;
        }
        const { data } = await supabase.auth.getSession();
        setSession(data?.session ?? null);
      } catch (e) {
        console.warn('[AuthContext] getSession failed:', e?.message);
      } finally {
        setLoading(false);
      }

      if (SUPABASE_CONFIGURED) {
        const { data: listener } = supabase.auth.onAuthStateChange(
          (_event, s) => {
            setSession(s);
          },
        );
        unsub = listener?.subscription;
      }
    })();

    return () => {
      try {
        unsub?.unsubscribe?.();
      } catch {}
    };
  }, []);

  const signUp = useCallback(async ({ email, password, name }) => {
    if (!SUPABASE_CONFIGURED) {
      return { error: new Error('Supabase henüz yapılandırılmadı.') };
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name?.trim() || null },
      },
    });
    return { data, error };
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    if (!SUPABASE_CONFIGURED) {
      return { error: new Error('Supabase henüz yapılandırılmadı.') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('[AuthContext] signOut failed:', e?.message);
    }
    setGuestMode(false);
  }, []);

  const resetPassword = useCallback(async (email) => {
    if (!SUPABASE_CONFIGURED) {
      return { error: new Error('Supabase henüz yapılandırılmadı.') };
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
    );
    return { data, error };
  }, []);

  const continueAsGuest = useCallback(() => {
    setGuestMode(true);
  }, []);

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    guestMode,
    isAuthenticated: !!session?.user,
    configured: SUPABASE_CONFIGURED,
    signUp,
    signIn,
    signOut,
    resetPassword,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
