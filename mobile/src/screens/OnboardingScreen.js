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
import { CATEGORIES, DIFFICULTIES, COLORS } from '../config/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { completeOnboarding, setCategories, setDifficulty } = useApp();

  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const goToPage = (page) => {
    scrollRef.current?.scrollTo({ x: page * SCREEN_WIDTH, animated: true });
    setCurrentPage(page);
  };

  const toggleCategory = (categoryKey) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryKey)
        ? prev.filter((k) => k !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const handleGetStarted = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    goToPage(1);
  };

  const handleCategoryContinue = () => {
    if (selectedCategories.length === 0) return;
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    goToPage(2);
  };

  const handleStartJourney = () => {
    if (!selectedDifficulty) return;
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    setCategories(selectedCategories);
    setDifficulty(selectedDifficulty);
    completeOnboarding();
  };

  const handleScroll = (event) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  // --- Slide 1: Welcome ---
  const WelcomeSlide = () => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.slideInner}>
        <Text style={styles.heroEmoji}>🚀</Text>
        <Text style={styles.slideTitle}>Welcome to Ascend</Text>
        <Text style={styles.slideSubtitle}>
          Level up your life, one action at a time
        </Text>
      </View>
      <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
        <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.85}>
          <LinearGradient
            colors={[COLORS.primary || '#6366F1', COLORS.accent || '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // --- Slide 2: Category Selection ---
  const CategorySlide = () => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.slideInner}>
        <Text style={styles.slideTitle}>Choose Your Focus Areas</Text>
        <Text style={styles.slideSubtitle}>
          Select the areas you want to improve
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
                onPress={() => toggleCategory(category.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
                <Text style={styles.categoryLabel}>{category.label}</Text>
                {category.description ? (
                  <Text style={styles.categoryDescription} numberOfLines={2}>
                    {category.description}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
        <TouchableOpacity
          onPress={handleCategoryContinue}
          activeOpacity={selectedCategories.length > 0 ? 0.85 : 1}
        >
          <LinearGradient
            colors={
              selectedCategories.length > 0
                ? [COLORS.primary || '#6366F1', COLORS.accent || '#8B5CF6']
                : ['#3a3a4a', '#3a3a4a']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.primaryButton,
              selectedCategories.length === 0 && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  // --- Slide 3: Difficulty Selection ---
  const DifficultySlide = () => (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.slideInner}>
        <Text style={styles.slideTitle}>Choose Your Level</Text>
        <Text style={styles.slideSubtitle}>
          Pick a challenge level that suits your lifestyle
        </Text>
        <View style={styles.difficultyList}>
          {DIFFICULTIES.map((difficulty) => {
            const isSelected = selectedDifficulty === difficulty.id;
            return (
              <TouchableOpacity
                key={difficulty.id}
                style={[
                  styles.difficultyCard,
                  isSelected && styles.difficultyCardSelected,
                ]}
                onPress={() => setSelectedDifficulty(difficulty.id)}
                activeOpacity={0.8}
              >
                <View style={styles.difficultyCardLeft}>
                  <Text style={styles.difficultyIcon}>{difficulty.icon}</Text>
                  <View style={styles.difficultyText}>
                    <Text style={styles.difficultyLabel}>{difficulty.label}</Text>
                    {difficulty.description ? (
                      <Text style={styles.difficultyDescription}>
                        {difficulty.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
        <TouchableOpacity
          onPress={handleStartJourney}
          activeOpacity={selectedDifficulty ? 0.85 : 1}
        >
          <LinearGradient
            colors={
              selectedDifficulty
                ? [COLORS.primary || '#6366F1', COLORS.accent || '#8B5CF6']
                : ['#3a3a4a', '#3a3a4a']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.primaryButton,
              !selectedDifficulty && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>Start Your Journey</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0B0B14', '#161626']}
        style={styles.container}
      >
        {/* Page indicator dots */}
        <View style={styles.dotsContainer}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, currentPage === i && styles.dotActive]}
            />
          ))}
        </View>

        {/* Paged ScrollView */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          onMomentumScrollEnd={handleScroll}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <WelcomeSlide />
          <CategorySlide />
          <DifficultySlide />
        </ScrollView>
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
    backgroundColor: '#6366F1',
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  slideInner: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  heroEmoji: {
    fontSize: 96,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F5FA',
    textAlign: 'center',
    marginBottom: 12,
  },
  slideSubtitle: {
    fontSize: 16,
    color: '#9B9BB0',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonWrapper: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#F5F5FA',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 72) / 2,
    backgroundColor: '#161626',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a3a',
  },
  categoryCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#1e1e32',
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    color: '#F5F5FA',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryDescription: {
    color: '#9B9BB0',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  // Difficulty list
  difficultyList: {
    width: '100%',
    gap: 12,
  },
  difficultyCard: {
    backgroundColor: '#161626',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#2a2a3a',
  },
  difficultyCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#1e1e32',
  },
  difficultyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  difficultyIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  difficultyText: {
    flex: 1,
  },
  difficultyLabel: {
    color: '#F5F5FA',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  difficultyDescription: {
    color: '#9B9BB0',
    fontSize: 13,
    lineHeight: 18,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3a3a5a',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioCircleSelected: {
    borderColor: '#6366F1',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
  },
});
