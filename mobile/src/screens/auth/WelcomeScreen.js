import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

export default function WelcomeScreen({ navigation }) {
  const { continueAsGuest, configured } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0B0B14', '#1F1F33', '#0B0B14']}
        style={styles.container}
      >
        <View style={styles.hero}>
          <Text style={styles.logo}>🔥</Text>
          <Text style={styles.title}>Ascend</Text>
          <Text style={styles.tagline}>Monk Mode</Text>
          <Text style={styles.pitch}>
            Dopamin detoksundan finansal özgürlüğe{'\n'}
            Sprint sprint kendini inşa et.
          </Text>
        </View>

        <View style={styles.buttons}>
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
              <Text style={styles.primaryText}>Hesap Oluştur</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryText}>Giriş Yap</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestBtn}
            activeOpacity={0.7}
            onPress={continueAsGuest}
          >
            <Text style={styles.guestText}>
              {configured
                ? 'Hesapsız devam et (veri sadece bu cihazda)'
                : 'Misafir modunda devam et'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Devam ederek Kullanım Şartları'nı kabul etmiş olursun.
        </Text>
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
  guestBtn: { paddingVertical: 12, alignItems: 'center' },
  guestText: { color: COLORS.textMuted, fontSize: 13 },
  footer: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
});
