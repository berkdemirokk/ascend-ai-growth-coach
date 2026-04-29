import React, { useMemo, useEffect, useRef, useState } from 'react';
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
import MonkMascot from '../components/MonkMascot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PathScreen({ navigation }) {
  const { t } = useTranslation();
  const {
    pathProgress,
    activePathId,
    setActivePath,
    isPremium,
    currentStreak,
    totalXP,
    hearts,
    heartsRefillAt,
  } = useApp();

  // Refill countdown — re-renders every 30s
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!heartsRefillAt || hearts >= 5 || isPremium) return;
    const id = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(id);
  }, [heartsRefillAt, hearts, isPremium]);

  const refillMins = (() => {
    if (isPremium || hearts >= 5 || !heartsRefillAt) return null;
    const ms = new Date(heartsRefillAt).getTime() - now;
    if (ms <= 0) return 0;
    return Math.ceil(ms / 60000);
  })();

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
        {/* Streak Hero with gradient background */}
        <LinearGradient
          colors={['#1F1F33', '#161626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.streakHero}
        >
          <TouchableOpacity
            style={styles.streakLeft}
            activeOpacity={0.7}
            onPress={() => shareStreak({ streak: currentStreak, lang: t('language', 'tr') })}
          >
            <View style={styles.streakIconBox}>
              <Text style={styles.streakIcon}>🔥</Text>
            </View>
            <View>
              <Text style={styles.streakValue}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>
                {t('home.streakDays', 'gün seri')}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.streakRight}>
            {!isPremium && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Paywall')}
                style={styles.heartsBox}
                activeOpacity={0.7}
              >
                <Text style={styles.heartsIcon}>{hearts > 0 ? '❤️' : '💔'}</Text>
                <Text style={styles.heartsValue}>{hearts}</Text>
                {refillMins !== null && refillMins > 0 && (
                  <Text style={styles.heartsTimer}>{refillMins}m</Text>
                )}
              </TouchableOpacity>
            )}
            <View style={styles.xpBox}>
              <Text style={styles.xpValue}>⚡ {totalXP.toLocaleString()}</Text>
            </View>
            <Text style={styles.xpLabel}>XP</Text>
          </View>
        </LinearGradient>

        {/* Header — selected path with gradient backdrop */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <MonkMascot
              mood={
                progress.completed === progress.total && progress.total > 0
                  ? 'excited'
                  : currentStreak >= 7
                    ? 'proud'
                    : currentStreak > 0
                      ? 'happy'
                      : 'idle'
              }
              size={56}
              pulse
            />
            <View style={[styles.iconBubble, { backgroundColor: `${activePath.color}22`, borderColor: activePath.color, marginLeft: 12 }]}>
              <Text style={styles.icon}>{activePath.icon}</Text>
            </View>
          </View>
          <Text style={styles.title}>
            {t(`paths.${activePath.id}.title`, activePath.id)}
          </Text>
          <Text style={styles.subtitle}>
            {t(`paths.${activePath.id}.subtitle`, '')}
          </Text>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={[activePath.color, lighten(activePath.color, 0.2)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.max(progress.percent, 2)}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            <Text style={{ color: activePath.color, fontWeight: '900' }}>
              {progress.completed}
            </Text>
            {' / '}{progress.total} {t('path.lessons', 'ders')}
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
            <View style={[styles.emptyHint, { borderColor: activePath.color }]}>
              <Text style={styles.emptyHintIcon}>👇</Text>
              <Text style={styles.emptyHintText}>
                {t('path.firstLessonHint', 'Bugün ilk dersini aç')}
              </Text>
              <Text style={styles.emptyHintSubtext}>
                {t('path.firstLessonHintSub', '5 dakika. Tek görev. Sonra alev tutuşsun.')}
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
  const glow = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (state !== 'current') return;
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 1000, useNativeDriver: false }),
        Animated.timing(glow, { toValue: 0.6, duration: 1000, useNativeDriver: false }),
      ]),
    );
    pulseLoop.start();
    glowLoop.start();
    return () => { pulseLoop.stop(); glowLoop.stop(); };
  }, [state, pulse, glow]);

  // Style configs by state
  const config = (() => {
    if (state === 'completed') return {
      gradient: [pathColor, darken(pathColor, 0.25)],
      icon: '✓',
      iconStyle: styles.nodeCheckmark,
      ringColor: 'rgba(255,255,255,0.15)',
      labelOpacity: 1,
    };
    if (state === 'current') return {
      gradient: [lighten(pathColor, 0.15), pathColor],
      icon: '🔥',
      iconStyle: styles.nodeIcon,
      ringColor: pathColor,
      labelOpacity: 1,
      glow: true,
    };
    if (state === 'premium') return {
      gradient: ['#2A2A42', '#1F1F33'],
      icon: '👑',
      iconStyle: styles.nodeIconPremium,
      ringColor: 'rgba(253,224,71,0.4)',
      labelOpacity: 0.6,
    };
    return {
      gradient: ['#2A2A42', '#1F1F33'],
      icon: '🔒',
      iconStyle: styles.nodeIconLocked,
      ringColor: 'transparent',
      labelOpacity: 0.4,
    };
  })();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.nodeContainer}>
      <Animated.View style={[
        styles.nodeRing,
        { borderColor: config.ringColor },
        config.glow && {
          shadowColor: pathColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: glow,
          shadowRadius: 20,
        },
      ]}>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nodeGradient}
          >
            <View style={styles.nodeInner}>
              <Text style={config.iconStyle}>{config.icon}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {state === 'current' && (
        <View style={[styles.todayBadge, { backgroundColor: '#FDE047' }]}>
          <Text style={styles.todayBadgeText}>BUGÜN</Text>
        </View>
      )}

      <Text style={[styles.nodeLabel, { opacity: config.labelOpacity }]} numberOfLines={2}>
        {lessonTitle}
      </Text>
    </TouchableOpacity>
  );
}

