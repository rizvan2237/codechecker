import { GlassCard } from './GlassCard';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <GlassCard className="stat-card">
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {hint !== undefined && <span className="stat-card__hint">{hint}</span>}
    </GlassCard>
  );
}
