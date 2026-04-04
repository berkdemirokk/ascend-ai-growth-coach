import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const firebaseCli = resolve(projectRoot, 'node_modules', 'firebase-tools', 'lib', 'bin', 'firebase.js');
const tsxCli = resolve(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

function quote(value) {
  return `"${value.replaceAll('"', '\\"')}"`;
}

if (!existsSync(firebaseCli) || !existsSync(tsxCli)) {
  console.error('Missing local dev dependencies for Firestore emulator tests. Run npm install before retrying.');
  process.exit(1);
}

const javaCheck = spawnSync('java', ['-version'], {
  stdio: 'ignore',
});

if (javaCheck.error || javaCheck.status !== 0) {
  console.error('Firestore emulator tests require Java on PATH. Install Java, then rerun npm run test:rules:emulator.');
  process.exit(1);
}

const testCommand = `${quote(process.execPath)} ${quote(tsxCli)} --test tests/firestore.rules.emulator.test.ts`;

const result = spawnSync(
  process.execPath,
  [
    firebaseCli,
    'emulators:exec',
    '--only',
    'firestore',
    '--project',
    'demo-ascend-growth',
    '--config',
    'firebase.json',
    testCommand,
  ],
  {
    cwd: projectRoot,
    stdio: 'inherit',
  },
);

if (result.error) {
  console.error('Firestore emulator tests failed to start. Ensure Java is installed and available on PATH.');
  throw result.error;
}

process.exit(result.status ?? 1);
