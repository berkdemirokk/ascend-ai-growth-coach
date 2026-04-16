import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';
import { RARITY_COLORS } from '../config/achievements';

const AchievementUnlockModal = ({ visible, achievement, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      iconScaleAnim.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(iconScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 8,
          bounciness: 12,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim, iconScaleAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  if (!achievement) return null;

  const rarityColor = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;
  const rarityLabel = achievement.rarity
    ? achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)
    : 'Common';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View
          style={[
            styles.cardWrapper,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.card}>
            {/* Header */}
            <Text style={styles.headerText}>Achievement Unlocked!</Text>

            {/* Achievement icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  borderColor: rarityColor + '60',
                  transform: [{ scale: iconScaleAnim }],
                },
              ]}
            >
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
            </Animated.View>

            {/* Title */}
            <Text style={styles.achievementTitle}>{achievement.title}</Text>

            {/* Description */}
            <Text style={styles.achievementDescription}>
              {achievement.description}
            </Text>

            {/* Rarity badge */}
            <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
              <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
              <Text style={[styles.rarityText, { color: rarityColor }]}>
                {rarityLabel}
              </Text>
            </View>

            {/* Dismiss button */}
            <TouchableOpacity
              style={styles.dismissButton}
              activeOpacity={0.85}
              onPress={handleClose}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.dismissGradient}
              >
                <Text style={styles.dismissText}>Awesome!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 340,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 24,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
  },
  achievementIcon: {
    fontSize: 44,
  },
  achievementTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 28,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  rarityText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dismissButton: {
    width: '100%',
  },
  dismissGradient: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default AchievementUnlockModal;
