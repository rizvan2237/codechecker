/**
 * Creates synthetic submissions for one student.
 * Runtime and memory values are JUDGE-STYLE DEMO NUMBERS. They are not real
 * measurements and not how long a student took to solve a problem.
 */
import {
  DAYS_PER_WEEK,
  DIFFICULTY_LEVELS,
  MS_PER_DAY,
  SYNTHETIC_ACTIVITY_WINDOW_DAYS,
  SYNTHETIC_END_DATE_ISO,
} from '../../config/constants';
import { clamp } from '../../lib/math';
import { shuffle, type RandomSource } from '../../lib/random';
import type { Difficulty, Problem, Submission, SubmissionStatus } from '../../types/domain';
import type { SyntheticPersona } from './personas';
import { PROBLEM_TOPICS } from './problemCatalogue';
import type { SyntheticStudentPlan } from './studentRecords';

const MS_PER_SECOND = 1000;
const SECONDS_PER_DAY = 24 * 60 * 60;
const EXTRA_ATTEMPT_CHANCE = 0.25;
const MAX_WRONG_ATTEMPTS = 2;
const WRONG_ATTEMPT_STATUSES: readonly SubmissionStatus[] = ['Wrong Answer', 'Time Limit Exceeded'];
const JUDGE_RUNTIME_RANGE_MS: readonly [number, number] = [20, 1500];
const TIME_LIMIT_RUNTIME_RANGE_MS: readonly [number, number] = [2000, 3000];
const JUDGE_MEMORY_RANGE_KB: readonly [number, number] = [12000, 90000];

export function generateSubmissionsForStudent(
  plan: SyntheticStudentPlan,
  problems: readonly Problem[],
  random: RandomSource,
): Submission[] {
  const focusTopics = pickFocusTopics(plan.persona.focusTopicCount, random);
  const candidates = focusTopics.length > 0
    ? problems.filter((problem) => focusTopics.includes(problem.topic))
    : problems;

  const solvedProblems = chooseSolvedProblems(candidates, plan.persona, random);
  const activeDayIndexes = buildActiveDayIndexes(plan.persona, random);

  return solvedProblems.flatMap((problem) =>
    buildAttemptsForProblem(plan, problem, activeDayIndexes, random),
  );
}

function pickFocusTopics(focusTopicCount: number, random: RandomSource): string[] {
  if (focusTopicCount === 0) return [];
  return shuffle(PROBLEM_TOPICS, random).slice(0, focusTopicCount);
}

/** Picks distinct solved problems. Stops early if the pool runs out. */
function chooseSolvedProblems(
  candidates: readonly Problem[],
  persona: SyntheticPersona,
  random: RandomSource,
): Problem[] {
  const targetCount = random.int(persona.solvedRange[0], persona.solvedRange[1]);
  const pools = createDifficultyPools(candidates, random);
  const chosen: Problem[] = [];

  while (chosen.length < targetCount) {
    const preferredDifficulty = rollDifficulty(persona.difficultyWeights, random);
    const nextProblem = takeNextProblem(pools, preferredDifficulty);
    if (nextProblem === undefined) break;
    chosen.push(nextProblem);
  }

  return chosen;
}

function createDifficultyPools(candidates: readonly Problem[], random: RandomSource): Map<Difficulty, Problem[]> {
  const pools = new Map<Difficulty, Problem[]>();
  for (const level of DIFFICULTY_LEVELS) {
    pools.set(level, shuffle(candidates.filter((problem) => problem.difficulty === level), random));
  }
  return pools;
}

/** Takes from the preferred difficulty if possible, otherwise from any other difficulty. */
function takeNextProblem(pools: Map<Difficulty, Problem[]>, preferred: Difficulty): Problem | undefined {
  const searchOrder = [preferred, ...DIFFICULTY_LEVELS.filter((level) => level !== preferred)];
  for (const level of searchOrder) {
    const problem = (pools.get(level) ?? []).pop();
    if (problem !== undefined) return problem;
  }
  return undefined;
}

