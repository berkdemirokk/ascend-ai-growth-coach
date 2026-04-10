import { getCurriculumForPath } from './curriculum';
import { DailyTask, UserProfile } from '../types';
import { getAdaptivePlanSummary, getAdaptivePlanDirection } from './adaptivePlan';
import { isPremiumProfile } from './premium';

export interface JourneyLessonState {
  id: string;
  title: string;
  teaching: string;
  rewardXp: number;
  state: 'completed' | 'available' | 'locked';
}

export interface JourneyUnitState {
  id: string;
  title: string;
  order: number;
  state: 'completed' | 'in_progress' | 'review_ready' | 'locked';
  recentAdaptationMode: DailyTask['adaptationMode'];
  completedLessons: number;
  totalLessons: number;
  checkpointCompleted: boolean;
  lessons: JourneyLessonState[];
}

interface PremiumRouteSummary {
  direction: 'support' | 'standard' | 'stretch';
  focusTitle: string;
  nextMove: string;
  signalLabel: string;
}

const getCheckpointLessonId = (unitId: string) => `${unitId}-checkpoint`;

const getLessonState = (
  lessonId: string,
  minLevel: number,
  profile: UserProfile,
  completedLessonIds: Set<string>,
): JourneyLessonState['state'] => {
  if (completedLessonIds.has(lessonId)) {
    return 'completed';
  }

  if (minLevel <= profile.level) {
    return 'available';
  }

  return 'locked';
};

export const getJourneySummary = (profile: UserProfile, tasks: DailyTask[]) => {
  const completedLessonIds = new Set(
    tasks
      .filter((task) => task.completed && task.source === 'curriculum' && task.missionKind === 'lesson')
      .map((task) => task.lessonId),
  );
  const completedCheckpointIds = new Set(
    tasks
      .filter((task) => task.completed && task.source === 'curriculum' && task.missionKind === 'checkpoint')
      .map((task) => task.lessonId),
  );

  const pathLessons = getCurriculumForPath(profile.selectedPath);
  const lessons = pathLessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    teaching: lesson.teaching,
    rewardXp: lesson.rewardXp,
    state: getLessonState(lesson.id, lesson.minLevel, profile, completedLessonIds),
    unitId: lesson.unitId,
    unitTitle: lesson.unitTitle,
    unitOrder: lesson.unitOrder,
  }));

  const units: JourneyUnitState[] = [];

  for (const lesson of lessons) {
    const existingUnit = units.find((unit) => unit.id === lesson.unitId);

    if (!existingUnit) {
      const checkpointCompleted = completedCheckpointIds.has(getCheckpointLessonId(lesson.unitId));
      const unitTask = tasks
        .filter((task) => task.unitId === lesson.unitId && task.source === 'curriculum')
        .sort((a, b) => {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }

          if (a.dayKey !== b.dayKey) {
            return b.dayKey.localeCompare(a.dayKey);
          }

          return b.createdAt - a.createdAt;
        })[0];

      units.push({
        id: lesson.unitId,
        title: lesson.unitTitle,
        order: lesson.unitOrder,
        state: lesson.state === 'locked' ? 'locked' : 'in_progress',
        recentAdaptationMode: unitTask?.adaptationMode ?? 'standard',
        completedLessons: lesson.state === 'completed' ? 1 : 0,
        totalLessons: 1,
        checkpointCompleted,
        lessons: [
          {
            id: lesson.id,
            title: lesson.title,
            teaching: lesson.teaching,
            rewardXp: lesson.rewardXp,
            state: lesson.state,
          },
        ],
      });
      continue;
    }

    existingUnit.totalLessons += 1;
    existingUnit.completedLessons += lesson.state === 'completed' ? 1 : 0;
    existingUnit.lessons.push({
      id: lesson.id,
      title: lesson.title,
      teaching: lesson.teaching,
      rewardXp: lesson.rewardXp,
      state: lesson.state,
    });
  }

  for (const unit of units) {
    if (unit.completedLessons === unit.totalLessons && unit.checkpointCompleted) {
      unit.state = 'completed';
    } else if (unit.completedLessons === unit.totalLessons) {
      unit.state = 'review_ready';
    } else if (unit.lessons.some((lesson) => lesson.state !== 'locked')) {
      unit.state = 'in_progress';
    } else {
      unit.state = 'locked';
    }
  }

  const completed = lessons.filter((lesson) => lesson.state === 'completed').length;
  const available = lessons.filter((lesson) => lesson.state === 'available').length;
  const total = lessons.length;
  const currentUnit = units.find((unit) => unit.state === 'in_progress' || unit.state === 'review_ready') ?? units[0] ?? null;
  const nextLockedUnit = units.find((unit) => unit.state === 'locked') ?? null;
  const premiumRoute: PremiumRouteSummary | null = isPremiumProfile(profile)
    ? (() => {
        const adaptivePlan = getAdaptivePlanSummary(profile, tasks);
        const direction = getAdaptivePlanDirection(profile, tasks);

        return {
          direction,
          focusTitle: adaptivePlan.focusTitle,
          nextMove: adaptivePlan.nextMove,
          signalLabel: adaptivePlan.signalLabel,
        };
      })()
    : null;

  return {
    units,
    completed,
    available,
    total,
    currentUnitTitle: currentUnit?.title ?? null,
    nextUnitTitle: nextLockedUnit?.title ?? null,
    pendingCheckpointCount: units.filter((unit) => unit.state === 'review_ready').length,
    premiumRoute,
    nextUnlockLevel:
      nextLockedUnit?.lessons.find((lesson) => lesson.state === 'locked')
        ? pathLessons.find((lesson) => lesson.unitId === nextLockedUnit.id && lesson.minLevel > profile.level)?.minLevel ?? null
        : null,
  };
};
