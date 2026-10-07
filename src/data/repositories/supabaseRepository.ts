/**
 * Loads the same CodingDataset shape from Supabase tables.
 * Rows are read raw, then mapped into the app's domain types.
 * Column names here must match supabase/migrations/001_core_schema.sql.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { groupBy } from '../../analytics/collections';
import { PLATFORM_CODES, SUPABASE_PAGE_SIZE } from '../../config/constants';
import { getSupabaseClient } from '../../lib/supabaseClient';
import type {
  Assignment,
  AssignmentResult,
  AssignmentStatus,
  AnomalyLevel,
  AnomalySignal,
  CodingDataset,
  Difficulty,
  PlatformCode,
  Problem,
  Student,
  Submission,
  SubmissionStatus,
} from '../../types/domain';
import type { CodingDataRepository } from './codingDataRepository';

// ----- Raw row shapes, exactly as the database returns them -----
interface PlatformRow { id: number; code: string; }
interface StudentRow { id: string; student_code: string; full_name: string; department: string; year_of_study: number; section: string; }
interface CodingProfileRow { student_id: string; platform_id: number; username: string; }
interface ProblemRow { id: string; platform_id: number; title: string; difficulty: Difficulty; topic: string; tags: string[]; }
interface SubmissionRow {
  id: number;
  student_id: string;
  problem_id: string;
  platform_id: number;
  submitted_at: string;
  status: SubmissionStatus;
  language: string;
  runtime_ms: number | null;
  memory_kb: number | null;
  attempt_number: number;
}
interface AssignmentRow { id: string; title: string; week_number: number; }
interface AssignmentProblemRow { assignment_id: string; problem_id: string; sort_order: number; }
interface AssignmentResultRow {
  student_id: string;
  assignment_id: string;
  completed_count: number;
  total_count: number;
  status: AssignmentStatus;
}
interface AnomalySignalRow { student_id: string; signal_level: AnomalyLevel; note: string; is_demo: boolean; }

interface RawRows {
  platforms: PlatformRow[];
  students: StudentRow[];
  codingProfiles: CodingProfileRow[];
  problems: ProblemRow[];
  submissions: SubmissionRow[];
  assignments: AssignmentRow[];
  assignmentProblems: AssignmentProblemRow[];
  assignmentResults: AssignmentResultRow[];
  anomalySignals: AnomalySignalRow[];
}

export const supabaseCodingDataRepository: CodingDataRepository = {
  async loadDataset(): Promise<CodingDataset> {
    const client = getSupabaseClient();
    if (client === null) {
      throw new Error(
        'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local, then restart the dev server.',
      );
    }
    const rawRows = await readAllRawRows(client);
    return mapRowsToDataset(rawRows);
  },
};

async function readAllRawRows(client: SupabaseClient): Promise<RawRows> {
  // Reads run one after another. This is slower but easier to debug.
  return {
    platforms: await fetchAllRows<PlatformRow>(client, 'platforms', ['id']),
    students: await fetchAllRows<StudentRow>(client, 'students', ['id']),
    codingProfiles: await fetchAllRows<CodingProfileRow>(client, 'coding_profiles', ['id']),
    problems: await fetchAllRows<ProblemRow>(client, 'problems', ['id']),
    submissions: await fetchAllRows<SubmissionRow>(client, 'submissions', ['id']),
    assignments: await fetchAllRows<AssignmentRow>(client, 'assignments', ['id']),
    assignmentProblems: await fetchAllRows<AssignmentProblemRow>(client, 'assignment_problems', ['assignment_id', 'problem_id']),
    assignmentResults: await fetchAllRows<AssignmentResultRow>(client, 'assignment_results', ['student_id', 'assignment_id']),
    anomalySignals: await fetchAllRows<AnomalySignalRow>(client, 'anomaly_signals', ['id']),
  };
}

/**
 * Reads every row of a table, one page at a time.
 * Ordering by unique columns keeps pages from skipping or repeating rows.
 */
async function fetchAllRows<T>(client: SupabaseClient, tableName: string, orderColumns: readonly string[]): Promise<T[]> {
  const allRows: T[] = [];
  let rangeStart = 0;

  for (;;) {
    let query = client.from(tableName).select('*');
    for (const column of orderColumns) {
      query = query.order(column, { ascending: true });
    }
    const rangeEnd = rangeStart + SUPABASE_PAGE_SIZE - 1;
    const { data, error } = await query.range(rangeStart, rangeEnd);

    if (error) {
      throw new Error(`Could not read the "${tableName}" table: ${error.message}`);
    }

    const pageRows = (data ?? []) as T[];
    allRows.push(...pageRows);
    if (pageRows.length < SUPABASE_PAGE_SIZE) return allRows;
    rangeStart += SUPABASE_PAGE_SIZE;
  }
}

