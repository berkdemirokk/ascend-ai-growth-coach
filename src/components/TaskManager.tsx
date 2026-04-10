import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { DailyTask } from '../types';
import { MissionPreview } from '../lib/missionEngine';
import { formatUiText } from '../lib/textFormat';

interface TaskManagerProps {
  tasks: DailyTask[];
  activeTask: DailyTask | null;
  onToggleTask: (id: string) => void;
  onSaveReflection: (id: string, reflection: string) => void;
  tomorrowPreview: MissionPreview | null;
  upcomingPreview: MissionPreview[];
}

const adaptationLabels: Record<DailyTask['adaptationMode'], string> = {
  support: 'Daha kolay',
  standard: 'Dengeli',
  stretch: 'İleri',
  legacy: 'Standart',
};

const planFocusLabels: Record<Exclude<DailyTask['planFocus'], 'legacy'>, string> = {
  support: 'Destek rotası',
  standard: 'Dengeli rota',
  stretch: 'İleri rota',
};

export default function TaskManager({
  tasks,
  activeTask,
  onToggleTask,
  onSaveReflection,
  tomorrowPreview,
  upcomingPreview,
}: TaskManagerProps) {
  const [reflectionDraft, setReflectionDraft] = useState('');
  const [showEasyFallback, setShowEasyFallback] = useState(false);

  const completedMissionCount = useMemo(
    () => tasks.filter((task) => task.source === 'curriculum' && task.completed).length,
    [tasks],
  );

  if (!activeTask) {
    return (
      <div className="glass p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Bugünün görevi</h3>
        <p className="text-sm text-slate-500">Bugün için görev hazırlanıyor. Kısa süre sonra tekrar kontrol et.</p>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="text-brand-500" size={20} />
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Bugünün görevi</h3>
        </div>
        <span className="text-xs font-semibold text-brand-600">{completedMissionCount} görev tamamlandı</span>
      </div>

      <div className="space-y-4 rounded-3xl bg-white p-5 border border-slate-100 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">Günlük görev</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {formatUiText(activeTask.unitTitle)}
              </span>
              {activeTask.missionKind === 'checkpoint' && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700">
                  Checkpoint
                </span>
              )}
              {activeTask.adaptationMode !== 'legacy' && (
                <span className="rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
                  {adaptationLabels[activeTask.adaptationMode]}
                </span>
              )}
            </div>
            <h4 className="text-xl font-bold text-slate-900">{formatUiText(activeTask.title)}</h4>
          </div>
          <button
            onClick={() => onToggleTask(activeTask.id)}
            className={activeTask.completed ? 'text-green-500' : 'text-slate-300 hover:text-brand-500 transition-colors'}
            title={activeTask.completed ? 'Gorevi geri al' : 'Gorevi tamamla'}
          >
            {activeTask.completed ? <CheckCircle2 size={26} /> : <Circle size={26} />}
          </button>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Neden önemli?</p>
          <p className="text-sm leading-relaxed text-slate-700">{formatUiText(activeTask.teaching)}</p>
        </div>

        <div className="rounded-2xl bg-brand-50 p-4 space-y-2 border border-brand-100">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Kısa ipucu</p>
          <p className="text-sm leading-relaxed text-brand-900">{formatUiText(activeTask.description)}</p>
        </div>

        {!activeTask.completed && showEasyFallback && (
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Bugün zor geliyorsa</p>
            <p className="text-sm leading-relaxed text-amber-900">
              Görevi iki parçaya böl: şimdi 10 dakika başla, kalan kısmı gün içinde tamamla. Amaç mükemmel yapmak değil, ritmi korumak.
            </p>
          </div>
        )}

        {!activeTask.completed ? (
          <div className="space-y-2">
            <button
              onClick={() => onToggleTask(activeTask.id)}
              className="w-full py-4 bg-brand-600 text-white rounded-2xl font-semibold text-sm hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              Görevi tamamladım <Sparkles size={16} />
            </button>
            <button
              onClick={() => setShowEasyFallback((current) => !current)}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-2xl font-semibold text-sm hover:bg-slate-200 transition-colors"
            >
              {showEasyFallback ? 'Kolaylaştırılmış öneriyi gizle' : 'Bugün zor geliyor'}
            </button>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
              <p className="text-sm font-medium text-green-800">Bugünün görevini tamamladın. Şimdi kısa bir kapanış yap.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Yansıtma</p>
              <p className="text-sm text-slate-600">{formatUiText(activeTask.reflectionPrompt)}</p>
              <textarea
                value={activeTask.reflection ?? reflectionDraft}
                onChange={(event) => {
                    if (activeTask.reflection) return;
                    setReflectionDraft(event.target.value);
                  }}
                placeholder="Bugün kendinle ilgili ne fark ettin?"
                className="w-full min-h-28 resize-none px-4 py-3 rounded-2xl border border-slate-200 bg-white outline-none focus:border-brand-300 text-sm"
                disabled={Boolean(activeTask.reflection)}
              />
              {!activeTask.reflection && (
                <button
                  onClick={() => {
                    onSaveReflection(activeTask.id, reflectionDraft.trim());
                    setReflectionDraft('');
                  }}
                  disabled={!reflectionDraft.trim()}
                  className="w-full py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold disabled:opacity-50"
                >
                  Yansıtmayı kaydet
                </button>
              )}
            </div>
            {activeTask.reflection && tomorrowPreview && (
              <div className="rounded-2xl bg-slate-900 text-white p-4 space-y-2">
                <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-300">Yarın açılacak</p>
                <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-brand-200">{formatUiText(tomorrowPreview.unitTitle)}</p>
                {tomorrowPreview.missionKind === 'checkpoint' && (
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-amber-200">Kontrol adımı</p>
                )}
                {tomorrowPreview.adaptationMode !== 'legacy' && (
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-brand-200">
                    {adaptationLabels[tomorrowPreview.adaptationMode]}
                  </p>
                )}
                {tomorrowPreview.planFocus !== 'legacy' && !tomorrowPreview.lockedDetails && (
                  <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-emerald-200">
                    {planFocusLabels[tomorrowPreview.planFocus]}
                  </p>
                )}
                <p className="text-sm font-semibold">{formatUiText(tomorrowPreview.title)}</p>
                {tomorrowPreview.lockedDetails ? (
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Premium plan açıldığında yarının görev tonu ve neden seçildiği görünür.
                  </p>
                ) : (
                  <>
                    <p className="text-xs text-slate-300 leading-relaxed">{formatUiText(tomorrowPreview.teaching)}</p>
                    {upcomingPreview.length > 1 && (
                      <div className="mt-3 space-y-2 rounded-xl bg-white/5 p-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-slate-300">
                          Sonraki görevler
                        </p>
                        {upcomingPreview.map((preview, index) => (
                          <div key={`${preview.dayKey}-${preview.title}`} className="rounded-lg bg-white/5 p-2">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-brand-200">
                                {index === 0 ? 'Yarın' : `+${index} gün`}
                              </p>
                              <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-emerald-200">
                                {preview.planFocus !== 'legacy' ? planFocusLabels[preview.planFocus] : 'Dengeli rota'}
                              </p>
                            </div>
                            <p className="mt-1 text-xs font-medium text-white">{formatUiText(preview.title)}</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{formatUiText(preview.teaching)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
