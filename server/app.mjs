import express from 'express';
import fs from 'node:fs/promises';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { createDatabase } from './db.mjs';

const normalizeEmail = (email) => String(email ?? '').trim().toLowerCase();
const createAccountToken = () => randomUUID();
const createPasswordSalt = () => randomBytes(16).toString('hex');
const hashPassword = (password, salt) => scryptSync(password, salt, 64).toString('hex');

const verifyPassword = (password, salt, expectedHash) => {
  const actual = Buffer.from(hashPassword(password, salt), 'hex');
  const expected = Buffer.from(expectedHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

const getCoachingMode = (tasks = []) => {
  const adaptationHint = tasks
    .filter((task) => task.completed && task.reflection)
    .slice(-3)
    .map((task) => String(task.reflection).toLowerCase())
    .join(' ');

  if (adaptationHint.includes('zor') || adaptationHint.includes('ertele')) {
    return 'Bugun daha destekleyici, kucuk adimlara indiren bir ton kullan.';
  }

  if (adaptationHint.includes('kolay') || adaptationHint.includes('hazir')) {
    return 'Bugun biraz daha net ve itici bir ton kullan; kullaniciyi bir tik zorla.';
  }

  return 'Bugun dengeli, net ve sakin bir ton kullan.';
};

const getWeeklyReview = (profile, tasks = []) => {
  if (profile?.planTier !== 'premium') {
    return '';
  }

  const completed = tasks.filter((task) => task?.completed && task?.source === 'curriculum').slice(-7);
  const reflectionCount = completed.filter((task) => task?.reflection).length;
  const dominantUnit = completed[0]?.unitTitle ?? 'daginik ilerleme';

  return `Haftalik premium hafiza: kullanici son donemde ${completed.length} gorev tamamladi, ${reflectionCount} yansitma yazdi ve ozellikle ${dominantUnit} etrafinda ilerledi.`;
};

const getAdaptivePlanNote = (profile, tasks = []) => {
  if (profile?.planTier !== 'premium') {
    return '';
  }

  const completed = tasks.filter((task) => task?.completed && task?.source === 'curriculum').slice(-7).length;
  const reflections = tasks.filter((task) => task?.completed && task?.reflection).slice(-7).length;

  if (completed < 3) {
    return 'Premium adaptif plan: ritim zayif. Kucuk, destekleyici ve baslangici kolaylastiran yonlendirme kullan.';
  }

  if (completed >= 5 && reflections >= 3) {
    return 'Premium adaptif plan: momentum gucleniyor. Bir tik daha zorlayici ama hala uygulanabilir yonlendirme kullan.';
  }

  return 'Premium adaptif plan: sistem calisiyor. Dengeli ve standardi koruyan yonlendirme kullan.';
};

const buildPrompt = ({ mode, profile, message, options, history, activeTask, tasks }) => {
  if (mode === 'decision') {
    return [
      'Sen net, tarafsiz ve pratik bir karar destek asistanisin.',
      'Kullaniciya tek bir onerilen secenek ve kisa bir gerekce ver.',
      `Secenekler: ${(options ?? []).join(' | ')}`,
    ].join('\n');
  }

  const conversation = (history ?? [])
    .slice(-6)
    .map((entry) => `${entry.role === 'user' ? 'Kullanici' : 'Asistan'}: ${entry.text}`)
    .join('\n');
  const memoryWindow = profile?.planTier === 'premium' ? 5 : 1;
  const recentReflections = (tasks ?? [])
    .filter((task) => task.completed && task.reflection)
    .slice(-memoryWindow)
    .map((task) => `${task.title}: ${task.reflection}`)
    .join('\n');

  return [
    'Sen Ascend icin calisan kisa, destekleyici ve uygulanabilir bir gelisim kocusun.',
    `Kullanicinin adi: ${profile?.name ?? 'Bilinmiyor'}`,
    `Odak alani: ${profile?.selectedPath ?? 'general'}`,
    'Yanitlarin Turkce, net ve somut olsun.',
    'Gereksiz abartili motivasyon cumlelerinden kacin.',
    getCoachingMode(tasks ?? []),
    getWeeklyReview(profile, tasks ?? []),
    getAdaptivePlanNote(profile, tasks ?? []),
    activeTask ? `Bugunun gorevi: ${activeTask.title}\nGorevin aciklamasi: ${activeTask.description}\nDers notu: ${activeTask.teaching}` : '',
    recentReflections ? `Son yansitmalar:\n${recentReflections}` : '',
    conversation ? `Son konusma:\n${conversation}` : '',
    `Son kullanici mesaji: ${message ?? ''}`,
  ]
    .filter(Boolean)
    .join('\n\n');
};

const readJsonFile = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }

    throw error;
  }
};

