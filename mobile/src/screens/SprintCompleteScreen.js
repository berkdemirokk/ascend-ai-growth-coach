import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';

export default function SprintCompleteScreen({ route, navigation }) {
  const { sprintTitle, sprintDuration, bonusXP, completedAt } =
    route?.params || {};

  const dateLabel = completedAt
    ? new Date(completedAt).toLocaleDateString()
    : new Date().toLocaleDateString();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${sprintDuration} gün boyunca "${sprintTitle}" sprintini tamamladım. 🏆 Ascend: Monk Mode ile disiplinimi test ediyorum.`,
      });
    } catch (e) {
      Alert.alert('Paylaşılamadı', e?.message || 'Bir hata oluştu.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0B0B14', '#1F1F33']}
        style={styles.container}
      >
        <View style={styles.certificate}>
          <LinearGradient
            colors={[COLORS.gold, '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.certInner}
          >
            <Text style={styles.trophy}>🏆</Text>
            <Text style={styles.certLabel}>SERTİFİKA</Text>
            <Text style={styles.certTitle}>{sprintTitle || 'Sprint'}</Text>
            <Text style={styles.certDuration}>
              {sprintDuration || 0} Gün Tamamlandı
            </Text>
            <View style={styles.divider} />
            <Text style={styles.certDate}>{dateLabel}</Text>
            {bonusXP ? (
              <Text style={styles.certXP}>Bonus +{bonusXP} XP</Text>
            ) : null}
          </LinearGradient>
        </View>

        <Text style={styles.message}>
          Disiplin kazandın. Yeni bir sprint'e başlayabilirsin.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.85}
          onPress={handleShare}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryGrad}
          >
            <Text style={styles.primaryText}>Paylaş</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Text style={styles.secondaryText}>Kapat</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  certificate: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  certInner: {
    paddingHorizontal: 32,
    paddingVertical: 40,
    alignItems: 'center',
    borderRadius: 20,
  },
  trophy: { fontSize: 72, marginBottom: 12 },
  certLabel: {
    color: '#0B0B14',
    fontSize: 12,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 6,
  },
  certTitle: {
    color: '#0B0B14',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
  },
  certDuration: {
    color: '#0B0B14',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: 'rgba(11,11,20,0.3)',
    marginVertical: 8,
  },
  certDate: {
    color: '#0B0B14',
    fontSize: 13,
    opacity: 0.75,
    marginTop: 6,
  },
  certXP: {
    color: '#0B0B14',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  message: {
    color: COLORS.text,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  primaryGrad: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: 12,
  },
  secondaryText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
