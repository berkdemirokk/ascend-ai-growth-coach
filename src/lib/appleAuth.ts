export interface AppleSignInResult {
  identityToken: string;
  authorizationCode: string;
  user: string;
  email: string | null;
  givenName: string | null;
  familyName: string | null;
}

export function isAppleSignInAvailable(): boolean {
  return false;
}

export async function signInWithApple(): Promise<AppleSignInResult | null> {
  return null;
}
