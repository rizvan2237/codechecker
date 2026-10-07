import { PERCENT_SCALE } from '../../config/constants';
import { formatPercent } from '../../lib/format';
import { clamp } from '../../lib/math';

interface ProgressBarProps {
  label: string;
  /** 0 to 100 */
  value: number;
}

export function ProgressBar({ label, value }: ProgressBarProps) {
  const safeValue = clamp(value, 0, PERCENT_SCALE);
  return (
    <div className="progress">
      <div className="progress__header">
        <span>{label}</span>
        <strong>{formatPercent(safeValue)}</strong>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={PERCENT_SCALE}
        aria-valuenow={safeValue}
      >
        <div className="progress__fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
