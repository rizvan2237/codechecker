/** Demo assignments and each student's completion results for them. */
import { deriveAssignmentStatus } from '../../analytics/assignmentStatus';
import { clamp } from '../../lib/math';
import type { RandomSource } from '../../lib/random';
import type { Assignment, AssignmentResult, Problem } from '../../types/domain';
import type { SyntheticStudentPlan } from './studentRecords';

interface AssignmentBlueprint {
  id: string;
  title: string;
  weekNumber: number;
  topics: readonly string[];
  problemCount: number;
}

const ASSIGNMENT_BLUEPRINTS: readonly AssignmentBlueprint[] = [
  { id: 'demo-assignment-01', title: 'Python Fundamentals - Week 1', weekNumber: 1, topics: ['Strings', 'Math'], problemCount: 8 },
  { id: 'demo-assignment-02', title: 'Arrays Practice - Week 2', weekNumber: 2, topics: ['Arrays', 'Two Pointers', 'Sliding Window'], problemCount: 8 },
  { id: 'demo-assignment-03', title: 'Linked List Training - Week 3', weekNumber: 3, topics: ['Linked List', 'Stack', 'Queue'], problemCount: 8 },
  { id: 'demo-assignment-04', title: 'Trees Challenge - Week 4', weekNumber: 4, topics: ['Trees', 'Graphs'], problemCount: 10 },
  { id: 'demo-assignment-05', title: 'Placement DSA Round 1', weekNumber: 5, topics: ['Hash Table', 'Binary Search', 'Dynamic Programming', 'Greedy', 'Sorting'], problemCount: 12 },
];

/** Spreads each student's completion around their persona rate: +/- 0.15. */
const COMPLETION_NOISE_RANGE = 0.3;

export function buildAssignments(problems: readonly Problem[]): Assignment[] {
  return ASSIGNMENT_BLUEPRINTS.map((blueprint) => {
    const matchingProblems = problems.filter((problem) => blueprint.topics.includes(problem.topic));
    return {
      id: blueprint.id,
      title: blueprint.title,
      weekNumber: blueprint.weekNumber,
      problemIds: matchingProblems.slice(0, blueprint.problemCount).map((problem) => problem.id),
    };
  });
}

export function buildAssignmentResults(
  plan: SyntheticStudentPlan,
  assignments: readonly Assignment[],
  random: RandomSource,
): AssignmentResult[] {
  return assignments.map((assignment) => {
    const totalCount = assignment.problemIds.length;
    const noise = (random.next() - 0.5) * COMPLETION_NOISE_RANGE;
    const ratio = clamp(plan.persona.assignmentCompletionRate + noise, 0, 1);
    const completedCount = Math.round(totalCount * ratio);
    return {
      studentId: plan.student.id,
      assignmentId: assignment.id,
      completedCount,
      totalCount,
      status: deriveAssignmentStatus(completedCount, totalCount),
    };
  });
}
