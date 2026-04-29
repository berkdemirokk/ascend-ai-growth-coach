import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert(t('common.error'), t('auth.invalidCredentials'));
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      Alert.alert(t('common.error'), error.message || t('common.tryAgain'));
      return;
    }
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
          <Text style={styles.subtitle}>{t('auth.welcomeSubtitle')}</Text>

          {sent ? (
            <View style={styles.successBox}>
              <Text style={styles.successTitle}>{t('auth.passwordResetSent')}</Text>
              <Text style={styles.successText}>{email}</Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={() => navigation.replace('Login')}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGrad}
                >
                  <Text style={styles.primaryText}>{t('auth.login')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>{t('auth.email')}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="example@mail.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={handleReset}
                disabled={loading}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryGrad}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.text} />
                  ) : (
                    <Text style={styles.primaryText}>Bağlantı Gönder</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.replace('Login')}
                style={styles.switchBtn}
              >
                <Text style={styles.switchText}>
                  Hatırladın mı?{' '}
                  <Text style={styles.switchLink}>Giriş yap</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 24, paddingBottom: 40 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  backIcon: { color: COLORS.text, fontSize: 20, fontWeight: '600' },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {},
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 15,
  },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 24 },
  primaryGrad: { paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  switchBtn: { alignItems: 'center', marginTop: 20, paddingVertical: 8 },
  switchText: { color: COLORS.textSecondary, fontSize: 14 },
  switchLink: { color: COLORS.primary, fontWeight: '700' },
  successBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
});
