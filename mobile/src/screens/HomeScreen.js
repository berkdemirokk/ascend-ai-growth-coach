// HomeScreen — dashboard tab in the redesigned 4-tab nav.
// Shows: streak hero, today's CTA (jump to current lesson), premium upsell (if free),
// quick stats, recent activity. Vivid Impact light theme.

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import {
  PATHS,
  getPathById,
  getPathLessons,
  getCurrentLesson,
} from '../data/paths';
import LightTopAppBar from '../components/LightTopAppBar';
import StreakInfoModal from '../components/StreakInfoModal';
import BannerAdBox from '../components/BannerAdBox';
import { LT, LT_SPACING, LT_RADIUS } from '../config/lightTheme';

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const {
    pathProgress,
    activePathId,
    isPremium,
    currentStreak,
    longestStreak,
    totalXP,
    level,
    userProfile,
  } = useApp();
  const { user } = useAuth();

  const [streakInfoVisible, setStreakInfoVisible] = useState(false);

  const activePath = useMemo(
    () => getPathById(activePathId) || PATHS[0],
    [activePathId],
  );

  const currentLesson = useMemo(
    () => getCurrentLesson(activePath, pathProgress),
    [activePath, pathProgress],
  );

  // Total lessons completed across all paths
  const totalCompleted = useMemo(() => {
    return Object.values(pathProgress || {}).reduce(
      (sum, p) => sum + (p?.completed?.length || 0),
      0,
    );
  }, [pathProgress]);

  const totalLessons = PATHS.reduce((s, p) => s + p.duration, 0);

  const handleStartLesson = () => {
    if (!currentLesson) return;
    navigation.navigate('Lesson', {
      pathId: currentLesson.pathId,
      lessonId: currentLesson.id,
    });
  };

  // Prefer the user's actual name when we have one. Sources, in order:
  //   1. Onboarding profile (user typed it)
  //   2. Supabase auth metadata (signup or Apple Sign-In full name)
  //   3. The local part of the email (e.g. "berk@x.com" -> "berk")
  //   4. Generic fallback string
  const profileName = userProfile?.name?.trim();
  const metaName = user?.user_metadata?.name?.trim();
  const emailLocal = (user?.email || '').split('@')[0];
  const username =
    profileName ||
    metaName ||
    (emailLocal ? capitalize(emailLocal) : t('home.greetingName', 'Disiplinci'));
  const greeting = getGreeting(t);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={LT.background} />

      <LightTopAppBar
        onAvatarPress={() => navigation.navigate('Settings')}
        onStreakPress={() => setStreakInfoVisible(true)}
        currentStreak={currentStreak}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <Text style={styles.greetingLabel}>{greeting}</Text>
          <Text style={styles.greetingName}>{username}</Text>
          <Text style={styles.greetingSubtitle}>
            {t(
              'home.subtitle',
              'Disiplin yolunda bir gün daha. Hadi başla.',
            )}
          </Text>
        </View>

        {/* Streak Hero Card */}
        <TouchableOpacity
          style={styles.streakHero}
          onPress={() => setStreakInfoVisible(true)}
          activeOpacity={0.9}
        >
          <View style={styles.streakHeroLeft}>
            <Text style={styles.streakHeroLabel}>
              {t('home.currentStreak', 'MEVCUT SERİ')}
            </Text>
            <View style={styles.streakHeroNumberRow}>
              <Text style={styles.streakHeroNumber}>{currentStreak}</Text>
              <MaterialIcons
                name="local-fire-department"
                size={42}
                color={LT.primaryContainer}
              />
            </View>
            <Text style={styles.streakHeroSub}>
              {t('home.daysStrong', 'GÜN')}
            </Text>
          </View>
          <View style={styles.streakHeroRight}>
            <Text style={styles.streakBestLabel}>
              {t('home.longestStreak', 'EN UZUN')}
            </Text>
            <Text style={styles.streakBest}>{longestStreak || 0}</Text>
            <Text style={styles.streakBestSub}>
              {t('home.daysStrong', 'GÜN')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Today's CTA Card */}
        <View style={styles.ctaCard}>
          <View style={styles.ctaCardHeader}>
            <Text style={styles.ctaCardLabel}>
              {t('home.todayCta', 'BUGÜNÜN GÖREVİ')}
            </Text>
            <View style={styles.ctaPathBadge}>
              <MaterialIcons
                name={activePath.materialIcon}
                size={12}
                color={LT.onSurfaceVariant}
              />
              <Text style={styles.ctaPathBadgeText}>
                {t(`paths.${activePath.id}.shortTitle`, activePath.id)}
              </Text>
            </View>
          </View>
          <Text style={styles.ctaTitle}>
            {currentLesson
              ? t(
                  `lessons.${currentLesson.pathId}.${currentLesson.order}.title`,
                  `${t('path.lessonLabel', 'Ders')} ${currentLesson.order}`,
                )
              : t('home.allDone', 'Tüm dersleri tamamladın 🎉')}
          </Text>
          <Text style={styles.ctaDescription}>
            {currentLesson
              ? t(
                  `lessons.${currentLesson.pathId}.${currentLesson.order}.summary`,
                  t(
                    'home.ctaGenericSub',
                    'Bugünün adımı seni bekliyor. ~5 dakika.',
                  ),
                )
              : t(
                  'home.allDoneSub',
                  'Yeni yola geçebilir veya tekrar pratiği yapabilirsin.',
                )}
          </Text>
          {currentLesson ? (
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={handleStartLesson}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaButtonText}>
                {t('home.startNow', 'PRATİĞE BAŞLA')}
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={LT.onPrimary}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaButtonSecondary]}
              onPress={() => navigation.navigate('MainTabs', { screen: 'Paths' })}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaButtonTextSecondary}>
                {t('home.viewPaths', 'YOLLARA GÖZAT')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats Strip */}
        <View style={styles.statsStrip}>
          <StatCell
            icon="bolt"
            label={t('home.statXp', 'XP')}
            value={totalXP.toLocaleString()}
          />
          <View style={styles.statDivider} />
          <StatCell
            icon="menu-book"
            label={t('home.statLessons', 'DERS')}
            value={`${totalCompleted}`}
            sub={`/ ${totalLessons}`}
          />
          <View style={styles.statDivider} />
          <StatCell
            icon="military-tech"
            label={t('home.statLevel', 'SEVİYE')}
            value={`${level}`}
          />
        </View>

        {/* Premium Upsell (free users) */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumCard}
            onPress={() => navigation.navigate('Paywall')}
            activeOpacity={0.9}
          >
            <View style={styles.premiumCardLeft}>
              <View style={styles.premiumCardIcon}>
                <MaterialIcons
                  name="workspace-premium"
                  size={20}
                  color={LT.onPrimary}
                />
              </View>
              <View style={styles.premiumCardText}>
                <Text style={styles.premiumCardTitle}>
                  {t('home.premiumTitle', 'Premium ile sınırları kaldır')}
                </Text>
                <Text style={styles.premiumCardSub}>
                  {t(
                    'home.premiumSub',
                    'Reklamsız · Tüm yollar · Streak donduru · İndirim',
                  )}
                </Text>
              </View>
            </View>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={LT.primaryContainer}
            />
          </TouchableOpacity>
        )}

        {/* Quick Links */}
        <View style={styles.linkList}>
          <LinkRow
            icon="auto-stories"
            label={t('home.linkReflections', 'Yansımalarım')}
            sub={t('home.linkReflectionsSub', 'Geçmiş ders yansımaları')}
            onPress={() => navigation.navigate('Reflections')}
          />
          <LinkRow
            icon="settings"
            label={t('home.linkSettings', 'Ayarlar')}
            sub={t('home.linkSettingsSub', 'Bildirim, ses, hesap')}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <BannerAdBox />

      <StreakInfoModal
        visible={streakInfoVisible}
        onClose={() => setStreakInfoVisible(false)}
        currentStreak={currentStreak}
      />
    </SafeAreaView>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────────

