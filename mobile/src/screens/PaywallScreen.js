import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { purchasePremium, restorePurchases, getAvailablePackages } from '../services/purchases';

export default function PaywallScreen({ navigation }) {
  const { t } = useTranslation();
  const { setPremium } = useApp();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selected, setSelected] = useState('yearly');
  const [packages, setPackages] = useState({ monthly: null, yearly: null });
  const [loadingPackages, setLoadingPackages] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const pkgs = await getAvailablePackages();
        if (pkgs) setPackages(pkgs);
      } finally {
        setLoadingPackages(false);
      }
    })();
  }, []);

  const monthlyPrice = packages.monthly?.product?.priceString || '149 ₺';
  const yearlyPrice = packages.yearly?.product?.priceString || '749 ₺';
  const yearlyMonthlyEquiv = packages.yearly?.product?.price
    ? `${(packages.yearly.product.price / 12).toFixed(0)} ${packages.yearly.product.currencyCode || ''}`
    : '~62 ₺';

  const handleSubscribe = async () => {
    // Block early if no packages loaded — shows real reason
    if (!packages.monthly && !packages.yearly) {
      Alert.alert(
        t('paywall.notReadyTitle', 'Abonelikler hazır değil'),
        t(
          'paywall.notReadyBody',
          'App Store bağlantısı kurulamadı. İnternetini kontrol et veya birkaç dakika sonra tekrar dene.',
        ),
      );
      return;
    }
    setIsSubscribing(true);
    try {
      const success = await purchasePremium(selected);
      if (success) {
        setPremium(true);
        navigation.goBack();
      }
      // success === false means user cancelled — silent, no alert
    } catch (e) {
      const msg = e?.message || '';
      let body = t('common.tryAgain');
      if (/no packages|offerings|not configured/i.test(msg)) {
        body = t(
          'paywall.notConfigured',
          'Abonelik henüz mağazada görünür değil. Lütfen birkaç dakika sonra tekrar dene.',
        );
      } else if (/network|connection|timeout/i.test(msg)) {
        body = t('paywall.networkError', 'Bağlantı hatası. İnterneti kontrol et.');
      } else if (msg) {
        body = msg;
      }
      Alert.alert(t('common.error'), body);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        setPremium(true);
        navigation.goBack();
      } else {
        Alert.alert(t('common.error'), t('common.tryAgain'));
      }
    } catch (e) {
      Alert.alert(t('common.error'), e?.message || t('common.tryAgain'));
    } finally {
      setIsRestoring(false);
    }
  };

  const features = [
    { icon: '🔓', text: t('paywall.feature1') },
    { icon: '❄️', text: t('paywall.feature2') },
    { icon: '📊', text: t('paywall.feature3') },
    { icon: '📈', text: t('paywall.feature4') },
    { icon: '☁️', text: t('paywall.feature5') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.crownEmoji}>🔥</Text>
          <Text style={styles.title}>{t('paywall.title')}</Text>
          <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>

          {/* Trust signals */}
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>🔒</Text>
              <Text style={styles.trustText}>
                {t('paywall.trustPrivate', 'Gizli')}
              </Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>↩️</Text>
              <Text style={styles.trustText}>
                {t('paywall.trustCancel', 'Her an iptal')}
              </Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustEmoji}>📜</Text>
              <Text style={styles.trustText}>
                {t('paywall.trustNoTrack', 'İzleme yok')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {loadingPackages ? (
          <View style={styles.loadingPackages}>
            <ActivityIndicator color="#6366F1" />
            <Text style={styles.loadingText}>
              {t('paywall.loadingPrices', 'Fiyatlar yükleniyor...')}
            </Text>
          </View>
        ) : !packages.monthly && !packages.yearly ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>
              {t('paywall.notReadyTitle', 'Abonelikler yüklenemedi')}
            </Text>
            <Text style={styles.errorBody}>
              {t(
                'paywall.notReadyBodyShort',
                'Mağaza bağlantısı kurulamadı. İnternetini kontrol et ve birkaç dakika sonra tekrar dene.',
              )}
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={async () => {
                setLoadingPackages(true);
                try {
                  const pkgs = await getAvailablePackages();
                  if (pkgs) setPackages(pkgs);
                } finally {
                  setLoadingPackages(false);
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.retryText}>
                {t('common.tryAgain', 'Tekrar dene')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.priceOption, selected === 'yearly' && styles.priceOptionSelected]}
              onPress={() => setSelected('yearly')}
              activeOpacity={0.85}
            >
              <View style={styles.priceLeft}>
                <View style={styles.priceLabelRow}>
                  <Text style={styles.priceLabel}>{t('paywall.yearly')}</Text>
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>BEST</Text>
                  </View>
                </View>
                <Text style={styles.priceSubLabel}>
                  {yearlyMonthlyEquiv} / {t('paywall.monthly').toLowerCase()}
                </Text>
              </View>
              <Text style={styles.priceAmount}>{yearlyPrice}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.priceOption, selected === 'monthly' && styles.priceOptionSelected]}
              onPress={() => setSelected('monthly')}
              activeOpacity={0.85}
            >
              <View style={styles.priceLeft}>
                <Text style={styles.priceLabel}>{t('paywall.monthly')}</Text>
                <Text style={styles.priceSubLabel}>{t('common.cancel')}</Text>
              </View>
              <Text style={styles.priceAmount}>{monthlyPrice}</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.subscribeButton, isSubscribing && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={isSubscribing || isRestoring}
          activeOpacity={0.85}
        >
          {isSubscribing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.subscribeButtonText}>{t('paywall.ctaTrial')}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.autoRenewText}>{t('paywall.autoRenew')}</Text>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isSubscribing || isRestoring}
          activeOpacity={0.7}
        >
          {isRestoring ? (
            <ActivityIndicator color="#9898B0" size="small" />
          ) : (
            <Text style={styles.restoreButtonText}>{t('settings.restorePurchases')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1, backgroundColor: '#0B0B14' },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 48 },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#161626',
    borderWidth: 1,
    borderColor: '#2A2A42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { color: '#9898B0', fontSize: 14, fontWeight: '600' },
  header: { alignItems: 'center', marginTop: 16, marginBottom: 28 },
  crownEmoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: '#F5F5FA', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#F59E0B', marginTop: 8, fontWeight: '700' },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingHorizontal: 8,
    width: '100%',
  },
  trustItem: { alignItems: 'center', flex: 1 },
  trustEmoji: { fontSize: 18, marginBottom: 4 },
  trustText: { color: '#9898B0', fontSize: 11, fontWeight: '600', textAlign: 'center' },
  loadingPackages: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: '#9898B0', fontSize: 13 },
  errorBox: {
    backgroundColor: '#161626',
    borderWidth: 1,
    borderColor: '#EF444466',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginVertical: 16,
  },
  errorIcon: { fontSize: 32, marginBottom: 8 },
  errorTitle: {
    color: '#F5F5FA',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorBody: {
    color: '#9898B0',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 14,
  },
  retryBtn: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  featuresContainer: { gap: 10, marginBottom: 24 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161626',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A42',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  featureIcon: { fontSize: 20 },
  featureText: { flex: 1, fontSize: 14, color: '#F5F5FA', fontWeight: '500' },
  priceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161626',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2A2A42',
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  priceOptionSelected: { borderColor: '#6366F1', backgroundColor: '#6366F115' },
  priceLeft: { flex: 1 },
  priceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceLabel: { fontSize: 16, fontWeight: '700', color: '#F5F5FA' },
  priceSubLabel: { fontSize: 12, color: '#9898B0', marginTop: 2 },
  priceAmount: { fontSize: 18, fontWeight: '800', color: '#F5F5FA' },
  bestValueBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bestValueText: { fontSize: 10, color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.5 },
  subscribeButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#6366F1',
    minHeight: 58,
  },
  subscribeButtonDisabled: { opacity: 0.6 },
  subscribeButtonText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  autoRenewText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#6B6B85',
    lineHeight: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  restoreButton: { paddingVertical: 14, alignItems: 'center', minHeight: 48 },
  restoreButtonText: { fontSize: 14, color: '#9898B0', fontWeight: '500' },
});
