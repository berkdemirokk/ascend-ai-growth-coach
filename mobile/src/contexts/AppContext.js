import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, XP_REWARDS, checkLevelUp } from '../config/constants';
import { checkAchievements } from '../config/achievements';

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

    case ACTION_TYPES.SET_PREMIUM:
      return { ...state, isPremium: action.payload };

    case ACTION_TYPES.USE_STREAK_FREEZE:
      return { ...state, streakFreezes: Math.max(0, state.streakFreezes - 1) };

    case ACTION_TYPES.DELETE_ACCOUNT:
      return { ...initialState, _loaded: true };

    case ACTION_TYPES.REFRESH_TODAY:
      return { ...state, todayCompleted: action.payload };

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
      const historyEntry = {
        id: action.id,
        category: action.category,
        difficulty: action.difficulty,
        title: action.title,
        date: today,
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

  // ── Context value ──────────────────────────────────────────────────────────

  const value = {
    // State
    ...state,

    // Actions
    completeAction,
    setCategories,
    setDifficulty,
    completeOnboarding,
    setPremium,
    useStreakFreeze,
    deleteAccount,
    refreshTodayStatus,
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