function StatCell({ icon, label, value, sub }) {
  return (
    <View style={styles.statCell}>
      <MaterialIcons name={icon} size={16} color={LT.onSurfaceVariant} />
      <Text style={styles.statValue}>
        {value}
        {sub ? <Text style={styles.statValueSub}> {sub}</Text> : null}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function LinkRow({ icon, label, sub, onPress }) {
  return (
    <TouchableOpacity
      style={styles.linkRow}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.linkIconWrap}>
        <MaterialIcons name={icon} size={20} color={LT.primaryContainer} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.linkLabel}>{label}</Text>
        <Text style={styles.linkSub}>{sub}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={LT.outline} />
    </TouchableOpacity>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(t) {
  const hour = new Date().getHours();
  if (hour < 5) return t('home.greetingNight', 'GECE YARISI');
  if (hour < 12) return t('home.greetingMorning', 'GÜNAYDIN');
  if (hour < 18) return t('home.greetingAfternoon', 'İYİ ÖĞLEDEN SONRALAR');
  return t('home.greetingEvening', 'İYİ AKŞAMLAR');
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LT.background,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  greetingBlock: {
    paddingHorizontal: LT_SPACING.containerMargin,
    paddingTop: 28,
    paddingBottom: 16,
  },
  greetingLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    color: LT.onSurfaceVariant,
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.6,
    color: LT.onSurface,
    marginBottom: 6,
  },
  greetingSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: LT.onSurfaceVariant,
    lineHeight: 20,
  },

  // Streak Hero card
  streakHero: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: LT_SPACING.containerMargin,
    marginBottom: 14,
    backgroundColor: LT.surfaceContainerLowest,
    borderRadius: LT_RADIUS.xl,
    borderWidth: 1,
    borderColor: LT.outlineVariant,
    paddingVertical: 16,
    paddingHorizontal: 18,
    overflow: 'hidden',
  },
  streakHeroLeft: {
    flex: 1.4,
  },
  streakHeroLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    color: LT.onSurfaceVariant,
    marginBottom: 6,
  },
  streakHeroNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  streakHeroNumber: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2.5,
    color: LT.primaryContainer,
    lineHeight: 64,
  },
  streakHeroSub: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    color: LT.outline,
    marginTop: 2,
  },
  streakHeroRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: LT.outlineVariant,
    paddingLeft: 16,
  },
  streakBestLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: LT.onSurfaceVariant,
  },
  streakBest: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1.2,
    color: LT.onSurface,
    marginTop: 2,
  },
  streakBestSub: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: LT.outline,
  },

  // Today's CTA card
  ctaCard: {
    marginHorizontal: LT_SPACING.containerMargin,
    marginBottom: 14,
    backgroundColor: LT.surfaceContainerLowest,
    borderRadius: LT_RADIUS.xl,
    borderWidth: 2,
    borderColor: LT.primaryContainer,
    padding: 20,
    shadowColor: LT.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 6,
  },
  ctaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ctaCardLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    color: LT.primaryContainer,
  },
  ctaPathBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LT_RADIUS.pill,
    backgroundColor: LT.surfaceContainer,
    borderWidth: 1,
    borderColor: LT.outlineVariant,
  },
  ctaPathBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: LT.onSurfaceVariant,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    color: LT.onSurface,
    lineHeight: 28,
    marginBottom: 6,
  },
  ctaDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: LT.onSurfaceVariant,
    lineHeight: 19,
    marginBottom: 18,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: LT.primaryContainer,
    height: 48,
    borderRadius: LT_RADIUS.lg,
    shadowColor: LT.primaryContainer,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: LT.outlineVariant,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaButtonText: {
    color: LT.onPrimary,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  ctaButtonTextSecondary: {
    color: LT.onSurface,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  // Stats strip
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: LT_SPACING.containerMargin,
    marginBottom: 14,
    backgroundColor: LT.surfaceContainerLowest,
    borderRadius: LT_RADIUS.xl,
    borderWidth: 1,
    borderColor: LT.outlineVariant,
    paddingVertical: 14,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: LT.outlineVariant,
    marginVertical: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: LT.onSurface,
    letterSpacing: -0.4,
  },
  statValueSub: {
    fontSize: 11,
    fontWeight: '700',
    color: LT.outline,
    letterSpacing: 0,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: LT.onSurfaceVariant,
  },

  // Premium upsell card
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: LT_SPACING.containerMargin,
    marginBottom: 14,
    backgroundColor: 'rgba(227, 18, 18, 0.06)',
    borderRadius: LT_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(227, 18, 18, 0.2)',
    padding: 16,
  },
  premiumCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LT.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: LT.primaryContainer,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  premiumCardText: {
    flex: 1,
  },
  premiumCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: LT.onSurface,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  premiumCardSub: {
    fontSize: 11,
    fontWeight: '600',
    color: LT.onSurfaceVariant,
  },

  // Link list
  linkList: {
    marginHorizontal: LT_SPACING.containerMargin,
    backgroundColor: LT.surfaceContainerLowest,
    borderRadius: LT_RADIUS.xl,
    borderWidth: 1,
    borderColor: LT.outlineVariant,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: LT.outlineVariant,
  },
  linkIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(227, 18, 18, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: LT.onSurface,
    marginBottom: 2,
  },
  linkSub: {
    fontSize: 12,
    fontWeight: '500',
    color: LT.onSurfaceVariant,
  },
});
