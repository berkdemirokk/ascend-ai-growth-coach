import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Off-screen renderable card for sharing streak as PNG.
 * Sized for Instagram Story (1080×1920 → scaled down by view-shot).
 * Pass ref + capture with view-shot.
 */
const StreakShareCard = forwardRef(({ streak, name, lang = 'tr' }, ref) => {
  const labels = {
    tr: { streak: 'gün streak', tagline: 'Disiplin. Odak. Tekrar.', cta: 'Sen de katıl', appName: 'Ascend Monk Mode' },
    en: { streak: 'day streak', tagline: 'Discipline. Focus. Repeat.', cta: 'Join me', appName: 'Ascend Monk Mode' },
    ar: { streak: 'يوم متتابع', tagline: 'انضباط. تركيز. تكرار.', cta: 'انضم', appName: 'وضع الراهب' },
  };
  const L = labels[lang] || labels.en;

  return (
    <View ref={ref} collapsable={false} style={styles.container}>
      <LinearGradient
        colors={['#0B0B14', '#2D1B0E', '#5B1F0A', '#0B0B14']}
        locations={[0, 0.4, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Top brand */}
        <Text style={styles.brand}>{L.appName}</Text>

        {/* Hero flame + number */}
        <View style={styles.hero}>
          <Text style={styles.flame}>🔥</Text>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakLabel}>{L.streak}</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>{L.tagline}</Text>

        {/* CTA */}
        <View style={styles.ctaBox}>
          <Text style={styles.cta}>{L.cta}</Text>
          <Text style={styles.handle}>@ascend.monkmode</Text>
        </View>
      </LinearGradient>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: 540,
    height: 960, // 9:16 instagram story
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  brand: {
    position: 'absolute',
    top: 50,
    color: '#F5F5FA',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
    opacity: 0.85,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  flame: {
    fontSize: 180,
    marginBottom: 8,
  },
  streakNumber: {
    color: '#FDE047',
    fontSize: 220,
    fontWeight: '900',
    lineHeight: 220,
    letterSpacing: -8,
    textShadowColor: 'rgba(245, 158, 11, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  streakLabel: {
    color: '#F59E0B',
    fontSize: 28,
    fontWeight: '800',
    marginTop: -10,
    letterSpacing: 1,
  },
  tagline: {
    color: '#F5F5FA',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 60,
    opacity: 0.95,
  },
  ctaBox: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  cta: {
    color: '#F5F5FA',
    fontSize: 18,
    fontWeight: '600',
    opacity: 0.7,
  },
  handle: {
    color: '#FDE047',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
});

export default StreakShareCard;
