const readEnv = (key: keyof ImportMetaEnv): string | undefined => {
  const value = (import.meta as ImportMeta & { env?: Partial<ImportMetaEnv> }).env?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

export const AI_PROXY_URL = readEnv('VITE_AI_PROXY_URL');
