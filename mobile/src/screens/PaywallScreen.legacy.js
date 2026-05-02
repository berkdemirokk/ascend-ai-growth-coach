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
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { purchasePremium, restorePurchases, getAvailablePackages } from '../services/purchases';
import { getPaywallVariant, logPaywallEvent } from '../config/paywallVariants';

export default function PaywallScreen({ navigation }) {
  const { t } = useTranslation();
  const { setPremium } = useApp();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selected, setSelected] = useState('yearly');
  const [packages, setPackages] = useState({ monthly: null, yearly: null });
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [variant, setVariant] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const pkgs = await getAvailablePackages();
        if (pkgs) setPackages(pkgs);
      } finally {
        setLoadingPackages(false);
      }
      try {
        const v = await getPaywallVariant();
        setVariant(v);
        logPaywallEvent(v.id, 'view');
      } catch {
        setVariant({ id: 'A' });
      }
    })();
  }, []);

  const monthlyPrice = packages.monthly?.product?.priceString || '₺149,99';
  const yearlyPrice = packages.yearly?.product?.priceString || '₺999,99';
  const yearlyPerMonth = packages.yearly?.product?.price
    ? `₺${(packages.yearly.product.price / 12).toFixed(2)}`
    : '₺83,33';

  const handleSubscribe = async () => {
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
    logPaywallEvent(variant?.id || 'A', selected === 'yearly' ? 'select_yearly' : 'select_monthly');
    setIsSubscribing(true);
    try {
      const success = await purchasePremium(selected);
      if (success) {
        logPaywallEvent(variant?.id || 'A', 'purchase', { period: selected });
        setPremium(true);
        navigation.goBack();
      }
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
      }
    } catch (e) {
      Alert.alert(t('common.error'), e?.message || t('common.tryAgain'));
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background glow */}
      <View style={styles.bgGlow} pointerEvents="none" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeBtn}
        >
          <MaterialIcons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — variant-aware */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{variant?.heroEmoji || '🔥'}</Text>
          <Text style={styles.heroTitle}>
            {t(variant?.headline || 'paywall.title', 'TAM MONK MODE').toUpperCase()}
          </Text>
          <Text style={styles.heroSubtitle}>
            {t(variant?.subheadline || 'paywall.subtitle', 'İlk 7 gün ücretsiz')}
          </Text>
          {variant?.showSocialProof ? (
            <View style={styles.socialProofPill}>
              <MaterialIcons name="people" size={14} color="#10B981" />
              <Text style={styles.socialProofText}>
                {t('paywall.socialProof', '10.000+ disiplinli kullanıcı')}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Trust signals row */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <MaterialIcons name="lock" size={20} color="#908FA0" />
            <Text style={styles.trustLabel}>
              {t('paywall.trustPrivate', 'GİZLİ')}
            </Text>
          </View>
          <View style={styles.trustItem}>
            <MaterialIcons name="history" size={20} color="#908FA0" />
            <Text style={styles.trustLabel}>
              {t('paywall.trustCancel', 'İPTAL ET')}
            </Text>
          </View>
          <View style={styles.trustItem}>
            <MaterialIcons name="article" size={20} color="#908FA0" />
            <Text style={styles.trustLabel}>
              {t('paywall.trustNoTrack', 'İZLEME YOK')}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <FeatureRow
            icon="block"
            iconColor="#FFB4AB"
            label={t('paywall.feature1', 'Sınırsız kalpler')}
          />
          <FeatureRow
            icon="workspace-premium"
            iconColor="#FFB783"
            label={t('paywall.feature2', 'Tüm yolların kilidi açık')}
          />
          <FeatureRow
            icon="block"
            iconColor="#C0C1FF"
            label={t('paywall.feature3', 'Reklamsız deneyim')}
          />
          <FeatureRow
            icon="sync"
            iconColor="#D0BCFF"
            label={t('paywall.feature4', 'Cihazlar arası senkron')}
          />
          <FeatureRow
            icon="auto-awesome"
            iconColor="#FFDCC5"
            label={t('paywall.feature5', 'Premium başarılar')}
          />
        </View>

        {/* Price cards */}
        {loadingPackages ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#C0C1FF" />
            <Text style={styles.loadingText}>
              {t('paywall.loadingPrices', 'Fiyatlar yükleniyor...')}
            </Text>
          </View>
        ) : !packages.monthly && !packages.yearly ? (
          <View style={styles.errorBox}>
            <MaterialIcons name="warning" size={32} color="#FDE047" />
            <Text style={styles.errorTitle}>
              {t('paywall.notReadyTitle', 'Abonelikler yüklenemedi')}
            </Text>
            <Text style={styles.errorBody}>
              {t(
                'paywall.notReadyBodyShort',
                'Mağaza bağlantısı kurulamadı. Birkaç dakika sonra tekrar dene.',
              )}
            </Text>
            <TouchableOpacity
              onPress={async () => {
                setLoadingPackages(true);
                try {
                  const pkgs = await getAvailablePackages();
                  if (pkgs) setPackages(pkgs);
                } finally {
                  setLoadingPackages(false);
                }
              }}
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>
                {t('common.tryAgain', 'Tekrar dene')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.priceCards}>
            {/* Yearly */}
            <TouchableOpacity
              onPress={() => setSelected('yearly')}
              activeOpacity={0.85}
              style={[
                styles.priceCard,
                selected === 'yearly' && styles.priceCardActive,
              ]}
            >
              <View style={styles.bestValueBadge}>
                <Text style={styles.bestValueText}>
                  {t(variant?.bestValueBadge || 'paywall.bestValue', 'EN İYİ FİYAT')}
                </Text>
              </View>
              <Text style={styles.pricePeriod}>
                {t('paywall.yearly', 'YILLIK').toUpperCase()}
              </Text>
              <Text style={styles.priceAmount}>{yearlyPrice}</Text>
              <Text style={styles.pricePerMonth}>{yearlyPerMonth} / ay</Text>
            </TouchableOpacity>

            {/* Monthly */}
            <TouchableOpacity
              onPress={() => setSelected('monthly')}
              activeOpacity={0.85}
              style={[
                styles.priceCard,
                styles.priceCardSecondary,
                selected === 'monthly' && styles.priceCardActive,
              ]}
            >
              <Text style={styles.pricePeriod}>
                {t('paywall.monthly', 'AYLIK').toUpperCase()}
              </Text>
              <Text style={styles.priceAmount}>{monthlyPrice}</Text>
              <Text style={styles.pricePerMonth}>
                {t('paywall.billedMonthly', 'Her ay faturalandırılır')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={isSubscribing || isRestoring}
          activeOpacity={0.9}
          style={styles.ctaShadow}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.ctaButton,
              (isSubscribing || isRestoring) && { opacity: 0.6 },
            ]}
          >
            {isSubscribing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.ctaText}>
                {t(variant?.ctaText || 'paywall.ctaTrial', '7 gün ücretsiz başla')}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerNote}>
          {t(
            'paywall.autoRenew',
            'Abonelik otomatik olarak yenilenir. İstediğin zaman ayarlardan veya App Store hesabından iptal edebilirsin.',
          )}
        </Text>

        <TouchableOpacity
          onPress={handleRestore}
          disabled={isSubscribing || isRestoring}
          style={styles.restoreBtn}
        >
          {isRestoring ? (
            <ActivityIndicator color="#C0C1FF" size="small" />
          ) : (
            <Text style={styles.restoreText}>
              {t('settings.restorePurchases', 'Satın Alımları Geri Yükle')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, iconColor, label }) {
  return (
    <View style={styles.featureRow}>
      <MaterialIcons name={icon} size={22} color={iconColor} />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },

  bgGlow: {
    position: 'absolute',
    bottom: -120,
    left: '50%',
    marginLeft: -200,
    width: 400,
    height: 240,
    borderRadius: 200,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    opacity: 0.5,
  },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F27',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },

  // Hero
  hero: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  heroEmoji: {
    fontSize: 60,
    marginBottom: 12,
    textShadowColor: 'rgba(245, 158, 11, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  heroTitle: {
    color: '#F5F5FA',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 6,
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#F59E0B',
    fontSize: 16,
    fontWeight: '700',
  },
  socialProofPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginTop: 12,
  },
  socialProofText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Trust signals
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 384,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#464554',
    marginBottom: 24,
  },
  trustItem: {
    alignItems: 'center',
    gap: 4,
  },
  trustLabel: {
    color: '#9898B0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },

  // Features
  features: {
    width: '100%',
    maxWidth: 420,
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#1B1B23',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.4)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  featureLabel: {
    color: '#E4E1ED',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },

  // Loading / error
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 420,
  },
  loadingText: { color: '#9898B0', fontSize: 13 },

  errorBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#1B1B23',
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.3)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorTitle: {
    color: '#F5F5FA',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorBody: {
    color: '#9898B0',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryBtn: {
    backgroundColor: '#C0C1FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#0D0096', fontSize: 13, fontWeight: '800' },

  // Price cards
  priceCards: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 420,
    marginBottom: 24,
  },
  priceCard: {
    flex: 1,
    backgroundColor: '#292932',
    borderWidth: 2,
    borderColor: '#C0C1FF',
    borderRadius: 18,
    padding: 18,
    paddingTop: 22,
    alignItems: 'center',
    minHeight: 130,
    shadowColor: '#C0C1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  priceCardSecondary: {
    backgroundColor: '#1F1F27',
    borderColor: '#464554',
    borderWidth: 1,
    shadowOpacity: 0,
  },
  priceCardActive: {
    borderColor: '#C0C1FF',
    borderWidth: 2,
    shadowOpacity: 0.2,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FFB783',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  bestValueText: {
    color: '#4F2500',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  pricePeriod: {
    color: '#C7C4D7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  priceAmount: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  pricePerMonth: {
    color: '#908FA0',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },

  // CTA
  ctaShadow: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    marginBottom: 16,
  },
  ctaButton: {
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  footerNote: {
    color: '#908FA0',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 8,
  },
  restoreBtn: {
    paddingVertical: 12,
  },
  restoreText: {
    color: '#C0C1FF',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(192, 193, 255, 0.3)',
  },
});
