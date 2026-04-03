import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import Coach from './components/Coach';
import DecisionTool from './components/DecisionTool';
import TaskManager from './components/TaskManager';
import EvolutionPanel from './components/EvolutionPanel';
import { UserProfile, DailyTask } from './types';
import { 
  Layout, 
  LogOut, 
  Trophy, 
  Target, 
  Zap, 
  Flame, 
  TrendingUp, 
  Award, 
  Home, 
  MessageCircle, 
  BarChart3, 
  User as UserIcon, 
  Settings 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('ascend_profile');
    const savedTasks = localStorage.getItem('ascend_tasks');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    setIsLoaded(true);
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('ascend_profile', JSON.stringify(newProfile));
  };

  const [activeTab, setActiveTab] = useState<'home' | 'coach' | 'stats' | 'profile'>('home');

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    localStorage.setItem('ascend_profile', JSON.stringify(updatedProfile));
  };

  const handleAddTask = (task: Omit<DailyTask, 'id' | 'completed'>) => {
    const newTask: DailyTask = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      completed: false
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('ascend_tasks', JSON.stringify(updatedTasks));
  };

  const handleToggleTask = (id: string) => {
    const updatedTasks = tasks.map(t => {
      if (t.id === id) {
        // Award experience on completion
        if (!t.completed && profile) {
          handleUpdateProfile({ 
            experience: profile.experience + 10 >= 100 ? (profile.experience + 10) % 100 : profile.experience + 10,
            level: profile.experience + 10 >= 100 ? profile.level + 1 : profile.level
          });
        }
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTasks(updatedTasks);
    localStorage.setItem('ascend_tasks', JSON.stringify(updatedTasks));
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    localStorage.setItem('ascend_tasks', JSON.stringify(updatedTasks));
  };

  const handleLogout = () => {
    if (confirm('Tüm ilerlemen silinecek. Emin misin?')) {
      localStorage.removeItem('ascend_profile');
      localStorage.removeItem('ascend_tasks');
      setProfile(null);
      setTasks([]);
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AnimatePresence mode="wait">
        {!profile ? (
          <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen"
          >
            {/* Top Bar - iOS Style */}
            <header className="bg-white border-b-2 border-slate-100 px-6 py-4 sticky top-0 z-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={24} className="text-duo-orange" fill="currentColor" />
                <span className="font-black text-duo-orange text-lg">5</span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border-2 border-slate-100">
                  <div className="w-5 h-5 bg-duo-blue rounded-full flex items-center justify-center">
                    <Zap size={12} className="text-white" fill="white" />
                  </div>
                  <span className="text-sm font-black text-slate-600">{profile.experience}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-duo-yellow border-2 border-duo-yellow-dark flex items-center justify-center text-white font-black shadow-sm">
                  {profile.level}
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 pb-24 overflow-y-auto bg-white">
              <div className="max-w-2xl mx-auto p-6 space-y-8">
                {activeTab === 'home' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <h2 className="text-3xl font-black text-slate-800">Hoş Geldin, {profile.name}!</h2>
                      <p className="text-slate-400 font-bold">Bugün kendini aşmaya hazır mısın?</p>
                    </div>

                    <TaskManager 
                      tasks={tasks}
                      onAddTask={handleAddTask}
                      onToggleTask={handleToggleTask}
                      onDeleteTask={handleDeleteTask}
                    />

                    <DecisionTool profile={profile} />
                  </motion.div>
                )}

                {activeTab === 'coach' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full"
                  >
                    <Coach profile={profile} onUpdateProfile={handleUpdateProfile} />
                  </motion.div>
                )}

                {activeTab === 'stats' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <EvolutionPanel profile={profile} tasks={tasks} />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="duo-card flex flex-col items-center text-center p-8">
                        <div className="w-16 h-16 rounded-3xl bg-duo-green/10 flex items-center justify-center text-duo-green mb-4">
                          <TrendingUp size={32} />
                        </div>
                        <span className="text-3xl font-black text-slate-800">{tasks.length}</span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Görev</span>
                      </div>
                      <div className="duo-card flex flex-col items-center text-center p-8">
                        <div className="w-16 h-16 rounded-3xl bg-duo-yellow/10 flex items-center justify-center text-duo-yellow mb-4">
                          <Award size={32} />
                        </div>
                        <span className="text-3xl font-black text-slate-800">{Math.floor(profile.level / 2)}</span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Rozet</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="duo-card text-center space-y-4 py-12">
                      <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-slate-400 border-4 border-white shadow-xl">
                        <UserIcon size={48} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-800">{profile.name}</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Seviye {profile.level} Gelişimci</p>
                      </div>
                      <div className="flex justify-center gap-4 pt-4">
                        <button className="duo-button duo-button-white px-8">
                          <Settings size={18} className="mr-2" /> Ayarlar
                        </button>
                        <button onClick={handleLogout} className="duo-button duo-button-white text-duo-red border-duo-red/20 hover:bg-duo-red/5">
                          <LogOut size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </main>

            {/* Bottom Navigation - iOS Style */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-slate-100 px-6 py-3 z-50 safe-area-bottom">
              <div className="max-w-md mx-auto flex items-center justify-between">
                <button 
                  onClick={() => setActiveTab('home')}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    activeTab === 'home' ? "text-duo-blue scale-110" : "text-slate-300"
                  )}
                >
                  <Home size={28} fill={activeTab === 'home' ? "currentColor" : "none"} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Ana Sayfa</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('coach')}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    activeTab === 'coach' ? "text-duo-green scale-110" : "text-slate-300"
                  )}
                >
                  <MessageCircle size={28} fill={activeTab === 'coach' ? "currentColor" : "none"} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Koç</span>
                </button>

                <button 
                  onClick={() => setActiveTab('stats')}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    activeTab === 'stats' ? "text-duo-orange scale-110" : "text-slate-300"
                  )}
                >
                  <BarChart3 size={28} fill={activeTab === 'stats' ? "currentColor" : "none"} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">İstatistik</span>
                </button>

                <button 
                  onClick={() => setActiveTab('profile')}
                  className={cn(
                    "flex flex-col items-center gap-1 transition-all",
                    activeTab === 'profile' ? "text-duo-yellow scale-110" : "text-slate-300"
                  )}
                >
                  <UserIcon size={28} fill={activeTab === 'profile' ? "currentColor" : "none"} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">Profil</span>
                </button>
              </div>
            </nav>

            {/* Footer */}
            <footer className="py-8 text-center text-slate-400 text-xs">
              <p>&copy; 2026 Ascend: AI Growth Coach. Tüm hakları saklıdır.</p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

