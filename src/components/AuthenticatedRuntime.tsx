import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { DailyTask, PlannedMission, SessionSyncState, SubscriptionStatus, UserProfile, WeeklyPlanSnapshot } from '../types';
import {
  clearAppStorage,
  writeAccountEmail,
  writeAccountId,
  writeAccountToken,
  writeProfile,
  writeTasks,
} from '../lib/storage';
import { toggleTaskWithProgression } from '../lib/progression';
import { hapticLight, hapticSuccess } from '../lib/haptics';
import { cancelDailyReminder, ensureNotificationPermission, scheduleDailyReminder } from '../lib/notifications';
import {
  buildPlannedMissionQueue,
  ensureDailyMission,
  getMissionStats,
  getTomorrowMissionPreview,
  getUpcomingMissionPreview,
  saveMissionReflection,
} from '../lib/missionEngine';
import { provisionRemoteSessionSeed, SessionSeed } from '../lib/sessionBootstrap';
import {
  claimRemoteAccount,
  deleteRemoteSession,
  getPersistenceConflictSession,
  isPersistenceAuthError,
  isPersistenceConflictError,
  isRemotePersistenceEnabled,
  persistRemoteSession,
  syncRevenueCatEntitlement,
} from '../lib/persistenceClient';
import { mergePlannedMissions, mergeProfiles, mergeTasks, mergeWeeklyPlanSnapshots } from '../lib/sessionMerge';
import { ensureWeeklyPlanSnapshot } from '../lib/weeklyPlan';
import {
  ensureBillingConfigured,
  getBillingAvailability,
  getBillingPackageSnapshot,
  isPremiumFromCustomerInfo,
  purchasePremiumPackage,
  restorePremiumPurchases,
} from '../lib/billing';

const AuthenticatedApp = lazy(() => import('./AuthenticatedApp'));
const CompletionCelebration = lazy(() => import('./CompletionCelebration'));

interface AuthenticatedRuntimeProps {
  initialSeed: SessionSeed;
  onLogout: () => void;
}

