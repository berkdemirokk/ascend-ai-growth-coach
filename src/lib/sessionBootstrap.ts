import { AccountIdentity, DailyTask, PlannedMission, SubscriptionStatus, UserProfile, WeeklyPlanSnapshot } from '../types';
import { buildPlannedMissionQueue, ensureDailyMission } from './missionEngine';
import { ensureWeeklyPlanSnapshot } from './weeklyPlan';
import {
  createAccountId,
  ensureAccountId,
  readAccountEmail,
  readAccountToken,
  readProfile,
  readTasks,
  writeAccountEmail,
  writeAccountId,
  writeAccountToken,
  writeProfile,
  writeTasks,
} from './storage';
import {
  createRemoteAccount,
  isPersistenceAuthError,
  isPersistenceConflictError,
  loadRemoteSession,
  persistRemoteSession,
} from './persistenceClient';

export interface SessionSeed extends AccountIdentity {
  profile: UserProfile;
  tasks: DailyTask[];
  weeklyPlanSnapshot: WeeklyPlanSnapshot | null;
  plannedMissions: PlannedMission[];
  sessionRevision: number;
}

interface RemoteSeedPayload {
  accountId: string;
  accountToken: string | null;
  accountEmail?: string | null;
  subscriptionStatus?: SubscriptionStatus;
  profile: UserProfile;
  tasks: DailyTask[];
  weeklyPlanSnapshot?: WeeklyPlanSnapshot | null;
  plannedMissions?: PlannedMission[];
  revision?: number;
}

const applySubscriptionEntitlement = (
  profile: UserProfile,
  subscriptionStatus: SubscriptionStatus | null | undefined,
): UserProfile => ({
  ...profile,
  planTier: subscriptionStatus === 'premium' ? 'premium' : 'free',
});

export const createSessionSeed = (
  profile: UserProfile,
  tasks: DailyTask[] = [],
  accountId = ensureAccountId(),
  accountToken = readAccountToken(),
  accountEmail = readAccountEmail(),
  weeklyPlanSnapshot: WeeklyPlanSnapshot | null = null,
  plannedMissions: PlannedMission[] = [],
  sessionRevision = 0,
): SessionSeed => {
  const entitledProfile = applySubscriptionEntitlement(profile, 'free');
  const { tasks: seededTasks } = ensureDailyMission(entitledProfile, tasks, weeklyPlanSnapshot, plannedMissions);
  const nextSnapshot = ensureWeeklyPlanSnapshot(entitledProfile, seededTasks, weeklyPlanSnapshot);
  const nextPlannedMissions = buildPlannedMissionQueue(entitledProfile, seededTasks, nextSnapshot, plannedMissions.length || 3);
  return {
    accountId,
    accountToken,
    accountEmail,
    profile: entitledProfile,
    tasks: seededTasks,
    weeklyPlanSnapshot: nextSnapshot,
    plannedMissions: nextPlannedMissions,
    sessionRevision,
  };
};

export const createSessionSeedFromRemotePayload = (payload: RemoteSeedPayload) =>
  (() => {
    const entitledProfile = applySubscriptionEntitlement(payload.profile, payload.subscriptionStatus);
    const { tasks: seededTasks } = ensureDailyMission(
      entitledProfile,
      payload.tasks,
      payload.weeklyPlanSnapshot ?? null,
      payload.plannedMissions ?? [],
    );
    const nextWeeklyPlanSnapshot =
      payload.weeklyPlanSnapshot ?? ensureWeeklyPlanSnapshot(entitledProfile, seededTasks, null);
    const nextPlannedMissions =
      payload.plannedMissions?.length
        ? payload.plannedMissions
        : buildPlannedMissionQueue(entitledProfile, seededTasks, nextWeeklyPlanSnapshot, 3);

    return {
      accountId: payload.accountId,
      accountToken: payload.accountToken,
      accountEmail: payload.accountEmail ?? null,
      profile: entitledProfile,
      tasks: seededTasks,
      weeklyPlanSnapshot: nextWeeklyPlanSnapshot,
      plannedMissions: nextPlannedMissions,
      sessionRevision: payload.revision ?? 0,
    };
  })();

