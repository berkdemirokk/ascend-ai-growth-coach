const readEnv = (key: keyof ImportMetaEnv): string | undefined => {
  const value = import.meta.env[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};

export const HUGGINGFACE_API_KEY = readEnv('VITE_HUGGINGFACE_API_KEY');
