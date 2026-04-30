// StreakInfoModal — explains how the streak + freeze system works.
import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function StreakInfoModal({
  visible,
  onClose,
  streak,
  freezes,
  isPremium,
  onPaywall,
}) {
  const { t } = useTranslation();
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

          <View style={styles.iconWrap}>
            <MaterialIcons
              name="local-fire-department"
              size={48}
              color="#F59E0B"
            />
          </View>

          <Text style={styles.title}>
            {t('streak.infoTitle', 'Seri Sistemi')}
          </Text>

          <Text style={styles.streakBig}>
            <Text style={{ color: '#F59E0B' }}>{streak}</Text>
            <Text style={styles.streakUnit}>
              {' '}{t('streak.days', 'gün')}
            </Text>
          </Text>

          <Text style={styles.body}>
            {t(
              'streak.howWorks',
              'Her gün bir ders tamamlayarak serini koru. Bir gün atlarsan seri sıfırlanır.',
            )}
          </Text>

          {/* Freeze section */}
          <View style={styles.freezeBox}>
            <View style={styles.freezeRow}>
              <View style={styles.freezeIconBox}>
                <MaterialIcons name="ac-unit" size={20} color="#A5B4FC" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.freezeTitle}>
                  {t('streak.freezeTitle', 'Seri Donduruculari')}
                </Text>
                <Text style={styles.freezeBody}>
                  {freezes > 0
                    ? t(
                        'streak.freezeAvailable',
                        '{{count}} adet kullanılabilir. Bir gün atlarsan otomatik kullanılır.',
                        { count: freezes },
                      )
                    : t(
                        'streak.freezeEmpty',
                        'Henüz dondurucu yok. Premium ile 3 dondurucu kazan.',
                      )}
                </Text>
              </View>
              <Text style={styles.freezeCount}>{freezes}</Text>
            </View>
          </View>

          {!isPremium && freezes === 0 ? (
            <TouchableOpacity
              onPress={() => {
                onClose?.();
                onPaywall?.();
              }}
              activeOpacity={0.9}
              style={styles.premiumWrap}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.premiumBtn}
              >
                <MaterialIcons name="auto-awesome" size={18} color="#FFFFFF" />
                <Text style={styles.premiumText}>
                  {t('streak.getFreezes', 'Premium ile 3 dondurucu al')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity onPress={onClose} style={styles.gotItBtn}>
            <Text style={styles.gotItText}>
              {t('common.gotIt', 'Anladım')}
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
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  streakBig: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  streakUnit: {
    color: '#9898B0',
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    color: '#C7C4D7',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },

  freezeBox: {
    width: '100%',
    backgroundColor: '#1B1B23',
    borderColor: 'rgba(70, 69, 84, 0.5)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  freezeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  freezeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(165, 180, 252, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(165, 180, 252, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freezeTitle: {
    color: '#E4E1ED',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  freezeBody: {
    color: '#9898B0',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  freezeCount: {
    color: '#A5B4FC',
    fontSize: 24,
    fontWeight: '900',
    minWidth: 24,
    textAlign: 'center',
  },

  premiumWrap: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    marginBottom: 6,
  },
  premiumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  gotItBtn: { paddingVertical: 10 },
  gotItText: {
    color: '#9898B0',
    fontSize: 13,
    fontWeight: '700',
  },
});
