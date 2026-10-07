/**
 * Loads the dataset once and shares it with every page.
 * Pages read dataset, summaries, loading state, and errors from here.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildStudentSummaries } from '../analytics/studentSummaries';
import { getCodingDataRepository } from '../data/repositories/codingDataRepository';
import { describeError } from '../lib/errors';
import type { CodingDataset, StudentSummary } from '../types/domain';

export interface DatasetContextValue {
  dataset: CodingDataset | null;
  summaries: StudentSummary[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => void;
}

const DatasetContext = createContext<DatasetContextValue | null>(null);

export function DatasetProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<CodingDataset | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState<number>(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    setErrorMessage(null);

    getCodingDataRepository()
      .loadDataset()
      .then((loadedDataset) => {
        if (isCurrent) setDataset(loadedDataset);
      })
      .catch((error: unknown) => {
        if (isCurrent) setErrorMessage(describeError(error));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt]);

  const reload = useCallback(() => setLoadAttempt((current) => current + 1), []);

  const summaries = useMemo(() => (dataset ? buildStudentSummaries(dataset) : []), [dataset]);

  const value = useMemo<DatasetContextValue>(
    () => ({ dataset, summaries, isLoading, errorMessage, reload }),
    [dataset, summaries, isLoading, errorMessage, reload],
  );

  return <DatasetContext.Provider value={value}>{children}</DatasetContext.Provider>;
}

export function useDataset(): DatasetContextValue {
  const value = useContext(DatasetContext);
  if (value === null) {
    throw new Error('useDataset must be used inside DatasetProvider.');
  }
  return value;
}
