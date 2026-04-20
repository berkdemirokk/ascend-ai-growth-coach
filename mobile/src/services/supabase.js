import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Read config from app.json `expo.extra.supabase` or fall back to env-like
// constants. Supply real values before building.
const extra = Constants.expoConfig?.extra?.supabase || {};
const SUPABASE_URL = extra.url || 'https://REPLACE_ME.supabase.co';
const SUPABASE_ANON_KEY = extra.anonKey || 'REPLACE_ME';

export const SUPABASE_CONFIGURED =
  !SUPABASE_URL.includes('REPLACE_ME') && !SUPABASE_ANON_KEY.includes('REPLACE_ME');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
