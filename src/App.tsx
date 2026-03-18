/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  CheckCircle, 
  Settings, 
  Dumbbell, 
  History as HistoryIcon, 
  Flame,
  Trash2,
  TrendingUp,
  Target,
  Timer,
  X,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PPL_PROGRAM } from './data/program';
import { DailyLog, WorkoutLog, SetLog, Exercise } from './types';

const STORAGE_KEY = 'ppl_pro_logs';
const DAY_INDEX_KEY = 'ppl_pro_day_index';
const SETTINGS_KEY = 'ppl_pro_settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workout' | 'history' | 'settings'>('workout');
  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const saved = localStorage.getItem(DAY_INDEX_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [logs, setLogs] = useState<DailyLog>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      restIntervalUpper: 60,
      restIntervalLower: 90,
      weightUnit: 'kg'
    };
  });

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(60);

  const today = new Date().toISOString().split('T')[0];
  const currentDay = PPL_PROGRAM[activeDayIndex];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(DAY_INDEX_KEY, activeDayIndex.toString());
  }, [activeDayIndex]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (timerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => (s !== null ? s - 1 : null));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      // Optional: Add a sound or vibration here
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const startRestTimer = (exercise: Exercise) => {
    const seconds = exercise.bodyPart === 'lower' ? settings.restIntervalLower : settings.restIntervalUpper;
    setInitialTimerSeconds(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  const updateSet = (exercise: Exercise, setIndex: number, field: keyof SetLog, value: string | boolean) => {
    const exerciseName = exercise.name;
    setLogs(prev => {
      const newLogs = { ...prev };
      if (!newLogs[today]) newLogs[today] = {};
      if (!newLogs[today][currentDay.id]) newLogs[today][currentDay.id] = {};
      
      const workoutLog = newLogs[today][currentDay.id];
      if (!workoutLog[exerciseName]) {
        const prevVariation = getPreviousWorkoutData?.[exerciseName]?.variation;
        workoutLog[exerciseName] = {
          variation: prevVariation || currentDay.exercises.find(e => e.name === exerciseName)?.options[0] || '',
          sets: Array(currentDay.exercises.find(e => e.name === exerciseName)?.sets || 0).fill(null).map(() => ({
            weight: '',
            reps: '',
            completed: false
          }))
        };
      }

      const exerciseLog = workoutLog[exerciseName];
      exerciseLog.sets[setIndex] = {
        ...exerciseLog.sets[setIndex],
        [field]: value
      };

      // Trigger timer if set was marked as completed
      if (field === 'completed' && value === true) {
        startRestTimer(exercise);
      }

      return newLogs;
    });
  };

  const updateVariation = (exerciseName: string, variation: string) => {
    setLogs(prev => {
      const newLogs = { ...prev };
      if (!newLogs[today]) newLogs[today] = {};
      if (!newLogs[today][currentDay.id]) newLogs[today][currentDay.id] = {};
      
      const workoutLog = newLogs[today][currentDay.id];
      if (!workoutLog[exerciseName]) {
        workoutLog[exerciseName] = {
          variation,
          sets: Array(currentDay.exercises.find(e => e.name === exerciseName)?.sets || 0).fill(null).map(() => ({
            weight: '',
            reps: '',
            completed: false
          }))
        };
      } else {
        workoutLog[exerciseName].variation = variation;
      }

      return newLogs;
    });
  };

  const getExerciseLog = (exerciseName: string) => {
    return logs[today]?.[currentDay.id]?.[exerciseName];
  };

  const workoutProgress = useMemo(() => {
    const dayLog = logs[today]?.[currentDay.id];
    if (!dayLog) return 0;
    
    let totalSets = 0;
    let completedSets = 0;
    
    currentDay.exercises.forEach(ex => {
      totalSets += ex.sets;
      const exLog = dayLog[ex.name];
      if (exLog) {
        completedSets += exLog.sets.filter(s => s.completed).length;
      }
    });
    
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  }, [logs, today, currentDay]);

  const getPreviousWorkoutData = useMemo(() => {
    const sortedDates = Object.keys(logs)
      .filter(d => d < today)
      .sort((a, b) => b.localeCompare(a));
    
    if (sortedDates.length > 0) {
      return logs[sortedDates[0]][currentDay.id];
    }
    return null;
  }, [logs, today, currentDay.id]);

  const clearToday = () => {
    if (confirm('Purge all data for today?')) {
      setLogs(prev => {
        const newLogs = { ...prev };
        delete newLogs[today];
        return newLogs;
      });
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ppl_log_backup_${today}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const finishWorkout = () => {
    setActiveDayIndex(prev => (prev + 1) % PPL_PROGRAM.length);
    setActiveTab('workout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen selection:bg-emerald-500/30 font-sans text-[#1a1a1a]">
      <AnimatePresence mode="wait">
        {activeTab === 'workout' && (
          <motion.div
            key="workout"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pb-40"
          >
            {/* Header */}
            <header className="px-6 py-8 flex justify-between items-center sticky top-0 bg-white/40 backdrop-blur-2xl z-20 border-b border-white/50">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-display font-extrabold tracking-tighter uppercase text-[#1a1a1a]">PPL Log</h1>
                </div>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-1.5">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('settings')}
                className="glass-button p-3 rounded-2xl"
              >
                <Settings className="w-5 h-5 text-zinc-400" />
              </button>
            </header>

            {/* Progress Bar */}
            <div className="h-[3px] w-full bg-white/50 sticky top-[93px] z-20">
              <motion.div 
                className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${workoutProgress}%` }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              />
            </div>

            {/* Workout Content */}
            <main className="p-6 max-w-2xl mx-auto">
              <div className="flex items-end justify-between mb-12 mt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Active Session</span>
                  </div>
                  <h2 className="text-2xl font-display font-black text-[#1a1a1a] tracking-tighter leading-none">{currentDay.name}</h2>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveDayIndex(prev => Math.max(0, prev - 1))} 
                    className="glass-button p-4 rounded-2xl disabled:opacity-20"
                    disabled={activeDayIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5 text-zinc-400" />
                  </button>
                  <button 
                    onClick={() => setActiveDayIndex(prev => Math.min(PPL_PROGRAM.length - 1, prev + 1))} 
                    className="glass-button p-4 rounded-2xl disabled:opacity-20"
                    disabled={activeDayIndex === PPL_PROGRAM.length - 1}
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-5 mb-12 items-start">
                <div className="glass-card rounded-[2.5rem] p-6">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Exercises</p>
                  <p className="text-2xl font-display font-black font-mono text-[#1a1a1a]">{currentDay.exercises.length}</p>
                </div>
                <div className="glass-card rounded-[2.5rem] p-6">
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-2 whitespace-nowrap">Total Sets</p>
                  <p className="text-2xl font-display font-black font-mono text-[#1a1a1a]">{currentDay.exercises.reduce((acc, ex) => acc + ex.sets, 0)}</p>
                </div>
                <div className="glass-card rounded-[2.5rem] p-6">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Progress</p>
                  <p className="text-2xl font-display font-black font-mono text-emerald-500">{Math.round(workoutProgress)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                {currentDay.exercises.map((ex) => (
                  <ExerciseCard 
                    key={ex.name} 
                    exercise={ex} 
                    log={getExerciseLog(ex.name)}
                    prevLog={getPreviousWorkoutData?.[ex.name]}
                    onUpdateSet={(setIdx, field, val) => updateSet(ex, setIdx, field, val)}
                    onUpdateVariation={(val) => updateVariation(ex.name, val)}
                  />
                ))}
              </div>

              {workoutProgress === 100 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 p-8 glass-panel rounded-[2.5rem] text-center border-emerald-500/30"
                >
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.4)]">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-[#1a1a1a] tracking-tight mb-2">Session Complete</h3>
                  <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-8">Protocol fully executed</p>
                  <button 
                    onClick={finishWorkout}
                    className="w-full py-6 bg-emerald-500 text-white font-display font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-emerald-400 transition-all active:scale-95 shadow-[0_15px_40px_rgba(16,185,129,0.3)]"
                  >
                    Go to Next Session
                  </button>
                </motion.div>
              )}

              <div className="flex gap-4 mt-20">
                <button 
                  onClick={exportData}
                  className="flex-1 py-6 glass-button rounded-3xl text-emerald-500 font-display font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all"
                >
                  <TrendingUp className="w-4 h-4" />
                  Save to Device
                </button>
                <button 
                  onClick={clearToday}
                  className="flex-1 py-6 glass-button rounded-3xl border-red-500/20 text-red-500/40 font-display font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-red-500/5 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Purge Data
                </button>
              </div>
            </main>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8 pb-40"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="glass-panel p-3 rounded-2xl">
                <HistoryIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-[#1a1a1a]">History</h1>
            </div>
            
            <div className="space-y-8">
              {Object.entries(logs).length === 0 ? (
                <div className="text-center py-40 text-zinc-300">
                  <Target className="w-20 h-20 mx-auto mb-6 opacity-20" />
                  <p className="font-display font-bold uppercase tracking-[0.3em] text-[10px]">No session logs detected</p>
                </div>
              ) : (
                Object.entries(logs).sort((a, b) => b[0].localeCompare(a[0])).map(([date, dayLogs]) => (
                  <div key={date} className="glass-card rounded-[2.5rem] p-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="font-display font-black text-emerald-500 uppercase tracking-tighter text-xl">
                        {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </h3>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{Object.keys(dayLogs).length} Sessions</span>
                    </div>
                    {Object.entries(dayLogs).map(([workoutId, workoutLog]) => (
                      <div key={workoutId} className="mt-6 pt-6 border-t border-black/5">
                        <p className="text-base font-display font-black text-[#1a1a1a] uppercase tracking-tight">{PPL_PROGRAM.find(p => p.id === workoutId)?.name}</p>
                        <div className="flex flex-wrap gap-2.5 mt-4">
                          {Object.keys(workoutLog).slice(0, 4).map(ex => (
                            <span key={ex} className="text-[9px] font-bold glass-inset px-3 py-2 rounded-xl text-zinc-400 uppercase tracking-widest">{ex}</span>
                          ))}
                          {Object.keys(workoutLog).length > 4 && <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">+{Object.keys(workoutLog).length - 4} more</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 pb-40"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="glass-panel p-3 rounded-2xl">
                <Settings className="w-6 h-6 text-emerald-500" />
              </div>
              <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-[#1a1a1a]">Settings</h1>
            </div>

            <div className="space-y-10">
              <section>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-6">System Configuration</h3>
                <div className="space-y-4">
                  <div className="glass-card rounded-3xl p-6 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Upper Body Rest</span>
                    <select 
                      value={settings.restIntervalUpper}
                      onChange={(e) => setSettings({ ...settings, restIntervalUpper: parseInt(e.target.value) })}
                      className="glass-button text-emerald-500 font-display font-black font-mono px-4 py-2 rounded-xl outline-none"
                    >
                      {[30, 45, 60, 75, 90, 105, 120].map(s => (
                        <option key={s} value={s}>{s}s</option>
                      ))}
                    </select>
                  </div>
                  <div className="glass-card rounded-3xl p-6 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Lower Body Rest</span>
                    <select 
                      value={settings.restIntervalLower}
                      onChange={(e) => setSettings({ ...settings, restIntervalLower: parseInt(e.target.value) })}
                      className="glass-button text-emerald-500 font-display font-black font-mono px-4 py-2 rounded-xl outline-none"
                    >
                      {[60, 75, 90, 105, 120, 135, 150, 180].map(s => (
                        <option key={s} value={s}>{s}s</option>
                      ))}
                    </select>
                  </div>
                  <div className="glass-card rounded-3xl p-6 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Weight Unit</span>
                    <select 
                      value={settings.weightUnit}
                      onChange={(e) => setSettings({ ...settings, weightUnit: e.target.value })}
                      className="glass-button text-emerald-500 font-display font-black font-mono px-4 py-2 rounded-xl outline-none uppercase"
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                </div>
              </section>

              <button 
                onClick={() => {
                  if (confirm('Export all data as JSON?')) {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs));
                    const downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute("href", dataStr);
                    downloadAnchorNode.setAttribute("download", "ppl_pro_backup.json");
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                  }
                }}
                className="w-full py-6 glass-button text-emerald-500 font-display font-black uppercase tracking-[0.2em] rounded-3xl transition-all active:scale-95"
              >
                Export Data Backup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/40 backdrop-blur-3xl border-t border-white/50 px-10 py-10 flex justify-around items-center z-30">
        <button 
          onClick={() => setActiveTab('workout')}
          className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'workout' ? 'text-emerald-500 scale-110' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <Dumbbell className={`w-7 h-7 ${activeTab === 'workout' ? 'fill-emerald-500/10' : ''}`} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Training</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'history' ? 'text-emerald-500 scale-110' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <HistoryIcon className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-2 transition-all ${activeTab === 'settings' ? 'text-emerald-500 scale-110' : 'text-zinc-400 hover:text-zinc-600'}`}
        >
          <Settings className="w-7 h-7" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Config</span>
        </button>
      </nav>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {timerSeconds !== null && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-36 left-6 right-6 z-40"
          >
            <div className="glass-panel rounded-[2.5rem] p-6 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="bg-emerald-500/10 p-3 rounded-2xl">
                  <Timer className="w-7 h-7 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Rest Protocol</p>
                  <p className="text-3xl font-display font-black font-mono leading-none mt-1 text-[#1a1a1a]">
                    {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setTimerActive(!timerActive)}
                  className="w-14 h-14 glass-button rounded-2xl flex items-center justify-center"
                >
                  {timerActive ? <Pause className="w-6 h-6 text-zinc-400" /> : <Play className="w-6 h-6 text-zinc-400" />}
                </button>
                <button 
                  onClick={() => setTimerSeconds(initialTimerSeconds)}
                  className="w-14 h-14 glass-button rounded-2xl flex items-center justify-center"
                >
                  <RotateCcw className="w-6 h-6 text-zinc-400" />
                </button>
                <button 
                  onClick={() => {
                    setTimerSeconds(null);
                    setTimerActive(false);
                  }}
                  className="w-14 h-14 glass-button rounded-2xl flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
            </div>
            {/* Progress Bar in Timer */}
            <div className="absolute bottom-0 left-8 right-8 h-1 bg-emerald-500/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-emerald-500/30"
                initial={{ width: '100%' }}
                animate={{ width: `${(timerSeconds / initialTimerSeconds) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ExerciseCardProps {
  key?: string | number;
  exercise: any;
  log?: {
    variation: string;
    sets: SetLog[];
  };
  prevLog?: {
    variation: string;
    sets: SetLog[];
  };
  onUpdateSet: (idx: number, field: keyof SetLog, val: any) => void;
  onUpdateVariation: (val: string) => void;
}

function ExerciseCard({ 
  exercise, 
  log, 
  prevLog,
  onUpdateSet, 
  onUpdateVariation 
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const variation = log?.variation || prevLog?.variation || exercise.options[0];
  const sets = log?.sets || Array(exercise.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }));

  const completedCount = sets.filter(s => s.completed).length;
  const isFullyCompleted = completedCount === exercise.sets;

  return (
    <motion.div 
      layout
      className={`glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500 ${
        isFullyCompleted ? 'ring-2 ring-emerald-500/20' : ''
      }`}
    >
      {/* Accordion Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-8 flex justify-between items-center glass-button !rounded-[2.5rem] !border-none hover:bg-white/20 transition-colors"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-[15px] font-display font-bold tracking-tight text-[#1a1a1a]">{exercise.name}</h3>
            {isFullyCompleted && <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
              {exercise.sets} Sets <span className="text-zinc-200 mx-2">|</span> {exercise.reps} Reps
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-2xl glass-button transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        </div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="px-8 pb-8 pt-2 space-y-8 border-t border-black/5">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Variation Selection</p>
                <div className="relative">
                  <select 
                    className="appearance-none glass-button text-[9px] font-bold uppercase tracking-widest rounded-xl py-2 pl-4 pr-10 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer text-[#1a1a1a]"
                    value={variation}
                    onChange={(e) => onUpdateVariation(e.target.value)}
                  >
                    {exercise.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {sets.map((set, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-mono font-bold border transition-all duration-500 ${
                      set.completed ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_5px_15px_rgba(16,185,129,0.3)]' : 'glass-inset text-zinc-300'
                    }`}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input 
                          type="number"
                          placeholder={sets[i-1]?.weight || prevLog?.sets[i]?.weight || "0.0"} 
                          value={set.weight}
                          onChange={(e) => onUpdateSet(i, 'weight', e.target.value)}
                          className="w-full glass-inset rounded-2xl py-3 text-center text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-400 text-[#1a1a1a]" 
                        />
                        {i === 0 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Weight</span>}
                      </div>
                      <div className="relative">
                        <input 
                          type="number"
                          placeholder={sets[i-1]?.reps || prevLog?.sets[i]?.reps || "0"} 
                          value={set.reps}
                          onChange={(e) => onUpdateSet(i, 'reps', e.target.value)}
                          className="w-full glass-inset rounded-2xl py-3 text-center text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-400 text-[#1a1a1a]" 
                        />
                        {i === 0 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Reps</span>}
                      </div>
                    </div>
                    <button 
                      onClick={() => onUpdateSet(i, 'completed', !set.completed)}
                      className={`p-3 rounded-2xl transition-all active:scale-90 ${
                        set.completed 
                          ? 'bg-emerald-500 text-white shadow-[0_10px_20px_rgba(16,185,129,0.3)]' 
                          : 'glass-button text-zinc-300 hover:text-emerald-500'
                      }`}
                    >
                      <CheckCircle className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
