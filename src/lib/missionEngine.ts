import { getCurriculumForPath } from './curriculum';
import { createTask, createTaskId } from './progression';
import { toggleTaskWithProgression } from './progression';
import { DailyTask, MissionDefinition, PlannedMission, UserProfile, WeeklyPlanSnapshot } from '../types';
import { getDayKey, getTomorrowDayKey } from './day';
import { adaptAction, adaptTeaching, getAdaptationSignal } from './adaptation';
import { isPremiumProfile } from './premium';
import { getAdaptivePlanDirection } from './adaptivePlan';
import { getCurrentWeeklyPlanDay } from './weeklyPlan';

export interface MissionPreview {
  dayKey: string;
  unitTitle: string;
  title: string;
  teaching: string;
  missionKind: 'lesson' | 'checkpoint' | 'legacy';
  adaptationMode: 'support' | 'standard' | 'stretch' | 'legacy';
  planFocus: 'support' | 'standard' | 'stretch' | 'legacy';
  lockedDetails: boolean;
}

const getCompletedLessonIds = (tasks: DailyTask[]) =>
  new Set(tasks.filter((task) => task.completed && task.missionKind === 'lesson').map((task) => task.lessonId));

const getCheckpointLessonId = (unitId: string) => `${unitId}-checkpoint`;

const getCompletedCheckpointIds = (tasks: DailyTask[]) =>
  new Set(tasks.filter((task) => task.completed && task.missionKind === 'checkpoint').map((task) => task.lessonId));

const getAdaptationMode = (signal: ReturnType<typeof getAdaptationSignal>): DailyTask['adaptationMode'] => {
  if (signal === 'needs_support') return 'support';
  if (signal === 'ready_to_push') return 'stretch';
  return 'standard';
};

const getLessonAction = (lesson: MissionDefinition, signal: ReturnType<typeof getAdaptationSignal>) => {
  if (signal === 'needs_support' && lesson.variantActions?.support) {
    return lesson.variantActions.support;
  }

  if (signal === 'ready_to_push' && lesson.variantActions?.stretch) {
    return lesson.variantActions.stretch;
  }

  return lesson.action;
};

const getLessonTeaching = (lesson: MissionDefinition, signal: ReturnType<typeof getAdaptationSignal>) => {
  if (signal === 'needs_support' && lesson.variantTeaching?.support) {
    return lesson.variantTeaching.support;
  }

  if (signal === 'ready_to_push' && lesson.variantTeaching?.stretch) {
    return lesson.variantTeaching.stretch;
  }

  return lesson.teaching;
};

const buildLessonMission = (
  lesson: MissionDefinition,
  dayKey: string,
  signal = getAdaptationSignal([]),
  planFocus: DailyTask['planFocus'] = 'standard',
): DailyTask => {
  const action = adaptAction(getLessonAction(lesson, signal), signal);
  const teaching = adaptTeaching(getLessonTeaching(lesson, signal), signal);

  return {
    ...createTask({
      title: lesson.title,
      description: action,
      category: lesson.path,
    }),
    id: createTaskId(),
    lessonId: lesson.id,
    unitId: lesson.unitId,
    unitTitle: lesson.unitTitle,
    unitOrder: lesson.unitOrder,
    missionKind: 'lesson',
    adaptationMode: getAdaptationMode(signal),
    planFocus,
    teaching,
    reflectionPrompt: lesson.reflectionPrompt,
    dayKey,
    reflection: null,
    source: 'curriculum',
  };
};

