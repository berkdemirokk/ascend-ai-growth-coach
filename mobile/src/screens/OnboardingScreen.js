import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { useApp } from '../contexts/AppContext';
import { COLORS } from '../config/constants';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { completeOnboarding, setUserProfile } = useApp();

  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleStart = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    setUserProfile({ goals: ['discipline'], answers: {} });
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.title}>{t('onboarding.title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>

          <View style={styles.bullets}>
            <Text style={styles.bullet}>• {t('onboarding.bullet1')}</Text>
            <Text style={styles.bullet}>• {t('onboarding.bullet2')}</Text>
            <Text style={styles.bullet}>• {t('onboarding.bullet3')}</Text>
          </View>
        </View>

        <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
          <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>{t('onboarding.cta')}</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 96,
    marginBottom: 32,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  bullets: {
    alignSelf: 'stretch',
    gap: 8,
  },
  bullet: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 24,
  },
  buttonWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
