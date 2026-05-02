// ReflectionsScreen — shows the user's lesson reflections grouped by path.
// Pulls from pathProgress.reflections in AppContext (already stored on
// lesson completion).

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

import { useApp } from '../contexts/AppContext';
import { PATHS } from '../data/paths';
import { LT, LT_RADIUS } from '../config/lightTheme';

export default function ReflectionsScreen({ navigation }) {
  const { t } = useTranslation();
  const { pathProgress } = useApp();

  const sections = useMemo(() => {
    const out = [];
    for (const p of PATHS) {
      const reflections = pathProgress?.[p.id]?.reflections || {};
      const entries = Object.entries(reflections)
        .filter(([, text]) => text && text.trim())
        .sort((a, b) => {
          // Sort by lesson order desc (most recent first)
          const oa = parseInt(a[0].split('-').pop(), 10);
          const ob = parseInt(b[0].split('-').pop(), 10);
          return ob - oa;
        });
      if (entries.length > 0) {
        out.push({ path: p, entries });
      }
    }
    return out;
  }, [pathProgress]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={22} color={LT.onSurface} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {t('reflections.title', 'Yansımalarım')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {sections.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="auto-stories" size={48} color={LT.outline} />
            </View>
            <Text style={styles.emptyTitle}>
              {t('reflections.emptyTitle', 'Henüz yansıma yok')}
            </Text>
            <Text style={styles.emptyBody}>
              {t(
                'reflections.emptyBody',
                'Ders tamamladıkça yazdığın yansımalar burada birikecek.',
              )}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>
              {t(
                'reflections.subtitle',
                'Geçmiş derslerde yazdığın düşünceler. Geri dönüp oku, kendi yolculuğunu hatırla.',
              )}
            </Text>

            {sections.map((section) => (
              <View key={section.path.id} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionIcon,
                      { backgroundColor: `${section.path.color}22`, borderColor: `${section.path.color}55` },
                    ]}
                  >
                    <MaterialIcons
                      name={section.path.materialIcon}
                      size={18}
                      color={section.path.color}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>
                    {t(`paths.${section.path.id}.title`, section.path.id)}
                  </Text>
                  <Text style={styles.sectionCount}>
                    {section.entries.length}
                  </Text>
                </View>

                {section.entries.map(([lessonId, text]) => {
                  const lessonOrder = parseInt(lessonId.split('-').pop(), 10);
                  const lessonTitle = t(
                    `lessons.${section.path.id}.${lessonOrder}.title`,
                    `Ders ${lessonOrder}`,
                  );
                  return (
                    <View key={lessonId} style={styles.card}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardLessonNum}>
                          DERS {lessonOrder}
                        </Text>
                        <Text style={styles.cardLessonTitle} numberOfLines={1}>
                          {lessonTitle}
                        </Text>
                      </View>
                      <Text style={styles.cardText}>{text}</Text>
                    </View>
                  );
                })}
              </View>
            ))}

            <View style={{ height: 32 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: LT.background },
  container: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LT.outlineVariant,
    backgroundColor: LT.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: LT.onSurface,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  scroll: { padding: 20, paddingTop: 16 },
  subtitle: {
    color: LT.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 4,
  },

  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sectionTitle: {
    color: LT.onSurface,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    flex: 1,
  },
  sectionCount: {
    color: LT.onSurfaceVariant,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: LT.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: LT_RADIUS.pill,
    borderWidth: 1,
    borderColor: LT.outlineVariant,
    minWidth: 28,
    textAlign: 'center',
  },

  card: {
    backgroundColor: LT.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: LT.outlineVariant,
    borderRadius: LT_RADIUS.lg,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardLessonNum: {
    color: LT.primaryContainer,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    backgroundColor: 'rgba(227, 18, 18, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(227, 18, 18, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardLessonTitle: {
    color: LT.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  cardText: {
    color: LT.onSurface,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: LT.surfaceContainer,
    borderWidth: 1,
    borderColor: LT.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    color: LT.onSurface,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptyBody: {
    color: LT.onSurfaceVariant,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
