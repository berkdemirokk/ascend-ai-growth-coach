import { DailyTask, PlannedMission, SubscriptionStatus, UserProfile, WeeklyPlanSnapshot } from '../types';

export interface PersistedSessionPayload {
  accountId: string;
  accountToken?: string;
  accountEmail?: string | null;
  profile: UserProfile;
  tasks: DailyTask[];
  weeklyPlanSnapshot?: WeeklyPlanSnapshot | null;
  plannedMissions?: PlannedMission[];
  revision?: number;
  updatedAt: number;
}

export interface AccountProvisionPayload {
  accountId: string;
  accountToken: string;
  accountEmail?: string | null;
  emailVerified?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  profile: UserProfile;
  tasks: DailyTask[];
  weeklyPlanSnapshot?: WeeklyPlanSnapshot | null;
  plannedMissions?: PlannedMission[];
  revision?: number;
  updatedAt: number;
}

export interface AccountLoginPayload extends AccountProvisionPayload {}

export interface PasswordResetRequestPayload {
  ok: boolean;
  resetToken?: string;
}

export interface PasswordResetConfirmPayload {
  ok: boolean;
}

export interface EmailVerificationPayload {
  accountId: string;
  accountEmail?: string | null;
  emailVerified: boolean;
}

export interface BillingActivationPayload {
  accountId: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionProvider?: string | null;
  subscriptionUpdatedAt?: number | null;
}

export interface BillingEntitlementSyncPayload extends BillingActivationPayload {
  entitlementId?: string;
  entitlementActive?: boolean;
  entitlementExpiresAt?: number | null;
  productIdentifier?: string | null;
}

export class PersistenceRequestError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = 'PersistenceRequestError';
    this.status = status;
    this.payload = payload;
  }
}

const getPersistenceBaseUrl = () =>
  import.meta.env.VITE_PERSISTENCE_URL || import.meta.env.VITE_AI_BACKEND_URL || '';

