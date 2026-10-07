import { PLATFORM_LABELS } from '../../config/constants';
import { formatCount, formatDateTime } from '../../lib/format';
import type { RecentSubmissionRow } from '../../analytics/studentDetails';
import { StatusBadge } from '../ui/StatusBadge';

export function RecentSubmissionsTable({ rows }: { rows: readonly RecentSubmissionRow[] }) {
  if (rows.length === 0) {
    return <p className="muted-text">No submissions yet for this student.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Problem</th>
            <th scope="col">Platform</th>
            <th scope="col">Result</th>
            <th scope="col">Judge runtime</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{formatDateTime(row.submittedAt)}</td>
              <td>
                {row.problemTitle}
                <div className="muted-text">
                  {row.language} · attempt {row.attemptNumber}
                </div>
              </td>
              <td>{PLATFORM_LABELS[row.platform]}</td>
              <td>
                <StatusBadge tone={row.status === 'Accepted' ? 'success' : 'warning'}>{row.status}</StatusBadge>
              </td>
              <td>{formatCount(row.runtimeMs)} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
