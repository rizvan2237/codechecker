import type { ChartDatum } from '../../types/domain';
import { formatCount } from '../../lib/format';
import { toPercent } from '../../lib/math';

interface BarChartProps {
  data: readonly ChartDatum[];
  emptyMessage?: string;
}

/** Horizontal bars. Widths are relative to the largest value. */
export function BarChart({ data, emptyMessage = 'No data for this chart yet.' }: BarChartProps) {
  if (data.length === 0) {
    return <p className="muted-text">{emptyMessage}</p>;
  }

  const largestValue = Math.max(...data.map((datum) => datum.value), 1);

  return (
    <ul className="bar-chart">
      {data.map((datum) => {
        const widthPercent = toPercent(datum.value / largestValue);
        return (
          <li key={datum.label} className="bar-chart__row">
            <span className="bar-chart__label">{datum.label}</span>
            <span className="bar-chart__track">
              <span className="bar-chart__fill" style={{ width: `${widthPercent}%` }} />
            </span>
            <span className="bar-chart__value">{formatCount(datum.value)}</span>
          </li>
        );
      })}
    </ul>
  );
}
