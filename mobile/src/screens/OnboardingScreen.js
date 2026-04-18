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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🔥',
    title: 'Ascend: Monk Mode',
    subtitle: 'Disiplini seç. Sprint\'ini tamamla. Kendini dönüştür.',
  },
  {
    emoji: '🎯',
    title: '30 / 60 / 90 Gün',
    subtitle:
      'Dopamine Detox, Fitness, Business, Early Riser, Money, Reading — sana uygun sprint\'i seç.',
  },
  {
    emoji: '🏆',
    title: 'Kurallar & Görevler',
    subtitle:
      'Her sprint\'in kuralları ve günlük görevleri var. Tamamla, XP kazan, sertifikanı al.',
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();

  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);

  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const goToPage = (page) => {
    scrollRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
    setCurrentPage(page);
  };

  const handleNext = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    if (currentPage < SLIDES.length - 1) {
      goToPage(currentPage + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleScroll = (event) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const isLastSlide = currentPage === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
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
          onMomentumScrollEnd={handleScroll}
          style={styles.scrollView}
        >
          {SLIDES.map((slide, i) => (
            <View key={i} style={[styles.slide, { width: SCREEN_WIDTH }]}>
              <View style={styles.slideInner}>
                <Text style={styles.heroEmoji}>{slide.emoji}</Text>
                <Text style={styles.slideTitle}>{slide.title}</Text>
                <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
          <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
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
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3a3a5a',
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
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
