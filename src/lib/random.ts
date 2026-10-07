/**
 * A small seeded random number generator (mulberry32).
 * The same seed always produces the same sequence, so the demo data
 * is identical on every machine and every run.
 */

export interface RandomSource {
  /** A number from 0 (inclusive) to 1 (exclusive). */
  next(): number;
  /** A whole number from minimum to maximum, both included. */
  int(minimum: number, maximum: number): number;
  /** One item chosen at random. The list must not be empty. */
  pick<T>(items: readonly T[]): T;
  /** True with the given probability (0 to 1). */
  chance(probability: number): boolean;
}

const UINT32_RANGE = 4294967296;
const MULBERRY_INCREMENT = 0x6d2b79f5;
const MULBERRY_MASK = 61;

export function createRandom(seed: number): RandomSource {
  let state = seed >>> 0;

  function next(): number {
    state = (state + MULBERRY_INCREMENT) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | MULBERRY_MASK);
    return ((value ^ (value >>> 14)) >>> 0) / UINT32_RANGE;
  }

  return {
    next,
    int(minimum, maximum) {
      return minimum + Math.floor(next() * (maximum - minimum + 1));
    },
    pick<T>(items: readonly T[]): T {
      return items[Math.floor(next() * items.length)];
    },
    chance(probability) {
      return next() < probability;
    },
  };
}

/** Returns a shuffled copy. The original list is not changed. */
export function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = random.int(0, index);
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }
  return copy;
}
