import React, { useState, useEffect } from 'react';
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
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { LEGAL } from '../config/constants';
import { LT, LT_RADIUS } from '../config/lightTheme';
import { setLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '../i18n';
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelAllNotifications,
} from '../services/notifications';
import { restorePurchases } from '../services/purchases';
import { setMuted, isMuted } from '../services/sounds';

const NOTIF_KEY = '@ascend/notifications_enabled_v1';
const SOUNDS_MUTED_KEY = '@ascend/sounds_muted_v1';

export default function SettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { isPremium, deleteAccount, setPremium, resetProgress } = useApp();
  const { isAuthenticated, signOut } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const [restoring, setRestoring] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SOUNDS_MUTED_KEY).then((v) => {
      setSoundsEnabled(v !== 'true');
    });
  }, []);

  const toggleSounds = (value) => {
    setSoundsEnabled(value);
    setMuted(!value); // sounds.js auto-persists
  };

  const handleRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        setPremium(true);
        Alert.alert(
          t('settings.restoreSuccessTitle', 'Başarılı'),
          t('settings.restoreSuccessBody', 'Premium abonelik geri yüklendi.'),
        );
      } else {
        Alert.alert(
          t('settings.restoreEmptyTitle', 'Aktif abonelik yok'),
          t(
            'settings.restoreEmptyBody',
            'Bu Apple ID ile yapılmış aktif bir Premium abonelik bulunamadı.',
          ),
        );
      }
    } catch (e) {
      Alert.alert(t('common.error', 'Hata'), e?.message || t('common.tryAgain'));
    } finally {
      setRestoring(false);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((v) => {
      setNotificationsEnabled(v === 'true');
    });
  }, []);

  const toggleNotifications = async (value) => {
    if (value) {
      // Request permission, then schedule
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          t('settings.notifPermDeniedTitle', 'İzin verilmedi'),
          t(
            'settings.notifPermDeniedBody',
            'Bildirim göndermek için izin gerekli. Cihaz ayarlarından açabilirsin.',
          ),
        );
        setNotificationsEnabled(false);
        AsyncStorage.setItem(NOTIF_KEY, 'false').catch(() => {});
        return;
      }
      try {
        await scheduleDailyReminder();
      } catch (e) {
        console.warn('schedule daily reminder failed:', e?.message);
      }
      setNotificationsEnabled(true);
      AsyncStorage.setItem(NOTIF_KEY, 'true').catch(() => {});
    } else {
      try {
        await cancelAllNotifications();
      } catch (e) {
        console.warn('cancel notifications failed:', e?.message);
      }
      setNotificationsEnabled(false);
      AsyncStorage.setItem(NOTIF_KEY, 'false').catch(() => {});
    }
  };

  const handleChangeLanguage = async (code) => {
    await setLanguage(code);
    setCurrentLang(code);
  };

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOutTitle', 'Çıkış yap'),
      t(
        'settings.signOutBody',
        'Hesabından çıkış yapmak istediğine emin misin? İlerlemen bu cihazda kalacak.',
      ),
      [
        { text: t('common.cancel', 'İptal'), style: 'cancel' },
        {
          text: t('settings.logout', 'Çıkış Yap'),
          style: 'destructive',
          onPress: () => signOut(),
        },
      ],
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      t('settings.resetProgressTitle', 'İlerlemeyi Sıfırla'),
      t(
        'settings.resetProgressBody',
        'Tüm ders ilerlemen, streak\'in, XP\'in ve başarımların silinecek. Premium aboneliğin etkilenmez. Geri alınamaz.',
      ),
      [
        { text: t('common.cancel', 'İptal'), style: 'cancel' },
        {
          text: t('common.reset', 'Sıfırla'),
          style: 'destructive',
          onPress: () => {
            resetProgress();
            Alert.alert(
              t('settings.resetDoneTitle', 'Sıfırlandı'),
              t('settings.resetDoneBody', 'İlerlemen sıfırlandı.'),
            );
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount', 'Hesabı Sil'),
      t(
        'settings.deleteAccountConfirm',
        'Hesabını silmek istediğine emin misin? Geri alınamaz.',
      ),
      [
        { text: t('common.cancel', 'İptal'), style: 'cancel' },
        {
          text: t('common.delete', 'Sil'),
          style: 'destructive',
          onPress: async () => {
            await deleteAccount();
            if (signOut) await signOut();
          },
        },
      ],
    );
  };

  // Fallbacks track the current app.json — keep in sync when bumping version.
  const version = Constants?.expoConfig?.version || '1.0.10';
  const buildNumber =
    Constants?.expoConfig?.ios?.buildNumber ||
    Constants?.manifest?.ios?.buildNumber ||
    '24';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
          >
            <MaterialIcons name="arrow-back" size={22} color={LT.onSurfaceVariant} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('settings.title', 'Ayarlar')}
          </Text>
          {isPremium ? (
            <View style={styles.premiumBadge}>
              <MaterialIcons name="auto-awesome" size={14} color={LT.onPrimary} />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Language */}
          <Section title={t('settings.language', 'DİL (LANGUAGE)')}>
            {SUPPORTED_LANGUAGES.map((l, idx, arr) => {
              const isLast = idx === arr.length - 1;
              const active = currentLang === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  onPress={() => handleChangeLanguage(l.code)}
                  activeOpacity={0.7}
                  style={[styles.row, !isLast && styles.rowBorder]}
                >
                  <View style={styles.rowLeft}>
                    <Text style={styles.flag}>{l.flag}</Text>
                    <Text style={styles.rowLabel}>{l.label}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      active && styles.radioActive,
                    ]}
                  >
                    {active && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </Section>

          {/* Notifications */}
          <Section title={t('settings.notifications', 'BİLDİRİMLER (NOTIFICATIONS)')}>
            <View style={[styles.row, styles.rowBorder]}>
              <View style={styles.rowLeft}>
                <View>
                  <Text style={styles.rowLabel}>
                    {t('settings.dailyReminder', 'Günlük Hatırlatıcılar')}
                  </Text>
                  <Text style={styles.rowSub}>
                    {t(
                      'settings.dailyReminderSub',
                      'Odaklanma vaktini unutma',
                    )}
                  </Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: LT.outlineVariant, true: LT.primaryContainer }}
                thumbColor={LT.surfaceContainerLowest}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View>
                  <Text style={styles.rowLabel}>
                    {t('settings.sounds', 'Ses Efektleri')}
                  </Text>
                  <Text style={styles.rowSub}>
                    {t(
                      'settings.soundsSub',
                      'Quiz, ders, başarı sesleri',
                    )}
                  </Text>
                </View>
              </View>
              <Switch
                value={soundsEnabled}
                onValueChange={toggleSounds}
                trackColor={{ false: LT.outlineVariant, true: LT.primaryContainer }}
                thumbColor={LT.surfaceContainerLowest}
              />
            </View>
          </Section>

          {/* Account */}
          <Section title={t('settings.account', 'HESAP (ACCOUNT)')}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Paywall')}
              activeOpacity={0.7}
              style={[styles.row, styles.rowBorder]}
            >
              <View style={styles.rowLeft}>
                <MaterialIcons
                  name="workspace-premium"
                  size={22}
                  color={LT.primaryContainer}
                />
                <Text style={styles.rowLabel}>
                  {t('settings.premiumStatus', 'Premium Durumu')}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text
                  style={[
                    styles.rowValue,
                    { color: isPremium ? LT.primaryContainer : LT.onSurfaceVariant },
                  ]}
                >
                  {isPremium
                    ? t('settings.active', 'Aktif')
                    : t('settings.inactive', 'Pasif')}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={18}
                  color={LT.onSurfaceVariant}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRestore}
              disabled={restoring}
              activeOpacity={0.7}
              style={[styles.row, styles.rowBorder]}
            >
              <View style={styles.rowLeft}>
                {restoring ? (
                  <ActivityIndicator size="small" color={LT.primaryContainer} />
                ) : (
                  <MaterialIcons
                    name="restore"
                    size={22}
                    color={LT.onSurfaceVariant}
                  />
                )}
                <Text style={styles.rowLabel}>
                  {restoring
                    ? t('settings.restoring', 'Geri yükleniyor...')
                    : t('settings.restorePurchases', 'Satın Alımları Geri Yükle')}
                </Text>
              </View>
            </TouchableOpacity>

            {isAuthenticated && (
              <TouchableOpacity
                onPress={handleSignOut}
                activeOpacity={0.7}
                style={[styles.row, styles.rowBorder]}
              >
                <View style={styles.rowLeft}>
                  <MaterialIcons name="logout" size={22} color={LT.onSurfaceVariant} />
                  <Text style={styles.rowLabel}>
                    {t('settings.logout', 'Çıkış Yap')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </Section>

          {/* Danger Zone */}
          <Section title={t('settings.dangerZone', 'TEHLİKELİ BÖLGE (DANGER ZONE)')}>
            <TouchableOpacity
              onPress={handleResetProgress}
              activeOpacity={0.7}
              style={[styles.row, styles.rowBorder, styles.dangerRow]}
            >
              <View style={styles.rowLeft}>
                <MaterialIcons
                  name="refresh"
                  size={22}
                  color={LT.onPrimary}
                />
                <Text style={[styles.rowLabel, styles.dangerLabel]}>
                  {t('settings.resetProgress', 'İlerlemeyi Sıfırla')}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
              style={styles.row}
            >
              <View style={styles.rowLeft}>
                <MaterialIcons
                  name="delete-forever"
                  size={22}
                  color={LT.error}
                />
                <Text style={[styles.rowLabel, { color: LT.error }]}>
                  {t('settings.deleteAccount', 'Hesabı Sil')}
                </Text>
              </View>
            </TouchableOpacity>
          </Section>

          {/* Legal */}
          <Section title={t('settings.legal', 'YASAL (LEGAL)')}>
            <TouchableOpacity
              onPress={() => Linking.openURL(LEGAL.PRIVACY_URL)}
              activeOpacity={0.7}
              style={[styles.row, styles.rowBorder]}
            >
              <Text style={styles.rowLabel}>
                {t('settings.privacyPolicy', 'Gizlilik Politikası')}
              </Text>
              <MaterialIcons name="open-in-new" size={18} color={LT.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(LEGAL.TERMS_URL)}
              activeOpacity={0.7}
              style={[styles.row, styles.rowBorder]}
            >
              <Text style={styles.rowLabel}>
                {t('settings.termsOfService', 'Kullanım Koşulları')}
              </Text>
              <MaterialIcons name="open-in-new" size={18} color={LT.onSurfaceVariant} />
            </TouchableOpacity>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                {t('settings.version', 'Versiyon')}
              </Text>
              <Text style={[styles.rowValue, styles.versionText]}>
                {version} (Build {buildNumber})
              </Text>
            </View>
          </Section>

          {/* Footer mascot */}
          <View style={styles.footer}>
            <MaterialIcons name="self-improvement" size={56} color={LT.primaryContainer} />
            <Text style={styles.footerText}>
              MONK MODE • DIGITAL STOICISM
            </Text>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: LT.background },
  container: { flex: 1, backgroundColor: LT.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: LT.surfaceContainer,
    borderBottomWidth: 1,
    borderBottomColor: LT.outlineVariant,
  },
  headerBack: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    color: LT.onSurface,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginLeft: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: LT.primaryContainer,
    borderRadius: LT_RADIUS.pill,
    borderWidth: 1,
    borderColor: LT.primary,
  },
  premiumBadgeText: {
    color: LT.onPrimary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  scroll: { paddingTop: 16, paddingBottom: 24 },

  section: { marginTop: 16 },
  sectionTitle: {
    color: LT.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    paddingHorizontal: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: LT.surfaceContainerLowest,
    marginHorizontal: 20,
    borderRadius: LT_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: LT.outlineVariant,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: LT.outlineVariant,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowLabel: {
    color: LT.onSurface,
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    color: LT.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rowValue: {
    color: LT.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '600',
  },
  versionText: {
    fontVariant: ['tabular-nums'],
    fontSize: 12,
  },

  // Danger zone — destructive red background
  dangerRow: {
    backgroundColor: '#EF4444',
  },
  dangerLabel: {
    color: LT.onPrimary,
    fontWeight: '700',
  },

  flag: { fontSize: 22 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: LT.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: LT.primaryContainer },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: LT.primaryContainer,
  },

  footer: {
    alignItems: 'center',
    marginTop: 32,
    opacity: 0.5,
    gap: 8,
  },
  footerText: {
    color: LT.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
