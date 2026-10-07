/** Filtering and search rules for the Students page. Pure functions, easy to test. */
import { ANOMALY_LEVELS } from '../../config/constants';
import type { StudentSummary } from '../../types/domain';

export const ALL_FILTER_VALUE = 'all';

export interface StudentFilters {
  search: string;
  department: string;
  year: string;
  section: string;
  signalLevel: string;
}

export const EMPTY_STUDENT_FILTERS: StudentFilters = {
  search: '',
  department: ALL_FILTER_VALUE,
  year: ALL_FILTER_VALUE,
  section: ALL_FILTER_VALUE,
  signalLevel: ALL_FILTER_VALUE,
};

export interface SelectOption {
  value: string;
  label: string;
}

export interface StudentFilterOptions {
  departments: SelectOption[];
  years: SelectOption[];
  sections: SelectOption[];
  signalLevels: SelectOption[];
}

export function buildFilterOptions(summaries: readonly StudentSummary[]): StudentFilterOptions {
  return {
    departments: toSelectOptions(uniqueSorted(summaries.map((summary) => summary.student.department)), 'All departments'),
    years: toSelectOptions(uniqueSorted(summaries.map((summary) => String(summary.student.year))), 'All years'),
    sections: toSelectOptions(uniqueSorted(summaries.map((summary) => summary.student.section)), 'All sections'),
    signalLevels: toSelectOptions([...ANOMALY_LEVELS], 'All demo signals'),
  };
}

export function filterStudentSummaries(
  summaries: readonly StudentSummary[],
  filters: StudentFilters,
): StudentSummary[] {
  const query = filters.search.trim().toLowerCase();
  return summaries.filter((summary) => {
    const { student } = summary;
    return (
      matchesSearch(student, query) &&
      matchesFilter(student.department, filters.department) &&
      matchesFilter(String(student.year), filters.year) &&
      matchesFilter(student.section, filters.section) &&
      matchesFilter(summary.anomaly?.level ?? '', filters.signalLevel)
    );
  });
}

function matchesSearch(student: StudentSummary['student'], lowerCaseQuery: string): boolean {
  if (lowerCaseQuery.length === 0) return true;
  const searchableText = [
    student.name,
    student.id,
    student.leetcodeUsername ?? '',
    student.hackerrankUsername ?? '',
  ];
  return searchableText.some((text) => text.toLowerCase().includes(lowerCaseQuery));
}

function matchesFilter(value: string, selected: string): boolean {
  return selected === ALL_FILTER_VALUE || value === selected;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function toSelectOptions(values: string[], allLabel: string): SelectOption[] {
  return [
    { value: ALL_FILTER_VALUE, label: allLabel },
    ...values.map((value) => ({ value, label: value })),
  ];
}
