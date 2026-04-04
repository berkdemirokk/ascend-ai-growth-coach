import { AI_PROXY_URL } from '../env';
import { TaskSource } from '../types';

export type AIRuntimeMode = 'trusted-proxy' | 'preview-fallback';

export interface AIRuntimeConfig {
  mode: AIRuntimeMode;
  hasTrustedAIBackend: boolean;
  usesPreviewFallback: boolean;
  generatedTaskSource: TaskSource;
}

export function resolveAIRuntimeConfig(aiProxyUrl?: string): AIRuntimeConfig {
  const hasTrustedAIBackend = typeof aiProxyUrl === 'string' && aiProxyUrl.trim().length > 0;

  return {
    mode: hasTrustedAIBackend ? 'trusted-proxy' : 'preview-fallback',
    hasTrustedAIBackend,
    usesPreviewFallback: !hasTrustedAIBackend,
    generatedTaskSource: hasTrustedAIBackend ? 'generated' : 'preview',
  };
}

export const AI_RUNTIME = resolveAIRuntimeConfig(AI_PROXY_URL);
