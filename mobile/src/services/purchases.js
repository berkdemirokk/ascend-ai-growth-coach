import { Platform } from 'react-native';
import { REVENUECAT_CONFIG } from '../config/constants';

let Purchases = null;
let isInitialized = false;

const loadPurchasesModule = async () => {
  if (Purchases) return Purchases;
  try {
    const mod = await import('react-native-purchases');
    Purchases = mod.default ?? mod;
    return Purchases;
  } catch {
    return null;
  }
};

export const initPurchases = async () => {
  if (isInitialized) return;
  try {
    const P = await loadPurchasesModule();
    if (!P) return;
    if (Platform.OS === 'ios') {
      await P.configure({ apiKey: REVENUECAT_CONFIG.API_KEY_IOS });
    }
    isInitialized = true;
  } catch (e) {
    console.warn('RevenueCat init error:', e?.message);
  }
};

export const checkPremiumStatus = async () => {
  try {
    const P = await loadPurchasesModule();
    if (!P) return false;
    const customerInfo = await P.getCustomerInfo();
    return customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID] != null;
  } catch (e) {
    console.warn('Check premium error:', e?.message);
    return false;
  }
};

export const getOfferings = async () => {
  try {
    const P = await loadPurchasesModule();
    if (!P) return null;
    const offerings = await P.getOfferings();
    if (offerings?.current) {
      return offerings.current;
    }
    return null;
  } catch (e) {
    console.warn('Get offerings error:', e?.message);
    return null;
  }
};

export const purchasePremium = async () => {
  try {
    const offerings = await getOfferings();
    if (!offerings?.availablePackages?.length) {
      throw new Error('No packages available');
    }
    const P = await loadPurchasesModule();
    if (!P) throw new Error('Purchases module unavailable');
    const pkg = offerings.availablePackages[0];
    const { customerInfo } = await P.purchasePackage(pkg);
    return customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID] != null;
  } catch (e) {
    if (e.userCancelled) return false;
    throw e;
  }
};

export const restorePurchases = async () => {
  try {
    const P = await loadPurchasesModule();
    if (!P) return false;
    const customerInfo = await P.restorePurchases();
    return customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID] != null;
  } catch (e) {
    console.warn('Restore error:', e?.message);
    return false;
  }
};
