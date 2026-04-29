import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useApp } from '../contexts/AppContext';
import { getPathById, getLessonById } from '../data/paths';
import { showInterstitial, shouldShowAd } from '../services/ads';

export default function LessonScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { pathId, lessonId } = route.params || {};
  const { completePathLesson, pathProgress, isPremium } = useApp();

  const path = useMemo(() => getPathById(pathId), [pathId]);
  const lesson = useMemo(() => getLessonById(lessonId), [lessonId]);

  const [reflection, setReflection] = useState('');
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const alreadyCompleted = pathProgress?.[pathId]?.completed?.includes(lessonId);

  if (!path || !lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('common.error', 'Hata')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{t('common.back', 'Geri')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const i18nBase = `lessons.${pathId}.${lesson.order}`;
  const title = t(`${i18nBase}.title`, `${lesson.order}`);
  const teaching = t(`${i18nBase}.teaching`, '');
  const action = t(`${i18nBase}.action`, '');
  const reflectionPrompt = t(`${i18nBase}.reflectionPrompt`, '');

  const handleComplete = async () => {
    if (completing || alreadyCompleted) return;
    setCompleting(true);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch {}

    completePathLesson({
      pathId,
      lessonId,
      reflection: reflection.trim(),
      xp: 15,
    });

    setShowCelebration(true);

    setTimeout(async () => {
      // Ad after every 2-3 lesson completions for free users
      if (!isPremium && shouldShowAd(false)) {
        try {
          await showInterstitial();
        } catch {}
      }
      navigation.goBack();
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.lessonNumber}>
            {lesson.order} / {path.duration}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Teaching */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>📖 {t('lesson.teaching', 'Öğretim')}</Text>
            <View style={styles.card}>
              <Text style={styles.cardText}>{teaching}</Text>
            </View>
          </View>

          {/* Action */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: path.color }]}>
              🎯 {t('lesson.action', 'Bugün yap')}
            </Text>
            <View style={[styles.card, styles.actionCard, { borderColor: path.color }]}>
              <Text style={[styles.cardText, { color: '#FFFFFF', fontWeight: '600' }]}>
                {action}
              </Text>
            </View>
          </View>

          {/* Reflection */}
          {reflectionPrompt ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                💭 {t('lesson.reflection', 'Yansıma')}
              </Text>
              <View style={styles.card}>
                <Text style={styles.promptText}>{reflectionPrompt}</Text>
                <TextInput
                  value={reflection}
                  onChangeText={setReflection}
                  placeholder={t('lesson.reflectionPlaceholder', 'Düşüncelerini yaz...')}
                  placeholderTextColor="#6B6B85"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  editable={!alreadyCompleted}
                />
              </View>
            </View>
          ) : null}

          {/* Complete button */}
          <TouchableOpacity
            onPress={handleComplete}
            disabled={completing || alreadyCompleted}
            activeOpacity={0.85}
            style={styles.completeBtn}
          >
            <LinearGradient
              colors={
                alreadyCompleted
                  ? ['#10B981', '#059669']
                  : [path.color, path.color]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeGradient}
            >
              <Text style={styles.completeText}>
                {alreadyCompleted
                  ? `✓ ${t('lesson.completed', 'Tamamlandı')}`
                  : `✓ ${t('lesson.completeLesson', 'Dersi tamamla')}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Celebration overlay */}
        {showCelebration && (
          <View style={styles.celebration}>
            <Text style={styles.celebrationEmoji}>🔥</Text>
            <Text style={styles.celebrationText}>+15 XP</Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#F5F5FA', fontSize: 16 },
  backText: { color: '#6366F1', fontSize: 16, marginTop: 12 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#161626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2A2A42',
  },
  closeIcon: { color: '#9898B0', fontSize: 14, fontWeight: '700' },
  lessonNumber: { color: '#9898B0', fontSize: 13, fontWeight: '700' },

  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    color: '#F5F5FA',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
    lineHeight: 32,
  },
  section: { marginBottom: 20 },
  sectionLabel: {
    color: '#9898B0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#161626',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A42',
  },
  actionCard: {
    borderWidth: 2,
  },
  cardText: {
    color: '#F5F5FA',
    fontSize: 15,
    lineHeight: 24,
  },
  promptText: {
    color: '#B4B4D0',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#0B0B14',
    borderRadius: 12,
    padding: 12,
    color: '#F5F5FA',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#2A2A42',
  },

  completeBtn: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  completeGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  completeText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  celebration: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 11, 20, 0.85)',
  },
  celebrationEmoji: { fontSize: 96 },
  celebrationText: {
    color: '#FDE047',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 16,
  },
});
