// MonkMascot — geometric monk avatar that displays different moods.
// Emoji-driven for now (no SVG/PNG assets needed). Pulses subtly when active.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MOOD_EMOJI = {
  idle: '🧘',
  happy: '😄',
  excited: '🎉',
  proud: '💪',
  concerned: '😟',
  sleeping: '😴',
};

const MOOD_GRADIENT = {
  idle: ['#3B3B5A', '#1F1F33'],
  happy: ['#10B981', '#059669'],
  excited: ['#FDE047', '#F59E0B'],
  proud: ['#6366F1', '#4F46E5'],
  concerned: ['#EF4444', '#B91C1C'],
  sleeping: ['#374151', '#1F2937'],
};

export default function MonkMascot({
  mood = 'idle',
  size = 64,
  pulse = true,
  message = null,
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, scale]);

  const emoji = MOOD_EMOJI[mood] || MOOD_EMOJI.idle;
  const gradient = MOOD_GRADIENT[mood] || MOOD_GRADIENT.idle;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.bubble,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.emoji, { fontSize: size * 0.55 }]}>{emoji}</Text>
        </LinearGradient>
      </Animated.View>
      {message ? (
        <View style={styles.bubbleTip}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  emoji: { textAlign: 'center' },
  bubbleTip: {
    marginTop: 8,
    backgroundColor: '#161626',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A42',
    maxWidth: 220,
  },
  bubbleText: {
    color: '#F5F5FA',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
});