function mapRowsToDataset(rawRows: RawRows): CodingDataset {
  const platformCodes = buildPlatformCodeMap(rawRows.platforms);
  const studentCodes = new Map<string, string>();
  for (const row of rawRows.students) {
    studentCodes.set(row.id, row.student_code);
  }

  return {
    source: 'supabase',
    students: mapStudents(rawRows, platformCodes),
    problems: rawRows.problems.map((row) => mapProblem(row, platformCodes)),
    submissions: rawRows.submissions.map((row) => mapSubmission(row, platformCodes, studentCodes)),
    assignments: mapAssignments(rawRows.assignments, rawRows.assignmentProblems),
    assignmentResults: rawRows.assignmentResults.map((row) => mapAssignmentResult(row, studentCodes)),
    anomalySignals: rawRows.anomalySignals.map((row) => mapAnomalySignal(row, studentCodes)),
  };
}

function buildPlatformCodeMap(rows: PlatformRow[]): Map<number, PlatformCode> {
  const codes = new Map<number, PlatformCode>();
  for (const row of rows) {
    codes.set(row.id, toPlatformCode(row.code));
  }
  return codes;
}

function toPlatformCode(text: string): PlatformCode {
  const isKnown = (PLATFORM_CODES as readonly string[]).includes(text);
  if (!isKnown) {
    throw new Error(`Unknown platform code "${text}". Add it to PLATFORM_CODES in src/config/constants.ts.`);
  }
  return text as PlatformCode;
}

function requirePlatformCode(platformCodes: Map<number, PlatformCode>, platformId: number): PlatformCode {
  const code = platformCodes.get(platformId);
  if (code === undefined) {
    throw new Error(`Platform id ${platformId} exists in submissions or problems but not in the platforms table.`);
  }
  return code;
}

function mapStudents(rawRows: RawRows, platformCodes: Map<number, PlatformCode>): Student[] {
  const profilesByStudent = groupBy(rawRows.codingProfiles, (profile) => profile.student_id);

  return rawRows.students.map((row) => {
    const profiles = profilesByStudent.get(row.id) ?? [];
    return {
      id: row.student_code,
      name: row.full_name,
      department: row.department,
      year: row.year_of_study,
      section: row.section,
      leetcodeUsername: findUsername(profiles, platformCodes, 'leetcode'),
      hackerrankUsername: findUsername(profiles, platformCodes, 'hackerrank'),
      demoPersona: null,
    };
  });
}

function findUsername(
  profiles: CodingProfileRow[],
  platformCodes: Map<number, PlatformCode>,
  platformCode: PlatformCode,
): string | null {
  const match = profiles.find((profile) => platformCodes.get(profile.platform_id) === platformCode);
  return match === undefined ? null : match.username;
}

function mapProblem(row: ProblemRow, platformCodes: Map<number, PlatformCode>): Problem {
  return {
    id: row.id,
    title: row.title,
    platform: requirePlatformCode(platformCodes, row.platform_id),
    difficulty: row.difficulty,
    topic: row.topic,
    tags: row.tags,
  };
}

function mapSubmission(
  row: SubmissionRow,
  platformCodes: Map<number, PlatformCode>,
  studentCodes: Map<string, string>,
): Submission {
  const studentCode = studentCodes.get(row.student_id);
  if (studentCode === undefined) {
    throw new Error(`Submission ${row.id} points to a student that does not exist.`);
  }
  return {
    id: String(row.id),
    studentId: studentCode,
    problemId: row.problem_id,
    platform: requirePlatformCode(platformCodes, row.platform_id),
    submittedAt: row.submitted_at,
    status: row.status,
    language: row.language,
    runtimeMs: row.runtime_ms ?? 0,
    memoryKb: row.memory_kb ?? 0,
    attemptNumber: row.attempt_number,
  };
}

function mapAssignments(rows: AssignmentRow[], links: AssignmentProblemRow[]): Assignment[] {
  const linksByAssignment = groupBy(links, (link) => link.assignment_id);
  return rows.map((row) => {
    const orderedLinks = [...(linksByAssignment.get(row.id) ?? [])].sort(
      (first, second) => first.sort_order - second.sort_order,
    );
    return {
      id: row.id,
      title: row.title,
      weekNumber: row.week_number,
      problemIds: orderedLinks.map((link) => link.problem_id),
    };
  });
}

function mapAssignmentResult(row: AssignmentResultRow, studentCodes: Map<string, string>): AssignmentResult {
  return {
    studentId: studentCodes.get(row.student_id) ?? row.student_id,
    assignmentId: row.assignment_id,
    completedCount: row.completed_count,
    totalCount: row.total_count,
    status: row.status,
  };
}

function mapAnomalySignal(row: AnomalySignalRow, studentCodes: Map<string, string>): AnomalySignal {
  return {
    studentId: studentCodes.get(row.student_id) ?? row.student_id,
    level: row.signal_level,
    note: row.note,
    isDemo: row.is_demo,
  };
}
