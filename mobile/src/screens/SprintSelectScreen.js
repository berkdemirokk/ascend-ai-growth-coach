import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useApp } from '../contexts/AppContext';
import { COLORS } from '../config/constants';
import { SPRINTS } from '../config/sprints';

export default function SprintSelectScreen() {
  const { startSprint, activeSprint } = useApp();

  const handlePickSprint = (sprint) => {
    if (activeSprint) {
      Alert.alert(
        'Aktif sprint var',
        'Yeni bir sprint başlatmak için önce mevcut sprint\'i bitir veya iptal et.',
      );
      return;
    }
    Alert.alert(
      `${sprint.title} başlasın mı?`,
      `${sprint.duration} gün boyunca her gün görevlerini yapmalısın. Kurallar sıkı. Hazır mısın?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Başlat',
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            startSprint(sprint.id);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0B0B14', '#161626']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.header}>Monk Mode</Text>
          <Text style={styles.subheader}>
            Bir sprint seç. Kuralları uy, günlük görevleri tamamla, sertifikanı
            al.
          </Text>

          {SPRINTS.map((sprint) => (
            <TouchableOpacity
              key={sprint.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => handlePickSprint(sprint)}
            >
              <LinearGradient
                colors={[sprint.color, '#161626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{sprint.icon}</Text>
                  <View style={styles.cardTitleBox}>
                    <Text style={styles.cardTitle}>{sprint.title}</Text>
                    <Text style={styles.cardSubtitle}>{sprint.subtitle}</Text>
                  </View>
                  <View style={styles.durationPill}>
                    <Text style={styles.durationText}>{sprint.duration}g</Text>
                  </View>
                </View>

                <Text style={styles.cardDesc}>{sprint.description}</Text>

                <Text style={styles.sectionLabel}>Kurallar</Text>
                {sprint.rules.map((r) => (
                  <Text key={r.id} style={styles.listItem}>
                    • {r.text}
                  </Text>
                ))}

                <Text style={styles.sectionLabel}>Günlük görevler</Text>
                {sprint.dailyTasks.map((t) => (
                  <Text key={t.id} style={styles.listItem}>
                    ✓ {t.title}  <Text style={styles.xpTag}>+{t.xp} XP</Text>
                  </Text>
                ))}
              </LinearGradient>
            </TouchableOpacity>
          ))}

          <View style={styles.footerSpacer} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B14' },
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  header: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subheader: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardGradient: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  cardTitleBox: { flex: 1 },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: COLORS.text,
    opacity: 0.85,
    fontSize: 13,
    marginTop: 2,
  },
  durationPill: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  durationText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 13,
  },
  cardDesc: {
    color: COLORS.text,
    opacity: 0.9,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    color: COLORS.text,
    opacity: 0.9,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 4,
  },
  listItem: {
    color: COLORS.text,
    opacity: 0.92,
    fontSize: 13,
    lineHeight: 20,
  },
  xpTag: {
    color: COLORS.gold,
    fontWeight: '700',
  },
  footerSpacer: { height: 32 },
});
