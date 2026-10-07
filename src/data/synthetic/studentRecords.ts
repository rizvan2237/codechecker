/** Creates fictional student records. Names are made-up combinations, not taken from real records. */
import {
  MAX_STUDY_YEAR,
  MIN_STUDY_YEAR,
  SYNTHETIC_ID_PAD_LENGTH,
} from '../../config/constants';
import { shuffle, type RandomSource } from '../../lib/random';
import type { Student } from '../../types/domain';
import type { SyntheticPersona } from './personas';

export interface SyntheticStudentPlan {
  student: Student;
  persona: SyntheticPersona;
  /** Languages this student uses. Submissions pick from this list. */
  languages: string[];
}

const FIRST_NAMES = ['Aarav', 'Diya', 'Kiran', 'Meera', 'Rohan', 'Sana', 'Vikram', 'Ananya', 'Nikhil', 'Ishita', 'Arjun', 'Kavya', 'Tarun', 'Priya', 'Manav', 'Lakshmi', 'Farhan', 'Neha', 'Siddharth', 'Pooja'];
const LAST_NAMES = ['Sharma', 'Rao', 'Iyer', 'Menon', 'Kulkarni', 'Patel', 'Reddy', 'Nair', 'Gowda', 'Joshi', 'Mehta', 'Verma', 'Das', 'Shetty', 'Pillai', 'Chopra'];
const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil'];
const SECTIONS = ['A', 'B', 'C'];
const LANGUAGE_OPTIONS = ['Python', 'Java', 'C++', 'C', 'JavaScript'];
const MIN_LANGUAGES_PER_STUDENT = 1;
const MAX_LANGUAGES_PER_STUDENT = 3;

/** Personas are assigned in a repeating order, so every persona appears about equally often. */
export function buildStudentPlans(
  count: number,
  personas: readonly SyntheticPersona[],
  random: RandomSource,
): SyntheticStudentPlan[] {
  return Array.from({ length: count }, (_unused, index) => {
    const persona = personas[index % personas.length];
    return {
      student: buildStudent(index, persona, random),
      persona,
      languages: pickLanguages(random),
    };
  });
}

function buildStudent(index: number, persona: SyntheticPersona, random: RandomSource): Student {
  const studentCode = `SYN-${String(index + 1).padStart(SYNTHETIC_ID_PAD_LENGTH, '0')}`;
  return {
    id: studentCode,
    name: `${random.pick(FIRST_NAMES)} ${random.pick(LAST_NAMES)}`,
    department: random.pick(DEPARTMENTS),
    year: random.int(MIN_STUDY_YEAR, MAX_STUDY_YEAR),
    section: random.pick(SECTIONS),
    leetcodeUsername: `demo-lc-${studentCode.toLowerCase()}`,
    hackerrankUsername: `demo-hr-${studentCode.toLowerCase()}`,
    demoPersona: persona.label,
  };
}

function pickLanguages(random: RandomSource): string[] {
  const languageCount = random.int(MIN_LANGUAGES_PER_STUDENT, MAX_LANGUAGES_PER_STUDENT);
  return shuffle(LANGUAGE_OPTIONS, random).slice(0, languageCount);
}
