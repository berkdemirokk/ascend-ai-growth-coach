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
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
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
};

const REFLECTION_MAX = 250;

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
      duration: 350,
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
  const proTipKey = `${i18nBase}.proTip`;
  const proTipRaw = t(proTipKey, '');
  const proTip = proTipRaw && proTipRaw !== proTipKey ? proTipRaw : '';
  const hasQuiz = quiz.length > 0;
  const currentQuestion = hasQuiz ? quiz[quizIndex] : null;

  const handleTeachingNext = () => {
    playSound('tap').catch(() => {});
    if (hasQuiz) setStep(STEP.QUIZ);
    else setStep(STEP.COMMIT);
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
      if (!isPremium && hearts > 0) loseHeart();
    }
  };

  const handleQuizContinue = () => {
    setSelectedAnswer(null);
    setRevealed(false);
    if (quizIndex + 1 < quiz.length) setQuizIndex((i) => i + 1);
    else setStep(STEP.COMMIT);
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
      xp: 15 + correctCount * 5,
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

  const renderTopBar = () => (
    <View style={styles.topBar}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.closeBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons name="close" size={22} color="#9898B0" />
      </TouchableOpacity>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFillWrap,
            {
              width: stepProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={['#8083FF', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressFill}
          />
        </Animated.View>
      </View>
      {!isPremium && (
        <View style={styles.heartsBadge}>
          <MaterialIcons name="favorite" size={16} color="#EF4444" />
          <Text style={styles.heartsText}>{hearts}</Text>
        </View>
      )}
    </View>
  );

  const renderTeaching = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepLabel}>📖 {t('lesson.teaching', 'ÖĞRETİM')}</Text>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.heroBox}>
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.18)', 'rgba(11, 11, 20, 0.85)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroMascot}>
          <MaterialIcons name="self-improvement" size={68} color="#8083FF" />
        </View>
      </View>

      <View style={styles.teachingCard}>
        <View style={styles.cornerAccent} />
        <Text style={styles.teachingText}>{teaching}</Text>
      </View>

      {proTip ? (
        <View style={styles.proTipBox}>
          <MaterialIcons name="lightbulb" size={22} color="#FDE047" />
          <View style={{ flex: 1 }}>
            <Text style={styles.proTipLabel}>{t('lesson.proTip', 'PRO İPUCU')}</Text>
            <Text style={styles.proTipBody}>{proTip}</Text>
          </View>
        </View>
      ) : null}

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderQuiz = () => {
    if (!currentQuestion) return null;
    const letters = ['A', 'B', 'C', 'D'];
    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepChip}>
          <Text style={styles.stepChipText}>
            🧠 {t('lesson.quiz', 'QUIZ')} — {quizIndex + 1}/{quiz.length}
          </Text>
        </View>
        <Text style={[styles.title, { marginTop: 16 }]}>{currentQuestion.q}</Text>
        <Text style={styles.questionSubtitle}>
          {t('lesson.quizHint', 'Doğru olduğunu düşündüğün cevabı seç.')}
        </Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedAnswer === idx;
            const isCorrect = idx === currentQuestion.correct;
            const showCorrect = revealed && isCorrect;
            const showWrong = revealed && isSelected && !isCorrect;

            const cardStyle = [styles.optionCard];
            const letterBoxStyle = [styles.optionLetterBox];
            let letterColor = '#908FA0';

            if (showCorrect) {
              cardStyle.push({
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                borderColor: '#10B981',
              });
              letterBoxStyle.push({ backgroundColor: '#10B981', borderColor: '#10B981' });
              letterColor = '#FFFFFF';
            } else if (showWrong) {
              cardStyle.push({
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                borderColor: '#EF4444',
              });
              letterBoxStyle.push({ backgroundColor: '#EF4444', borderColor: '#EF4444' });
              letterColor = '#FFFFFF';
            } else if (isSelected) {
              cardStyle.push({
                backgroundColor: '#1F1F33',
                borderColor: '#8083FF',
              });
              letterBoxStyle.push({ backgroundColor: '#8083FF', borderColor: '#8083FF' });
              letterColor = '#0D0096';
            }

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => handleQuizAnswer(idx)}
                disabled={revealed}
                activeOpacity={0.85}
                style={cardStyle}
              >
                <View style={letterBoxStyle}>
                  <Text style={[styles.optionLetter, { color: letterColor }]}>
                    {letters[idx]}
                  </Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
                {showCorrect && (
                  <MaterialIcons name="check-circle" size={22} color="#10B981" />
                )}
                {showWrong && (
                  <MaterialIcons name="cancel" size={22} color="#EF4444" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {revealed && currentQuestion.explain && (
          <View style={styles.explainBox}>
            <MaterialIcons
              name={selectedAnswer === currentQuestion.correct ? 'check-circle' : 'info'}
              size={18}
              color={selectedAnswer === currentQuestion.correct ? '#10B981' : '#FDE047'}
            />
            <Text style={styles.explainText}>{currentQuestion.explain}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  const renderCommit = () => (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.stepChipTertiary}>
        <Text style={styles.stepChipTertiaryText}>
          🎯 {t('lesson.action', 'BUGÜN YAP')}
        </Text>
      </View>

      <View style={styles.commitMascotWrap}>
        <LinearGradient
          colors={['#1F1F33', '#0D0D15']}
          style={styles.commitMascotCircle}
        >
          <Image
            source={require('../../assets/icon.png')}
            style={styles.commitMascotImg}
            resizeMode="contain"
          />
        </LinearGradient>
      </View>

      <TouchableOpacity
        style={[
          styles.actionCard,
          (actionDone || alreadyCompleted) && styles.actionCardActive,
        ]}
        onPress={() => !alreadyCompleted && setActionDone(!actionDone)}
        activeOpacity={alreadyCompleted ? 1 : 0.8}
      >
        <View
          style={[
            styles.checkbox,
            (actionDone || alreadyCompleted) && styles.checkboxActive,
          ]}
        >
          {(actionDone || alreadyCompleted) && (
            <MaterialIcons name="check" size={18} color="#FFFFFF" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionText}>{action}</Text>
          {!alreadyCompleted && !actionDone && (
            <Text style={styles.actionHint}>
              {t('lesson.tapToCheck', 'YAPTIĞINDA İŞARETLE')}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {reflectionPrompt ? (
        <View style={styles.reflectionWrap}>
          <Text style={styles.reflectionLabel}>{reflectionPrompt}</Text>
          <View style={styles.reflectionBox}>
            <TextInput
              value={reflection}
              onChangeText={(txt) => setReflection(txt.slice(0, REFLECTION_MAX))}
              placeholder={t('lesson.reflectionPlaceholder', 'Düşüncelerini buraya yaz...')}
              placeholderTextColor="#5B5B70"
              multiline
              style={styles.reflectionInput}
              editable={!alreadyCompleted}
            />
            <View style={styles.reflectionEditIcon} pointerEvents="none">
              <MaterialIcons name="edit-note" size={20} color="#5B5B70" />
            </View>
          </View>
          <View style={styles.reflectionMeta}>
            <Text style={styles.reflectionMetaText}>
              {t('lesson.optional', 'OPSİYONEL')}
            </Text>
            <Text style={styles.reflectionMetaText}>
              {reflection.length} / {REFLECTION_MAX}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={{ height: 160 }} />
    </ScrollView>
  );

  const renderBottomCTA = () => {
    if (step === STEP.TEACHING) {
      return (
        <View style={styles.bottomCTAWrap}>
          <TouchableOpacity onPress={handleTeachingNext} activeOpacity={0.9} style={styles.ctaShadow}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>{t('lesson.gotIt', 'Anladım')}</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    if (step === STEP.QUIZ) {
      return (
        <View style={styles.bottomCTAWrap}>
          <TouchableOpacity
            onPress={handleQuizContinue}
            disabled={!revealed}
            activeOpacity={0.9}
            style={styles.ctaShadow}
          >
            <LinearGradient
              colors={revealed ? ['#8083FF', '#6366F1'] : ['#3A3A5A', '#3A3A5A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButton}
            >
              <Text style={[styles.ctaText, !revealed && { opacity: 0.5 }]}>
                {revealed
                  ? quizIndex + 1 < quiz.length
                    ? t('common.continue', 'Devam')
                    : t('common.next', 'İleri')
                  : t('lesson.selectAnswer', 'Bir cevap seç')}
              </Text>
              {revealed && <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    const canComplete = (actionDone || alreadyCompleted) && !completing;
    return (
      <View style={styles.bottomCTAWrap}>
        <TouchableOpacity
          onPress={handleComplete}
          disabled={!canComplete}
          activeOpacity={0.9}
          style={styles.ctaShadow}
        >
          <LinearGradient
            colors={
              alreadyCompleted
                ? ['#10B981', '#059669']
                : canComplete
                  ? ['#6366F1', '#8B5CF6']
                  : ['rgba(99,102,241,0.4)', 'rgba(139,92,246,0.4)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            <MaterialIcons name="check-circle" size={20} color="#FFFFFF" />
            <Text style={[styles.ctaText, !canComplete && { opacity: 0.6 }]}>
              {alreadyCompleted
                ? t('lesson.completed', '✓ Tamamlandı')
                : t('lesson.completeLesson', '✓ Dersi tamamla')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        {!actionDone && !alreadyCompleted && (
          <Text style={styles.ctaHint}>
            {t('lesson.checkActionFirst', 'DEVAM ETMEK İÇİN GÖREVİ İŞARETLE')}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.glow, { top: -80, right: -60 }]} pointerEvents="none" />
        <View
          style={[styles.glow, styles.glowPurple, { bottom: -80, left: -60 }]}
          pointerEvents="none"
        />

        {renderTopBar()}

        {step === STEP.TEACHING && renderTeaching()}
        {step === STEP.QUIZ && renderQuiz()}
        {step === STEP.COMMIT && renderCommit()}

        {renderBottomCTA()}

        <MilestoneModal
          visible={milestoneVisible}
          streak={milestoneStreak}
          onClose={handleMilestoneClose}
        />

        {showCelebration && (
          <View style={styles.celebration}>
            {/* Top bar with title + share */}
            <View style={styles.celebrationTopBar}>
              <View style={{ width: 40 }} />
              <Text style={styles.celebrationTopTitle}>
                {t('lesson.completeTitle', 'Lesson Complete')}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Centered content */}
            <View style={styles.celebrationCenter} pointerEvents="none">
              <View style={styles.celebrationEmojiWrap}>
                <Animated.Text
                  style={[
                    styles.celebrationEmoji,
                    { transform: [{ scale: celebrationScale }] },
                  ]}
                >
                  🔥
                </Animated.Text>
                <View style={styles.celebrationRing} />
              </View>
              <Animated.Text
                style={[
                  styles.celebrationXP,
                  { transform: [{ translateY: xpY }] },
                ]}
              >
                +{15 + correctCount * 5} XP
              </Animated.Text>
              <Text style={styles.celebrationHeading}>
                {t('lesson.greatWork', 'Harika iş!')}
              </Text>
              <Text style={styles.celebrationSubtitle}>
                {t(
                  'lesson.completeFooter',
                  'Disiplin yolunda bir adım daha attın.',
                )}
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1, backgroundColor: '#0B0B14' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#F5F5FA', fontSize: 16 },
  backText: { color: '#6366F1', fontSize: 16 },

  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    opacity: 0.6,
  },
  glowPurple: { backgroundColor: 'rgba(139, 92, 246, 0.06)' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(42, 42, 66, 0.5)',
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  progressTrack: {
    flex: 1, height: 8,
    backgroundColor: '#1F1F33',
    borderRadius: 4, overflow: 'hidden',
  },
  progressFillWrap: { height: '100%', borderRadius: 4 },
  progressFill: {
    flex: 1, borderRadius: 4,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 8,
  },
  heartsBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161626', borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#2A2A42', gap: 4,
  },
  heartsText: { color: '#A5B4FC', fontSize: 13, fontWeight: '800' },

  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },

  stepLabel: {
    color: '#8083FF',
    fontSize: 12, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
    marginBottom: 8,
  },
  stepChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8,
  },
  stepChipText: {
    color: '#C0C1FF',
    fontSize: 11, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  stepChipTertiary: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217, 119, 33, 0.1)',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999, marginBottom: 24,
  },
  stepChipTertiaryText: {
    color: '#FFB783',
    fontSize: 11, fontWeight: '900',
    letterSpacing: 2, textTransform: 'uppercase',
  },

  title: {
    color: '#F5F5FA', fontSize: 24, fontWeight: '900',
    marginBottom: 24, lineHeight: 30, letterSpacing: -0.4,
  },

  heroBox: {
    width: '100%', aspectRatio: 1,
    borderRadius: 24, overflow: 'hidden',
    backgroundColor: 'rgba(22, 22, 38, 0.8)',
    borderWidth: 1, borderColor: '#2A2A42',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  heroMascot: {
    width: 132, height: 132, borderRadius: 66,
    borderWidth: 2, borderColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center', justifyContent: 'center',
  },

  teachingCard: {
    backgroundColor: 'rgba(22, 22, 38, 0.85)',
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: '#2A2A42',
    overflow: 'hidden',
  },
  cornerAccent: {
    position: 'absolute', top: 0, right: 0,
    width: 64, height: 64,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 64,
    borderTopWidth: 1, borderRightWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    backgroundColor: 'rgba(128, 131, 255, 0.05)',
  },
  teachingText: {
    color: '#C7C4D7', fontSize: 15,
    lineHeight: 24, fontWeight: '500',
  },

  proTipBox: {
    flexDirection: 'row',
    backgroundColor: '#1B1B23',
    borderLeftWidth: 4, borderLeftColor: '#FDE047',
    borderRadius: 12, padding: 16, marginTop: 24,
    gap: 12, alignItems: 'flex-start',
  },
  proTipLabel: {
    color: '#FDE047', fontSize: 11, fontWeight: '900',
    letterSpacing: 1.5, marginBottom: 4,
  },
  proTipBody: {
    color: '#9898B0', fontSize: 13,
    lineHeight: 18, fontWeight: '500',
  },

  questionSubtitle: {
    color: '#9898B0', fontSize: 14,
    marginTop: -16, marginBottom: 20,
    fontWeight: '500', lineHeight: 20,
  },
  optionsContainer: { gap: 12 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161626',
    borderWidth: 2, borderColor: '#2A2A42',
    borderRadius: 18, padding: 14, gap: 14,
  },
  optionLetterBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1F1F27',
    borderWidth: 1, borderColor: '#2A2A42',
  },
  optionLetter: { fontSize: 16, fontWeight: '900' },
  optionText: { flex: 1, color: '#F5F5FA', fontSize: 15, fontWeight: '600' },

  explainBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#1B1B23',
    borderRadius: 12, padding: 14, marginTop: 16,
    borderWidth: 1, borderColor: '#2A2A42',
  },
  explainText: {
    flex: 1, color: '#C7C4D7',
    fontSize: 13, lineHeight: 20, fontStyle: 'italic',
  },

  commitMascotWrap: { alignItems: 'center', marginBottom: 24 },
  commitMascotCircle: {
    width: 192, height: 192, borderRadius: 96,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#2A2A42',
    overflow: 'hidden',
  },
  commitMascotImg: { width: 132, height: 132, opacity: 0.9 },

  actionCard: {
    backgroundColor: '#161626',
    borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 18, padding: 16, marginBottom: 24,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
  },
  actionCardActive: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  checkbox: {
    width: 28, height: 28, borderRadius: 8,
    borderWidth: 2, borderColor: '#2A2A42',
    backgroundColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#6366F1', borderColor: '#6366F1',
  },
  actionText: { color: '#F5F5FA', fontSize: 15, fontWeight: '600', lineHeight: 22 },
  actionHint: {
    color: '#5B5B70',
    fontSize: 11, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
    marginTop: 8,
  },

  reflectionWrap: { gap: 8 },
  reflectionLabel: {
    color: '#A5B4FC',
    fontSize: 13, fontWeight: '600',
    fontStyle: 'italic', paddingHorizontal: 4,
  },
  reflectionBox: { position: 'relative' },
  reflectionInput: {
    backgroundColor: '#1F1F33',
    borderWidth: 1, borderColor: '#2A2A42',
    borderRadius: 12, padding: 14, paddingRight: 40,
    color: '#F5F5FA', fontSize: 14,
    minHeight: 100, textAlignVertical: 'top',
  },
  reflectionEditIcon: { position: 'absolute', bottom: 10, right: 10 },
  reflectionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  reflectionMetaText: {
    color: '#5B5B70', fontSize: 10, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
  },

  bottomCTAWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingBottom: 24, paddingTop: 12,
    backgroundColor: 'rgba(11, 11, 20, 0.95)',
  },
  ctaShadow: {
    borderRadius: 18,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 20,
    elevation: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18, borderRadius: 18, gap: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16, fontWeight: '800', letterSpacing: 0.3,
  },
  ctaHint: {
    color: '#5B5B70', fontSize: 10, fontWeight: '700',
    letterSpacing: 2, textAlign: 'center',
    textTransform: 'uppercase', marginTop: 12,
  },

  celebration: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(11, 11, 20, 0.96)',
    zIndex: 999,
  },
  celebrationTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A42',
    backgroundColor: '#0B0B14',
  },
  celebrationTopTitle: {
    color: '#F5F5FA', fontSize: 17, fontWeight: '700',
  },
  celebrationCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  celebrationEmojiWrap: {
    position: 'relative',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationEmoji: {
    fontSize: 120,
    textShadowColor: 'rgba(245, 158, 11, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  celebrationRing: {
    position: 'absolute',
    width: 180, height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  celebrationXP: {
    color: '#FDE047',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(253, 224, 71, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  celebrationHeading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  celebrationSubtitle: {
    color: '#9898B0',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 280,
  },
});
