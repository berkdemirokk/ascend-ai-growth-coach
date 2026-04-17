import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, XP_REWARDS, checkLevelUp } from '../config/constants';
import { checkAchievements } from '../config/achievements';
import { checkPremiumStatus } from '../services/purchases';
import { getSprintById, getSprintDay, isSprintFinished } from '../config/sprints';

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState = {
  // User preferences
  selectedCategories: ['health', 'career', 'mindfulness', 'relationships', 'finance'],
  difficulty: 'beginner',
  onboarded: false,

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
  // activeSprint: { sprintId, startedAt (ISO), violations: [{ ruleId, date }] }
  // sprintTaskCompletions: { [YYYY-MM-DD]: [taskId, ...] }
  // sprintHistory: [{ sprintId, startedAt, completedAt, status, daysCompleted }]
  activeSprint: null,
  sprintTaskCompletions: {},
  sprintHistory: [],

  // Internal
  _loaded: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns today's date as a YYYY-MM-DD string in the device's local timezone.
 */
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Returns yesterday's date as a YYYY-MM-DD string in the device's local timezone.
 */
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
  SET_PREMIUM: 'SET_PREMIUM',
  USE_STREAK_FREEZE: 'USE_STREAK_FREEZE',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  REFRESH_TODAY: 'REFRESH_TODAY',
  START_SPRINT: 'START_SPRINT',
  COMPLETE_SPRINT_TASK: 'COMPLETE_SPRINT_TASK',
  RECORD_SPRINT_VIOLATION: 'RECORD_SPRINT_VIOLATION',
  ABANDON_SPRINT: 'ABANDON_SPRINT',
  COMPLETE_SPRINT: 'COMPLETE_SPRINT',
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

    case ACTION_TYPES.SET_PREMIUM: {
      const becomingPremium = action.payload && !state.isPremium;
      return {
        ...state,
        isPremium: action.payload,
        // Grant 3 streak-freeze tokens the first time a user transitions to
        // premium. Downgrades don't revoke already-granted freezes.
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
          startedAt: action.payload.startedAt,
          violations: [],
        },
        sprintTaskCompletions: {},
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

  // ── Load persisted state on mount ────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATE);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Determine if today was already completed
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

  // ── Persist state whenever it changes (skip until initial load) ──────────

  useEffect(() => {
    if (!state._loaded) return;

    const toSave = { ...state };
    delete toSave._loaded;

    AsyncStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(toSave)).catch(
      (e) => console.error('[AppContext] Failed to save state:', e),
    );
  }, [state]);

  // ── Reconcile premium status with RevenueCat on launch ───────────────────
  //
  // Locally-persisted `isPremium` can drift from the real entitlement state
  // (subscription expired, user restored on another device, refunded, etc.).
  // After the initial state load we ask RevenueCat for the truth and sync.
  // We only flip to `true` here; flipping to `false` happens too on expiry.

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
        // RevenueCat not initialized yet (simulator, sandbox hiccup, no
        // network); fall back to the persisted value silently.
        console.warn('[AppContext] premium reconcile skipped:', e?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Run once after the initial load. `isPremium` intentionally omitted
    // from deps to avoid re-running every time premium toggles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state._loaded]);

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Complete today's action.
   *
   * @param {{ id: string, category: string, difficulty: string, title: string }} action
   * @returns {{ xpEarned: number, newLevel: number|null, newAchievements: Array, streakCount: number } | null}
   *   Returns null if today was already completed.
   */
  const completeAction = useCallback(
    (action) => {
      const today = getTodayDateString();
      const yesterday = getYesterdayDateString();

      // Already completed today – do nothing
      if (state.todayCompleted || state.lastCompletedDate === today) {
        return null;
      }

      // ── Streak logic ─────────────────────────────────────────────────────
      let newStreak;

      if (state.lastCompletedDate === yesterday) {
        // Consecutive day – keep building
        newStreak = state.currentStreak + 1;
      } else if (state.lastCompletedDate && state.lastCompletedDate !== yesterday) {
        // Missed at least one day
        if (state.isPremium && state.streakFreezes > 0) {
          // Use a streak freeze implicitly – streak continues
          newStreak = state.currentStreak + 1;
        } else {
          // Streak broken – reset
          newStreak = 1;
        }
      } else {
        // First ever completion (lastCompletedDate is null)
        newStreak = 1;
      }

      const newLongestStreak = Math.max(state.longestStreak, newStreak);

      // ── XP calculation ────────────────────────────────────────────────────
      let xpEarned = XP_REWARDS.ACTION_COMPLETE;

      // First-time bonus (first action ever)
      if (state.history.length === 0) {
        xpEarned += XP_REWARDS.FIRST_TIME_BONUS;
      }

      // Streak milestone bonuses (awarded once when milestone is hit)
      if (newStreak === 10) xpEarned += XP_REWARDS.STREAK_10;
      if (newStreak === 30) xpEarned += XP_REWARDS.STREAK_30;
      if (newStreak === 100) xpEarned += XP_REWARDS.STREAK_100;

      const newTotalXP = state.totalXP + xpEarned;

      // ── Level up detection ────────────────────────────────────────────────
      const newLevel = checkLevelUp(newTotalXP, state.level);
      const didLevelUp = newLevel > state.level;

      // ── Streak freeze handling (if one was implicitly used) ───────────────
      const usedFreeze =
        state.lastCompletedDate &&
        state.lastCompletedDate !== yesterday &&
        state.isPremium &&
        state.streakFreezes > 0;
      const newStreakFreezes = usedFreeze
        ? state.streakFreezes - 1
        : state.streakFreezes;

      // ── History entry ─────────────────────────────────────────────────────
      // `completedAt` is an ISO timestamp used by HistoryScreen to order the
      // timeline and render the exact time of each completion. `date` stays
      // as a local YYYY-MM-DD string for grouping + streak detection.
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

      // ── Achievement checks ────────────────────────────────────────────────
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

      // ── Ad counter ────────────────────────────────────────────────────────
      const newActionsSinceLastAd = state.actionsSinceLastAd + 1;

      // ── Dispatch ──────────────────────────────────────────────────────────
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

  const startSprint = useCallback((sprintId) => {
    const sprint = getSprintById(sprintId);
    if (!sprint) return false;
    dispatch({
      type: ACTION_TYPES.START_SPRINT,
      payload: { sprintId, startedAt: new Date().toISOString() },
    });
    return true;
  }, []);

  /**
   * Complete a sprint task for today.
   * Awards task XP to meta progression. Idempotent per (date, taskId).
   */
  const completeSprintTask = useCallback(
    (taskId) => {
      if (!state.activeSprint) return null;
      const sprint = getSprintById(state.activeSprint.sprintId);
      if (!sprint) return null;
      const task = sprint.dailyTasks.find((t) => t.id === taskId);
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

  /**
   * Finalize a finished sprint, awarding a completion bonus scaled by duration.
   */
  const completeSprint = useCallback(() => {
    if (!state.activeSprint) return null;
    const sprint = getSprintById(state.activeSprint.sprintId);
    if (!sprint) return null;
    const bonusXP = sprint.duration * 10;
    dispatch({
      type: ACTION_TYPES.COMPLETE_SPRINT,
      payload: { completedAt: new Date().toISOString(), bonusXP },
    });
    return { bonusXP, sprintId: sprint.id };
  }, [state.activeSprint]);

  // Derived sprint helpers
  const currentSprintDay = state.activeSprint
    ? getSprintDay(state.activeSprint)
    : 0;
  const sprintFinished = isSprintFinished(state.activeSprint);
  const todaySprintDate = getTodayDateString();
  const todaySprintTaskIds = state.sprintTaskCompletions[todaySprintDate] || [];

  // ── Context value ──────────────────────────────────────────────────────────

  const value = {
    // State
    ...state,

    // Sprint derived
    currentSprintDay,
    sprintFinished,
    todaySprintTaskIds,

    // Actions
    completeAction,
    setCategories,
    setDifficulty,
    completeOnboarding,
    setPremium,
    useStreakFreeze,
    deleteAccount,
    refreshTodayStatus,
    startSprint,
    completeSprintTask,
    recordSprintViolation,
    abandonSprint,
    completeSprint,
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
