import React, { useState, useRef } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useApp } from '../contexts/AppContext';
import { COLORS } from '../config/constants';
import { ASSESSMENT_QUESTIONS, buildUserProfile } from '../config/assessment';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INTRO_SLIDES = [
  {
    emoji: '🔥',
    title: 'Ascend: Monk Mode',
    subtitle: "Disiplini seç. Sprint'ini tamamla. Kendini dönüştür.",
  },
  {
    emoji: '🎯',
    title: '30 / 60 / 90 Gün',
    subtitle:
      "Dopamine Detox, Fitness, Business, Early Riser, Money, Reading — sana uygun sprint'i seç.",
  },
  {
    emoji: '🏆',
    title: "Kurallar, Görevler, Tier'lar",
    subtitle:
      "Her sprint'te günlük görevler rotasyonda. Bitirdikçe daha zor tier'lar açılıyor. Günlük mini challenge'lar bonus XP.",
  },
];

const totalSlideCount = INTRO_SLIDES.length + ASSESSMENT_QUESTIONS.length;

export default function OnboardingScreen() {
  const { completeOnboarding, setUserProfile } = useApp();

  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});

  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const goToPage = (page) => {
    scrollRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
    setCurrentPage(page);
  };

  const isIntroPage = currentPage < INTRO_SLIDES.length;
  const currentQuestionIndex = currentPage - INTRO_SLIDES.length;
  const currentQuestion =
    currentQuestionIndex >= 0
      ? ASSESSMENT_QUESTIONS[currentQuestionIndex]
      : null;

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const hasAnswer = currentQuestion
    ? currentQuestion.multi
      ? Array.isArray(currentAnswer) && currentAnswer.length > 0
      : !!currentAnswer
    : true;

  const toggleOption = (questionId, optionId, multi) => {
    setAnswers((prev) => {
      if (multi) {
        const existing = Array.isArray(prev[questionId]) ? prev[questionId] : [];
        const next = existing.includes(optionId)
          ? existing.filter((id) => id !== optionId)
          : [...existing, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  const handleNext = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    if (currentPage < totalSlideCount - 1) {
      goToPage(currentPage + 1);
    } else {
      const profile = buildUserProfile(answers);
      setUserProfile(profile);
      completeOnboarding();
    }
  };

  const isLastSlide = currentPage === totalSlideCount - 1;
  const canContinue = isIntroPage || hasAnswer;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        <View style={styles.dotsContainer}>
          {Array.from({ length: totalSlideCount }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, currentPage === i && styles.dotActive]}
            />
          ))}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.scrollView}
        >
          {INTRO_SLIDES.map((slide, i) => (
            <View
              key={`intro-${i}`}
              style={[styles.slide, { width: SCREEN_WIDTH }]}
            >
              <View style={styles.slideInner}>
                <Text style={styles.heroEmoji}>{slide.emoji}</Text>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
              </View>
            </View>
          ))}

          {ASSESSMENT_QUESTIONS.map((q) => {
            const answer = answers[q.id];
            return (
              <ScrollView
                key={q.id}
                style={{ width: SCREEN_WIDTH }}
                contentContainerStyle={styles.qContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.qTitle}>{q.title}</Text>
                <Text style={styles.qSubtitle}>{q.subtitle}</Text>
                <View style={styles.optionsWrap}>
                  {q.options.map((opt) => {
                    const selected = q.multi
                      ? Array.isArray(answer) && answer.includes(opt.id)
                      : answer === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.optionCard,
                          selected && styles.optionCardSelected,
                        ]}
                        onPress={() => toggleOption(q.id, opt.id, q.multi)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                        <Text
                          style={[
                            styles.optionLabel,
                            selected && styles.optionLabelSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {selected && <Text style={styles.optionCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {q.multi && (
                  <Text style={styles.multiHint}>
                    Birden fazla seçebilirsin
                  </Text>
                )}
              </ScrollView>
            );
          })}
        </ScrollView>

        <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            disabled={!canContinue}
          >
            <LinearGradient
              colors={
                canContinue
                  ? [COLORS.primary, COLORS.accent]
                  : ['#3a3a5a', '#3a3a5a']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {isLastSlide ? 'Sprint Seç' : 'Devam'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
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
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    gap: 6,
    flexWrap: 'wrap',
    paddingHorizontal: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3a3a5a',
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 18,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
  },
  slideInner: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  heroEmoji: {
    fontSize: 96,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  slideSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  qContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  qTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  qSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsWrap: {
    gap: 10,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161626',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A42',
    padding: 14,
    gap: 12,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#6366F115',
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionLabel: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  optionLabelSelected: {
    fontWeight: '700',
  },
  optionCheck: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
  },
  multiHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  buttonWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
