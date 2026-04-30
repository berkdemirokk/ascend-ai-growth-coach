import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Animated,
  Easing,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated2, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
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
        {/* Hero ambient glow */}
        <View style={styles.heroGlow} pointerEvents="none" />

        {step === 'welcome' ? (
          <WelcomeStep t={t} />
        ) : (
          <PickPathStep
            t={t}
            selectedPath={selectedPath}
            onSelect={setSelectedPath}
          />
        )}

        <Animated2.View style={[styles.bottomArea, animatedButtonStyle]}>
          {/* Step dots */}
          <View style={styles.dots}>
            {STEPS.map((s, i) => {
              const active = step === s;
              return (
                <View
                  key={s}
                  style={[
                    styles.dot,
                    active && styles.dotActive,
                  ]}
                />
              );
            })}
          </View>

          {/* Primary CTA — gradient with shine */}
          <TouchableOpacity onPress={handleNext} activeOpacity={0.9} style={styles.primaryWrap}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                {step === 'welcome'
                  ? t('onboarding.cta', 'Başla')
                  : t('onboarding.startPath', 'Bu yolu başlat')}
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Caption */}
          <Text style={styles.caption}>
            {step === 'welcome'
              ? t('onboarding.captionWelcome', 'STRATEJİK ODAKLANMA BAŞLATILIYOR')
              : t('onboarding.captionPickPath', 'YOLUNU SEÇ')}
          </Text>
        </Animated2.View>
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

  // Subtle pulse on hero
  const ringSpin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 60000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [ringSpin]);
  const spin = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ScrollView
      contentContainerStyle={styles.welcomeContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero with progress ring decoration */}
      <View style={styles.heroWrap}>
        <Animated.View style={[styles.ringDecor, { transform: [{ rotate: spin }] }]} />
        <View style={styles.heroCircle}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Title block */}
      <Text style={styles.title}>{t('onboarding.title', 'MONK MODE').toUpperCase()}</Text>
      <Text style={styles.subtitle}>{t('onboarding.subtitle', 'Disiplini seç. Yolu yürü. Kendini dönüştür.')}</Text>

      {/* Glass-card features */}
      <View style={styles.featuresContainer}>
        <FeatureCard
          icon="menu-book"
          iconColor="#A5B4FC"
          tint="rgba(99, 102, 241, 0.15)"
          border="rgba(99, 102, 241, 0.25)"
          title={t('onboarding.bullet1', 'Her gün tek ders')}
          subtitle={t('onboarding.bullet1Sub', 'Odaklanmış gelişim için mikro öğrenme.')}
        />
        <FeatureCard
          icon="psychology"
          iconColor="#C4B5FD"
          tint="rgba(139, 92, 246, 0.15)"
          border="rgba(139, 92, 246, 0.25)"
          title={t('onboarding.bullet2', 'Quiz ile pekiştir')}
          subtitle={t('onboarding.bullet2Sub', 'Bilgini anında test et ve kalıcı kıl.')}
        />
        <FeatureCard
          icon="favorite"
          iconColor="#FCA5A5"
          tint="rgba(239, 68, 68, 0.15)"
          border="rgba(239, 68, 68, 0.25)"
          title={t('onboarding.bullet3', 'Kalpleri kaybetme')}
          subtitle={t('onboarding.bullet3Sub', 'Serini koru ve ustalık seviyeni yükselt.')}
        />
      </View>

      {/* Language picker — minimal */}
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
    </ScrollView>
  );
}

function FeatureCard({ icon, iconColor, tint, border, title, subtitle }) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIconBox, { backgroundColor: tint, borderColor: border }]}>
        <MaterialIcons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function PickPathStep({ t, selectedPath, onSelect }) {
  return (
    <View style={styles.pickPathContent}>
      <Text style={styles.pickTitle}>
        {t('onboarding.pickPathTitle', 'Hangi disipline odaklanacaksın?')}
      </Text>
      <Text style={styles.pickSubtitle}>
        {t('onboarding.pickPathSubtitle', 'Gelişim yolculuğuna başlamak için temel bir yol seç.')}
      </Text>
      <ScrollView
        contentContainerStyle={styles.pathGrid}
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
                styles.pathGridCard,
                {
                  borderColor: isSelected ? p.color : `${p.color}4D`,
                  borderWidth: isSelected ? 2 : 1,
                  backgroundColor: isSelected
                    ? `${p.color}15`
                    : 'rgba(22, 22, 38, 0.7)',
                  shadowColor: isSelected ? p.color : 'transparent',
                  shadowOpacity: isSelected ? 0.4 : 0,
                  shadowRadius: 16,
                  shadowOffset: { width: 0, height: 0 },
                  elevation: isSelected ? 6 : 0,
                },
              ]}
            >
              {isSelected && (
                <View style={styles.pathCheckBadge}>
                  <MaterialIcons name="check-circle" size={20} color={p.color} />
                </View>
              )}
              <View style={styles.pathGridIconBox}>
                <MaterialIcons name={p.materialIcon} size={32} color={p.color} />
              </View>
              <Text style={styles.pathGridName}>
                {t(`paths.${p.id}.title`, p.id)}
              </Text>
              <Text style={styles.pathGridDuration}>
                {t('path.lessonsCount', '{{count}} ders', { count: p.duration })}
              </Text>
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

  heroGlow: {
    position: 'absolute',
    top: '8%',
    left: '50%',
    width: 300,
    height: 300,
    marginLeft: -150,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    opacity: 0.6,
    transform: [{ scale: 1.4 }],
  },

  // Welcome
  welcomeContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
    flexGrow: 1,
  },
  heroWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ringDecor: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  heroCircle: {
    width: 184,
    height: 184,
    borderRadius: 92,
    overflow: 'hidden',
    backgroundColor: '#1B1B23',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: { width: '100%', height: '100%' },

  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#9898B0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
    fontWeight: '500',
  },

  // Glass cards
  featuresContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 31, 51, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(42, 42, 66, 0.7)',
    borderRadius: 14,
    padding: 14,
    gap: 14,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  featureText: { flex: 1 },
  featureTitle: {
    color: '#E0E7FF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureSubtitle: {
    color: '#8B8BA8',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Language picker
  langRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 8,
  },
  langBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#2A2A42',
    backgroundColor: 'rgba(22, 22, 38, 0.6)',
  },
  langBtnActive: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
  },
  langFlag: { fontSize: 18, marginBottom: 2 },
  langLabel: { fontSize: 11, color: '#9898B0', fontWeight: '600' },
  langLabelActive: { color: '#FFFFFF', fontWeight: '700' },

  // Pick path step
  pickPathContent: { flex: 1, paddingTop: 40 },
  pickTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  pickSubtitle: {
    fontSize: 13,
    color: '#9898B0',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
    fontWeight: '500',
  },
  pathGrid: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  pathGridCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  pathCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
  pathGridIconBox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pathGridName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  pathGridDuration: {
    color: '#9898B0',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Bottom area
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 8,
    alignItems: 'center',
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34343D',
  },
  dotActive: {
    backgroundColor: '#6366F1',
    width: 28,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  primaryWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  caption: {
    fontSize: 10,
    color: '#5B5B70',
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