const buildCheckpointMission = (
  unitLessons: MissionDefinition[],
  dayKey: string,
  signal = getAdaptationSignal([]),
  planFocus: DailyTask['planFocus'] = 'standard',
): DailyTask => {
  const unit = unitLessons[0];

  return {
    ...createTask({
      title: `${unit.unitTitle} checkpoint`,
      description:
        signal === 'needs_support'
          ? 'Bu unite boyunca seni zorlayan tek bir noktayi ve sonraki unitede bunu kolaylastiracak tek bir hamleyi yaz.'
          : 'Bu unite boyunca ogrendigin iki seyi ve bir sonraki unitede bilincli olarak neyi gelistirecegini yaz.',
      category: unit.path,
    }),
    id: createTaskId(),
    lessonId: getCheckpointLessonId(unit.unitId),
    unitId: unit.unitId,
    unitTitle: unit.unitTitle,
    unitOrder: unit.unitOrder,
    missionKind: 'checkpoint',
    adaptationMode: getAdaptationMode(signal),
    planFocus,
    teaching: adaptTeaching(
      'Bir unit biterken mini review yapmak, ogrendiklerini daginik bir deneyimden sistemli gelisime cevirir.',
      signal,
    ),
    reflectionPrompt: 'Bu unite sana en cok ne kazandirdi ve bir sonraki asamada neye daha cok dikkat edeceksin?',
    dayKey,
    reflection: null,
    source: 'curriculum',
  };
};

const getBranchedLessonCandidate = (
  unitLessons: MissionDefinition[],
  completedLessonIds: Set<string>,
  preferredBranch: Exclude<DailyTask['planFocus'], 'legacy'>,
) => {
  const nextPendingIndex = unitLessons.findIndex((lesson) => !completedLessonIds.has(lesson.id));

  if (nextPendingIndex === -1 || preferredBranch === 'standard') {
    return null;
  }

  const candidateWindow = unitLessons.filter((lesson, index) => index >= nextPendingIndex && index <= nextPendingIndex + 2);

  return candidateWindow.find((lesson) => !completedLessonIds.has(lesson.id) && lesson.premiumPlanTag === preferredBranch) ?? null;
};

const getNextMissionDefinition = (
  profile: UserProfile,
  tasks: DailyTask[],
  weeklyPlanSnapshot?: WeeklyPlanSnapshot | null,
  forcedPlanFocus?: Exclude<DailyTask['planFocus'], 'legacy'>,
) => {
  const signal = isPremiumProfile(profile) ? getAdaptationSignal(tasks) : 'steady';
  const preferredBranch =
    forcedPlanFocus ??
    (isPremiumProfile(profile)
      ? getCurrentWeeklyPlanDay(profile, tasks, weeklyPlanSnapshot).branchFocus ?? getAdaptivePlanDirection(profile, tasks)
      : 'standard');
  const pathCurriculum = getCurriculumForPath(profile.selectedPath);
  const completedLessonIds = getCompletedLessonIds(tasks);
  const completedCheckpointIds = getCompletedCheckpointIds(tasks);
  const unlockedLessons = pathCurriculum.filter((lesson) => lesson.minLevel <= profile.level);

  const unitOrderMap = [...new Set(unlockedLessons.map((lesson) => lesson.unitId))];

  for (const unitId of unitOrderMap) {
    const unitLessons = unlockedLessons.filter((lesson) => lesson.unitId === unitId);
    const allLessonsCompleted = unitLessons.every((lesson) => completedLessonIds.has(lesson.id));
    const checkpointId = getCheckpointLessonId(unitId);

    if (allLessonsCompleted && !completedCheckpointIds.has(checkpointId)) {
      return {
        kind: 'checkpoint' as const,
        mission: buildCheckpointMission(unitLessons, getDayKey(), signal, preferredBranch),
      };
    }

    const nextUnitLesson =
      getBranchedLessonCandidate(unitLessons, completedLessonIds, preferredBranch) ??
      unitLessons.find((lesson) => !completedLessonIds.has(lesson.id));
    if (nextUnitLesson) {
      return {
        kind: 'lesson' as const,
        mission: buildLessonMission(nextUnitLesson, getDayKey(), signal, preferredBranch),
      };
    }
  }

  const fallbackLesson = unlockedLessons[unlockedLessons.length - 1] ?? pathCurriculum[0];

  return {
    kind: 'lesson' as const,
    mission: buildLessonMission(fallbackLesson, getDayKey(), signal, preferredBranch),
  };
};

