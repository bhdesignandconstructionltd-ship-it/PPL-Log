import { WorkoutDay } from '../types';

export const PPL_PROGRAMME: WorkoutDay[] = [
  {
    id: 'push-1',
    name: 'Push Day 1 (Chest Focus)',
    exercises: [
      { name: 'Incline Press', sets: 4, reps: '8-10', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Flat Bench Press', sets: 3, reps: '8-10', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Decline Chest', sets: 3, reps: '8-10', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Lateral Raise', sets: 3, reps: '15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Front Delt Fly', sets: 3, reps: '15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Outer Triceps', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Inner Triceps', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
    ]
  },
  {
    id: 'pull-1',
    name: 'Pull Day 1 (Thickness)',
    exercises: [
      { name: 'Upper Back Row', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Mid Back Row', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Rack Pull', sets: 2, reps: '8-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Bent Over Row', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Single Arm Row', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Hammer Curl', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Machine Bicep Curl', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Seated DB Rear Delt Row', sets: 2, reps: '15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
    ]
  },
  {
    id: 'legs-1',
    name: 'Leg Day 1 (Quad Focus)',
    exercises: [
      { name: 'Leg Press', sets: 4, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Hack Squat', sets: 3, reps: '10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Leg Extension', sets: 4, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Walking Lunges', sets: 3, reps: '20 steps', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Adductor Machine', sets: 3, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Standing Calf Raise', sets: 4, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
    ]
  },
  {
    id: 'push-2',
    name: 'Push Day 2 (Shoulder Focus)',
    exercises: [
      { name: 'Overhead Press', sets: 4, reps: '8-10', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Arnold Press', sets: 3, reps: '10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Chest Fly', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Upright Row', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Lateral Raise', sets: 4, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Tricep Extension', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Dips', sets: 3, reps: 'Failure', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
    ]
  },
  {
    id: 'pull-2',
    name: 'Pull Day 2 (Width Focus)',
    exercises: [
      { name: 'Lat Pulldown', sets: 4, reps: '10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Pull Ups', sets: 3, reps: 'Failure', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Straight Arm Pulldown', sets: 3, reps: '15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Narrow Hand Cable Pull down / Reverse Normal Grip Pull Down ( Elbow Forward )', sets: 3, reps: '15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Reverse Fly', sets: 3, reps: '15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Incline Bicep Curl', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Preacher Curl', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Facepull', sets: 2, reps: '15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
    ]
  },
  {
    id: 'legs-2',
    name: 'Leg Day 2 (Hamstring Focus)',
    exercises: [
      { name: 'Stiff Leg Deadlift', sets: 4, reps: '10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Lying Leg Curl', sets: 4, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Seated Leg Curl', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Glute Bridge', sets: 3, reps: '12-15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Goblet Squat', sets: 3, reps: '15', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Seated Calf Raise', sets: 4, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
    ]
  }
];
