/**
 * Score formulas. Each returns a whole number from 0 to 100.
 *
 * coding progress  = solved problems / TARGET_SOLVED_PROBLEMS
 * consistency      = active days in the last 90 days / 30 (capped at 100%)
 * difficulty mix   = share of solved problems at Medium or Hard
 * topic coverage   = topics with at least one solve / all topics in catalogue
 *
 * Difficulty mix describes the kind of problems a student solves.
 * It does not measure improvement over time.
 */
import { CONSISTENCY_TARGET_ACTIVE_DAYS, DIFFICULTY_LEVELS, TARGET_SOLVED_PROBLEMS } from '../config/constants';
import { toPercent } from '../lib/math';
import type { Difficulty } from '../types/domain';

export function calculateCodingProgressScore(solvedCount: number): number {
  return toPercent(solvedCount / TARGET_SOLVED_PROBLEMS);
}

export function calculateConsistencyScore(activeDays: number): number {
  return toPercent(activeDays / CONSISTENCY_TARGET_ACTIVE_DAYS);
}

export function calculateDifficultyProgressionScore(
  solvedByDifficulty: Record<Difficulty, number>,
): number {
  const solvedTotal = DIFFICULTY_LEVELS.reduce((sum, level) => sum + solvedByDifficulty[level], 0);
  if (solvedTotal === 0) return 0;
  const mediumAndHard = solvedByDifficulty.Medium + solvedByDifficulty.Hard;
  return toPercent(mediumAndHard / solvedTotal);
}

export function calculateTopicCoverageScore(topicsCovered: number, totalTopics: number): number {
  if (totalTopics === 0) return 0;
  return toPercent(topicsCovered / totalTopics);
}
