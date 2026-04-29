import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../contexts/AppContext';
import { LEVEL_THRESHOLDS, getNextLevel, COLORS, CATEGORIES } from '../config/constants';
import { ACHIEVEMENTS, RARITY_COLORS } from '../config/achievements';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const THEME = {
  background: '#0B0B14',
  surface: '#161626',
  surfaceLight: '#1F1F33',
  text: '#F5F5FA',
  textSecondary: '#9898B0',
  primary: '#6366F1',
  accent: '#8B5CF6',
  border: '#2A2A42',
};

const getLevelTitle = (lvl) => {
  const tier = LEVEL_THRESHOLDS.find((t) => t.level === lvl);
  return tier?.title ?? 'Ascender';
};

function StatCard({ emoji, value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const {
    totalXP,
    level,
    currentStreak,
    longestStreak,
    history,
    unlockedAchievements,
  } = useApp();

  const nextLevel = useMemo(() => getNextLevel(level), [level]);
  const currentLevelThreshold =
    LEVEL_THRESHOLDS.find((t) => t.level === level)?.xpRequired ?? 0;
  const nextLevelThreshold =
    nextLevel?.xpRequired ?? currentLevelThreshold;
  const xpInCurrentLevel = totalXP - currentLevelThreshold;
  const xpNeededForNext = Math.max(
    nextLevelThreshold - currentLevelThreshold,
    1,
  );
  const progressPercent = nextLevel
    ? Math.min(Math.max((xpInCurrentLevel / xpNeededForNext) * 100, 0), 100)
    : 100;

  const recentAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id))
      .slice(-5)
      .reverse();
  }, [unlockedAchievements]);

  const categoryBreakdown = useMemo(() => {
    const counts = {};
    (history || []).forEach((entry) => {
      const cat = entry.category || 'Unknown';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const total = Object.values(counts).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(counts).map(([cat, count]) => {
      const catInfo = Array.isArray(CATEGORIES)
        ? CATEGORIES.find((c) => c.id === cat || c.name === cat)
        : CATEGORIES?.[cat];
      return {
        cat,
        count,
        percent: (count / total) * 100,
        color: catInfo?.color ?? THEME.primary,
        emoji: catInfo?.emoji ?? catInfo?.icon ?? '⚡',
      };
    });
  }, [history]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <LinearGradient
        colors={['#3730A3', '#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{level}</Text>
        </View>
        <Text style={styles.levelTitle}>{getLevelTitle(level)}</Text>
        <Text style={styles.username}>Ascender</Text>
        <View style={styles.xpPill}>
          <Text style={styles.xpPillText}>⚡ {totalXP.toLocaleString()} XP</Text>
        </View>
      </LinearGradient>

      {/* ── Stats Grid ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard emoji="⭐" value={totalXP.toLocaleString()} label="Total XP" />
          <StatCard emoji="🔥" value={currentStreak} label="Current Streak" />
          <StatCard emoji="✅" value={history?.length ?? 0} label="Actions Completed" />
          <StatCard emoji="🏆" value={longestStreak} label="Longest Streak" />
        </View>
      </View>

      {/* ── XP Progress ── */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Level Progress</Text>
          <Text style={styles.progressXpLabel}>
            {xpInCurrentLevel.toLocaleString()} / {xpNeededForNext.toLocaleString()} XP
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={[THEME.primary, THEME.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <View style={styles.progressLevelRow}>
          <Text style={styles.progressLevelLabel}>Level {level}</Text>
          {nextLevel ? (
            <Text style={styles.progressLevelLabel}>Level {level + 1}</Text>
          ) : (
            <Text style={[styles.progressLevelLabel, { color: THEME.accent }]}>
              🎉 Max Level!
            </Text>
          )}
        </View>
      </View>

      {/* ── Recent Achievements ── */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <TouchableOpacity onPress={() => navigation?.navigate('Achievements')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentAchievements.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardEmoji}>🏅</Text>
            <Text style={styles.emptyCardText}>
              Complete actions to unlock achievements!
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.achievementsRow}
          >
            {recentAchievements.map((achievement) => {
              const rarityColor =
                (RARITY_COLORS && RARITY_COLORS[achievement.rarity]) || THEME.primary;
              return (
                <View key={achievement.id} style={styles.achievementItem}>
                  <View
                    style={[styles.achievementCircle, { borderColor: rarityColor }]}
                  >
                    <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                  </View>
                  <Text style={styles.achievementTitle} numberOfLines={2}>
                    {achievement.title}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* ── Category Breakdown ── */}
      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {categoryBreakdown.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyCardText}>No actions completed yet.</Text>
          </View>
        ) : (
          categoryBreakdown.map(({ cat, count, percent, color, emoji }) => (
            <View key={cat} style={styles.categoryRow}>
              <Text style={styles.categoryEmoji}>{emoji}</Text>
              <View style={styles.categoryInfo}>
                <View style={styles.rowBetween}>
                  <Text style={styles.categoryName}>{cat}</Text>
                  <Text style={styles.categoryCount}>{count} action{count !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.categoryBarTrack}>
                  <View
                    style={[
                      styles.categoryBarFill,
                      { width: `${percent}%`, backgroundColor: color },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  content: {
    paddingBottom: 48,
  },

  // ── Header ──
  header: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  levelBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  levelNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  username: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 14,
  },
  xpPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 18,
  },
  xpPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // ── Shared ──
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  lastSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  // ── Stats Grid ──
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: CARD_WIDTH,
    backgroundColor: THEME.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 22,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
  },

  // ── XP Progress ──
  progressXpLabel: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  progressTrack: {
    height: 12,
    backgroundColor: THEME.surfaceLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    minWidth: 8,
  },
  progressLevelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  progressLevelLabel: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '500',
  },

  // ── Achievements ──
  seeAllText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsRow: {
    gap: 14,
    paddingBottom: 4,
  },
  achievementItem: {
    alignItems: 'center',
    width: 72,
  },
  achievementCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: THEME.surfaceLight,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementTitle: {
    fontSize: 10,
    color: THEME.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 13,
  },
  emptyCard: {
    backgroundColor: THEME.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
  },
  emptyCardEmoji: {
    fontSize: 36,
  },
  emptyCardText: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ── Category Breakdown ──
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 22,
    width: 36,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  categoryCount: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  categoryBarTrack: {
    height: 6,
    backgroundColor: THEME.surfaceLight,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 4,
  },
});
