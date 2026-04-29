import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

/**
 * Pulsing skeleton placeholder.
 * Usage: <Skeleton width={200} height={20} radius={6} />
 */
export default function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: '#2A2A42',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonRow({ width = '60%', height = 14 }) {
  return <Skeleton width={width} height={height} style={{ marginVertical: 4 }} />;
}

export function PathSkeleton() {
  return (
    <View style={styles.pathSkeleton}>
      <Skeleton width={64} height={64} radius={18} style={{ marginBottom: 12 }} />
      <Skeleton width={180} height={24} radius={6} style={{ marginBottom: 6 }} />
      <Skeleton width={120} height={12} radius={4} style={{ marginBottom: 16 }} />
      <Skeleton width={240} height={8} radius={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  pathSkeleton: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
  },
});
