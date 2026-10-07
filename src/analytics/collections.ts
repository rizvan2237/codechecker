/** Small helpers for grouping and counting lists. */

export function groupBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return groups;
}

/** Keeps the last item for each key. Use only when keys are unique. */
export function indexBy<T, K>(items: readonly T[], keyOf: (item: T) => K): Map<K, T> {
  const index = new Map<K, T>();
  for (const item of items) {
    index.set(keyOf(item), item);
  }
  return index;
}

/** Builds an object with every key set to 0, so charts always show all categories. */
export function createZeroCounts<K extends string>(keys: readonly K[]): Record<K, number> {
  const counts = {} as Record<K, number>;
  for (const key of keys) {
    counts[key] = 0;
  }
  return counts;
}