const buildSessionUrl = (accountId: string) => {
  const baseUrl = getPersistenceBaseUrl();
  if (!baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, '')}/api/session/${encodeURIComponent(accountId)}`;
};

const buildAccountUrl = () => {
  const baseUrl = getPersistenceBaseUrl();
  if (!baseUrl) {
    return null;
  }

  return `${baseUrl.replace(/\/$/, '')}/api/account`;
};

const createAuthHeaders = (accountToken?: string | null) => ({
  'Content-Type': 'application/json',
  ...(accountToken ? { 'X-Ascend-Account-Token': accountToken } : {}),
});

const throwPersistenceError = async (label: string, response: Response) => {
  let detail = '';
  let payload: unknown;
  try {
    payload = (await response.json()) as { error?: string };
    detail = typeof (payload as { error?: string })?.error === 'string' ? (payload as { error?: string }).error! : '';
  } catch {
    detail = '';
    payload = undefined;
  }

  throw new PersistenceRequestError(
    detail ? `${label}: ${response.status} ${detail}` : `${label}: ${response.status}`,
    response.status,
    payload,
  );
};

export const isRemotePersistenceEnabled = () => Boolean(getPersistenceBaseUrl());
export const isPersistenceAuthError = (error: unknown) =>
  error instanceof PersistenceRequestError && (error.status === 403 || error.status === 404 || error.status === 409);
export const isPersistenceConflictError = (error: unknown) =>
  error instanceof PersistenceRequestError && error.status === 409;
export const getPersistenceConflictSession = (error: unknown) => {
  if (!(error instanceof PersistenceRequestError) || error.status !== 409 || !error.payload) {
    return null;
  }

  const payload = error.payload as { currentSession?: PersistedSessionPayload };
  return payload.currentSession ?? null;
};

export const createRemoteAccount = async (payload: {
  accountId: string;
  profile: UserProfile;
  tasks: DailyTask[];
  accountToken?: string | null;
  weeklyPlanSnapshot?: WeeklyPlanSnapshot | null;
  plannedMissions?: PlannedMission[];
}) => {
  const accountUrl = buildAccountUrl();
  if (!accountUrl) {
    return null;
  }

  const response = await fetch(accountUrl, {
    method: 'POST',
    headers: createAuthHeaders(payload.accountToken),
    body: JSON.stringify({
      accountId: payload.accountId,
      profile: payload.profile,
      tasks: payload.tasks,
      weeklyPlanSnapshot: payload.weeklyPlanSnapshot ?? null,
      plannedMissions: payload.plannedMissions ?? [],
    }),
  });

  if (!response.ok) {
    await throwPersistenceError('Account create failed', response);
  }

  return (await response.json()) as AccountProvisionPayload;
};

export const claimRemoteAccount = async (payload: {
  accountId: string;
  accountToken: string;
  email: string;
  password: string;
}) => {
  const accountUrl = buildAccountUrl();
  if (!accountUrl) {
    return null;
  }

  const response = await fetch(`${accountUrl}/claim`, {
    method: 'POST',
    headers: createAuthHeaders(payload.accountToken),
    body: JSON.stringify({
      accountId: payload.accountId,
      email: payload.email,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    await throwPersistenceError('Account claim failed', response);
  }

  return (await response.json()) as AccountProvisionPayload;
};

export const loginRemoteAccount = async (payload: { email: string; password: string }) => {
  const accountUrl = buildAccountUrl();
  if (!accountUrl) {
    return null;
  }

  const response = await fetch(`${accountUrl}/login`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwPersistenceError('Account login failed', response);
  }

  return (await response.json()) as AccountLoginPayload;
};

export const verifyRemoteAccountEmail = async (payload: { token: string }) => {
  const accountUrl = buildAccountUrl();
  if (!accountUrl) {
    return null;
  }

  const response = await fetch(`${accountUrl}/verify-email`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwPersistenceError('Email verification failed', response);
  }

  return (await response.json()) as EmailVerificationPayload;
};

export const requestRemotePasswordReset = async (payload: { email: string }) => {
  const accountUrl = buildAccountUrl();
  if (!accountUrl) {
    return null;
  }

  const response = await fetch(`${accountUrl}/password-reset/request`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwPersistenceError('Password reset request failed', response);
  }

  return (await response.json()) as PasswordResetRequestPayload;
};

export const confirmRemotePasswordReset = async (payload: { token: string; password: string }) => {
  const accountUrl = buildAccountUrl();
  if (!accountUrl) {
    return null;
  }

  const response = await fetch(`${accountUrl}/password-reset/confirm`, {
    method: 'POST',
    headers: createAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwPersistenceError('Password reset confirm failed', response);
  }

  return (await response.json()) as PasswordResetConfirmPayload;
};

export const activatePreviewBilling = async (payload: { accountId: string; accountToken: string }) => {
  const baseUrl = getPersistenceBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/billing/activate-preview`, {
    method: 'POST',
    headers: createAuthHeaders(payload.accountToken),
    body: JSON.stringify({ accountId: payload.accountId }),
  });

  if (!response.ok) {
    await throwPersistenceError('Billing activation failed', response);
  }

  return (await response.json()) as BillingActivationPayload;
};

export const syncRevenueCatEntitlement = async (payload: {
  accountId: string;
  accountToken: string;
  appUserID: string;
}) => {
  const baseUrl = getPersistenceBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/billing/sync-revenuecat`, {
    method: 'POST',
    headers: createAuthHeaders(payload.accountToken),
    body: JSON.stringify({
      accountId: payload.accountId,
      appUserID: payload.appUserID,
    }),
  });

  if (!response.ok) {
    await throwPersistenceError('RevenueCat entitlement sync failed', response);
  }

  return (await response.json()) as BillingEntitlementSyncPayload;
};

export const loadRemoteSession = async (accountId: string, accountToken?: string | null) => {
  const sessionUrl = buildSessionUrl(accountId);
  if (!sessionUrl) {
    return null;
  }

  const response = await fetch(sessionUrl, {
    headers: createAuthHeaders(accountToken),
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    await throwPersistenceError('Session load failed', response);
  }

  return (await response.json()) as PersistedSessionPayload;
};

export const persistRemoteSession = async (payload: Omit<PersistedSessionPayload, 'updatedAt'>) => {
  const sessionUrl = buildSessionUrl(payload.accountId);
  if (!sessionUrl) {
    return null;
  }

  const response = await fetch(sessionUrl, {
    method: 'PUT',
    headers: createAuthHeaders(payload.accountToken),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    await throwPersistenceError('Session save failed', response);
  }

  return (await response.json()) as PersistedSessionPayload;
};

export const deleteRemoteSession = async (accountId: string, accountToken?: string | null) => {
  const sessionUrl = buildSessionUrl(accountId);
  if (!sessionUrl) {
    return;
  }

  const response = await fetch(sessionUrl, {
    method: 'DELETE',
    headers: createAuthHeaders(accountToken),
  });

  if (!response.ok && response.status !== 404) {
    await throwPersistenceError('Session delete failed', response);
  }
};
