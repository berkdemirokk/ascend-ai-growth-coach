import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createServerApp } from './app.mjs';

const createProfile = (planTier = 'free') => ({
  name: 'Berk',
  selectedPath: 'general',
  goals: ['Rutin'],
  level: 1,
  experience: 0,
  streak: 0,
  lastCompletedDayKey: null,
  planTier,
});

const createTask = () => ({
  id: 'task-1',
  lessonId: 'gen-1',
  unitId: 'general-unit-1',
  unitTitle: 'Baslangic',
  unitOrder: 1,
  missionKind: 'lesson',
  adaptationMode: 'standard',
  planFocus: 'standard',
  title: 'Ilk gorev',
  description: 'Aciklama',
  teaching: 'Ogretici not',
  reflectionPrompt: 'Bugun ne ogrendin?',
  completed: false,
  category: 'general',
  createdAt: Date.now(),
  completedAt: null,
  rewardGranted: false,
  dayKey: '2026-04-10',
  reflection: null,
  source: 'curriculum',
});

const createWeeklyPlanSnapshot = () => ({
  weekKey: '2026-04-07',
  direction: 'support',
  title: '7 gunluk destek rotasi',
  summary: 'Bu hafta destek rotasi aktif.',
  createdAt: Date.now(),
  days: [
    {
      day: 1,
      title: 'Baslangici kucult',
      focus: 'Odak daralt.',
      checkpoint: 'Ne zor geldi?',
      branchFocus: 'support',
    },
  ],
});

const createPlannedMissions = () => [
  {
    dayKey: '2026-04-11',
    lessonId: 'gen-11',
    unitTitle: 'Sistem Kur',
    title: 'Baslangici kucult',
    teaching: 'Odagi daralt.',
    missionKind: 'lesson',
    adaptationMode: 'support',
    planFocus: 'support',
  },
];

const withServer = async (callback, options = {}) => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ascend-server-test-'));
  const app = createServerApp({
    sessionDir: path.join(rootDir, 'sessions'),
    accountDir: path.join(rootDir, 'accounts'),
    ollamaBaseUrl: 'http://127.0.0.1:11434',
    ollamaModel: 'qwen2.5:3b',
    enableBillingPreview: Boolean(options.enableBillingPreview),
    revenueCatApiKey: options.revenueCatApiKey ?? '',
    revenueCatEntitlementId: options.revenueCatEntitlementId ?? 'premium',
    revenueCatFetch: options.revenueCatFetch ?? fetch,
  });
  const server = app.listen(0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await callback(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(undefined);
      });
    });
    app.locals.closeDatabase?.();
    await fs.rm(rootDir, { recursive: true, force: true });
  }
};

test('account create seeds session and requires token for reads', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: 'account-a',
        profile: createProfile(),
        tasks: [createTask()],
      }),
    });

    assert.equal(createResponse.status, 201);
    const created = await createResponse.json();
    assert.equal(typeof created.accountToken, 'string');
    assert.equal(created.accountId, 'account-a');

    const blockedRead = await fetch(`${baseUrl}/api/session/account-a`);
    assert.equal(blockedRead.status, 403);

    const allowedRead = await fetch(`${baseUrl}/api/session/account-a`, {
      headers: {
        'X-Ascend-Account-Token': created.accountToken,
      },
    });
    assert.equal(allowedRead.status, 200);
    const session = await allowedRead.json();
    assert.equal(session.profile.name, 'Berk');
    assert.equal(session.tasks.length, 1);
  });
});

test('free entitlements force profile plan tier to free on write', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: 'account-tier-coerce',
        profile: createProfile('premium'),
        tasks: [createTask()],
      }),
    });

    assert.equal(createResponse.status, 201);
    const created = await createResponse.json();
    assert.equal(created.subscriptionStatus, 'free');
    assert.equal(created.profile.planTier, 'free');
  });
});

