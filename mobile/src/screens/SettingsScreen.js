import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet,
  SafeAreaView,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, LEGAL } from '../config/constants';
import { setLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '../i18n';

const COLORS_THEME = {
  background: '#0B0B14',
  surface: '#161626',
  text: '#F5F5FA',
  textSecondary: '#9898B0',
  primary: '#6366F1',
  accent: '#8B5CF6',
  border: '#2A2A42',
  error: '#EF4444',
  success: '#10B981',
};

export default function SettingsScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const { isPremium, deleteAccount } = useApp();
  const { user, isAuthenticated, guestMode, signOut } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());

  const handleChangeLanguage = async (code) => {
    await setLanguage(code);
    setCurrentLang(code);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Çıkış yap',
      'Hesabından çıkış yapmak istediğine emin misin? İlerlemen bu cihazda kalacak, tekrar giriş yaptığında bulutla senkronize olacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (e) {
              Alert.alert('Hata', 'Çıkış yapılamadı. Tekrar dene.');
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount', 'Hesabı Sil'),
      t('settings.deleteAccountWarning', 'Bu işlem GERİ ALINAMAZ. Tüm dersler, streak, ilerleme silinir. Premium aboneliğin App Store\'dan ayrı iptal edilmeli.'),
      [
        { text: t('common.cancel', 'İptal'), style: 'cancel' },
        {
          text: t('settings.deleteAccountConfirm1', 'Devam et'),
          style: 'destructive',
          onPress: () => {
            // Step 2 — final confirmation
            Alert.alert(
              t('settings.deleteAccountFinal', 'Son Onay'),
              t('settings.deleteAccountFinalText', 'Bu son adım. Hesabını gerçekten silmek istiyor musun?'),
              [
                { text: t('common.cancel', 'İptal'), style: 'cancel' },
                {
                  text: t('settings.deleteAccountFinalBtn', 'Evet, sil'),
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAccount();
                      navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
                    } catch (e) {
                      Alert.alert(t('common.error', 'Hata'), t('common.tryAgain', 'Tekrar dene'));
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const openURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open this link.');
      }
    } catch (e) {
      Alert.alert('Error', 'Unable to open this link.');
    }
  };

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const SettingRow = ({ label, children, borderBottom = true }) => (
    <View style={[styles.settingRow, !borderBottom && styles.noBorder]}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>{t('settings.title')}</Text>

        {/* LANGUAGE */}
        <SectionHeader title={t('settings.language')} />
        <View style={styles.card}>
          <View style={styles.langRow}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const active = currentLang === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langBtn, active && styles.langBtnActive]}
                  onPress={() => handleChangeLanguage(lang.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={[styles.langLabel, active && styles.langLabelActive]}>
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* PREMIUM */}
        <SectionHeader title={t('settings.premium')} />
        <View style={styles.card}>
          {isPremium ? (
            <View style={styles.premiumBadgeRow}>
              <Text style={styles.premiumBadgeEmoji}>👑</Text>
              <View>
                <Text style={styles.premiumBadgeTitle}>Premium Active</Text>
                <Text style={styles.premiumBadgeSub}>You have full access to all features</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.85}
            >
              <Text style={styles.upgradeEmoji}>👑</Text>
              <View style={styles.upgradeTextBlock}>
                <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
                <Text style={styles.upgradeSub}>Unlock all features for $2.99/month</Text>
              </View>
              <Text style={styles.upgradeArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* NOTIFICATIONS */}
        <SectionHeader title={t('settings.notifications')} />
        <View style={styles.card}>
          <SettingRow label={t('settings.dailyReminder')} borderBottom={false}>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: COLORS_THEME.border, true: COLORS_THEME.primary }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#9898B0'}
            />
          </SettingRow>
        </View>

        {/* LEGAL */}
        <SectionHeader title="Legal" />
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => openURL(LEGAL?.PRIVACY_URL || 'https://example.com/privacy')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>{t('settings.privacyPolicy')}</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.linkRow, styles.noBorder]}
            onPress={() => openURL(LEGAL?.TERMS_URL || 'https://example.com/terms')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>{t('settings.termsOfService')}</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}
        <SectionHeader title={t('settings.account')} />
        <View style={styles.card}>
          {isAuthenticated && user?.email ? (
            <SettingRow label="E-posta">
              <Text style={styles.infoValue} numberOfLines={1}>
                {user.email}
              </Text>
            </SettingRow>
          ) : guestMode ? (
            <SettingRow label="Hesap">
              <Text style={styles.infoValue}>Misafir</Text>
            </SettingRow>
          ) : null}

          {isAuthenticated ? (
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              activeOpacity={0.8}
            >
              <Text style={styles.signOutButtonText}>{t('settings.logout')}</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* APP INFO */}
        <SectionHeader title="App Info" />
        <View style={styles.card}>
          <SettingRow label="Version" borderBottom={false}>
            <Text style={styles.infoValue}>1.0.0</Text>
          </SettingRow>
        </View>
        <Text style={styles.madeWith}>Made with ❤️</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0B14',
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  langBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#2A2A42',
    backgroundColor: '#0B0B14',
  },
  langBtnActive: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F125',
  },
  langFlag: {
    fontSize: 24,
    marginBottom: 4,
  },
  langLabel: {
    fontSize: 12,
    color: '#9898B0',
    fontWeight: '600',
  },
  langLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: '#0B0B14',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F5FA',
    marginTop: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9898B0',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 24,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#161626',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A42',
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#2A2A42',
    marginHorizontal: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A42',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingLabel: {
    fontSize: 15,
    color: '#F5F5FA',
    fontWeight: '500',
  },
  settingControl: {
    alignItems: 'flex-end',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  linkArrow: {
    fontSize: 20,
    color: '#9898B0',
    lineHeight: 22,
  },
  infoValue: {
    fontSize: 15,
    color: '#9898B0',
  },
  premiumBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  premiumBadgeEmoji: {
    fontSize: 28,
  },
  premiumBadgeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F5FA',
  },
  premiumBadgeSub: {
    fontSize: 13,
    color: '#9898B0',
    marginTop: 2,
  },
  activeBadge: {
    marginLeft: 'auto',
    backgroundColor: '#10B98120',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  upgradeEmoji: {
    fontSize: 28,
  },
  upgradeTextBlock: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F5F5FA',
  },
  upgradeSub: {
    fontSize: 13,
    color: '#9898B0',
    marginTop: 2,
  },
  upgradeArrow: {
    fontSize: 22,
    color: '#6366F1',
    fontWeight: '600',
  },
  deleteButton: {
    margin: 16,
    backgroundColor: '#EF444420',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#2A2A42',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A42',
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5FA',
  },
  madeWith: {
    textAlign: 'center',
    color: '#9898B0',
    fontSize: 13,
    marginTop: 32,
    marginBottom: 8,
  },
});
