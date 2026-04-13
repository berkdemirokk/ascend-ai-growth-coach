import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import { COLORS, CATEGORIES } from '../config/constants';

const THEME = {
  background: '#0B0B14',
  surface: '#161626',
  surfaceLight: '#1F1F33',
  text: '#F5F5FA',
  textSecondary: '#9898B0',
  primary: '#6366F1',
  accent: '#8B5CF6',
  border: '#2A2A42',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const getCategoryInfo = (catId) => {
  if (!catId) return { emoji: '📌', icon: '📌', label: 'General', color: THEME.primary };
  const found = Array.isArray(CATEGORIES)
    ? CATEGORIES.find((c) => c.id === catId || c.name === catId)
    : CATEGORIES?.[catId];
  return found
    ? {
        emoji: found.emoji ?? found.icon ?? '📌',
        icon: found.icon ?? found.emoji ?? '📌',
        label: found.name ?? found.label ?? catId,
        color: found.color ?? THEME.primary,
      }
    : { emoji: '📌', icon: '📌', label: catId, color: THEME.primary };
};

const formatDateLabel = (dateStr) => {
  if (!dateStr || dateStr === 'Unknown') return 'Unknown Date';
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMMM d, yyyy');
  } catch {
    return dateStr;
  }
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    return format(parseISO(isoString), 'h:mm a');
  } catch {
    return '';
  }
};

/**
 * Converts the flat history array into a sorted list of "rows":
 * either a date-header row or an action-entry row.
 * Sorted newest-first.
 */
const buildTimelineRows = (history) => {
  const groups = {};
  const sorted = [...history].sort(
    (a, b) => new Date(b.completedAt ?? b.date ?? 0) - new Date(a.completedAt ?? a.date ?? 0)
  );

  for (const item of sorted) {
    const raw = item.completedAt ?? item.date;
    const dateKey = raw ? raw.toString().split('T')[0] : 'Unknown';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
  }

  const rows = [];
  for (const [date, items] of Object.entries(groups)) {
    rows.push({ type: 'header', date, key: `header-${date}` });
    items.forEach((item, idx) => {
      rows.push({ type: 'entry', item, key: `entry-${item.id ?? date}-${idx}` });
    });
  }
  return rows;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function DateHeader({ date }) {
  return (
    <View style={styles.dateHeader}>
      <Text style={styles.dateHeaderText}>{formatDateLabel(date)}</Text>
    </View>
  );
}

function ActionEntry({ item }) {
  const cat = getCategoryInfo(item.category);
  const time = formatTime(item.completedAt ?? item.date);

  return (
    <View style={styles.entryRow}>
      {/* Left: category emoji circle */}
      <View style={[styles.categoryCircle, { backgroundColor: cat.color + '28' }]}>
        <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
      </View>

      {/* Middle: title + description or category */}
      <View style={styles.entryContent}>
        <Text style={styles.entryTitle} numberOfLines={1}>
          {item.title ?? item.actionTitle ?? 'Action'}
        </Text>
        <Text style={styles.entryMeta} numberOfLines={1}>
          {item.description ? item.description : cat.label}
          {time ? `  ·  ${time}` : ''}
        </Text>
      </View>

      {/* Right: XP badge */}
      <View style={styles.xpBadge}>
        <Text style={styles.xpBadgeText}>+{item.xpEarned ?? item.xp ?? 10} XP</Text>
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { history } = useApp();
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Trigger re-render; actual data comes from context
    setRefreshKey((k) => k + 1);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const safeHistory = history ?? [];
  const timelineRows = buildTimelineRows(safeHistory);

  const renderRow = ({ item: row }) => {
    if (row.type === 'header') {
      return <DateHeader date={row.date} />;
    }
    return <ActionEntry item={row.item} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Page Header ── */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>History</Text>
        {safeHistory.length > 0 && (
          <View style={styles.countChip}>
            <Text style={styles.countChipText}>
              {safeHistory.length} action{safeHistory.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* ── Empty State ── */}
      {safeHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🌱</Text>
          <Text style={styles.emptyTitle}>No Actions Yet</Text>
          <Text style={styles.emptyBody}>
            Complete your first action to start your journey!
          </Text>
        </View>
      ) : (
        /* ── Timeline ── */
        <FlatList
          key={refreshKey}
          data={timelineRows}
          keyExtractor={(row) => row.key}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={THEME.primary}
              colors={[THEME.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // ── Page Header ──
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
  },
  countChip: {
    backgroundColor: THEME.surfaceLight,
    borderRadius: 14,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  countChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textSecondary,
  },

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 16,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Timeline List ──
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 110,
  },

  // ── Date Header ──
  dateHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  dateHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── Action Entry ──
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  categoryCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  entryContent: {
    flex: 1,
    marginRight: 8,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 3,
  },
  entryMeta: {
    fontSize: 12,
    color: THEME.textSecondary,
    fontWeight: '400',
  },
  xpBadge: {
    backgroundColor: THEME.primary + '22',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 0,
  },
  xpBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.primary,
  },
});