export const ensureDailyMission = (
  profile: UserProfile,
  tasks: DailyTask[],
  weeklyPlanSnapshot?: WeeklyPlanSnapshot | null,
  plannedMissions: PlannedMission[] = [],
) => {
  const dayKey = getDayKey();
  const todayMission = tasks.find((task) => task.dayKey === dayKey && task.source === 'curriculum');

  if (todayMission) {
    return { tasks, todayMission };
  }

  const queuedMission = plannedMissions.find((mission) => mission.dayKey === dayKey);
  if (queuedMission) {
    const seededMission: DailyTask = {
      ...createTask({
        title: queuedMission.title,
        description: queuedMission.teaching,
        category: profile.selectedPath,
      }),
      id: createTaskId(),
      lessonId: queuedMission.lessonId,
      unitId: queuedMission.lessonId,
      unitTitle: queuedMission.unitTitle,
      unitOrder: 0,
      missionKind: queuedMission.missionKind,
      adaptationMode: queuedMission.adaptationMode,
      planFocus: queuedMission.planFocus,
      teaching: queuedMission.teaching,
      reflectionPrompt: 'Bu planli gorev sana bugun ne hissettirdi?',
      dayKey,
      reflection: null,
      source: 'curriculum',
    };

    return {
      tasks: [...tasks, seededMission],
      todayMission: seededMission,
    };
  }

  const nextMission = getNextMissionDefinition(profile, tasks, weeklyPlanSnapshot).mission;
  const seededMission = { ...nextMission, dayKey };

  return {
    tasks: [...tasks, seededMission],
    todayMission: seededMission,
  };
};

export const buildPlannedMissionQueue = (
  profile: UserProfile,
  tasks: DailyTask[],
  weeklyPlanSnapshot?: WeeklyPlanSnapshot | null,
  count = 3,
): PlannedMission[] => {
  if (!isPremiumProfile(profile) || !weeklyPlanSnapshot) {
    return [];
  }

  let simulatedProfile = profile;
  let simulatedTasks = [...tasks];
  let previewDayKey = getTomorrowDayKey(getDayKey());
  const planned: PlannedMission[] = [];
  const currentDay = getCurrentWeeklyPlanDay(profile, tasks, weeklyPlanSnapshot).day;

  for (let index = 0; index < count; index += 1) {
    const planDay = weeklyPlanSnapshot.days[(currentDay - 1 + index) % weeklyPlanSnapshot.days.length];
    const nextMission = getNextMissionDefinition(
      simulatedProfile,
      simulatedTasks,
      weeklyPlanSnapshot,
      planDay?.branchFocus ?? 'standard',
    ).mission;
    const previewTask = {
      ...nextMission,
      id: `${nextMission.id}-planned-${index}`,
      dayKey: previewDayKey,
      completed: false,
      completedAt: null,
      rewardGranted: false,
      reflection: null,
    };

    planned.push({
      dayKey: previewDayKey,
      lessonId: previewTask.lessonId,
      unitTitle: previewTask.unitTitle,
      title: previewTask.title,
      teaching: previewTask.teaching,
      missionKind: previewTask.missionKind,
      adaptationMode: previewTask.adaptationMode,
      planFocus: previewTask.planFocus,
    });

    const { nextTasks, nextProfile } = toggleTaskWithProgression([...simulatedTasks, previewTask], simulatedProfile, previewTask.id);
    simulatedTasks = nextTasks;
    simulatedProfile = nextProfile;
    previewDayKey = getTomorrowDayKey(previewDayKey);
  }

  return planned;
};

export const saveMissionReflection = (tasks: DailyTask[], taskId: string, reflection: string) =>
  tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          reflection,
        }
      : task,
  );

export const getMissionStats = (tasks: DailyTask[]) => {
  const curriculumTasks = tasks.filter((task) => task.source === 'curriculum');
  const completedCurriculumTasks = curriculumTasks.filter((task) => task.completed);
  const completedCheckpoints = curriculumTasks.filter((task) => task.completed && task.missionKind === 'checkpoint').length;

  return {
    totalMissions: curriculumTasks.length,
    completedMissions: completedCurriculumTasks.length,
    completedCheckpoints,
    completionRate:
      curriculumTasks.length === 0 ? 0 : Math.round((completedCurriculumTasks.length / curriculumTasks.length) * 100),
  };
};

