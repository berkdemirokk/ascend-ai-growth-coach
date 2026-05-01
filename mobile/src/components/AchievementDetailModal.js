// AchievementDetailModal — shown when user taps an achievement card.
// Displays icon, title, description, rarity badge, and unlock state.

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACHIEVEMENTS, RARITY_COLORS } from '../config/achievements';

const RARITY_LABEL_KEY = {
  common: 'achievements.rarity.common',
  uncommon: 'achievements.rarity.uncommon',
  rare: 'achievements.rarity.rare',
  epic: 'achievements.rarity.epic',
  legendary: 'achievements.rarity.legendary',
};

const RARITY_LABEL_FALLBACK = {
  common: 'YAYGIN',
  uncommon: 'NADİR',
  rare: 'ENDER',
  epic: 'EPİK',
  legendary: 'EFSANE',
};

export default function AchievementDetailModal({
  visible,
  onClose,
  achievementId,
  unlocked,
}) {
  const { t } = useTranslation();
  if (!achievementId) return null;
  const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!ach) return null;

  const rarityColor = RARITY_COLORS[ach.rarity] || '#9CA3AF';
  const rarityLabel = t(
    RARITY_LABEL_KEY[ach.rarity],
    RARITY_LABEL_FALLBACK[ach.rarity] || 'YAYGIN',
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
      >
        <TouchableOpacity activeOpacity={1} style={styles.card}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={20} color="#9898B0" />
          </TouchableOpacity>

          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: unlocked ? `${rarityColor}22` : '#292932',
                borderColor: unlocked ? rarityColor : '#464554',
              },
            ]}
          >
            <Text style={[styles.iconEmoji, !unlocked && { opacity: 0.3 }]}>
              {unlocked ? ach.icon : '🔒'}
            </Text>
          </View>

          <View
            style={[
              styles.rarityBadge,
              {
                backgroundColor: `${rarityColor}22`,
                borderColor: `${rarityColor}66`,
              },
            ]}
          >
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {rarityLabel}
            </Text>
          </View>

          <Text style={[styles.title, !unlocked && { opacity: 0.5 }]}>
            {ach.title}
          </Text>
          <Text style={styles.description}>
            {ach.description}
          </Text>

          {unlocked ? (
            <View style={styles.unlockedRow}>
              <MaterialIcons name="check-circle" size={18} color="#10B981" />
              <Text style={styles.unlockedText}>
                {t('achievements.unlocked', 'Açıldı')}
              </Text>
            </View>
          ) : (
            <View style={styles.lockedRow}>
              <MaterialIcons name="lock" size={16} color="#908FA0" />
              <Text style={styles.lockedText}>
                {t('achievements.locked', 'Henüz açılmadı')}
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={styles.gotItBtn}>
            <Text style={styles.gotItText}>
              {t('common.close', 'Kapat')}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
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
    maxWidth: 340,
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
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  iconEmoji: { fontSize: 44 },
  rarityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 12,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: '#C7C4D7',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  unlockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 14,
  },
  unlockedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  lockedText: {
    color: '#908FA0',
    fontSize: 12,
    fontWeight: '700',
  },
  gotItBtn: { paddingVertical: 8 },
  gotItText: {
    color: '#9898B0',
    fontSize: 13,
    fontWeight: '700',
  },
});
