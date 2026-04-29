// Ascend Monk Mode — Discipline Academy
// Duolingo-style sequential learning paths.
//
// Each path has ordered lessons. Lessons unlock sequentially.
// All teaching/action/reflection text is in i18n keys (per-locale).

export const PATHS = [
  {
    id: 'dopamine-detox',
    icon: '🚫',
    color: '#F55A1F',
    duration: 30,
    order: 1,
    freeLessons: 5, // first N free, rest premium
  },
  {
    id: 'silent-morning',
    icon: '🌅',
    color: '#F59E0B',
    duration: 21,
    order: 2,
    freeLessons: 3,
  },
  {
    id: 'mind-discipline',
    icon: '🧠',
    color: '#6366F1',
    duration: 28,
    order: 3,
    freeLessons: 3,
  },
  {
    id: 'body-discipline',
    icon: '💪',
    color: '#EF4444',
    duration: 30,
    order: 4,
    freeLessons: 3,
  },
  {
    id: 'money-discipline',
    icon: '💰',
    color: '#10B981',
    duration: 21,
    order: 5,
    freeLessons: 3,
  },
];

// Lesson IDs are stable strings: <pathId>-<order>
// e.g. dopamine-detox-1, dopamine-detox-2, ...
// Each lesson references i18n keys for content:
//   lessons.<pathId>.<order>.title
//   lessons.<pathId>.<order>.teaching
//   lessons.<pathId>.<order>.action
//   lessons.<pathId>.<order>.reflectionPrompt
export const buildLesson = (pathId, order) => ({
  id: `${pathId}-${order}`,
  pathId,
  order,
  i18nKey: `lessons.${pathId}.${order}`,
});

export const getPathLessons = (path) =>
  Array.from({ length: path.duration }, (_, i) => buildLesson(path.id, i + 1));

export const getPathById = (id) => PATHS.find((p) => p.id === id) || null;

export const getLessonById = (lessonId) => {
  const [pathId, orderStr] = lessonId.match(/^(.+)-(\d+)$/)?.slice(1) || [];
  if (!pathId) return null;
  const order = parseInt(orderStr, 10);
  return buildLesson(pathId, order);
};

// Determine if a lesson is locked given user's progress
export const getLessonState = (lesson, userProgress) => {
  const pathProgress = userProgress?.[lesson.pathId] || { completed: [] };
  const path = getPathById(lesson.pathId);
  if (!path) return 'locked';

  // Completed
  if (pathProgress.completed.includes(lesson.id)) return 'completed';

  // Current = first lesson with no prior incomplete
  // Previous order must all be completed (or this is order 1)
  const allPrevDone = lesson.order === 1
    || Array.from({ length: lesson.order - 1 }, (_, i) => `${lesson.pathId}-${i + 1}`)
        .every((id) => pathProgress.completed.includes(id));

  if (allPrevDone) return 'current';
  return 'locked';
};

export const isPathComplete = (path, userProgress) => {
  const pathProgress = userProgress?.[path.id];
  if (!pathProgress) return false;
  return pathProgress.completed.length >= path.duration;
};

export const getCurrentLesson = (path, userProgress) => {
  const lessons = getPathLessons(path);
  return lessons.find((l) => getLessonState(l, userProgress) === 'current') || null;
};

export const getPathProgress = (path, userProgress) => {
  const pathProgress = userProgress?.[path.id];
  const completed = pathProgress?.completed?.length || 0;
  return {
    completed,
    total: path.duration,
    percent: Math.round((completed / path.duration) * 100),
  };
};
