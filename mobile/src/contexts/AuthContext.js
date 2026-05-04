import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { supabase, SUPABASE_CONFIGURED } from '../services/supabase';
import { unlinkPurchaseUser } from '../services/purchases';

// Cap network calls so a slow/offline reviewer doesn't see a frozen splash.
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ data: null }), ms)),
  ]);

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
        const { data } = await withTimeout(supabase.auth.getSession(), 5000);
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
    // Unlink RevenueCat first so the next sign-in starts fresh and the
    // anonymous user from logout doesn't keep the previous user's entitlements.
    try {
      await unlinkPurchaseUser();
    } catch (e) {
      console.warn('[AuthContext] unlinkPurchaseUser failed:', e?.message);
    }
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

  const signInWithApple = useCallback(async () => {
    if (!SUPABASE_CONFIGURED) {
      return { error: new Error('Supabase henüz yapılandırılmadı.') };
    }
    try {
      const AppleAuthentication = await import('expo-apple-authentication').catch(() => null);
      const Crypto = await import('expo-crypto').catch(() => null);
      if (!AppleAuthentication || !Crypto) {
        return { error: new Error('Apple Sign-In modülü yüklenemedi.') };
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        return { error: new Error('Apple Sign-In bu cihazda kullanılamıyor.') };
      }

      const rawNonce = Crypto.randomUUID
        ? Crypto.randomUUID()
        : Math.random().toString(36).slice(2);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential?.identityToken) {
        return { error: new Error('Apple kimlik doğrulaması başarısız.') };
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce: rawNonce,
      });

      return { data, error };
    } catch (e) {
      if (e?.code === 'ERR_REQUEST_CANCELED') {
        return { canceled: true };
      }
      return { error: e };
    }
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
    signInWithApple,
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
