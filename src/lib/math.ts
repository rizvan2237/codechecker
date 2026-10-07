import { PERCENT_SCALE } from '../config/constants';

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

/** Converts a ratio (0 to 1, can be above 1) into a whole percent from 0 to 100. */
export function toPercent(ratio: number): number {
  return Math.round(clamp(ratio, 0, 1) * PERCENT_SCALE);
}

/** Rounded average. Returns 0 for an empty list instead of NaN. */
export function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round(total / values.length);
}