test('existing account cannot be reclaimed without the token', async () => {
  await withServer(async (baseUrl) => {
    const initialResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: 'account-b',
        profile: createProfile('premium'),
        tasks: [createTask()],
      }),
    });

    const created = await initialResponse.json();

    const conflictResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: 'account-b',
        profile: createProfile(),
        tasks: [createTask()],
      }),
    });

    assert.equal(conflictResponse.status, 409);

    const authorizedResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': created.accountToken,
      },
      body: JSON.stringify({
        accountId: 'account-b',
        profile: createProfile('premium'),
        tasks: [createTask()],
      }),
    });

    assert.equal(authorizedResponse.status, 200);
    const authorized = await authorizedResponse.json();
    assert.equal(authorized.accountToken, created.accountToken);
  });
});

test('session writes reject invalid tokens and accept the right token', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: 'account-c',
        profile: createProfile(),
        tasks: [createTask()],
      }),
    });

    const created = await createResponse.json();
    const nextTasks = [{ ...createTask(), id: 'task-2', title: 'Ikinci gorev' }];

    const rejectedWrite = await fetch(`${baseUrl}/api/session/account-c`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': 'wrong-token',
      },
      body: JSON.stringify({
        profile: createProfile(),
        tasks: nextTasks,
      }),
    });
    assert.equal(rejectedWrite.status, 403);

    const acceptedWrite = await fetch(`${baseUrl}/api/session/account-c`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': created.accountToken,
      },
      body: JSON.stringify({
        profile: createProfile(),
        tasks: nextTasks,
        revision: created.revision,
      }),
    });
    assert.equal(acceptedWrite.status, 200);

    const readBack = await fetch(`${baseUrl}/api/session/account-c`, {
      headers: {
        'X-Ascend-Account-Token': created.accountToken,
      },
    });
    const session = await readBack.json();
    assert.equal(session.tasks[0].title, 'Ikinci gorev');
  });
});

test('claimed account can be restored by email and password with a rotated token', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: 'account-d',
        profile: createProfile(),
        tasks: [createTask()],
      }),
    });
    const created = await createResponse.json();

    const claimResponse = await fetch(`${baseUrl}/api/account/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': created.accountToken,
      },
      body: JSON.stringify({
        accountId: 'account-d',
        email: 'berk@example.com',
        password: 'secret123',
      }),
    });

    assert.equal(claimResponse.status, 200);

    const loginResponse = await fetch(`${baseUrl}/api/account/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'berk@example.com',
        password: 'secret123',
      }),
    });

    assert.equal(loginResponse.status, 200);
    const loggedIn = await loginResponse.json();
    assert.equal(loggedIn.accountEmail, 'berk@example.com');
    assert.notEqual(loggedIn.accountToken, created.accountToken);

    const oldTokenRead = await fetch(`${baseUrl}/api/session/account-d`, {
      headers: {
        'X-Ascend-Account-Token': created.accountToken,
      },
    });
    assert.equal(oldTokenRead.status, 403);

    const newTokenRead = await fetch(`${baseUrl}/api/session/account-d`, {
      headers: {
        'X-Ascend-Account-Token': loggedIn.accountToken,
      },
    });
    assert.equal(newTokenRead.status, 200);
  });
});

test('claimed account can be verified by token and login payload reflects verified email', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: 'account-verify',
        profile: createProfile(),
        tasks: [createTask()],
      }),
    });
    const created = await createResponse.json();

    const claimResponse = await fetch(`${baseUrl}/api/account/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': created.accountToken,
      },
      body: JSON.stringify({
        accountId: 'account-verify',
        email: 'verify@example.com',
        password: 'secret123',
      }),
    });
    const claimed = await claimResponse.json();

    const verifyResponse = await fetch(`${baseUrl}/api/account/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: claimed.verificationToken,
      }),
    });
    assert.equal(verifyResponse.status, 200);
    const verified = await verifyResponse.json();
    assert.equal(verified.emailVerified, true);

    const loginResponse = await fetch(`${baseUrl}/api/account/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'verify@example.com',
        password: 'secret123',
      }),
    });
    const loggedIn = await loginResponse.json();
    assert.equal(loggedIn.emailVerified, true);
  });
});

test('password reset request and confirm lets the user login with a new password', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: 'account-reset',
        profile: createProfile(),
        tasks: [createTask()],
      }),
    });
    const created = await createResponse.json();

    await fetch(`${baseUrl}/api/account/claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': created.accountToken,
      },
      body: JSON.stringify({
        accountId: 'account-reset',
        email: 'reset@example.com',
        password: 'secret123',
      }),
    });

    const requestResetResponse = await fetch(`${baseUrl}/api/account/password-reset/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reset@example.com' }),
    });
    assert.equal(requestResetResponse.status, 200);
    const requestReset = await requestResetResponse.json();
    assert.equal(requestReset.ok, true);
    assert.equal(typeof requestReset.resetToken, 'string');

    const confirmResetResponse = await fetch(`${baseUrl}/api/account/password-reset/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: requestReset.resetToken,
        password: 'renewed456',
      }),
    });
    assert.equal(confirmResetResponse.status, 200);

    const oldLoginResponse = await fetch(`${baseUrl}/api/account/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'reset@example.com',
        password: 'secret123',
      }),
    });
    assert.equal(oldLoginResponse.status, 403);

    const newLoginResponse = await fetch(`${baseUrl}/api/account/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'reset@example.com',
        password: 'renewed456',
      }),
    });
    assert.equal(newLoginResponse.status, 200);
  });
});

