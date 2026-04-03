import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Plus, Filter, Trash2, CheckSquare, ListTodo, Bell, BellOff, Clock, Zap, Star, Sparkles } from 'lucide-react';
import { DailyTask, Path } from '../types';
import { cn } from '../lib/utils';

interface TaskManagerProps {
  tasks: DailyTask[];
  onAddTask: (task: Omit<DailyTask, 'id' | 'completed'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const categories: { id: Path; label: string; color: string }[] = [
  { id: 'fitness', label: 'Spor', color: 'bg-orange-500' },
  { id: 'culture', label: 'Kültür', color: 'bg-blue-500' },
  { id: 'social', label: 'Sosyal', color: 'bg-pink-500' },
  { id: 'entertainment', label: 'Eğlence', color: 'bg-purple-500' },
  { id: 'career', label: 'Kariyer', color: 'bg-indigo-500' },
  { id: 'general', label: 'Genel', color: 'bg-slate-500' },
];

export default function TaskManager({ tasks, onAddTask, onToggleTask, onDeleteTask }: TaskManagerProps) {
  const [filter, setFilter] = useState<Path | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Path>('general');
  const [newTaskReminder, setNewTaskReminder] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notificationIcon = `${import.meta.env.BASE_URL}icon-192.png`;

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Reminder Check Logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      tasks.forEach(task => {
        if (!task.completed && task.reminderTime === currentTime) {
          // Trigger notification
          if (Notification.permission === 'granted') {
            new Notification('Ascend Hatırlatıcı', {
              body: `Görev vakti: ${task.title}`,
              icon: notificationIcon
            });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [notificationIcon, tasks]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return tasks;
    return tasks.filter(t => t.category === filter);
  }, [tasks, filter]);

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const handleAdd = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask({
      title: newTaskTitle,
      description: '',
      category: newTaskCategory,
      reminderTime: newTaskReminder || undefined
    });
    setNewTaskTitle('');
    setNewTaskReminder('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-12">
      {/* Progress Header */}
      <div className="duo-card sticky top-20 z-40 bg-white/95 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-14 h-14 rounded-2xl bg-duo-blue flex items-center justify-center text-white shadow-[0_5px_0_0_#1899d6]"
            >
              <ListTodo size={28} />
            </motion.div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Günlük Yolculuk</h3>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Bölüm 1: Temeller</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-duo-orange font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <Zap size={10} fill="currentColor" /> {tasks.length} Görev
                </span>
              </div>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(!isAdding)}
            className="duo-button duo-button-green p-4"
          >
            <Plus size={24} />
          </motion.button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-colors",
                progress === 100 ? "bg-duo-green text-white" : "bg-slate-100 text-slate-500"
              )}>
                {progress === 100 ? "Tamamlandı!" : "Devam Ediyor"}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black text-duo-green">%{progress}</span>
              {progress === 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Star size={16} className="text-duo-yellow fill-duo-yellow" />
                </motion.div>
              )}
            </div>
          </div>
          <div className="h-5 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-100 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50 }}
              className="h-full bg-duo-green rounded-full shadow-[0_2px_0_0_#46a302] relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="duo-card border-duo-green/30 bg-duo-green/5"
          >
            <div className="space-y-4">
              <h4 className="text-sm font-black text-duo-green uppercase tracking-widest">Yeni Görev Ekle</h4>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Ne başarmak istersin?"
                className="w-full px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-duo-green"
                autoFocus
              />
              <div className="flex gap-3">
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as Path)}
                  className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                <input
                  type="time"
                  value={newTaskReminder}
                  onChange={(e) => setNewTaskReminder(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 duo-button duo-button-white"
                >
                  İptal
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 duo-button duo-button-green"
                >
                  Ekle
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Path - Duolingo Style */}
      <div className="flex flex-col items-center space-y-12 py-12 relative">
        {/* Path Line */}
        <div className="absolute top-0 bottom-0 w-4 bg-slate-100 rounded-full left-1/2 -translate-x-1/2 -z-10 overflow-hidden">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            className="w-full bg-duo-green/30"
          />
        </div>

        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-4 border-4 border-white shadow-lg">
                <CheckSquare size={40} />
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Yolculuk Başlıyor...</p>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => {
              // Duolingo-style zigzag offset
              const offset = (index % 3 === 0) ? '0' : (index % 3 === 1) ? '45px' : '-45px';
              
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.5 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, x: 100 }}
                  style={{ x: offset }}
                  className="relative group"
                >
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onToggleTask(task.id)}
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-[0_10px_0_0_#e2e8f0] relative",
                      task.completed 
                        ? "bg-duo-green shadow-[0_10px_0_0_#46a302] text-white" 
                        : "bg-white border-4 border-slate-200 text-slate-300 hover:border-duo-blue hover:text-duo-blue"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {task.completed ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0, rotate: 90 }}
                        >
                          <CheckCircle2 size={40} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="circle"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Circle size={40} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Tooltip-style Label */}
                    <div className={cn(
                      "absolute -top-14 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-2xl transition-all opacity-0 group-hover:opacity-100 pointer-events-none z-50",
                      task.completed ? "bg-duo-green text-white" : "bg-slate-800 text-white"
                    )}>
                      {task.title}
                      <div className={cn(
                        "absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45",
                        task.completed ? "bg-duo-green" : "bg-slate-800"
                      )} />
                    </div>

                    {/* Completion Sparkles */}
                    {task.completed && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 0] }}
                        className="absolute -inset-4 pointer-events-none"
                      >
                        <Sparkles size={24} className="text-duo-yellow absolute top-0 left-0" />
                        <Sparkles size={16} className="text-duo-yellow absolute bottom-0 right-0" />
                      </motion.div>
                    )}
                  </motion.button>

                  {/* Delete Button - Small & Subtle */}
                  <motion.button 
                    whileHover={{ scale: 1.2, color: '#ff4b4b' }}
                    onClick={() => onDeleteTask(task.id)}
                    className="absolute -right-12 top-1/2 -translate-y-1/2 p-3 text-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
