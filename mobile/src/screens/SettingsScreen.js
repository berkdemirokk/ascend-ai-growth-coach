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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { LEGAL } from '../config/constants';
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

  const version = Constants?.expoConfig?.version || '1.0.1';
  const buildNumber =
    Constants?.expoConfig?.ios?.buildNumber ||
    Constants?.manifest?.ios?.buildNumber ||
    '15';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
          >
            <MaterialIcons name="arrow-back" size={22} color="#9898B0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('settings.title', 'Ayarlar')}
          </Text>
          {isPremium ? (
            <View style={styles.premiumBadge}>
              <MaterialIcons name="auto-awesome" size={14} color="#A5B4FC" />
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
                trackColor={{ false: '#34343D', true: '#494BD6' }}
                thumbColor={notificationsEnabled ? '#C0C1FF' : '#908FA0'}
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
                trackColor={{ false: '#34343D', true: '#494BD6' }}
                thumbColor={soundsEnabled ? '#C0C1FF' : '#908FA0'}
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
                  color="#FFB783"
                />
                <Text style={styles.rowLabel}>
                  {t('settings.premiumStatus', 'Premium Durumu')}
                </Text>
              </View>
              <View style={styles.rowRight}>
                <Text
                  style={[
                    styles.rowValue,
                    { color: isPremium ? '#FFB783' : '#9898B0' },
                  ]}
                >
                  {isPremium
                    ? t('settings.active', 'Aktif')
                    : t('settings.inactive', 'Pasif')}
                </Text>
                <MaterialIcons
                  name="chevron-right"
                  size={18}
                  color="#908FA0"
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
                <MaterialIcons
                  name="restore"
                  size={22}
                  color="#9898B0"
                />
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
                  <MaterialIcons name="logout" size={22} color="#9898B0" />
                  <Text style={styles.rowLabel}>
                    {t('settings.logout', 'Çıkış Yap')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleResetProgress}
              activeOpacity={0.7}
              style={[styles.row, styles.rowBorder]}
            >
              <View style={styles.rowLeft}>
                <MaterialIcons
                  name="refresh"
                  size={22}
                  color="#FFB783"
                />
                <Text style={styles.rowLabel}>
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
                  color="#FFB4AB"
                />
                <Text style={[styles.rowLabel, { color: '#FFB4AB' }]}>
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
              <MaterialIcons name="open-in-new" size={18} color="#908FA0" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Linking.openURL(LEGAL.TERMS_URL)}
              activeOpacity={0.7}
              style={[styles.row, styles.rowBorder]}
            >
              <Text style={styles.rowLabel}>
                {t('settings.termsOfService', 'Kullanım Koşulları')}
              </Text>
              <MaterialIcons name="open-in-new" size={18} color="#908FA0" />
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
            <MaterialIcons name="self-improvement" size={56} color="#6366F1" />
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
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1, backgroundColor: '#0B0B14' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1F1F27',
    borderBottomWidth: 1,
    borderBottomColor: '#464554',
  },
  headerBack: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    color: '#E4E1ED',
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
    backgroundColor: 'rgba(192, 193, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(192, 193, 255, 0.25)',
  },
  premiumBadgeText: {
    color: '#A5B4FC',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  scroll: { paddingTop: 16, paddingBottom: 24 },

  section: { marginTop: 16 },
  sectionTitle: {
    color: '#C7C4D7',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    paddingHorizontal: 24,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: '#1F1F27',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#464554',
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
    borderBottomColor: '#2A2A42',
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
    color: '#E4E1ED',
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    color: '#C7C4D7',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  rowValue: {
    color: '#9898B0',
    fontSize: 13,
    fontWeight: '600',
  },
  versionText: {
    fontVariant: ['tabular-nums'],
    fontSize: 12,
  },

  flag: { fontSize: 22 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#908FA0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: '#C0C1FF' },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#C0C1FF',
  },

  footer: {
    alignItems: 'center',
    marginTop: 32,
    opacity: 0.4,
    gap: 8,
  },
  footerText: {
    color: '#C7C4D7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
