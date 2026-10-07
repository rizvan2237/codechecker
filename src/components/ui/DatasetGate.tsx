import type { ReactNode } from 'react';
import { useDataset } from '../../context/DatasetContext';
import type { ReadyDataset } from '../../types/domain';
import { EmptyState, ErrorState, LoadingState } from './StateMessages';

interface DatasetGateProps {
  children: (ready: ReadyDataset) => ReactNode;
}

/**
 * Shows loading, error, or empty states. Only renders children once data is ready.
 * Pages use it like this: <DatasetGate>{(ready) => <Content {...ready} />}</DatasetGate>
 */
export function DatasetGate({ children }: DatasetGateProps) {
  const { dataset, summaries, isLoading, errorMessage, reload } = useDataset();

  if (isLoading) return <LoadingState />;
  if (errorMessage !== null) return <ErrorState message={errorMessage} onRetry={reload} />;
  if (dataset === null) {
    return <EmptyState title="No data available" description="The data source returned nothing to show." />;
  }

  return <>{children({ dataset, summaries })}</>;
}
