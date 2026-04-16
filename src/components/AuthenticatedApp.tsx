import React, { Suspense, lazy, useMemo, useState } from 'react';
import { BarChart3, Home, Lock, LogOut, User as UserIcon, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MissionPreview } from '../lib/missionEngine';
import { getPlanTierLabel, isPremiumProfile } from '../lib/premium';
import { DailyTask, SessionSyncState, UserProfile, WeeklyPlanSnapshot } from '../types';
import DeferredSection from './DeferredSection';
import { getPathLabel } from '../lib/productCopy';
import { cn } from '../lib/utils';

const Coach = lazy(() => import('./Coach'));
const JourneyPanel = lazy(() => import('./JourneyPanel'));
const TaskManager = lazy(() => import('./TaskManager'));
const WeeklyReviewPanel = lazy(() => import('./WeeklyReviewPanel'));
const AccountPanel = lazy(() => import('./AccountPanel'));

interface AuthenticatedAppProps {
  profile: UserProfile;
  tasks: DailyTask[];
  activeTask: DailyTask | null;
  missionStats: {
    totalMissions: number;
    completedMissions: number;
    completionRate: number;
    completedCheckpoints: number;
  };
  tomorrowPreview: MissionPreview | null;
  upcomingPreview: MissionPreview[];
  weeklyPlanSnapshot: WeeklyPlanSnapshot | null;
  onToggleTask: (id: string) => void;
  onSaveReflection: (id: string, reflection: string) => void;
  accountEmail: string | null;
  onClaimAccount: (email: string, password: string) => Promise<string | null>;
  onDeleteAccount: () => Promise<string | null>;
  accountDeletionLoading: boolean;
  syncState: SessionSyncState;
  syncMessage: string | null;
  lastSyncedAt: number | null;
  onRetrySync: () => void;
  billingAvailable: boolean;
  billingLoading: boolean;
  billingMessage: string | null;
  billingPackagePrice: string | null;
  onPurchasePremium: () => void;
  onRestorePurchases: () => void;
  onLogout: () => void;
}

const PanelFallback = ({ label }: { label: string }) => (
  <div className="glass rounded-3xl p-6 text-sm text-slate-500">{label} hazırlanıyor...</div>
);

type ActiveTab = 'today' | 'progress' | 'profile';

