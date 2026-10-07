/**
 * Builds one StudentSummary per student.
 * This is the main analytics step: raw rows in, dashboard-ready numbers out.
 */
import {
  CONSISTENCY_WINDOW_DAYS,
  DATE_PREFIX_LENGTH,
  DIFFICULTY_LEVELS,
  MS_PER_DAY,
} from '../config/constants';
import type {
  AnomalySignal,
  AssignmentResult,
  CodingDataset,
  Problem,
  Student,
  StudentSummary,
  Submission,
} from '../types/domain';
import { createZeroCounts, groupBy, indexBy } from './collections';
import {
  calculateCodingProgressScore,
  calculateConsistencyScore,
  calculateDifficultyProgressionScore,
  calculateTopicCoverageScore,
} from './scoreCalculator';

interface SummaryContext {
  problemsById: Map<string, Problem>;
  anomaliesByStudent: Map<string, AnomalySignal>;
  referenceTimeMs: number;
  totalTopicCount: number;
  assignmentCount: number;
}

export function buildStudentSummaries(dataset: CodingDataset): StudentSummary[] {
  const context: SummaryContext = {
    problemsById: indexBy(dataset.problems, (problem) => problem.id),
    anomaliesByStudent: indexBy(dataset.anomalySignals, (signal) => signal.studentId),
    referenceTimeMs: findLatestSubmissionTimeMs(dataset.submissions),
    totalTopicCount: new Set(dataset.problems.map((problem) => problem.topic)).size,
    assignmentCount: dataset.assignments.length,
  };

  const submissionsByStudent = groupBy(dataset.submissions, (submission) => submission.studentId);
  const resultsByStudent = groupBy(dataset.assignmentResults, (result) => result.studentId);

  return dataset.students.map((student) =>
    buildSummary(
      student,
      submissionsByStudent.get(student.id) ?? [],
      resultsByStudent.get(student.id) ?? [],
      context,
    ),
  );
}

function buildSummary(
  student: Student,
  submissions: Submission[],
  results: AssignmentResult[],
  context: SummaryContext,
): StudentSummary {
  const solvedProblems = collectSolvedProblems(submissions, context.problemsById);

  const solvedByDifficulty = createZeroCounts(DIFFICULTY_LEVELS);
  for (const problem of solvedProblems) {
    solvedByDifficulty[problem.difficulty] += 1;
  }

  const solvedByTopic = countByTopic(solvedProblems);
  const activeDaysInWindow = countActiveDays(submissions, context.referenceTimeMs);
  const assignmentsCompleted = results.filter((result) => result.status === 'Completed').length;

  return {
    student,
    solvedCount: solvedProblems.length,
    solvedByDifficulty,
    solvedByTopic,
    activeDaysInWindow,
    lastActiveAt: findLatestSubmissionTime(submissions),
    assignmentsCompleted,
    assignmentsTotal: context.assignmentCount,
    scores: {
      codingProgress: calculateCodingProgressScore(solvedProblems.length),
      consistency: calculateConsistencyScore(activeDaysInWindow),
      difficultyProgression: calculateDifficultyProgressionScore(solvedByDifficulty),
      topicCoverage: calculateTopicCoverageScore(Object.keys(solvedByTopic).length, context.totalTopicCount),
    },
    anomaly: context.anomaliesByStudent.get(student.id) ?? null,
  };
}

/** A problem counts as solved when at least one submission for it was Accepted. */
function collectSolvedProblems(
  submissions: readonly Submission[],
  problemsById: Map<string, Problem>,
): Problem[] {
  const solvedProblemIds = new Set(
    submissions.filter((submission) => submission.status === 'Accepted').map((submission) => submission.problemId),
  );
  const solved: Problem[] = [];
  for (const problemId of solvedProblemIds) {
    const problem = problemsById.get(problemId);
    if (problem !== undefined) solved.push(problem);
  }
  return solved;
}

function countByTopic(problems: readonly Problem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const problem of problems) {
    counts[problem.topic] = (counts[problem.topic] ?? 0) + 1;
  }
  return counts;
}

/** Counts distinct calendar days with activity inside the consistency window. */
function countActiveDays(submissions: readonly Submission[], referenceTimeMs: number): number {
  const windowStartMs = referenceTimeMs - CONSISTENCY_WINDOW_DAYS * MS_PER_DAY;
  const activeDays = new Set<string>();
  for (const submission of submissions) {
    const submittedMs = Date.parse(submission.submittedAt);
    if (submittedMs >= windowStartMs && submittedMs <= referenceTimeMs) {
      activeDays.add(submission.submittedAt.slice(0, DATE_PREFIX_LENGTH));
    }
  }
  return activeDays.size;
}

function findLatestSubmissionTime(submissions: readonly Submission[]): string | null {
  let latest: string | null = null;
  for (const submission of submissions) {
    if (latest === null || submission.submittedAt > latest) {
      latest = submission.submittedAt;
    }
  }
  return latest;
}

/**
 * The "today" used for the consistency window. It is the newest submission in the data,
 * so old demo data still shows meaningful numbers. Falls back to now when there is no data.
 */
function findLatestSubmissionTimeMs(submissions: readonly Submission[]): number {
  const latest = findLatestSubmissionTime(submissions);
  return latest === null ? Date.now() : Date.parse(latest);
}
