/**
 * Named constants for the whole app.
 * If a number appears in code, it should come from this file with a clear name.
 */
import type {
  AnomalyLevel,
  AssignmentStatus,
  Difficulty,
  PlatformCode,
  SubmissionStatus,
} from '../types/domain';

// ----- Labels shown to the user -----
export const APP_NAME = 'CodeChecker';
export const DEMO_DATA_LABEL = 'Synthetic Demo Data';
export const LIVE_DATA_LABEL = 'Live database';

// ----- Fixed value lists (used for filters, charts and validation) -----
export const DIFFICULTY_LEVELS: readonly Difficulty[] = ['Easy', 'Medium', 'Hard'];
export const PLATFORM_CODES: readonly PlatformCode[] = ['leetcode', 'hackerrank'];
export const PLATFORM_LABELS: Record<PlatformCode, string> = {
  leetcode: 'LeetCode',
  hackerrank: 'HackerRank',
};
export const SUBMISSION_STATUSES: readonly SubmissionStatus[] = [
  'Accepted',
  'Wrong Answer',
  'Time Limit Exceeded',
];
export const ASSIGNMENT_STATUSES: readonly AssignmentStatus[] = ['Completed', 'Partial', 'Missing'];
export const ANOMALY_LEVELS: readonly AnomalyLevel[] = ['LOW', 'NORMAL', 'REVIEW', 'HIGH'];

// ----- Time and formatting -----
export const MS_PER_DAY = 24 * 60 * 60 * 1000;
/** Length of "YYYY-MM-DD", used to get the calendar day from an ISO timestamp. */
export const DATE_PREFIX_LENGTH = 10;
export const PERCENT_SCALE = 100;

// ----- Score definitions (see ARCHITECTURE.md for the formulas) -----
/** Solved problems that count as a full coding progress score (100). */
export const TARGET_SOLVED_PROBLEMS = 150;
/** Length of the window used for consistency. */
export const CONSISTENCY_WINDOW_DAYS = 90;
/** Active days inside the window that count as a full consistency score (100). */
export const CONSISTENCY_TARGET_ACTIVE_DAYS = 30;

/** Share of an assignment's problems that must be done to count as Completed. */
export const ASSIGNMENT_COMPLETE_RATIO = 0.8;

// ----- Display limits -----
export const RECENT_SUBMISSIONS_LIMIT = 10;
export const TOP_TOPICS_LIMIT = 8;
export const ATTENTION_LIST_LIMIT = 5;

// ----- Supabase -----
/** The Supabase REST API returns at most 1000 rows per request by default. */
export const SUPABASE_PAGE_SIZE = 1000;

// ----- Synthetic demo dataset -----
export const SYNTHETIC_STUDENT_COUNT = 500;
export const SYNTHETIC_PROBLEM_COUNT = 300;
/** Same seed gives the same demo data every time. Change it to get different data. */
export const SYNTHETIC_RANDOM_SEED = 20261007;
export const SYNTHETIC_ACTIVITY_WINDOW_DAYS = 180;
/** The last day of generated activity. Dates are generated backwards from here. */
export const SYNTHETIC_END_DATE_ISO = '2026-10-06T00:00:00.000Z';
export const SYNTHETIC_ID_PAD_LENGTH = 4;
export const PROBLEM_ID_PAD_LENGTH = 4;
export const DAYS_PER_WEEK = 7;
export const MIN_STUDY_YEAR = 1;
export const MAX_STUDY_YEAR = 4;
