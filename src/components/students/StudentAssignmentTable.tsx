import { formatCount } from '../../lib/format';
import type { StudentAssignmentRow } from '../../analytics/studentDetails';
import { assignmentToneFor, StatusBadge } from '../ui/StatusBadge';

export function StudentAssignmentTable({ rows }: { rows: readonly StudentAssignmentRow[] }) {
  if (rows.length === 0) {
    return <p className="muted-text">No assignment results for this student.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Assignment</th>
            <th scope="col">Week</th>
            <th scope="col">Completed</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.assignmentId}>
              <td>{row.title}</td>
              <td>{row.weekNumber}</td>
              <td>
                {formatCount(row.completedCount)} / {formatCount(row.totalCount)}
              </td>
              <td>
                <StatusBadge tone={assignmentToneFor(row.status)}>{row.status}</StatusBadge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
