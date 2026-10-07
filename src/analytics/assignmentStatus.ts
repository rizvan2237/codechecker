import { ASSIGNMENT_COMPLETE_RATIO } from '../config/constants';
import type { AssignmentStatus } from '../types/domain';

/**
 * Completed: at least ASSIGNMENT_COMPLETE_RATIO of the problems are done.
 * Partial:   some problems are done, but not enough to count as completed.
 * Missing:   no problems are done (or the assignment has no problems).
 */
export function deriveAssignmentStatus(completedCount: number, totalCount: number): AssignmentStatus {
  if (totalCount === 0 || completedCount === 0) return 'Missing';
  if (completedCount / totalCount >= ASSIGNMENT_COMPLETE_RATIO) return 'Completed';
  return 'Partial';
}
