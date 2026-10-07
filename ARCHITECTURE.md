# Architecture

This document explains how CodeChecker is organised, so that a human developer can find
and fix problems without asking the code's author.

## 1. Layers

The code is split into layers. Each layer only talks to the layer directly below it.

```
┌──────────────────────────────────────────────────────────────┐
│ Pages (src/pages)                                            │
│   Choose what to show. Hold no business rules.               │
├──────────────────────────────────────────────────────────────┤
│ Components (src/components) and Context (src/context)        │
│   Draw things. DatasetContext loads data once for all pages. │
├──────────────────────────────────────────────────────────────┤
│ Features (src/features) and Analytics (src/analytics)        │
│   Filters, report rows, scores, summaries. Pure functions.   │
├──────────────────────────────────────────────────────────────┤
│ Repositories (src/data/repositories)                         │
│   One place that returns a CodingDataset.                    │
├───────────────────────────────┬──────────────────────────────┤
│ Synthetic generator           │ Supabase client              │
│ (src/data/synthetic)          │ (src/lib/supabaseClient.ts)  │
└───────────────────────────────┴──────────────────────────────┘
```

Rules that keep the code readable:

1. Pages never call Supabase directly. They read from `useDataset()` or `DatasetGate`.
2. Analytics functions do not import React. You can test them with plain data.
3. Only `src/data/repositories` knows where data comes from.
4. Numbers used in more than one place live in `src/config/constants.ts`.

## 2. The data flow

1. `main.tsx` renders `App`.
2. `App` wraps the routes in `DatasetProvider`.
3. `DatasetProvider` calls `getCodingDataRepository().loadDataset()` once.
4. The repository is chosen from `VITE_DATA_SOURCE`:
   - `synthetic` → `loadSyntheticDataset()` builds the demo data (same seed every time).
   - `supabase` → `supabaseCodingDataRepository` reads the tables page by page and maps the rows.
5. The provider builds `StudentSummary` objects with `buildStudentSummaries()`.
6. Pages wrap their content in `DatasetGate`. It shows loading, error, or the page content.

Both repositories return the same `CodingDataset` shape (see `src/types/domain.ts`). This is
the most important design choice: **the UI never needs to know whether data is synthetic.**

## 3. Folder guide

| Folder | Put here | Do not put here |
| --- | --- | --- |
| `pages/` | One component per route | Score maths, Supabase queries |
| `components/ui/` | Generic widgets (cards, bars, badges) | Anything about students |
| `components/students/` | Pieces only used on student screens | Page layout |
| `components/layout/` | Sidebar, top bar, page frame | Data loading |
| `context/` | Data loading and sharing | Drawing |
| `analytics/` | Formulas and summaries | `import React` |
| `features/` | Filters, report definitions | Network calls |
| `data/synthetic/` | Fake data generation | Real data |
| `data/repositories/` | Reading data sources | Formatting for the screen |
| `config/` | Constants, environment, nav links | Logic |
| `lib/` | Generic helpers | App-specific rules |
| `types/` | Shared types | Functions |

## 4. Score definitions

All scores are whole numbers from 0 to 100. The formulas are in
`src/analytics/scoreCalculator.ts`.

| Score | Formula | Meaning |
| --- | --- | --- |
| Coding progress | solved ÷ 150 (capped at 100) | How many problems the student has solved |
| Consistency | active days in last 90 ÷ 30 (capped at 100) | How often the student practises |
| Medium and Hard share | (Medium + Hard) ÷ all solved | The mix of harder problems. It is not a measure of improvement over time |
| Topic coverage | topics with a solve ÷ all topics | Breadth across the catalogue |

"Solved" means at least one `Accepted` submission for that problem.

"Active day" means a calendar day (UTC) with any submission. The 90-day window ends at the
newest submission in the data, not at today's date. This keeps old demo data meaningful.

Change these numbers in `src/config/constants.ts`, not in the formulas.

## 5. Judge runtime is not solving time

Submissions include `runtimeMs` and `memoryKb`. These are judge measurements of one run.
They are **not** how long a student spent solving a problem. The UI labels them "Judge runtime"
on purpose. Do not add a "time to solve" feature from this data.

## 6. Styling

The design is a Liquid Glass theme written in plain CSS (`src/styles/global.css`).
Colours, blur, borders, and radius are CSS variables in `:root`. To change the look, edit
those variables first.

We did not add Tailwind or a component library. This keeps the number of dependencies small
and makes styles easy to find by searching for a class name.

## 7. How future LeetCode integration should connect

Do not write LeetCode code into the pages or the analytics. Add it as a new source of rows.

Recommended steps:

1. **Check the rules first.** LeetCode and HackerRank have terms of service and may not allow
   automated scraping. Check whether an official API, an export, or staff-approved manual
   import is allowed before writing any collector. Store approvals and limits in the README.
2. **Define an adapter interface** in `src/data/platforms/` (create this folder), for example:
   ```ts
   export interface PlatformAdapter {
     platform: PlatformCode;
     fetchSubmissions(username: string, since: string): Promise<PlatformSubmission[]>;
   }
   ```
   One file per platform implements it: `leetcodeAdapter.ts`, `hackerrankAdapter.ts`.
3. **Run sync as a server job, not in the browser.** Supabase Edge Functions or a small Node
   worker can call the adapter with a service role key. Browsers must never hold that key.
4. **Write to the database tables.** Map the platform data to `problems`, `submissions`,
   and `coding_profiles`. Use `external_problem_id` and `external_submission_id` to avoid
   duplicates. Write one `sync_logs` row for each attempt so failures can be debugged.
5. **Recalculate analytics** into `analytics` and `anomaly_signals`, or keep computing them in
   `src/analytics` from the rows, as now.
6. **Mark the data.** Set `is_synthetic = false` on real rows. The UI shows a badge that comes
   from `dataset.source`, so real and demo data are never mixed silently.

## 8. Authentication (not in the base yet)

The base has no login screen. Supabase RLS policies already expect a signed-in staff member
(`is_staff_member()`). Add these in a later step:

1. Supabase Auth sign-in page (email link or Google sign-in).
2. A `profiles` row and a `staff` row for each approved staff member.
3. A route guard in `App.tsx` that redirects anonymous users to sign-in.

Until then, live mode works only if the anon key is allowed by RLS, which it normally is not.
Keep live mode for development until auth is added.

## 9. Error handling

- Loading errors are caught in `DatasetProvider`. They show an error box with a retry button.
- Repository errors include the table name or the setting to change, so they are easy to read.
- Pure functions never throw for normal empty data. Empty lists produce empty states.
- Unknown platform codes or missing student IDs throw an error with the exact row ID.
