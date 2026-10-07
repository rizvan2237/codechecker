/** Each report turns the loaded dataset into CSV rows. Add a report by adding an entry here. */
import { buildAssignmentStats } from '../../analytics/datasetStats';
import type { ReadyDataset } from '../../types/domain';
import type { CsvRow } from '../../lib/csv';

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  buildRows: (ready: ReadyDataset) => CsvRow[];
}

export const REPORT_DEFINITIONS: readonly ReportDefinition[] = [
  {
    id: 'student-summary',
    title: 'Student summary',
    description: 'One row per student with solved counts and the four coding scores.',
    buildRows: buildStudentSummaryRows,
  },
  {
    id: 'assignment-status',
    title: 'Assignment status',
    description: 'One row per assignment with completed, partial, and missing counts.',
    buildRows: buildAssignmentStatusRows,
  },
];

function buildStudentSummaryRows({ dataset, summaries }: ReadyDataset): CsvRow[] {
  return summaries.map((summary) => ({
    data_source: dataset.source,
    student_id: summary.student.id,
    name: summary.student.name,
    department: summary.student.department,
    year: summary.student.year,
    section: summary.student.section,
    solved_total: summary.solvedCount,
    solved_easy: summary.solvedByDifficulty.Easy,
    solved_medium: summary.solvedByDifficulty.Medium,
    solved_hard: summary.solvedByDifficulty.Hard,
    coding_progress_score: summary.scores.codingProgress,
    consistency_score: summary.scores.consistency,
    difficulty_mix_score: summary.scores.difficultyProgression,
    topic_coverage_score: summary.scores.topicCoverage,
    assignments_completed: summary.assignmentsCompleted,
    assignments_total: summary.assignmentsTotal,
    demo_signal_level: summary.anomaly?.level ?? '',
    demo_signal_is_demo: summary.anomaly?.isDemo ? 'yes' : 'no',
  }));
}

function buildAssignmentStatusRows({ dataset }: ReadyDataset): CsvRow[] {
  return buildAssignmentStats(dataset).map((stat) => ({
    data_source: dataset.source,
    assignment_id: stat.assignment.id,
    title: stat.assignment.title,
    week_number: stat.assignment.weekNumber,
    completed_students: stat.statusCounts.Completed,
    partial_students: stat.statusCounts.Partial,
    missing_students: stat.statusCounts.Missing,
    completion_rate_percent: stat.completionRate,
  }));
}
