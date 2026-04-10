import React from 'react';
import { motion } from 'motion/react';
import { Lock, CheckCircle2, CircleDashed, Map, ClipboardCheck } from 'lucide-react';
import { DailyTask, UserProfile } from '../types';
import { getJourneySummary } from '../lib/journey';
import { cn } from '../lib/utils';
import { formatUiText } from '../lib/textFormat';

interface JourneyPanelProps {
  profile: UserProfile;
  tasks: DailyTask[];
}

const adaptationLabels: Record<DailyTask['adaptationMode'], string> = {
  support: 'Daha kolay',
  standard: 'Dengeli',
  stretch: 'İleri',
  legacy: 'Standart',
};

const routeLabels = {
  support: 'Destek rotası',
  standard: 'Dengeli rota',
  stretch: 'İleri rota',
} as const;

export default function JourneyPanel({ profile, tasks }: JourneyPanelProps) {
  const summary = getJourneySummary(profile, tasks);

  return (
    <div className="glass p-6 rounded-3xl space-y-5">
      <div className="flex items-center gap-2">
        <Map className="text-brand-500" size={20} />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Gelişim yolu</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">Tamamlanan</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{summary.completed}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">Açık</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{summary.available}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">Toplam</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{summary.total}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Durum</p>
        <p className="mt-1 text-sm text-brand-900">
          {summary.currentUnitTitle
            ? `Şu an ${formatUiText(summary.currentUnitTitle)} aşamasındasın.`
            : 'Bu yol için bugün aktif bir aşama bulunamadı.'}
        </p>
        <p className="mt-2 text-xs text-brand-700">
          {summary.pendingCheckpointCount > 0
            ? `${summary.pendingCheckpointCount} kontrol adımı bekliyor.`
            : summary.nextUnlockLevel && summary.nextUnitTitle
            ? `${formatUiText(summary.nextUnitTitle)}, seviye ${summary.nextUnlockLevel} civarında açılacak.`
            : 'Bu yol için şu an tüm aşamalar açık.'}
        </p>
      </div>

      {summary.premiumRoute && (
        <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-brand-200">Premium rota</p>
          <p className="text-sm font-semibold">{routeLabels[summary.premiumRoute.direction]}</p>
          <p className="text-xs text-slate-300">{formatUiText(summary.premiumRoute.focusTitle)}</p>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-emerald-200">
              {formatUiText(summary.premiumRoute.signalLabel)}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-200">{formatUiText(summary.premiumRoute.nextMove)}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {summary.units.map((unit, index) => (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={cn(
              'rounded-2xl border p-4 space-y-3',
              unit.state === 'completed'
                ? 'bg-green-50 border-green-100'
                : unit.state === 'review_ready'
                  ? 'bg-amber-50 border-amber-100'
                  : unit.state === 'in_progress'
                  ? 'bg-white border-slate-100'
                  : 'bg-slate-50 border-slate-100 opacity-70',
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {unit.state === 'completed' ? (
                  <CheckCircle2 size={18} className="text-green-600" />
                ) : unit.state === 'review_ready' ? (
                  <ClipboardCheck size={18} className="text-amber-600" />
                ) : unit.state === 'in_progress' ? (
                  <CircleDashed size={18} className="text-brand-500" />
                ) : (
                  <Lock size={18} className="text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">Aşama {unit.order}</p>
                      <h4 className="text-sm font-bold text-slate-900">{formatUiText(unit.title)}</h4>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-400">
                        {unit.completedLessons}/{unit.totalLessons}
                      </span>
                      {unit.recentAdaptationMode !== 'legacy' && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-700">
                          {adaptationLabels[unit.recentAdaptationMode]}
                        </span>
                      )}
                  </div>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {unit.state === 'completed'
                    ? 'Bu aşama tamamlandı. İstersen dersleri tekrar gözden geçirebilirsin.'
                    : unit.state === 'review_ready'
                      ? 'Tüm dersler bitti. Şimdi kısa bir kontrol adımı ile öğrendiklerini sabitle.'
                      : unit.state === 'in_progress'
                        ? 'Bu aşamanın dersleri açık. Sıradaki görev bu bölümden geliyor.'
                        : 'Bu aşama daha sonra açılacak.'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {unit.lessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-2xl bg-white/80 border border-white/80 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <h5 className="text-sm font-semibold text-slate-900">{formatUiText(lesson.title)}</h5>
                    <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-400">
                      +{lesson.rewardXp} xp
                    </span>
                  </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{formatUiText(lesson.teaching)}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-400">
                    {lesson.state === 'completed'
                      ? 'Tamamlandı'
                      : lesson.state === 'available'
                        ? 'Hazır'
                        : 'Kilitli'}
                  </p>
                </div>
              ))}
              </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
