/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  CheckCircle, 
  Settings, 
  Dumbbell, 
  History as HistoryIcon, 
  Flame,
  Check,
  Edit2,
  Trash2,
  ArrowUp,
  Target,
  Timer,
  X,
  Play,
  Pause,
  RotateCcw,
  GripVertical,
  Calendar as CalendarIcon,
  ArrowLeft,
  TrendingUp,
  Layout,
  Plus,
  Minus,
  Pin,
  Download,
  Upload,
  ExternalLink,
  Save,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths, 
  startOfWeek, 
  endOfWeek,
  isToday,
  parseISO
} from 'date-fns';
import { LoadingScreen, FolderIcon } from './components/LoadingScreen';
import { PPL_PROGRAMME, UPPER_LOWER_PROGRAMME, FULL_BODY_PROGRAMME, BASIC_STRENGTH_PROGRAMME } from './data/programme';
import { DailyLog, WorkoutLog, SetLog, Exercise, WorkoutDay, SavedTemplate } from './types';

const STORAGE_KEY = 'ppl_pro_logs';
const DAY_INDEX_KEY = 'ppl_pro_day_index';
const SETTINGS_KEY = 'ppl_pro_settings';
const PROGRAMME_KEY = 'ppl_pro_custom_programme';
const SAVED_TEMPLATES_KEY = 'ppl_pro_saved_templates';
const EQUIPMENT_OPTIONS = ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT', 'BAND'];

const getAutoVariation = (exerciseName: string, options?: string[]) => {
  const name = exerciseName.toUpperCase();
  if (name.includes('MACHINE')) return 'MACHINE';
  if (name.includes('DUMBBELL') || name.includes('DB')) return 'DUMBBELL';
  if (name.includes('BARBELL') || name.includes('BB')) return 'BARBELL';
  if (name.includes('CABLE')) return 'CABLE';
  if (name.includes('BAND') || name.includes('彈力帶')) return 'BAND';
  if (name.includes('BODYWEIGHT') || name.includes('BODY WEIGHT') || name.includes('自重') || name.includes('自重坐站') || name.includes('抬腿') || name.includes('單腳站立') || name.includes('提踵')) return 'BODYWEIGHT';
  
  if (options && options.length > 0 && EQUIPMENT_OPTIONS.includes(options[0])) {
    return options[0];
  }
  return EQUIPMENT_OPTIONS[0];
};

function ReorderableExercise({ ex, getExerciseLog, getPreviousWorkoutData, updateSet, updateVariation, updateExerciseNotes, renameExercise, addSet, removeSet, onReorder, onOpenInput, isExpanded, onToggleExpand, settings, t }: any) {
  const controls = useDragControls();
  return (
    <Reorder.Item 
      value={ex.name} 
      dragControls={controls}
      dragListener={false}
      className="relative"
    >
      <ExerciseCard 
        exercise={ex} 
        log={getExerciseLog(ex.name)}
        prevLog={getPreviousWorkoutData?.[ex.name]}
        onUpdateSet={(setIdx: number, field: any, val: any) => updateSet(ex, setIdx, field, val)}
        onUpdateVariation={(val: string) => updateVariation(ex.name, val)}
        onUpdateNotes={(val: string) => updateExerciseNotes(ex.name, val)}
        onRenameExercise={(newName: string) => renameExercise(ex.name, newName)}
        onAddSet={() => addSet(ex)}
        onRemoveSet={(idx?: number) => removeSet(ex, idx)}
        dragControls={controls}
        onOpenInput={onOpenInput}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
        settings={settings}
        t={t}
      />
    </Reorder.Item>
  );
}