test('billing preview activation upgrades account entitlement to premium', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: 'account-billing',
        profile: createProfile(),
        tasks: [createTask()],
      }),
    });
    const created = await createResponse.json();

    const billingResponse = await fetch(`${baseUrl}/api/billing/activate-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': created.accountToken,
      },
      body: JSON.stringify({
        accountId: 'account-billing',
      }),
    });
    assert.equal(billingResponse.status, 200);
    const upgraded = await billingResponse.json();
    assert.equal(upgraded.subscriptionStatus, 'premium');

    const sessionResponse = await fetch(`${baseUrl}/api/session/account-billing`, {
      headers: {
        'X-Ascend-Account-Token': created.accountToken,
      },
    });
    const session = await sessionResponse.json();
    assert.equal(session.subscriptionStatus, 'premium');
  }, { enableBillingPreview: true });
});

test('billing preview endpoint is disabled by default for release safety', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: 'account-billing-disabled',
        profile: createProfile(),
        tasks: [createTask()],
      }),
    });
    const created = await createResponse.json();

    const billingResponse = await fetch(`${baseUrl}/api/billing/activate-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': created.accountToken,
      },
      body: JSON.stringify({
        accountId: 'account-billing-disabled',
      }),
    });

    assert.equal(billingResponse.status, 410);
  });
});

test('revenuecat entitlement sync upgrades account to premium when entitlement is active', async () => {
  const revenueCatFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      subscriber: {
        entitlements: {
          premium: {
            expires_date: null,
            product_identifier: 'ascend_premium_monthly',
          },
        },
      },
    }),
  });

  await withServer(
    async (baseUrl) => {
      const createResponse = await fetch(`${baseUrl}/api/account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: 'account-revenuecat',
          profile: createProfile(),
          tasks: [createTask()],
        }),
      });
      const created = await createResponse.json();

      const syncResponse = await fetch(`${baseUrl}/api/billing/sync-revenuecat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Ascend-Account-Token': created.accountToken,
        },
        body: JSON.stringify({
          accountId: 'account-revenuecat',
          appUserID: 'account-revenuecat',
        }),
      });

      assert.equal(syncResponse.status, 200);
      const synced = await syncResponse.json();
      assert.equal(synced.subscriptionStatus, 'premium');
      assert.equal(synced.entitlementActive, true);

      const sessionResponse = await fetch(`${baseUrl}/api/session/account-revenuecat`, {
        headers: {
          'X-Ascend-Account-Token': created.accountToken,
        },
      });
      const session = await sessionResponse.json();
      assert.equal(session.subscriptionStatus, 'premium');
      assert.equal(session.profile.planTier, 'premium');
    },
    {
      revenueCatApiKey: 'rc_test_secret',
      revenueCatEntitlementId: 'premium',
      revenueCatFetch,
    },
  );
});

