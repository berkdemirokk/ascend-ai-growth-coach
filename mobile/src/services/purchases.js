import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { REVENUECAT_CONFIG } from '../config/constants';

let isInitialized = false;

export const initPurchases = async () => {
  if (isInitialized) return;
  try {
    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: REVENUECAT_CONFIG.API_KEY_IOS });
    }
    isInitialized = true;
  } catch (e) {
    console.warn('RevenueCat init error:', e?.message);
  }
};

export const checkPremiumStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID] != null;
  } catch (e) {
    console.warn('Check premium error:', e?.message);
    return false;
  }
};

export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
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
    const pkg = offerings.availablePackages[0];
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID] != null;
  } catch (e) {
    if (e.userCancelled) return false;
    throw e;
  }
};

export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.ENTITLEMENT_ID] != null;
  } catch (e) {
    console.warn('Restore error:', e?.message);
    return false;
  }
};