function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, t }: any) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-card w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-display font-black text-[#1a1a1a] uppercase tracking-tighter">
                {title}
              </h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                {message}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={onCancel}
                className="flex-1 py-4 glass-button rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 active:scale-95 transition-all"
              >
                {t('cancel')}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-4 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                {t('confirm')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {
      restIntervalUpper: 60,
      restIntervalLower: 90,
      weightUnit: 'kg',
      bodyWeight: 70,
      language: 'en'
    };
  });

  const t = (key: string) => {
    const translations: any = {
      en: {
        repArchive: "REP ARCHIVE",
        training: "TRAINING",
        programmes: "PROGRAMMES",
        history: "HISTORY",
        settings: "SETTINGS",
        systemConfig: "System Configuration",
        upperBodyRest: "Upper Body Rest",
        lowerBodyRest: "Lower Body Rest",
        weightUnit: "Weight Unit",
        language: "Language",
        bodyWeight: "Bodyweight",
        exportBackup: "Export Data Backup",
        editProgramme: "Edit Programme",
        programmeName: "Programme Name",
        sessionTitle: "Session Title",
        exerciseName: "Exercise Name",
        sets: "Sets",
        targetReps: "Target Reps",
        addExercise: "Add Exercise",
        addTrainingDay: "Add Training Day",
        save: "SAVE",
        delete: "DELETE",
        pinned: "PINNED",
        apply: "APPLY",
        edit: "EDIT",
        newCustomProgramme: "NEW CUSTOM PROGRAMME",
        defaultPplProgramme: "DEFAULT PPL PROGRAMME",
        noProgrammeSelected: "No Programme Selected",
        goToProgrammes: "Go to Programmes",
        activeSession: "Active Session",
        totalSets: "Total Sets",
        progress: "Progress",
        export: "Export",
        session: "Session",
        rest: "REST",
        complete: "COMPLETE",
        weight: "Weight",
        reps: "Reps",
        historyCalendar: "Calendar",
        historyProgress: "Progress",
        totalVolume: "Total Volume",
        totalReps: "Total Reps",
        workouts: "Workouts",
        avgIntensity: "Avg Intensity",
        volumeTrend: "Volume Trend",
        intensityTrend: "Intensity Trend",
        days: "Days",
        exercises: "Exercises",
        pushDay: "Push Day",
        pullDay: "Pull Day",
        legDay: "Leg Day",
        defaultExerciseName: "Exercise Name",
        newExercise: "New Exercise",
        sessionNotes: "Session Notes",
        notesPlaceholder: "Record your performance, feelings, or any details about this session...",
        historyTitle: "History",
        volumeProgress: "Volume Progress",
        totalWeightLifted: "Total weight lifted per session",
        insufficientData: "Insufficient data for chart",
        avgVolume: "Avg Volume",
        maxVolume: "Max Volume",
        unknownWorkout: "Unknown Workout",
        finishSession: "Finish Session",
        confirmPurge: "Purge all data for today?",
        confirmExport: "Export all data as JSON?",
        confirmDeleteTemplate: "Delete this template?",
        confirmApplyTemplate: "Apply this template? This will overwrite your current programme.",
        defaultUpperLowerProgramme: "DEFAULT UPPER LOWER",
        defaultFullBodyProgramme: "DEFAULT FULL BODY",
        defaultBasicStrengthProgramme: "基本肌力訓練",
        exerciseNotes: "Exercise Notes",
        exerciseNotesPlaceholder: "Add notes for this exercise...",
        cancel: "CANCEL",
        confirm: "CONFIRM",
        createProgramme: "Create Programme",
        exportCurrentProgramme: "Export Current Programme",
        programme: "Programme"
      },
      zh: {
        repArchive: "訓練紀錄",
        training: "訓練",
        programmes: "訓練計畫",
        history: "歷史",
        settings: "設定",
        systemConfig: "系統設定",
        upperBodyRest: "上半身休息",
        lowerBodyRest: "下半身休息",
        weightUnit: "重量單位",
        language: "語言",
        bodyWeight: "體重",
        exportBackup: "匯出數據備份",
        editProgramme: "編輯計畫",
        programmeName: "計畫名稱",
        sessionTitle: "訓練單元名稱",
        exerciseName: "動作名稱",
        sets: "組數",
        targetReps: "目標次數",
        addExercise: "新增動作",
        addTrainingDay: "新增訓練日",
        save: "儲存",
        delete: "刪除",
        pinned: "已置頂",
        apply: "套用",
        edit: "編輯",
        newCustomProgramme: "新自定義計畫",
        defaultPplProgramme: "預設 PPL 計畫",
        noProgrammeSelected: "未選擇計畫",
        goToProgrammes: "前往訓練計畫",
        activeSession: "當前訓練單元",
        totalSets: "總組數",
        progress: "進度",
        export: "匯出",
        session: "單元",
        rest: "休息",
        complete: "完成",
        weight: "重量",
        reps: "次數",
        historyCalendar: "日曆",
        historyProgress: "進度",
        totalVolume: "總容量",
        totalReps: "總次數",
        workouts: "訓練次數",
        avgIntensity: "平均強度",
        volumeTrend: "容量趨勢",
        intensityTrend: "強度趨勢",
        days: "天數",
        exercises: "動作",
        pushDay: "推力日",
        pullDay: "拉力日",
        legDay: "腿部日",
        defaultExerciseName: "動作名稱",
        newExercise: "新動作",
        sessionNotes: "訓練筆記",
        notesPlaceholder: "記錄你的表現、感受或關於此單元的任何細節...",
        historyTitle: "歷史紀錄",
        volumeProgress: "訓練容量進度",
        totalWeightLifted: "每次訓練的總負重",
        insufficientData: "數據不足，無法顯示圖表",
        avgVolume: "平均容量",
        maxVolume: "最大容量",
        unknownWorkout: "未知訓練",
        finishSession: "完成訓練",
        confirmPurge: "清除今天的所有數據？",
        confirmExport: "匯出所有數據為 JSON？",
        confirmDeleteTemplate: "刪除此計畫？",
        confirmApplyTemplate: "套用此計畫？這將覆蓋你目前的訓練計畫。",
        defaultUpperLowerProgramme: "預設 上下肢計畫",
        defaultFullBodyProgramme: "預設 全身計畫",
        defaultBasicStrengthProgramme: "基本肌力訓練計畫",
        exerciseNotes: "動作筆記",
        exerciseNotesPlaceholder: "為此動作添加筆記...",
        cancel: "取消",
        confirm: "確認",
        createProgramme: "建立訓練計畫",
        exportCurrentProgramme: "匯出當前計畫",
        programme: "訓練計畫"
      }
    };
    return translations[settings.language]?.[key] || translations['en'][key] || key;
  };

  const tabs = [
    { id: 'workout', icon: Dumbbell, label: t('training') },
    { id: 'history', icon: HistoryIcon, label: t('history') },
    { id: 'template', icon: Layout, label: t('programmes') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  const [activeTab, setActiveTab] = useState<'workout' | 'template' | 'history' | 'settings'>('workout');
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [programme, setProgramme] = useState<WorkoutDay[]>(() => {
    const saved = localStorage.getItem(PROGRAMME_KEY) || localStorage.getItem('ppl_pro_custom_program');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return PPL_PROGRAMME;
  });
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() => {
    const saved = localStorage.getItem(SAVED_TEMPLATES_KEY);
    const defaultTemplates: SavedTemplate[] = [
      { id: 'default-ppl', name: t('defaultPplProgramme'), programme: PPL_PROGRAMME, isDefault: true, pinned: true },
      { id: 'default-upper-lower', name: t('defaultUpperLowerProgramme'), programme: UPPER_LOWER_PROGRAMME, isDefault: true, pinned: true },
      { id: 'default-full-body', name: t('defaultFullBodyProgramme'), programme: FULL_BODY_PROGRAMME, isDefault: true, pinned: true },
      { id: 'default-basic-strength', name: t('defaultBasicStrengthProgramme'), programme: BASIC_STRENGTH_PROGRAMME, isDefault: true, pinned: true }
    ];
    if (!saved) return defaultTemplates;
    
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Merge default templates with saved ones, ensuring defaults are always present
        const customTemplates = parsed.filter((tpl: any) => !defaultTemplates.some(dt => dt.id === tpl.id));
        return [...defaultTemplates, ...customTemplates].map((tpl: any) => ({
          ...tpl,
          programme: tpl.programme || tpl.program || []
        }));
      }
    } catch (e) {}
    return defaultTemplates;
  });
  const [activeDayIndex, setActiveDayIndex] = useState(() => {
    const saved = localStorage.getItem(DAY_INDEX_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [logs, setLogs] = useState<DailyLog>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [historyView, setHistoryView] = useState<'calendar' | 'progress'>('calendar');

  // Timer State
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(60);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Input State
  const [activeInput, setActiveInput] = useState<{
    type: 'exercise' | 'settings';
    exerciseName?: string;
    setIndex?: number;
    field: 'weight' | 'reps' | 'bodyWeight';
    value: string;
    placeholder: string;
  } | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [showArchivedPopup, setShowArchivedPopup] = useState(false);

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const currentDay = programme[activeDayIndex];

  useEffect(() => {
    if (timerActive && timerSeconds !== null) {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `Rest Timer: ${Math.floor(timerSeconds / 60)}:${String(timerSeconds % 60).padStart(2, '0')}`,
          artist: 'PPL Pro Training',
          album: currentDay?.name || 'Workout',
          artwork: [
            { src: 'https://picsum.photos/seed/workout/512/512', sizes: '512x512', type: 'image/png' }
          ]
        });
        navigator.mediaSession.playbackState = 'playing';

        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        }
      }
    } else {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
    }
  }, [timerActive, timerSeconds, currentDay]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem(DAY_INDEX_KEY, activeDayIndex.toString());
    setExpandedExercise(null);
  }, [activeDayIndex]);

  useEffect(() => {
    setExpandedExercise(null);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(PROGRAMME_KEY, JSON.stringify(programme));
  }, [programme]);

  useEffect(() => {
    localStorage.setItem(SAVED_TEMPLATES_KEY, JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (timerActive && timerEndTime !== null) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((timerEndTime - Date.now()) / 1000));
        setTimerSeconds(remaining);
        if (remaining === 0) {
          setTimerActive(false);
          setTimerEndTime(null);
        }
      }, 200);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerEndTime]);

  const startRestTimer = (exercise: Exercise) => {
    const seconds = exercise.bodyPart === 'lower' ? settings.restIntervalLower : settings.restIntervalUpper;
    setInitialTimerSeconds(seconds);
    setTimerSeconds(seconds);
    setTimerEndTime(Date.now() + seconds * 1000);
    setTimerActive(true);
  };

  const updateSet = (exercise: Exercise, setIndex: number, field: keyof SetLog, value: string | boolean) => {
    const exerciseName = exercise.name;
    setLogs(prev => {
      const dayLogs = prev[today] || {};
      const workoutLogs = dayLogs[currentDay.id] || {};
      const exerciseLog = workoutLogs[exerciseName] || {
        variation: getPreviousWorkoutData?.[exerciseName]?.variation || getAutoVariation(exerciseName, exercise.options),
        sets: Array(exercise.sets).fill(null).map(() => ({
          weight: '',
          reps: '',
          completed: false
        }))
      };

      const newSets = [...exerciseLog.sets];
      const currentSet = { ...newSets[setIndex] };
      
      let finalValue = value;
      
      // Special logic for bodyweight exercises
      if (field === 'weight' && typeof value === 'string' && value !== '') {
        const variation = exerciseLog.variation;
        
        if (variation === 'BODYWEIGHT') {
          const addedWeight = parseFloat(value);
          if (!isNaN(addedWeight)) {
            finalValue = (addedWeight + (settings.bodyWeight || 0)).toString();
          }
        }
      }

      // If marking as completed, check if we need to use placeholders
      if (field === 'completed' && value === true) {
        if (!currentSet.weight) {
          const placeholder = newSets[setIndex - 1]?.weight || getPreviousWorkoutData?.[exerciseName]?.sets[setIndex]?.weight || "0";
          currentSet.weight = placeholder;
        }
        if (!currentSet.reps) {
          currentSet.reps = newSets[setIndex - 1]?.reps || getPreviousWorkoutData?.[exerciseName]?.sets[setIndex]?.reps || "0";
        }
      }

      newSets[setIndex] = {
        ...currentSet,
        [field]: finalValue
      };

      // Trigger timer if set was marked as completed
      if (field === 'completed' && value === true) {
        startRestTimer(exercise);
      }

      return {
        ...prev,
        [today]: {
          ...dayLogs,
          [currentDay.id]: {
            ...workoutLogs,
            [exerciseName]: {
              ...exerciseLog,
              sets: newSets
            }
          }
        }
      };
    });
  };

  const updateVariation = (exerciseName: string, variation: string) => {
    setLogs(prev => {
      const dayLogs = prev[today] || {};
      const workoutLogs = dayLogs[currentDay.id] || {};
      const exerciseLog = workoutLogs[exerciseName] || {
        variation,
        sets: Array(programme.find(d => d.id === currentDay.id)?.exercises.find(e => e.name === exerciseName)?.sets || 0).fill(null).map(() => ({
          weight: '',
          reps: '',
          completed: false
        }))
      };

      let newSets = [...exerciseLog.sets];
      
      // Automatically apply bodyweight if variation is BODYWEIGHT
      if (variation === 'BODYWEIGHT') {
        newSets = newSets.map(s => ({
          ...s,
          weight: settings.bodyWeight?.toString() || s.weight
        }));
      }

      return {
        ...prev,
        [today]: {
          ...dayLogs,
          [currentDay.id]: {
            ...workoutLogs,
            [exerciseName]: {
              ...exerciseLog,
              variation,
              sets: newSets
            }
          }
        }
      };
    });
  };

  const updateExerciseOrder = (newOrder: string[]) => {
    if (!currentDay) return;
    setLogs(prev => {
      const dayLogs = prev[today] || {};
      const workoutLogs = dayLogs[currentDay.id] || {};
      
      return {
        ...prev,
        [today]: {
          ...dayLogs,
          [currentDay.id]: {
            ...workoutLogs,
            exerciseOrder: newOrder
          }
        }
      };
    });
  };

  const renameExercise = (oldName: string, newName: string) => {
    if (!currentDay || !newName.trim() || oldName === newName) return;

    // Update programme
    setProgramme(prev => {
      const newProgramme = prev.map(day => {
        if (day.id === currentDay.id) {
          return {
            ...day,
            exercises: day.exercises.map(ex => 
              ex.name === oldName ? { ...ex, name: newName } : ex
            )
          };
        }
        return day;
      });
      return newProgramme;
    });

    // Update current session logs to keep data in sync
    setLogs(prev => {
      const dayLogs = prev[today] || {};
      const workoutLogs = dayLogs[currentDay.id];
      if (!workoutLogs || !workoutLogs[oldName]) return prev;

      const newWorkoutLogs = { ...workoutLogs };
      newWorkoutLogs[newName] = newWorkoutLogs[oldName];
      delete newWorkoutLogs[oldName];

      // Update exercise order if it exists
      if (newWorkoutLogs.exerciseOrder) {
        newWorkoutLogs.exerciseOrder = newWorkoutLogs.exerciseOrder.map((name: string) => 
          name === oldName ? newName : name
        );
      }

      return {
        ...prev,
        [today]: {
          ...dayLogs,
          [currentDay.id]: newWorkoutLogs
        }
      };
    });
    
    // Also update expandedExercise state if it was expanded
    if (expandedExercise === oldName) {
      setExpandedExercise(newName);
    }
  };

  const updateNotes = (notes: string) => {
    if (!currentDay) return;
    setLogs(prev => {
      const dayLogs = prev[today] || {};
      const workoutLogs = dayLogs[currentDay.id] || {};
      
      return {
        ...prev,
        [today]: {
          ...dayLogs,
          [currentDay.id]: {
            ...workoutLogs,
            notes
          }
        }
      };
    });
  };

  const updateExerciseNotes = (exerciseName: string, notes: string) => {
    if (!currentDay) return;
    const exercise = currentDay.exercises.find(e => e.name === exerciseName);
    setLogs(prev => {
      const dayLogs = prev[today] || {};
      const workoutLogs = dayLogs[currentDay.id] || {};
      const exerciseLog = workoutLogs[exerciseName] || {
        variation: getPreviousWorkoutData?.[exerciseName]?.variation || getAutoVariation(exerciseName, exercise?.options),
        sets: Array(programme.find(d => d.id === currentDay.id)?.exercises.find(e => e.name === exerciseName)?.sets || 0).fill(null).map(() => ({
          weight: '',
          reps: '',
          completed: false
        }))
      };
      
      return {
        ...prev,
        [today]: {
          ...dayLogs,
          [currentDay.id]: {
            ...workoutLogs,
            [exerciseName]: {
              ...exerciseLog,
              notes
            }
          }
        }
      };
    });
  };

  const getExerciseLog = (exerciseName: string) => {
    if (!currentDay) return undefined;
    return logs[today]?.[currentDay.id]?.[exerciseName];
  };

  const currentDayExercises = useMemo(() => {
    if (!currentDay) return [];
    const sessionOrder = logs[today]?.[currentDay.id]?.exerciseOrder;
    if (sessionOrder) {
      return sessionOrder
        .map(name => currentDay.exercises.find(ex => ex.name === name))
        .filter((ex): ex is Exercise => !!ex);
    }
    return currentDay.exercises;
  }, [logs, today, currentDay]);

  const workoutProgress = useMemo(() => {
    if (!currentDay) return 0;
    const dayLog = logs[today]?.[currentDay.id];
    
    let totalSets = 0;
    let completedSets = 0;
    
    currentDay.exercises.forEach(ex => {
      const exLog = dayLog?.[ex.name];
      const setsCount = exLog?.sets?.length ?? ex.sets;
      totalSets += setsCount;
      if (exLog) {
        completedSets += exLog.sets.filter((s: any) => s.completed).length;
      }
    });
    
    return totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  }, [logs, today, currentDay]);

  const getPreviousWorkoutData = useMemo(() => {
    if (!currentDay) return null;
    const sortedDates = Object.keys(logs)
      .filter(d => d < today)
      .sort((a, b) => b.localeCompare(a));
    
    const lastWorkoutDate = sortedDates.find(date => logs[date][currentDay.id]);
    if (lastWorkoutDate) {
      return logs[lastWorkoutDate][currentDay.id];
    }
    return null;
  }, [logs, today, currentDay.id]);

  const clearToday = () => {
    showConfirm(t('confirm'), t('confirmPurge'), () => {
      setLogs(prev => {
        const newLogs = { ...prev };
        delete newLogs[today];
        return newLogs;
      });
    });
  };

  const calculateTotalWeight = (workoutLog: WorkoutLog) => {
    let total = 0;
    Object.entries(workoutLog).forEach(([key, value]) => {
      if (key !== 'exerciseOrder' && value.sets) {
        value.sets.forEach((set: SetLog) => {
          if (set.completed && set.weight && set.reps) {
            total += parseFloat(set.weight) * parseFloat(set.reps);
          }
        });
      }
    });
    return total;
  };

  const getPreviousWorkoutWeight = (workoutId: string, beforeDate: string) => {
    const dates = Object.keys(logs).sort((a, b) => b.localeCompare(a));
    const previousDate = dates.find(d => d < beforeDate && logs[d][workoutId]);
    if (previousDate) {
      return calculateTotalWeight(logs[previousDate][workoutId]);
    }
    return null;
  };

  const updateProgramme = (newProgramme: WorkoutDay[]) => {
    setProgramme(newProgramme);
    // Ensure activeDayIndex is still valid
    if (activeDayIndex >= newProgramme.length) {
      setActiveDayIndex(0);
    }
  };

  const addNewExerciseToActiveDay = () => {
    if (!currentDay) return;
    const newExercise: Exercise = {
      name: `${t('newExercise')} ${currentDay.exercises.length + 1}`,
      sets: 3,
      reps: '10-12',
      options: [],
      bodyPart: 'upper'
    };
    
    const newProgramme = programme.map((day, idx) => {
      if (idx === activeDayIndex) {
        return {
          ...day,
          exercises: [...day.exercises, newExercise]
        };
      }
      return day;
    });
    
    setProgramme(newProgramme);
  };

  const chartData = useMemo(() => {
    const data = Object.entries(logs)
      .map(([date, workoutLogs]) => {
        let dailyVolume = 0;
        Object.values(workoutLogs).forEach(workoutLog => {
          if (typeof workoutLog === 'object' && workoutLog !== null) {
            dailyVolume += calculateTotalWeight(workoutLog as any);
          }
        });
        return {
          date,
          displayDate: format(parseISO(date), 'MMM d'),
          volume: dailyVolume
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // If we have data, add a few empty points at the start/end for better visualization if needed
    // or just return the data
    return data;
  }, [logs]);

  const cycleStatus = useMemo(() => {
    const status = programme.map(day => {
      const match = day.name.match(/^(.*?)\s*(\(.*\))$/);
      return {
        id: day.id,
        label: match ? match[1] : day.name,
        tracked: false
      };
    });

    // Get all workout events sorted by date ascending
    const allLogs = Object.entries(logs)
      .flatMap(([date, dayLogs]) => 
        Object.keys(dayLogs).map(workoutId => ({ date, workoutId }))
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    // Group into cycles: a cycle resets after all unique sessions in programme are completed
    let currentCycle = new Set<string>();
    for (const log of allLogs) {
      if (currentCycle.has(log.workoutId) || currentCycle.size === (programme.length || 1)) {
        currentCycle = new Set<string>();
      }
      currentCycle.add(log.workoutId);
    }

    return status.map(s => ({
      ...s,
      tracked: currentCycle.has(s.id)
    }));
  }, [logs, programme]);

  const cycleProgress = useMemo(() => {
    if (!programme.length) return 0;
    const trackedCount = cycleStatus.filter(s => s.tracked).length;
    return (trackedCount / programme.length) * 100;
  }, [cycleStatus, programme.length]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 rounded-2xl border border-white/50 shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
            {payload[0].payload.date}
          </p>
          <p className="text-lg font-display font-black text-accent">
            {payload[0].value.toLocaleString()} <span className="text-xs text-zinc-400">{settings.weightUnit}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const hasWorkoutOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return logs[dateStr] && Object.keys(logs[dateStr]).length > 0;
  };

  const addSet = (exercise: Exercise) => {
    const exerciseName = exercise.name;
    setLogs(prev => {
      const dayLogs = prev[today] || {};
      const workoutLogs = dayLogs[currentDay.id] || {};
      const exerciseLog = workoutLogs[exerciseName] || {
        variation: getPreviousWorkoutData?.[exerciseName]?.variation || getAutoVariation(exerciseName, exercise.options),
        sets: Array(exercise.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }))
      };

      return {
        ...prev,
        [today]: {
          ...dayLogs,
          [currentDay.id]: {
            ...workoutLogs,
            [exerciseName]: {
              ...exerciseLog,
              sets: [...exerciseLog.sets, { weight: '', reps: '', completed: false }]
            }
          }
        }
      };
    });
  };

  const removeSet = (exercise: Exercise, index?: number) => {
    const exerciseName = exercise.name;
    setLogs(prev => {
      const dayLogs = prev[today] || {};
      const workoutLogs = dayLogs[currentDay.id] || {};
      const exerciseLog = workoutLogs[exerciseName] || {
        variation: getPreviousWorkoutData?.[exerciseName]?.variation || getAutoVariation(exerciseName, exercise.options),
        sets: Array(exercise.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }))
      };

      if (exerciseLog.sets.length > 1) {
        const newSets = [...exerciseLog.sets];
        if (index !== undefined) {
          newSets.splice(index, 1);
        } else {
          newSets.pop();
        }

        return {
          ...prev,
          [today]: {
            ...dayLogs,
            [currentDay.id]: {
              ...workoutLogs,
              [exerciseName]: {
                ...exerciseLog,
                sets: newSets
              }
            }
          }
        };
      }

      return prev;
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finishWorkout = () => {
    if (programme.length === 0) return;
    setShowArchivedPopup(true);
    setTimeout(() => {
      setShowArchivedPopup(false);
      setActiveDayIndex(prev => (prev + 1) % programme.length);
      setActiveTab('workout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3000);
  };

  const deleteWorkout = (date: string, workoutId: string) => {
    setLogs(prev => {
      const newLogs = { ...prev };
      if (newLogs[date]) {
        const updatedDateLog = { ...newLogs[date] };
        delete updatedDateLog[workoutId];
        
        if (Object.keys(updatedDateLog).length === 0) {
          delete newLogs[date];
          setSelectedDate(null);
        } else {
          newLogs[date] = updatedDateLog;
        }
      }
      return newLogs;
    });
  };

  const getSessionLabel = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayLogs = logs[dateStr];
    if (!dayLogs) return null;
    const workoutId = Object.keys(dayLogs)[0];
    if (!workoutId) return null;
    
    const defaultLabels: Record<string, string> = {
      'push-1': 'Push 1',
      'pull-1': 'Pull 1',
      'legs-1': 'Leg 1',
      'push-2': 'Push 2',
      'pull-2': 'Pull 2',
      'legs-2': 'Leg 2'
    };
    
    if (defaultLabels[workoutId]) return defaultLabels[workoutId];
    
    let workout = programme.find(p => p.id === workoutId);
    if (!workout) {
      for (const tpl of savedTemplates) {
        workout = tpl.programme.find(p => p.id === workoutId);
        if (workout) break;
      }
    }
    
    if (!workout) return null;
    
    const name = workout.name;
    const match = name.match(/^(Push|Pull|Leg)s?\s*Day\s*(\d+)/i);
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    
    return name.split(' ').slice(0, 2).join(' ');
  };

  return (
    <div className="min-h-screen selection:bg-accent/30 font-sans text-[#1a1a1a] transition-colors duration-300">
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      <AnimatePresence>
        {showArchivedPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative w-[120px] h-[80px] flex items-center justify-center">
                <FolderIcon delay={0} tabPosition="center" text="REP" subtext="ARCHIVE" />
              </div>
              <h2 className="text-2xl font-display font-black text-[#1a1a1a] tracking-tighter uppercase">
                Workout Archived
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === 'workout' && (
          <motion.div
            key="workout"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`pb-40 transition-all duration-500 ${activeInput ? 'pb-[450px]' : ''}`}
          >
            {!currentDay ? (
              <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div className="glass-card p-8 rounded-3xl">
                  <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-4">{t('noProgrammeSelected')}</p>
                  <button 
                    onClick={() => setActiveTab('template')}
                    className="bg-accent text-white px-8 py-4 rounded-2xl font-display font-black uppercase tracking-widest"
                  >
                    {t('goToProgrammes')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
            <header className="px-6 py-8 flex justify-between items-center sticky top-0 bg-white/40 backdrop-blur-2xl z-20 border-b border-white/50 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-display font-extrabold tracking-tighter uppercase text-[#1a1a1a]">{t('repArchive')}</h1>
                </div>
                <p className="text-zinc-400 text-[9px] font-bold uppercase tracking-[0.3em] mt-0.5">
                  {new Date().toLocaleDateString(settings.language === 'en' ? 'en-US' : 'zh-TW', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSettings({ ...settings, language: settings.language === 'en' ? 'zh' : 'en' })}
                  className="glass-button w-12 h-12 rounded-2xl flex items-center justify-center relative"
                >
                  <div className="relative w-9 h-9">
                    <span className={`absolute bottom-1 right-1 text-[18px] font-black leading-none transition-all duration-300 ${settings.language === 'en' ? 'text-accent' : 'text-zinc-300'}`}>
                      A
                    </span>
                    <span className={`absolute top-1 left-1 text-[15px] font-black leading-none transition-all duration-300 ${settings.language === 'zh' ? 'text-accent' : 'text-zinc-400'}`}>
                      文
                    </span>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="glass-button p-3 rounded-2xl"
                >
                  <Settings className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Progress Bar moved inside sticky header */}
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-zinc-200 overflow-visible">
                {/* Trapezium Tab */}
                <motion.div 
                  className="absolute bottom-[-1px] overflow-visible"
                  initial={{ left: 0 }}
                  animate={{ left: `${workoutProgress}%` }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                  style={{ transform: 'translateX(-62px)' }}
                >
                  <svg width="64" height="24" viewBox="0 0 64 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M16 2 H48 C51 2 52 3 53 5 L61 21 C62 22 61 22 60 22 H4 C3 22 2 22 3 21 L11 5 C12 3 13 2 16 2 Z" 
                      fill="white" 
                      stroke="#a1a1aa" 
                      strokeWidth="0.9" 
                      strokeLinejoin="round"
                    />
                    <text 
                      x="32" 
                      y="13" 
                      textAnchor="middle" 
                      dominantBaseline="middle" 
                      className="text-[10px] font-black fill-[#a1a1aa] font-mono"
                    >
                      {Math.round(workoutProgress)}%
                    </text>
                  </svg>
                </motion.div>
                <motion.div 
                  className="h-full bg-black relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${workoutProgress}%` }}
                  transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                />
              </div>
            </header>

            {/* Workout Content */}
            <main className="p-6 max-w-2xl mx-auto">
              {/* Cycle Status Indicators (Programme Progress Bar) */}
              <div className="flex justify-between items-center px-2 mb-8 mt-4 bg-white/40 backdrop-blur-md rounded-3xl p-4 border border-white/60 shadow-sm">
                {cycleStatus.map((s, idx) => {
                  const isActive = idx === activeDayIndex;
                  const isTracked = s.tracked;
                  return (
                    <button 
                      key={s.id} 
                      onClick={() => setActiveDayIndex(idx)}
                      className="flex-1 flex flex-col items-center gap-2 group transition-all"
                    >
                      <motion.div 
                        initial={false}
                        animate={{ 
                          backgroundColor: isTracked || isActive ? '#000000' : '#9B9B9B',
                          scale: isTracked || isActive ? [1, 1.1, 1] : 1,
                          boxShadow: isTracked || isActive 
                            ? (isActive ? '0 0 12px rgba(15,15,15,0.4)' : '0 0 10px rgba(15,15,15,0.3)') 
                            : '0 0 10px rgba(155,155,155,0.1)'
                        }}
                        className={`w-2.5 h-2.5 rounded-full relative ${isActive ? 'animate-pulse' : ''}`}
                      >
                        {isActive && !isTracked && (
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-accent/20"
                            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                      <span className={`text-[7px] font-black uppercase tracking-tighter transition-colors text-center leading-tight px-0.5 ${isActive ? 'text-accent' : (isTracked ? 'text-[#1a1a1a]' : 'text-zinc-400')}`}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-end justify-between mb-12 mt-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('activeSession')}</span>
                  </div>
                  {(() => {
                    const match = currentDay.name.match(/^(.*?)\s*(\(.*\))$/);
                    const dayTitle = match ? match[1] : currentDay.name;
                    const dayFocus = match ? match[2] : '';
                    return (
                      <>
                        <h2 className="text-2xl font-display font-bold text-[#1a1a1a] tracking-tighter leading-tight text-left">{dayTitle}</h2>
                        {dayFocus && <p className="text-sm font-display font-semibold text-zinc-500 tracking-tight leading-none text-left">{dayFocus}</p>}
                      </>
                    );
                  })()}
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
                    onClick={() => setActiveDayIndex(prev => Math.min(programme.length - 1, prev + 1))} 
                    className="glass-button p-4 rounded-2xl disabled:opacity-20"
                    disabled={activeDayIndex === programme.length - 1}
                  >
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-5 mb-12 items-stretch">
                <div className="glass-card rounded-[2.5rem] py-[18px] px-6 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t('exercises')}</p>
                  <p className="text-2xl font-display font-black font-mono text-[#1a1a1a]">{currentDay.exercises.length}</p>
                </div>
                <div className="glass-card rounded-[2.5rem] py-[18px] px-6 flex flex-col items-center justify-center text-center">
                  <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-2 whitespace-nowrap">{t('totalSets')}</p>
                  <p className="text-2xl font-display font-black font-mono text-[#1a1a1a]">
                    {currentDay.exercises.reduce((acc, ex) => {
                      const exLog = logs[today]?.[currentDay.id]?.[ex.name];
                      return acc + (exLog?.sets.length || ex.sets);
                    }, 0)}
                  </p>
                </div>
                <div className="glass-card rounded-[2.5rem] py-[18px] px-6 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t('progress')}</p>
                  <p className="text-2xl font-display font-black font-mono text-accent">{Math.round(workoutProgress)}%</p>
                </div>
              </div>

              <Reorder.Group 
                axis="y" 
                values={currentDayExercises.map(ex => ex.name)} 
                onReorder={updateExerciseOrder}
                className="space-y-2"
              >
                {currentDayExercises.map((ex) => (
                  <ReorderableExercise 
                    key={ex.name}
                    ex={ex}
                    getExerciseLog={getExerciseLog}
                    getPreviousWorkoutData={getPreviousWorkoutData}
                    updateSet={updateSet}
                    updateVariation={updateVariation}
                    updateExerciseNotes={updateExerciseNotes}
                    renameExercise={renameExercise}
                    addSet={addSet}
                    removeSet={removeSet}
                    onOpenInput={(idx: number, field: 'weight' | 'reps', val: string, placeholder: string) => {
                      setActiveInput({
                        type: 'exercise',
                        exerciseName: ex.name,
                        setIndex: idx,
                        field,
                        value: val,
                        placeholder
                      });
                    }}
                    isExpanded={expandedExercise === ex.name}
                    onToggleExpand={() => setExpandedExercise(expandedExercise === ex.name ? null : ex.name)}
                    settings={settings}
                    t={t}
                  />
                ))}
              </Reorder.Group>

              <button 
                onClick={addNewExerciseToActiveDay}
                className="mt-6 w-full py-8 border-2 border-dashed border-accent/20 rounded-[2.5rem] text-accent/40 font-display font-black text-xs uppercase tracking-[0.3em] hover:bg-accent/5 hover:text-accent hover:border-accent/40 transition-all flex flex-col items-center gap-3"
              >
                <Plus className="w-6 h-6" />
                {t('addExercise')}
              </button>

              <div className="mt-12 glass-card rounded-[2.5rem] p-8 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-accent-soft rounded-xl">
                    <Target className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('sessionNotes')}</h3>
                </div>
                <textarea
                  value={logs[today]?.[currentDay.id]?.notes || ''}
                  onChange={(e) => updateNotes(e.target.value)}
                  placeholder={t('notesPlaceholder')}
                  className="w-full h-32 bg-transparent border-none outline-none text-sm font-display font-medium text-[#1a1a1a] placeholder:text-zinc-300 resize-none"
                />
              </div>

              <div className="mt-12">
                <button 
                  onClick={finishWorkout}
                  className="w-full py-6 bg-accent text-white font-display font-black uppercase tracking-[0.2em] rounded-3xl hover:opacity-90 transition-all active:scale-95 shadow-[0_15px_40px_rgba(15,15,15,0.3)] flex items-center justify-center gap-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  {t('finishSession')}
                </button>
              </div>

              <div className="flex gap-4 mt-12">
                <button 
                  onClick={scrollToTop}
                  className="flex-1 py-6 glass-button rounded-3xl text-accent font-display font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all"
                >
                  <ArrowUp className="w-4 h-4" />
                  Back to Top
                </button>
                <button 
                  onClick={clearToday}
                  className="flex-1 py-6 glass-button rounded-3xl border-danger/20 text-danger/40 font-display font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-danger/5 hover:text-danger transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Purge Data
                </button>
              </div>
            </main>
          </>
        )}
      </motion.div>
    )}

        {activeTab === 'template' && (
          <TemplateEditor 
            currentProgramme={programme}
            savedTemplates={savedTemplates}
            t={t}
            settings={settings}
            onApplyTemplate={(tpl) => {
              showConfirm(t('confirm'), t('confirmApplyTemplate'), () => {
                setProgramme(tpl.programme);
                setActiveDayIndex(0);
                setActiveTab('workout');
              });
            }}
            onShowConfirm={showConfirm}
            onSaveTemplate={(tpl) => {
              setSavedTemplates(prev => {
                const exists = prev.find(t => t.id === tpl.id);
                if (exists) {
                  return prev.map(t => t.id === tpl.id ? tpl : t);
                }
                return [...prev, tpl];
              });
            }}
            onDeleteTemplate={(id) => {
              setSavedTemplates(prev => prev.filter(t => t.id !== id));
            }}
          />
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-8 pb-40"
          >
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center">
                <h1 className="text-xl font-display font-black tracking-tighter uppercase text-[#1a1a1a]">{t('historyTitle')}</h1>
              </div>
              <div className="flex gap-2">
                {!selectedDate && (
                  <div className="flex glass-inset p-1 rounded-2xl">
                    <button 
                      onClick={() => setHistoryView('calendar')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyView === 'calendar' ? 'bg-white text-accent shadow-sm' : 'text-zinc-400'}`}
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setHistoryView('progress')}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${historyView === 'progress' ? 'bg-white text-accent shadow-sm' : 'text-zinc-400'}`}
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {selectedDate && (
                  <button 
                    onClick={() => setSelectedDate(null)}
                    className="glass-button p-3 rounded-2xl text-accent"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              {!selectedDate ? (
                historyView === 'calendar' ? (
                  <motion.div
                    key="calendar"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="glass-card rounded-[2.5rem] p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="font-display font-black text-[#1a1a1a] uppercase tracking-tighter text-xl">
                          {format(currentMonth, 'MMMM yyyy')}
                        </h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="glass-button p-2 rounded-xl"
                          >
                            <ChevronLeft className="w-5 h-5 text-zinc-400" />
                          </button>
                          <button 
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="glass-button p-2 rounded-xl"
                          >
                            <ChevronRight className="w-5 h-5 text-zinc-400" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-widest py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-2">
                        {daysInMonth.map((day, i) => {
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const hasWorkout = hasWorkoutOnDate(day);
                          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                          const isTodayDate = isToday(day);

                          return (
                            <button
                              key={i}
                              onClick={() => hasWorkout && setSelectedDate(dateStr)}
                              disabled={!hasWorkout && isCurrentMonth}
                              className={`
                                aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative
                                ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : ''}
                                ${hasWorkout ? 'glass-button text-accent hover:scale-105 active:scale-95' : 'text-zinc-300'}
                                ${isTodayDate ? 'ring-2 ring-accent ring-offset-4 ring-offset-[#f5f5f5]' : ''}
                              `}
                            >
                              <span className="text-xs font-black font-mono">{format(day, 'd')}</span>
                              {hasWorkout && (
                                <div className="flex flex-col items-center gap-0.5">
                                  <div className="w-1 h-1 rounded-full bg-accent" />
                                  <span className="text-[6px] font-bold text-accent uppercase tracking-tighter whitespace-nowrap overflow-hidden max-w-full px-1">
                                    {getSessionLabel(day)}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div className="glass-card rounded-[2.5rem] p-8">
                      <div className="mb-8">
                        <h3 className="font-display font-black text-[#1a1a1a] uppercase tracking-tighter text-xl mb-2">
                          {t('volumeProgress')}
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          {t('totalWeightLifted')} ({settings.weightUnit})
                        </p>
                      </div>

                      <div className="h-[300px] w-full select-none" onContextMenu={(e) => e.preventDefault()}>
                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0F0F0F" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#0F0F0F" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                              <XAxis 
                                dataKey="displayDate" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                dy={10}
                              />
                              <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                              />
                              <Tooltip content={<CustomTooltip />} />
                              <Area 
                                type="monotone" 
                                dataKey="volume" 
                                stroke="#0F0F0F" 
                                strokeWidth={4}
                                fillOpacity={1} 
                                fill="url(#colorVolume)" 
                                animationDuration={1500}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                            <TrendingUp className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest">{t('insufficientData')}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t('avgVolume')}</p>
                        <p className="text-2xl font-display font-black text-[#1a1a1a]">
                          {chartData.length > 0 
                            ? Math.round(chartData.reduce((acc, curr) => acc + curr.volume, 0) / chartData.length).toLocaleString()
                            : 0}
                          <span className="text-xs text-zinc-400 ml-1">{settings.weightUnit}</span>
                        </p>
                      </div>
                      <div className="glass-card rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{t('maxVolume')}</p>
                        <p className="text-2xl font-display font-black text-accent">
                          {chartData.length > 0 
                            ? Math.max(...chartData.map(d => d.volume)).toLocaleString()
                            : 0}
                          <span className="text-xs text-zinc-400 ml-1">{settings.weightUnit}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {logs[selectedDate] ? (
                    Object.entries(logs[selectedDate]).map(([workoutId, workoutLog]: [string, any]) => {
                      const totalWeight = calculateTotalWeight(workoutLog);
                      const prevWeight = getPreviousWorkoutWeight(workoutId, selectedDate);
                      const diff = prevWeight !== null ? totalWeight - prevWeight : null;
                      const workoutName = programme.find(p => p.id === workoutId)?.name || t('unknownWorkout');

                      return (
                        <div key={workoutId} className="relative overflow-hidden rounded-[2.5rem]">
                          {/* Delete Action (Behind) */}
                          <div className="absolute inset-y-0 right-0 w-32 bg-danger rounded-r-[2.5rem] flex justify-end">
                            <button 
                              onClick={() => deleteWorkout(selectedDate!, workoutId)}
                              className="w-20 h-full flex flex-col items-center justify-center text-white gap-1"
                            >
                              <Trash2 className="w-5 h-5" />
                              <span className="text-[8px] font-black uppercase tracking-widest">{t('delete')}</span>
                            </button>
                          </div>

                          <motion.div 
                            drag="x"
                            dragConstraints={{ left: -80, right: 0 }}
                            dragElastic={0.1}
                            className="glass-card rounded-[2.5rem] p-8 relative z-10 bg-[#f5f5f5]"
                          >
                            <div className="mb-8">
                              {(() => {
                                const match = workoutName.match(/^(.*?)\s*(\(.*\))$/);
                                const title = match ? match[1] : workoutName;
                                const focus = match ? match[2] : '';
                                return (
                                  <>
                                    <h3 className="font-display font-black text-accent uppercase tracking-tighter text-2xl leading-tight text-left">
                                      {title}
                                    </h3>
                                    {focus && <p className="text-sm font-display font-semibold text-zinc-500 tracking-tight leading-none text-left mt-1">{focus}</p>}
                                  </>
                                );
                              })()}
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-4">
                                {format(parseISO(selectedDate), 'EEEE, MMMM do')}
                              </p>
                            </div>

                            <div className="space-y-6">
                              {Object.entries(workoutLog)
                                .filter(([key]) => key !== 'exerciseOrder' && key !== 'notes')
                                .map(([exName, exLog]: [string, any]) => (
                                  <div key={exName} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-xs font-black text-[#1a1a1a] uppercase tracking-widest">{exName}</h4>
                                      {exLog.variation && (
                                        <span className="text-[8px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                          {exLog.variation}
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                      {exLog.sets.map((set: SetLog, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between glass-inset p-4 rounded-2xl">
                                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Set {idx + 1}</span>
                                          <div className="flex gap-4">
                                            {set.seconds ? (
                                              <span className="text-xs font-black font-mono text-[#1a1a1a]">{set.seconds}</span>
                                            ) : (
                                              <>
                                                <span className="text-xs font-black font-mono text-[#1a1a1a]">{set.weight || '0'} {settings.weightUnit}</span>
                                                <span className="text-xs font-black font-mono text-zinc-400">×</span>
                                                <span className="text-xs font-black font-mono text-[#1a1a1a]">{set.reps || '0'} reps</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                            </div>

                            {workoutLog.notes && (
                              <div className="mt-12 pt-8 border-t border-black/5">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="p-2 bg-accent-soft rounded-xl">
                                    <Target className="w-4 h-4 text-accent" />
                                  </div>
                                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Session Notes</h3>
                                </div>
                                <p className="text-sm font-display font-medium text-[#1a1a1a] leading-relaxed whitespace-pre-wrap text-left">
                                  {workoutLog.notes}
                                </p>
                              </div>
                            )}

                            <div className="mt-12 pt-8 border-t border-black/5 flex flex-col items-center gap-4">
                              <div className="text-center">
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-2">Total Volume</p>
                                <p className="text-4xl font-display font-black text-[#1a1a1a]">{totalWeight.toLocaleString()} <span className="text-lg text-zinc-400">{settings.weightUnit}</span></p>
                              </div>
                              
                              {diff !== null && (
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-display font-black text-[10px] uppercase tracking-widest ${diff >= 0 ? 'bg-accent-soft text-accent' : 'bg-danger/10 text-danger'}`}>
                                  {diff >= 0 ? '+' : ''}{diff.toLocaleString()} {settings.weightUnit}
                                  <span className="opacity-50">vs previous</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-40 text-zinc-300">
                      <Target className="w-20 h-20 mx-auto mb-6 opacity-20" />
                      <p className="font-display font-bold uppercase tracking-[0.3em] text-[10px]">No data for this date</p>
                    </div>
                  )}

                  <div className="mt-12">
                    <button 
                      onClick={scrollToTop}
                      className="w-full py-6 glass-button rounded-3xl text-accent font-display font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all"
                    >
                      <ArrowUp className="w-4 h-4" />
                      Back to Top
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            <div className="flex items-center mb-12">
              <h1 className="text-xl font-display font-black tracking-tighter uppercase text-[#1a1a1a]">{t('settings')}</h1>
            </div>

            <div className="space-y-10">
              <div className="bg-accent rounded-3xl p-6 flex justify-between items-center shadow-[0_15px_40px_rgba(15,15,15,0.3)]">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">{t('bodyWeight')}</span>
                <button 
                  onClick={() => setActiveInput({
                    type: 'settings',
                    field: 'bodyWeight',
                    value: settings.bodyWeight?.toString() || '',
                    placeholder: '70'
                  })}
                  className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-display font-black font-mono px-4 py-2 rounded-xl outline-none active:scale-95 transition-all"
                >
                  {settings.bodyWeight} {settings.weightUnit}
                </button>
              </div>

              <section>
                <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em] mb-6">{t('systemConfig')}</h3>
                <div className="space-y-4">
                  <div className="glass-card rounded-3xl p-6 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{t('upperBodyRest')}</span>
                    <select 
                      value={settings.restIntervalUpper}
                      onChange={(e) => setSettings({ ...settings, restIntervalUpper: parseInt(e.target.value) })}
                      className="glass-button text-accent font-display font-black font-mono px-4 py-2 rounded-xl outline-none"
                    >
                      {[30, 45, 60, 75, 90, 105, 120].map(s => (
                        <option key={s} value={s}>{s}s</option>
                      ))}
                    </select>
                  </div>
                  <div className="glass-card rounded-3xl p-6 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{t('lowerBodyRest')}</span>
                    <select 
                      value={settings.restIntervalLower}
                      onChange={(e) => setSettings({ ...settings, restIntervalLower: parseInt(e.target.value) })}
                      className="glass-button text-accent font-display font-black font-mono px-4 py-2 rounded-xl outline-none"
                    >
                      {[60, 75, 90, 105, 120, 135, 150, 180].map(s => (
                        <option key={s} value={s}>{s}s</option>
                      ))}
                    </select>
                  </div>
                  <div className="glass-card rounded-3xl p-6 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{t('weightUnit')}</span>
                    <select 
                      value={settings.weightUnit}
                      onChange={(e) => setSettings({ ...settings, weightUnit: e.target.value })}
                      className="glass-button text-accent font-display font-black font-mono px-4 py-2 rounded-xl outline-none uppercase"
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                  <div className="glass-card rounded-3xl p-6 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">{t('language')}</span>
                    <select 
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="glass-button text-accent font-display font-black px-4 py-2 rounded-xl outline-none"
                    >
                      <option value="en">English</option>
                      <option value="zh">繁體中文</option>
                    </select>
                  </div>
                </div>
              </section>

              <button 
                onClick={() => {
                  showConfirm(t('confirm'), t('confirmExport'), () => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs));
                    const downloadAnchorNode = document.createElement('a');
                    downloadAnchorNode.setAttribute("href", dataStr);
                    downloadAnchorNode.setAttribute("download", "ppl_pro_backup.json");
                    document.body.appendChild(downloadAnchorNode);
                    downloadAnchorNode.click();
                    downloadAnchorNode.remove();
                  });
                }}
                className="w-full py-6 glass-button text-accent font-display font-black uppercase tracking-[0.2em] rounded-3xl transition-all active:scale-95"
              >
                {t('exportBackup')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden silent audio for MediaSession */}
      <audio ref={audioRef} loop src="data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=" />

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="relative w-full pointer-events-auto h-[80px]">
          {/* SVG Background with dynamic dip */}
          <svg 
            width="100%" 
            height="80" 
            viewBox="0 0 400 80" 
            className="absolute top-0 left-0 drop-shadow-[0_-10px_30px_rgba(0,0,0,0.1)]"
            preserveAspectRatio="none"
          >
            <motion.path 
              animate={{ 
                d: `M 0 25 
                   L ${activeIndex * 100 + 50 - 55} 25 
                   C ${activeIndex * 100 + 50 - 35} 25 ${activeIndex * 100 + 50 - 30} 0 ${activeIndex * 100 + 50} 0 
                   C ${activeIndex * 100 + 50 + 30} 0 ${activeIndex * 100 + 50 + 35} 25 ${activeIndex * 100 + 50 + 55} 25 
                   L 400 25 
                   L 400 80 
                   L 0 80 
                   Z` 
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              fill="rgba(15, 15, 15, 0.9)"
              className="backdrop-blur-xl"
            />
          </svg>

          {/* Active Circle Indicator */}
          <motion.div 
            animate={{ 
              left: `${activeIndex * 25 + 12.5}%`,
              y: -10
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-10 -translate-x-1/2"
          >
            {(() => {
              const ActiveIcon = tabs[activeIndex].icon;
              return <ActiveIcon className="w-6 h-6 text-[#0F0F0F]" />;
            })()}
          </motion.div>

          {/* Navigation Buttons */}
          <nav className="relative flex justify-around items-center h-full pt-4">
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex flex-col items-center justify-center w-1/4 h-full"
                >
                  {/* Inactive Icon */}
                  <motion.div
                    animate={{ 
                      opacity: isActive ? 0 : 1,
                      y: isActive ? 20 : 0
                    }}
                    className="text-white/40"
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>

                  {/* Active Label */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 text-[8px] font-black uppercase tracking-[0.2em] text-white"
                      >
                        {tab.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

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
                <div className="bg-accent-soft p-3 rounded-2xl">
                  <Timer className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Rest Protocol</p>
                  <p className="text-3xl font-display font-black font-mono leading-none mt-1 text-[#1a1a1a]">
                    {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (timerActive) {
                      setTimerActive(false);
                      setTimerEndTime(null);
                    } else {
                      const remaining = timerSeconds || initialTimerSeconds;
                      setTimerEndTime(Date.now() + remaining * 1000);
                      setTimerActive(true);
                    }
                  }}
                  className="w-7 h-7 glass-button rounded-lg flex items-center justify-center"
                >
                  {timerActive ? <Pause className="w-3 h-3 text-zinc-400" /> : <Play className="w-3 h-3 text-zinc-400" />}
                </button>
                <button 
                  onClick={() => {
                    setTimerSeconds(initialTimerSeconds);
                    setTimerEndTime(Date.now() + initialTimerSeconds * 1000);
                    setTimerActive(true);
                  }}
                  className="w-7 h-7 glass-button rounded-lg flex items-center justify-center"
                >
                  <RotateCcw className="w-3 h-3 text-zinc-400" />
                </button>
                <button 
                  onClick={() => {
                    setTimerSeconds(null);
                    setTimerActive(false);
                    setTimerEndTime(null);
                  }}
                  className="w-7 h-7 glass-button rounded-lg flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-zinc-400" />
                </button>
              </div>
            </div>
            {/* Progress Bar in Timer */}
            <div className="absolute bottom-0 left-8 right-8 h-1 bg-accent-soft rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent/30"
                initial={{ width: '100%' }}
                animate={{ width: `${(timerSeconds / initialTimerSeconds) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeInput && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveInput(null)}
              className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[55]"
            />
            <NumberPad 
              value={activeInput.value}
              placeholder={activeInput.placeholder}
              onUpdate={(val: string) => setActiveInput({ ...activeInput, value: val })}
              onDone={() => {
                if (activeInput.type === 'exercise') {
                  const exercise = currentDay?.exercises.find(e => e.name === activeInput.exerciseName);
                  if (exercise) {
                    const finalValue = activeInput.value || activeInput.placeholder;
                    updateSet(exercise, activeInput.setIndex!, activeInput.field as 'weight' | 'reps', finalValue);
                  }
                } else if (activeInput.type === 'settings') {
                  const finalValue = activeInput.value || activeInput.placeholder;
                  setSettings({ ...settings, bodyWeight: parseFloat(finalValue) || 0 });
                }
                setActiveInput(null);
              }}
            />
          </>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        t={t}
      />
    </div>
  );
}

function TemplateEditor({ 
  currentProgramme, 
  savedTemplates, 
  onApplyTemplate, 
  onSaveTemplate, 
  onDeleteTemplate,
  onShowConfirm,
  t,
  settings
}: { 
  currentProgramme: WorkoutDay[], 
  savedTemplates: SavedTemplate[], 
  onApplyTemplate: (tpl: SavedTemplate) => void, 
  onSaveTemplate: (tpl: SavedTemplate) => void, 
  onDeleteTemplate: (id: string) => void,
  onShowConfirm?: (title: string, message: string, onConfirm: () => void) => void,
  t: (key: string) => string,
  settings: any
}) {
  const [view, setView] = useState<'summary' | 'edit'>('summary');
  const [editingTemplate, setEditingTemplate] = useState<SavedTemplate | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDay = (id: string) => {
    const newSet = new Set(expandedDays);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedDays(newSet);
  };

  const handleExport = (tpl: SavedTemplate) => {
    const data = JSON.stringify(tpl, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tpl.name.replace(/\s+/g, '_')}_template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const tpl = JSON.parse(event.target?.result as string);
        if (tpl.name && tpl.programme && Array.isArray(tpl.programme)) {
          const newTpl = { ...tpl, id: `tpl-${Date.now()}`, isDefault: false };
          onSaveTemplate(newTpl);
        } else {
          alert('Invalid template file format.');
        }
      } catch (err) {
        alert('Error parsing template file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startNewTemplate = () => {
    const newTpl: SavedTemplate = {
      id: `tpl-${Date.now()}`,
      name: t('newCustomProgramme'),
      programme: [
        { id: `day-${Date.now()}-1`, name: t('pushDay'), exercises: [] },
        { id: `day-${Date.now()}-2`, name: t('pullDay'), exercises: [] },
        { id: `day-${Date.now()}-3`, name: t('legDay'), exercises: [] }
      ]
    };
    setEditingTemplate(newTpl);
    setView('edit');
  };

  const editExisting = (tpl: SavedTemplate) => {
    setEditingTemplate(JSON.parse(JSON.stringify(tpl))); // Deep clone
    setView('edit');
  };

  const handleUpdateDayName = (dayIdx: number, name: string) => {
    if (!editingTemplate) return;
    const newProgramme = [...editingTemplate.programme];
    newProgramme[dayIdx] = { ...newProgramme[dayIdx], name };
    setEditingTemplate({ ...editingTemplate, programme: newProgramme });
  };

  const handleUpdateExercise = (dayIdx: number, exIdx: number, field: keyof Exercise, value: any) => {
    if (!editingTemplate) return;
    const newProgramme = [...editingTemplate.programme];
    const newExercises = [...newProgramme[dayIdx].exercises];
    newExercises[exIdx] = { ...newExercises[exIdx], [field]: value };
    newProgramme[dayIdx] = { ...newProgramme[dayIdx], exercises: newExercises };
    setEditingTemplate({ ...editingTemplate, programme: newProgramme });
  };

  const handleAddExercise = (dayIdx: number) => {
    if (!editingTemplate) return;
    const newProgramme = [...editingTemplate.programme];
    const newExercises = [...newProgramme[dayIdx].exercises, { name: t('newExercise'), sets: 3, reps: '10-12', options: [], bodyPart: 'upper' }];
    newProgramme[dayIdx] = { ...newProgramme[dayIdx], exercises: newExercises };
    setEditingTemplate({ ...editingTemplate, programme: newProgramme });
  };

  const handleRemoveExercise = (dayIdx: number, exIdx: number) => {
    if (!editingTemplate) return;
    const newProgramme = [...editingTemplate.programme];
    const newExercises = newProgramme[dayIdx].exercises.filter((_, i) => i !== exIdx);
    newProgramme[dayIdx] = { ...newProgramme[dayIdx], exercises: newExercises };
    setEditingTemplate({ ...editingTemplate, programme: newProgramme });
  };

  const handleAddDay = () => {
    if (!editingTemplate) return;
    if (editingTemplate.programme.length < 6) {
      const newDay: WorkoutDay = {
        id: `custom-${Date.now()}`,
        name: settings.language === 'en' ? `Day ${editingTemplate.programme.length + 1}` : `第 ${editingTemplate.programme.length + 1} 天`,
        exercises: []
      };
      setEditingTemplate({ ...editingTemplate, programme: [...editingTemplate.programme, newDay] });
    }
  };

  const handleRemoveDay = (dayIdx: number) => {
    if (!editingTemplate) return;
    setEditingTemplate({ ...editingTemplate, programme: editingTemplate.programme.filter((_, i) => i !== dayIdx) });
  };

  const handleExportCurrentProgramme = () => {
    const newTpl: SavedTemplate = {
      id: `exported-${Date.now()}`,
      name: `${t('programme')} (Exported ${format(new Date(), 'MMM d, HH:mm')})`,
      programme: JSON.parse(JSON.stringify(currentProgramme)),
      pinned: false,
      isDefault: false
    };
    onSaveTemplate(newTpl);
    setShowAddMenu(false);
  };

  if (view === 'summary') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="px-4 py-8 pb-40 max-w-2xl mx-auto overflow-x-hidden"
      >
        <div className="flex items-center justify-between mb-12 gap-4">
          <div className="flex items-center">
            <h1 className="text-xl font-display font-black tracking-tighter uppercase text-[#1a1a1a]">{t('programmes')}</h1>
          </div>
          <div className="flex gap-2 shrink-0 relative" ref={addMenuRef}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImport} 
              accept=".json" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="glass-button p-3 rounded-2xl text-accent active:scale-95 transition-all"
            >
              <Download className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="bg-accent text-white p-3 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center"
            >
              <Plus className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 py-2 z-[100] overflow-hidden"
                >
                  <button
                    onClick={() => {
                      startNewTemplate();
                      setShowAddMenu(false);
                    }}
                    className="w-full px-6 py-4 flex items-center gap-3 text-sm font-display font-medium uppercase tracking-wider text-[#1a1a1a] hover:bg-black/5 active:bg-black/10 transition-colors text-left"
                  >
                    <Plus className="w-4 h-4 text-accent" />
                    <span>{t('createProgramme') || "Create Programme"}</span>
                  </button>
                  <div className="h-px bg-black/5 mx-4" />
                  <button
                    onClick={handleExportCurrentProgramme}
                    className="w-full px-6 py-4 flex items-center gap-3 text-sm font-display font-medium uppercase tracking-wider text-[#1a1a1a] hover:bg-black/5 active:bg-black/10 transition-colors text-left"
                  >
                    <Upload className="w-4 h-4 text-accent" />
                    <span>{t('exportCurrentProgramme') || "Export Current Programme"}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-6">
          {savedTemplates.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return 0;
          }).map((tpl) => (
            <div key={tpl.id} className="relative overflow-hidden rounded-[2.5rem]">
              {/* Actions (Behind) */}
              {!tpl.isDefault && (
                <div className="absolute inset-y-0 right-0 w-32 rounded-r-[2.5rem] flex flex-col overflow-hidden">
                  <button 
                    onClick={() => {
                      onSaveTemplate({ ...tpl, pinned: !tpl.pinned });
                    }}
                    className="flex-1 w-full flex flex-col items-center justify-center text-white bg-accent border-b border-white/10"
                  >
                    <Pin className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">{tpl.pinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                  <button 
                    onClick={() => handleExport(tpl)}
                    className="flex-1 w-full flex flex-col items-center justify-center text-white bg-zinc-800 border-b border-white/10"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Export</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (onShowConfirm) {
                        onShowConfirm(t('confirm'), t('confirmDeleteTemplate'), () => onDeleteTemplate(tpl.id));
                      } else if (confirm(t('confirmDeleteTemplate'))) {
                        onDeleteTemplate(tpl.id);
                      }
                    }}
                    className="flex-1 w-full flex flex-col items-center justify-center text-white bg-danger"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Delete</span>
                  </button>
                </div>
              )}

              <motion.div 
                drag={!tpl.isDefault ? "x" : false}
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={0.1}
                className="glass-card rounded-[2.5rem] p-8 space-y-6 relative z-10 bg-[#f5f5f5]"
              >
                {(tpl.isDefault || tpl.pinned) && (
                  <div className="absolute top-0 right-0 bg-accent text-white pl-4 pr-5 py-1.5 rounded-bl-2xl text-[8px] font-black uppercase tracking-[0.2em] flex items-center justify-center">
                    {t('pinned')}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-display font-black text-[#1a1a1a] uppercase tracking-tighter mb-2">
                    {tpl.name}
                  </h3>
                  <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                    {tpl.programme?.length || 0} {t('days')} • {tpl.programme?.reduce((acc, d) => acc + d.exercises.length, 0) || 0} {t('exercises')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => onApplyTemplate(tpl)}
                    className="flex-1 py-4 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                  >
                    {t('apply')}
                  </button>
                  <button 
                    onClick={() => editExisting(tpl)}
                    className="flex-1 py-4 glass-button rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1a1a1a] active:scale-95 transition-all"
                  >
                    {t('edit')}
                  </button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-8 pb-40 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('summary')}
            className="glass-button p-3 rounded-2xl"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => editingTemplate && handleExport(editingTemplate)}
            className="glass-button px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-accent active:scale-95 transition-all flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {t('export')}
          </button>
          <button 
            onClick={() => {
              if (editingTemplate) {
                onSaveTemplate(editingTemplate);
                setView('summary');
              }
            }}
            className="bg-accent text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
          >
            {t('save')}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass-inset p-6 rounded-3xl space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('programmeName')}</p>
          <input 
            value={editingTemplate?.name || ''}
            onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
            className="w-full bg-white/50 border border-zinc-200 rounded-2xl p-4 text-[15px] font-display font-bold text-[#1a1a1a] outline-none focus:border-accent transition-all"
            placeholder={t('programmeName')}
          />
        </div>

        <div className="space-y-4">
          {editingTemplate?.programme.map((day, dayIdx) => (
            <div key={day.id} className="relative overflow-hidden rounded-[2.5rem]">
              {/* Delete Action (Behind) */}
              <div className="absolute inset-y-0 right-0 w-32 bg-danger rounded-r-[2.5rem] flex justify-end">
                <button 
                  onClick={() => handleRemoveDay(dayIdx)}
                  className="w-20 h-full flex flex-col items-center justify-center text-white gap-1"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Delete</span>
                </button>
              </div>

              <motion.div 
                drag="x"
                dragConstraints={{ left: -80, right: 0 }}
                dragElastic={0.1}
                className="glass-card rounded-[2.5rem] overflow-hidden relative z-10 bg-[#f5f5f5]"
              >
                <button 
                  onClick={() => toggleDay(day.id)}
                  className="w-full p-8 flex items-center justify-between hover:bg-black/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <h3 className="text-[15px] font-display font-bold text-[#1a1a1a] uppercase tracking-tight">{day.name}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{day.exercises.length} {t('exercises')}</span>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${expandedDays.has(day.id) ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {expandedDays.has(day.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-8 pt-0 space-y-8">
                        <div className="h-px bg-zinc-100" />
                        
                        <div className="space-y-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">{t('sessionTitle')}</p>
                          <div className="bg-white/50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                            <input 
                              value={day.name}
                              onChange={(e) => handleUpdateDayName(dayIdx, e.target.value)}
                              className="bg-transparent border-none outline-none text-[13px] font-display font-bold text-accent uppercase tracking-widest w-full"
                            />
                          </div>
                        </div>

                      <div className="space-y-6">
                        {day.exercises.map((ex, exIdx) => (
                          <div key={exIdx} className="glass-inset p-6 rounded-3xl space-y-6 border border-zinc-100">
                            <div className="space-y-3">
                              <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('exerciseName')}</p>
                              <div className="bg-white/80 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                                <input 
                                  value={ex.name}
                                  onChange={(e) => handleUpdateExercise(dayIdx, exIdx, 'name', e.target.value)}
                                  className="bg-transparent border-none outline-none text-[13px] font-display font-bold text-[#1a1a1a] uppercase tracking-widest w-full"
                                  placeholder={t('exerciseName')}
                                />
                                <button 
                                  onClick={() => handleRemoveExercise(dayIdx, exIdx)}
                                  className="text-zinc-300 hover:text-danger transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('sets')}</p>
                                <div className="bg-white/80 border border-zinc-200 rounded-2xl p-4">
                                  <input 
                                    type="number"
                                    value={ex.sets}
                                    onChange={(e) => handleUpdateExercise(dayIdx, exIdx, 'sets', parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent border-none outline-none text-xs font-display font-black text-[#1a1a1a]"
                                  />
                                </div>
                              </div>
                              <div className="space-y-3">
                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{t('targetReps')}</p>
                                <div className="bg-white/80 border border-zinc-200 rounded-2xl p-4">
                                  <input 
                                    value={ex.reps}
                                    onChange={(e) => handleUpdateExercise(dayIdx, exIdx, 'reps', e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-xs font-display font-black text-[#1a1a1a]"
                                    placeholder="e.g. 8-12"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={() => handleAddExercise(dayIdx)}
                          className="w-full py-5 border-2 border-dashed border-zinc-200 rounded-3xl text-zinc-400 font-display font-black text-[10px] uppercase tracking-widest hover:border-accent/30 hover:text-accent transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {t('addExercise')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        ))}

          {editingTemplate && editingTemplate.programme.length < 6 && (
            <button 
              onClick={handleAddDay}
              className="w-full py-8 border-2 border-dashed border-accent/20 rounded-[2.5rem] text-accent/40 font-display font-black text-xs uppercase tracking-[0.3em] hover:bg-accent/5 hover:text-accent hover:border-accent/40 transition-all flex flex-col items-center gap-3"
            >
              <Plus className="w-6 h-6" />
              {t('addTrainingDay')}
            </button>
          )}

          <div className="pt-8">
            <button 
              onClick={() => {
                if (editingTemplate) {
                  onSaveTemplate(editingTemplate);
                  setView('summary');
                }
              }}
              className="w-full py-6 bg-accent text-white rounded-[2.5rem] font-display font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-accent/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <Save className="w-5 h-5" />
              {t('save')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NumberPad({ value, onUpdate, onDone, placeholder }: any) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
  
  const handleKey = (key: string) => {
    if (key === '⌫') {
      onUpdate(value.slice(0, -1));
    } else if (key === '.') {
      if (!value.includes('.')) onUpdate(value + key);
    } else {
      if (value.length < 6) onUpdate(value + key);
    }
  };

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-2xl border-t border-white/50 p-6 pb-10 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
    >
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="text-left">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1">Target Value</p>
            <div className="flex items-baseline gap-1">
              <p className="text-4xl font-display font-black font-mono text-[#1a1a1a]">
                {value || <span className="text-zinc-400">{placeholder}</span>}
              </p>
            </div>
          </div>
          <button 
            onClick={onDone}
            className="bg-accent text-white px-10 py-4 rounded-2xl font-display font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(15,15,15,0.2)] active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {keys.map(key => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="h-14 glass-button rounded-xl text-lg font-display font-black text-[#1a1a1a] active:bg-accent active:text-white transition-all flex items-center justify-center"
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface ExerciseCardProps {
  key?: string | number;
  exercise: any;
  log?: {
    variation: string;
    sets: SetLog[];
    notes?: string;
  };
  prevLog?: {
    variation: string;
    sets: SetLog[];
    notes?: string;
  };
  onUpdateSet: (idx: number, field: keyof SetLog, val: any) => void;
  onUpdateVariation: (val: string) => void;
  onUpdateNotes: (val: string) => void;
  onRenameExercise: (newName: string) => void;
  onAddSet: () => void;
  onRemoveSet: (idx?: number) => void;
  dragControls: any;
  onOpenInput: (idx: number, field: 'weight' | 'reps', val: string, placeholder: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  settings: any;
  t: any;
}

function ExerciseCard({ 
  exercise, 
  log, 
  prevLog,
  onUpdateSet, 
  onUpdateVariation,
  onUpdateNotes,
  onRenameExercise,
  onAddSet,
  onRemoveSet,
  dragControls,
  onOpenInput,
  isExpanded,
  onToggleExpand,
  settings,
  t
}: ExerciseCardProps) {
  const isStretch = exercise.name.toLowerCase().includes('stretch') || exercise.name.includes('單腳站立');
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(exercise.name);

  // Update newName if exercise.name changes from outside
  useEffect(() => {
    setNewName(exercise.name);
  }, [exercise.name]);

  useEffect(() => {
    let interval: any;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const variation = log?.variation || prevLog?.variation || getAutoVariation(exercise.name, exercise.options);
  const sets = log?.sets || Array(exercise.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }));

  const completedCount = sets.filter(s => s.completed).length;
  const isFullyCompleted = completedCount === sets.length;

  return (
    <motion.div 
      layout
      className={`glass-card rounded-[2.5rem] overflow-hidden transition-all duration-500 ${
        isFullyCompleted ? 'ring-2 ring-accent/20' : ''
      }`}
    >
      {/* Accordion Header */}
      <div className="flex items-center glass-button !rounded-[2.5rem] !border-none hover:bg-white/20 transition-colors">
        <div 
          className="pl-6 cursor-grab active:cursor-grabbing text-zinc-300 touch-none"
          onPointerDown={(e) => {
            const startX = e.clientX;
            const startY = e.clientY;
            const timer = setTimeout(() => {
              dragControls.start(e);
            }, 500);
            
            const onPointerMove = (moveEvent: PointerEvent) => {
              if (Math.abs(moveEvent.clientX - startX) > 10 || Math.abs(moveEvent.clientY - startY) > 10) {
                clearTimeout(timer);
                window.removeEventListener('pointermove', onPointerMove);
              }
            };
            
            const onPointerUp = () => {
              clearTimeout(timer);
              window.removeEventListener('pointermove', onPointerMove);
              window.removeEventListener('pointerup', onPointerUp);
            };
            
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
          }}
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div 
          onClick={onToggleExpand}
          className="flex-1 text-left p-8 pl-4 pr-6 flex justify-between items-stretch cursor-pointer transition-all active:bg-white/5"
        >
          <div className="flex-1 flex flex-col justify-between py-1">
            <div className="flex items-center gap-3 pr-4 h-[40px]">
              {isEditingName ? (
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onRenameExercise(newName);
                      setIsEditingName(false);
                    }
                    if (e.key === 'Escape') {
                      setNewName(exercise.name);
                      setIsEditingName(false);
                    }
                  }}
                  className="w-full max-w-[180px] bg-white/50 border-none outline-none text-[15px] font-display font-bold text-[#1a1a1a] rounded-lg px-2 py-1 focus:ring-2 focus:ring-accent/20"
                />
              ) : (
                <h3 className="text-[15px] font-display font-bold tracking-tight text-[#1a1a1a] flex-1 leading-tight break-words">{exercise.name}</h3>
              )}
              {isFullyCompleted && !isEditingName && <CheckCircle className="w-5 h-5 text-accent fill-accent/10 shrink-0" />}
            </div>
            <div className="flex flex-col gap-1 mt-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                {sets.length} Sets
              </span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                {exercise.reps} Reps
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-between items-center py-1 shrink-0">
            <div className="flex items-center justify-center h-[40px]">
              {isEditingName ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRenameExercise(newName);
                    setIsEditingName(false);
                  }}
                  className="p-2 rounded-xl bg-accent text-white shadow-lg active:scale-90 transition-all"
                >
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingName(true);
                  }}
                  className="p-2 rounded-xl glass-button text-zinc-300 hover:text-accent transition-all active:scale-90"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-center h-[28px] mt-3">
              <div className={`p-2 rounded-xl glass-button transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Variation</p>
                </div>
                <div className="relative">
                  <select 
                    className="appearance-none glass-inset text-[10px] font-bold uppercase tracking-[0.1em] rounded-xl py-2.5 pl-4 pr-10 focus:ring-2 focus:ring-accent/20 outline-none transition-all cursor-pointer text-[#1a1a1a] border-none"
                    value={variation}
                    onChange={(e) => onUpdateVariation(e.target.value)}
                  >
                    {EQUIPMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {isStretch ? (
                  <div className="glass-inset rounded-3xl p-6 space-y-4">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Stopwatch</p>
                      <p className="text-4xl font-mono font-black text-[#1a1a1a] tracking-tighter">
                        {formatTime(stopwatchTime)}
                      </p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                        className={`p-4 rounded-2xl transition-all active:scale-95 ${
                          isStopwatchRunning ? 'bg-zinc-100 text-zinc-400' : 'bg-accent text-white shadow-lg'
                        }`}
                      >
                        {isStopwatchRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>
                      <button 
                        onClick={() => {
                          setIsStopwatchRunning(false);
                          setStopwatchTime(0);
                        }}
                        className="p-4 rounded-2xl glass-button text-zinc-400 active:scale-95"
                      >
                        <RotateCcw className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => {
                          onUpdateSet(0, 'completed', !sets[0].completed);
                          if (!sets[0].completed) {
                            onUpdateSet(0, 'seconds', formatTime(stopwatchTime));
                          }
                        }}
                        className={`p-4 rounded-2xl transition-all active:scale-95 ${
                          sets[0].completed ? 'bg-accent text-white shadow-lg' : 'glass-button text-zinc-300'
                        }`}
                      >
                        <CheckCircle className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ) : (
                  sets.map((set, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold border transition-all duration-500 ${
                      set.completed ? 'bg-accent border-accent text-white shadow-[0_5px_15px_rgba(15,15,15,0.3)]' : 'glass-inset text-zinc-300'
                    }`}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3 min-w-0">
                      <div className="relative">
                        {variation === 'BODYWEIGHT' ? (
                          <button 
                            onClick={() => {
                              const currentTotal = parseFloat(set.weight) || settings.bodyWeight || 0;
                              const addedWeight = Math.max(0, currentTotal - (settings.bodyWeight || 0));
                              
                              // Calculate prev added weight
                              const prevTotalWeight = parseFloat(prevLog?.sets[i]?.weight || "0");
                              const prevAddedWeight = prevTotalWeight > 0 ? Math.max(0, prevTotalWeight - (settings.bodyWeight || 0)) : 0;
                              const placeholder = prevAddedWeight > 0 ? prevAddedWeight.toString() : "0.0";
                              
                              onOpenInput(i, 'weight', addedWeight > 0 ? addedWeight.toString() : '', placeholder);
                            }}
                            className="w-full glass-inset rounded-2xl py-2 text-center text-sm font-bold font-mono focus:ring-2 focus:ring-accent/20 outline-none transition-all text-[#1a1a1a] min-h-[52px] flex flex-col items-center justify-center"
                          >
                            <span className="text-[9px] text-zinc-400 uppercase tracking-widest mb-0.5">{settings.bodyWeight || "0"} +</span>
                            <span className="text-sm">
                              {(() => {
                                const currentAddedWeight = set.weight ? Math.max(0, parseFloat(set.weight) - (settings.bodyWeight || 0)) : null;
                                
                                if (currentAddedWeight !== null && currentAddedWeight > 0) {
                                  return currentAddedWeight;
                                }

                                // Calculate prev added weight for placeholder logic
                                const prevTotalWeight = parseFloat(prevLog?.sets[i]?.weight || "0");
                                const prevAddedWeight = prevTotalWeight > 0 ? Math.max(0, prevTotalWeight - (settings.bodyWeight || 0)) : 0;
                                return <span className="text-zinc-400">{prevAddedWeight > 0 ? prevAddedWeight : "0.0"}</span>;
                              })()}
                            </span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => {
                              const placeholder = prevLog?.sets[i]?.weight || sets[i-1]?.weight || "0.0";
                              onOpenInput(i, 'weight', set.weight, placeholder);
                            }}
                            className="w-full glass-inset rounded-2xl py-3 text-center text-sm font-bold font-mono focus:ring-2 focus:ring-accent/20 outline-none transition-all text-[#1a1a1a] min-h-[44px] flex items-center justify-center"
                          >
                            {set.weight || <span className="text-zinc-400">{prevLog?.sets[i]?.weight || sets[i-1]?.weight || "0.0"}</span>}
                          </button>
                        )}
                        {i === 0 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Weight</span>}
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => {
                            const placeholder = prevLog?.sets[i]?.reps || sets[i-1]?.reps || "0";
                            onOpenInput(i, 'reps', set.reps, placeholder);
                          }}
                          className="w-full glass-inset rounded-2xl py-3 text-center text-sm font-bold font-mono focus:ring-2 focus:ring-accent/20 outline-none transition-all text-[#1a1a1a] min-h-[44px] flex items-center justify-center"
                        >
                          {set.reps || <span className="text-zinc-400">{prevLog?.sets[i]?.reps || sets[i-1]?.reps || "0"}</span>}
                        </button>
                        {i === 0 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Reps</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onUpdateSet(i, 'completed', !set.completed)}
                        className={`p-2 rounded-xl transition-all active:scale-90 ${
                          set.completed 
                            ? 'bg-accent text-white shadow-[0_10px_20px_rgba(15,15,15,0.3)]' 
                            : 'glass-button text-zinc-300 hover:text-accent'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onRemoveSet(i)}
                        className="p-2 rounded-xl glass-button text-zinc-300 hover:text-danger transition-all active:scale-90"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )))}
                {!isStretch && (
                  <button 
                    onClick={onAddSet}
                    className="w-full py-4 glass-button rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] hover:text-accent transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Add Set
                  </button>
                )}

                <div className="pt-4 border-t border-black/5">
                  <button 
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center justify-between w-full"
                  >
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{t('exerciseNotes')}</p>
                    <div className="flex items-center gap-2">
                      {log?.notes && !showNotes && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-500 ${showNotes ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {showNotes && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="glass-inset rounded-2xl p-4 mt-4">
                          <textarea 
                            value={log?.notes || ''}
                            onChange={(e) => onUpdateNotes(e.target.value)}
                            placeholder={t('exerciseNotesPlaceholder')}
                            className="w-full h-20 bg-transparent border-none outline-none text-xs font-display font-medium text-[#1a1a1a] placeholder:text-zinc-300 resize-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
