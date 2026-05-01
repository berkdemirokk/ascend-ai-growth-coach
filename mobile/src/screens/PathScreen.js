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
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { useApp } from '../contexts/AppContext';
import {
  PATHS,
  getPathLessons,
  getLessonState,
  getPathProgress,
  getPathById,
} from '../data/paths';
import BannerAdBox from '../components/BannerAdBox';
import OutOfHeartsModal from '../components/OutOfHeartsModal';
import StreakInfoModal from '../components/StreakInfoModal';

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
    refillHearts,
    streakFreezes,
  } = useApp();
  const [outOfHeartsVisible, setOutOfHeartsVisible] = useState(false);
  const [streakInfoVisible, setStreakInfoVisible] = useState(false);

  const activePath = useMemo(
    () => getPathById(activePathId) || PATHS[0],
    [activePathId],
  );

  const lessons = useMemo(() => getPathLessons(activePath), [activePath]);
  const progress = useMemo(
    () => getPathProgress(activePath, pathProgress),
    [activePath, pathProgress],
  );

  // Hearts refill countdown — re-renders every 30s
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
    // Block if out of hearts (free users only)
    if (!isPremium && hearts <= 0) {
      setOutOfHeartsVisible(true);
      return;
    }
    navigation.navigate('Lesson', { pathId: lesson.pathId, lessonId: lesson.id });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Bar */}
        <View style={styles.topAppBar}>
          <View style={styles.topLeft}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBadge}
            >
              <MaterialIcons name="star" size={16} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.brandTitle}>MONK MODE</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.xpPill}
            activeOpacity={0.7}
          >
            <Text style={styles.xpPillText}>XP: {totalXP.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Streak / Hearts / XP hero */}
          <View style={styles.heroCard}>
            <TouchableOpacity
              onPress={() => setStreakInfoVisible(true)}
              activeOpacity={0.7}
              style={styles.heroLeft}
            >
              <MaterialIcons name="local-fire-department" size={26} color="#F59E0B" />
              <Text style={styles.streakValue}>{currentStreak}</Text>
              <Text style={styles.streakLabel}>
                {t('home.dayStreak', 'GÜN SERİ')}
              </Text>
              {streakFreezes > 0 && (
                <View style={styles.streakFreezeBadge}>
                  <MaterialIcons name="ac-unit" size={11} color="#A5B4FC" />
                  <Text style={styles.streakFreezeText}>{streakFreezes}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.heroRight}>
              {!isPremium && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Paywall')}
                  style={styles.heroChip}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="favorite" size={18} color="#EF4444" />
                  <Text style={styles.heroChipText}>{hearts}</Text>
                  {refillMins !== null && refillMins > 0 && (
                    <Text style={styles.heroChipTimer}>{refillMins}m</Text>
                  )}
                </TouchableOpacity>
              )}
              <View style={[styles.heroChip, styles.xpChip]}>
                <MaterialIcons name="bolt" size={18} color="#A5B4FC" />
                <Text style={[styles.heroChipText, { color: '#A5B4FC' }]}>
                  {totalXP.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Profile / active path with progress */}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={['#1E1B4B', '#0F172A']}
                style={styles.avatarBg}
              >
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              </LinearGradient>
              <View style={[styles.avatarBadge, { backgroundColor: activePath.color }]}>
                <MaterialIcons
                  name={activePath.materialIcon}
                  size={11}
                  color="#FFFFFF"
                />
              </View>
            </View>
            <View style={styles.profileText}>
              <Text style={styles.profileName} numberOfLines={1}>
                {t(`paths.${activePath.id}.title`, activePath.id)}
              </Text>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={[activePath.color, lighten(activePath.color, 0.25)]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(progress.percent, 2)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {progress.completed} / {progress.total}{' '}
                {t('path.lessonsLabel', 'ders')}
              </Text>
            </View>
          </View>

          {/* Path switcher chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {PATHS.map((p) => {
              const isActive = p.id === activePathId;
              const pathProg = pathProgress?.[p.id]?.completed?.length || 0;
              const isCompleted = pathProg >= p.duration;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setActivePath(p.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.chip,
                    isActive && {
                      backgroundColor: p.color,
                      borderColor: p.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipLabel,
                      isActive && { color: '#FFFFFF' },
                    ]}
                    numberOfLines={1}
                  >
                    {t(`paths.${p.id}.title`, p.id)}
                  </Text>
                  <View
                    style={[
                      styles.chipBadge,
                      isActive && { backgroundColor: 'rgba(0,0,0,0.25)' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipBadgeText,
                        isActive && { color: '#FFFFFF' },
                      ]}
                    >
                      {pathProg}/{p.duration}
                    </Text>
                  </View>
                  {isCompleted && (
                    <MaterialIcons
                      name="check-circle"
                      size={14}
                      color={isActive ? '#FFFFFF' : '#10B981'}
                      style={{ marginLeft: 2 }}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Lesson zigzag tree */}
          <View style={styles.tree}>
            {lessons.map((lesson, index) => {
              const state = getLessonState(lesson, pathProgress);
              const isLockedByPremium =
                !isPremium && lesson.order > (activePath.freeLessons || 5);
              const finalState =
                isLockedByPremium && state !== 'completed' ? 'premium' : state;

              // Zigzag pattern: alternate left/right
              const isOdd = index % 2 === 1;
              const xOffset = isOdd ? 56 : -56;

              return (
                <View
                  key={lesson.id}
                  style={[
                    styles.lessonNodeWrap,
                    { transform: [{ translateX: xOffset }] },
                  ]}
                >
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

            {progress.completed === 0 && (
              <View
                style={[styles.emptyHint, { borderColor: activePath.color }]}
              >
                <MaterialIcons
                  name="touch-app"
                  size={28}
                  color={activePath.color}
                />
                <Text style={styles.emptyHintText}>
                  {t('path.firstLessonHint', 'Bugün ilk dersini aç')}
                </Text>
                <Text style={styles.emptyHintSubtext}>
                  {t(
                    'path.firstLessonHintSub',
                    '5 dakika. Tek görev. Sonra alev tutuşsun.',
                  )}
                </Text>
              </View>
            )}

            {progress.completed === progress.total && progress.total > 0 && (
              <View style={styles.completion}>
                <MaterialIcons name="emoji-events" size={48} color="#FDE047" />
                <Text style={styles.completionText}>
                  {t('path.completed', 'Tamamlandı')}
                </Text>
                <Text style={styles.completionSubtext}>
                  {t(
                    'path.completedHint',
                    'Yeni bir yol seç ve devam et',
                  )}
                </Text>
              </View>
            )}

            <View style={{ height: 80 }} />
          </View>
        </ScrollView>

        {/* Banner ad (free users only) */}
        <BannerAdBox />

        <OutOfHeartsModal
          visible={outOfHeartsVisible}
          onClose={() => setOutOfHeartsVisible(false)}
          onRefill={refillHearts}
          onPaywall={() => {
            setOutOfHeartsVisible(false);
            navigation.navigate('Paywall');
          }}
          refillMins={refillMins}
        />

        <StreakInfoModal
          visible={streakInfoVisible}
          onClose={() => setStreakInfoVisible(false)}
          streak={currentStreak}
          freezes={streakFreezes || 0}
          isPremium={isPremium}
          onPaywall={() => navigation.navigate('Paywall')}
        />
      </View>
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
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (state !== 'current') return;
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
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
        Animated.timing(glow, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(glow, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    );
    pulseLoop.start();
    glowLoop.start();
    return () => {
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, [state, pulse, glow]);

  const config = (() => {
    if (state === 'completed')
      return {
        bg: pathColor,
        icon: 'check',
        iconColor: '#FFFFFF',
        size: 64,
        labelOpacity: 0.7,
        ringColor: 'rgba(255,255,255,0.15)',
      };
    if (state === 'current')
      return {
        bg: '#FDE047',
        icon: 'local-fire-department',
        iconColor: '#0B0B14',
        size: 80,
        labelOpacity: 1,
        ringColor: '#FDE047',
        showBadge: true,
      };
    if (state === 'premium')
      return {
        bg: '#1F1F33',
        icon: 'workspace-premium',
        iconColor: '#FDE047',
        size: 64,
        labelOpacity: 0.5,
        ringColor: 'rgba(253,224,71,0.3)',
      };
    return {
      bg: '#1F1F33',
      icon: 'lock',
      iconColor: '#6B6B85',
      size: 64,
      labelOpacity: 0.4,
      ringColor: 'transparent',
    };
  })();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.nodeContainer}
    >
      <Animated.View
        style={[
          styles.nodeRing,
          {
            width: config.size + 8,
            height: config.size + 8,
            borderRadius: (config.size + 8) / 2,
            borderColor: config.ringColor,
          },
          state === 'current' && {
            shadowColor: '#FDE047',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: glow,
            shadowRadius: 20,
            elevation: 12,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <View
            style={[
              styles.nodeCircle,
              {
                width: config.size,
                height: config.size,
                borderRadius: config.size / 2,
                backgroundColor: config.bg,
              },
            ]}
          >
            <MaterialIcons
              name={config.icon}
              size={config.size * 0.5}
              color={config.iconColor}
            />
          </View>
        </Animated.View>
      </Animated.View>

      {config.showBadge && (
        <View style={styles.todayBadge}>
          <Text style={styles.todayBadgeText}>BUGÜN</Text>
        </View>
      )}

      <Text
        style={[styles.nodeLabel, { opacity: config.labelOpacity }]}
        numberOfLines={2}
      >
        {lessonTitle}
      </Text>
    </TouchableOpacity>
  );
}

function lighten(hex, amount) {
  const c = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((c >> 16) & 0xff) + Math.round(255 * amount));
  const g = Math.min(255, ((c >> 8) & 0xff) + Math.round(255 * amount));
  const b = Math.min(255, (c & 0xff) + Math.round(255 * amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1, backgroundColor: '#0B0B14' },

  topAppBar: {
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  brandTitle: {
    color: '#E0E7FF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  xpPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  xpPillText: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  scrollContent: { paddingBottom: 24 },

  // Hero stats card
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1F27',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.3)',
  },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  streakFreezeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(165, 180, 252, 0.15)',
    borderColor: 'rgba(165, 180, 252, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    marginLeft: 4,
  },
  streakFreezeText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '900',
  },
  streakValue: {
    color: '#F59E0B',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  streakLabel: {
    color: '#9898B0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  xpChip: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  heroChipText: {
    color: '#F5F5FA',
    fontSize: 14,
    fontWeight: '800',
  },
  heroChipTimer: {
    color: '#9898B0',
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },

  // Profile section
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    marginTop: 24,
  },
  avatarWrap: { position: 'relative' },
  avatarBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  avatarImg: { width: 40, height: 40 },
  avatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0B0B14',
  },
  profileText: { flex: 1 },
  profileName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#292932',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    shadowColor: '#C0C1FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  progressLabel: {
    color: '#9898B0',
    fontSize: 11,
    fontWeight: '700',
  },

  // Chips
  chipsRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.4)',
    backgroundColor: '#1F1F27',
    marginRight: 8,
  },
  chipLabel: {
    color: '#C7C4D7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    flexShrink: 1,
    maxWidth: 100,
  },
  chipBadge: {
    backgroundColor: '#393841',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipBadgeText: {
    color: '#908FA0',
    fontSize: 10,
    fontWeight: '800',
  },

  // Tree
  tree: {
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  lessonNodeWrap: { alignItems: 'center', marginBottom: 32 },
  nodeContainer: { alignItems: 'center', maxWidth: 130 },
  nodeRing: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#0B0B14',
  },
  todayBadge: {
    position: 'absolute',
    top: -8,
    right: -16,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    zIndex: 5,
  },
  todayBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nodeLabel: {
    color: '#F5F5FA',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  emptyHint: {
    backgroundColor: 'rgba(22, 22, 38, 0.6)',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 8,
  },
  emptyHintText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
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
    gap: 6,
  },
  completionText: {
    color: '#FDE047',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
    letterSpacing: -0.3,
  },
  completionSubtext: {
    color: '#9898B0',
    fontSize: 13,
    textAlign: 'center',
  },
});
