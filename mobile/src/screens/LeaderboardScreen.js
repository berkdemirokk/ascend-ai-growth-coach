// Public anonymous streak leaderboard.
// Shown via the InsightsScreen "Leaderboard" link. Reads top 50 rows from
// streak_leaderboard (RLS allows public select). The current user is
// highlighted by anon_username match — IDs aren't compared because the row's
// user_id is private to the user themselves.

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

import { useApp } from '../contexts/AppContext';
import { fetchTopLeaderboard } from '../services/leaderboard';
import { LT, LT_RADIUS, LT_SPACING } from '../config/lightTheme';

export default function LeaderboardScreen({ navigation }) {
  const { t } = useTranslation();
  const { anonUsername } = useApp();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchTopLeaderboard(50);
    setRows(data);
  }, []);

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const renderItem = ({ item, index }) => {
    const rank = index + 1;
    const isMe = anonUsername && item.anon_username === anonUsername;
    const medal =
      rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <Text style={[styles.rank, isMe && styles.rankMe]}>
          {medal || rank}
        </Text>
        <View style={styles.rowMain}>
          <Text style={[styles.name, isMe && styles.nameMe]} numberOfLines={1}>
            {item.anon_username}
            {isMe ? ` ${t('leaderboard.you', '(sen)')}` : ''}
          </Text>
          <Text style={styles.sub}>
            {t('leaderboard.xp', '{{count}} XP', { count: item.total_xp || 0 })}
          </Text>
        </View>
        <View style={styles.streakWrap}>
          <MaterialIcons
            name="local-fire-department"
            size={16}
            color={LT.primaryContainer}
          />
          <Text style={styles.streakNum}>{item.current_streak || 0}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={LT.background} />

      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
        >
          <MaterialIcons name="arrow-back" size={22} color={LT.onSurface} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {t('leaderboard.title', 'Liderlik Tablosu')}
        </Text>
        <View style={styles.backBtn} />
      </View>

      <Text style={styles.intro}>
        {t(
          'leaderboard.intro',
          'En uzun streak\'e sahip 50 disiplinci. Sıralama anonim — gerçek kimliklerin paylaşılmaz.',
        )}
      </Text>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={LT.primaryContainer} />
        </View>
      ) : rows.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialIcons name="local-fire-department" size={40} color={LT.outlineVariant} />
          <Text style={styles.emptyTitle}>
            {t('leaderboard.emptyTitle', 'Henüz kimse yok')}
          </Text>
          <Text style={styles.emptyBody}>
            {t(
              'leaderboard.emptyBody',
              'İlk dersini yaparak liderlik tablosuna gir.',
            )}
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.user_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={LT.primaryContainer}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: LT.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: LT_SPACING.containerMargin,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LT.surfaceContainer,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    color: LT.onSurface,
  },
  intro: {
    fontSize: 12,
    color: LT.onSurfaceVariant,
    paddingHorizontal: LT_SPACING.containerMargin,
    paddingBottom: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: LT_SPACING.containerMargin,
    paddingBottom: 32,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: LT.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: LT.outlineVariant,
    borderRadius: LT_RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowMe: {
    borderColor: LT.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(227, 18, 18, 0.04)',
  },
  rank: {
    width: 32,
    fontSize: 18,
    fontWeight: '900',
    color: LT.onSurfaceVariant,
    textAlign: 'center',
  },
  rankMe: {
    color: LT.primary,
  },
  rowMain: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: LT.onSurface,
    marginBottom: 2,
  },
  nameMe: {
    color: LT.primary,
  },
  sub: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: LT.onSurfaceVariant,
  },
  streakWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakNum: {
    fontSize: 16,
    fontWeight: '900',
    color: LT.primaryContainer,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: LT.onSurface,
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 12,
    color: LT.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 17,
  },
});
