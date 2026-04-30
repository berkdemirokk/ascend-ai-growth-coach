// OutOfHeartsModal — shown when hearts === 0 and user tries to start a lesson.
// Two paths to refill: watch a rewarded ad OR upgrade to premium.

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { showRewarded, isAdsReady } from '../services/ads';

export default function OutOfHeartsModal({
  visible,
  onClose,
  onRefill,
  onPaywall,
  refillMins = null,
}) {
  const { t } = useTranslation();
  const [watching, setWatching] = useState(false);

  const handleWatchAd = async () => {
    if (watching) return;
    setWatching(true);
    try {
      const earned = await showRewarded();
      if (earned) {
        onRefill?.();
        onClose?.();
      }
    } catch {}
    setWatching(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={20} color="#9898B0" />
          </TouchableOpacity>

          <View style={styles.heartIcon}>
            <MaterialIcons name="heart-broken" size={56} color="#FFB4AB" />
          </View>

          <Text style={styles.title}>
            {t('hearts.outTitle', 'Kalpler Bitti')}
          </Text>
          <Text style={styles.subtitle}>
            {t(
              'hearts.outSubtitle',
              'Devam etmek için kalp gerekli. Reklam izleyerek 1 kalp kazan veya Premium\'a geç.',
            )}
          </Text>

          {refillMins !== null && refillMins > 0 ? (
            <View style={styles.timerPill}>
              <MaterialIcons name="timer" size={14} color="#9898B0" />
              <Text style={styles.timerText}>
                {t('hearts.refillIn', 'Otomatik dolum: {{mins}} dk', { mins: refillMins })}
              </Text>
            </View>
          ) : null}

          {/* Watch ad CTA — primary */}
          {isAdsReady() ? (
            <TouchableOpacity
              onPress={handleWatchAd}
              disabled={watching}
              activeOpacity={0.85}
              style={styles.watchAdBtn}
            >
              <View style={styles.watchAdContent}>
                {watching ? (
                  <ActivityIndicator color="#0D0096" />
                ) : (
                  <>
                    <MaterialIcons name="play-circle" size={20} color="#0D0096" />
                    <Text style={styles.watchAdText}>
                      {t('hearts.watchAd', 'Reklam izle, +1 kalp kazan')}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Premium CTA — gradient */}
          <TouchableOpacity onPress={onPaywall} activeOpacity={0.85} style={styles.premiumWrap}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumBtn}
            >
              <MaterialIcons name="auto-awesome" size={18} color="#FFFFFF" />
              <Text style={styles.premiumText}>
                {t('hearts.goPremium', 'Premium ile sınırsız kalpler')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
            <Text style={styles.skipText}>
              {t('common.later', 'Sonra')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1F1F27',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#292932',
  },
  heartIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 180, 171, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    color: '#E4E1ED',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: '#C7C4D7',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1B1B23',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(70, 69, 84, 0.6)',
    marginBottom: 20,
  },
  timerText: {
    color: '#9898B0',
    fontSize: 11,
    fontWeight: '700',
  },
  watchAdBtn: {
    width: '100%',
    backgroundColor: '#FFB783',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  watchAdContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  watchAdText: {
    color: '#0D0096',
    fontSize: 14,
    fontWeight: '800',
  },
  premiumWrap: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  premiumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  skipBtn: {
    marginTop: 14,
    paddingVertical: 6,
  },
  skipText: {
    color: '#9898B0',
    fontSize: 12,
    fontWeight: '600',
  },
});