function rollDifficulty(weights: Readonly<Record<Difficulty, number>>, random: RandomSource): Difficulty {
  const totalWeight = DIFFICULTY_LEVELS.reduce((sum, level) => sum + weights[level], 0);
  let roll = random.next() * totalWeight;
  for (const level of DIFFICULTY_LEVELS) {
    roll -= weights[level];
    if (roll <= 0) return level;
  }
  return DIFFICULTY_LEVELS[DIFFICULTY_LEVELS.length - 1];
}

/** Day indexes (0 = first day of the window) when this student was active. */
function buildActiveDayIndexes(persona: SyntheticPersona, random: RandomSource): number[] {
  const baseChance = persona.activeDaysPerWeek / DAYS_PER_WEEK;
  const activeDays: number[] = [];

  for (let dayIndex = 0; dayIndex < SYNTHETIC_ACTIVITY_WINDOW_DAYS; dayIndex += 1) {
    const progress = dayIndex / (SYNTHETIC_ACTIVITY_WINDOW_DAYS - 1);
    const chance = clamp(baseChance * trendMultiplier(persona.activityTrend, progress), 0, 1);
    if (random.chance(chance)) activeDays.push(dayIndex);
  }

  // Every student has at least one active day so the record is never empty.
  return activeDays.length > 0 ? activeDays : [SYNTHETIC_ACTIVITY_WINDOW_DAYS - 1];
}

function trendMultiplier(trend: SyntheticPersona['activityTrend'], progress: number): number {
  if (trend === 'improving') return 0.5 + progress;
  if (trend === 'declining') return 1.5 - progress;
  return 1;
}

/** One solved problem becomes one or more attempts. The last attempt is always Accepted. */
function buildAttemptsForProblem(
  plan: SyntheticStudentPlan,
  problem: Problem,
  activeDayIndexes: number[],
  random: RandomSource,
): Submission[] {
  const wrongAttemptCount = random.chance(EXTRA_ATTEMPT_CHANCE) ? random.int(1, MAX_WRONG_ATTEMPTS) : 0;
  const attemptCount = wrongAttemptCount + 1;
  const dayIndexes = Array.from({ length: attemptCount }, () => random.pick(activeDayIndexes)).sort(
    (first, second) => first - second,
  );

  return dayIndexes.map((dayIndex, attemptIndex) => {
    const isFinalAttempt = attemptIndex === attemptCount - 1;
    const status: SubmissionStatus = isFinalAttempt ? 'Accepted' : random.pick(WRONG_ATTEMPT_STATUSES);
    return buildSubmission(plan, problem, dayIndex, attemptIndex + 1, status, random);
  });
}

function buildSubmission(
  plan: SyntheticStudentPlan,
  problem: Problem,
  dayIndex: number,
  attemptNumber: number,
  status: SubmissionStatus,
  random: RandomSource,
): Submission {
  const runtimeRange = status === 'Time Limit Exceeded' ? TIME_LIMIT_RUNTIME_RANGE_MS : JUDGE_RUNTIME_RANGE_MS;
  return {
    id: `${plan.student.id}-${problem.id}-${attemptNumber}`,
    studentId: plan.student.id,
    problemId: problem.id,
    platform: problem.platform,
    submittedAt: buildTimestamp(dayIndex, random),
    status,
    language: random.pick(plan.languages),
    runtimeMs: random.int(runtimeRange[0], runtimeRange[1]),
    memoryKb: random.int(JUDGE_MEMORY_RANGE_KB[0], JUDGE_MEMORY_RANGE_KB[1]),
    attemptNumber,
  };
}

/** Converts a day index into a UTC timestamp on that day, at a random time. */
function buildTimestamp(dayIndex: number, random: RandomSource): string {
  const daysBeforeEnd = SYNTHETIC_ACTIVITY_WINDOW_DAYS - 1 - dayIndex;
  const endOfWindowMs = Date.parse(SYNTHETIC_END_DATE_ISO);
  const secondOfDay = random.int(0, SECONDS_PER_DAY - 1);
  return new Date(endOfWindowMs - daysBeforeEnd * MS_PER_DAY + secondOfDay * MS_PER_SECOND).toISOString();
}
