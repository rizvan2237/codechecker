import { ASSIGNMENT_STATUSES } from '../config/constants';
import { buildAssignmentStats } from '../analytics/datasetStats';
import type { ReadyDataset } from '../types/domain';
import { formatCount } from '../lib/format';
import type { AssignmentStats, ChartDatum } from '../types/domain';
import { DatasetGate } from '../components/ui/DatasetGate';
import { BarChart } from '../components/ui/BarChart';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { EmptyState } from '../components/ui/StateMessages';
import { assignmentToneFor, StatusBadge } from '../components/ui/StatusBadge';

export function AssignmentsPage() {
  return <DatasetGate>{(ready) => <AssignmentsContent {...ready} />}</DatasetGate>;
}

function AssignmentsContent({ dataset }: ReadyDataset) {
  const stats = buildAssignmentStats(dataset);
  const completionChart: ChartDatum[] = stats.map((stat) => ({
    label: stat.assignment.title,
    value: stat.completionRate,
  }));

  return (
    <>
      <PageHeader
        title="Assignments"
        subtitle="Completion for each practice assignment, across all students."
      />

      {stats.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Create an assignment in the database, or use the synthetic demo data, to see results here."
        />
      ) : (
        <>
          <div className="assignment-grid">
            {stats.map((stat) => (
              <AssignmentCard key={stat.assignment.id} stat={stat} />
            ))}
          </div>
          <GlassCard
            title="Completion rate by assignment"
            description="Completed problems divided by assigned problems."
          >
            <BarChart data={completionChart} />
          </GlassCard>
        </>
      )}
    </>
  );
}

function AssignmentCard({ stat }: { stat: AssignmentStats }) {
  const { assignment, statusCounts } = stat;
  return (
    <GlassCard
      title={assignment.title}
      description={`Week ${assignment.weekNumber} · ${assignment.problemIds.length} problems`}
    >
      <ProgressBar label="Completion rate" value={stat.completionRate} />
      <div className="badge-row">
        {ASSIGNMENT_STATUSES.map((status) => (
          <StatusBadge key={status} tone={assignmentToneFor(status)}>
            {status}: {formatCount(statusCounts[status])}
          </StatusBadge>
        ))}
      </div>
    </GlassCard>
  );
}
