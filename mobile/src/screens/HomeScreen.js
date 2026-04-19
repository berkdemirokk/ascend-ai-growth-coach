import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useApp } from '../contexts/AppContext';
import { COLORS } from '../config/constants';
import { getSprintById, getTierConfig } from '../config/sprints';
import { shouldShowAd, showInterstitial } from '../services/ads';
import SprintSelectScreen from './SprintSelectScreen';
import LevelUpModal from '../components/LevelUpModal';

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    activeSprint,
    currentSprintDay,
    sprintFinished,
    todaySprintTaskIds,
    todaysTasks,
    totalXP,
    level,
    isPremium,
    dailyChallenge,
    dailyChallengeClaimed,
    completeSprintTask,
    recordSprintViolation,
    abandonSprint,
    completeSprint,
    claimDailyChallenge,
    maintenance,
    maintenanceTasks,
    maintenanceCompletionsToday,
    completeMaintenanceTask,
    stopMaintenance,
  } = useApp();

  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  // No active sprint and no maintenance → show select screen (maintenance
  // route only takes over when there's no active sprint)
  if (!activeSprint && !maintenance) {
    return <SprintSelectScreen />;
  }

  // Maintenance mode view (shown after sprint completion)
  if (!activeSprint && maintenance) {
    const mSprint = getSprintById(maintenance.sprintId);
    const doneSet = new Set(maintenanceCompletionsToday);
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <LinearGradient
              colors={[mSprint?.color || COLORS.primary, '#161626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerCard}
            >
              <View style={styles.headerTopRow}>
                <Text style={styles.headerIcon}>{mSprint?.icon || '🔥'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle}>
                    {mSprint?.title} — Maintenance
                  </Text>
                  <Text style={styles.headerSubtitle}>
                    Kazandığın alışkanlıkları kaybetme
                  </Text>
                </View>
              </View>
              <Text style={styles.metaRow}>
                Level {level} · {totalXP} XP
              </Text>
            </LinearGradient>

            {/* Daily challenge — also in maintenance */}
            {dailyChallenge && (
              <ChallengeCard
                challenge={dailyChallenge}
                claimed={dailyChallengeClaimed}
                onClaim={async () => {
                  await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  claimDailyChallenge();
                }}
              />
            )}

            <Text style={styles.sectionTitle}>Bakım Görevleri</Text>
            <Text style={styles.sectionHint}>
              Hafif tempo, alışkanlığı koru. Her an yeni sprint başlatabilirsin.
            </Text>
            {maintenanceTasks.map((task) => {
              const done = doneSet.has(task.id);
              return (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskCard, done && styles.taskCardDone]}
                  activeOpacity={done ? 1 : 0.8}
                  disabled={done}
                  onPress={async () => {
                    await Haptics.notificationAsync(
                      Haptics.NotificationFeedbackType.Success,
                    );
                    completeMaintenanceTask(task.id);
                  }}
                >
                  <View style={[styles.checkbox, done && styles.checkboxDone]}>
                    {done && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={[styles.taskText, done && styles.taskTextDone]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskXP}>+{task.xp}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.newSprintBtn}
              activeOpacity={0.85}
              onPress={() => stopMaintenance()}
            >
              <Text style={styles.newSprintText}>Yeni Sprint Seç</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const sprint = getSprintById(activeSprint.sprintId);
  if (!sprint) {
    return <SprintSelectScreen />;
  }

  const tier = activeSprint.tier || 1;
  const tierCfg = getTierConfig(tier);

  const completedTaskIds = new Set(todaySprintTaskIds);
  const todayTasksDone = todaysTasks.every((t) => completedTaskIds.has(t.id));
  const progress = Math.min(currentSprintDay / sprint.duration, 1);

  const handleTaskTap = async (task) => {
    if (completedTaskIds.has(task.id)) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const result = completeSprintTask(task.id);
    if (result?.newLevel) {
      setLevelUpData({ level: result.newLevel });
      setShowLevelUpModal(true);
    }
    if (shouldShowAd(isPremium)) {
      showInterstitial().catch(() => {});
    }
  };

  const handleRuleViolation = (rule) => {
    Alert.alert(
      'Kuralı kırdın mı?',
      `"${rule.text}" — bunu kabul etmek kolay değil ama dürüstlük seni büyütür.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Evet, kırdım',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning,
            );
            recordSprintViolation(rule.id);
          },
        },
      ],
    );
  };

  const handleAbandon = () => {
    Alert.alert(
      "Sprint'i bırak?",
      'Vazgeçersen ilerleme tarihine geçer, ama sertifika alamazsın.',
      [
        { text: 'Devam et', style: 'cancel' },
        {
          text: 'Bırak',
          style: 'destructive',
          onPress: () => abandonSprint(),
        },
      ],
    );
  };

  const handleClaim = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const res = completeSprint();
    if (res) {
      navigation.navigate('SprintComplete', {
        sprintTitle: sprint.title,
        sprintDuration: sprint.duration,
        bonusXP: res.bonusXP,
        completedAt: new Date().toISOString(),
        tier: res.tier,
      });
    }
  };

  const violationsToday = (activeSprint.violations || []).filter((v) => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return v.date === `${y}-${m}-${d}`;
  }).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Sprint header */}
          <LinearGradient
            colors={[sprint.color, '#161626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.headerTopRow}>
              <Text style={styles.headerIcon}>{sprint.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{sprint.title}</Text>
                <Text style={styles.headerSubtitle}>{sprint.subtitle}</Text>
              </View>
              <View style={styles.tierBadge}>
                <Text style={styles.tierBadgeText}>
                  {tierCfg.badge} {tierCfg.label}
                </Text>
              </View>
            </View>

            <View style={styles.dayRow}>
              <Text style={styles.dayBig}>Gün {currentSprintDay}</Text>
              <Text style={styles.dayTotal}>/ {sprint.duration}</Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.round(progress * 100)}%` },
                ]}
              />
            </View>

            <Text style={styles.metaRow}>
              Level {level} · {totalXP} XP · {tierCfg.xpMultiplier}x
            </Text>
          </LinearGradient>

          {/* Daily challenge */}
          {dailyChallenge && (
            <ChallengeCard
              challenge={dailyChallenge}
              claimed={dailyChallengeClaimed}
              onClaim={async () => {
                await Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success,
                );
                claimDailyChallenge();
              }}
            />
          )}

          {/* Claim banner if finished */}
          {sprintFinished && !todayTasksDone && (
            <View style={styles.infoBanner}>
              <Text style={styles.infoText}>
                Son gün! Bugünün görevlerini bitir ve sertifikanı al.
              </Text>
            </View>
          )}
          {sprintFinished && (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={handleClaim}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[COLORS.gold, '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.claimGradient}
              >
                <Text style={styles.claimText}>🏆 Sertifikayı Al</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Today's tasks (rotating from pool) */}
          <Text style={styles.sectionTitle}>Bugünün Görevleri</Text>
          <Text style={styles.sectionHint}>
            Her gün farklı görevler — monoton değil.
          </Text>
          {todaysTasks.map((task) => {
            const done = completedTaskIds.has(task.id);
            return (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, done && styles.taskCardDone]}
                activeOpacity={done ? 1 : 0.8}
                onPress={() => handleTaskTap(task)}
                disabled={done}
              >
                <View style={[styles.checkbox, done && styles.checkboxDone]}>
                  {done && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.taskText, done && styles.taskTextDone]}>
                  {task.title}
                </Text>
                <Text style={styles.taskXP}>+{task.xp}</Text>
              </TouchableOpacity>
            );
          })}

          {/* Rules */}
          <Text style={styles.sectionTitle}>Kurallar</Text>
          <Text style={styles.sectionHint}>
            Kuralları kırarsan dürüst ol — hesabı kendine ver.
          </Text>
          {sprint.rules.map((rule) => (
            <TouchableOpacity
              key={rule.id}
              style={styles.ruleCard}
              activeOpacity={0.8}
              onPress={() => handleRuleViolation(rule)}
            >
              <Text style={styles.ruleEmoji}>⚠️</Text>
              <Text style={styles.ruleText}>{rule.text}</Text>
            </TouchableOpacity>
          ))}

          {violationsToday > 0 && (
            <View style={styles.warnBanner}>
              <Text style={styles.warnText}>
                Bugün {violationsToday} kuralı kırdın. Yarın daha iyi ol.
              </Text>
            </View>
          )}

          {/* Abandon */}
          <TouchableOpacity
            onPress={handleAbandon}
            style={styles.abandonBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.abandonText}>Sprint'i bırak</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>

      <LevelUpModal
        visible={showLevelUpModal}
        level={levelUpData?.level}
        title={levelUpData?.title}
        onClose={() => {
          setShowLevelUpModal(false);
          setLevelUpData(null);
        }}
      />
    </SafeAreaView>
  );
}

function ChallengeCard({ challenge, claimed, onClaim }) {
  return (
    <View style={styles.challengeCard}>
      <LinearGradient
        colors={['#FBBF24', '#D97706']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.challengeGradient}
      >
        <View style={styles.challengeTopRow}>
          <Text style={styles.challengeLabel}>🎯 BUGÜNÜN CHALLENGE'I</Text>
          <Text style={styles.challengeXP}>+{challenge.xp} XP</Text>
        </View>
        <View style={styles.challengeBody}>
          <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
        </View>
        <TouchableOpacity
          style={[styles.challengeBtn, claimed && styles.challengeBtnClaimed]}
          activeOpacity={claimed ? 1 : 0.85}
          disabled={claimed}
          onPress={onClaim}
        >
          <Text style={styles.challengeBtnText}>
            {claimed ? '✓ Tamamlandı' : 'Tamamladım'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  headerCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerIcon: { fontSize: 42, marginRight: 12 },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: COLORS.text,
    opacity: 0.85,
    fontSize: 13,
    marginTop: 2,
  },
  tierBadge: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tierBadgeText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 12,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  dayBig: {
    color: COLORS.text,
    fontSize: 42,
    fontWeight: '800',
    lineHeight: 46,
  },
  dayTotal: {
    color: COLORS.text,
    opacity: 0.75,
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.text,
    borderRadius: 4,
  },
  metaRow: {
    color: COLORS.text,
    opacity: 0.85,
    fontSize: 13,
    fontWeight: '600',
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 4,
  },
  sectionHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },

  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCardDone: {
    backgroundColor: '#0F2B1F',
    opacity: 0.85,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 16,
  },
  taskText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
  taskTextDone: {
    color: '#86EFAC',
    textDecorationLine: 'line-through',
  },
  taskXP: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 8,
  },

  ruleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ruleEmoji: { fontSize: 18, marginRight: 10 },
  ruleText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },

  infoBanner: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoText: { color: COLORS.text, fontSize: 14 },

  warnBanner: {
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  warnText: { color: COLORS.text, fontSize: 13 },

  claimButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  claimGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  claimText: {
    color: '#0B0B14',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  abandonBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  abandonText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },

  // Challenge card
  challengeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  challengeGradient: {
    padding: 16,
  },
  challengeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeLabel: {
    color: '#0B0B14',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  challengeXP: {
    color: '#0B0B14',
    fontWeight: '800',
    fontSize: 13,
  },
  challengeBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  challengeTitle: {
    flex: 1,
    color: '#0B0B14',
    fontSize: 16,
    fontWeight: '700',
  },
  challengeBtn: {
    backgroundColor: '#0B0B14',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  challengeBtnClaimed: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  challengeBtnText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
  },

  newSprintBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  newSprintText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
  },
});