const migrateLegacyJsonStore = async ({ db, sessionDir, accountDir }) => {
  if (!sessionDir || !accountDir) {
    return;
  }

  try {
    const sessionEntries = await fs.readdir(sessionDir, { withFileTypes: true }).catch(() => []);
    for (const entry of sessionEntries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) {
        continue;
      }

      const accountId = entry.name.replace(/\.json$/, '');
      if (db.readSession(accountId)) {
        continue;
      }

      const legacySession = await readJsonFile(path.join(sessionDir, entry.name));
      if (!legacySession) {
        continue;
      }

      db.writeSession({
        accountId,
        profile: legacySession.profile ?? null,
        tasks: legacySession.tasks ?? [],
        weeklyPlanSnapshot: legacySession.weeklyPlanSnapshot ?? null,
        plannedMissions: legacySession.plannedMissions ?? [],
        revision: legacySession.revision ?? 1,
        updatedAt: legacySession.updatedAt ?? Date.now(),
      });
    }

    const accountEntries = await fs.readdir(accountDir, { withFileTypes: true }).catch(() => []);
    for (const entry of accountEntries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) {
        continue;
      }

      const accountId = entry.name.replace(/\.json$/, '');
      if (db.readAccount(accountId)) {
        continue;
      }

      const legacyAccount = await readJsonFile(path.join(accountDir, entry.name));
      if (!legacyAccount) {
        continue;
      }

      db.writeAccount({
        accountId,
        accountToken: legacyAccount.accountToken ?? createAccountToken(),
        accountEmail: legacyAccount.accountEmail ?? null,
        emailVerified: Boolean(legacyAccount.emailVerified),
        passwordSalt: legacyAccount.passwordSalt ?? null,
        passwordHash: legacyAccount.passwordHash ?? null,
        subscriptionStatus: legacyAccount.subscriptionStatus ?? 'free',
        subscriptionProvider: legacyAccount.subscriptionProvider ?? null,
        subscriptionUpdatedAt: legacyAccount.subscriptionUpdatedAt ?? null,
        createdAt: legacyAccount.createdAt ?? Date.now(),
        updatedAt: legacyAccount.updatedAt ?? Date.now(),
      });
    }
  } catch (error) {
    console.warn('Legacy JSON migration skipped.', error);
  }
};

const createMemoryRateLimiter = () => {
  const store = new Map();
  const windows = {
    login: { limit: 10, windowMs: 10 * 60 * 1000 },
    claim: { limit: 6, windowMs: 10 * 60 * 1000 },
    passwordReset: { limit: 6, windowMs: 10 * 60 * 1000 },
    verify: { limit: 12, windowMs: 10 * 60 * 1000 },
    default: { limit: 120, windowMs: 60 * 1000 },
  };

  return (bucket, key) => {
    const now = Date.now();
    const config = windows[bucket] ?? windows.default;
    const compositeKey = `${bucket}:${key}`;
    const current = store.get(compositeKey);

    if (!current || now > current.resetAt) {
      store.set(compositeKey, { count: 1, resetAt: now + config.windowMs });
      return { allowed: true, remaining: config.limit - 1 };
    }

    if (current.count >= config.limit) {
      return { allowed: false, remaining: 0, retryAfterMs: current.resetAt - now };
    }

    current.count += 1;
    return { allowed: true, remaining: config.limit - current.count };
  };
};

