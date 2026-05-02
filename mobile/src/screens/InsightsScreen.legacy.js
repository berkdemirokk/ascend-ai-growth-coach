// InsightsScreen — analytics & stats dashboard.
// Shows: 7-day activity heatmap, quiz accuracy, time-of-day pattern,
// path progress visualization, key milestones.

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { useApp } from '../contexts/AppContext';
import { PATHS } from '../data/paths';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function InsightsScreen({ navigation }) {
  const { t } = useTranslation();
  const {
    pathProgress,
    totalXP,
    currentStreak,
    longestStreak,
    level,
    isPremium,
  } = useApp();

  // ─── Stats compute ───
  const stats = useMemo(() => {
    let totalLessons = 0;
    let totalQuizCorrect = 0;
    let totalQuizQuestions = 0;
    const pathStats = [];

    for (const path of PATHS) {
      const prog = pathProgress?.[path.id];
      const completed = prog?.completed?.length || 0;
      const quizCorrect = prog?.quizCorrect || {};
      const correctSum = Object.values(quizCorrect).reduce(
        (s, n) => s + (n || 0),
        0,
      );
      // Estimate questions per lesson = 2
      const questionsTotal = completed * 2;
      totalLessons += completed;
      totalQuizCorrect += correctSum;
      totalQuizQuestions += questionsTotal;
      pathStats.push({
        path,
        completed,
        total: path.duration,
        percent: Math.round((completed / path.duration) * 100),
        correctRate:
          questionsTotal > 0
            ? Math.round((correctSum / questionsTotal) * 100)
            : 0,
      });
    }

    const accuracy =
      totalQuizQuestions > 0
        ? Math.round((totalQuizCorrect / totalQuizQuestions) * 100)
        : 0;

    return {
      totalLessons,
      totalQuizCorrect,
      totalQuizQuestions,
      accuracy,
      pathStats,
    };
  }, [pathProgress]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.topLeft}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <MaterialIcons name="bar-chart" size={16} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.brandTitle}>
              {t('insights.title', 'İSTATİSTİK')}
            </Text>
          </View>
          {!isPremium && (
            <TouchableOpacity
              onPress={() => navigation.navigate('Paywall')}
              style={styles.premiumPill}
              activeOpacity={0.7}
            >
              <MaterialIcons name="lock" size={12} color="#FFB783" />
              <Text style={styles.premiumPillText}>PREMIUM</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Big stat row */}
          <View style={styles.bigStatRow}>
            <BigStat
              icon="bolt"
              iconColor="#A5B4FC"
              value={totalXP.toLocaleString()}
              label="XP"
            />
            <BigStat
              icon="local-fire-department"
              iconColor="#F59E0B"
              value={currentStreak}
              label={t('insights.currentStreak', 'SERİ')}
            />
            <BigStat
              icon="emoji-events"
              iconColor="#FFB783"
              value={level}
              label={t('insights.level', 'SEVİYE')}
            />
          </View>

          {/* Quiz accuracy card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconBox}>
                <MaterialIcons name="quiz" size={20} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {t('insights.quizAccuracy', 'Quiz Doğruluk')}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {stats.totalQuizCorrect} / {stats.totalQuizQuestions}{' '}
                  {t('insights.correct', 'doğru')}
                </Text>
              </View>
              <Text style={styles.cardBigValue}>
                {stats.accuracy}
                <Text style={styles.cardPercent}>%</Text>
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.max(stats.accuracy, 2)}%`,
                    backgroundColor: '#10B981',
                  },
                ]}
              />
            </View>
            <Text style={styles.cardFooter}>
              {stats.accuracy >= 80
                ? t('insights.accuracyGreat', 'Mükemmel! Devam et.')
                : stats.accuracy >= 60
                  ? t('insights.accuracyGood', 'İyi gidiyorsun.')
                  : stats.accuracy >= 30
                    ? t(
                        'insights.accuracyOk',
                        'Daha dikkatli oku, sonuç gelir.',
                      )
                    : t(
                        'insights.accuracyNew',
                        'Quiz çözmeye yeni başladın.',
                      )}
            </Text>
          </View>

          {/* Path progress card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconBox,
                  { backgroundColor: 'rgba(192, 193, 255, 0.12)', borderColor: 'rgba(192, 193, 255, 0.3)' },
                ]}
              >
                <MaterialIcons
                  name="auto-awesome"
                  size={20}
                  color="#C0C1FF"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>
                  {t('insights.pathProgress', 'Yol İlerlemesi')}
                </Text>
                <Text style={styles.cardSubtitle}>
                  {stats.totalLessons} {t('insights.lessonsTotal', 'toplam ders')}
                </Text>
              </View>
            </View>
            <View style={styles.pathList}>
              {stats.pathStats.map((s) => (
                <PathProgressRow key={s.path.id} stat={s} t={t} />
              ))}
            </View>
          </View>

          {/* Records card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardIconBox,
                  { backgroundColor: 'rgba(255, 183, 131, 0.12)', borderColor: 'rgba(255, 183, 131, 0.3)' },
                ]}
              >
                <MaterialIcons name="military-tech" size={20} color="#FFB783" />
              </View>
              <Text style={[styles.cardTitle, { flex: 1 }]}>
                {t('insights.records', 'Rekorlar')}
              </Text>
            </View>
            <View style={styles.recordsGrid}>
              <RecordItem
                label={t('insights.longestStreak', 'En uzun seri')}
                value={`${longestStreak || 0}`}
                unit={t('common.days', 'gün')}
                icon="local-fire-department"
                color="#FFB783"
              />
              <RecordItem
                label={t('insights.lessonsTotal', 'Toplam ders')}
                value={`${stats.totalLessons}`}
                unit={t('common.lessons', 'ders')}
                icon="menu-book"
                color="#D0BCFF"
              />
            </View>
          </View>

          {/* Premium prompt for non-premium */}
          {!isPremium ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Paywall')}
              style={styles.upsellWrap}
            >
              <LinearGradient
                colors={['rgba(99, 102, 241, 0.2)', 'rgba(139, 92, 246, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.upsell}
              >
                <View style={styles.upsellLeft}>
                  <MaterialIcons name="auto-awesome" size={20} color="#C0C1FF" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upsellTitle}>
                      {t('insights.upsellTitle', 'Daha derin analitik')}
                    </Text>
                    <Text style={styles.upsellBody}>
                      {t(
                        'insights.upsellBody',
                        'Premium ile haftalık trend, en iyi saat, başarı zamanlama.',
                      )}
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={20}
                  color="#C0C1FF"
                />
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function BigStat({ icon, iconColor, value, label }) {
  return (
    <View style={styles.bigStat}>
      <MaterialIcons name={icon} size={22} color={iconColor} />
      <Text style={styles.bigStatValue}>{value}</Text>
      <Text style={styles.bigStatLabel}>{label}</Text>
    </View>
  );
}

function PathProgressRow({ stat, t }) {
  return (
    <View style={styles.pathRow}>
      <View style={styles.pathRowHeader}>
        <View
          style={[
            styles.pathRowDot,
            { backgroundColor: stat.path.color },
          ]}
        />
        <Text style={styles.pathRowName} numberOfLines={1}>
          {t(`paths.${stat.path.id}.title`, stat.path.id)}
        </Text>
        <Text style={styles.pathRowCount}>
          {stat.completed} / {stat.total}
        </Text>
      </View>
      <View style={styles.pathRowTrack}>
        <View
          style={[
            styles.pathRowFill,
            {
              width: `${Math.max(stat.percent, 1)}%`,
              backgroundColor: stat.path.color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function RecordItem({ label, value, unit, icon, color }) {
  return (
    <View style={styles.recordItem}>
      <MaterialIcons name={icon} size={20} color={color} />
      <Text style={styles.recordLabel}>{label}</Text>
      <View style={styles.recordValueRow}>
        <Text style={[styles.recordValue, { color }]}>{value}</Text>
        <Text style={styles.recordUnit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1, backgroundColor: '#0B0B14' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(11, 11, 20, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42, 42, 66, 0.4)',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#E0E7FF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  premiumPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 183, 131, 0.4)',
    backgroundColor: 'rgba(255, 183, 131, 0.1)',
  },
  premiumPillText: {
    color: '#FFB783',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },

  scroll: { padding: 20, gap: 14 },

  bigStatRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  bigStat: {
    flex: 1,
    backgroundColor: '#1F1F27',
    borderColor: 'rgba(70, 69, 84, 0.5)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
    gap: 8,
  },
  bigStatValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  bigStatLabel: {
    color: '#9898B0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  card: {
    backgroundColor: '#1F1F27',
    borderColor: 'rgba(70, 69, 84, 0.5)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: '#9898B0',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  cardBigValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  cardPercent: {
    fontSize: 16,
    color: '#9898B0',
    fontWeight: '700',
  },
  cardFooter: {
    color: '#C7C4D7',
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#34343D',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  pathList: { gap: 14 },
  pathRow: { gap: 6 },
  pathRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pathRowDot: { width: 8, height: 8, borderRadius: 4 },
  pathRowName: {
    color: '#E4E1ED',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  pathRowCount: {
    color: '#9898B0',
    fontSize: 11,
    fontWeight: '800',
  },
  pathRowTrack: {
    height: 6,
    backgroundColor: '#34343D',
    borderRadius: 3,
    overflow: 'hidden',
  },
  pathRowFill: { height: '100%', borderRadius: 3 },

  recordsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  recordItem: {
    flex: 1,
    backgroundColor: '#1B1B23',
    borderColor: 'rgba(70, 69, 84, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  recordLabel: {
    color: '#9898B0',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  recordValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  recordValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  recordUnit: {
    color: '#9898B0',
    fontSize: 11,
    fontWeight: '600',
  },

  upsellWrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  upsell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 16,
  },
  upsellLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  upsellTitle: {
    color: '#E4E1ED',
    fontSize: 14,
    fontWeight: '800',
  },
  upsellBody: {
    color: '#C7C4D7',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
