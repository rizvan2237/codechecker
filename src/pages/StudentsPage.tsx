import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ReadyDataset } from '../types/domain';
import {
  buildFilterOptions,
  EMPTY_STUDENT_FILTERS,
  filterStudentSummaries,
  type StudentFilters,
} from '../features/students/studentFilters';
import { formatCount } from '../lib/format';
import { DatasetGate } from '../components/ui/DatasetGate';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { SelectFilter } from '../components/ui/SelectFilter';
import { EmptyState } from '../components/ui/StateMessages';
import { StudentTable } from '../components/students/StudentTable';

export function StudentsPage() {
  return <DatasetGate>{(ready) => <StudentsContent {...ready} />}</DatasetGate>;
}

function StudentsContent({ summaries }: ReadyDataset) {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';
  const [filters, setFilters] = useState<StudentFilters>({ ...EMPTY_STUDENT_FILTERS, search: searchFromUrl });

  // The top bar search changes the URL. Keep the filter in sync with it.
  useEffect(() => {
    setFilters((current) => ({ ...current, search: searchFromUrl }));
  }, [searchFromUrl]);

  const filterOptions = useMemo(() => buildFilterOptions(summaries), [summaries]);
  const visibleSummaries = useMemo(() => filterStudentSummaries(summaries, filters), [summaries, filters]);

  function updateFilter<Key extends keyof StudentFilters>(key: Key, value: StudentFilters[Key]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={`${formatCount(visibleSummaries.length)} of ${formatCount(summaries.length)} students shown`}
      />

      <GlassCard>
        <div className="filters-bar">
          <SearchInput
            value={filters.search}
            onChange={(value) => updateFilter('search', value)}
            placeholder="Name, student ID, or username"
          />
          <SelectFilter
            label="Department"
            value={filters.department}
            options={filterOptions.departments}
            onChange={(value) => updateFilter('department', value)}
          />
          <SelectFilter
            label="Year"
            value={filters.year}
            options={filterOptions.years}
            onChange={(value) => updateFilter('year', value)}
          />
          <SelectFilter
            label="Section"
            value={filters.section}
            options={filterOptions.sections}
            onChange={(value) => updateFilter('section', value)}
          />
          <SelectFilter
            label="Demo signal"
            value={filters.signalLevel}
            options={filterOptions.signalLevels}
            onChange={(value) => updateFilter('signalLevel', value)}
          />
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setFilters(EMPTY_STUDENT_FILTERS)}
          >
            Clear filters
          </button>
        </div>
      </GlassCard>

      {visibleSummaries.length === 0 ? (
        <EmptyState
          title="No students match these filters"
          description="Try a different search, or clear the filters to see everyone."
        />
      ) : (
        <StudentTable summaries={visibleSummaries} />
      )}
    </>
  );
}