const createMissionPreview = (profile: UserProfile, mission: DailyTask, dayKey: string): MissionPreview => {
  const premium = isPremiumProfile(profile);

  return {
    dayKey,
    unitTitle: mission.unitTitle,
    title: mission.title,
    teaching: premium ? mission.teaching : '',
    missionKind: mission.missionKind,
    adaptationMode: premium ? mission.adaptationMode : 'standard',
    planFocus: premium ? mission.planFocus : 'standard',
    lockedDetails: !premium,
  };
};

export const getTomorrowMissionPreview = (
  profile: UserProfile,
  tasks: DailyTask[],
  weeklyPlanSnapshot?: WeeklyPlanSnapshot | null,
  plannedMissions: PlannedMission[] = [],
) => {
  if (plannedMissions[0]) {
    const mission = plannedMissions[0];
    return createMissionPreview(
      profile,
      {
        ...createTask({
          title: mission.title,
          description: '',
          category: profile.selectedPath,
        }),
        lessonId: mission.lessonId,
        unitId: mission.lessonId,
        unitTitle: mission.unitTitle,
        unitOrder: 0,
        missionKind: mission.missionKind,
        adaptationMode: mission.adaptationMode,
        planFocus: mission.planFocus,
        teaching: mission.teaching,
        reflectionPrompt: '',
        dayKey: mission.dayKey,
        reflection: null,
        source: 'curriculum',
      },
      mission.dayKey,
    );
  }

  const tomorrowKey = getTomorrowDayKey(getDayKey());
  const nextMission = getNextMissionDefinition(profile, tasks, weeklyPlanSnapshot).mission;

  return createMissionPreview(profile, nextMission, tomorrowKey);
};

export const getUpcomingMissionPreview = (
  profile: UserProfile,
  tasks: DailyTask[],
  count = 3,
  weeklyPlanSnapshot?: WeeklyPlanSnapshot | null,
  plannedMissions: PlannedMission[] = [],
) => {
  if (!isPremiumProfile(profile)) {
    return [] as MissionPreview[];
  }

  if (plannedMissions.length > 0) {
    return plannedMissions.slice(0, count).map((mission) =>
      createMissionPreview(
        profile,
        {
          ...createTask({
            title: mission.title,
            description: '',
            category: profile.selectedPath,
          }),
          lessonId: mission.lessonId,
          unitId: mission.lessonId,
          unitTitle: mission.unitTitle,
          unitOrder: 0,
          missionKind: mission.missionKind,
          adaptationMode: mission.adaptationMode,
          planFocus: mission.planFocus,
          teaching: mission.teaching,
          reflectionPrompt: '',
          dayKey: mission.dayKey,
          reflection: null,
          source: 'curriculum',
        },
        mission.dayKey,
      ),
    );
  }

  let simulatedProfile = profile;
  let simulatedTasks = [...tasks];
  let previewDayKey = getTomorrowDayKey(getDayKey());
  const previews: MissionPreview[] = [];

  for (let index = 0; index < count; index += 1) {
    const nextMission = getNextMissionDefinition(simulatedProfile, simulatedTasks, weeklyPlanSnapshot).mission;
    const previewTask = {
      ...nextMission,
      id: `${nextMission.id}-preview-${index}`,
      dayKey: previewDayKey,
      completed: false,
      completedAt: null,
      rewardGranted: false,
      reflection: null,
    };

    previews.push(createMissionPreview(profile, previewTask, previewDayKey));

    const { nextTasks, nextProfile } = toggleTaskWithProgression([...simulatedTasks, previewTask], simulatedProfile, previewTask.id);
    simulatedTasks = nextTasks;
    simulatedProfile = nextProfile;
    previewDayKey = getTomorrowDayKey(previewDayKey);
  }

  return previews;
};
