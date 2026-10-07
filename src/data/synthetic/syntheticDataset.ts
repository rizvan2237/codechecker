/**
 * Entry point for the synthetic demo data.
 * Builds everything once, then reuses the same object. Same seed = same data.
 */
import {
  SYNTHETIC_PROBLEM_COUNT,
  SYNTHETIC_RANDOM_SEED,
  SYNTHETIC_STUDENT_COUNT,
} from '../../config/constants';
import { createRandom } from '../../lib/random';
import type { AnomalySignal, CodingDataset } from '../../types/domain';
import { buildAssignmentResults, buildAssignments } from './assignmentGenerator';
import { buildProblemCatalogue } from './problemCatalogue';
import { SYNTHETIC_PERSONAS } from './personas';
import { generateSubmissionsForStudent } from './submissionGenerator';
import { buildStudentPlans, type SyntheticStudentPlan } from './studentRecords';

let cachedDataset: CodingDataset | null = null;

export function loadSyntheticDataset(): Promise<CodingDataset> {
  if (cachedDataset !== null) return Promise.resolve(cachedDataset);
  const dataset = buildSyntheticDataset();
  cachedDataset = dataset;
  return Promise.resolve(dataset);
}

export function buildSyntheticDataset(): CodingDataset {
  const random = createRandom(SYNTHETIC_RANDOM_SEED);
  const problems = buildProblemCatalogue(SYNTHETIC_PROBLEM_COUNT);
  const plans = buildStudentPlans(SYNTHETIC_STUDENT_COUNT, SYNTHETIC_PERSONAS, random);
  const assignments = buildAssignments(problems);

  const submissions = plans.flatMap((plan) => generateSubmissionsForStudent(plan, problems, random));
  const assignmentResults = plans.flatMap((plan) => buildAssignmentResults(plan, assignments, random));

  return {
    source: 'synthetic',
    students: plans.map((plan) => plan.student),
    problems,
    submissions,
    assignments,
    assignmentResults,
    anomalySignals: plans.map(buildAnomalySignal),
  };
}

function buildAnomalySignal(plan: SyntheticStudentPlan): AnomalySignal {
  return {
    studentId: plan.student.id,
    level: plan.persona.anomalyLevel,
    note: plan.persona.anomalyNote,
    isDemo: true,
  };
}
