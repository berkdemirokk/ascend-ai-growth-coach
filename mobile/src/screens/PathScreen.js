import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/constants';
import { useApp } from '../contexts/AppContext';
import { getSprintById } from '../config/sprints';

export default function PathScreen({ navigation }) {
  const {
    activeSprint,
    currentSprintDay,
    sprintLessons,
    lessonCompletions,
  } = useApp();

  const sprint = activeSprint ? getSprintById(activeSprint.sprintId) : null;

  const items = useMemo(() => {
    return sprintLessons.map((lesson) => {
      const done = !!lessonCompletions[lesson.id];
      const unlocked = lesson.dayUnlock <= currentSprintDay;
      return { lesson, done, unlocked };
    });
  }, [sprintLessons, lessonCompletions, currentSprintDay]);

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const progressPct = totalCount > 0 ? completedCount / totalCount : 0;

  if (!activeSprint) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎓</Text>
          <Text style={styles.emptyTitle}>Henüz Aktif Sprint Yok</Text>
          <Text style={styles.emptyText}>
            Bir sprint başlat — günlük dersler ve quizler açılsın.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation?.navigate?.('Home')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryGrad}
            >
              <Text style={styles.primaryText}>Sprint Seç</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Öğrenme Yolu</Text>
          <Text style={styles.subtitle}>{sprint?.title}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {completedCount}/{totalCount}
            </Text>
          </View>
        </View>

        <View style={styles.path}>
          {items.map((item, idx) => {
            const offset = idx % 2 === 0 ? -40 : 40;
            return (
              <View key={item.lesson.id} style={styles.nodeWrap}>
                {idx > 0 && <View style={styles.connector} />}
                <View style={[styles.nodeRow, { transform: [{ translateX: offset }] }]}>
                  <Node
                    item={item}
                    onPress={() =>
                      item.unlocked &&
                      navigation?.navigate?.('Lesson', { lessonId: item.lesson.id })
                    }
                  />
                </View>
                <View style={[styles.nodeLabel, { transform: [{ translateX: offset }] }]}>
                  <Text
                    style={[
                      styles.nodeTitle,
                      !item.unlocked && styles.nodeTitleLocked,
                    ]}
                    numberOfLines={2}
                  >
                    {item.lesson.title}
                  </Text>
                  <Text style={styles.nodeDay}>
                    Gün {item.lesson.dayUnlock}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {totalCount === 0 && (
          <Text style={styles.emptyText}>
            Bu sprint için ders bulunmuyor.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Node({ item, onPress }) {
  if (item.done) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.nodeShadow}>
        <LinearGradient
          colors={[COLORS.gold, '#D97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.node}
        >
          <Text style={styles.nodeIcon}>⭐</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  if (item.unlocked) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.nodeShadow}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.node}
        >
          <Text style={styles.nodeIcon}>▶</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  return (
    <View style={styles.nodeShadow}>
      <View style={[styles.node, styles.nodeLocked]}>
        <Text style={styles.nodeIcon}>🔒</Text>
      </View>
    </View>
  );
}

const NODE = 80;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { paddingTop: 16, paddingBottom: 24 },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, marginBottom: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gold,
    borderRadius: 5,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 10,
    minWidth: 40,
  },
  path: { alignItems: 'center', paddingVertical: 16 },
  nodeWrap: { alignItems: 'center', marginBottom: 8 },
  connector: {
    width: 4,
    height: 28,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 8,
  },
  nodeRow: { alignItems: 'center' },
  nodeShadow: {
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  node: {
    width: NODE,
    height: NODE,
    borderRadius: NODE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.background,
  },
  nodeLocked: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  nodeIcon: { fontSize: 30 },
  nodeLabel: {
    marginTop: 8,
    alignItems: 'center',
    maxWidth: 220,
  },
  nodeTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  nodeTitleLocked: { color: COLORS.textMuted },
  nodeDay: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: { fontSize: 80, marginBottom: 16 },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  primaryBtn: { borderRadius: 14, overflow: 'hidden', minWidth: 200 },
  primaryGrad: { paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
});
