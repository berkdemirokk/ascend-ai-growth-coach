import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

import tr from './locales/tr.json';
import en from './locales/en.json';
import ar from './locales/ar.json';

const STORAGE_KEY = 'ascend.language';
const SUPPORTED = ['tr', 'en', 'ar'];
const DEFAULT_LANG = 'tr';

const resources = {
  tr: { translation: tr },
  en: { translation: en },
  ar: { translation: ar },
};

const detectInitialLanguage = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
  } catch {}

  try {
    const locales = Localization.getLocales();
    const code = locales?.[0]?.languageCode;
    if (code && SUPPORTED.includes(code)) return code;
  } catch {}

  return DEFAULT_LANG;
};

export const initI18n = async () => {
  const lng = await detectInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: DEFAULT_LANG,
    compatibilityJSON: 'v3',
    interpolation: { escapeValue: false },
    returnNull: false,
  });

  applyRTL(lng);
  return i18n;
};

const applyRTL = (lng) => {
  const isRTL = lng === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    try {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    } catch {}
  }
};

export const setLanguage = async (lng) => {
  if (!SUPPORTED.includes(lng)) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lng);
  } catch {}
  await i18n.changeLanguage(lng);
  applyRTL(lng);
};

export const getCurrentLanguage = () => i18n.language || DEFAULT_LANG;

export const SUPPORTED_LANGUAGES = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
];

export default i18n;
