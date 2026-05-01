import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import { LEVEL_THRESHOLDS, getNextLevel } from '../config/constants';
import { ACHIEVEMENTS } from '../config/achievements';
import { getRank, getNextRank } from '../config/ranks';
import { useAuth } from '../contexts/AuthContext';
import StreakCalendar from '../components/StreakCalendar';
import AchievementDetailModal from '../components/AchievementDetailModal';
import StreakShareCard from '../components/StreakShareCard';
import { captureAndShare } from '../services/streakShare';

const { width } = Dimensions.get('window');

const getLevelTitle = (lvl) => {
  const tier = LEVEL_THRESHOLDS.find((t) => t.level === lvl);
  return tier?.title ?? 'Ascender';
};

// Achievement icon mapping (Material symbols)
const ACHIEVEMENT_ICONS = {
  streak3: 'local-fire-department',
  streak7: 'local-fire-department',
  streak14: 'local-fire-department',
  streak30: 'workspace-premium',
  streak100: 'military-tech',
  streak365: 'emoji-events',
  lessons10: 'menu-book',
  lessons30: 'auto-stories',
  lessons100: 'school',
  lessons250: 'psychology',
  level2: 'trending-up',
  level5: 'star',
  level8: 'rocket-launch',
};

const ACHIEVEMENT_COLORS = {
  streak3: '#FFB783',
  streak7: '#FFB783',
  streak14: '#FFB783',
  streak30: '#FDE047',
  streak100: '#FDE047',
  streak365: '#FDE047',
  lessons10: '#C0C1FF',
  lessons30: '#C0C1FF',
  lessons100: '#D0BCFF',
  lessons250: '#D0BCFF',
  level2: '#10B981',
  level5: '#10B981',
  level8: '#FDE047',
};

