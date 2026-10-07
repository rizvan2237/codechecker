import { Link, useParams } from 'react-router-dom';
import {
  DIFFICULTY_LEVELS,
  RECENT_SUBMISSIONS_LIMIT,
} from '../config/constants';
import {
  buildRecentSubmissionRows,
  buildStudentAssignmentRows,
} from '../analytics/studentDetails';
import type { ReadyDataset } from '../types/domain';
import { formatCount, formatDateTime } from '../lib/format';
import type { ChartDatum } from '../types/domain';
import { AnomalyPanel } from '../components/students/AnomalyPanel';
import { RecentSubmissionsTable } from '../components/students/RecentSubmissionsTable';
import { StudentAssignmentTable } from '../components/students/StudentAssignmentTable';
import { StudentScoreGrid } from '../components/students/StudentScoreGrid';
import { BarChart } from '../components/ui/BarChart';
import { DatasetGate } from '../components/ui/DatasetGate';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/StateMessages';

export function StudentDetailsPage() {
  return <DatasetGate>{(ready) => <StudentDetailsContent {...ready} />}</DatasetGate>;
}

function StudentDetailsContent({ dataset, summaries }: ReadyDataset) {
  const { studentId } = useParams();
  const summary = summaries.find((item) => item.student.id === studentId);

  if (summary === undefined) {
    return (
      <EmptyState
        title="Student not found"
        description="No student with this ID exists in the current data source."
        action={<Link className="button" to="/students">Back to students</Link>}
      />
    );
  }

  const { student } = summary;
  const difficultyChart: ChartDatum[] = DIFFICULTY_LEVELS.map((level) => ({
    label: level,
    value: summary.solvedByDifficulty[level],
  }));
  const topicChart: ChartDatum[] = Object.entries(summary.solvedByTopic)
    .map(([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value);
  const assignmentRows = buildStudentAssignmentRows(dataset, student.id);
  const recentRows = buildRecentSubmissionRows(dataset, student.id, RECENT_SUBMISSIONS_LIMIT);

  return (
    <>
      <PageHeader
        title={student.name}
        subtitle={`${student.id} · ${student.department} · Year ${student.year} · Section ${student.section}`}
        actions={<Link className="button button--ghost" to="/students">All students</Link>}
      />

      <GlassCard>
        <div className="meta-list">
          <MetaItem label="LeetCode username" value={student.leetcodeUsername ?? 'Not linked'} />
          <MetaItem label="HackerRank username" value={student.hackerrankUsername ?? 'Not linked'} />
          <MetaItem label="Problems solved" value={formatCount(summary.solvedCount)} />
          <MetaItem label="Last active" value={formatDateTime(summary.lastActiveAt)} />
          <MetaItem label="Synthetic persona" value={student.demoPersona ?? 'Not applicable'} />
        </div>
      </GlassCard>

      <StudentScoreGrid scores={summary.scores} />

      <div className="two-column">
        <GlassCard title="Solved by difficulty">
          <BarChart data={difficultyChart} />
        </GlassCard>
        <GlassCard title="Solved by topic">
          <BarChart data={topicChart} emptyMessage="No accepted problems yet." />
        </GlassCard>
      </div>

      <GlassCard title="Assignments" description="Completed problems for each assignment.">
        <StudentAssignmentTable rows={assignmentRows} />
      </GlassCard>

      <div className="two-column">
        <AnomalyPanel anomaly={summary.anomaly} />
        <GlassCard title="Recent submissions" description="Judge runtime is a platform measurement, not solving time.">
          <RecentSubmissionsTable rows={recentRows} />
        </GlassCard>
      </div>
    </>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-item">
      <span className="meta-item__label">{label}</span>
      <span className="meta-item__value">{value}</span>
    </div>
  );
}
