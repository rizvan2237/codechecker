import type { AnomalySignal } from '../../types/domain';
import { GlassCard } from '../ui/GlassCard';
import { anomalyToneFor, StatusBadge } from '../ui/StatusBadge';

interface AnomalyPanelProps {
  anomaly: AnomalySignal | null;
}

/** Shows the demo signal and its disclaimer. Signals are prompts for review, not findings. */
export function AnomalyPanel({ anomaly }: AnomalyPanelProps) {
  return (
    <GlassCard
      title="Demo signal"
      description="A generated label for demonstration. It describes an activity pattern and is not a finding about the student."
    >
      {anomaly === null ? (
        <p className="muted-text">No demo signal is attached to this student.</p>
      ) : (
        <div className="anomaly-panel">
          <div className="badge-row">
            <StatusBadge tone={anomalyToneFor(anomaly.level)}>{anomaly.level}</StatusBadge>
            {anomaly.isDemo && <StatusBadge tone="demo">Demonstration signal</StatusBadge>}
          </div>
          <p>{anomaly.note}</p>
        </div>
      )}
    </GlassCard>
  );
}
