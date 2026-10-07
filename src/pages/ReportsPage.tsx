import { useMemo } from 'react';
import { DatasetGate } from '../components/ui/DatasetGate';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { REPORT_DEFINITIONS, type ReportDefinition } from '../features/reports/reportDefinitions';
import type { ReadyDataset } from '../types/domain';
import { downloadTextFile, toCsv } from '../lib/csv';
import { formatCount } from '../lib/format';

export function ReportsPage() {
  return <DatasetGate>{(ready) => <ReportsContent {...ready} />}</DatasetGate>;
}

function ReportsContent(ready: ReadyDataset) {
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Download CSV files. Each file records whether its data is synthetic or live."
      />
      {REPORT_DEFINITIONS.map((report) => (
        <ReportCard key={report.id} report={report} ready={ready} />
      ))}
    </>
  );
}

interface ReportCardProps {
  report: ReportDefinition;
  ready: ReadyDataset;
}

function ReportCard({ report, ready }: ReportCardProps) {
  const rows = useMemo(() => report.buildRows(ready), [report, ready]);

  function handleDownload() {
    const fileName = `codechecker-${report.id}-${ready.dataset.source}.csv`;
    downloadTextFile(fileName, toCsv(rows));
  }

  return (
    <GlassCard title={report.title} description={report.description}>
      <div className="report-actions">
        <span className="muted-text">
          {formatCount(rows.length)} rows · source: {ready.dataset.source}
        </span>
        <button type="button" className="button" onClick={handleDownload} disabled={rows.length === 0}>
          Download CSV
        </button>
      </div>
    </GlassCard>
  );
}
