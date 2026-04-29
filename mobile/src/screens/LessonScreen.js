import React, { useState, useMemo, useRef, useEffect } from 'react';
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useApp } from '../contexts/AppContext';
import { getPathById, getLessonById, getQuizForLesson } from '../data/paths';
import { showInterstitial, shouldShowAd } from '../services/ads';
import MilestoneModal, { isMilestone } from '../components/MilestoneModal';
import { playSound } from '../services/sounds';

const STEP = {
  TEACHING: 'teaching',
  QUIZ: 'quiz',
  COMMIT: 'commit',
  COMPLETE: 'complete',
};

export default function LessonScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { pathId, lessonId } = route.params || {};
  const {
    completePathLesson,
    pathProgress,
    isPremium,
    currentStreak,
    hearts,
    loseHeart,
  } = useApp();

  const path = useMemo(() => getPathById(pathId), [pathId]);
  const lesson = useMemo(() => getLessonById(lessonId), [lessonId]);
  const quiz = useMemo(
    () => (path && lesson ? getQuizForLesson(t, pathId, lesson.order) : []),
    [path, lesson, pathId, t],
  );

  const [step, setStep] = useState(STEP.TEACHING);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const [reflection, setReflection] = useState('');
  const [actionDone, setActionDone] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [milestoneVisible, setMilestoneVisible] = useState(false);
  const [milestoneStreak, setMilestoneStreak] = useState(0);

  const celebrationScale = useRef(new Animated.Value(0)).current;
  const xpY = useRef(new Animated.Value(0)).current;
  const stepProgress = useRef(new Animated.Value(0.33)).current;

  const alreadyCompleted = pathProgress?.[pathId]?.completed?.includes(lessonId);

  useEffect(() => {
    let target = 0.33;
    if (step === STEP.QUIZ) target = 0.66;
    else if (step === STEP.COMMIT) target = 1.0;
    Animated.timing(stepProgress, {
      toValue: target,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [step, stepProgress]);

  if (!path || !lesson) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{t('common.error', 'Hata')}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
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
  const hasQuiz = quiz.length > 0;
  const currentQuestion = hasQuiz ? quiz[quizIndex] : null;

  // ─── Step handlers ───
  const handleTeachingNext = () => {
    playSound('tap').catch(() => {});
    if (hasQuiz) {
      setStep(STEP.QUIZ);
    } else {
      setStep(STEP.COMMIT);
    }
  };

  const handleQuizAnswer = (idx) => {
    if (revealed) return;
    setSelectedAnswer(idx);
    setRevealed(true);
    const isCorrect = idx === currentQuestion.correct;
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      playSound('correct').catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      playSound('wrong').catch(() => {});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      // Lose a heart on wrong answer (only if not premium and we have hearts)
      if (!isPremium && hearts > 0) {
        loseHeart();
      }
    }
  };

  const handleQuizContinue = () => {
    setSelectedAnswer(null);
    setRevealed(false);
    if (quizIndex + 1 < quiz.length) {
      setQuizIndex((i) => i + 1);
    } else {
      setStep(STEP.COMMIT);
    }
  };

  const handleComplete = async () => {
    if (completing || alreadyCompleted) return;
    setCompleting(true);

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playSound('complete').catch(() => {});
    } catch {}

    completePathLesson({
      pathId,
      lessonId,
      reflection: reflection.trim(),
      quizCorrect: correctCount,
      xp: 15 + correctCount * 5, // bonus for correct quiz
    });

    setShowCelebration(true);

    Animated.sequence([
      Animated.spring(celebrationScale, {
        toValue: 1,
        damping: 8,
        stiffness: 180,
        useNativeDriver: true,
      }),
      Animated.timing(xpY, {
        toValue: -60,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(async () => {
      const newStreak = currentStreak + 1;
      if (isMilestone(newStreak)) {
        setMilestoneStreak(newStreak);
        setMilestoneVisible(true);
        playSound('milestone').catch(() => {});
        return;
      }
      if (!isPremium && shouldShowAd(false)) {
        try { await showInterstitial(); } catch {}
      }
      navigation.goBack();
    }, 2200);
  };

  const handleMilestoneClose = async () => {
    setMilestoneVisible(false);
    if (!isPremium && shouldShowAd(false)) {
      try { await showInterstitial(); } catch {}
    }
    navigation.goBack();
  };

  // ─── Step header ───
  const renderHeader = () => (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: path.color,
              width: stepProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      {!isPremium && (
        <View style={styles.heartsBadge}>
          <Text style={styles.heartsIcon}>❤️</Text>
          <Text style={styles.heartsText}>{hearts}</Text>
        </View>
      )}
    </View>
  );

  // ─── Step screens ───
  const renderTeaching = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>📖 {t('lesson.teaching', 'Öğretim')}</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.teachingCard}>
        <Text style={styles.teachingText}>{teaching}</Text>
      </View>

      <TouchableOpacity
        onPress={handleTeachingNext}
        activeOpacity={0.85}
        style={styles.primaryBtn}
      >
        <LinearGradient
          colors={[path.color, path.color]}
          style={styles.primaryGrad}
        >
          <Text style={styles.primaryText}>
            {t('lesson.gotIt', 'Anladım')} →
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderQuiz = () => {
    if (!currentQuestion) return null;
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.stepLabel}>
          🧠 {t('lesson.quiz', 'Quiz')} — {quizIndex + 1}/{quiz.length}
        </Text>
        <Text style={styles.title}>{currentQuestion.q}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion.correct;
            const showCorrect = revealed && isCorrect;
            const showWrong = revealed && isSelected && !isCorrect;

            let bgColor = '#161626';
            let borderColor = '#2A2A42';
            if (showCorrect) {
              bgColor = '#10B98115';
              borderColor = '#10B981';
            } else if (showWrong) {
              bgColor = '#EF444415';
              borderColor = '#EF4444';
            } else if (isSelected) {
              borderColor = path.color;
            }

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleQuizAnswer(idx)}
                disabled={revealed}
                activeOpacity={0.85}
                style={[styles.optionCard, { backgroundColor: bgColor, borderColor }]}
              >
                <Text style={styles.optionText}>{opt}</Text>
                {showCorrect && <Text style={styles.optionMark}>✓</Text>}
                {showWrong && <Text style={[styles.optionMark, { color: '#EF4444' }]}>✕</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {revealed && currentQuestion.explain && (
          <View style={styles.explainBox}>
            <Text style={styles.explainText}>{currentQuestion.explain}</Text>
          </View>
        )}

        {revealed && (
          <TouchableOpacity
            onPress={handleQuizContinue}
            activeOpacity={0.85}
            style={styles.primaryBtn}
          >
            <LinearGradient
              colors={[path.color, path.color]}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryText}>
                {quizIndex + 1 < quiz.length
                  ? t('common.continue', 'Devam')
                  : t('common.next', 'İleri')} →
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderCommit = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>
        🎯 {t('lesson.action', 'Bugün yap')}
      </Text>

      <TouchableOpacity
        style={[styles.actionCard, { borderColor: path.color }]}
        onPress={() => !alreadyCompleted && setActionDone(!actionDone)}
        activeOpacity={alreadyCompleted ? 1 : 0.8}
      >
        <View style={styles.actionRow}>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: path.color,
                backgroundColor: actionDone || alreadyCompleted ? path.color : 'transparent',
              },
            ]}
          >
            {(actionDone || alreadyCompleted) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
          <Text style={styles.actionText}>{action}</Text>
        </View>
        {!alreadyCompleted && !actionDone && (
          <Text style={styles.actionHint}>
            {t('lesson.tapToCheck', 'Yaptığında kareyi işaretle')}
          </Text>
        )}
      </TouchableOpacity>

      {reflectionPrompt ? (
        <View style={styles.section}>
          <Text style={styles.stepLabel}>💭 {t('lesson.reflection', 'Yansıma')}</Text>
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

      <TouchableOpacity
        onPress={handleComplete}
        disabled={completing || alreadyCompleted || !actionDone}
        activeOpacity={0.85}
        style={[
          styles.primaryBtn,
          !actionDone && !alreadyCompleted && styles.primaryBtnDisabled,
        ]}
      >
        <LinearGradient
          colors={
            alreadyCompleted
              ? ['#10B981', '#059669']
              : actionDone
                ? [path.color, path.color]
                : ['#3a3a5a', '#3a3a5a']
          }
          style={styles.primaryGrad}
        >
          <Text style={styles.primaryText}>
            {alreadyCompleted
              ? `✓ ${t('lesson.completed', 'Tamamlandı')}`
              : actionDone
                ? `✓ ${t('lesson.completeLesson', 'Dersi tamamla')}`
                : t('lesson.checkActionFirst', 'Önce eylemi işaretle')}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        {renderHeader()}

        {step === STEP.TEACHING && renderTeaching()}
        {step === STEP.QUIZ && renderQuiz()}
        {step === STEP.COMMIT && renderCommit()}

        <MilestoneModal
          visible={milestoneVisible}
          streak={milestoneStreak}
          onClose={handleMilestoneClose}
        />

        {showCelebration && (
          <View style={styles.celebration} pointerEvents="none">
            <Animated.Text
              style={[styles.celebrationEmoji, { transform: [{ scale: celebrationScale }] }]}
            >
              🔥
            </Animated.Text>
            <Animated.Text
              style={[styles.celebrationText, { transform: [{ translateY: xpY }] }]}
            >
              +{15 + correctCount * 5} XP
            </Animated.Text>
            <Text style={styles.celebrationHint}>
              {t('lesson.greatWork', 'Harika iş!')}
            </Text>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#F5F5FA', fontSize: 16 },
  backText: { color: '#6366F1', fontSize: 16 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 12,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#161626',
    borderWidth: 1, borderColor: '#2A2A42',
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { color: '#9898B0', fontSize: 14, fontWeight: '700' },
  progressTrack: {
    flex: 1, height: 8, backgroundColor: '#2A2A42',
    borderRadius: 4, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  heartsBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161626', borderRadius: 16,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#2A2A42', gap: 4,
  },
  heartsIcon: { fontSize: 14 },
  heartsText: { color: '#EF4444', fontSize: 14, fontWeight: '900' },

  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 },
  stepLabel: {
    color: '#9898B0', fontSize: 11, fontWeight: '800',
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12,
  },
  title: {
    color: '#F5F5FA', fontSize: 24, fontWeight: '900',
    marginBottom: 20, lineHeight: 30, letterSpacing: -0.3,
  },
  section: { marginBottom: 20, marginTop: 16 },

  teachingCard: {
    backgroundColor: '#161626', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#2A2A42', marginBottom: 24,
  },
  teachingText: { color: '#F5F5FA', fontSize: 15, lineHeight: 24 },

  optionsContainer: { gap: 10, marginBottom: 16 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 16, borderWidth: 2,
  },
  optionText: { flex: 1, color: '#F5F5FA', fontSize: 15, fontWeight: '600' },
  optionMark: { color: '#10B981', fontSize: 22, fontWeight: '900', marginLeft: 12 },
  explainBox: {
    backgroundColor: '#161626', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#2A2A42', marginBottom: 16,
  },
  explainText: { color: '#B4B4D0', fontSize: 13, lineHeight: 20, fontStyle: 'italic' },

  card: {
    backgroundColor: '#161626', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2A2A42',
  },
  actionCard: {
    backgroundColor: '#161626', borderRadius: 16, padding: 18,
    borderWidth: 2, marginBottom: 20,
  },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  actionText: { flex: 1, color: '#FFFFFF', fontWeight: '600', fontSize: 15, lineHeight: 22 },
  checkbox: {
    width: 26, height: 26, borderRadius: 8, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  checkmark: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  actionHint: {
    color: '#9898B0', fontSize: 11, fontStyle: 'italic',
    marginTop: 12, marginLeft: 38,
  },
  promptText: {
    color: '#B4B4D0', fontSize: 14, fontStyle: 'italic',
    marginBottom: 12, lineHeight: 22,
  },
  input: {
    backgroundColor: '#0B0B14', borderRadius: 12, padding: 12,
    color: '#F5F5FA', fontSize: 14, minHeight: 80,
    textAlignVertical: 'top', borderWidth: 1, borderColor: '#2A2A42',
  },

  primaryBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 8 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryGrad: { paddingVertical: 18, alignItems: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  celebration: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(11, 11, 20, 0.92)',
    zIndex: 999, elevation: 999,
  },
  celebrationEmoji: { fontSize: 120 },
  celebrationText: {
    color: '#FDE047', fontSize: 36, fontWeight: '900', marginTop: 16,
  },
  celebrationHint: {
    color: '#F5F5FA', fontSize: 14, fontWeight: '600',
    marginTop: 24, opacity: 0.8,
  },
});
