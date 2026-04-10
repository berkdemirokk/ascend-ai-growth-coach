import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const now = () => Date.now();

export const createDatabase = (dbPath) => {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS accounts (
      account_id TEXT PRIMARY KEY,
      account_token TEXT NOT NULL,
      account_email TEXT UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      password_salt TEXT,
      password_hash TEXT,
      subscription_status TEXT NOT NULL DEFAULT 'free',
      subscription_provider TEXT,
      subscription_updated_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      account_id TEXT PRIMARY KEY,
      profile_json TEXT NOT NULL,
      tasks_json TEXT NOT NULL,
      weekly_plan_snapshot_json TEXT,
      planned_missions_json TEXT,
      revision INTEGER NOT NULL DEFAULT 1,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      token TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      email TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      used_at INTEGER,
      FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      used_at INTEGER,
      FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
    );
  `);

  const parseJson = (value, fallback) => {
    if (!value) {
      return fallback;
    }

    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const mapAccount = (row) =>
    row
      ? {
          accountId: row.account_id,
          accountToken: row.account_token,
          accountEmail: row.account_email,
          emailVerified: Boolean(row.email_verified),
          passwordSalt: row.password_salt,
          passwordHash: row.password_hash,
          subscriptionStatus: row.subscription_status,
          subscriptionProvider: row.subscription_provider,
          subscriptionUpdatedAt: row.subscription_updated_at,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }
      : null;

  const mapSession = (row) =>
    row
      ? {
          accountId: row.account_id,
          profile: parseJson(row.profile_json, null),
          tasks: parseJson(row.tasks_json, []),
          weeklyPlanSnapshot: parseJson(row.weekly_plan_snapshot_json, null),
          plannedMissions: parseJson(row.planned_missions_json, []),
          revision: row.revision,
          updatedAt: row.updated_at,
        }
      : null;

  const getAccount = db.prepare(`SELECT * FROM accounts WHERE account_id = ?`);
  const getAccountByEmail = db.prepare(`SELECT * FROM accounts WHERE account_email = ?`);
  const upsertAccount = db.prepare(`
    INSERT INTO accounts (
      account_id, account_token, account_email, email_verified, password_salt, password_hash,
      subscription_status, subscription_provider, subscription_updated_at, created_at, updated_at
    ) VALUES (
      @account_id, @account_token, @account_email, @email_verified, @password_salt, @password_hash,
      @subscription_status, @subscription_provider, @subscription_updated_at, @created_at, @updated_at
    )
    ON CONFLICT(account_id) DO UPDATE SET
      account_token = excluded.account_token,
      account_email = excluded.account_email,
      email_verified = excluded.email_verified,
      password_salt = excluded.password_salt,
      password_hash = excluded.password_hash,
      subscription_status = excluded.subscription_status,
      subscription_provider = excluded.subscription_provider,
      subscription_updated_at = excluded.subscription_updated_at,
      updated_at = excluded.updated_at
  `);

  const getSession = db.prepare(`SELECT * FROM sessions WHERE account_id = ?`);
  const upsertSession = db.prepare(`
    INSERT INTO sessions (
      account_id, profile_json, tasks_json, weekly_plan_snapshot_json, planned_missions_json, revision, updated_at
    ) VALUES (
      @account_id, @profile_json, @tasks_json, @weekly_plan_snapshot_json, @planned_missions_json, @revision, @updated_at
    )
    ON CONFLICT(account_id) DO UPDATE SET
      profile_json = excluded.profile_json,
      tasks_json = excluded.tasks_json,
      weekly_plan_snapshot_json = excluded.weekly_plan_snapshot_json,
      planned_missions_json = excluded.planned_missions_json,
      revision = excluded.revision,
      updated_at = excluded.updated_at
  `);

  const deleteAccount = db.prepare(`DELETE FROM accounts WHERE account_id = ?`);
  const deleteSession = db.prepare(`DELETE FROM sessions WHERE account_id = ?`);

  const saveVerificationToken = db.prepare(`
    INSERT INTO email_verification_tokens (token, account_id, email, expires_at, created_at, used_at)
    VALUES (?, ?, ?, ?, ?, NULL)
  `);
  const getVerificationToken = db.prepare(`SELECT * FROM email_verification_tokens WHERE token = ?`);
  const useVerificationToken = db.prepare(`UPDATE email_verification_tokens SET used_at = ? WHERE token = ?`);
  const invalidateVerificationTokens = db.prepare(`DELETE FROM email_verification_tokens WHERE account_id = ?`);

  const savePasswordResetToken = db.prepare(`
    INSERT INTO password_reset_tokens (token, account_id, expires_at, created_at, used_at)
    VALUES (?, ?, ?, ?, NULL)
  `);
  const getPasswordResetToken = db.prepare(`SELECT * FROM password_reset_tokens WHERE token = ?`);
  const usePasswordResetToken = db.prepare(`UPDATE password_reset_tokens SET used_at = ? WHERE token = ?`);
  const invalidatePasswordResetTokens = db.prepare(`DELETE FROM password_reset_tokens WHERE account_id = ?`);

  return {
    readAccount: (accountId) => mapAccount(getAccount.get(accountId)),
    readAccountByEmail: (email) => mapAccount(getAccountByEmail.get(email)),
    writeAccount: (payload) => {
      const createdAt = payload.createdAt ?? now();
      const updatedAt = payload.updatedAt ?? now();
      upsertAccount.run({
        account_id: payload.accountId,
        account_token: payload.accountToken,
        account_email: payload.accountEmail ?? null,
        email_verified: payload.emailVerified ? 1 : 0,
        password_salt: payload.passwordSalt ?? null,
        password_hash: payload.passwordHash ?? null,
        subscription_status: payload.subscriptionStatus ?? 'free',
        subscription_provider: payload.subscriptionProvider ?? null,
        subscription_updated_at: payload.subscriptionUpdatedAt ?? null,
        created_at: createdAt,
        updated_at: updatedAt,
      });
      return mapAccount(getAccount.get(payload.accountId));
    },
    readSession: (accountId) => mapSession(getSession.get(accountId)),
    writeSession: (payload) => {
      upsertSession.run({
        account_id: payload.accountId,
        profile_json: JSON.stringify(payload.profile ?? null),
        tasks_json: JSON.stringify(payload.tasks ?? []),
        weekly_plan_snapshot_json: payload.weeklyPlanSnapshot ? JSON.stringify(payload.weeklyPlanSnapshot) : null,
        planned_missions_json: JSON.stringify(payload.plannedMissions ?? []),
        revision: typeof payload.revision === 'number' ? payload.revision : 1,
        updated_at: payload.updatedAt ?? now(),
      });
      return mapSession(getSession.get(payload.accountId));
    },
    deleteAccount: (accountId) => {
      deleteSession.run(accountId);
      deleteAccount.run(accountId);
    },
    createVerificationToken: ({ token, accountId, email, expiresAt }) => {
      invalidateVerificationTokens.run(accountId);
      saveVerificationToken.run(token, accountId, email, expiresAt, now());
      return token;
    },
    readVerificationToken: (token) => getVerificationToken.get(token) ?? null,
    useVerificationToken: (token) => useVerificationToken.run(now(), token),
    createPasswordResetToken: ({ token, accountId, expiresAt }) => {
      invalidatePasswordResetTokens.run(accountId);
      savePasswordResetToken.run(token, accountId, expiresAt, now());
      return token;
    },
    readPasswordResetToken: (token) => getPasswordResetToken.get(token) ?? null,
    usePasswordResetToken: (token) => usePasswordResetToken.run(now(), token),
    close: () => db.close(),
  };
};
