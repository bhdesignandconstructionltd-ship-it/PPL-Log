export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  options: string[];
  bodyPart: 'upper' | 'lower';
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface SetLog {
  weight: string;
  reps: string;
  seconds?: string;
  completed: boolean;
}

export interface WorkoutLog {
  exerciseOrder?: string[];
  notes?: string;
  [exerciseName: string]: any;
}

export interface DailyLog {
  [date: string]: {
    [workoutId: string]: WorkoutLog;
  };
}

export interface SavedTemplate {
  id: string;
  name: string;
  programme: WorkoutDay[];
  isDefault?: boolean;
  pinned?: boolean;
}
