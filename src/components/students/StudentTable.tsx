import { Link } from 'react-router-dom';
import { formatCount, formatPercent } from '../../lib/format';
import type { StudentSummary } from '../../types/domain';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge, anomalyToneFor } from '../ui/StatusBadge';

interface StudentTableProps {
  summaries: readonly StudentSummary[];
}

export function StudentTable({ summaries }: StudentTableProps) {
  return (
    <GlassCard>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Student</th>
              <th scope="col">Department</th>
              <th scope="col">Year</th>
              <th scope="col">Section</th>
              <th scope="col">Solved</th>
              <th scope="col">Progress</th>
              <th scope="col">Consistency</th>
              <th scope="col">Assignments</th>
              <th scope="col">Demo signal</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <StudentRow key={summary.student.id} summary={summary} />
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function StudentRow({ summary }: { summary: StudentSummary }) {
  const { student } = summary;
  return (
    <tr>
      <td>
        <Link className="table-link" to={`/students/${student.id}`}>
          {student.name}
        </Link>
        <div className="muted-text">{student.id}</div>
      </td>
      <td>{student.department}</td>
      <td>{student.year}</td>
      <td>{student.section}</td>
      <td>{formatCount(summary.solvedCount)}</td>
      <td>{formatPercent(summary.scores.codingProgress)}</td>
      <td>{formatPercent(summary.scores.consistency)}</td>
      <td>
        {summary.assignmentsCompleted} / {summary.assignmentsTotal}
      </td>
      <td>
        {summary.anomaly === null ? (
          <span className="muted-text">None</span>
        ) : (
          <StatusBadge tone={anomalyToneFor(summary.anomaly.level)}>{summary.anomaly.level}</StatusBadge>
        )}
      </td>
    </tr>
  );
}
