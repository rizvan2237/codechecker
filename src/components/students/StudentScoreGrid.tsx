import type { StudentScores } from '../../types/domain';
import { GlassCard } from '../ui/GlassCard';
import { ProgressBar } from '../ui/ProgressBar';

export function StudentScoreGrid({ scores }: { scores: StudentScores }) {
  return (
    <GlassCard title="Coding scores" description="Each score runs from 0 to 100 and is computed from submissions.">
      <div className="score-grid">
        <ProgressBar label="Coding progress" value={scores.codingProgress} />
        <ProgressBar label="Consistency" value={scores.consistency} />
        <ProgressBar label="Medium and Hard share" value={scores.difficultyProgression} />
        <ProgressBar label="Topic coverage" value={scores.topicCoverage} />
      </div>
    </GlassCard>
  );
}
