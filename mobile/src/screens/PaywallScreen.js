import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { PAYWALL_FEATURES } from '../config/constants';
import { purchasePremium, restorePurchases } from '../services/purchases';

export default function PaywallScreen({ navigation }) {
  const { setPremium } = useApp();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const success = await purchasePremium();
      if (success) {
        setPremium(true);
        navigation.goBack();
      } else {
        Alert.alert('Purchase Failed', 'Your purchase could not be completed. Please try again.');
      }
    } catch (e) {
      Alert.alert('Purchase Failed', e?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        setPremium(true);
        navigation.goBack();
      } else {
        Alert.alert(
          'No Purchases Found',
          'We could not find any previous purchases for your account.'
        );
      }
    } catch (e) {
      Alert.alert('Restore Failed', e?.message || 'An unexpected error occurred.');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.crownEmoji}>👑</Text>
          <Text style={styles.title}>Go Premium</Text>
          <Text style={styles.subtitle}>Unlock your full potential</Text>
        </View>

        {/* Features list */}
        <View style={styles.featuresContainer}>
          {(PAYWALL_FEATURES || []).map((feature, index) => (
            <View key={feature.id || index} style={styles.featureCard}>
              <View style={styles.featureIconWrapper}>
                <Text style={styles.featureIcon}>{feature.icon || '✦'}</Text>
              </View>
              <View style={styles.featureTextBlock}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Price card */}
        <View style={styles.priceCard}>
          <Text style={styles.priceAmount}>$2.99</Text>
          <Text style={styles.pricePeriod}>/month</Text>
          <Text style={styles.priceSubtext}>Cancel anytime</Text>
        </View>

        {/* Subscribe button */}
        <TouchableOpacity
          style={[styles.subscribeButton, isSubscribing && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={isSubscribing || isRestoring}
          activeOpacity={0.85}
        >
          <View style={styles.gradientOverlay} />
          {isSubscribing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          )}
        </TouchableOpacity>

        {/* Restore button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isSubscribing || isRestoring}
          activeOpacity={0.7}
        >
          {isRestoring ? (
            <ActivityIndicator color="#9898B0" size="small" />
          ) : (
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing you agree to our Terms of Service
        </Text>
      </ScrollView>
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
    backgroundColor: '#0B0B14',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#161626',
    borderWidth: 1,
    borderColor: '#2A2A42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#9898B0',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  crownEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F5F5FA',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#9898B0',
    marginTop: 6,
    fontWeight: '400',
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 28,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161626',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2A42',
    padding: 16,
    gap: 14,
  },
  featureIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F115',
    borderWidth: 1,
    borderColor: '#6366F130',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTextBlock: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5F5FA',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 13,
    color: '#9898B0',
    lineHeight: 18,
  },
  priceCard: {
    backgroundColor: '#161626',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A42',
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  priceAmount: {
    fontSize: 52,
    fontWeight: '800',
    color: '#F5F5FA',
    letterSpacing: -1,
    lineHeight: 56,
  },
  pricePeriod: {
    fontSize: 18,
    color: '#9898B0',
    fontWeight: '500',
    marginTop: -4,
  },
  priceSubtext: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  subscribeButton: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 58,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#8B5CF620',
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  restoreButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  restoreButtonText: {
    fontSize: 15,
    color: '#9898B0',
    fontWeight: '500',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#6B6B85',
    lineHeight: 16,
    marginTop: 8,
    paddingHorizontal: 24,
  },
});