export default function AuthenticatedRuntime({ initialSeed, onLogout }: AuthenticatedRuntimeProps) {
  const [accountId, setAccountId] = useState(initialSeed.accountId);
  const [accountToken, setAccountToken] = useState(initialSeed.accountToken);
  const [accountEmail, setAccountEmail] = useState(initialSeed.accountEmail);
  const [profile, setProfile] = useState<UserProfile>(initialSeed.profile);
  const [tasks, setTasks] = useState<DailyTask[]>(initialSeed.tasks);
  const [weeklyPlanSnapshot, setWeeklyPlanSnapshot] = useState<WeeklyPlanSnapshot | null>(initialSeed.weeklyPlanSnapshot);
  const [plannedMissions, setPlannedMissions] = useState<PlannedMission[]>(initialSeed.plannedMissions);
  const [sessionRevision, setSessionRevision] = useState(initialSeed.sessionRevision);
  const [celebration, setCelebration] = useState<{ visible: boolean; xp: number; streak: number }>({ visible: false, xp: 0, streak: 0 });
  const [syncState, setSyncState] = useState<SessionSyncState>(accountToken ? 'synced' : 'idle');
  const [syncMessage, setSyncMessage] = useState<string | null>(
    accountToken ? 'Hesap verisi senkron görünüyor.' : null,
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [billingAvailable, setBillingAvailable] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);
  const [billingPackagePrice, setBillingPackagePrice] = useState<string | null>(null);
  const [accountDeletionLoading, setAccountDeletionLoading] = useState(false);

  const activeTask = useMemo(() => {
    const { todayMission } = ensureDailyMission(profile, tasks, weeklyPlanSnapshot, plannedMissions);
    return todayMission;
  }, [profile, tasks, weeklyPlanSnapshot, plannedMissions]);

  const missionStats = useMemo(() => getMissionStats(tasks), [tasks]);
  const tomorrowPreview = useMemo(
    () => getTomorrowMissionPreview(profile, tasks, weeklyPlanSnapshot, plannedMissions),
    [profile, tasks, weeklyPlanSnapshot, plannedMissions],
  );
  const upcomingPreview = useMemo(
    () => getUpcomingMissionPreview(profile, tasks, 3, weeklyPlanSnapshot, plannedMissions),
    [profile, tasks, weeklyPlanSnapshot, plannedMissions],
  );

  const syncSession = (
    nextProfile: UserProfile,
    nextTasks: DailyTask[],
    nextWeeklyPlanSnapshot: WeeklyPlanSnapshot | null,
    nextPlannedMissions: PlannedMission[],
  ) => {
    if (!isRemotePersistenceEnabled()) {
      setSyncState('idle');
      setSyncMessage('Hesap sunucusu kapalı. Uygulama yerel modda çalışıyor.');
      return;
    }

    setSyncState('syncing');
    setSyncMessage('Hesap verisi senkronize ediliyor...');

    void (async () => {
      try {
        const persisted = await persistRemoteSession({
          accountId,
          accountToken,
          profile: nextProfile,
          tasks: nextTasks,
          weeklyPlanSnapshot: nextWeeklyPlanSnapshot,
          plannedMissions: nextPlannedMissions,
          revision: sessionRevision,
        });
        if (!persisted) {
          setSyncState('idle');
          setSyncMessage('Hesap sunucusu kapalı. Uygulama yerel modda çalışıyor.');
          return;
        }
        setSessionRevision(persisted.revision ?? (sessionRevision + 1));
        setLastSyncedAt(persisted.updatedAt ?? Date.now());
        setSyncState('synced');
        setSyncMessage('Veriler hesaba yazıldı.');
      } catch (error) {
        if (isPersistenceConflictError(error)) {
          const currentSession = getPersistenceConflictSession(error);
          if (currentSession) {
            const mergedProfile = mergeProfiles(nextProfile, currentSession.profile);
            const mergedTasks = mergeTasks(nextTasks, currentSession.tasks);
            const mergedWeeklyPlanSnapshot = mergeWeeklyPlanSnapshots(
              nextWeeklyPlanSnapshot,
              currentSession.weeklyPlanSnapshot ?? null,
            );
            const mergedPlannedMissions = mergePlannedMissions(
              nextPlannedMissions,
              currentSession.plannedMissions ?? [],
            );

            setProfile(mergedProfile);
            setTasks(mergedTasks);
            setWeeklyPlanSnapshot(mergedWeeklyPlanSnapshot);
            setPlannedMissions(mergedPlannedMissions);
            writeProfile(mergedProfile);
            writeTasks(mergedTasks);

            try {
              const mergedResponse = await persistRemoteSession({
                accountId,
                accountToken,
                profile: mergedProfile,
                tasks: mergedTasks,
                weeklyPlanSnapshot: mergedWeeklyPlanSnapshot,
                plannedMissions: mergedPlannedMissions,
                revision: currentSession.revision ?? sessionRevision + 1,
              });
              setSessionRevision(mergedResponse?.revision ?? (currentSession.revision ?? sessionRevision + 1));
              setLastSyncedAt(mergedResponse?.updatedAt ?? Date.now());
              setSyncState('conflict_resolved');
              setSyncMessage('Başka cihazdaki değişikliklerle birleştirildi.');
              return;
            } catch (mergeError) {
              console.warn('Remote session merge sync failed.', mergeError);
              setSyncState('degraded');
              setSyncMessage('Senkronizasyon birleştirme sırasında takıldı. Tekrar deneyebilirsin.');
              return;
            }
          }
        }

        if (!isPersistenceAuthError(error)) {
          console.warn('Remote session sync failed.', error);
          setSyncState('degraded');
          setSyncMessage('Sunucuya yazılamadı. Uygulama yerel modda devam ediyor.');
          return;
        }

        try {
          const recoveredSeed = await provisionRemoteSessionSeed({
            accountId,
            accountToken,
            accountEmail,
            profile: nextProfile,
            tasks: nextTasks,
            weeklyPlanSnapshot: nextWeeklyPlanSnapshot,
            plannedMissions: nextPlannedMissions,
            sessionRevision,
          });

          setAccountId(recoveredSeed.accountId);
          setAccountToken(recoveredSeed.accountToken);
          writeAccountId(recoveredSeed.accountId);
          if (recoveredSeed.accountToken) {
            writeAccountToken(recoveredSeed.accountToken);
          }
          if (recoveredSeed.accountEmail) {
            writeAccountEmail(recoveredSeed.accountEmail);
            setAccountEmail(recoveredSeed.accountEmail);
          }

          const recoveredPersisted = await persistRemoteSession({
            accountId: recoveredSeed.accountId,
            accountToken: recoveredSeed.accountToken,
            profile: nextProfile,
            tasks: nextTasks,
            weeklyPlanSnapshot: recoveredSeed.weeklyPlanSnapshot,
            plannedMissions: recoveredSeed.plannedMissions,
            revision: recoveredSeed.sessionRevision,
          });
          setSessionRevision(recoveredPersisted?.revision ?? (recoveredSeed.sessionRevision + 1));
          setLastSyncedAt(recoveredPersisted?.updatedAt ?? Date.now());
          setSyncState('synced');
          setSyncMessage('Hesap anahtarı yenilendi ve veri tekrar yazıldı.');
        } catch (recoveryError) {
          console.warn('Remote session recovery failed.', recoveryError);
          setSyncState('degraded');
          setSyncMessage('Senkronizasyon için hesap anahtarı yenilenemedi.');
        }
      }
    })();
  };

  const applySubscriptionStatus = (
    subscriptionStatus: SubscriptionStatus,
    baseProfile: UserProfile = profile,
    baseTasks: DailyTask[] = tasks,
    baseWeeklyPlanSnapshot: WeeklyPlanSnapshot | null = weeklyPlanSnapshot,
    basePlannedMissions: PlannedMission[] = plannedMissions,
  ) => {
    const nextPlanTier = subscriptionStatus === 'premium' ? 'premium' : 'free';
    if (baseProfile.planTier === nextPlanTier) {
      return;
    }

    const nextProfile: UserProfile = {
      ...baseProfile,
      planTier: nextPlanTier,
    };
    const { tasks: seededTasks } = ensureDailyMission(
      nextProfile,
      baseTasks,
      baseWeeklyPlanSnapshot,
      basePlannedMissions,
    );
    const nextWeeklyPlanSnapshot = ensureWeeklyPlanSnapshot(nextProfile, seededTasks, baseWeeklyPlanSnapshot);
    const nextPlannedMissions = buildPlannedMissionQueue(nextProfile, seededTasks, nextWeeklyPlanSnapshot);

    setProfile(nextProfile);
    setTasks(seededTasks);
    setWeeklyPlanSnapshot(nextWeeklyPlanSnapshot);
    setPlannedMissions(nextPlannedMissions);
    writeProfile(nextProfile);
    writeTasks(seededTasks);
    syncSession(nextProfile, seededTasks, nextWeeklyPlanSnapshot, nextPlannedMissions);
  };

  const handleRetrySync = () => {
    syncSession(profile, tasks, weeklyPlanSnapshot, plannedMissions);
  };

  useEffect(() => {
    let active = true;

    const bootstrapBillingContext = async () => {
      const availability = getBillingAvailability();
      if (!active) {
        return;
      }

      setBillingAvailable(availability.available);
      if (!availability.available) {
        setBillingPackagePrice(null);
        setBillingMessage(availability.reason);
        return;
      }

      try {
        await ensureBillingConfigured(accountId);
        const snapshot = await getBillingPackageSnapshot(accountId);
        if (!active) {
          return;
        }
        setBillingPackagePrice(snapshot?.price ?? null);
        setBillingMessage(null);
      } catch (error) {
        if (!active) {
          return;
        }
        console.warn('Billing bootstrap failed.', error);
        setBillingMessage('Satın alma servisi şu an erişilebilir değil.');
      }
    };

    void bootstrapBillingContext();

    return () => {
      active = false;
    };
  }, [accountId]);

  useEffect(() => {
    if (!accountToken) {
      return;
    }

    let active = true;

    const syncEntitlement = async () => {
      try {
        const synced = await syncRevenueCatEntitlement({
          accountId,
          accountToken,
          appUserID: accountId,
        });

        if (!active || !synced) {
          return;
        }

        applySubscriptionStatus(synced.subscriptionStatus, profile, tasks, weeklyPlanSnapshot, plannedMissions);
      } catch (error) {
        if (!active) {
          return;
        }
        if (!isPersistenceAuthError(error)) {
          console.warn('RevenueCat entitlement sync failed during bootstrap.', error);
        }
      }
    };

    void syncEntitlement();

    return () => {
      active = false;
    };
  }, [accountId, accountToken]);

  useEffect(() => {
    const enabled = profile.reminderEnabled !== false;
    const hour = profile.reminderHour ?? 20;
    const minute = profile.reminderMinute ?? 0;

    if (!enabled) {
      void cancelDailyReminder();
      return;
    }

    const apply = async () => {
      const granted = await ensureNotificationPermission();
      if (!granted) return;
      await scheduleDailyReminder(hour, minute, profile.name, profile.streak);
    };
    void apply();
  }, [profile.reminderEnabled, profile.reminderHour, profile.reminderMinute, profile.name, profile.streak]);

  const handleToggleTask = (id: string) => {
    const previousTask = tasks.find((task) => task.id === id);
    const { nextTasks, nextProfile } = toggleTaskWithProgression(tasks, profile, id);
    const { tasks: seededTasks } = ensureDailyMission(nextProfile, nextTasks);
    const nextWeeklyPlanSnapshot = ensureWeeklyPlanSnapshot(nextProfile, seededTasks, weeklyPlanSnapshot);
    const nextPlannedMissions = buildPlannedMissionQueue(nextProfile, seededTasks, nextWeeklyPlanSnapshot);

    const nextTask = seededTasks.find((task) => task.id === id);
    if (previousTask && nextTask && !previousTask.completed && nextTask.completed) {
      void hapticSuccess();
      const xpGained = Math.max(0, (nextProfile.experience - profile.experience + (nextProfile.level - profile.level) * 100));
      setCelebration({ visible: true, xp: xpGained || 10, streak: nextProfile.streak });
    } else if (previousTask?.completed && nextTask && !nextTask.completed) {
      void hapticLight();
    }

    setTasks(seededTasks);
    setProfile(nextProfile);
    setWeeklyPlanSnapshot(nextWeeklyPlanSnapshot);
    setPlannedMissions(nextPlannedMissions);
    writeTasks(seededTasks);
    writeProfile(nextProfile);
    syncSession(nextProfile, seededTasks, nextWeeklyPlanSnapshot, nextPlannedMissions);
  };

  const handleUpdateReminder = (settings: { hour: number; minute: number; enabled: boolean }) => {
    const nextProfile: UserProfile = {
      ...profile,
      reminderEnabled: settings.enabled,
      reminderHour: settings.hour,
      reminderMinute: settings.minute,
    };
    setProfile(nextProfile);
    writeProfile(nextProfile);
    syncSession(nextProfile, tasks, weeklyPlanSnapshot, plannedMissions);
  };

  const handleSaveReflection = (id: string, reflection: string) => {
    const nextTasks = saveMissionReflection(tasks, id, reflection);
    const nextWeeklyPlanSnapshot = ensureWeeklyPlanSnapshot(profile, nextTasks, weeklyPlanSnapshot);
    const nextPlannedMissions = buildPlannedMissionQueue(profile, nextTasks, nextWeeklyPlanSnapshot);
    setTasks(nextTasks);
    setWeeklyPlanSnapshot(nextWeeklyPlanSnapshot);
    setPlannedMissions(nextPlannedMissions);
    writeTasks(nextTasks);
    syncSession(profile, nextTasks, nextWeeklyPlanSnapshot, nextPlannedMissions);
  };

  const handlePurchasePremium = () => {
    if (billingLoading) {
      return;
    }

    setBillingLoading(true);
    void (async () => {
      try {
        const purchaseResult = await purchasePremiumPackage(accountId);
        setBillingMessage(purchaseResult.message);
        let syncedSubscriptionStatus: SubscriptionStatus | null = null;

        if (accountToken && purchaseResult.status === 'purchased') {
          const synced = await syncRevenueCatEntitlement({
            accountId,
            accountToken,
            appUserID: accountId,
          });

          if (synced) {
            syncedSubscriptionStatus = synced.subscriptionStatus;
            applySubscriptionStatus(synced.subscriptionStatus);
          }
        }

        if (
          purchaseResult.status === 'purchased' &&
          syncedSubscriptionStatus === null &&
          isPremiumFromCustomerInfo(purchaseResult.customerInfo)
        ) {
          applySubscriptionStatus('premium');
          setBillingMessage('Satin alma tamamlandi ve premium aktif edildi.');
        }
      } catch (error) {
        console.warn('Premium purchase failed.', error);
        setBillingMessage('Satın alma tamamlanamadı. Kısa süre sonra tekrar dene.');
      } finally {
        try {
          const snapshot = await getBillingPackageSnapshot(accountId);
          setBillingPackagePrice(snapshot?.price ?? null);
        } catch {
          // ignore
        }
        setBillingLoading(false);
      }
    })();
  };

  const handleRestorePurchases = () => {
    if (billingLoading) {
      return;
    }

    setBillingLoading(true);
    void (async () => {
      try {
        const restoreResult = await restorePremiumPurchases(accountId);
        setBillingMessage(restoreResult.message);
        let syncedSubscriptionStatus: SubscriptionStatus | null = null;

        if (accountToken && restoreResult.status === 'purchased') {
          const synced = await syncRevenueCatEntitlement({
            accountId,
            accountToken,
            appUserID: accountId,
          });

          if (synced) {
            syncedSubscriptionStatus = synced.subscriptionStatus;
            applySubscriptionStatus(synced.subscriptionStatus);
            setBillingMessage(
              synced.subscriptionStatus === 'premium'
                ? 'Satın alımlar geri yüklendi ve premium aktif edildi.'
                : 'Bu hesapta aktif premium bulunamadı.',
            );
          }
        }

        if (restoreResult.status === 'purchased' && syncedSubscriptionStatus === null) {
          if (isPremiumFromCustomerInfo(restoreResult.customerInfo)) {
            applySubscriptionStatus('premium');
            setBillingMessage('Satin alimlar geri yuklendi ve premium aktif edildi.');
          } else {
            setBillingMessage('Bu hesapta aktif premium bulunamadi.');
          }
        }
      } catch (error) {
        console.warn('Restore purchases failed.', error);
        setBillingMessage('Geri yükleme tamamlanamadı. App Store hesabını kontrol edip tekrar dene.');
      } finally {
        setBillingLoading(false);
      }
    })();
  };

  const handleClaimAccount = async (email: string, password: string) => {
    if (!accountToken) {
      return 'Bu cihaza ait oturum anahtarı bulunamadı. Sayfayı yenileyip tekrar dene.';
    }

    try {
      const claimed = await claimRemoteAccount({
        accountId,
        accountToken,
        email,
        password,
      });

      if (!claimed?.accountEmail) {
        return 'Hesap bağlanamadı.';
      }

      setAccountEmail(claimed.accountEmail);
      writeAccountEmail(claimed.accountEmail);
      return 'Hesap baglandi. E-posta dogrulama baglantisi ayrica gonderilmeli.';
    } catch (error) {
      console.warn('Account claim failed.', error);
      return 'Bu e-posta zaten kullanımda olabilir ya da şifre geçersiz.';
    }
  };

  const handleDeleteAccount = async () => {
    if (accountDeletionLoading) {
      return null;
    }

    if (!isRemotePersistenceEnabled() || !accountToken) {
      return 'Hesap silme su an kullanilamiyor.';
    }

    const confirmed = window.confirm(
      'Hesabi silersen tum profil ve ilerleme verisi kalici olarak kaldirilir. Devam edilsin mi?',
    );
    if (!confirmed) {
      return null;
    }

    setAccountDeletionLoading(true);
    try {
      await deleteRemoteSession(accountId, accountToken);
      clearAppStorage();
      onLogout();
      return null;
    } catch (error) {
      console.warn('Account deletion failed.', error);
      return 'Hesap silinemedi. Kisa sure sonra tekrar dene.';
    } finally {
      setAccountDeletionLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bu cihazdan çıkış yapacaksın. Yerel oturum temizlenecek. Devam edilsin mi?')) {
      clearAppStorage();
      onLogout();
    }
  };

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm font-medium text-slate-500">
          Monk mode hazırlanıyor...
        </div>
      }
    >
      <AuthenticatedApp
        profile={profile}
        tasks={tasks}
        activeTask={activeTask}
        missionStats={missionStats}
        tomorrowPreview={tomorrowPreview}
        upcomingPreview={upcomingPreview}
        weeklyPlanSnapshot={weeklyPlanSnapshot}
        onToggleTask={handleToggleTask}
        onSaveReflection={handleSaveReflection}
        onUpdateReminder={handleUpdateReminder}
        accountEmail={accountEmail}
        onClaimAccount={handleClaimAccount}
        onDeleteAccount={handleDeleteAccount}
        accountDeletionLoading={accountDeletionLoading}
        syncState={syncState}
        syncMessage={syncMessage}
        lastSyncedAt={lastSyncedAt}
        onRetrySync={handleRetrySync}
        billingAvailable={billingAvailable}
        billingLoading={billingLoading}
        billingMessage={billingMessage}
        billingPackagePrice={billingPackagePrice}
        onPurchasePremium={handlePurchasePremium}
        onRestorePurchases={handleRestorePurchases}
        onLogout={handleLogout}
      />
      <Suspense fallback={null}>
        <CompletionCelebration
          visible={celebration.visible}
          xp={celebration.xp}
          streak={celebration.streak}
          onDone={() => setCelebration((current) => ({ ...current, visible: false }))}
        />
      </Suspense>
    </Suspense>
  );
}
