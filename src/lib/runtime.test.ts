import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveAIRuntimeConfig } from './runtime';

test('runtime enters preview fallback mode when trusted AI proxy is missing', () => {
  const runtime = resolveAIRuntimeConfig(undefined);

  assert.equal(runtime.mode, 'preview-fallback');
  assert.equal(runtime.hasTrustedAIBackend, false);
  assert.equal(runtime.usesPreviewFallback, true);
  assert.equal(runtime.generatedTaskSource, 'preview');
});

test('runtime treats a configured proxy as trusted build-time AI backend', () => {
  const runtime = resolveAIRuntimeConfig('https://api.ascend.example/ai');

  assert.equal(runtime.mode, 'trusted-proxy');
  assert.equal(runtime.hasTrustedAIBackend, true);
  assert.equal(runtime.usesPreviewFallback, false);
  assert.equal(runtime.generatedTaskSource, 'generated');
});
