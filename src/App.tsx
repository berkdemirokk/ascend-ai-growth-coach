import React, { useEffect, useMemo, useRef, useState } from 'react';
import Onboarding from './components/Onboarding';
import DecisionTool from './components/DecisionTool';
import TaskManager from './components/TaskManager';
import EvolutionPanel from './components/EvolutionPanel';
import LevelUpModal from './components/LevelUpModal';
import Coach from './components/Coach';
import BadgeList from './components/BadgeList';
import { DailyTask, Path, Priority, StoredUserProfile, TaskDraft, TrustedEntitlements, UserProfile } from './types';
import {
  Timestamp,
  User,
  auth,
  collection,
  completePendingRedirectSignIn,
  db,
  deleteDoc,
  doc,
  onAuthStateChanged,
  onSnapshot,
  serverTimestamp,
  setDoc,
  signInWithGoogle,
  updateDoc,
  writeBatch,
} from './firebase';
import {
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  Clock,
  Crown,
  Flame,
  Home,
  LogIn,
  LogOut,
  MessageCircle,
  Moon,
  RefreshCw,
  Settings,
  Sparkles as SparklesIcon,
  Sun,
  TrendingUp,
  User as UserIcon,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { generateTasksFromProfile } from './services/aiService';
import { playSound } from './lib/sounds';
import { buildTaskRefreshPlan } from './lib/taskRefresh';
import { createId } from './lib/ids';
import { createStoredProfile, sanitizeOwnerProfileUpdates } from './lib/profileStorage';
import { readTrustedEntitlements } from './lib/entitlements';
import { deriveUserProfile } from './lib/progression';
import { AppError, OperationType, normalizeFirebaseError } from './lib/errors';
import { AI_RUNTIME } from './lib/runtime';

const VALID_PATHS: Path[] = ['fitness', 'culture', 'social', 'entertainment', 'career', 'general'];
const VALID_PRIORITIES: Priority[] = ['high', 'medium', 'low'];
const READY_BOOTSTRAP_STATE = { profile: true, tasks: true, entitlements: true };
const PENDING_BOOTSTRAP_STATE = { profile: false, tasks: false, entitlements: false };

function normalizePath(value: unknown): Path {
  return typeof value === 'string' && VALID_PATHS.includes(value as Path) ? (value as Path) : 'general';
}

function normalizePriority(value: unknown): Priority {
  return typeof value === 'string' && VALID_PRIORITIES.includes(value as Priority) ? (value as Priority) : 'medium';
}

function normalizeTaskSource(value: unknown): DailyTask['source'] {
  if (value === 'generated' || value === 'custom' || value === 'migrated' || value === 'preview') {
    return value;
  }

  return 'migrated';
}

function normalizeTimestampField(value: unknown) {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  return typeof value === 'string' ? value : undefined;
}

function normalizeTask(data: Record<string, unknown>, id: string): DailyTask {
  return {
    id,
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'İsimsiz görev',
    description: typeof data.description === 'string' ? data.description : '',
    completed: data.completed === true,
    category: normalizePath(data.category),
    priority: normalizePriority(data.priority),
    reminderTime: typeof data.reminderTime === 'string' ? data.reminderTime : undefined,
    createdAt: normalizeTimestampField(data.createdAt),
    source: normalizeTaskSource(data.source),
    completedAt: normalizeTimestampField(data.completedAt),
  };
}

export default function App() {
  const authBootstrapTimedOutRef = useRef(false);
  const [user, setUser] = useState<User | null>(null);
  const [storedProfile, setStoredProfile] = useState<StoredUserProfile | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [entitlements, setEntitlements] = useState<TrustedEntitlements>({ isPremium: false });
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [bootstrapState, setBootstrapState] = useState(READY_BOOTSTRAP_STATE);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSubmittingOnboarding, setIsSubmittingOnboarding] = useState(false);
  const [isRegeneratingTasks, setIsRegeneratingTasks] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'coach' | 'profile'>('home');
  const [appError, setAppError] = useState<AppError | null>(null);
  const previousLevelRef = useRef<number | null>(null);
  const pendingTaskActionIdsRef = useRef(new Set<string>());
  const isUpdatingProfileRef = useRef(false);

  const isUserBootstrapReady = !user || (bootstrapState.profile && bootstrapState.tasks && bootstrapState.entitlements);
  const hasPreviewTasks = tasks.some((task) => task.source === 'preview');

  const profile = useMemo<UserProfile | null>(() => {
    if (!user || !storedProfile) {
      return null;
    }

    return deriveUserProfile(user.uid, storedProfile, tasks, entitlements);
  }, [entitlements, storedProfile, tasks, user]);

  useEffect(() => {
    completePendingRedirectSignIn().catch((error) => {
      setAppError(normalizeFirebaseError(error, OperationType.AUTH, 'auth/google'));
    });
  }, []);

  useEffect(() => {
    if (isAuthReady) {
      authBootstrapTimedOutRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (authBootstrapTimedOutRef.current || isAuthReady) {
        return;
      }

      authBootstrapTimedOutRef.current = true;
      setAppError({
        title: 'Giriş Sorunu',
        message: 'Oturum durumu zamanında alınamadı. Uygulama güvenli modda giriş ekranına döndü; tekrar deneyebilirsin.',
        operationType: OperationType.AUTH,
        path: 'auth/bootstrap',
        code: 'auth/bootstrap-timeout',
      });
      setIsAuthReady(true);
    }, 8000);

    return () => window.clearTimeout(timeoutId);
  }, [isAuthReady]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      authBootstrapTimedOutRef.current = false;
      setUser(currentUser);
      setIsAuthReady(true);
      if (!currentUser) {
        setStoredProfile(null);
        setTasks([]);
        setEntitlements({ isPremium: false });
        setBootstrapState(READY_BOOTSTRAP_STATE);
        setIsLoggingIn(false);
        setIsLoggingOut(false);
        pendingTaskActionIdsRef.current.clear();
        isUpdatingProfileRef.current = false;
        return;
      }

      setBootstrapState(PENDING_BOOTSTRAP_STATE);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const profileRef = doc(db, 'users', user.uid);
    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const entitlementsRef = doc(db, 'userEntitlements', user.uid);

    const unsubscribeProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setStoredProfile(null);
          setBootstrapState((currentState) => ({ ...currentState, profile: true }));
          return;
        }

        setStoredProfile(createStoredProfile(snapshot.data() as Partial<StoredUserProfile>));
        setBootstrapState((currentState) => ({ ...currentState, profile: true }));
      },
      (error) => {
        setAppError(normalizeFirebaseError(error, OperationType.GET, `users/${user.uid}`));
        setBootstrapState((currentState) => ({ ...currentState, profile: true }));
      },
    );

    const unsubscribeTasks = onSnapshot(
      tasksRef,
      (snapshot) => {
        const nextTasks = snapshot.docs.map((snapshotDoc) =>
          normalizeTask(snapshotDoc.data() as Record<string, unknown>, snapshotDoc.id),
        );
        setTasks(nextTasks);
        setBootstrapState((currentState) => ({ ...currentState, tasks: true }));
      },
      (error) => {
        setAppError(normalizeFirebaseError(error, OperationType.GET, `users/${user.uid}/tasks`));
        setBootstrapState((currentState) => ({ ...currentState, tasks: true }));
      },
    );

    const unsubscribeEntitlements = onSnapshot(
      entitlementsRef,
      (snapshot) => {
        setEntitlements(readTrustedEntitlements(snapshot.exists() ? snapshot.data() : undefined));
        setBootstrapState((currentState) => ({ ...currentState, entitlements: true }));
      },
      (error) => {
        setAppError(normalizeFirebaseError(error, OperationType.GET, `userEntitlements/${user.uid}`));
        setEntitlements({ isPremium: false });
        setBootstrapState((currentState) => ({ ...currentState, entitlements: true }));
      },
    );

    return () => {
      unsubscribeProfile();
      unsubscribeTasks();
      unsubscribeEntitlements();
    };
  }, [user]);

  useEffect(() => {
    if (profile?.theme === 'dark') {
      document.documentElement.classList.add('dark');
      return;
    }

    document.documentElement.classList.remove('dark');
  }, [profile?.theme]);

  useEffect(() => {
    if (!profile) {
      previousLevelRef.current = null;
      return;
    }

    if (previousLevelRef.current !== null && profile.level > previousLevelRef.current) {
      setShowLevelUp(true);
    }

    previousLevelRef.current = profile.level;
  }, [profile]);

  const clearAppError = () => setAppError(null);

  const buildTaskWriteData = (taskId: string, draft: TaskDraft) => ({
    id: taskId,
    title: draft.title.trim(),
    description: draft.description.trim(),
    completed: false,
    category: draft.category,
    priority: draft.priority,
    reminderTime: draft.reminderTime,
    source: draft.source,
    createdAt: serverTimestamp(),
  });

  const createTaskForUser = async (userId: string, draft: TaskDraft) => {
    const taskId = createId();
    await setDoc(doc(db, 'users', userId, 'tasks', taskId), buildTaskWriteData(taskId, draft));
    return taskId;
  };

  const handleLogin = async () => {
    if (isLoggingIn) {
      return;
    }

    try {
      setIsLoggingIn(true);
      clearAppError();
      await signInWithGoogle();
    } catch (error) {
      setAppError(normalizeFirebaseError(error, OperationType.AUTH, 'auth/google'));
      setIsLoggingIn(false);
    }
  };

  const handleOnboardingComplete = async (newProfile: StoredUserProfile) => {
    if (!user || isSubmittingOnboarding) {
      return;
    }

    try {
      setIsSubmittingOnboarding(true);
      clearAppError();
      const profileToSave = createStoredProfile(newProfile);
      const initialTasks = await generateTasksFromProfile({
        selectedPath: profileToSave.selectedPath,
        dailyTime: profileToSave.dailyTime,
        intensity: profileToSave.intensity,
        analysis: profileToSave.analysis,
      });

      const batch = writeBatch(db);
      batch.set(doc(db, 'users', user.uid), sanitizeOwnerProfileUpdates(profileToSave));

      initialTasks.forEach((task) => {
        const taskId = createId();
        batch.set(
          doc(db, 'users', user.uid, 'tasks', taskId),
          buildTaskWriteData(taskId, {
            ...task,
            source: AI_RUNTIME.generatedTaskSource,
          }),
        );
      });

      await batch.commit();

      playSound('success');
    } catch (error) {
      setAppError(normalizeFirebaseError(error, OperationType.WRITE, `users/${user?.uid}`));
    } finally {
      setIsSubmittingOnboarding(false);
    }
  };

  const handleRegenerateTasks = async () => {
    if (!user || !profile || isRegeneratingTasks) {
      return;
    }

    try {
      setIsRegeneratingTasks(true);
      clearAppError();
      const nextTasks = await generateTasksFromProfile(profile);
      const refreshPlan = buildTaskRefreshPlan(
        tasks,
        nextTasks.map((task) => ({
          ...task,
          source: AI_RUNTIME.generatedTaskSource,
        })),
      );

      if (!refreshPlan.tasksToCreate.length && !refreshPlan.tasksToDelete.length) {
        return;
      }

      const batch = writeBatch(db);

      refreshPlan.tasksToCreate.forEach((task) => {
        const taskId = createId();
        batch.set(doc(db, 'users', user.uid, 'tasks', taskId), buildTaskWriteData(taskId, task));
      });

      refreshPlan.tasksToDelete.forEach((task) => {
        batch.delete(doc(db, 'users', user.uid, 'tasks', task.id));
      });

      await batch.commit();

      playSound('success');
    } catch (error) {
      setAppError(normalizeFirebaseError(error, OperationType.UPDATE, `users/${user.uid}/tasks`));
      throw error;
    } finally {
      setIsRegeneratingTasks(false);
    }
  };

  const handleUpdateProfile = async (updates: Partial<StoredUserProfile>) => {
    if (!user || !storedProfile || isUpdatingProfileRef.current) {
      return;
    }

    const sanitizedUpdates = sanitizeOwnerProfileUpdates(updates);
    if (!Object.keys(sanitizedUpdates).length) {
      return;
    }

    try {
      isUpdatingProfileRef.current = true;
      clearAppError();
      await updateDoc(doc(db, 'users', user.uid), sanitizedUpdates);
    } catch (error) {
      setAppError(normalizeFirebaseError(error, OperationType.UPDATE, `users/${user.uid}`));
    } finally {
      isUpdatingProfileRef.current = false;
    }
  };

  const handleAddTask = async (task: TaskDraft) => {
    if (!user) {
      return;
    }

    try {
      clearAppError();
      await createTaskForUser(user.uid, {
        ...task,
        source: task.source,
      });
    } catch (error) {
      setAppError(normalizeFirebaseError(error, OperationType.WRITE, `users/${user.uid}/tasks`));
      throw error;
    }
  };

  const handleToggleTask = async (id: string) => {
    if (!user || pendingTaskActionIdsRef.current.has(id)) {
      return;
    }

    const task = tasks.find((item) => item.id === id);
    if (!task) {
      return;
    }

    try {
      pendingTaskActionIdsRef.current.add(id);
      clearAppError();
      const taskRef = doc(db, 'users', user.uid, 'tasks', id);

      if (task.completed) {
        await updateDoc(taskRef, {
          completed: false,
        });
        return;
      }

      if (task.completedAt) {
        await updateDoc(taskRef, {
          completed: true,
        });
        return;
      }

      await updateDoc(taskRef, {
        completed: true,
        completedAt: serverTimestamp(),
      });
    } catch (error) {
      setAppError(normalizeFirebaseError(error, OperationType.UPDATE, `users/${user.uid}/tasks/${id}`));
    } finally {
      pendingTaskActionIdsRef.current.delete(id);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user || pendingTaskActionIdsRef.current.has(id)) {
      return;
    }

    try {
      pendingTaskActionIdsRef.current.add(id);
      clearAppError();
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
    } catch (error) {
      setAppError(normalizeFirebaseError(error, OperationType.DELETE, `users/${user.uid}/tasks/${id}`));
    } finally {
      pendingTaskActionIdsRef.current.delete(id);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      clearAppError();
      await auth.signOut();
    } catch (error) {
      setAppError(normalizeFirebaseError(error, OperationType.AUTH, 'auth/signout'));
      setIsLoggingOut(false);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1115]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw size={48} className="text-duo-blue" />
        </motion.div>
      </div>
    );
  }

  if (user && !isUserBootstrapReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f1115]">
        <div className="text-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
            <RefreshCw size={48} className="text-duo-blue mx-auto" />
          </motion.div>
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Hesap hazırlanıyor</p>
            <p className="text-slate-500 font-medium">Profilin ve görevlerin güvenli biçimde yükleniyor.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0f1115]">
      <AnimatePresence mode="wait">
        {!user ? (
          <div key="login" className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-[#0f1115] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-duo-blue/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-premium-gold/5 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full text-center space-y-8 relative z-10"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="w-40 h-40 bg-gradient-to-br from-duo-blue to-duo-blue-dark rounded-[3.5rem] flex items-center justify-center shadow-2xl mx-auto border-8 border-white dark:border-slate-800"
              >
                <SparklesIcon size={80} className="text-white drop-shadow-lg" />
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter gold-text">ASCEND</h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xl">
                  Potansiyelini serbest bırak. Gelişim yolculuğuna bugün başla.
                </p>
              </div>

              {appError && (
                <div className="rounded-[2rem] border border-red-200 bg-red-50 px-5 py-4 text-left text-sm text-red-700 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-black uppercase tracking-[0.15em] text-[10px]">{appError.title}</p>
                      <p className="font-medium">{appError.message}</p>
                    </div>
                    <button onClick={clearAppError} className="text-red-400 hover:text-red-600 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full duo-button bg-premium-slate text-white shadow-2xl py-6 text-xl font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-premium-black hover:scale-105 transition-all disabled:opacity-60 disabled:hover:scale-100"
              >
                {isLoggingIn ? <RefreshCw size={24} className="animate-spin" /> : <LogIn size={24} />} Google ile giriş yap
              </button>
            </motion.div>
          </div>
        ) : !profile ? (
          <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
            <header className="bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-700/50">
                  <Flame size={18} className={cn(profile.streak > 0 ? 'text-duo-orange' : 'text-slate-300')} fill="currentColor" />
                  <span className={cn('font-black text-sm', profile.streak > 0 ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300')}>
                    {profile.streak}
                  </span>
                </div>
                {profile.isPremium && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-premium-gold/10 rounded-full border border-premium-gold/20">
                    <Crown size={14} className="text-premium-gold" />
                    <span className="text-[10px] font-black text-premium-gold uppercase tracking-widest">Premium</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-duo-blue/5 dark:bg-duo-blue/10 rounded-full border border-duo-blue/20">
                  <Zap size={14} className="text-duo-blue" fill="currentColor" />
                  <span className="text-sm font-black text-duo-blue">{profile.experience}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-duo-yellow to-duo-orange flex items-center justify-center text-white font-black shadow-lg shadow-duo-yellow/20 text-sm">
                  {profile.level}
                </div>
              </div>
            </header>

            <main className="flex-1 pb-32 overflow-y-auto bg-white dark:bg-[#0f1115]">
              <div className="max-w-2xl mx-auto p-6 space-y-10">
                {appError && (
                  <div className="rounded-[2rem] border border-red-200 bg-red-50 px-5 py-4 text-red-700 shadow-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="font-black uppercase tracking-[0.15em] text-[10px]">{appError.title}</p>
                        <p className="font-medium">{appError.message}</p>
                      </div>
                      <button onClick={clearAppError} className="text-red-400 hover:text-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                {(AI_RUNTIME.usesPreviewFallback || hasPreviewTasks) && (
                  <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 shadow-lg">
                    <p className="font-black uppercase tracking-[0.15em] text-[10px]">Önizleme Modu</p>
                    <p className="font-medium">
                      Güvenli AI sunucusu bu yapıda bağlı değil. Koçluk ve planlama yerel önizleme mantığıyla çalışır; önizleme görevleri doğrulanmış ilerleme üretmez.
                    </p>
                  </div>
                )}

                {activeTab === 'home' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                        {new Date().getHours() < 12 ? 'Günaydın' : new Date().getHours() < 18 ? 'Tünaydın' : 'İyi akşamlar'},{' '}
                        <span className="gold-text">{profile.name}</span>!
                      </h2>
                      <p className="text-slate-400 dark:text-slate-500 font-bold text-lg">
                        Bugün kendini biraz daha ileri taşımaya hazır mısın?
                      </p>
                    </div>

                    <TaskManager
                      tasks={tasks}
                      onAddTask={handleAddTask}
                      onToggleTask={handleToggleTask}
                      onDeleteTask={handleDeleteTask}
                      onRegenerateTasks={handleRegenerateTasks}
                      analysis={profile.analysis}
                    />
                  </motion.div>
                )}

                {activeTab === 'coach' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                    <Coach profile={profile} tasks={tasks} />
                    <DecisionTool profile={profile} />
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <EvolutionPanel profile={profile} tasks={tasks} />

                    <div className="grid grid-cols-2 gap-6">
                      <div className="duo-card flex flex-col items-center text-center p-10 bg-white dark:bg-slate-900/40 border-none shadow-xl">
                        <div className="w-20 h-20 rounded-[2rem] bg-duo-green/10 flex items-center justify-center text-duo-green mb-6 shadow-inner">
                          <TrendingUp size={40} />
                        </div>
                        <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{tasks.length}</span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Toplam görev</span>
                      </div>
                      <div className="duo-card flex flex-col items-center text-center p-10 bg-white dark:bg-slate-900/40 border-none shadow-xl">
                        <div className="w-20 h-20 rounded-[2rem] bg-duo-yellow/10 flex items-center justify-center text-duo-yellow mb-6 shadow-inner">
                          <Award size={40} />
                        </div>
                        <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{profile.badges.length}</span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Rozet</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                    <div className="duo-card text-center space-y-6 py-16 bg-white dark:bg-slate-900/40 border-none shadow-2xl relative overflow-hidden group">
                      {profile.isPremium && (
                        <div className="absolute top-0 right-0 p-8 text-premium-gold opacity-5 group-hover:opacity-10 transition-opacity">
                          <Crown size={160} />
                        </div>
                      )}
                      <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] mx-auto flex items-center justify-center text-slate-400 border-4 border-white dark:border-slate-800 shadow-2xl relative group-hover:scale-105 transition-transform duration-500">
                        <UserIcon size={64} />
                        {profile.isPremium && (
                          <div className="absolute -top-4 -right-4 bg-gradient-to-br from-premium-gold to-yellow-600 p-3 rounded-2xl shadow-2xl border-4 border-white dark:border-slate-900 animate-bounce">
                            <Crown size={24} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 relative z-10">
                        <div className="flex items-center justify-center gap-3">
                          <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{profile.name}</h3>
                          {profile.isPremium && (
                            <div className="px-3 py-1 bg-premium-gold/10 text-premium-gold text-[10px] font-black uppercase tracking-[0.2em] border border-premium-gold/20 rounded-full">
                              Premium
                            </div>
                          )}
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Seviye {profile.level} gelişimci</p>
                      </div>
                      <div className="flex flex-col items-center gap-4 pt-6 relative z-10">
                        {!profile.isPremium && (
                          <div className="w-full max-w-xs rounded-[2rem] border border-premium-gold/20 bg-premium-gold/10 px-5 py-4 text-sm text-premium-gold">
                            Premium yükseltmesi artık sadece güvenli sunucu aktivasyonu ile açılıyor.
                          </div>
                        )}
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="text-slate-400 hover:text-duo-red transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-60"
                        >
                          {isLoggingOut ? <RefreshCw size={14} className="animate-spin" /> : <LogOut size={14} />} Oturumu kapat
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Başarıların</h4>
                        <span className="text-[10px] font-black text-premium-gold uppercase tracking-widest">{profile.badges.length} rozet</span>
                      </div>
                      <BadgeList badges={profile.badges} />
                    </div>

                    <div className="duo-card space-y-6 p-8 bg-white dark:bg-slate-900/40 border-none shadow-xl">
                      <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] text-left">Ayarlar</h4>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                              {profile.theme === 'dark' ? <Moon className="text-duo-blue" size={20} /> : <Sun className="text-duo-yellow" size={20} />}
                            </div>
                            <span className="font-black text-slate-700 dark:text-slate-200">Karanlık mod</span>
                          </div>
                          <button
                            onClick={() => handleUpdateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' })}
                            className={cn(
                              'w-14 h-8 rounded-full p-1 transition-colors duration-500',
                              profile.theme === 'dark' ? 'bg-duo-blue' : 'bg-slate-200 dark:bg-slate-700',
                            )}
                          >
                            <div
                              className={cn(
                                'w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500',
                                profile.theme === 'dark' ? 'translate-x-6' : 'translate-x-0',
                              )}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                              <Bell className={cn(profile.notificationsEnabled ? 'text-duo-blue' : 'text-slate-400')} size={20} />
                            </div>
                            <span className="font-black text-slate-700 dark:text-slate-200">Bildirimler</span>
                          </div>
                          <button
                            onClick={() => handleUpdateProfile({ notificationsEnabled: !profile.notificationsEnabled })}
                            className={cn(
                              'w-14 h-8 rounded-full p-1 transition-colors duration-500',
                              profile.notificationsEnabled ? 'bg-duo-blue' : 'bg-slate-200 dark:bg-slate-700',
                            )}
                          >
                            <div
                              className={cn(
                                'w-6 h-6 bg-white rounded-full shadow-lg transition-transform duration-500',
                                profile.notificationsEnabled ? 'translate-x-6' : 'translate-x-0',
                              )}
                            />
                          </button>
                        </div>

                        {profile.notificationsEnabled && (
                          <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                <Clock className="text-duo-blue" size={20} />
                              </div>
                              <span className="font-black text-slate-700 dark:text-slate-200">Hatırlatıcı saati</span>
                            </div>
                            <input
                              type="time"
                              value={profile.reminderTime || '09:00'}
                              onChange={(event) => handleUpdateProfile({ reminderTime: event.target.value })}
                              className="bg-transparent border-none font-black text-duo-blue outline-none cursor-pointer text-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0f1115]/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800/50 px-6 py-4 z-50 safe-area-bottom">
              <div className="max-w-md mx-auto flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('home')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 transition-all duration-300',
                    activeTab === 'home' ? 'text-duo-blue scale-110' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400',
                  )}
                >
                  <Home size={24} fill={activeTab === 'home' ? 'currentColor' : 'none'} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Bugün</span>
                </button>

                <button
                  onClick={() => setActiveTab('stats')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 transition-all duration-300',
                    activeTab === 'stats' ? 'text-duo-orange scale-110' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400',
                  )}
                >
                  <BarChart3 size={24} fill={activeTab === 'stats' ? 'currentColor' : 'none'} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Evrim</span>
                </button>

                <button
                  onClick={() => setActiveTab('coach')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 transition-all duration-300',
                    activeTab === 'coach' ? 'text-duo-blue scale-110' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400',
                  )}
                >
                  <MessageCircle size={24} fill={activeTab === 'coach' ? 'currentColor' : 'none'} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Rehber</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    'flex flex-col items-center gap-1.5 transition-all duration-300',
                    activeTab === 'profile' ? 'text-duo-yellow scale-110' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400',
                  )}
                >
                  <UserIcon size={24} fill={activeTab === 'profile' ? 'currentColor' : 'none'} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Profil</span>
                </button>
              </div>
            </nav>

            <LevelUpModal level={profile.level} isOpen={showLevelUp} onClose={() => setShowLevelUp(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
