import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, checkLevelUp } from '../config/constants';
import { checkAchievements } from '../config/achievements';
import { checkPremiumStatus } from '../services/purchases';
import { getRank } from '../config/ranks';
import { pullState, pushState, chooseWinner } from '../services/cloudSync';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';
import { cancelAllNotifications } from '../services/notifications';

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState = {
  onboarded: false,

  // Personalization
  userProfile: null, // { goals: string[], answers: object }

  // Gamification
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastCompletedDate: null,

  // Streak calendar — { 'YYYY-MM-DD': count of lessons that day }
  lessonHistory: {},

  // Premium
  isPremium: false,
  streakFreezes: 0,

  // Achievements
  unlockedAchievements: [],

  // Hearts (Duolingo-style life system)
  hearts: 5,
  heartsRefillAt: null, // ISO timestamp when next heart refills

  // Today
  todayCompleted: false,

  // Ad counter
  actionsSinceLastAd: 0,

  // ── Discipline Academy (path-based curriculum) ────────────────────────
  // pathProgress: {
  //   [pathId]: {
  //     completed: [lessonId, ...],
  //     reflections: { [lessonId]: text },
  //     quizCorrect: { [lessonId]: number }, // # correct answers
  //   }
  // }
  pathProgress: {},
  activePathId: 'dopamine-detox',

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
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const HEART_REFILL_MINUTES = 30;

// ─── Reducer ─────────────────────────────────────────────────────────────────

const ACTION_TYPES = {
  LOAD_STATE: 'LOAD_STATE',
  COMPLETE_ONBOARDING: 'COMPLETE_ONBOARDING',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  SET_PREMIUM: 'SET_PREMIUM',
  USE_STREAK_FREEZE: 'USE_STREAK_FREEZE',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  REFRESH_TODAY: 'REFRESH_TODAY',
  COMPLETE_PATH_LESSON: 'COMPLETE_PATH_LESSON',
  SET_ACTIVE_PATH: 'SET_ACTIVE_PATH',
  LOSE_HEART: 'LOSE_HEART',
  REFILL_HEARTS: 'REFILL_HEARTS',
  RESET_AD_COUNTER: 'RESET_AD_COUNTER',
  RESET_PROGRESS: 'RESET_PROGRESS',
};

function appReducer(state, action) {
  switch (action.type) {
    case ACTION_TYPES.LOAD_STATE:
      return { ...state, ...action.payload, _loaded: true };

    case ACTION_TYPES.COMPLETE_ONBOARDING:
      return { ...state, onboarded: true };

    case ACTION_TYPES.SET_USER_PROFILE:
      return { ...state, userProfile: action.payload };

    case ACTION_TYPES.SET_PREMIUM:
      return {
        ...state,
        isPremium: !!action.payload,
        // Premium = unlimited hearts effectively
        hearts: action.payload ? 5 : state.hearts,
        // Premium activation grants 3 streak freezes one-time (don't reduce)
        streakFreezes: action.payload
          ? Math.max(state.streakFreezes || 0, 3)
          : state.streakFreezes,
      };

    case ACTION_TYPES.USE_STREAK_FREEZE:
      if (state.streakFreezes <= 0) return state;
      return { ...state, streakFreezes: state.streakFreezes - 1 };

    case ACTION_TYPES.DELETE_ACCOUNT:
      return { ...initialState, _loaded: true };

    case ACTION_TYPES.RESET_PROGRESS:
      // Wipe lesson progress + streak + XP + level + achievements,
      // BUT keep onboarded, isPremium, hearts, profile.
      return {
        ...state,
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        lastCompletedDate: null,
        lessonHistory: {},
        unlockedAchievements: [],
        pathProgress: {},
      };

    case ACTION_TYPES.REFRESH_TODAY: {
      const today = getTodayDateString();
      return {
        ...state,
        todayCompleted: state.lastCompletedDate === today,
      };
    }

    case ACTION_TYPES.SET_ACTIVE_PATH:
      return { ...state, activePathId: action.payload };

    case ACTION_TYPES.LOSE_HEART: {
      if (state.isPremium) return state; // premium = unlimited
      const newHearts = Math.max(0, state.hearts - 1);
      const refillAt =
        newHearts < 5 && !state.heartsRefillAt
          ? new Date(Date.now() + HEART_REFILL_MINUTES * 60 * 1000).toISOString()
          : state.heartsRefillAt;
      return { ...state, hearts: newHearts, heartsRefillAt: refillAt };
    }

    case ACTION_TYPES.REFILL_HEARTS:
      return { ...state, hearts: 5, heartsRefillAt: null };

    case ACTION_TYPES.RESET_AD_COUNTER:
      return { ...state, actionsSinceLastAd: 0 };

    case ACTION_TYPES.COMPLETE_PATH_LESSON: {
      const { pathId, lessonId, reflection, quizCorrect = 0, xp = 15 } = action.payload;
      const today = getTodayDateString();
      const current = state.pathProgress[pathId] || {
        completed: [],
        reflections: {},
        quizCorrect: {},
      };
      if (current.completed.includes(lessonId)) return state;

      const newTotalXP = state.totalXP + xp;
      const newLevel = checkLevelUp(newTotalXP, state.level);

      // Streak update — completing a lesson counts as today's action
      let newStreak = state.currentStreak;
      let newLastDate = state.lastCompletedDate;
      if (state.lastCompletedDate !== today) {
        const yesterday = getYesterdayDateString();
        newStreak = state.lastCompletedDate === yesterday ? state.currentStreak + 1 : 1;
        newLastDate = today;
      }

      // Check achievements
      const totalCompleted = Object.values(state.pathProgress).reduce(
        (sum, p) => sum + (p?.completed?.length || 0),
        0,
      ) + 1;
      const newAchievements = checkAchievements({
        totalLessonsCompleted: totalCompleted,
        streak: newStreak,
        level: newLevel,
        unlocked: state.unlockedAchievements,
      });

      return {
        ...state,
        pathProgress: {
          ...state.pathProgress,
          [pathId]: {
            completed: [...current.completed, lessonId],
            reflections: reflection
              ? { ...current.reflections, [lessonId]: reflection }
              : current.reflections,
            quizCorrect: { ...current.quizCorrect, [lessonId]: quizCorrect },
          },
        },
        totalXP: newTotalXP,
        level: newLevel,
        currentStreak: newStreak,
        longestStreak: Math.max(state.longestStreak || 0, newStreak),
        lastCompletedDate: newLastDate,
        lessonHistory: {
          ...(state.lessonHistory || {}),
          [today]: ((state.lessonHistory || {})[today] || 0) + 1,
        },
        actionsSinceLastAd: (state.actionsSinceLastAd || 0) + 1,
        unlockedAchievements: [
          ...state.unlockedAchievements,
          ...newAchievements.filter((a) => !state.unlockedAchievements.includes(a)),
        ],
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

  // ── Bootstrap: hydrate from AsyncStorage ────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATE);
        if (raw) {
          const parsed = JSON.parse(raw);
          const today = getTodayDateString();
          const todayCompleted = parsed.lastCompletedDate === today;

          // Auto-refill hearts if past refillAt
          let hearts = parsed.hearts ?? 5;
          let heartsRefillAt = parsed.heartsRefillAt;
          if (heartsRefillAt && new Date(heartsRefillAt) < new Date()) {
            hearts = 5;
            heartsRefillAt = null;
          }

          dispatch({
            type: ACTION_TYPES.LOAD_STATE,
            payload: { ...parsed, todayCompleted, hearts, heartsRefillAt },
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

  // ── Save state to AsyncStorage on every change ─────────────────────────
  useEffect(() => {
    if (!state._loaded) return;
    const toSave = { ...state };
    delete toSave._loaded;
    AsyncStorage.setItem(STORAGE_KEYS.USER_STATE, JSON.stringify(toSave)).catch(
      (e) => console.error('[AppContext] Failed to save state:', e),
    );
  }, [state]);

  // ── Cloud pull on first sign-in ─────────────────────────────────────────
  useEffect(() => {
    if (!state._loaded || !isAuthenticated || !userId) return;
    let cancelled = false;

    (async () => {
      try {
        const remote = await pullState(userId);
        if (cancelled || !remote) return;

        const local = { ...state };
        delete local._loaded;
        const winner = chooseWinner(local, remote);

        if (winner === remote) {
          dispatch({ type: ACTION_TYPES.LOAD_STATE, payload: remote });
        }
      } catch (e) {
        console.warn('[AppContext] Cloud pull failed:', e?.message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state._loaded, isAuthenticated, userId]);

  // ── Cloud push debounced ────────────────────────────────────────────────
  useEffect(() => {
    if (!state._loaded || !isAuthenticated || !userId) return;
    const timer = setTimeout(() => {
      const toPush = { ...state };
      delete toPush._loaded;
      pushState(userId, toPush).catch((e) =>
        console.warn('[AppContext] Cloud push failed:', e?.message),
      );
    }, 2000);
    return () => clearTimeout(timer);
  }, [state, isAuthenticated, userId]);

  // ── Premium status check on auth ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const isPremium = await checkPremiumStatus();
        dispatch({ type: ACTION_TYPES.SET_PREMIUM, payload: isPremium });
      } catch (e) {
        console.warn('[AppContext] Premium check failed:', e?.message);
      }
    })();
  }, [userId]);

  // ── Today refresh on date change ────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: ACTION_TYPES.REFRESH_TODAY });
    }, 60 * 1000); // every minute
    return () => clearInterval(interval);
  }, []);

  // ── Action creators ─────────────────────────────────────────────────────
  const completeOnboarding = useCallback(() => {
    dispatch({ type: ACTION_TYPES.COMPLETE_ONBOARDING });
  }, []);

  const setUserProfile = useCallback((profile) => {
    dispatch({ type: ACTION_TYPES.SET_USER_PROFILE, payload: profile });
  }, []);

  const setPremium = useCallback((isPremium) => {
    dispatch({ type: ACTION_TYPES.SET_PREMIUM, payload: isPremium });
  }, []);

  const useStreakFreezeAction = useCallback(() => {
    dispatch({ type: ACTION_TYPES.USE_STREAK_FREEZE });
  }, []);

  const deleteAccount = useCallback(async () => {
    // Apple guideline 5.1.1(v): account creation requires server-side
    // deletion. Call the Supabase Edge Function 'delete-user' which removes
    // the auth.users row (cascades to user_state via FK).
    let serverOk = false;
    try {
      const { error } = await supabase.functions.invoke('delete-user');
      if (!error) serverOk = true;
      else console.warn('delete-user function error:', error.message);
    } catch (e) {
      console.warn('delete-user invoke failed:', e?.message);
    }

    // Cancel scheduled local notifications so they stop firing.
    try {
      await cancelAllNotifications();
    } catch {}

    // Wipe local cache regardless of server outcome — user wants out.
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_STATE,
        STORAGE_KEYS.ONBOARDED,
        STORAGE_KEYS.AD_COUNTER,
      ]);
    } catch {}
    dispatch({ type: ACTION_TYPES.DELETE_ACCOUNT });

    // Surface server failure to the caller so it can re-attempt or warn.
    return serverOk;
  }, []);

  const setActivePath = useCallback((pathId) => {
    dispatch({ type: ACTION_TYPES.SET_ACTIVE_PATH, payload: pathId });
  }, []);

  const completePathLesson = useCallback(
    ({ pathId, lessonId, reflection, quizCorrect = 0, xp = 15 }) => {
      dispatch({
        type: ACTION_TYPES.COMPLETE_PATH_LESSON,
        payload: { pathId, lessonId, reflection, quizCorrect, xp },
      });
    },
    [],
  );

  const loseHeart = useCallback(() => {
    dispatch({ type: ACTION_TYPES.LOSE_HEART });
  }, []);

  const refillHearts = useCallback(() => {
    dispatch({ type: ACTION_TYPES.REFILL_HEARTS });
  }, []);

  const resetAdCounter = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_AD_COUNTER });
  }, []);

  const resetProgress = useCallback(() => {
    dispatch({ type: ACTION_TYPES.RESET_PROGRESS });
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────
  const completedPathsCount = Object.entries(state.pathProgress).filter(
    ([pathId, prog]) => prog?.completed?.length >= 21,
  ).length;
  const rank = getRank(completedPathsCount);

  const totalLessonsCompleted = Object.values(state.pathProgress).reduce(
    (sum, p) => sum + (p?.completed?.length || 0),
    0,
  );

  const value = {
    ...state,
    rank,
    completedPathsCount,
    totalLessonsCompleted,
    completeOnboarding,
    setUserProfile,
    setPremium,
    useStreakFreezeAction,
    deleteAccount,
    setActivePath,
    completePathLesson,
    loseHeart,
    refillHearts,
    resetAdCounter,
    resetProgress,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
