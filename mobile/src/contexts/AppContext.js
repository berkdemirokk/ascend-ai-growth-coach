import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, XP_REWARDS, checkLevelUp } from '../config/constants';
import { checkAchievements } from '../config/achievements';
import { checkPremiumStatus } from '../services/purchases';
import {
  getSprintById,
  getSprintDay,
  isSprintFinished,
  getTodaysTasks,
  getMaintenanceTasks,
  getUnlockedTier,
  getTierConfig,
} from '../config/sprints';
import { getDailyChallenge } from '../config/challenges';
import { getRank } from '../config/ranks';
import {
  getLessonById,
  getLessonsForSprint,
  getUnlockedLessons,
  calculateLessonXP,
} from '../config/lessons';
import { getFactOfTheDay } from '../config/facts';
import { pullState, pushState, chooseWinner } from '../services/cloudSync';
import { useAuth } from './AuthContext';

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState = {
  selectedCategories: ['health', 'career', 'mindfulness', 'relationships', 'finance'],
  difficulty: 'beginner',
  onboarded: false,

  // Personalization
  userProfile: null, // { goals: string[], answers: { [qid]: string | string[] } }

  // Gamification
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,

  // Premium
  isPremium: false,
  streakFreezes: 0,

  // History
  history: [],

  // Achievements
  unlockedAchievements: [],

  // Today
  todayCompleted: false,

  // Ad counter
  actionsSinceLastAd: 0,

  // ── Monk Mode Sprint ────────────────────────────────────────────────────
  // activeSprint: { sprintId, tier, startedAt (ISO), violations: [{ ruleId, date }] }
  // sprintTaskCompletions: { [YYYY-MM-DD]: [taskId, ...] }
  // sprintHistory: [{ sprintId, tier, startedAt, completedAt, status }]
  // claimedChallenges: { [YYYY-MM-DD]: challengeId }
  // maintenance: { sprintId, completions: { [YYYY-MM-DD]: [taskId, ...] } } | null
  activeSprint: null,
  sprintTaskCompletions: {},
  sprintHistory: [],
  claimedChallenges: {},
  maintenance: null,

  // ── Learning (Duolingo-style) ─────────────────────────────────────────
  // lessonCompletions: { [lessonId]: { completedAt, correctAnswers, totalQuestions, xpEarned } }
  // readFactIds: { [factId]: ISO string when first read }
  lessonCompletions: {},
  readFactIds: {},

  // Internal
  _loaded: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayDateString = () => {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

const ACTION_TYPES = {
  LOAD_STATE: 'LOAD_STATE',
  COMPLETE_ACTION: 'COMPLETE_ACTION',
  SET_CATEGORIES: 'SET_CATEGORIES',
  SET_DIFFICULTY: 'SET_DIFFICULTY',
  COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  SET_PREMIUM: 'SET_PREMIUM',
  USE_STREAK_FREEZE: 'USE_STREAK_FREEZE',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  REFRESH_TODAY: 'REFRESH_TODAY',
  START_SPRINT: 'START_SPRINT',
  COMPLETE_SPRINT_TASK: 'COMPLETE_SPRINT_TASK',
  RECORD_SPRINT_VIOLATION: 'RECORD_SPRINT_VIOLATION',
  ABANDON_SPRINT: 'ABANDON_SPRINT',
  COMPLETE_SPRINT: 'COMPLETE_SPRINT',
  CLAIM_DAILY_CHALLENGE: 'CLAIM_DAILY_CHALLENGE',
  START_MAINTENANCE: 'START_MAINTENANCE',
  COMPLETE_MAINTENANCE_TASK: 'COMPLETE_MAINTENANCE_TASK',
  STOP_MAINTENANCE: 'STOP_MAINTENANCE',
  COMPLETE_LESSON: 'COMPLETE_LESSON',
  MARK_FACT_READ: 'MARK_FACT_READ',
};

function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.LOAD_STATE:
      return { ...state, ...action.payload, _loaded: true };

    case ACTION_TYPES.COMPLETE_ACTION:
      return { ...state, ...action.payload };

    case ACTION_TYPES.SET_CATEGORIES:
      return { ...state, selectedCategories: action.payload };

    case ACTION_TYPES.SET_DIFFICULTY:
      return { ...state, difficulty: action.payload };

    case ACTION_TYPES.COMPLETE_ONBOARDING:
      return { ...state, onboarded: true };

    case ACTION_TYPES.SET_USER_PROFILE:
      return { ...state, userProfile: action.payload };

    case ACTION_TYPES.SET_PREMIUM: {
      const becomingPremium = action.payload && !state.isPremium;
      return {
        ...state,
        isPremium: action.payload,
        streakFreezes: becomingPremium
          ? state.streakFreezes + 3
          : state.streakFreezes,
      };
    }

    case ACTION_TYPES.USE_STREAK_FREEZE:
      return { ...state, streakFreezes: Math.max(0, state.streakFreezes - 1) };

    case ACTION_TYPES.DELETE_ACCOUNT:
      return { ...initialState, _loaded: true };

    case ACTION_TYPES.REFRESH_TODAY:
      return { ...state, todayCompleted: action.payload };

    case ACTION_TYPES.START_SPRINT:
      return {
        ...state,
        activeSprint: {
          sprintId: action.payload.sprintId,
          tier: action.payload.tier || 1,
          startedAt: action.payload.startedAt,
          violations: [],
        },
        sprintTaskCompletions: {},
        maintenance: null,
      };

    case ACTION_TYPES.COMPLETE_SPRINT_TASK: {
      const { date, taskId, xpEarned } = action.payload;
      const existing = state.sprintTaskCompletions[date] || [];
      if (existing.includes(taskId)) return state;
      const newTotalXP = state.totalXP + xpEarned;
      const newLevel = checkLevelUp(newTotalXP, state.level);
      return {
        ...state,
        totalXP: newTotalXP,
        level: newLevel,
        sprintTaskCompletions: {
          ...state.sprintTaskCompletions,
          [date]: [...existing, taskId],
        },
      };
    }

    case ACTION_TYPES.RECORD_SPRINT_VIOLATION: {
      if (!state.activeSprint) return state;
      return {
        ...state,
        activeSprint: {
          ...state.activeSprint,
          violations: [
            ...(state.activeSprint.violations || []),
            { ruleId: action.payload.ruleId, date: action.payload.date },
          ],
        },
      };
    }

    case ACTION_TYPES.ABANDON_SPRINT: {
      if (!state.activeSprint) return state;
      const entry = {
        ...state.activeSprint,
        completedAt: action.payload.completedAt,
        status: 'abandoned',
      };
      return {
        ...state,
        activeSprint: null,
        sprintTaskCompletions: {},
        sprintHistory: [...state.sprintHistory, entry],
      };
    }

    case ACTION_TYPES.COMPLETE_SPRINT: {
      if (!state.activeSprint) return state;
      const entry = {
        ...state.activeSprint,
        completedAt: action.payload.completedAt,
        status: 'completed',
        taskCompletions: state.sprintTaskCompletions,
      };
      const bonusXP = action.payload.bonusXP || 0;
      const newTotalXP = state.totalXP + bonusXP;
      return {
        ...state,
        totalXP: newTotalXP,
        level: checkLevelUp(newTotalXP, state.level),
        activeSprint: null,
        sprintTaskCompletions: {},
        sprintHistory: [...state.sprintHistory, entry],
        // Auto-start maintenance mode for the sprint just completed.
        maintenance: {
          sprintId: state.activeSprint.sprintId,
          startedAt: action.payload.completedAt,
          completions: {},
        },
      };
    }

    case ACTION_TYPES.CLAIM_DAILY_CHALLENGE: {
      const { date, challengeId, xpEarned } = action.payload;
      if (state.claimedChallenges[date]) return state;
      const newTotalXP = state.totalXP + xpEarned;
      return {
        ...state,
        totalXP: newTotalXP,
        level: checkLevelUp(newTotalXP, state.level),
        claimedChallenges: {
          ...state.claimedChallenges,
          [date]: challengeId,
        },
      };
    }

    case ACTION_TYPES.START_MAINTENANCE:
      return {
        ...state,
        maintenance: {
          sprintId: action.payload.sprintId,
          startedAt: action.payload.startedAt,
          completions: {},
        },
      };

    case ACTION_TYPES.COMPLETE_MAINTENANCE_TASK: {
      if (!state.maintenance) return state;
      const { date, taskId, xpEarned } = action.payload;
      const existing = state.maintenance.completions[date] || [];
      if (existing.includes(taskId)) return state;
      const newTotalXP = state.totalXP + xpEarned;
      return {
        ...state,
        totalXP: newTotalXP,
        level: checkLevelUp(newTotalXP, state.level),
        maintenance: {
          ...state.maintenance,
          completions: {
            ...state.maintenance.completions,
            [date]: [...existing, taskId],
          },
        },
      };
    }

    case ACTION_TYPES.STOP_MAINTENANCE:
      return { ...state, maintenance: null };

    case ACTION_TYPES.COMPLETE_LESSON: {
      const { lessonId, correctAnswers, totalQuestions, xpEarned } =
        action.payload;
      if (state.lessonCompletions[lessonId]) return state;
      const newTotalXP = state.totalXP + xpEarned;
      return {
        ...state,
        totalXP: newTotalXP,
        level: checkLevelUp(newTotalXP, state.level),
        lessonCompletions: {
          ...state.lessonCompletions,
          [lessonId]: {
            completedAt: new Date().toISOString(),
            correctAnswers,
            totalQuestions,
            xpEarned,
          },
        },
      };
    }

    case ACTION_TYPES.MARK_FACT_READ: {
      const { factId } = action.payload;
      if (state.readFactIds[factId]) return state;
      return {
        ...state,
        readFactIds: {
          ...state.readFactIds,
          [factId]: new Date().toISOString(),
        },
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const userId = user?.id || null;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATE);
        if (raw) {
          const parsed = JSON.parse(raw);
          const today = getTodayDateString();
          const todayCompleted = parsed.lastCompletedDate === today;
          dispatch({
            type: ACTION_TYPES.LOAD_STATE,
            payload: { ...parsed, todayCompleted },
          });
        } else {
          dispatch({ type: ACTION_TYPES.LOAD_STATE, payload: {} });
        }
      } catch (e) {
        console.error('[AppContext] Failed to load state:', e);
        dispatch({ type: ACTION_TYPES.LOAD_STATE, payload: {} });
      }
    })();
  }, []);

  useEffect(() => {
    if (!state._loaded) return;
    const toSave = { ...state };
    delete toSave._loaded;
    AsyncStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(toSave)).catch(
      (e) => console.error('[AppContext] Failed to save state:', e),
    );
  }, [state]);

  // Cloud pull: when a user first signs in, merge cloud snapshot with
  // the local one using chooseWinner. Runs once per user id.
  useEffect(() => {
    if (!state._loaded || !isAuthenticated || !userId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await pullState(userId);
        if (cancelled) return;
        if (error) {
          console.warn('[AppContext] cloud pull failed:', error?.message);
          return;
        }
        if (!data?.payload) return;
        const winner = chooseWinner(state, data.payload);
        if (winner === 'cloud') {
          dispatch({ type: ACTION_TYPES.LOAD_STATE, payload: data.payload });
        }
      } catch (e) {
        console.warn('[AppContext] cloud pull error:', e?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isAuthenticated, state._loaded]);

  // Cloud push: debounce state changes and upload snapshot.
  useEffect(() => {
    if (!state._loaded || !isAuthenticated || !userId) return;
    const handle = setTimeout(() => {
      pushState(userId, state).then(({ error }) => {
        if (error) console.warn('[AppContext] cloud push failed:', error?.message);
      });
    }, 1500);
    return () => clearTimeout(handle);
  }, [state, userId, isAuthenticated]);

  useEffect(() => {
    if (!state._loaded) return;
    let cancelled = false;
    (async () => {
      try {
        const active = await checkPremiumStatus();
        if (cancelled) return;
        if (active !== state.isPremium) {
          dispatch({ type: ACTION_TYPES.SET_PREMIUM, payload: !!active });
        }
      } catch (e) {
        console.warn('[AppContext] premium reconcile skipped:', e?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state._loaded]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const completeAction = useCallback(
    (action) => {
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      if (state.todayCompleted || state.lastCompletedDate === today) {
        return null;
      }

      let newStreak;
      if (state.lastCompletedDate === yesterday) {
        newStreak = state.currentStreak + 1;
      } else if (state.lastCompletedDate && state.lastCompletedDate !== yesterday) {
        if (state.isPremium && state.streakFreezes > 0) {
          newStreak = state.currentStreak + 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const newLongestStreak = Math.max(state.longestStreak, newStreak);

      let xpEarned = XP_REWARDS.ACTION_COMPLETE;
      if (state.history.length === 0) {
        xpEarned += XP_REWARDS.FIRST_TIME_BONUS;
      }
      if (newStreak === 10) xpEarned += XP_REWARDS.STREAK_10;
      if (newStreak === 30) xpEarned += XP_REWARDS.STREAK_30;
      if (newStreak === 100) xpEarned += XP_REWARDS.STREAK_100;

      const newTotalXP = state.totalXP + xpEarned;
      const newLevel = checkLevelUp(newTotalXP, state.level);
      const didLevelUp = newLevel > state.level;

      const usedFreeze =
        state.lastCompletedDate &&
        state.lastCompletedDate !== yesterday &&
        state.isPremium &&
        state.streakFreezes > 0;
      const newStreakFreezes = usedFreeze
        ? state.streakFreezes - 1
        : state.streakFreezes;

      const historyEntry = {
        id: action.id,
        category: action.category,
        difficulty: action.difficulty,
        title: action.title,
        date: today,
        completedAt: new Date().toISOString(),
        xpEarned,
      };
      const newHistory = [...state.history, historyEntry];

      const prospectiveState = {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        totalXP: newTotalXP,
        level: newLevel,
        history: newHistory,
        unlockedAchievements: state.unlockedAchievements,
      };
      const newlyUnlocked = checkAchievements(prospectiveState);
      const newUnlockedAchievements = [
        ...state.unlockedAchievements,
        ...newlyUnlocked.map((a) => a.id),
      ];

      const newActionsSinceLastAd = state.actionsSinceLastAd + 1;

      dispatch({
        type: ACTION_TYPES.COMPLETE_ACTION,
        payload: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          totalXP: newTotalXP,
          level: newLevel,
          lastCompletedDate: today,
          history: newHistory,
          unlockedAchievements: newUnlockedAchievements,
          todayCompleted: true,
          streakFreezes: newStreakFreezes,
          actionsSinceLastAd: newActionsSinceLastAd,
        },
      });

      return {
        xpEarned,
        newLevel: didLevelUp ? newLevel : null,
        newAchievements: newlyUnlocked,
        streakCount: newStreak,
      };
    },
    [state],
  );

  const setCategories = useCallback((categories) => {
    dispatch({ type: ACTION_TYPES.SET_CATEGORIES, payload: categories });
  }, []);

  const setDifficulty = useCallback((difficulty) => {
    dispatch({ type: ACTION_TYPES.SET_DIFFICULTY, payload: difficulty });
  }, []);

  const completeOnboarding = useCallback(() => {
    dispatch({ type: ACTION_TYPES.COMPLETE_ONBOARDING });
  }, []);

  const setUserProfile = useCallback((profile) => {
    dispatch({ type: ACTION_TYPES.SET_USER_PROFILE, payload: profile });
  }, []);

  const setPremium = useCallback((isPremium) => {
    dispatch({ type: ACTION_TYPES.SET_PREMIUM, payload: isPremium });
  }, []);

  const useStreakFreeze = useCallback(() => {
    if (!state.isPremium || state.streakFreezes <= 0) return false;
    dispatch({ type: ACTION_TYPES.USE_STREAK_FREEZE });
    return true;
  }, [state.isPremium, state.streakFreezes]);

  const deleteAccount = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_STATE,
        STORAGE_KEYS.ONBOARDED,
        STORAGE_KEYS.AD_COUNTER,
      ]);
    } catch (e) {
      console.error('[AppContext] Failed to clear storage:', e);
    }
    dispatch({ type: ACTION_TYPES.DELETE_ACCOUNT });
  }, []);

  const refreshTodayStatus = useCallback(() => {
    const today = getTodayDateString();
    const completed = state.lastCompletedDate === today;
    if (completed !== state.todayCompleted) {
      dispatch({ type: ACTION_TYPES.REFRESH_TODAY, payload: completed });
    }
  }, [state.lastCompletedDate, state.todayCompleted]);

  // ── Sprint actions ─────────────────────────────────────────────────────

  const startSprint = useCallback(
    (sprintId, tier) => {
      const sprint = getSprintById(sprintId);
      if (!sprint) return false;
      const unlockedTier = getUnlockedTier(sprintId, state.sprintHistory);
      const chosenTier = Math.min(tier || 1, unlockedTier);
      dispatch({
        type: ACTION_TYPES.START_SPRINT,
        payload: {
          sprintId,
          tier: chosenTier,
          startedAt: new Date().toISOString(),
        },
      });
      return true;
    },
    [state.sprintHistory],
  );

  const completeSprintTask = useCallback(
    (taskId) => {
      if (!state.activeSprint) return null;
      const sprint = getSprintById(state.activeSprint.sprintId);
      if (!sprint) return null;
      const todaysTasks = getTodaysTasks(state.activeSprint);
      const task = todaysTasks.find((t) => t.id === taskId);
      if (!task) return null;
      const date = getTodayDateString();
      const existing = state.sprintTaskCompletions[date] || [];
      if (existing.includes(taskId)) return null;
      const prevLevel = state.level;
      dispatch({
        type: ACTION_TYPES.COMPLETE_SPRINT_TASK,
        payload: { date, taskId, xpEarned: task.xp },
      });
      const newLevel = checkLevelUp(state.totalXP + task.xp, prevLevel);
      return {
        xpEarned: task.xp,
        newLevel: newLevel > prevLevel ? newLevel : null,
      };
    },
    [state.activeSprint, state.sprintTaskCompletions, state.totalXP, state.level],
  );

  const recordSprintViolation = useCallback(
    (ruleId) => {
      if (!state.activeSprint) return;
      dispatch({
        type: ACTION_TYPES.RECORD_SPRINT_VIOLATION,
        payload: { ruleId, date: getTodayDateString() },
      });
    },
    [state.activeSprint],
  );

  const abandonSprint = useCallback(() => {
    if (!state.activeSprint) return;
    dispatch({
      type: ACTION_TYPES.ABANDON_SPRINT,
      payload: { completedAt: new Date().toISOString() },
    });
  }, [state.activeSprint]);

  const completeSprint = useCallback(() => {
    if (!state.activeSprint) return null;
    const sprint = getSprintById(state.activeSprint.sprintId);
    if (!sprint) return null;
    const tier = state.activeSprint.tier || 1;
    const { xpMultiplier } = getTierConfig(tier);
    const bonusXP = Math.round(sprint.duration * 10 * xpMultiplier);
    dispatch({
      type: ACTION_TYPES.COMPLETE_SPRINT,
      payload: { completedAt: new Date().toISOString(), bonusXP },
    });
    return { bonusXP, sprintId: sprint.id, tier };
  }, [state.activeSprint]);

  // ── Daily challenge ────────────────────────────────────────────────────

  const claimDailyChallenge = useCallback(() => {
    const date = getTodayDateString();
    if (state.claimedChallenges[date]) return null;
    const challenge = getDailyChallenge('user');
    dispatch({
      type: ACTION_TYPES.CLAIM_DAILY_CHALLENGE,
      payload: { date, challengeId: challenge.id, xpEarned: challenge.xp },
    });
    return { xpEarned: challenge.xp, challenge };
  }, [state.claimedChallenges]);

  // ── Maintenance mode ───────────────────────────────────────────────────

  const startMaintenance = useCallback((sprintId) => {
    if (!sprintId) return;
    dispatch({
      type: ACTION_TYPES.START_MAINTENANCE,
      payload: { sprintId, startedAt: new Date().toISOString() },
    });
  }, []);

  const stopMaintenance = useCallback(() => {
    dispatch({ type: ACTION_TYPES.STOP_MAINTENANCE });
  }, []);

  const completeMaintenanceTask = useCallback(
    (taskId) => {
      if (!state.maintenance) return null;
      const tasks = getMaintenanceTasks(state.maintenance.sprintId);
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return null;
      const date = getTodayDateString();
      const existing = state.maintenance.completions[date] || [];
      if (existing.includes(taskId)) return null;
      dispatch({
        type: ACTION_TYPES.COMPLETE_MAINTENANCE_TASK,
        payload: { date, taskId, xpEarned: task.xp },
      });
      return { xpEarned: task.xp };
    },
    [state.maintenance],
  );

  // ── Lessons & Facts ────────────────────────────────────────────────────

  const completeLesson = useCallback(
    (lessonId, correctAnswers = 0) => {
      const lesson = getLessonById(lessonId);
      if (!lesson) return null;
      if (state.lessonCompletions[lessonId]) return null;
      const xpEarned = calculateLessonXP(lesson, correctAnswers);
      const totalQuestions = lesson.quiz?.length || 0;
      const prevLevel = state.level;
      dispatch({
        type: ACTION_TYPES.COMPLETE_LESSON,
        payload: { lessonId, correctAnswers, totalQuestions, xpEarned },
      });
      const newLevel = checkLevelUp(state.totalXP + xpEarned, prevLevel);
      return {
        xpEarned,
        newLevel: newLevel > prevLevel ? newLevel : null,
      };
    },
    [state.lessonCompletions, state.totalXP, state.level],
  );

  const markFactRead = useCallback((factId) => {
    if (!factId) return;
    dispatch({ type: ACTION_TYPES.MARK_FACT_READ, payload: { factId } });
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────
  const today = getTodayDateString();
  const currentSprintDay = state.activeSprint
    ? getSprintDay(state.activeSprint)
    : 0;
  const sprintFinished = isSprintFinished(state.activeSprint);
  const todaySprintTaskIds = state.sprintTaskCompletions[today] || [];
  const todaysTasks = state.activeSprint ? getTodaysTasks(state.activeSprint) : [];
  const dailyChallenge = getDailyChallenge('user');
  const dailyChallengeClaimed = !!state.claimedChallenges[today];
  const completedSprintCount = state.sprintHistory.filter(
    (h) => h?.status === 'completed',
  ).length;
  const rank = getRank(completedSprintCount);
  const maintenanceTasks = state.maintenance
    ? getMaintenanceTasks(state.maintenance.sprintId)
    : [];
  const maintenanceCompletionsToday = state.maintenance
    ? state.maintenance.completions[today] || []
    : [];

  // Learning derived
  const sprintLessons = state.activeSprint
    ? getLessonsForSprint(state.activeSprint.sprintId)
    : [];
  const unlockedLessons = state.activeSprint
    ? getUnlockedLessons(state.activeSprint.sprintId, currentSprintDay)
    : [];
  const nextLesson =
    unlockedLessons.find((l) => !state.lessonCompletions[l.id]) || null;
  const completedLessonCount = Object.keys(state.lessonCompletions).length;
  const dailyFact = getFactOfTheDay(state.userProfile?.userId || 'guest');
  const dailyFactRead = !!state.readFactIds[dailyFact.id];

  const value = {
    ...state,

    currentSprintDay,
    sprintFinished,
    todaySprintTaskIds,
    todaysTasks,
    dailyChallenge,
    dailyChallengeClaimed,
    completedSprintCount,
    rank,
    maintenanceTasks,
    maintenanceCompletionsToday,

    // Learning derived
    sprintLessons,
    unlockedLessons,
    nextLesson,
    completedLessonCount,
    dailyFact,
    dailyFactRead,

    // Actions
    completeLesson,
    markFactRead,
    completeAction,
    setCategories,
    setDifficulty,
    completeOnboarding,
    setUserProfile,
    setPremium,
    useStreakFreeze,
    deleteAccount,
    refreshTodayStatus,
    startSprint,
    completeSprintTask,
    recordSprintViolation,
    abandonSprint,
    completeSprint,
    claimDailyChallenge,
    startMaintenance,
    stopMaintenance,
    completeMaintenanceTask,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an <AppProvider>');
  }
  return context;
}