test('revenuecat entitlement sync is blocked when billing integration is not configured', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accountId: 'account-revenuecat-disabled',
        profile: createProfile(),
        tasks: [createTask()],
      }),
    });
    const created = await createResponse.json();

    const syncResponse = await fetch(`${baseUrl}/api/billing/sync-revenuecat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': created.accountToken,
      },
      body: JSON.stringify({
        accountId: 'account-revenuecat-disabled',
        appUserID: 'account-revenuecat-disabled',
      }),
    });

    assert.equal(syncResponse.status, 503);
  });
});

test('revenuecat entitlement sync rejects mismatched app user id', async () => {
  const revenueCatFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      subscriber: {
        entitlements: {},
      },
    }),
  });

  await withServer(
    async (baseUrl) => {
      const createResponse = await fetch(`${baseUrl}/api/account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: 'account-revenuecat-mismatch',
          profile: createProfile(),
          tasks: [createTask()],
        }),
      });
      const created = await createResponse.json();

      const syncResponse = await fetch(`${baseUrl}/api/billing/sync-revenuecat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Ascend-Account-Token': created.accountToken,
        },
        body: JSON.stringify({
          accountId: 'account-revenuecat-mismatch',
          appUserID: 'another-account',
        }),
      });

      assert.equal(syncResponse.status, 400);
    },
    {
      revenueCatApiKey: 'rc_test_secret',
      revenueCatEntitlementId: 'premium',
      revenueCatFetch,
    },
  );
});

test('revenuecat entitlement sync keeps account free when entitlement is expired', async () => {
  const revenueCatFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      subscriber: {
        entitlements: {
          premium: {
            expires_date: '2000-01-01T00:00:00Z',
            product_identifier: 'ascend_premium_monthly',
          },
        },
      },
    }),
  });

  await withServer(
    async (baseUrl) => {
      const createResponse = await fetch(`${baseUrl}/api/account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: 'account-revenuecat-expired',
          profile: createProfile(),
          tasks: [createTask()],
        }),
      });
      const created = await createResponse.json();

      const syncResponse = await fetch(`${baseUrl}/api/billing/sync-revenuecat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Ascend-Account-Token': created.accountToken,
        },
        body: JSON.stringify({
          accountId: 'account-revenuecat-expired',
          appUserID: 'account-revenuecat-expired',
        }),
      });

      assert.equal(syncResponse.status, 200);
      const synced = await syncResponse.json();
      assert.equal(synced.subscriptionStatus, 'free');
      assert.equal(synced.entitlementActive, false);

      const sessionResponse = await fetch(`${baseUrl}/api/session/account-revenuecat-expired`, {
        headers: {
          'X-Ascend-Account-Token': created.accountToken,
        },
      });
      const session = await sessionResponse.json();
      assert.equal(session.subscriptionStatus, 'free');
      assert.equal(session.profile.planTier, 'free');
    },
    {
      revenueCatApiKey: 'rc_test_secret',
      revenueCatEntitlementId: 'premium',
      revenueCatFetch,
    },
  );
});

test('weekly plan snapshot is persisted with the session payload', async () => {
  await withServer(async (baseUrl) => {
    const weeklyPlanSnapshot = createWeeklyPlanSnapshot();
    const plannedMissions = createPlannedMissions();
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: 'account-e',
        profile: createProfile('premium'),
        tasks: [createTask()],
        weeklyPlanSnapshot,
        plannedMissions,
      }),
    });
    const created = await createResponse.json();

    const readResponse = await fetch(`${baseUrl}/api/session/account-e`, {
      headers: {
        'X-Ascend-Account-Token': created.accountToken,
      },
    });
    assert.equal(readResponse.status, 200);
    const session = await readResponse.json();
    assert.equal(session.weeklyPlanSnapshot?.weekKey, weeklyPlanSnapshot.weekKey);
    assert.equal(session.weeklyPlanSnapshot?.direction, 'support');
    assert.equal(session.plannedMissions?.[0]?.lessonId, plannedMissions[0].lessonId);
  });
});

test('stale session revision is rejected with the current session payload', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accountId: 'account-f',
        profile: createProfile('premium'),
        tasks: [createTask()],
      }),
    });
    const created = await createResponse.json();

    const staleWrite = await fetch(`${baseUrl}/api/session/account-f`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Ascend-Account-Token': created.accountToken,
      },
      body: JSON.stringify({
        profile: createProfile('premium'),
        tasks: [createTask()],
        revision: 0,
      }),
    });

    assert.equal(staleWrite.status, 409);
    const conflict = await staleWrite.json();
    assert.equal(conflict.currentSession.revision, 1);
    assert.equal(conflict.currentSession.profile.name, 'Berk');
  });
});
