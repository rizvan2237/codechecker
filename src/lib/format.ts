/** Display helpers. Keep formatting rules here, not inside components. */

const DISPLAY_LOCALE = 'en-IN';

export function formatCount(value: number): string {
  return value.toLocaleString(DISPLAY_LOCALE);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

export function formatDateTime(isoText: string | null): string {
  if (isoText === null) return 'No activity yet';
  return new Date(isoText).toLocaleString(DISPLAY_LOCALE, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
