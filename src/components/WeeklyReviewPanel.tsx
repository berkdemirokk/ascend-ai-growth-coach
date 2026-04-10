import React from 'react';
import { LineChart, Sparkles } from 'lucide-react';
import { DailyTask, UserProfile, WeeklyPlanSnapshot } from '../types';
import { getWeeklyReviewSummary } from '../lib/weeklyReview';
import { getAdaptivePlanSummary } from '../lib/adaptivePlan';
import { getWeeklyPlanPreview } from '../lib/weeklyPlan';

interface WeeklyReviewPanelProps {
  profile: UserProfile;
  tasks: DailyTask[];
  weeklyPlanSnapshot: WeeklyPlanSnapshot | null;
}

export default function WeeklyReviewPanel({ profile, tasks, weeklyPlanSnapshot }: WeeklyReviewPanelProps) {
  const review = getWeeklyReviewSummary(profile, tasks);
  const adaptivePlan = getAdaptivePlanSummary(profile, tasks);
  const weeklyPlan = weeklyPlanSnapshot ?? getWeeklyPlanPreview(profile, tasks);

  return (
    <div className="glass p-6 rounded-3xl space-y-4">
      <div className="flex items-center gap-2">
        <LineChart size={18} className="text-brand-500" />
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Haftalık değerlendirme</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">Görev</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{review.completedThisWeek}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">Aktif gün</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{review.consistencyDays}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-brand-600">Momentum</p>
        <p className="mt-1 text-sm font-semibold text-brand-900 capitalize">{review.momentum}</p>
        <p className="mt-1 text-xs text-brand-800">{review.memorySummary}</p>
      </div>

      <div className="space-y-2">
        {review.insights.map((insight) => (
          <div key={insight} className="rounded-2xl bg-white border border-slate-100 p-3 text-sm text-slate-700">
            {insight}
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">Adaptif plan</p>
        <p className="text-sm font-semibold text-slate-900">{adaptivePlan.focusTitle}</p>
        <p className="text-xs leading-relaxed text-slate-600">{adaptivePlan.focusReason}</p>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-brand-500">{adaptivePlan.signalLabel}</p>
          <p className="mt-1 text-xs text-slate-700">{adaptivePlan.nextMove}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 p-4 space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-400">7 günlük premium plan</p>
          <p className="text-sm font-semibold text-slate-900">{weeklyPlan.title}</p>
          <p className="text-xs leading-relaxed text-slate-600">{weeklyPlan.summary}</p>
          {weeklyPlanSnapshot ? (
            <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-emerald-600">
              Bu hafta kaydedilen rota aktif
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          {weeklyPlan.days.map((dayPlan) => (
            <div key={dayPlan.day} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Gün {dayPlan.day}</p>
                <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-400">{dayPlan.title}</p>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-800">{dayPlan.focus}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{dayPlan.checkpoint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900 text-white p-4 flex items-start gap-3">
        <Sparkles size={16} className="shrink-0 mt-0.5 text-brand-200" />
        <p className="text-xs leading-relaxed text-slate-200">
          Premium değerlendirme; haftalık desenleri, koç hafızasını ve adaptif plan yönünü birlikte yorumlar.
        </p>
      </div>
    </div>
  );
}
