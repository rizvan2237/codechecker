/**
 * A persona is a recipe for one kind of SYNTHETIC student.
 * The generator reads these numbers to create realistic variation.
 * No persona describes a real person.
 *
 * Anomaly levels are DEMONSTRATION labels only. They describe a generated
 * activity pattern and never imply cheating.
 */
import type { AnomalyLevel, Difficulty } from '../../types/domain';

export interface SyntheticPersona {
  label: string;
  /** Minimum and maximum number of problems this student solves. */
  solvedRange: readonly [number, number];
  /** Relative chance of each difficulty. Values do not need to add up to 100. */
  difficultyWeights: Readonly<Record<Difficulty, number>>;
  /** Average days per week with any activity. */
  activeDaysPerWeek: number;
  activityTrend: 'steady' | 'improving' | 'declining';
  /** Share of assignment problems completed, from 0 to 1. */
  assignmentCompletionRate: number;
  /** How many topics the student focuses on. 0 means all topics. */
  focusTopicCount: number;
  anomalyLevel: AnomalyLevel;
  anomalyNote: string;
}

const DEMO_NOTE = 'Demonstration only. This label is generated for the demo and is not evidence of misconduct.';

export const SYNTHETIC_PERSONAS: readonly SyntheticPersona[] = [
  {
    label: 'Highly consistent student',
    solvedRange: [40, 90],
    difficultyWeights: { Easy: 5, Medium: 4, Hard: 1 },
    activeDaysPerWeek: 6,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.85,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'High-volume student',
    solvedRange: [120, 180],
    difficultyWeights: { Easy: 4, Medium: 4, Hard: 2 },
    activeDaysPerWeek: 5,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.8,
    focusTopicCount: 0,
    anomalyLevel: 'HIGH',
    anomalyNote: 'Demonstration only. Submission volume is unusually high compared with the demo cohort. Not evidence of misconduct.',
  },
  {
    label: 'Low-activity student',
    solvedRange: [5, 20],
    difficultyWeights: { Easy: 8, Medium: 2, Hard: 0 },
    activeDaysPerWeek: 1,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.2,
    focusTopicCount: 0,
    anomalyLevel: 'LOW',
    anomalyNote: 'Demonstration only. Activity is low compared with the demo cohort.',
  },
  {
    label: 'Beginner',
    solvedRange: [8, 25],
    difficultyWeights: { Easy: 9, Medium: 1, Hard: 0 },
    activeDaysPerWeek: 2,
    activityTrend: 'improving',
    assignmentCompletionRate: 0.45,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Medium-level learner',
    solvedRange: [30, 60],
    difficultyWeights: { Easy: 3, Medium: 6, Hard: 1 },
    activeDaysPerWeek: 3,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.6,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Strong problem solver',
    solvedRange: [90, 140],
    difficultyWeights: { Easy: 2, Medium: 5, Hard: 3 },
    activeDaysPerWeek: 5,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.9,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Strong Easy/Medium, weak Hard',
    solvedRange: [60, 100],
    difficultyWeights: { Easy: 4, Medium: 5, Hard: 0.5 },
    activeDaysPerWeek: 4,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.75,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Strong DSA, low consistency',
    solvedRange: [80, 130],
    difficultyWeights: { Easy: 3, Medium: 4, Hard: 3 },
    activeDaysPerWeek: 0.7,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.7,
    focusTopicCount: 4,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'High assignment completion',
    solvedRange: [30, 70],
    difficultyWeights: { Easy: 5, Medium: 4, Hard: 1 },
    activeDaysPerWeek: 4,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.97,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Low assignment completion',
    solvedRange: [25, 60],
    difficultyWeights: { Easy: 6, Medium: 3.5, Hard: 0.5 },
    activeDaysPerWeek: 2.5,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.15,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Improving student',
    solvedRange: [20, 90],
    difficultyWeights: { Easy: 4, Medium: 4, Hard: 2 },
    activeDaysPerWeek: 3,
    activityTrend: 'improving',
    assignmentCompletionRate: 0.6,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Declining activity student',
    solvedRange: [40, 80],
    difficultyWeights: { Easy: 4, Medium: 4, Hard: 2 },
    activeDaysPerWeek: 3,
    activityTrend: 'declining',
    assignmentCompletionRate: 0.5,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Topic-specialized student',
    solvedRange: [30, 60],
    difficultyWeights: { Easy: 3, Medium: 5, Hard: 2 },
    activeDaysPerWeek: 3,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.65,
    focusTopicCount: 2,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Balanced student',
    solvedRange: [50, 90],
    difficultyWeights: { Easy: 4, Medium: 4, Hard: 2 },
    activeDaysPerWeek: 4,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.75,
    focusTopicCount: 0,
    anomalyLevel: 'NORMAL',
    anomalyNote: DEMO_NOTE,
  },
  {
    label: 'Synthetic review-signal student',
    solvedRange: [60, 100],
    difficultyWeights: { Easy: 5, Medium: 4, Hard: 1 },
    activeDaysPerWeek: 6.5,
    activityTrend: 'steady',
    assignmentCompletionRate: 0.9,
    focusTopicCount: 0,
    anomalyLevel: 'REVIEW',
    anomalyNote: 'Demonstration only. Activity timing is unusually uniform across the window. This label shows the REVIEW state; it is not evidence of misconduct.',
  },
];
