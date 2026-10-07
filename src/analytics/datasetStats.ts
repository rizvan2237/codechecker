/** Dataset-wide numbers for dashboard cards, charts, and reports. */
import {
  ASSIGNMENT_STATUSES,
  DIFFICULTY_LEVELS,
  PLATFORM_CODES,
  SUBMISSION_STATUSES,
  TOP_TOPICS_LIMIT,
} from '../config/constants';
import { average, toPercent } from '../lib/math';
import type {
  AssignmentStats,
  ChartDatum,
  CodingDataset,
  Difficulty,
  PlatformCode,
  StudentSummary,
  Submission,
  SubmissionStatus,
} from '../types/domain';
import { createZeroCounts, groupBy } from './collections';

export function sumSolvedByDifficulty(summaries: readonly StudentSummary[]): Record<Difficulty, number> {
  const totals = createZeroCounts(DIFFICULTY_LEVELS);
  for (const summary of summaries) {
    for (const level of DIFFICULTY_LEVELS) {
      totals[level] += summary.solvedByDifficulty[level];
    }
  }
  return totals;
}

export function countSubmissionsByStatus(submissions: readonly Submission[]): Record<SubmissionStatus, number> {
  const counts = createZeroCounts(SUBMISSION_STATUSES);
  for (const submission of submissions) {
    counts[submission.status] += 1;
  }
  return counts;
}

export function countSubmissionsByPlatform(submissions: readonly Submission[]): Record<PlatformCode, number> {
  const counts = createZeroCounts(PLATFORM_CODES);
  for (const submission of submissions) {
    counts[submission.platform] += 1;
  }
  return counts;
}

/** The most-solved topics across all students, largest first. */
export function buildTopicChartData(summaries: readonly StudentSummary[], limit: number = TOP_TOPICS_LIMIT): ChartDatum[] {
  const totals = new Map<string, number>();
  for (const summary of summaries) {
    for (const [topic, count] of Object.entries(summary.solvedByTopic)) {
      totals.set(topic, (totals.get(topic) ?? 0) + count);
    }
  }
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value)
    .slice(0, limit);
}

/** Average coding progress score for each department. */
export function buildDepartmentProgressChart(summaries: readonly StudentSummary[]): ChartDatum[] {
  const byDepartment = groupBy(summaries, (summary) => summary.student.department);
  return [...byDepartment.entries()]
    .map(([department, group]) => ({
      label: department,
      value: average(group.map((summary) => summary.scores.codingProgress)),
    }))
    .sort((first, second) => first.label.localeCompare(second.label));
}

export function buildAssignmentStats(dataset: CodingDataset): AssignmentStats[] {
  const resultsByAssignment = groupBy(dataset.assignmentResults, (result) => result.assignmentId);

  return dataset.assignments.map((assignment) => {
    const results = resultsByAssignment.get(assignment.id) ?? [];
    const statusCounts = createZeroCounts(ASSIGNMENT_STATUSES);
    let completedProblems = 0;
    let assignedProblems = 0;

    for (const result of results) {
      statusCounts[result.status] += 1;
      completedProblems += result.completedCount;
      assignedProblems += result.totalCount;
    }

    return {
      assignment,
      statusCounts,
      completionRate: assignedProblems === 0 ? 0 : toPercent(completedProblems / assignedProblems),
    };
  });
}

export function averageScore(
  summaries: readonly StudentSummary[],
  pickScore: (summary: StudentSummary) => number,
): number {
  return average(summaries.map(pickScore));
}
