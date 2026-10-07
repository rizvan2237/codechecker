# Synthetic demo data

**All data in demo mode is fictional.** It exists so the dashboard can be built and shown
without real student records. Nothing in it describes a real person.

## 1. What gets generated

Every time the app starts in demo mode, it builds this dataset from a fixed seed:

| Item | Count | Source file |
| --- | --- | --- |
| Students | 500 | `data/synthetic/studentRecords.ts` |
| Problems | 300 | `data/synthetic/problemCatalogue.ts` |
| Submissions | about 44,000 (about 31,700 Accepted) | `data/synthetic/submissionGenerator.ts` |
| Assignments | 5 | `data/synthetic/assignmentGenerator.ts` |
| Assignment results | 2,500 (student × assignment) | `data/synthetic/assignmentGenerator.ts` |
| Demo signals | 500 (one per student) | `data/synthetic/syntheticDataset.ts` |

Entry point: `loadSyntheticDataset()` in `data/synthetic/syntheticDataset.ts`.

## 2. Why the data is the same every time

`SYNTHETIC_RANDOM_SEED` in `src/config/constants.ts` starts a seeded random number generator
(`src/lib/random.ts`). Same seed gives the same students, the same submissions, and the same
charts. This makes bugs reproducible: if a chart looks wrong, it looks wrong for everyone.

To get different data, change the seed number.

## 3. Student profiles (personas)

There are 15 personas in `src/data/synthetic/personas.ts`. Students are assigned to them in a
repeating order, so each persona has about 33 students.

| # | Persona | Pattern |
| --- | --- | --- |
| 1 | Highly consistent student | 6 active days a week, steady, 40–90 solved |
| 2 | High-volume student | 120–180 solved, very active |
| 3 | Low-activity student | 5–20 solved, about 1 active day a week |
| 4 | Beginner | Mostly Easy, improving |
| 5 | Medium-level learner | Mostly Medium |
| 6 | Strong problem solver | 90–140 solved, many Hard |
| 7 | Strong Easy/Medium, weak Hard | Almost no Hard |
| 8 | Strong DSA, low consistency | Focuses on 4 topics, about 1 active day a week |
| 9 | High assignment completion | About 97% of assignment problems |
| 10 | Low assignment completion | About 15% of assignment problems |
| 11 | Improving student | Activity rises over the window |
| 12 | Declining activity student | Activity falls over the window |
| 13 | Topic-specialized student | Focuses on 2 topics |
| 14 | Balanced student | Mixed difficulty and activity |
| 15 | Synthetic review-signal student | Uniform activity, shows the REVIEW label |

Each persona's numbers are plain fields, so you can change one persona without touching the code
that uses it.

## 4. Problems

- Titles look like `Synthetic Problem 0001: Silver Ledger`. They are clearly fake.
- No problem statement text is stored. Do not add copied problem descriptions.
- Topics come from a fixed list of 16 (`PROBLEM_TOPICS`), including Arrays, Trees, and Dynamic Programming.
- Difficulty is roughly 40% Easy, 40% Medium, 20% Hard.
- Platform is LeetCode for most problems and HackerRank for every third one.

## 5. Submissions

- A solved problem has one or more attempts. The last attempt is always `Accepted`.
- Earlier attempts are `Wrong Answer` or `Time Limit Exceeded`.
- `runtimeMs` and `memoryKb` are random judge-style values. They are **not** solving times.
- Timestamps fall inside a 180-day window that ends on 2026-10-06 (UTC).

## 6. Demo signals

Each student has one demo signal: `LOW`, `NORMAL`, `REVIEW`, or `HIGH`.

- Each signal has `isDemo: true` and a note that says it is a demonstration.
- The UI always shows the words "Demonstration signal" next to the badge.
- A signal is a prompt for a human to look at a pattern. It is never a finding of cheating.
  Do not add automatic actions that depend on these labels.

## 7. Assignments

| Assignment | Week | Topics | Problems |
| --- | --- | --- | --- |
| Python Fundamentals - Week 1 | 1 | Strings, Math | 8 |
| Arrays Practice - Week 2 | 2 | Arrays, Two Pointers, Sliding Window | 8 |
| Linked List Training - Week 3 | 3 | Linked List, Stack, Queue | 8 |
| Trees Challenge - Week 4 | 4 | Trees, Graphs | 10 |
| Placement DSA Round 1 | 5 | Hash Table, Binary Search, DP, Greedy, Sorting | 12 |

Completion results come from each persona's completion rate plus a small random spread. They are
**not** calculated from the submissions. A real system would compute them from submissions.

Status rule (`src/analytics/assignmentStatus.ts`): **Completed** when at least 80% of the problems
are done (`ASSIGNMENT_COMPLETE_RATIO`), **Partial** when some are done, **Missing** when none are.

## 8. Names

Names are random combinations from short lists in `studentRecords.ts`. A combination may
match a real person by chance. The names were not copied from any real record.

## 9. How to replace synthetic data later

Demo data is built so it can be removed without touching the UI.

**To switch the whole app to real data:**
1. Set `VITE_DATA_SOURCE=supabase` in `.env.local` and restart the dev server.
2. The UI shows "Live database" instead of the demo badge. Nothing else changes.

**To remove the demo generator completely (after real data is loaded):**
1. Delete `src/data/synthetic/`.
2. Delete `src/data/repositories/syntheticRepository.ts`.
3. Remove the synthetic branch from `codingDataRepository.ts`.
4. Remove `SYNTHETIC_*` constants from `src/config/constants.ts`.
5. Run `npm run build`. Fix any import that still points to the deleted files.

**To remove demo rows from the database:**
```sql
delete from students where is_synthetic = true;   -- cascades to submissions, results, signals
delete from problems where is_synthetic = true;
delete from assignments where is_synthetic = true;
```
Check the row counts first with `select count(*) ...`. Deletes cannot be undone.

**To load demo rows into the database:** this is not in the base. It is a future task. The
recommended approach is a script in `scripts/` that reads the synthetic dataset and inserts rows
with `is_synthetic = true`.

## 10. Rules when editing synthetic data

- Keep everything fictional. Do not paste real names, IDs, or usernames.
- Keep the labels honest. Use "demonstration" wording for every signal.
- Keep judge runtime described as judge runtime.
- After changing a persona or the seed, check the dashboard and the Students page for empty charts.