export default function AuthenticatedApp({
  profile,
  tasks,
  activeTask,
  missionStats,
  tomorrowPreview,
  upcomingPreview,
  weeklyPlanSnapshot,
  onToggleTask,
  onSaveReflection,
  accountEmail,
  onClaimAccount,
  onDeleteAccount,
  accountDeletionLoading,
  syncState,
  syncMessage,
  lastSyncedAt,
  onRetrySync,
  billingAvailable,
  billingLoading,
  billingMessage,
  billingPackagePrice,
  onPurchasePremium,
  onRestorePurchases,
  onLogout,
}: AuthenticatedAppProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('today');
  const [showCoach, setShowCoach] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const premium = isPremiumProfile(profile);

  const progressSummary = useMemo(() => {
    const completedCurriculumTasks = tasks.filter((task) => task.source === 'curriculum' && task.completed);
    const activeDays = new Set(completedCurriculumTasks.map((task) => task.dayKey)).size;
    const nextLevelXp = Math.max(0, 100 - profile.experience);

    return {
      activeDays,
      completedTasks: missionStats.completedMissions,
      streak: profile.streak,
      developmentArea: getPathLabel(profile.selectedPath),
      nextStage: `Seviye ${profile.level + 1} için ${nextLevelXp} XP`,
    };
  }, [missionStats.completedMissions, profile.experience, profile.level, profile.selectedPath, profile.streak, tasks]);

  return (
    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Zap size={17} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">Ascend</h1>
              <p className="text-[11px] text-slate-500">Günlük kişisel gelişim sistemin</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">Plan</p>
              <p className="text-xs font-semibold text-slate-700">{getPlanTierLabel(profile.planTier)}</p>
            </div>
            <div className="rounded-xl bg-brand-50 border border-brand-100 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.16em] text-brand-500 font-semibold">Seviye</p>
              <p className="text-xs font-semibold text-brand-800">{profile.level} · %{profile.experience}</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 md:p-8 pb-28">
        <div className="mx-auto max-w-6xl">
          {activeTab === 'today' && (
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 sm:p-7 space-y-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-brand-500 font-semibold">Bugün</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Bugünün tek odağı: görevi tamamlamak</h2>
                <p className="text-sm text-slate-600 max-w-3xl">
                  Her gün tek bir ana görevle ilerlersin. Görevi tamamla, kısa yansıtmanı yaz, yarına net geç.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">Odak: {getPathLabel(profile.selectedPath)}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">Seri: {profile.streak} gün</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">Tamamlanan görev: {missionStats.completedMissions}</span>
                </div>
              </div>

              <Suspense fallback={<PanelFallback label="Bugünün görevi" />}>
                <TaskManager
                  tasks={tasks}
                  activeTask={activeTask}
                  onToggleTask={onToggleTask}
                  onSaveReflection={onSaveReflection}
                  tomorrowPreview={tomorrowPreview}
                  upcomingPreview={upcomingPreview}
                />
              </Suspense>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">Destek</p>
                    <h3 className="text-lg font-semibold text-slate-900">Göreve bağlı koç desteği</h3>
                  </div>
                  <button onClick={() => setShowCoach((current) => !current)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    {showCoach ? 'Koçu gizle' : 'Koçu aç'}
                  </button>
                </div>
                <AnimatePresence initial={false}>
                  {showCoach ? (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      <DeferredSection fallback={<PanelFallback label="Koç" />} minHeightClassName="min-h-[18rem]">
                        <Suspense fallback={<PanelFallback label="Koç" />}>
                          <Coach profile={profile} activeTask={activeTask} tasks={tasks} />
                        </Suspense>
                      </DeferredSection>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-brand-500 font-semibold">İlerleme</p>
                  <h2 className="text-2xl font-bold text-slate-900">Gerçek ilerleme görünümü</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[11px] text-slate-500">Aktif gün</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{progressSummary.activeDays}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[11px] text-slate-500">Tamamlanan görev</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{progressSummary.completedTasks}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[11px] text-slate-500">Mevcut seri</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{progressSummary.streak} gün</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[11px] text-slate-500">Gelişim alanı</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{progressSummary.developmentArea}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <p className="text-[11px] text-slate-500">Sıradaki aşama</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">{progressSummary.nextStage}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="px-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">Yolculuk</p>
                  <h3 className="text-lg font-semibold text-slate-900">Gelişim yolu</h3>
                </div>
                <DeferredSection fallback={<PanelFallback label="Gelişim yolu" />}>
                  <Suspense fallback={<PanelFallback label="Gelişim yolu" />}>
                    <JourneyPanel profile={profile} tasks={tasks} />
                  </Suspense>
                </DeferredSection>
              </div>

              <div className="space-y-3">
                <div className="px-1">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">Haftalık değerlendirme</p>
                  <h3 className="text-lg font-semibold text-slate-900">Plan kalitesi</h3>
                </div>
                {premium ? (
                  <DeferredSection fallback={<PanelFallback label="Haftalık değerlendirme" />}>
                    <Suspense fallback={<PanelFallback label="Haftalık değerlendirme" />}>
                      <WeeklyReviewPanel profile={profile} tasks={tasks} weeklyPlanSnapshot={weeklyPlanSnapshot} />
                    </Suspense>
                  </DeferredSection>
                ) : (
                  <div className="glass rounded-3xl p-6 space-y-3">
                    <p className="text-sm text-slate-700">
                      Premium plan ile haftalık değerlendirme, adaptif rota önerisi ve bir sonraki aşama görünümü açılır.
                    </p>
                    <button onClick={() => setShowPlanModal(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                      <Lock size={14} /> Premium durumu
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="glass rounded-3xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">Profil</p>
                    <h2 className="text-2xl font-bold text-slate-900">{profile.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">Odak alanı: {getPathLabel(profile.selectedPath)}</p>
                  </div>
                  <button onClick={onLogout} className="rounded-xl p-2 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Çıkış yap">
                    <LogOut size={18} />
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Plan durumu</p>
                      <p className="text-xs text-slate-500">
                        {premium ? 'Premium plan aktif. Kişisel rota ve haftalık değerlendirme açık.' : 'Temel plan aktif. Günlük görev akışı açık.'}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold text-brand-700">{getPlanTierLabel(profile.planTier)}</span>
                  </div>
                  <button onClick={() => setShowPlanModal(true)} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                    {premium ? 'Premium durumu' : 'Premium durumu'}
                  </button>
                </div>
              </div>

              <Suspense fallback={<PanelFallback label="Hesap paneli" />}>
                <AccountPanel
                  accountEmail={accountEmail}
                  onClaimAccount={onClaimAccount}
                  onDeleteAccount={onDeleteAccount}
                  accountDeletionLoading={accountDeletionLoading}
                  syncState={syncState}
                  syncMessage={syncMessage}
                  lastSyncedAt={lastSyncedAt}
                  onRetrySync={onRetrySync}
                />
              </Suspense>

            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-100 bg-white/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-md grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition-colors',
              activeTab === 'today' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50',
            )}
          >
            <Home size={16} /> Bugün
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition-colors',
              activeTab === 'progress' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50',
            )}
          >
            <BarChart3 size={16} /> İlerleme
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition-colors',
              activeTab === 'profile' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50',
            )}
          >
            <UserIcon size={16} /> Profil
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showPlanModal && (
          <motion.div className="fixed inset-0 z-[120] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-slate-900/50" onClick={() => setShowPlanModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-brand-500 font-semibold">Plan</p>
                  <h3 className="text-2xl font-bold text-slate-900">Premium durumu</h3>
                </div>
                <button onClick={() => setShowPlanModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                {premium
                  ? 'Premium plan aktif. Adaptif rota, haftalık değerlendirme ve daha derin koç bağlamı açık.'
                  : 'Premium planı açmak için App Store satın alma akışını kullan.'}
              </div>

              {!premium ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-xs text-slate-600">
                  {billingAvailable ? (
                    <>
                      <button
                        onClick={onPurchasePremium}
                        disabled={billingLoading}
                        className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {billingLoading
                          ? 'İşlem sürüyor...'
                          : billingPackagePrice
                            ? `Premium satın al (${billingPackagePrice})`
                            : 'Premium satın al'}
                      </button>
                      <button
                        onClick={onRestorePurchases}
                        disabled={billingLoading}
                        className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                      >
                        Satın alımları geri yükle
                      </button>
                    </>
                  ) : (
                    <p>{billingMessage ?? 'Satın alma bu cihazda kullanılamıyor.'}</p>
                  )}
                  <p>Satın alma iptal edilirse: İşlem iptal edildi, plan değişmedi.</p>
                  <p>Satın alma beklemedeyse: Onay bekleniyor, premium henüz açılmadı.</p>
                  <p>Satın alma başarısızsa: Kısa süre sonra tekrar dene.</p>
                  {billingMessage ? <p className="text-brand-700">{billingMessage}</p> : null}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 text-xs text-slate-600">
                  <p>Premium aktif. Satın alma ve yenileme yönetimi App Store hesap ayarlarından yapılır.</p>
                  <button
                    onClick={onRestorePurchases}
                    disabled={billingLoading}
                    className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
                  >
                    Satın alımları geri yükle
                  </button>
                  {billingMessage ? <p className="text-brand-700">{billingMessage}</p> : null}
                </div>
              )}

              <button onClick={() => setShowPlanModal(false)} className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600">
                Kapat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
