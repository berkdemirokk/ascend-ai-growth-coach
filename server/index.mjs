import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServerApp } from './app.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const port = Number(process.env.AI_PROXY_PORT || 8787);
const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const ollamaModel = process.env.OLLAMA_MODEL || 'qwen2.5:3b';
const enableBillingPreview = process.env.ENABLE_BILLING_PREVIEW === 'true';
const revenueCatApiKey = process.env.REVENUECAT_SECRET_API_KEY || '';
const revenueCatEntitlementId = process.env.REVENUECAT_ENTITLEMENT_ID || 'premium';
const dbPath = process.env.ASCEND_DB_PATH || path.join(__dirname, 'data', 'ascend.sqlite');
const sessionDir = path.join(__dirname, 'data', 'sessions');
const accountDir = path.join(__dirname, 'data', 'accounts');

const app = createServerApp({
  dbPath,
  sessionDir,
  accountDir,
  ollamaBaseUrl,
  ollamaModel,
  enableBillingPreview,
  revenueCatApiKey,
  revenueCatEntitlementId,
});

app.listen(port, () => {
  console.log(`Ascend AI proxy listening on http://localhost:${port}`);
  console.log(`Using Ollama model ${ollamaModel} via ${ollamaBaseUrl}`);
  console.log(`Using SQLite storage at ${dbPath}`);
});
