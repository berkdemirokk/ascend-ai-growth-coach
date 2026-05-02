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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { setLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '../../i18n';

export default function WelcomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { continueAsGuest, configured, signInWithApple } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

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

  const handleChangeLang = async (code) => {
    await setLanguage(code);
    setCurrentLang(code);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Ambient glow background */}
        <View style={styles.heroGlow} pointerEvents="none" />

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.iconImage}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.brand}>MONK MODE</Text>
          <Text style={styles.tagline}>
            {t('auth.tagline', 'Disiplin. Odak. Tekrar.')}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {appleAvailable ? (
            <TouchableOpacity
              style={styles.appleBtn}
              activeOpacity={0.85}
              onPress={handleApple}
              disabled={appleLoading}
            >
              {appleLoading ? (
                <ActivityIndicator color="#0B0B14" />
              ) : (
                <>
                  <Text style={styles.appleIcon}></Text>
                  <Text style={styles.appleText}>
                    {t('auth.signInWithApple', 'Apple ile devam et')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.primaryBtnWrap}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Signup')}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <MaterialIcons name="email" size={18} color="#FFFFFF" />
              <Text style={styles.primaryText}>
                {t('auth.signupWithEmail', 'E-posta ile kayıt ol')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryText}>
              {t('auth.haveAccount', 'Zaten hesabım var')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestBtn}
            activeOpacity={0.7}
            onPress={continueAsGuest}
          >
            <Text style={styles.guestText}>
              {t('auth.guestMode', 'Misafir olarak devam et')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Language switcher */}
        <View style={styles.langRow}>
          {SUPPORTED_LANGUAGES.map((l) => {
            const active = currentLang === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                onPress={() => handleChangeLang(l.code)}
                activeOpacity={0.7}
                style={[styles.langChip, active && styles.langChipActive]}
              >
                <Text style={styles.langFlag}>{l.flag}</Text>
                <Text
                  style={[
                    styles.langLabel,
                    active && styles.langLabelActive,
                  ]}
                >
                  {l.code.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {!configured ? (
          <Text style={styles.warningText}>
            ⚠ {t('auth.notConfigured', 'Bulut bağlantısı yok — sadece misafir modu çalışır')}
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#13131b' },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    justifyContent: 'space-between',
  },

  heroGlow: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    width: 320,
    height: 320,
    marginLeft: -160,
    borderRadius: 160,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    opacity: 0.5,
  },

  hero: {
    alignItems: 'center',
    marginTop: 32,
    flex: 1,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 144,
    height: 144,
    borderRadius: 72,
    overflow: 'hidden',
    backgroundColor: '#1F1F27',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 12,
  },
  iconImage: { width: '100%', height: '100%' },
  brand: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 10,
  },
  tagline: {
    color: '#C7C4D7',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  buttons: {
    width: '100%',
    gap: 10,
    marginBottom: 16,
  },
  appleBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appleIcon: { fontSize: 18, color: '#0B0B14' },
  appleText: { color: '#0B0B14', fontSize: 15, fontWeight: '700' },
  primaryBtnWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtn: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  secondaryBtn: {
    backgroundColor: 'rgba(31, 31, 39, 0.8)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.6)',
  },
  secondaryText: { color: '#C0C1FF', fontSize: 14, fontWeight: '700' },
  guestBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  guestText: { color: '#908FA0', fontSize: 13, fontWeight: '600' },

  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.5)',
    backgroundColor: 'rgba(31, 31, 39, 0.4)',
  },
  langChipActive: {
    borderColor: '#C0C1FF',
    backgroundColor: 'rgba(192, 193, 255, 0.15)',
  },
  langFlag: { fontSize: 14 },
  langLabel: { color: '#908FA0', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  langLabelActive: { color: '#C0C1FF' },

  warningText: {
    color: '#FFB783',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
