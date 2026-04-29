import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

export default function WelcomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { continueAsGuest, configured, signInWithApple } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    (async () => {
      try {
        const mod = await import('expo-apple-authentication');
        const ok = await mod.isAvailableAsync();
        setAppleAvailable(!!ok);
      } catch {
        setAppleAvailable(false);
      }
    })();
  }, []);

  const handleApple = async () => {
    setAppleLoading(true);
    try {
      const result = await signInWithApple();
      if (result?.canceled) return;
      if (result?.error) {
        Alert.alert(t('common.error'), result.error.message || 'Apple Sign-In failed');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0B0B14', '#1F1F33', '#0B0B14']}
        style={styles.container}
      >
        <View style={styles.hero}>
          <Text style={styles.logo}>🔥</Text>
          <Text style={styles.title}>Ascend</Text>
          <Text style={styles.tagline}>{t('onboarding.title')}</Text>
          <Text style={styles.pitch}>{t('onboarding.subtitle')}</Text>
        </View>

        <View style={styles.buttons}>
          {appleAvailable ? (
            <TouchableOpacity
              style={styles.appleBtn}
              activeOpacity={0.85}
              onPress={handleApple}
              disabled={appleLoading}
            >
              <Text style={styles.appleIcon}></Text>
              <Text style={styles.appleText}>
                {appleLoading ? t('paywall.loading') : t('auth.signInWithApple')}
              </Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Signup')}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryText}>{t('auth.signup')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryText}>{t('auth.login')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestBtn}
            activeOpacity={0.7}
            onPress={continueAsGuest}
          >
            <Text style={styles.guestText}>{t('auth.guestMode')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>{t('settings.termsOfService')}</Text>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 88, marginBottom: 24 },
  title: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tagline: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 3,
    marginTop: 4,
    marginBottom: 24,
  },
  pitch: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttons: { marginBottom: 16 },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  primaryGrad: { paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  secondaryText: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  appleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 8,
  },
  appleIcon: { fontSize: 18, color: '#FFFFFF' },
  appleText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  guestBtn: { paddingVertical: 12, alignItems: 'center' },
  guestText: { color: COLORS.textMuted, fontSize: 13 },
  footer: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
