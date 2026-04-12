import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, PAYWALL_FEATURES } from '../config/constants';

const PaywallModal = ({ visible, onClose, onSubscribe, onRestore }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(50);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          speed: 14,
          bounciness: 6,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, opacityAnim]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 50,
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
            styles.contentWrapper,
            {
              transform: [{ translateY: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.container}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Header */}
              <Text style={styles.premiumIcon}>👑</Text>
              <Text style={styles.headerTitle}>Go Premium</Text>
              <Text style={styles.headerSubtitle}>
                Unlock the full Ascend experience
              </Text>

              {/* Features list */}
              <View style={styles.featuresList}>
                {PAYWALL_FEATURES.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <View style={styles.featureIconContainer}>
                      <Text style={styles.featureIcon}>{feature.icon}</Text>
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>
                        {feature.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Price */}
              <View style={styles.priceContainer}>
                <Text style={styles.priceAmount}>$2.99</Text>
                <Text style={styles.pricePeriod}>/month</Text>
              </View>
              <Text style={styles.priceNote}>Cancel anytime</Text>

              {/* Subscribe button */}
              <TouchableOpacity
                style={styles.subscribeButton}
                activeOpacity={0.85}
                onPress={onSubscribe}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.subscribeGradient}
                >
                  <Text style={styles.subscribeText}>Subscribe Now</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Restore purchases */}
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={onRestore}
              >
                <Text style={styles.restoreText}>Restore Purchases</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    maxHeight: '90%',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
  premiumIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 28,
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.text,
  },
  pricePeriod: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginLeft: 2,
  },
  priceNote: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  subscribeButton: {
    width: '100%',
    marginBottom: 14,
  },
  subscribeGradient: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  restoreButton: {
    paddingVertical: 12,
  },
  restoreText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PaywallModal;
