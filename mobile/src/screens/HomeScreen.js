import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '../contexts/AppContext';
import { COLORS } from '../config/constants';
import { getDailyAction } from '../data/actions';
import ActionCard from '../components/ActionCard';
import LevelUpModal from '../components/LevelUpModal';
import AchievementUnlockModal from '../components/AchievementUnlockModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// XP thresholds per level (cumulative XP needed to reach that level)
const LEVEL_LABELS = [
  'Beginner',
  'Seeker',
  'Dedicated',
  'Committed',
  'Focused',
  'Advanced',
  'Expert',
  'Master',
  'Champion',
  'Legend',
];

const XP_PER_LEVEL = 200;

function getLevelInfo(totalXP) {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const label = LEVEL_LABELS[Math.min(level - 1, LEVEL_LABELS.length - 1)];
  return { level, currentLevelXP, xpForNextLevel: XP_PER_LEVEL, label };
}

function isSameDay(dateA, dateB) {
  if (!dateA || !dateB) return false;
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function HomeScreen() {
  const {
    user,
    completeAction,
    selectedCategories,
    difficulty,
  } = useApp();

  const [todayAction, setTodayAction] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Modal state
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achievementData, setAchievementData] = useState(null);

  useEffect(() => {
    const action = getDailyAction(selectedCategories, difficulty);
    setTodayAction(action);
  }, [selectedCategories, difficulty]);

  const isCompletedToday = isSameDay(user?.lastCompletedDate, new Date());

  const totalXP = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const longestStreak = user?.longestStreak ?? 0;

  const { level, currentLevelXP, xpForNextLevel, label: levelLabel } =
    getLevelInfo(totalXP);

  const xpProgress = xpForNextLevel > 0 ? currentLevelXP / xpForNextLevel : 0;
  const xpProgressClamped = Math.min(Math.max(xpProgress, 0), 1);

  const handleCompleteAction = async () => {
    if (isCompletedToday || isCompleting || !todayAction) return;

    setIsCompleting(true);

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await completeAction(todayAction);

      if (result?.levelUp) {
        setLevelUpData(result.levelUp);
        setShowLevelUpModal(true);
      } else if (result?.newAchievements && result.newAchievements.length > 0) {
        setAchievementData(result.newAchievements[0]);
        setShowAchievementModal(true);
      }
    } catch (error) {
      console.error('Failed to complete action:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header / Level Badge ── */}
          <View style={styles.header}>
            <View style={styles.levelBadge}>
              <LinearGradient
                colors={[COLORS.primary || '#6366F1', COLORS.accent || '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.levelBadgeGradient}
              >
                <Text style={styles.levelBadgeText}>Level {level}</Text>
              </LinearGradient>
            </View>
            <Text style={styles.levelTitle}>
              {levelLabel}
            </Text>
          </View>

          {/* ── XP Progress Bar ── */}
          <View style={styles.xpCard}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLabel}>XP Progress</Text>
              <Text style={styles.xpNumbers}>
                {currentLevelXP} / {xpForNextLevel} XP
              </Text>
            </View>
            <View style={styles.xpBarTrack}>
              <LinearGradient
                colors={[COLORS.primary || '#6366F1', COLORS.accent || '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.xpBarFill,
                  { width: `${Math.round(xpProgressClamped * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.xpPercent}>
              {Math.round(xpProgressClamped * 100)}% to Level {level + 1}
            </Text>
          </View>

          {/* ── Streak Card ── */}
          <LinearGradient
            colors={['#7C2D12', '#C2410C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <View style={styles.streakMain}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <View style={styles.streakInfo}>
                <View style={styles.streakRow}>
                  <Text style={styles.streakNumber}>{streak}</Text>
                  <Text style={styles.streakLabel}> day streak</Text>
                </View>
                <Text style={styles.longestStreak}>
                  Longest: {longestStreak} days
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* ── Today's Action ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Action</Text>
            {isCompletedToday && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>✓ Done</Text>
              </View>
            )}
          </View>

          {todayAction ? (
            <View style={styles.actionCardWrapper}>
              <ActionCard action={todayAction} />
              {isCompletedToday && (
                <View style={styles.completedOverlay}>
                  <Text style={styles.completedOverlayCheck}>✓</Text>
                  <Text style={styles.completedOverlayText}>Completed!</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noActionCard}>
              <Text style={styles.noActionText}>
                No action available. Select a category to get started!
              </Text>
            </View>
          )}

          {/* ── Complete Action Button ── */}
          <TouchableOpacity
            onPress={handleCompleteAction}
            activeOpacity={isCompletedToday || isCompleting ? 1 : 0.85}
            disabled={isCompletedToday || isCompleting || !todayAction}
            style={styles.completeButtonOuter}
          >
            <LinearGradient
              colors={
                isCompletedToday || isCompleting
                  ? ['#2a2a3a', '#2a2a3a']
                  : [COLORS.primary || '#6366F1', COLORS.accent || '#8B5CF6']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.completeButton,
                (isCompletedToday || isCompleting) &&
                  styles.completeButtonDisabled,
              ]}
            >
              <Text style={styles.completeButtonText}>
                {isCompletedToday
                  ? '✓  Action Completed'
                  : isCompleting
                  ? 'Completing...'
                  : 'Complete Action'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Bottom spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </LinearGradient>

      {/* ── Modals ── */}
      <LevelUpModal
        visible={showLevelUpModal}
        levelData={levelUpData}
        onClose={() => {
          setShowLevelUpModal(false);
          setLevelUpData(null);
          // Show achievement modal afterwards if any was queued
        }}
      />
      <AchievementUnlockModal
        visible={showAchievementModal}
        achievement={achievementData}
        onClose={() => {
          setShowAchievementModal(false);
          setAchievementData(null);
        }}
      />
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
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  // Header / Level Badge
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  levelBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 8,
  },
  levelBadgeGradient: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelBadgeText: {
    color: '#F5F5FA',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  levelTitle: {
    color: '#F5F5FA',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // XP Card
  xpCard: {
    backgroundColor: '#161626',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpLabel: {
    color: '#F5F5FA',
    fontSize: 15,
    fontWeight: '600',
  },
  xpNumbers: {
    color: '#9B9BB0',
    fontSize: 13,
    fontWeight: '500',
  },
  xpBarTrack: {
    height: 10,
    backgroundColor: '#2a2a3a',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  xpPercent: {
    color: '#9B9BB0',
    fontSize: 12,
    textAlign: 'right',
  },

  // Streak Card
  streakCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 42,
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  streakNumber: {
    color: '#F5F5FA',
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  streakLabel: {
    color: '#FED7AA',
    fontSize: 18,
    fontWeight: '600',
  },
  longestStreak: {
    color: '#FCA07A',
    fontSize: 13,
    marginTop: 4,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F5F5FA',
    fontSize: 18,
    fontWeight: '700',
  },
  completedBadge: {
    backgroundColor: '#14532D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '600',
  },

  // Action Card Wrapper (for overlay)
  actionCardWrapper: {
    marginBottom: 20,
    position: 'relative',
  },
  completedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 11, 20, 0.72)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedOverlayCheck: {
    fontSize: 48,
    color: '#86EFAC',
  },
  completedOverlayText: {
    color: '#86EFAC',
    fontSize: 20,
    fontWeight: '700',
  },

  // No Action fallback
  noActionCard: {
    backgroundColor: '#161626',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  noActionText: {
    color: '#9B9BB0',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Complete Button
  completeButtonOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  completeButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#F5F5FA',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  bottomSpacer: {
    height: 32,
  },
});
