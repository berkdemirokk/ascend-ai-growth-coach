import { TrustedEntitlements } from '../types';

export function readTrustedEntitlements(input: Partial<TrustedEntitlements> | null | undefined): TrustedEntitlements {
  return {
    isPremium: input?.isPremium === true,
  };
}
