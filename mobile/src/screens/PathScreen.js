import React, { useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import { useApp } from '../contexts/AppContext';
import {
  PATHS,
  getPathLessons,
  getLessonState,
  getCurrentLesson,
  getPathProgress,
  getPathById,
} from '../data/paths';
import { shareStreak } from '../services/share';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PathScreen({ navigation }) {
  const { t } = useTranslation();
  const { pathProgress, activePathId, setActivePath, isPremium, currentStreak, totalXP } = useApp();

  const activePath = useMemo(
    () => getPathById(activePathId) || PATHS[0],
    [activePathId],
  );

  const lessons = useMemo(() => getPathLessons(activePath), [activePath]);
  const progress = useMemo(
    () => getPathProgress(activePath, pathProgress),
    [activePath, pathProgress],
  );

  const handleLessonTap = (lesson, state) => {
    if (state === 'locked') {
      const freeLimit = activePath.freeLessons || 5;
      const isLockedByPremium = !isPremium && lesson.order > freeLimit;
      if (isLockedByPremium) {
        navigation.navigate('Paywall');
        return;
      }
      return;
    }
    navigation.navigate('Lesson', { pathId: lesson.pathId, lessonId: lesson.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        {/* Streak Hero */}
        <View style={styles.streakHero}>
          <TouchableOpacity
            style={styles.streakLeft}
            activeOpacity={0.7}
            onPress={() => shareStreak({ streak: currentStreak, lang: t('language', 'tr') })}
          >
            <Text style={styles.streakIcon}>🔥</Text>
            <View>
              <Text style={styles.streakValue}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>
                {t('home.streakDays', 'gün seri')} ↗
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.streakRight}>
            <Text style={styles.xpValue}>⚡ {totalXP.toLocaleString()}</Text>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </View>

        {/* Header — selected path */}
        <View style={styles.header}>
          <Text style={styles.icon}>{activePath.icon}</Text>
          <Text style={styles.title}>
            {t(`paths.${activePath.id}.title`, activePath.id)}
          </Text>
          <Text style={styles.subtitle}>
            {t(`paths.${activePath.id}.subtitle`, '')}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress.percent}%`,
                  backgroundColor: activePath.color,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {progress.completed} / {progress.total}
          </Text>
        </View>

        {/* Path switcher */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pathSwitcher}
        >
          {PATHS.map((p) => {
            const isActive = p.id === activePathId;
            const pathProg = pathProgress?.[p.id]?.completed?.length || 0;
            const isCompleted = pathProg >= p.duration;
            // First path is free, others are premium
            const isPremiumPath = !isPremium && p.order > 1;
            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.pathChip,
                  isActive && { borderColor: p.color, backgroundColor: `${p.color}22` },
                ]}
                onPress={() => setActivePath(p.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.pathChipIcon}>{p.icon}</Text>
                <Text style={styles.pathChipLabel}>
                  {t(`paths.${p.id}.title`, p.id)}
                </Text>
                {isCompleted && <Text style={styles.pathChipBadge}>🏆</Text>}
                {isPremiumPath && !isCompleted && <Text style={styles.pathChipBadge}>👑</Text>}
                {pathProg > 0 && !isCompleted && (
                  <Text style={styles.pathChipProgress}>{pathProg}/{p.duration}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Duolingo zigzag tree */}
        <ScrollView
          contentContainerStyle={styles.tree}
          showsVerticalScrollIndicator={false}
        >
          {lessons.map((lesson, index) => {
            const state = getLessonState(lesson, pathProgress);
            const isLockedByPremium =
              !isPremium && lesson.order > (activePath.freeLessons || 5);
            const finalState =
              isLockedByPremium && state !== 'completed' ? 'premium' : state;
            const offset = (index % 4) - 1.5;
            const xOffset = offset * 50;

            return (
              <View
                key={lesson.id}
                style={[styles.lessonNodeWrap, { transform: [{ translateX: xOffset }] }]}
              >
                {index > 0 && (
                  <View
                    style={[
                      styles.connector,
                      finalState === 'completed'
                        ? { backgroundColor: activePath.color }
                        : null,
                    ]}
                  />
                )}
                <LessonNode
                  lesson={lesson}
                  state={finalState}
                  pathColor={activePath.color}
                  onPress={() => handleLessonTap(lesson, state)}
                  t={t}
                />
              </View>
            );
          })}

          {/* Empty state — first-time user */}
          {progress.completed === 0 && (
            <View style={styles.emptyHint}>
              <Text style={styles.emptyHintText}>
                {t('path.firstLessonHint', '👇 Bugün ilk dersini aç')}
              </Text>
            </View>
          )}

          {/* Path complete celebration */}
          {progress.completed === progress.total && progress.total > 0 && (
            <View style={styles.completion}>
              <Text style={styles.completionEmoji}>🏆</Text>
              <Text style={styles.completionText}>
                {t('path.completed', 'Tamamlandı')}
              </Text>
              <Text style={styles.completionSubtext}>
                {t('path.completedHint', 'Yeni bir yol seç ve devam et')}
              </Text>
            </View>
          )}

          <View style={{ height: 80 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

function LessonNode({ lesson, state, pathColor, onPress, t }) {
  const lessonTitle = t(
    `lessons.${lesson.pathId}.${lesson.order}.title`,
    `${lesson.order}`,
  );

  // Pulse animation for current lesson
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (state !== 'current') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [state, pulse]);

  let bgColor = '#2A2A42';
  let icon = '🔒';
  let labelOpacity = 0.4;
  let nodeBorder = null;

  if (state === 'completed') {
    bgColor = pathColor;
    icon = '✓';
    labelOpacity = 1;
  } else if (state === 'current') {
    bgColor = pathColor;
    icon = '🔥';
    labelOpacity = 1;
  } else if (state === 'premium') {
    bgColor = '#1F1F33';
    icon = '👑';
    labelOpacity = 0.6;
    nodeBorder = '#FDE047';
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.nodeContainer}>
      <Animated.View
        style={[
          styles.node,
          { backgroundColor: bgColor, transform: [{ scale: pulse }] },
          state === 'current' && styles.nodeCurrent,
          state === 'current' && { shadowColor: pathColor },
          nodeBorder && { borderWidth: 2, borderColor: nodeBorder },
        ]}
      >
        <Text style={styles.nodeIcon}>{icon}</Text>
        {state === 'current' && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayBadgeText}>BUGÜN</Text>
          </View>
        )}
      </Animated.View>
      <Text style={[styles.nodeLabel, { opacity: labelOpacity }]} numberOfLines={2}>
        {lessonTitle}
      </Text>
    </TouchableOpacity>
  );
}

const NODE = 76;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1 },

  streakHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161626',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A42',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakIcon: { fontSize: 32 },
  streakValue: { color: '#F59E0B', fontSize: 24, fontWeight: '900', lineHeight: 26 },
  streakLabel: { color: '#9898B0', fontSize: 11, fontWeight: '600' },
  streakRight: { alignItems: 'flex-end' },
  xpValue: { color: '#FDE047', fontSize: 16, fontWeight: '800' },
  xpLabel: { color: '#9898B0', fontSize: 10, fontWeight: '600' },

  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  icon: { fontSize: 40, marginBottom: 8 },
  title: { color: '#F5F5FA', fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: {
    color: '#9898B0',
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  progressBar: {
    width: 220,
    height: 6,
    backgroundColor: '#2A2A42',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { color: '#9898B0', fontSize: 11, fontWeight: '600', marginTop: 6 },

  pathSwitcher: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pathChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2A2A42',
    backgroundColor: '#161626',
    gap: 6,
    marginRight: 6,
  },
  pathChipIcon: { fontSize: 16 },
  pathChipLabel: { color: '#F5F5FA', fontSize: 12, fontWeight: '700' },
  pathChipBadge: { fontSize: 12, marginLeft: 2 },
  pathChipProgress: { color: '#9898B0', fontSize: 10, fontWeight: '600', marginLeft: 4 },

  tree: {
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  lessonNodeWrap: { alignItems: 'center', marginBottom: 8 },
  connector: {
    width: 4,
    height: 24,
    backgroundColor: '#2A2A42',
    borderRadius: 2,
    marginBottom: 4,
  },
  nodeContainer: { alignItems: 'center', maxWidth: 120 },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCurrent: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  nodeIcon: { fontSize: 32 },
  todayBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FDE047',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  todayBadgeText: { fontSize: 9, color: '#0B0B14', fontWeight: '900', letterSpacing: 0.5 },
  nodeLabel: {
    color: '#F5F5FA',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },

  emptyHint: {
    backgroundColor: '#161626',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A42',
    alignItems: 'center',
  },
  emptyHintText: { color: '#F59E0B', fontSize: 14, fontWeight: '700' },

  completion: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
  },
  completionEmoji: { fontSize: 48 },
  completionText: { color: '#F5F5FA', fontSize: 18, fontWeight: '700', marginTop: 8 },
  completionSubtext: { color: '#9898B0', fontSize: 13, marginTop: 4, textAlign: 'center' },
});
