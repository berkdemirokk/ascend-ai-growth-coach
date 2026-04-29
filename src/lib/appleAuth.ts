import { Capacitor } from '@capacitor/core';

export interface AppleSignInResult {
  identityToken: string;
  authorizationCode: string;
  user: string;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
}

export function isAppleSignInAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
}

export async function signInWithApple(): Promise<AppleSignInResult | null> {
  if (!isAppleSignInAvailable()) return null;

  try {
    const mod = await import('@capacitor-community/apple-sign-in');
    const result = await mod.SignInWithApple.authorize({
      clientId: 'com.ascend.growth',
      redirectURI: 'https://ascend.app/auth/apple/callback',
      scopes: 'email name',
      state: cryptoRandom(),
    });

    const response = result?.response;
    if (!response?.identityToken) return null;

    return {
      identityToken: response.identityToken,
      authorizationCode: response.authorizationCode ?? '',
      user: response.user ?? '',
      email: response.email ?? null,
      givenName: response.givenName ?? null,
      familyName: response.familyName ?? null,
    };
  } catch {
    return null;
  }
}

function cryptoRandom() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
