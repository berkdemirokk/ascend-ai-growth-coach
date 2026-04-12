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

const LevelUpModal = ({ visible, level, title, onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
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
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

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
            {/* Sparkle decoration */}
            <Text style={styles.sparkles}>✨ ⭐ ✨</Text>

            {/* Congratulations */}
            <Text style={styles.congratsText}>Congratulations!</Text>
            <Text style={styles.subText}>You leveled up!</Text>

            {/* Level display */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              style={styles.levelCircle}
            >
              <Text style={styles.levelNumber}>{level}</Text>
            </LinearGradient>

            {/* Level title */}
            <Text style={styles.levelTitle}>{title}</Text>

            {/* Bottom sparkles */}
            <Text style={styles.sparklesBottom}>🌟 ⭐ 🌟</Text>

            {/* Continue button */}
            <TouchableOpacity
              style={styles.continueButton}
              activeOpacity={0.85}
              onPress={handleClose}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.continueGradient}
              >
                <Text style={styles.continueText}>Continue</Text>
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
    borderColor: COLORS.primary + '40',
  },
  sparkles: {
    fontSize: 28,
    marginBottom: 16,
    letterSpacing: 8,
  },
  congratsText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  levelCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelNumber: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 8,
  },
  sparklesBottom: {
    fontSize: 20,
    marginBottom: 24,
    letterSpacing: 6,
  },
  continueButton: {
    width: '100%',
  },
  continueGradient: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default LevelUpModal;
