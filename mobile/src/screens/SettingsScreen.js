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
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, LEGAL } from '../config/constants';

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
  const { isPremium, deleteAccount } = useApp();
  const { user, isAuthenticated, guestMode, signOut } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
            } catch (e) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
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
        <Text style={styles.screenTitle}>Settings</Text>

        {/* PREMIUM */}
        <SectionHeader title="Premium" />
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
        <SectionHeader title="Notifications" />
        <View style={styles.card}>
          <SettingRow label="Daily Reminders" borderBottom={false}>
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
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.linkRow, styles.noBorder]}
            onPress={() => openURL(LEGAL?.TERMS_URL || 'https://example.com/terms')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}
        <SectionHeader title="Account" />
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
              <Text style={styles.signOutButtonText}>Çıkış Yap</Text>
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
