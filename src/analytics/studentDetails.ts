/** Per-student lists shown on the student details page. */
import { indexBy } from './collections';
import type {
  AssignmentStatus,
  CodingDataset,
  PlatformCode,
  SubmissionStatus,
} from '../types/domain';

export interface StudentAssignmentRow {
  assignmentId: string;
  title: string;
  weekNumber: number;
  completedCount: number;
  totalCount: number;
  status: AssignmentStatus;
}

export interface RecentSubmissionRow {
  id: string;
  submittedAt: string;
  problemTitle: string;
  platform: PlatformCode;
  status: SubmissionStatus;
  language: string;
  attemptNumber: number;
  /** Judge runtime in milliseconds. Not the student's solving time. */
  runtimeMs: number;
}

export function buildStudentAssignmentRows(dataset: CodingDataset, studentId: string): StudentAssignmentRow[] {
  const assignmentsById = indexBy(dataset.assignments, (assignment) => assignment.id);
  const rows: StudentAssignmentRow[] = [];

  for (const result of dataset.assignmentResults) {
    if (result.studentId !== studentId) continue;
    const assignment = assignmentsById.get(result.assignmentId);
    if (assignment === undefined) continue;
    rows.push({
      assignmentId: assignment.id,
      title: assignment.title,
      weekNumber: assignment.weekNumber,
      completedCount: result.completedCount,
      totalCount: result.totalCount,
      status: result.status,
    });
  }

  return rows.sort((first, second) => first.weekNumber - second.weekNumber);
}

export function buildRecentSubmissionRows(
  dataset: CodingDataset,
  studentId: string,
  limit: number,
): RecentSubmissionRow[] {
  const problemsById = indexBy(dataset.problems, (problem) => problem.id);

  return dataset.submissions
    .filter((submission) => submission.studentId === studentId)
    .sort((first, second) => Date.parse(second.submittedAt) - Date.parse(first.submittedAt))
    .slice(0, limit)
    .map((submission) => ({
      id: submission.id,
      submittedAt: submission.submittedAt,
      problemTitle: problemsById.get(submission.problemId)?.title ?? 'Unknown problem',
      platform: submission.platform,
      status: submission.status,
      language: submission.language,
      attemptNumber: submission.attemptNumber,
      runtimeMs: submission.runtimeMs,
    }));
}
