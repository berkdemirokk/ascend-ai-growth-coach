import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle2, Circle, Clock, Plus, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { DailyTask, TaskDraft } from '../types';
import { cn } from '../lib/utils';
import { playSound } from '../lib/sounds';
import { parseTask } from '../services/aiService';
import { AI_RUNTIME } from '../lib/runtime';

interface TaskManagerProps {
  tasks: DailyTask[];
  onAddTask: (task: TaskDraft) => Promise<void>;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onRegenerateTasks: () => Promise<void>;
  analysis?: string;
}

export default function TaskManager({ tasks, onAddTask, onToggleTask, onDeleteTask, onRegenerateTasks, analysis }: TaskManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const progress = useMemo(() => {
    if (tasks.length === 0) {
      return 0;
    }

    const completed = tasks.filter((task) => task.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const handleAdd = async () => {
    if (!newTaskTitle.trim() || isSubmittingTask) {
      return;
    }

    try {
      setIsSubmittingTask(true);
      setLocalError(null);
      playSound('pop');
      await onAddTask({
        title: newTaskTitle.trim(),
        description: '',
        category: 'general',
        priority: 'medium',
        source: 'custom',
      });
      setNewTaskTitle('');
      setIsAdding(false);
      setIsSubmittingTask(false);
    } catch (error) {
      console.error('Task add error:', error);
      setIsSubmittingTask(false);
      setLocalError('Görev eklenemedi. Lütfen tekrar dene.');
    }
  };

  const handleMagicAdd = async () => {
    if (!newTaskTitle.trim() || isSubmittingTask || isParsing) {
      return;
    }

    setIsSubmittingTask(true);
    setIsParsing(true);
    setLocalError(null);

    try {
      const parsed = await parseTask(newTaskTitle);
      await onAddTask({
        title: parsed.title || newTaskTitle.trim(),
        description: '',
        category: parsed.category || 'general',
        priority: parsed.priority || 'medium',
        reminderTime: parsed.reminderTime || undefined,
        source: 'custom',
      });
      setNewTaskTitle('');
      setIsAdding(false);
      setIsSubmittingTask(false);
      playSound('success');
    } catch (error) {
      console.error('Magic add error:', error);
      setIsSubmittingTask(false);
      setLocalError('Akıllı görev oluşturulamadı. İstersen görevi normal şekilde ekleyebilirsin.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleToggle = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (task && !task.completed) {
      playSound('success');
    } else {
      playSound('click');
    }
    onToggleTask(id);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setLocalError(null);

    try {
      await onRegenerateTasks();
    } catch (error) {
      console.error('Task refresh error:', error);
      setLocalError('Yeni plan hazırlanamadı. Mevcut görevlerin korunuyor.');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-24">
      <header className="text-center space-y-4 pt-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-premium-gold/10 border border-premium-gold/20 text-premium-gold">
          <Sparkles size={14} className="fill-current" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Bugünkü odak noktan</span>
        </motion.div>

        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Günü <span className="text-duo-blue">bilinçli ilerleme</span> ile aç
        </h1>

        <p className="text-xs font-bold text-slate-400">Tamamlanan her net görev, sistemine yeni bir güven katıyor.</p>
      </header>

      <div className="relative flex justify-center py-4">
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform">
            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-800" />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 88}
              initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 88) * (1 - progress / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="text-duo-green"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">%{progress}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tamamlandı</span>
          </div>
        </div>
      </div>

      {localError && <div className="rounded-[2rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{localError}</div>}

      {AI_RUNTIME.usesPreviewFallback && (
        <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Bu build güvenli AI planlayıcıya bağlı değil. Plan yenileme ve akıllı görev yardımı yerel önizleme kurallarıyla çalışır; önizleme görevleri doğrulanmış ilerlemeye sayılmaz.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight">Günlük görevlerin</h2>
          <button onClick={handleRegenerate} disabled={isRegenerating} className="p-2 text-slate-400 hover:text-duo-blue transition-colors disabled:opacity-50">
            <RefreshCw size={18} className={cn(isRegenerating && 'animate-spin')} />
          </button>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tasks.length === 0 ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-12 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 font-bold">Bugün için henüz görev planlanmadı.</p>
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="mt-4 px-6 py-3 bg-duo-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-duo-blue/20 disabled:opacity-60"
                >
                  Günü planla
                </button>
              </motion.div>
            ) : (
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleToggle(task.id)}
                  className={cn(
                    'group relative p-6 rounded-[2rem] border-2 transition-all cursor-pointer active:scale-[0.98]',
                    task.completed
                      ? 'bg-slate-50 dark:bg-slate-900/20 border-transparent opacity-60'
                      : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-none hover:border-duo-blue',
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all',
                        task.completed
                          ? 'bg-duo-green text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-duo-blue/10 group-hover:text-duo-blue',
                      )}
                    >
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className={cn('text-lg font-bold truncate tracking-tight', task.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-100')}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span
                          className={cn(
                            'text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md',
                            task.priority === 'high'
                              ? 'bg-duo-red/10 text-duo-red'
                              : task.priority === 'medium'
                                ? 'bg-duo-yellow/10 text-duo-yellow'
                                : 'bg-duo-blue/10 text-duo-blue',
                          )}
                        >
                          {task.priority === 'high' ? 'Önemli' : task.priority === 'medium' ? 'Orta' : 'Rahat'}
                        </span>
                        {task.reminderTime && (
                          <span className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock size={10} /> {task.reminderTime}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteTask(task.id);
                      }}
                      className="p-2 text-slate-200 hover:text-duo-red transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {!isAdding ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(true)}
            className="w-full py-5 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 font-bold text-sm hover:border-duo-blue hover:text-duo-blue transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Özel görev ekle
          </motion.button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-duo-blue shadow-2xl space-y-4">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(event) => setNewTaskTitle(event.target.value)}
              placeholder="Ne yapmak istiyorsun?"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-bold outline-none dark:text-white"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsAdding(false)}
                disabled={isSubmittingTask}
                className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest disabled:opacity-50"
              >
                İptal
              </button>
              <button
                onClick={handleMagicAdd}
                disabled={isSubmittingTask || isParsing || !newTaskTitle.trim()}
                className="flex-1 py-4 bg-premium-gold text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isParsing ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Akıllı ekle
              </button>
              <button
                onClick={handleAdd}
                disabled={isSubmittingTask || !newTaskTitle.trim()}
                className="flex-1 py-4 bg-duo-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-60"
              >
                Ekle
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-gradient-to-br from-slate-900 to-premium-black rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 text-white/5">
            <Brain size={120} />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-premium-gold flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-premium-gold">Bugünün stratejisi</span>
            </div>
            <p className="text-lg font-medium leading-relaxed text-slate-200 italic">"{analysis}"</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
