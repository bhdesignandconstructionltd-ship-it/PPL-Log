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

export const UPPER_LOWER_PROGRAMME: WorkoutDay[] = [
  {
    id: 'lower-1',
    name: 'Lower 1',
    exercises: [
      { name: 'Banded hack squats', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Leg Ext', sets: 2, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Quad Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Laying hamstring', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Abductor', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Hamstring Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Seated Calves', sets: 4, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Calf Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Preacher curl', sets: 3, reps: '6-9, 10-12, 15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Bicep Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
    ]
  },
  {
    id: 'upper-1',
    name: 'Upper 1',
    exercises: [
      { name: 'Deadlifts', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Incline barbell', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Lat pull down', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Back Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Close grip machine', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Chest Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Laterals', sets: 2, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Shoulder Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Tricep rope', sets: 2, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Tricep Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Abs', sets: 4, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Abs Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
    ]
  },
  {
    id: 'lower-2',
    name: 'Lower 2',
    exercises: [
      { name: 'Smith squat', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Single leg press', sets: 2, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Quad Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Seated hamstring', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Adductor', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Hamstring Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Standing Calves', sets: 4, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Calf Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'lower' },
      { name: 'Z bar curl', sets: 3, reps: '6-9, 10-12, 15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Bicep Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
    ]
  },
  {
    id: 'upper-2',
    name: 'Upper 2',
    exercises: [
      { name: 'Incline hammer/machine', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Overhand chest support row', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Dips', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Neutral grip lat pull down', sets: 2, reps: '5-9, 10-12', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Pull over', sets: 2, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Chest Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Upright row', sets: 2, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Shoulder Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Tricep press down', sets: 2, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Tricep Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Abs', sets: 4, reps: '15-20', options: ['DUMBBELL', 'BARBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT'], bodyPart: 'upper' },
      { name: 'Abs Stretch', sets: 1, reps: '30s', options: ['BODYWEIGHT'], bodyPart: 'upper' },
    ]
  }
];