export const provisionRemoteSessionSeed = async (localSeed: SessionSeed) => {
  const tryProvision = async (accountId: string, accountToken: string | null) => {
    const provisionedAccount = await createRemoteAccount({
      accountId,
      accountToken,
      profile: localSeed.profile,
      tasks: localSeed.tasks,
      weeklyPlanSnapshot: localSeed.weeklyPlanSnapshot,
      plannedMissions: localSeed.plannedMissions,
    });

    if (!provisionedAccount) {
      return null;
    }

    writeAccountId(provisionedAccount.accountId);
    writeAccountToken(provisionedAccount.accountToken);
    if (provisionedAccount.accountEmail) {
      writeAccountEmail(provisionedAccount.accountEmail);
    }

    return createSessionSeedFromRemotePayload({
      accountId: provisionedAccount.accountId,
      accountToken: provisionedAccount.accountToken,
      accountEmail: provisionedAccount.accountEmail ?? null,
      profile: provisionedAccount.profile,
      subscriptionStatus: provisionedAccount.subscriptionStatus,
      tasks: provisionedAccount.tasks,
      weeklyPlanSnapshot: provisionedAccount.weeklyPlanSnapshot ?? null,
      plannedMissions: provisionedAccount.plannedMissions ?? [],
      revision: provisionedAccount.revision ?? 1,
    });
  };

  try {
    const provisionedSeed = await tryProvision(localSeed.accountId, localSeed.accountToken);
    if (provisionedSeed) {
      return provisionedSeed;
    }
  } catch (error) {
    if (!isPersistenceConflictError(error) && !isPersistenceAuthError(error)) {
      throw error;
    }
  }

  const rotatedAccountId = createAccountId();
  writeAccountId(rotatedAccountId);
  writeAccountToken('');
  writeAccountEmail('');
  const rotatedSeed = await tryProvision(rotatedAccountId, null);

  if (!rotatedSeed) {
    return {
      ...localSeed,
      accountId: rotatedAccountId,
      accountToken: null,
      accountEmail: null,
      weeklyPlanSnapshot: ensureWeeklyPlanSnapshot(localSeed.profile, localSeed.tasks, null),
      plannedMissions: buildPlannedMissionQueue(localSeed.profile, localSeed.tasks, null),
      sessionRevision: 0,
    };
  }

  return rotatedSeed;
};

export const loadPersistedSessionSeed = (): SessionSeed | null => {
  const profile = readProfile();
  if (!profile) {
    return null;
  }

  const storedTasks = readTasks();
  const seed = createSessionSeed(profile, storedTasks);
  writeTasks(seed.tasks);
  return seed;
};

export const hydrateSessionSeedFromServer = async (localSeed: SessionSeed | null) => {
  if (!localSeed) {
    return null;
  }

  try {
    let remoteSeed = localSeed;
    if (!remoteSeed.accountToken) {
      remoteSeed = await provisionRemoteSessionSeed(remoteSeed);
    }

    let remoteSession;
    try {
      remoteSession = await loadRemoteSession(remoteSeed.accountId, remoteSeed.accountToken);
    } catch (error) {
      if (!isPersistenceAuthError(error)) {
        throw error;
      }

      remoteSeed = await provisionRemoteSessionSeed(remoteSeed);
      remoteSession = await loadRemoteSession(remoteSeed.accountId, remoteSeed.accountToken);
    }

    if (!remoteSession) {
      await persistRemoteSession({
        accountId: remoteSeed.accountId,
        accountToken: remoteSeed.accountToken,
        profile: remoteSeed.profile,
        tasks: remoteSeed.tasks,
        weeklyPlanSnapshot: remoteSeed.weeklyPlanSnapshot,
        plannedMissions: remoteSeed.plannedMissions,
        revision: remoteSeed.sessionRevision,
      });
      return remoteSeed;
    }

    const hydratedSeed = createSessionSeedFromRemotePayload({
      accountId: remoteSeed.accountId,
      accountToken: remoteSeed.accountToken,
      accountEmail: remoteSession.accountEmail ?? remoteSeed.accountEmail ?? null,
      profile: remoteSession.profile,
      subscriptionStatus: remoteSession.subscriptionStatus,
      tasks: remoteSession.tasks,
      weeklyPlanSnapshot: remoteSession.weeklyPlanSnapshot ?? remoteSeed.weeklyPlanSnapshot ?? null,
      plannedMissions: remoteSession.plannedMissions ?? remoteSeed.plannedMissions ?? [],
      revision: remoteSession.revision ?? remoteSeed.sessionRevision,
    });
    if (hydratedSeed.accountEmail) {
      writeAccountEmail(hydratedSeed.accountEmail);
    }
    writeProfile(hydratedSeed.profile);
    writeTasks(hydratedSeed.tasks);
    return hydratedSeed;
  } catch (error) {
    console.warn('Remote session hydration failed, continuing with local session.', error);
    return localSeed;
  }
};
