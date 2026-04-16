import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, CATEGORIES } from '../config/constants';

const ActionCard = ({ action, onComplete, completed, category }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const categoryData = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const categoryColor = categoryData.color;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handleComplete = useCallback(() => {
    if (completed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete?.();
  }, [completed, onComplete]);

  if (!action) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.card, { borderLeftColor: categoryColor }]}>
        {/* Category header */}
        <View style={styles.categoryRow}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <Text style={styles.categoryIcon}>{categoryData.icon}</Text>
            <Text style={[styles.categoryLabel, { color: categoryColor }]}>
              {categoryData.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{action.title}</Text>

        {/* Description */}
        {action.description ? (
          <Text style={styles.description}>{action.description}</Text>
        ) : null}

        {/* Duration badge */}
        {action.duration ? (
          <View style={styles.durationRow}>
            <View style={styles.durationBadge}>
              <Text style={styles.durationIcon}>⏱</Text>
              <Text style={styles.durationText}>{action.duration}</Text>
            </View>
          </View>
        ) : null}

        {/* Complete button */}
        <TouchableOpacity
          activeOpacity={completed ? 1 : 0.85}
          onPressIn={completed ? undefined : handlePressIn}
          onPressOut={completed ? undefined : handlePressOut}
          onPress={handleComplete}
          disabled={completed}
          style={styles.buttonWrapper}
        >
          {completed ? (
            <View style={styles.completedButton}>
              <Text style={styles.completedButtonText}>✓ Completed</Text>
            </View>
          ) : (
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.completeButton}
            >
              <Text style={styles.completeButtonText}>Complete Action</Text>
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 26,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 14,
  },
  durationRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  durationIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  durationText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  buttonWrapper: {
    marginTop: 4,
  },
  completeButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  completedButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '20',
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  completedButtonText: {
    color: COLORS.success,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default ActionCard;
