import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '../contexts/AppContext';
import { COLORS } from '../config/constants';
import {
  SPRINTS,
  TIERS,
  getUnlockedTier,
  recommendSprint,
} from '../config/sprints';

export default function SprintSelectScreen() {
  const { startSprint, activeSprint, userProfile, sprintHistory } = useApp();

  const recommendedId = useMemo(
    () => recommendSprint(userProfile),
    [userProfile],
  );

  // Default selected tier per sprint = unlocked tier (so users default to hardest)
  const [selectedTier, setSelectedTier] = useState({});

  const tierFor = (sprintId) => {
    const unlocked = getUnlockedTier(sprintId, sprintHistory);
    return Math.min(selectedTier[sprintId] || unlocked, unlocked);
  };

  const handlePickSprint = (sprint) => {
    if (activeSprint) {
      Alert.alert(
        'Aktif sprint var',
        "Yeni bir sprint başlatmak için önce mevcut sprint'i bitir veya iptal et.",
      );
      return;
    }
    const tier = tierFor(sprint.id);
    const tierCfg = TIERS[tier];
    Alert.alert(
      `${sprint.title} ${tierCfg.label}?`,
      `${sprint.duration} gün, günde ${tierCfg.tasksPerDay} görev. Kurallar sıkı. XP: ${tierCfg.xpMultiplier}x. Hazır mısın?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Başlat',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            startSprint(sprint.id, tier);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.header}>Monk Mode</Text>
          <Text style={styles.subheader}>
            Bir sprint seç. Kuralları uy, günlük görevleri tamamla, sertifikanı
            al. Bitirdikçe zor tier'lar açılır.
          </Text>

          {SPRINTS.map((sprint) => {
            const unlockedTier = getUnlockedTier(sprint.id, sprintHistory);
            const activeTier = tierFor(sprint.id);
            const isRecommended = sprint.id === recommendedId;
            const completedCount = sprintHistory.filter(
              (h) => h?.sprintId === sprint.id && h?.status === 'completed',
            ).length;
            return (
              <TouchableOpacity
                key={sprint.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => handlePickSprint(sprint)}
              >
                <LinearGradient
                  colors={[sprint.color, '#161626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  {isRecommended && (
                    <View style={styles.recBadge}>
                      <Text style={styles.recBadgeText}>
                        ⭐ SANA ÖNERİLİYOR
                      </Text>
                    </View>
                  )}
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardIcon}>{sprint.icon}</Text>
                    <View style={styles.cardTitleBox}>
                      <Text style={styles.cardTitle}>{sprint.title}</Text>
                      <Text style={styles.cardSubtitle}>
                        {sprint.subtitle}
                      </Text>
                    </View>
                    <View style={styles.durationPill}>
                      <Text style={styles.durationText}>
                        {sprint.duration}g
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.cardDesc}>{sprint.description}</Text>

                  {/* Tier selector */}
                  <View style={styles.tierRow}>
                    {[1, 2, 3].map((t) => {
                      const cfg = TIERS[t];
                      const isLocked = t > unlockedTier;
                      const isActive = t === activeTier;
                      return (
                        <TouchableOpacity
                          key={t}
                          style={[
                            styles.tierChip,
                            isActive && styles.tierChipActive,
                            isLocked && styles.tierChipLocked,
                          ]}
                          activeOpacity={0.85}
                          disabled={isLocked}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            setSelectedTier((prev) => ({
                              ...prev,
                              [sprint.id]: t,
                            }));
                          }}
                        >
                          <Text
                            style={[
                              styles.tierChipText,
                              isActive && styles.tierChipTextActive,
                              isLocked && styles.tierChipTextLocked,
                            ]}
                          >
                            {isLocked ? '🔒 ' : cfg.badge + ' '}
                            {cfg.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.tierMeta}>
                    Günde {TIERS[activeTier].tasksPerDay} görev •{' '}
                    {TIERS[activeTier].xpMultiplier}x XP
                    {completedCount > 0 &&
                      `  •  ${completedCount}x tamamladın`}
                  </Text>

                  <Text style={styles.sectionLabel}>Kurallar</Text>
                  {sprint.rules.map((r) => (
                    <Text key={r.id} style={styles.listItem}>
                      • {r.text}
                    </Text>
                  ))}

                  <Text style={styles.sectionLabel}>
                    Görev havuzu ({sprint.taskPool?.length || 0} görev, rotasyonla)
                  </Text>
                  {(sprint.taskPool || []).slice(0, 4).map((t) => (
                    <Text key={t.id} style={styles.listItem}>
                      ✓ {t.title}{' '}
                      <Text style={styles.xpTag}>+{t.xp} XP</Text>
                    </Text>
                  ))}
                  {(sprint.taskPool || []).length > 4 && (
                    <Text style={styles.moreHint}>
                      + {sprint.taskPool.length - 4} görev daha…
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}

          <View style={styles.footerSpacer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  header: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subheader: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardGradient: {
    padding: 18,
  },
  recBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  recBadgeText: {
    color: '#0B0B14',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  cardTitleBox: { flex: 1 },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: COLORS.text,
    opacity: 0.85,
    fontSize: 13,
    marginTop: 2,
  },
  durationPill: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  durationText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },
  cardDesc: {
    color: COLORS.text,
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  tierChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tierChipActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderColor: COLORS.text,
  },
  tierChipLocked: {
    opacity: 0.45,
  },
  tierChipText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  tierChipTextActive: {
    fontWeight: '800',
  },
  tierChipTextLocked: {
    color: COLORS.textSecondary,
  },
  tierMeta: {
    color: COLORS.text,
    opacity: 0.8,
    fontSize: 12,
    marginBottom: 6,
  },
  sectionLabel: {
    color: COLORS.text,
    opacity: 0.9,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  listItem: {
    color: COLORS.text,
    opacity: 0.92,
    fontSize: 13,
    lineHeight: 20,
  },
  moreHint: {
    color: COLORS.text,
    opacity: 0.7,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  xpTag: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  footerSpacer: { height: 32 },
});
