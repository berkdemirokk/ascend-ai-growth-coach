import { Capacitor } from '@capacitor/core';
import {
  CustomerInfo,
  PACKAGE_TYPE,
  PURCHASES_ERROR_CODE,
  Purchases,
  PurchasesError,
  PurchasesOffering,
  PurchasesPackage,
} from '@revenuecat/purchases-capacitor';

export type BillingPurchaseStatus = 'purchased' | 'cancelled' | 'pending' | 'offline' | 'failed';

export interface BillingAvailability {
  available: boolean;
  reason: string | null;
}

export interface BillingPackageSnapshot {
  identifier: string;
  packageType: string;
  productIdentifier: string;
  title: string;
  price: string;
  offeringIdentifier: string;
}

export interface BillingPurchaseResult {
  status: BillingPurchaseStatus;
  message: string;
  customerInfo: CustomerInfo | null;
}

const getRevenueCatApiKey = () => String(import.meta.env.VITE_REVENUECAT_IOS_API_KEY ?? '').trim();
const getRevenueCatEntitlementId = () =>
  String(import.meta.env.VITE_REVENUECAT_ENTITLEMENT_ID ?? 'premium').trim() || 'premium';
const getPreferredOfferingId = () => String(import.meta.env.VITE_REVENUECAT_OFFERING_ID ?? '').trim();

const isNativeIOS = () => Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

let configuredAppUserID: string | null = null;

const choosePrimaryPackage = (offering: PurchasesOffering): PurchasesPackage | null => {
  if (!offering.availablePackages.length) {
    return null;
  }

  return (
    offering.availablePackages.find((entry) => entry.packageType === PACKAGE_TYPE.MONTHLY) ??
    offering.availablePackages.find((entry) => entry.packageType === PACKAGE_TYPE.ANNUAL) ??
    offering.availablePackages[0]
  );
};

const chooseOffering = async (): Promise<PurchasesOffering | null> => {
  const offerings = await Purchases.getOfferings();
  const preferredOfferingId = getPreferredOfferingId();
  if (preferredOfferingId) {
    return offerings.all[preferredOfferingId] ?? null;
  }

  return offerings.current ?? null;
};

const mapPurchaseError = (error: unknown): BillingPurchaseResult => {
  const purchasesError = error as Partial<PurchasesError> | null;
  const code = purchasesError?.code ?? null;

  if (code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR || purchasesError?.userCancelled) {
    return {
      status: 'cancelled',
      message: 'Satın alma iptal edildi. Plan değişmedi.',
      customerInfo: null,
    };
  }

  if (code === PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR) {
    return {
      status: 'pending',
      message: 'Ödeme onay bekliyor. Onaylandığında premium otomatik açılacak.',
      customerInfo: null,
    };
  }

  if (code === PURCHASES_ERROR_CODE.NETWORK_ERROR || code === PURCHASES_ERROR_CODE.OFFLINE_CONNECTION_ERROR) {
    return {
      status: 'offline',
      message: 'Bağlantı kurulamadı. İnterneti kontrol edip tekrar dene.',
      customerInfo: null,
    };
  }

  return {
    status: 'failed',
    message: 'Satın alma tamamlanamadı. Kısa süre sonra tekrar deneyebilirsin.',
    customerInfo: null,
  };
};

export const getBillingEntitlementId = () => getRevenueCatEntitlementId();

export const getBillingAvailability = (): BillingAvailability => {
  if (!isNativeIOS()) {
    return {
      available: false,
      reason: 'Satın alma sadece iOS uygulaması içinde kullanılabilir.',
    };
  }

  if (!getRevenueCatApiKey()) {
    return {
      available: false,
      reason: 'Satın alma yapılandırması eksik. RevenueCat iOS API anahtarı tanımlanmalı.',
    };
  }

  return {
    available: true,
    reason: null,
  };
};

export const ensureBillingConfigured = async (appUserID: string) => {
  const availability = getBillingAvailability();
  if (!availability.available) {
    throw new Error(availability.reason ?? 'Billing unavailable');
  }

  if (configuredAppUserID === appUserID) {
    return;
  }

  const { isConfigured } = await Purchases.isConfigured();
  if (!isConfigured) {
    await Purchases.configure({
      apiKey: getRevenueCatApiKey(),
      appUserID,
    });
    configuredAppUserID = appUserID;
    return;
  }

  const { appUserID: currentAppUserID } = await Purchases.getAppUserID();
  if (currentAppUserID !== appUserID) {
    await Purchases.logIn({ appUserID });
  }

  configuredAppUserID = appUserID;
};

export const getBillingPackageSnapshot = async (appUserID: string): Promise<BillingPackageSnapshot | null> => {
  await ensureBillingConfigured(appUserID);
  const offering = await chooseOffering();
  if (!offering) {
    return null;
  }

  const billingPackage = choosePrimaryPackage(offering);
  if (!billingPackage) {
    return null;
  }

  return {
    identifier: billingPackage.identifier,
    packageType: billingPackage.packageType,
    productIdentifier: billingPackage.product.identifier,
    title: billingPackage.product.title,
    price: billingPackage.product.priceString,
    offeringIdentifier: offering.identifier,
  };
};

export const purchasePremiumPackage = async (appUserID: string): Promise<BillingPurchaseResult> => {
  try {
    await ensureBillingConfigured(appUserID);
    const offering = await chooseOffering();
    if (!offering) {
      return {
        status: 'failed',
        message: 'Satın alma paketi bulunamadı. App Store ürün ayarlarını kontrol et.',
        customerInfo: null,
      };
    }

    const billingPackage = choosePrimaryPackage(offering);
    if (!billingPackage) {
      return {
        status: 'failed',
        message: 'Satın alma paketi bulunamadı. App Store ürün ayarlarını kontrol et.',
        customerInfo: null,
      };
    }

    const result = await Purchases.purchasePackage({
      aPackage: billingPackage,
    });

    return {
      status: 'purchased',
      message: 'Satın alma tamamlandı.',
      customerInfo: result.customerInfo,
    };
  } catch (error) {
    return mapPurchaseError(error);
  }
};

export const restorePremiumPurchases = async (appUserID: string): Promise<BillingPurchaseResult> => {
  try {
    await ensureBillingConfigured(appUserID);
    const result = await Purchases.restorePurchases();

    return {
      status: 'purchased',
      message: 'Satın alımlar geri yüklendi.',
      customerInfo: result.customerInfo,
    };
  } catch (error) {
    return mapPurchaseError(error);
  }
};

export const isPremiumFromCustomerInfo = (customerInfo: CustomerInfo | null | undefined) => {
  if (!customerInfo) {
    return false;
  }

  const entitlementId = getRevenueCatEntitlementId();
  return Boolean(customerInfo.entitlements.active[entitlementId]?.isActive);
};
