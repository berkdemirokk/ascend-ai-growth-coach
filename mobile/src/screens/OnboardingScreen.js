import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
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
import { PATHS } from '../data/paths';
import { setLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES } from '../i18n';

const STEPS = ['welcome', 'pickPath'];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { completeOnboarding, setUserProfile, setActivePath } = useApp();
  const [step, setStep] = useState('welcome');
  const [selectedPath, setSelectedPath] = useState('dopamine-detox');

  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleNext = () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });

    if (step === 'welcome') {
      setStep('pickPath');
    } else {
      setUserProfile({ goals: ['discipline'], answers: {} });
      setActivePath(selectedPath);
      completeOnboarding();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        {step === 'welcome' ? <WelcomeStep t={t} /> : (
          <PickPathStep
            t={t}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
          />
        )}

        <Animated.View style={[styles.buttonWrapper, animatedButtonStyle]}>
          <TouchableOpacity onPress={handleNext} activeOpacity={0.85}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {step === 'welcome'
                  ? t('onboarding.cta', 'Başla')
                  : t('onboarding.startPath', 'Bu yolu başlat')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Step dots */}
        <View style={styles.dots}>
          {STEPS.map((s) => (
            <View
              key={s}
              style={[styles.dot, step === s && styles.dotActive]}
            />
          ))}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

function WelcomeStep({ t }) {
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const handleChangeLang = async (code) => {
    await setLanguage(code);
    setCurrentLang(code);
  };

  return (
    <View style={styles.welcomeContent}>
      <Text style={styles.emoji}>🔥</Text>
      <Text style={styles.title}>{t('onboarding.title', 'Monk Mode')}</Text>
      <Text style={styles.subtitle}>{t('onboarding.subtitle')}</Text>
      <View style={styles.bullets}>
        <Text style={styles.bullet}>• {t('onboarding.bullet1')}</Text>
        <Text style={styles.bullet}>• {t('onboarding.bullet2')}</Text>
        <Text style={styles.bullet}>• {t('onboarding.bullet3')}</Text>
      </View>

      {/* Language picker */}
      <View style={styles.langRow}>
        {SUPPORTED_LANGUAGES.map((l) => {
          const active = currentLang === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              onPress={() => handleChangeLang(l.code)}
              activeOpacity={0.7}
              style={[styles.langBtn, active && styles.langBtnActive]}
            >
              <Text style={styles.langFlag}>{l.flag}</Text>
              <Text style={[styles.langLabel, active && styles.langLabelActive]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function PickPathStep({ t, selectedPath, onSelect }) {
  return (
    <View style={styles.pickPathContent}>
      <Text style={styles.pickTitle}>
        {t('onboarding.pickPathTitle', 'Hangi disiplinle başlayacaksın?')}
      </Text>
      <Text style={styles.pickSubtitle}>
        {t('onboarding.pickPathSubtitle', 'İlk yolun bu olacak. Sonra diğer yollara geçebilirsin.')}
      </Text>
      <ScrollView
        contentContainerStyle={styles.pathList}
        showsVerticalScrollIndicator={false}
      >
        {PATHS.map((p) => {
          const isSelected = selectedPath === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => onSelect(p.id)}
              activeOpacity={0.85}
              style={[
                styles.pathCard,
                isSelected && {
                  borderColor: p.color,
                  backgroundColor: `${p.color}22`,
                },
              ]}
            >
              <Text style={styles.pathIcon}>{p.icon}</Text>
              <View style={styles.pathInfo}>
                <Text style={styles.pathName}>
                  {t(`paths.${p.id}.title`, p.id)}
                </Text>
                <Text style={styles.pathSubtitle} numberOfLines={2}>
                  {t(`paths.${p.id}.subtitle`, '')}
                </Text>
              </View>
              {isSelected && (
                <Text style={[styles.pathCheck, { color: p.color }]}>✓</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1 },

  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: { fontSize: 80, marginBottom: 28 },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  bullets: { alignSelf: 'stretch', gap: 8 },
  bullet: { fontSize: 14, color: COLORS.text, lineHeight: 22 },

  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
    alignSelf: 'stretch',
  },
  langBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2A2A42',
    backgroundColor: '#161626',
  },
  langBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#6366F125',
  },
  langFlag: { fontSize: 18, marginBottom: 2 },
  langLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  langLabelActive: { color: '#FFFFFF', fontWeight: '700' },

  pickPathContent: { flex: 1, paddingTop: 24 },
  pickTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  pickSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  pathList: { paddingHorizontal: 20, gap: 10, paddingBottom: 16 },
  pathCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161626',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2A2A42',
    padding: 14,
    gap: 12,
  },
  pathIcon: { fontSize: 32 },
  pathInfo: { flex: 1 },
  pathName: { color: COLORS.text, fontSize: 15, fontWeight: '800', marginBottom: 2 },
  pathSubtitle: { color: COLORS.textSecondary, fontSize: 12 },
  pathCheck: { fontSize: 24, fontWeight: '900' },

  buttonWrapper: { paddingHorizontal: 24, paddingBottom: 16 },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 24,
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3a3a5a' },
  dotActive: { backgroundColor: COLORS.primary, width: 18 },
});
