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

export const purchasePremium = async (period = 'monthly') => {
  try {
    const offerings = await getOfferings();
    if (!offerings?.availablePackages?.length) {
      throw new Error('No packages available');
    }
    const P = await loadPurchasesModule();
    if (!P) throw new Error('Purchases module unavailable');

    // Pick package by RevenueCat package type or fallback to product id match
    const pkgs = offerings.availablePackages;
    let pkg = null;
    if (period === 'yearly') {
      pkg = pkgs.find((p) => p.packageType === 'ANNUAL')
        || pkgs.find((p) => p.product?.identifier === REVENUECAT_CONFIG.PRODUCT_ID_YEARLY);
    } else {
      pkg = pkgs.find((p) => p.packageType === 'MONTHLY')
        || pkgs.find((p) => p.product?.identifier === REVENUECAT_CONFIG.PRODUCT_ID_MONTHLY);
    }
    if (!pkg) pkg = pkgs[0];

    const { customerInfo } = await P.purchasePackage(pkg);
    return customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID] != null;
  } catch (e) {
    if (e.userCancelled) return false;
    throw e;
  }
};

export const getAvailablePackages = async () => {
  try {
    const offerings = await getOfferings();
    if (!offerings?.availablePackages?.length) return null;
    const pkgs = offerings.availablePackages;
    return {
      monthly: pkgs.find((p) => p.packageType === 'MONTHLY')
        || pkgs.find((p) => p.product?.identifier === REVENUECAT_CONFIG.PRODUCT_ID_MONTHLY)
        || null,
      yearly: pkgs.find((p) => p.packageType === 'ANNUAL')
        || pkgs.find((p) => p.product?.identifier === REVENUECAT_CONFIG.PRODUCT_ID_YEARLY)
        || null,
    };
  } catch (e) {
    console.warn('getAvailablePackages error:', e?.message);
    return null;
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