// Color utilities for shading
function lighten(hex, amount) {
  const c = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((c >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((c >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (c & 0xff) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
function darken(hex, amount) {
  const c = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, ((c >> 16) & 0xff) - Math.round(255 * amount));
  const g = Math.max(0, ((c >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (c & 0xff) - Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const NODE = 76;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1 },

  streakHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A42',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  streakIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  streakIcon: { fontSize: 26 },
  streakValue: {
    color: '#F59E0B',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  streakLabel: { color: '#9898B0', fontSize: 11, fontWeight: '600' },
  streakRight: { alignItems: 'flex-end', flexDirection: 'row', gap: 8 },
  heartsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 4,
  },
  heartsIcon: { fontSize: 14 },
  heartsValue: { color: '#EF4444', fontSize: 14, fontWeight: '900' },
  heartsTimer: { color: '#9898B0', fontSize: 10, fontWeight: '700', marginLeft: 2 },
  xpBox: {
    backgroundColor: 'rgba(253, 224, 71, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(253, 224, 71, 0.3)',
  },
  xpValue: { color: '#FDE047', fontSize: 14, fontWeight: '800' },
  xpLabel: { color: '#9898B0', fontSize: 10, fontWeight: '600', marginTop: 2 },

  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  icon: { fontSize: 32 },
  title: {
    color: '#F5F5FA',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#9898B0',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBar: {
    width: 240,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { color: '#9898B0', fontSize: 12, fontWeight: '600', marginTop: 8 },

  pathSwitcher: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pathChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#2A2A42',
    backgroundColor: '#161626',
    marginRight: 8,
    minHeight: 40,
  },
  pathChipIcon: { fontSize: 18, marginRight: 6 },
  pathChipLabel: { color: '#F5F5FA', fontSize: 13, fontWeight: '700', flexShrink: 0 },
  pathChipBadge: { fontSize: 12, marginLeft: 2 },
  pathChipProgress: { color: '#9898B0', fontSize: 10, fontWeight: '600', marginLeft: 4 },

  tree: {
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center',
  },
  lessonNodeWrap: { alignItems: 'center', marginBottom: 8 },
  connector: {
    width: 3,
    height: 28,
    backgroundColor: '#2A2A42',
    borderRadius: 1.5,
    marginBottom: 4,
    opacity: 0.6,
  },
  nodeContainer: { alignItems: 'center', maxWidth: 130 },
  nodeRing: {
    width: NODE + 8,
    height: NODE + 8,
    borderRadius: (NODE + 8) / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  nodeGradient: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  nodeInner: {
    width: NODE - 6,
    height: NODE - 6,
    borderRadius: (NODE - 6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  nodeIcon: {
    fontSize: 36,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  nodeCheckmark: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  nodeIconPremium: { fontSize: 30, opacity: 0.8 },
  nodeIconLocked: { fontSize: 26, opacity: 0.4 },
  todayBadge: {
    backgroundColor: '#FDE047',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: -10,
    zIndex: 2,
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  todayBadgeText: { fontSize: 10, color: '#0B0B14', fontWeight: '900', letterSpacing: 0.5 },
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
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyHintIcon: { fontSize: 28, marginBottom: 8 },
  emptyHintText: {
    color: '#F5F5FA',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyHintSubtext: {
    color: '#9898B0',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  completion: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
  },
  completionEmoji: { fontSize: 48 },
  completionText: { color: '#F5F5FA', fontSize: 18, fontWeight: '700', marginTop: 8 },
  completionSubtext: { color: '#9898B0', fontSize: 13, marginTop: 4, textAlign: 'center' },
});
