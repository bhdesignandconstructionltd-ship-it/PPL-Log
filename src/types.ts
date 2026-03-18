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
  completed: boolean;
}

export interface WorkoutLog {
  exerciseOrder?: string[];
  [exerciseName: string]: any;
}

export interface DailyLog {
  [date: string]: {
    [workoutId: string]: WorkoutLog;
  };
}