function CircularProgress({ size = 128, strokeWidth = 4, percent = 0, color = '#C0C1FF' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#34343D"
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${size / 2}, ${size / 2}`}
      />
    </Svg>
  );
}

function StatCard({ icon, iconColor, label, value, unit }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <MaterialIcons name={icon} size={16} color={iconColor} />
        <Text style={[styles.statLabel, { color: iconColor + 'CC' }]}>{label}</Text>
      </View>
      <View style={styles.statValueRow}>
        <Text style={styles.statValue}>{value}</Text>
        {unit ? <Text style={styles.statUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

function AchievementCard({ id, locked, onPress }) {
  const icon = ACHIEVEMENT_ICONS[id] || 'emoji-events';
  const color = ACHIEVEMENT_COLORS[id] || '#C0C1FF';
  const ach = ACHIEVEMENTS.find((a) => a.id === id);
  const title = ach?.title || id;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.achievementCard,
        locked && { opacity: 0.3 },
      ]}
    >
      <View
        style={[
          styles.achievementIconBox,
          { borderColor: locked ? '#908FA0' : color, backgroundColor: locked ? '#292932' : `${color}1A` },
        ]}
      >
        <MaterialIcons
          name={locked ? 'lock' : icon}
          size={26}
          color={locked ? '#908FA0' : color}
        />
      </View>
      <Text style={styles.achievementTitle} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    totalXP,
    level,
    currentStreak,
    longestStreak,
    pathProgress,
    unlockedAchievements,
    lessonHistory,
  } = useApp();
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef(null);

  const completedLessonsTotal = useMemo(() => {
    return Object.values(pathProgress || {}).reduce(
      (sum, p) => sum + (p?.completed?.length || 0),
      0,
    );
  }, [pathProgress]);

  const completedPaths = useMemo(() => {
    return Object.values(pathProgress || {}).filter(
      (p) => (p?.completed?.length || 0) >= 30,
    ).length;
  }, [pathProgress]);

  const rank = useMemo(() => getRank(completedPaths), [completedPaths]);
  const nextRank = useMemo(() => getNextRank(completedPaths), [completedPaths]);

  const nextLevel = useMemo(() => getNextLevel(level), [level]);
  const currentLevelThreshold =
    LEVEL_THRESHOLDS.find((t) => t.level === level)?.xpRequired ?? 0;
  const nextLevelThreshold = nextLevel?.xpRequired ?? currentLevelThreshold;
  const xpInLevel = totalXP - currentLevelThreshold;
  const xpForNext = Math.max(1, nextLevelThreshold - currentLevelThreshold);
  const levelPercent = Math.min(100, Math.round((xpInLevel / xpForNext) * 100));

  // Show 4 achievements: 3 unlocked + 1 locked, or padding
  const recentAchievements = useMemo(() => {
    const unlocked = (unlockedAchievements || []).slice(0, 3);
    const lockedCandidates = ACHIEVEMENTS.filter(
      (a) => !unlocked.includes(a.id),
    ).slice(0, 4 - unlocked.length);
    return [
      ...unlocked.map((id) => ({ id, locked: false })),
      ...lockedCandidates.map((a) => ({ id: a.id, locked: true })),
    ];
  }, [unlockedAchievements]);

  const username = user?.email?.split('@')[0] || 'StoicMonk';

  const handleShareStreak = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const message =
        currentStreak > 0
          ? t('share.streakActive', '{{streak}} gün — monk mode sürüyor 🔥', {
              streak: currentStreak,
            })
          : t('share.streakStart', 'Monk mode başlatıyorum 🔥');
      // Tiny delay so the off-screen card has a chance to layout
      await new Promise((r) => setTimeout(r, 60));
      const ok = await captureAndShare({
        viewRef: shareCardRef,
        message,
      });
      if (!ok) {
        Alert.alert(
          t('share.failedTitle', 'Paylaşılamadı'),
          t('share.failedBody', 'Bir sorun oluştu, tekrar dene.'),
        );
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.menuBtn}
          >
            <MaterialIcons name="menu" size={22} color="#C0C1FF" />
          </TouchableOpacity>
          <Text style={styles.brandTitle}>MONK MODE</Text>
          <TouchableOpacity
            onPress={handleShareStreak}
            disabled={sharing}
            style={styles.menuBtn}
            accessibilityLabel={t('share.streakAria', 'Streak paylaş')}
          >
            <MaterialIcons
              name="ios-share"
              size={22}
              color={sharing ? '#5B5B70' : '#C0C1FF'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero profile */}
          <View style={styles.hero}>
            <View style={styles.avatarOuter}>
              <CircularProgress size={128} percent={levelPercent} color="#C0C1FF" />
              <View style={styles.avatarInner}>
                <MaterialIcons name="self-improvement" size={48} color="#C0C1FF" />
              </View>
            </View>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{rank.title.toUpperCase()}</Text>
            </View>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.usernameSub}>
              {t('profile.subtitle', 'YOLUN BAŞINDA')}
            </Text>
          </View>

          {/* Stats grid 2x2 */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="bolt"
              iconColor="#C0C1FF"
              label={t('profile.totalXp', 'TOPLAM XP')}
              value={totalXP.toLocaleString()}
            />
            <StatCard
              icon="local-fire-department"
              iconColor="#FFB783"
              label={t('profile.currentStreak', 'MEVCUT SERİ')}
              value={currentStreak}
              unit={t('common.days', 'Gün')}
            />
            <StatCard
              icon="menu-book"
              iconColor="#D0BCFF"
              label={t('profile.lessonsDone', 'TAMAMLANAN')}
              value={completedLessonsTotal}
              unit={t('common.lessons', 'Ders')}
            />
            <StatCard
              icon="military-tech"
              iconColor="#908FA0"
              label={t('profile.longestStreak', 'EN UZUN SERİ')}
              value={longestStreak || 0}
              unit={t('common.days', 'Gün')}
            />
          </View>

          {/* Level progress card */}
          <View style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View>
                <Text style={styles.levelLabel}>
                  {t('profile.level', 'SEVİYE')} {level}
                </Text>
                <Text style={styles.levelTitle}>"{getLevelTitle(level)}"</Text>
              </View>
              <Text style={styles.levelXP}>
                <Text style={styles.levelXPNum}>{xpInLevel}</Text>
                <Text style={styles.levelXPMax}> / {xpForNext} XP</Text>
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${levelPercent}%` }]} />
            </View>
            {nextRank ? (
              <View style={styles.nextRankPill}>
                <MaterialIcons name="trending-up" size={12} color="#C0C1FF" />
                <Text style={styles.nextRankText}>
                  {t('profile.nextRank', 'SONRAKİ RÜTBE')}:{' '}
                  <Text style={{ color: '#C0C1FF' }}>{nextRank.title}</Text>
                </Text>
              </View>
            ) : null}
          </View>

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t('profile.achievements', 'Başarımlar')}
              </Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.seeAll}>
                <Text style={styles.seeAllText}>
                  {t('profile.seeAll', 'TÜMÜNÜ GÖR')}
                </Text>
                <MaterialIcons name="chevron-right" size={16} color="#C0C1FF" />
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.achievementsRow}
            >
              {recentAchievements.map((a, i) => (
                <AchievementCard
                  key={i}
                  id={a.id}
                  locked={a.locked}
                  onPress={() => {
                    setSelectedAchievement(a);
                  }}
                />
              ))}
            </ScrollView>
          </View>

          {/* Streak Calendar */}
          <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <StreakCalendar lessonHistory={lessonHistory || {}} />
          </View>

          {/* Reflections link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Reflections')}
            activeOpacity={0.7}
            style={styles.linkCard}
          >
            <View style={styles.linkIconBox}>
              <MaterialIcons name="auto-stories" size={22} color="#C0C1FF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>
                {t('profile.reflectionsLink', 'Yansımalarım')}
              </Text>
              <Text style={styles.linkSubtitle}>
                {t('profile.reflectionsLinkSub', 'Geçmiş ders yansımaların')}
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#908FA0" />
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>

        <AchievementDetailModal
          visible={!!selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          achievementId={selectedAchievement?.id}
          unlocked={selectedAchievement && !selectedAchievement.locked}
        />

        {/* Off-screen card used for streak share image capture */}
        <View pointerEvents="none" style={styles.shareCardOffscreen}>
          <StreakShareCard
            ref={shareCardRef}
            streak={currentStreak || 0}
            longestStreak={longestStreak || 0}
            lessonsCompleted={completedLessonsTotal || 0}
            title={t('share.title', 'Monk Mode 🔥')}
            subtitle={t('profile.shareSubtitle', 'Disiplin. Odak. Tekrar.')}
            streakLabel={t('profile.shareStreakLabel', 'GÜN')}
            longestLabel={t('profile.shareLongestLabel', 'EN UZUN')}
            lessonsLabel={t('profile.shareLessonsLabel', 'DERS')}
            appLabel="Ascend"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1, backgroundColor: '#0B0B14' },

  // Card lives below the visible viewport so it can still be measured & captured
  // (opacity 0 would render the snapshot transparent, so we keep it visible-but-offscreen)
  shareCardOffscreen: {
    position: 'absolute',
    top: 10000,
    left: 0,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#34343D',
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#C0C1FF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },

  scroll: { paddingBottom: 32 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarOuter: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#C0C1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
  },
  avatarInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#292932',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    position: 'absolute',
    top: 144,
    backgroundColor: '#D97721',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#0B0B14',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  rankBadgeText: {
    color: '#452000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  username: {
    color: '#E4E1ED',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 16,
  },
  usernameSub: {
    color: '#C7C4D7',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
  },
  statCard: {
    width: '48%',
    minHeight: 90,
    backgroundColor: 'rgba(31, 31, 39, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(144, 143, 160, 0.15)',
    borderRadius: 14,
    padding: 14,
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
  },
  statValue: {
    color: '#E4E1ED',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  statUnit: {
    color: '#9898B0',
    fontSize: 12,
    fontWeight: '600',
  },

  // Level
  levelCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: 'rgba(31, 31, 39, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(144, 143, 160, 0.15)',
    borderRadius: 14,
    padding: 16,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  levelLabel: {
    color: '#C0C1FF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  levelTitle: {
    color: '#E4E1ED',
    fontSize: 15,
    fontWeight: '700',
    fontStyle: 'italic',
  },
  levelXP: {
    color: '#C7C4D7',
  },
  levelXPNum: {
    color: '#E4E1ED',
    fontSize: 15,
    fontWeight: '800',
  },
  levelXPMax: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#34343D',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#C0C1FF',
    borderRadius: 4,
    shadowColor: '#C0C1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  nextRankPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: '#1B1B23',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.6)',
  },
  nextRankText: {
    color: '#C7C4D7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Achievements
  achievementsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#E4E1ED',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    color: '#C0C1FF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  achievementsRow: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  achievementCard: {
    width: 112,
    backgroundColor: 'rgba(31, 31, 39, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(144, 143, 160, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  achievementIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  achievementTitle: {
    color: '#E4E1ED',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
    textTransform: 'uppercase',
    lineHeight: 12,
  },

  // Link card (used for Reflections + future shortcuts)
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(31, 31, 39, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.5)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 16,
  },
  linkIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 193, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(192, 193, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkTitle: {
    color: '#E4E1ED',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  linkSubtitle: {
    color: '#908FA0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
