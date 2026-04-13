import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { ACHIEVEMENTS, RARITY_COLORS } from '../config/achievements';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 10;
const CARD_SIZE = (width - GRID_PADDING * 2 - GRID_GAP * 2) / 3;

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

const FILTERS = ['All', 'Unlocked', 'Locked'];

const getRarityColor = (rarity) =>
  (RARITY_COLORS && RARITY_COLORS[rarity]) || THEME.primary;

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : 'Common';

export default function AchievementsScreen() {
  const { unlockedAchievements } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedAchievement, setSelectedAchievement] = useState(null);

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;
  const overallPercent = totalCount > 0
    ? Math.round((unlockedCount / totalCount) * 100)
    : 0;

  const filteredAchievements = useMemo(() => {
    if (activeFilter === 'Unlocked') {
      return ACHIEVEMENTS.filter((a) => unlockedAchievements.includes(a.id));
    }
    if (activeFilter === 'Locked') {
      return ACHIEVEMENTS.filter((a) => !unlockedAchievements.includes(a.id));
    }
    return ACHIEVEMENTS;
  }, [activeFilter, unlockedAchievements]);

  const handleCardPress = (achievement) => {
    if (unlockedAchievements.includes(achievement.id)) {
      setSelectedAchievement(achievement);
    }
  };

  const renderCard = ({ item }) => {
    const isUnlocked = unlockedAchievements.includes(item.id);
    const rarityColor = getRarityColor(item.rarity);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isUnlocked
            ? { borderColor: rarityColor, borderWidth: 2 }
            : styles.cardLocked,
        ]}
        onPress={() => handleCardPress(item)}
        activeOpacity={isUnlocked ? 0.7 : 0.95}
      >
        {/* Emoji */}
        <View style={styles.emojiWrapper}>
          <Text style={[styles.cardEmoji, !isUnlocked && styles.dimmed]}>
            {item.emoji}
          </Text>
          {!isUnlocked && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          style={[styles.cardTitle, !isUnlocked && styles.titleDimmed]}
          numberOfLines={2}
        >
          {item.title}
        </Text>

        {/* Rarity indicator */}
        {isUnlocked && (
          <View style={[styles.rarityDot, { backgroundColor: rarityColor }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {unlockedCount}/{totalCount} Unlocked
          </Text>
        </View>
      </View>

      {/* ── Overall Progress Bar ── */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${overallPercent}%` }]}
          />
        </View>
        <Text style={styles.progressPercent}>{overallPercent}%</Text>
      </View>

      {/* ── Filter Tabs ── */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={styles.filterTab}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[styles.filterLabel, isActive && styles.filterLabelActive]}
                >
                  {filter}
                </Text>
                {isActive && <View style={styles.filterUnderline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Achievement Grid ── */}
      <FlatList
        data={filteredAchievements}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={renderCard}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>
              {activeFilter === 'Unlocked' ? '🏅' : '🔒'}
            </Text>
            <Text style={styles.emptyStateTitle}>
              {activeFilter === 'Unlocked'
                ? 'No achievements yet'
                : 'All achievements unlocked!'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {activeFilter === 'Unlocked'
                ? 'Complete actions to earn your first achievement.'
                : 'You have conquered every challenge. Legendary!'}
            </Text>
          </View>
        }
      />

      {/* ── Detail Modal ── */}
      {selectedAchievement && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedAchievement(null)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setSelectedAchievement(null)}
          >
            <Pressable style={styles.modalCard} onPress={() => {}}>
              {/* Emoji circle */}
              <View
                style={[
                  styles.modalEmojiCircle,
                  { borderColor: getRarityColor(selectedAchievement.rarity) },
                ]}
              >
                <Text style={styles.modalEmoji}>{selectedAchievement.emoji}</Text>
              </View>

              <Text style={styles.modalTitle}>{selectedAchievement.title}</Text>

              {/* Rarity badge */}
              <View
                style={[
                  styles.rarityBadge,
                  {
                    backgroundColor:
                      getRarityColor(selectedAchievement.rarity) + '2A',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.rarityBadgeLabel,
                    { color: getRarityColor(selectedAchievement.rarity) },
                  ]}
                >
                  {capitalize(selectedAchievement.rarity)}
                </Text>
              </View>

              {/* Description */}
              <Text style={styles.modalDescription}>
                {selectedAchievement.description || 'Achievement unlocked!'}
              </Text>

              {/* Unlock info row */}
              <View style={styles.unlockRow}>
                <Text style={styles.unlockRowLabel}>Status</Text>
                <Text
                  style={[
                    styles.unlockRowValue,
                    { color: getRarityColor(selectedAchievement.rarity) },
                  ]}
                >
                  ✅ Unlocked
                </Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedAchievement(null)}
              >
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 14,
    paddingHorizontal: GRID_PADDING,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
  },
  countBadge: {
    backgroundColor: THEME.surfaceLight,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.primary,
  },

  // ── Progress ──
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
    marginBottom: 18,
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: THEME.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.primary,
    borderRadius: 4,
    minWidth: 4,
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.primary,
    width: 38,
    textAlign: 'right',
  },

  // ── Filter Tabs ──
  filterWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    marginBottom: 16,
  },
  filterRow: {
    paddingHorizontal: GRID_PADDING,
  },
  filterTab: {
    marginRight: 28,
    paddingBottom: 10,
    position: 'relative',
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME.textSecondary,
  },
  filterLabelActive: {
    color: THEME.primary,
  },
  filterUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: THEME.primary,
    borderRadius: 1,
  },

  // ── Grid ──
  grid: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 40,
  },
  columnWrapper: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },

  // ── Cards ──
  card: {
    width: CARD_SIZE,
    minHeight: CARD_SIZE + 16,
    backgroundColor: THEME.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  cardLocked: {
    opacity: 0.5,
    borderColor: THEME.border,
    borderWidth: 1,
  },
  emojiWrapper: {
    position: 'relative',
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 32,
  },
  dimmed: {
    opacity: 0.35,
  },
  lockOverlay: {
    position: 'absolute',
    right: -6,
    bottom: -4,
  },
  lockIcon: {
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.text,
    textAlign: 'center',
    lineHeight: 14,
  },
  titleDimmed: {
    color: THEME.textSecondary,
  },
  rarityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 32,
  },
  emptyStateEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // ── Modal ──
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: width - 48,
    backgroundColor: THEME.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 28,
    alignItems: 'center',
  },
  modalEmojiCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: THEME.surfaceLight,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalEmoji: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  rarityBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  rarityBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  modalDescription: {
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  unlockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: THEME.surfaceLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  unlockRowLabel: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  unlockRowValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalCloseBtn: {
    width: '100%',
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
