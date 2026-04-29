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
import { COLORS } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupScreen({ navigation }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert('İsim gerekli', 'Sana nasıl hitap edelim?');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Geçersiz e-posta', 'Lütfen geçerli bir e-posta adresi gir.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Şifre çok kısa', 'Şifre en az 6 karakter olmalı.');
      return;
    }
    setLoading(true);
    const { data, error } = await signUp({ email, password, name });
    setLoading(false);
    if (error) {
      Alert.alert('Kayıt başarısız', error.message || 'Bir hata oluştu.');
      return;
    }
    // If email confirmation is required, tell user
    if (data?.user && !data?.session) {
      Alert.alert(
        'E-postanı onayla',
        'Kayıt tamamlandı. E-postana gönderilen onay bağlantısına tıkla ve tekrar giriş yap.',
        [{ text: 'Tamam', onPress: () => navigation.replace('Login') }],
      );
    }
    // Otherwise session auto-updates via AuthContext listener
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

          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>
            İlerlemeni cihazlar arasında güvende tut.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>İsmin</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Berk"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="words"
              style={styles.input}
            />

            <Text style={styles.label}>E-posta</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@mail.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="En az 6 karakter"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={handleSignup}
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
                  <Text style={styles.primaryText}>Kayıt Ol</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.replace('Login')}
              style={styles.switchBtn}
            >
              <Text style={styles.switchText}>
                Zaten hesabın var mı?{' '}
                <Text style={styles.switchLink}>Giriş yap</Text>
              </Text>
            </TouchableOpacity>
          </View>
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
});
