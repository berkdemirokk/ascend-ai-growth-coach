import React, { Suspense, lazy, useEffect, useState } from 'react';
import { UserProfile } from './types';
import {
  ensureAccountId,
  writeAccountEmail,
  writeAccountId,
  writeAccountToken,
  writeProfile,
  writeTasks,
} from './lib/storage';
import {
  createSessionSeed,
  createSessionSeedFromRemotePayload,
  hydrateSessionSeedFromServer,
  loadPersistedSessionSeed,
  provisionRemoteSessionSeed,
  SessionSeed,
} from './lib/sessionBootstrap';
import { appleSignInRemoteAccount, loginRemoteAccount, PersistenceRequestError } from './lib/persistenceClient';

const Onboarding = lazy(() => import('./components/Onboarding'));
const AuthenticatedRuntime = lazy(() => import('./components/AuthenticatedRuntime'));
const AccountAccess = lazy(() => import('./components/AccountAccess'));

const AppShellFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-6">
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-lg">
        A
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-slate-900">Ascend</p>
        <p className="text-sm font-medium text-slate-500">Sistem yukleniyor...</p>
      </div>
    </div>
  </div>
);

export default function App() {
  const [sessionSeed, setSessionSeed] = useState<SessionSeed | null>(() => loadPersistedSessionSeed());
  const [accessMode, setAccessMode] = useState<'new' | 'restore'>('new');

  useEffect(() => {
    let active = true;
    if (!sessionSeed) {
      return () => {
        active = false;
      };
    }

    void (async () => {
      const hydratedSeed = await hydrateSessionSeedFromServer(sessionSeed);
      if (!active || !hydratedSeed) {
        return;
      }

      if (
        hydratedSeed.accountId !== sessionSeed.accountId ||
        hydratedSeed.sessionRevision !== sessionSeed.sessionRevision
      ) {
        setSessionSeed(hydratedSeed);
      }
    })();

    return () => {
      active = false;
    };
  }, [sessionSeed?.accountId, sessionSeed?.sessionRevision]);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    const accountId = ensureAccountId();
    const nextSeed = createSessionSeed(newProfile, [], accountId, null);
    writeProfile(newProfile);
    writeTasks(nextSeed.tasks);
    setSessionSeed(nextSeed);

    void provisionRemoteSessionSeed(nextSeed)
      .then((remoteSeed) => {
        setSessionSeed(remoteSeed);
      })
      .catch((error) => {
        console.warn('Initial remote account setup failed.', error);
      });
  };

  const handleRestoreAccount = async (email: string, password: string) => {
    try {
      const remoteAccount = await loginRemoteAccount({ email, password });
      if (!remoteAccount) {
        return 'Hesap sunucusuna su an ulasilamiyor.';
      }

      writeAccountId(remoteAccount.accountId);
      writeAccountToken(remoteAccount.accountToken);
      if (remoteAccount.accountEmail) {
        writeAccountEmail(remoteAccount.accountEmail);
      }
      writeProfile(remoteAccount.profile);
      writeTasks(remoteAccount.tasks);

      setSessionSeed(
        createSessionSeedFromRemotePayload({
          accountId: remoteAccount.accountId,
          accountToken: remoteAccount.accountToken,
          accountEmail: remoteAccount.accountEmail ?? null,
          subscriptionStatus: remoteAccount.subscriptionStatus,
          profile: remoteAccount.profile,
          tasks: remoteAccount.tasks,
          weeklyPlanSnapshot: remoteAccount.weeklyPlanSnapshot ?? null,
          plannedMissions: remoteAccount.plannedMissions ?? [],
          revision: remoteAccount.revision ?? 0,
        }),
      );
      return null;
    } catch (error) {
      console.warn('Account restore failed.', error);

      if (error instanceof PersistenceRequestError) {
        if (error.status === 404 || error.status === 403) {
          return 'E-posta veya sifre hatali, ya da hesap bulunamadi.';
        }

        return 'Giris su an tamamlanamadi. Kisa sure sonra tekrar dene.';
      }

      if (error instanceof TypeError) {
        return 'Sunucuya baglanti kurulamadi. Interneti ve sunucu adresini kontrol et.';
      }

      return 'Giris su an tamamlanamadi. Kisa sure sonra tekrar dene.';
    }
  };

  const handleAppleSignIn = async (identityToken: string, authorizationCode: string, email: string | null) => {
    try {
      const remoteAccount = await appleSignInRemoteAccount({ identityToken, authorizationCode, email });
      if (!remoteAccount) {
        return 'Apple ile giriş su an tamamlanamadi.';
      }

      writeAccountId(remoteAccount.accountId);
      writeAccountToken(remoteAccount.accountToken);
      if (remoteAccount.accountEmail) {
        writeAccountEmail(remoteAccount.accountEmail);
      }
      writeProfile(remoteAccount.profile);
      writeTasks(remoteAccount.tasks);

      setSessionSeed(
        createSessionSeedFromRemotePayload({
          accountId: remoteAccount.accountId,
          accountToken: remoteAccount.accountToken,
          accountEmail: remoteAccount.accountEmail ?? null,
          subscriptionStatus: remoteAccount.subscriptionStatus,
          profile: remoteAccount.profile,
          tasks: remoteAccount.tasks,
          weeklyPlanSnapshot: remoteAccount.weeklyPlanSnapshot ?? null,
          plannedMissions: remoteAccount.plannedMissions ?? [],
          revision: remoteAccount.revision ?? 0,
        }),
      );
      return null;
    } catch (error) {
      console.warn('Apple sign-in failed.', error);
      return 'Apple ile giriş su an tamamlanamadi.';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Suspense fallback={<AppShellFallback />}>
        {!sessionSeed ? (
          accessMode === 'restore' ? (
            <AccountAccess onStartFresh={() => setAccessMode('new')} onRestore={handleRestoreAccount} onAppleSignIn={handleAppleSignIn} />
          ) : (
            <Onboarding onComplete={handleOnboardingComplete} onShowRestore={() => setAccessMode('restore')} />
          )
        ) : (
          <Suspense fallback={<AppShellFallback />}>
            <AuthenticatedRuntime
              key={`${sessionSeed.profile.name}-${sessionSeed.profile.selectedPath ?? 'general'}`}
              initialSeed={sessionSeed}
              onLogout={() => {
                setAccessMode('restore');
                setSessionSeed(null);
              }}
            />
          </Suspense>
        )}
      </Suspense>
    </div>
  );
}
