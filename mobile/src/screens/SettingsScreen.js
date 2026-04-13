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
import { CATEGORIES, DIFFICULTIES, COLORS, LEGAL } from '../config/constants';

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
  const {
    selectedCategories,
    difficulty,
    isPremium,
    setCategories,
    setDifficulty,
    deleteAccount,
  } = useApp();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      if (selectedCategories.length === 1) return;
      setCategories(selectedCategories.filter((c) => c !== categoryId));
    } else {
      setCategories([...selectedCategories, categoryId]);
    }
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

        {/* PREFERENCES */}
        <SectionHeader title="Preferences" />
        <View style={styles.card}>
          <Text style={styles.cardSubLabel}>Categories</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                  onPress={() => toggleCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryChipEmoji}>{cat.emoji || '✦'}</Text>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {cat.label || cat.name || cat.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.divider} />

          <Text style={styles.cardSubLabel}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {DIFFICULTIES.map((diff) => {
              const isSelected = difficulty === diff.id;
              return (
                <TouchableOpacity
                  key={diff.id}
                  style={[styles.difficultyChip, isSelected && styles.difficultyChipSelected]}
                  onPress={() => setDifficulty(diff.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.difficultyChipText,
                      isSelected && styles.difficultyChipTextSelected,
                    ]}
                  >
                    {diff.label || diff.name || diff.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

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
            onPress={() => openURL(LEGAL?.privacyPolicyUrl || 'https://example.com/privacy')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[styles.linkRow, styles.noBorder]}
            onPress={() => openURL(LEGAL?.termsOfServiceUrl || 'https://example.com/terms')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <Text style={styles.linkArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}
        <SectionHeader title="Account" />
        <View style={styles.card}>
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
  cardSubLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9898B0',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0B14',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A42',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  categoryChipSelected: {
    backgroundColor: '#6366F120',
    borderColor: '#6366F1',
  },
  categoryChipEmoji: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 13,
    color: '#9898B0',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  difficultyRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 14,
    gap: 8,
  },
  difficultyChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0B0B14',
    borderWidth: 1,
    borderColor: '#2A2A42',
  },
  difficultyChipSelected: {
    backgroundColor: '#6366F120',
    borderColor: '#6366F1',
  },
  difficultyChipText: {
    fontSize: 13,
    color: '#9898B0',
    fontWeight: '500',
  },
  difficultyChipTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
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
  madeWith: {
    textAlign: 'center',
    color: '#9898B0',
    fontSize: 13,
    marginTop: 32,
    marginBottom: 8,
  },
});
