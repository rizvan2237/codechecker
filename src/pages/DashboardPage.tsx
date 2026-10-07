import { Link } from 'react-router-dom';
import {
  ATTENTION_LIST_LIMIT,
  CONSISTENCY_WINDOW_DAYS,
  DIFFICULTY_LEVELS,
} from '../config/constants';
import {
  averageScore,
  buildAssignmentStats,
  buildDepartmentProgressChart,
  countSubmissionsByStatus,
  sumSolvedByDifficulty,
} from '../analytics/datasetStats';
import type { ReadyDataset } from '../types/domain';
import { formatCount, formatPercent } from '../lib/format';
import { average } from '../lib/math';
import type { ChartDatum, StudentSummary } from '../types/domain';
import { DatasetGate } from '../components/ui/DatasetGate';
import { BarChart } from '../components/ui/BarChart';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/StateMessages';
import { StatusBadge } from '../components/ui/StatusBadge';

export function DashboardPage() {
  return <DatasetGate>{(ready) => <DashboardContent {...ready} />}</DatasetGate>;
}

function DashboardContent({ dataset, summaries }: ReadyDataset) {
  const statusCounts = countSubmissionsByStatus(dataset.submissions);
  const solvedByDifficulty = sumSolvedByDifficulty(summaries);
  const difficultyChart: ChartDatum[] = DIFFICULTY_LEVELS.map((level) => ({
    label: level,
    value: solvedByDifficulty[level],
  }));
  const assignmentRates = buildAssignmentStats(dataset).map((stat) => stat.completionRate);
  const reviewSignalStudents = summaries
    .filter((summary) => summary.anomaly?.level === 'REVIEW')
    .slice(0, ATTENTION_LIST_LIMIT);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Coding activity overview for placement training staff."
      />

      <div className="stat-grid">
        <StatCard
          label="Students"
          value={formatCount(summaries.length)}
          hint={`${formatCount(dataset.problems.length)} problems in catalogue`}
        />
        <StatCard
          label="Accepted submissions"
          value={formatCount(statusCounts.Accepted)}
          hint="Across all students"
        />
        <StatCard
          label="Average progress"
          value={formatPercent(averageScore(summaries, (summary) => summary.scores.codingProgress))}
          hint="Coding progress score"
        />
        <StatCard
          label="Average consistency"
          value={formatPercent(averageScore(summaries, (summary) => summary.scores.consistency))}
          hint={`Active days in last ${CONSISTENCY_WINDOW_DAYS} days`}
        />
        <StatCard
          label="Assignment completion"
          value={formatPercent(average(assignmentRates))}
          hint="Average across assignments"
        />
      </div>

      <div className="two-column">
        <GlassCard title="Solved by difficulty" description="Accepted problems across all students.">
          <BarChart data={difficultyChart} />
        </GlassCard>
        <GlassCard title="Average progress by department" description="Coding progress score, 0 to 100.">
          <BarChart data={buildDepartmentProgressChart(summaries)} />
        </GlassCard>
      </div>

      <GlassCard
        title="Review-signal students"
        description="Demonstration signal only. A real system would need a human review before any action."
      >
        <ReviewSignalList students={reviewSignalStudents} />
      </GlassCard>
    </>
  );
}

function ReviewSignalList({ students }: { students: StudentSummary[] }) {
  if (students.length === 0) {
    return (
      <EmptyState
        title="No review signals"
        description="No student in this dataset carries a REVIEW demonstration signal."
      />
    );
  }

  return (
    <ul className="attention-list">
      {students.map((summary) => (
        <li key={summary.student.id}>
          <Link className="table-link" to={`/students/${summary.student.id}`}>
            {summary.student.name}
          </Link>
          <span className="muted-text">{summary.student.id}</span>
          <StatusBadge tone="demo">Demo: REVIEW</StatusBadge>
        </li>
      ))}
    </ul>
  );
}
