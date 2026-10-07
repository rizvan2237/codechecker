/**
 * Shared data shapes used across the whole app.
 * Both the synthetic generator and the Supabase repository produce these types,
 * so the UI and analytics never need to know where data came from.
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type PlatformCode = 'leetcode' | 'hackerrank';
export type SubmissionStatus = 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded';
export type AnomalyLevel = 'LOW' | 'NORMAL' | 'REVIEW' | 'HIGH';
export type AssignmentStatus = 'Completed' | 'Partial' | 'Missing';
export type DataSourceKind = 'synthetic' | 'supabase';

export interface Student {
  /** Readable student code, for example SYN-0001. Used in URLs. */
  id: string;
  name: string;
  department: string;
  year: number;
  section: string;
  leetcodeUsername: string | null;
  hackerrankUsername: string | null;
  /** Name of the synthetic profile used to generate this student. Null for real data. */
  demoPersona: string | null;
}

export interface Problem {
  id: string;
  title: string;
  platform: PlatformCode;
  difficulty: Difficulty;
  topic: string;
  tags: string[];
}

export interface Submission {
  id: string;
  studentId: string;
  problemId: string;
  platform: PlatformCode;
  submittedAt: string;
  status: SubmissionStatus;
  language: string;
  /** Judge measurement for this run. This is NOT how long the student took to solve. */
  runtimeMs: number;
  memoryKb: number;
  attemptNumber: number;
}

export interface Assignment {
  id: string;
  title: string;
  weekNumber: number;
  problemIds: string[];
}

export interface AssignmentResult {
  studentId: string;
  assignmentId: string;
  completedCount: number;
  totalCount: number;
  status: AssignmentStatus;
}

export interface AnomalySignal {
  studentId: string;
  level: AnomalyLevel;
  note: string;
  /** True when the signal was generated for the demo. */
  isDemo: boolean;
}

/** Everything the app needs, loaded in one object. */
export interface CodingDataset {
  source: DataSourceKind;
  students: Student[];
  problems: Problem[];
  submissions: Submission[];
  assignments: Assignment[];
  assignmentResults: AssignmentResult[];
  anomalySignals: AnomalySignal[];
}

/** Each score is a whole number from 0 to 100. */
export interface StudentScores {
  codingProgress: number;
  consistency: number;
  difficultyProgression: number;
  topicCoverage: number;
}

export interface StudentSummary {
  student: Student;
  solvedCount: number;
  solvedByDifficulty: Record<Difficulty, number>;
  solvedByTopic: Record<string, number>;
  activeDaysInWindow: number;
  lastActiveAt: string | null;
  assignmentsCompleted: number;
  assignmentsTotal: number;
  scores: StudentScores;
  anomaly: AnomalySignal | null;
}

export interface AssignmentStats {
  assignment: Assignment;
  statusCounts: Record<AssignmentStatus, number>;
  /** Completed problems divided by assigned problems, 0 to 100. */
  completionRate: number;
}

/** A labelled number for bar charts. */
export interface ChartDatum {
  label: string;
  value: number;
}

/** What pages receive once data has loaded successfully. */
export interface ReadyDataset {
  dataset: CodingDataset;
  summaries: StudentSummary[];
}