export const createServerApp = ({
  dbPath,
  sessionDir,
  accountDir,
  ollamaBaseUrl,
  ollamaModel,
  enableBillingPreview = false,
  revenueCatApiKey = '',
  revenueCatEntitlementId = 'premium',
  revenueCatApiBaseUrl = 'https://api.revenuecat.com/v1',
  revenueCatFetch = fetch,
  onEmailVerificationRequested = async () => {},
  onPasswordResetRequested = async () => {},
}) => {
  const app = express();
  const resolvedDbPath = dbPath ?? path.join(path.dirname(sessionDir ?? accountDir ?? process.cwd()), 'data', 'ascend.sqlite');
  const db = createDatabase(resolvedDbPath);
  const rateLimit = createMemoryRateLimiter();
  app.locals.closeDatabase = () => db.close();
  void migrateLegacyJsonStore({ db, sessionDir, accountDir });

  app.use(express.json({ limit: '1mb' }));
  app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Content-Type, X-Ascend-Account-Token');

    if (request.method === 'OPTIONS') {
      response.sendStatus(204);
      return;
    }

    next();
  });

  const guardRateLimit = (bucket) => (request, response, next) => {
    const key = `${request.ip}:${request.body?.email ?? request.params?.accountId ?? 'anon'}`;
    const result = rateLimit(bucket, key);
    if (!result.allowed) {
      response.status(429).json({ error: 'Too many requests', retryAfterMs: result.retryAfterMs ?? 1000 });
      return;
    }

    next();
  };

  const normalizeSubscriptionStatus = (subscriptionStatus) => (subscriptionStatus === 'premium' ? 'premium' : 'free');

  const applyEntitlementToProfile = (profile, subscriptionStatus) => {
    if (!profile || typeof profile !== 'object') {
      return profile;
    }

    return {
      ...profile,
      planTier: normalizeSubscriptionStatus(subscriptionStatus),
    };
  };

  const serializeAccountSession = (account, session) => ({
    accountId: account.accountId,
    accountToken: account.accountToken,
    accountEmail: account.accountEmail ?? null,
    emailVerified: Boolean(account.emailVerified),
    subscriptionStatus: normalizeSubscriptionStatus(account.subscriptionStatus),
    profile: applyEntitlementToProfile(session?.profile ?? null, account.subscriptionStatus),
    tasks: session?.tasks ?? [],
    weeklyPlanSnapshot: session?.weeklyPlanSnapshot ?? null,
    plannedMissions: session?.plannedMissions ?? [],
    revision: session?.revision ?? 1,
    updatedAt: session?.updatedAt ?? Date.now(),
  });

  const requireAccountAuth = (request, response) => {
    const accountId = request.params.accountId;
    const providedToken = request.header('X-Ascend-Account-Token');
    const account = db.readAccount(accountId);

    if (!account) {
      response.status(404).json({ error: 'Account not found' });
      return null;
    }

    if (!providedToken || providedToken !== account.accountToken) {
      response.status(403).json({ error: 'Invalid account token' });
      return null;
    }

    return account;
  };

  const requireAccountBodyAuth = (request, response) => {
    const accountId = String(request.body?.accountId ?? '');
    const providedToken = request.header('X-Ascend-Account-Token');
    const account = db.readAccount(accountId);

    if (!account) {
      response.status(404).json({ error: 'Account not found' });
      return null;
    }

    if (!providedToken || providedToken !== account.accountToken) {
      response.status(403).json({ error: 'Invalid account token' });
      return null;
    }

    return account;
  };

  const isRevenueCatConfigured = () => Boolean(revenueCatApiKey) && Boolean(revenueCatEntitlementId);

  const parseRevenueCatDate = (value) => {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getEntitlementSnapshotFromRevenueCat = (subscriberPayload) => {
    const entitlement =
      subscriberPayload?.subscriber?.entitlements?.[revenueCatEntitlementId] ??
      subscriberPayload?.entitlements?.[revenueCatEntitlementId] ??
      null;

    if (!entitlement || typeof entitlement !== 'object') {
      return {
        isActive: false,
        expiresAt: null,
        productIdentifier: null,
      };
    }

    const expiresAt = parseRevenueCatDate(
      entitlement.expires_date ?? entitlement.expiresDate ?? entitlement.expiration_date ?? null,
    );
    const isActive = expiresAt === null || expiresAt > Date.now();

    return {
      isActive,
      expiresAt,
      productIdentifier: entitlement.product_identifier ?? entitlement.productIdentifier ?? null,
    };
  };

  const fetchRevenueCatSubscriber = async (appUserID) => {
    const response = await revenueCatFetch(
      `${String(revenueCatApiBaseUrl).replace(/\/$/, '')}/subscribers/${encodeURIComponent(appUserID)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${revenueCatApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`RevenueCat lookup failed: ${response.status}${detail ? ` ${detail}` : ''}`);
    }

    return response.json();
  };

  const askOllama = async (payload) => {
    const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        prompt: buildPrompt(payload),
        stream: false,
        options: {
          temperature: payload.mode === 'decision' ? 0.3 : 0.7,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama request failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    return typeof data.response === 'string' ? data.response.trim() : '';
  };

  app.get('/api/health', async (_request, response) => {
    try {
      const upstream = await fetch(`${ollamaBaseUrl}/api/tags`);
      if (!upstream.ok) {
        throw new Error(`Ollama tags failed: ${upstream.status}`);
      }

      const data = await upstream.json();
      response.json({
        ok: true,
        model: ollamaModel,
        ollamaBaseUrl,
        storage: 'sqlite',
        availableModels: Array.isArray(data.models) ? data.models.map((model) => model.name) : [],
      });
    } catch (error) {
      response.status(503).json({
        ok: false,
        model: ollamaModel,
        storage: 'sqlite',
        error: error instanceof Error ? error.message : 'Unknown health error',
      });
    }
  });

  app.post('/api/account', async (request, response) => {
    try {
      const { accountId, profile, tasks, weeklyPlanSnapshot, plannedMissions } = request.body ?? {};
      const providedToken = request.header('X-Ascend-Account-Token');

      if (typeof accountId !== 'string' || !profile || !Array.isArray(tasks)) {
        response.status(400).json({ error: 'Invalid account payload' });
        return;
      }

      const existingAccount = db.readAccount(accountId);
      if (existingAccount && existingAccount.accountToken !== providedToken) {
        response.status(409).json({ error: 'Account already exists' });
        return;
      }

      const account =
        existingAccount ??
        db.writeAccount({
          accountId,
          accountToken: createAccountToken(),
          accountEmail: null,
          emailVerified: false,
          subscriptionStatus: 'free',
        });

      const existingSession = db.readSession(accountId);
      if (!existingSession) {
        db.writeSession({
          accountId,
          profile: applyEntitlementToProfile(profile, account.subscriptionStatus),
          tasks,
          weeklyPlanSnapshot,
          plannedMissions,
          revision: 1,
        });
      }

      response.status(existingAccount ? 200 : 201).json(serializeAccountSession(account, db.readSession(accountId)));
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Account create failed',
      });
    }
  });

  app.post('/api/account/claim', guardRateLimit('claim'), async (request, response) => {
    try {
      const accountId = request.body?.accountId;
      const email = normalizeEmail(request.body?.email);
      const password = String(request.body?.password ?? '');
      const account = db.readAccount(accountId);
      const providedToken = request.header('X-Ascend-Account-Token');

      if (!account || !providedToken || providedToken !== account.accountToken) {
        response.status(403).json({ error: 'Invalid account token' });
        return;
      }

      if (!email.includes('@') || password.length < 6) {
        response.status(400).json({ error: 'Invalid claim payload' });
        return;
      }

      if (account.accountEmail && account.accountEmail !== email) {
        response.status(409).json({ error: 'Account already claimed' });
        return;
      }

      const existingByEmail = db.readAccountByEmail(email);
      if (existingByEmail && existingByEmail.accountId !== accountId) {
        response.status(409).json({ error: 'Email already in use' });
        return;
      }

      const passwordSalt = createPasswordSalt();
      const passwordHash = hashPassword(password, passwordSalt);
      const nextAccount = db.writeAccount({
        ...account,
        accountId,
        accountEmail: email,
        emailVerified: false,
        passwordSalt,
        passwordHash,
      });
      const verificationToken = randomUUID();
      db.createVerificationToken({
        token: verificationToken,
        accountId,
        email,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });
      await onEmailVerificationRequested({
        token: verificationToken,
        accountId,
        email,
      });

      response.json({
        ...serializeAccountSession(nextAccount, db.readSession(accountId)),
      });
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Account claim failed',
      });
    }
  });

  app.post('/api/account/login', guardRateLimit('login'), async (request, response) => {
    try {
      const email = normalizeEmail(request.body?.email);
      const password = String(request.body?.password ?? '');

      if (!email.includes('@') || !password) {
        response.status(400).json({ error: 'Invalid login payload' });
        return;
      }

      const account = db.readAccountByEmail(email);
      if (!account || !account.passwordSalt || !account.passwordHash) {
        response.status(404).json({ error: 'Account not found' });
        return;
      }

      if (!verifyPassword(password, account.passwordSalt, account.passwordHash)) {
        response.status(403).json({ error: 'Invalid credentials' });
        return;
      }

      const rotatedAccount = db.writeAccount({
        ...account,
        accountId: account.accountId,
        accountToken: createAccountToken(),
      });
      const session = db.readSession(account.accountId);
      if (!session) {
        response.status(404).json({ error: 'Session not found' });
        return;
      }

      response.json(serializeAccountSession(rotatedAccount, session));
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Account login failed',
      });
    }
  });

  app.post('/api/account/verify-email', guardRateLimit('verify'), async (request, response) => {
    try {
      const token = String(request.body?.token ?? '');
      const verification = db.readVerificationToken(token);

      if (!verification || verification.used_at || verification.expires_at < Date.now()) {
        response.status(404).json({ error: 'Verification token invalid or expired' });
        return;
      }

      const account = db.readAccount(verification.account_id);
      if (!account) {
        response.status(404).json({ error: 'Account not found' });
        return;
      }

      db.useVerificationToken(token);
      const verifiedAccount = db.writeAccount({
        ...account,
        accountId: account.accountId,
        accountEmail: verification.email,
        emailVerified: true,
      });

      response.json({
        accountId: verifiedAccount.accountId,
        accountEmail: verifiedAccount.accountEmail,
        emailVerified: true,
      });
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Email verification failed',
      });
    }
  });

  app.post('/api/account/password-reset/request', guardRateLimit('passwordReset'), async (request, response) => {
    try {
      const email = normalizeEmail(request.body?.email);
      if (!email.includes('@')) {
        response.status(400).json({ error: 'Invalid reset payload' });
        return;
      }

      const account = db.readAccountByEmail(email);
      if (!account) {
        response.json({ ok: true });
        return;
      }

      const resetToken = randomUUID();
      db.createPasswordResetToken({
        token: resetToken,
        accountId: account.accountId,
        expiresAt: Date.now() + 60 * 60 * 1000,
      });
      await onPasswordResetRequested({
        token: resetToken,
        accountId: account.accountId,
        email,
      });

      response.json({ ok: true });
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Password reset request failed',
      });
    }
  });

  app.post('/api/account/password-reset/confirm', guardRateLimit('passwordReset'), async (request, response) => {
    try {
      const token = String(request.body?.token ?? '');
      const password = String(request.body?.password ?? '');
      if (password.length < 6) {
        response.status(400).json({ error: 'Password too short' });
        return;
      }

      const resetToken = db.readPasswordResetToken(token);
      if (!resetToken || resetToken.used_at || resetToken.expires_at < Date.now()) {
        response.status(404).json({ error: 'Reset token invalid or expired' });
        return;
      }

      const account = db.readAccount(resetToken.account_id);
      if (!account) {
        response.status(404).json({ error: 'Account not found' });
        return;
      }

      const passwordSalt = createPasswordSalt();
      const passwordHash = hashPassword(password, passwordSalt);
      db.usePasswordResetToken(token);
      db.writeAccount({
        ...account,
        accountId: account.accountId,
        passwordSalt,
        passwordHash,
        accountToken: createAccountToken(),
      });

      response.json({ ok: true });
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Password reset confirm failed',
      });
    }
  });

  app.post('/api/billing/sync-revenuecat', async (request, response) => {
    const account = requireAccountBodyAuth(request, response);
    if (!account) {
      return;
    }

    if (!isRevenueCatConfigured()) {
      response.status(503).json({
        error: 'RevenueCat billing integration is not configured',
      });
      return;
    }

    try {
      const appUserID = String(request.body?.appUserID ?? '');
      if (!appUserID || appUserID !== account.accountId) {
        response.status(400).json({
          error: 'Invalid app user identifier',
        });
        return;
      }

      const subscriberPayload = await fetchRevenueCatSubscriber(appUserID);
      const entitlementSnapshot = getEntitlementSnapshotFromRevenueCat(subscriberPayload);
      const subscriptionStatus = entitlementSnapshot.isActive ? 'premium' : 'free';
      const updatedAccount = db.writeAccount({
        ...account,
        accountId: account.accountId,
        subscriptionStatus,
        subscriptionProvider: 'revenuecat',
        subscriptionUpdatedAt: Date.now(),
      });

      response.json({
        accountId: updatedAccount.accountId,
        subscriptionStatus: normalizeSubscriptionStatus(updatedAccount.subscriptionStatus),
        subscriptionProvider: updatedAccount.subscriptionProvider,
        subscriptionUpdatedAt: updatedAccount.subscriptionUpdatedAt,
        entitlementId: revenueCatEntitlementId,
        entitlementActive: entitlementSnapshot.isActive,
        entitlementExpiresAt: entitlementSnapshot.expiresAt,
        productIdentifier: entitlementSnapshot.productIdentifier,
      });
    } catch (error) {
      response.status(502).json({
        error: error instanceof Error ? error.message : 'RevenueCat sync failed',
      });
    }
  });

  app.post('/api/billing/activate-preview', async (request, response) => {
    if (!enableBillingPreview) {
      response.status(410).json({
        error: 'Billing preview endpoint is disabled for release builds',
      });
      return;
    }

    try {
      const accountId = request.body?.accountId;
      const providedToken = request.header('X-Ascend-Account-Token');
      const account = db.readAccount(accountId);
      if (!account || account.accountToken !== providedToken) {
        response.status(403).json({ error: 'Invalid account token' });
        return;
      }

      const upgraded = db.writeAccount({
        ...account,
        accountId,
        subscriptionStatus: 'premium',
        subscriptionProvider: 'manual-preview',
        subscriptionUpdatedAt: Date.now(),
      });

      response.json({
        accountId: upgraded.accountId,
        subscriptionStatus: upgraded.subscriptionStatus,
        subscriptionProvider: upgraded.subscriptionProvider,
        subscriptionUpdatedAt: upgraded.subscriptionUpdatedAt,
      });
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Billing activation failed',
      });
    }
  });

  app.get('/api/session/:accountId', async (request, response) => {
    try {
      const account = requireAccountAuth(request, response);
      if (!account) {
        return;
      }

      const session = db.readSession(request.params.accountId);
      if (!session) {
        response.status(404).json({ error: 'Session not found' });
        return;
      }

      response.json(serializeAccountSession(account, session));
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Session read failed',
      });
    }
  });

  app.put('/api/session/:accountId', async (request, response) => {
    try {
      const account = requireAccountAuth(request, response);
      if (!account) {
        return;
      }

      const { profile, tasks, weeklyPlanSnapshot, plannedMissions, revision } = request.body ?? {};
      if (!profile || !Array.isArray(tasks)) {
        response.status(400).json({ error: 'Invalid session payload' });
        return;
      }

      const currentSession = db.readSession(request.params.accountId);
      if (!currentSession) {
        response.status(404).json({ error: 'Session not found' });
        return;
      }

      if (typeof revision !== 'number' || revision !== currentSession.revision) {
        response.status(409).json({
          error: 'Session conflict',
          currentSession: serializeAccountSession(account, currentSession),
        });
        return;
      }

      const session = db.writeSession({
        accountId: request.params.accountId,
        profile: applyEntitlementToProfile(profile, account.subscriptionStatus),
        tasks,
        weeklyPlanSnapshot,
        plannedMissions,
        revision: revision + 1,
      });

      response.json(serializeAccountSession(account, session));
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Session write failed',
      });
    }
  });

  app.delete('/api/session/:accountId', async (request, response) => {
    try {
      const account = requireAccountAuth(request, response);
      if (!account) {
        return;
      }

      db.deleteAccount(request.params.accountId);
      response.status(204).end();
    } catch (error) {
      response.status(500).json({
        error: error instanceof Error ? error.message : 'Session delete failed',
      });
    }
  });

  app.post('/api/coach', async (request, response) => {
    try {
      const reply = await askOllama({
        mode: 'coach',
        profile: request.body.profile,
        history: request.body.history,
        message: request.body.message,
        activeTask: request.body.activeTask,
        tasks: request.body.tasks,
      });

      response.json({ reply });
    } catch (error) {
      response.status(502).json({
        error: error instanceof Error ? error.message : 'Coach request failed',
      });
    }
  });

  app.post('/api/decision', async (request, response) => {
    try {
      const reply = await askOllama({
        mode: 'decision',
        options: request.body.options,
      });

      response.json({ reply });
    } catch (error) {
      response.status(502).json({
        error: error instanceof Error ? error.message : 'Decision request failed',
      });
    }
  });

  return app;
};
