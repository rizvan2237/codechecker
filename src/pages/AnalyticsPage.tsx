import {
  DIFFICULTY_LEVELS,
  PLATFORM_CODES,
  PLATFORM_LABELS,
  SUBMISSION_STATUSES,
  TOP_TOPICS_LIMIT,
} from '../config/constants';
import {
  buildTopicChartData,
  countSubmissionsByPlatform,
  countSubmissionsByStatus,
  sumSolvedByDifficulty,
} from '../analytics/datasetStats';
import type { ReadyDataset } from '../types/domain';
import type { ChartDatum } from '../types/domain';
import { BarChart } from '../components/ui/BarChart';
import { DatasetGate } from '../components/ui/DatasetGate';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';

export function AnalyticsPage() {
  return <DatasetGate>{(ready) => <AnalyticsContent {...ready} />}</DatasetGate>;
}

function AnalyticsContent({ dataset, summaries }: ReadyDataset) {
  const solvedByDifficulty = sumSolvedByDifficulty(summaries);
  const statusCounts = countSubmissionsByStatus(dataset.submissions);
  const platformCounts = countSubmissionsByPlatform(dataset.submissions);

  const difficultyChart: ChartDatum[] = DIFFICULTY_LEVELS.map((level) => ({
    label: level,
    value: solvedByDifficulty[level],
  }));
  const statusChart: ChartDatum[] = SUBMISSION_STATUSES.map((status) => ({
    label: status,
    value: statusCounts[status],
  }));
  const platformChart: ChartDatum[] = PLATFORM_CODES.map((code) => ({
    label: PLATFORM_LABELS[code],
    value: platformCounts[code],
  }));

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="How solving and submissions are spread across the cohort."
      />
      <div className="two-column">
        <GlassCard title="Submission results" description="Every submission, grouped by judge result.">
          <BarChart data={statusChart} />
        </GlassCard>
        <GlassCard title="Submissions by platform">
          <BarChart data={platformChart} />
        </GlassCard>
      </div>
      <div className="two-column">
        <GlassCard title="Solved by difficulty">
          <BarChart data={difficultyChart} />
        </GlassCard>
        <GlassCard title={`Top ${TOP_TOPICS_LIMIT} topics`} description="Most solved topics across the cohort.">
          <BarChart data={buildTopicChartData(summaries, TOP_TOPICS_LIMIT)} />
        </GlassCard>
      </div>
    </>
  );
}
