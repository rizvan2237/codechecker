# Database

CodeChecker uses Supabase, which is PostgreSQL. The schema is written as plain SQL migrations
in `supabase/migrations/`. There is no ORM, so you can read every table definition directly.

## 1. Running the migrations

### Option A: Supabase dashboard (simplest)

1. Open your project and go to **SQL Editor**.
2. Click **New query**, paste the full contents of `001_core_schema.sql`, and click **Run**.
3. Create another query with `002_row_level_security.sql` and click **Run**.

### Option B: Supabase CLI (recommended for teams)

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

Use Option B once the team wants migrations tracked in Git.

### Rules for migrations

- Run each file **once**. The files are not idempotent, so rerunning them fails with "already exists".
- Never edit a migration after it has run on a shared project. Add a new file, for example
  `003_add_something.sql`.
- Keep the migration names in order. Supabase runs them alphabetically.

## 2. Tables

| Table | One row represents | Key links |
| --- | --- | --- |
| `profiles` | A login account | `id` = Supabase `auth.users.id` |
| `staff` | A placement staff member | `profile_id` → `profiles` |
| `students` | A student | Unique `student_code` (readable ID) |
| `platforms` | A coding site (`leetcode`, `hackerrank`, future ones) | Unique `code` |
| `coding_profiles` | A student's username on one platform | `student_id`, `platform_id` (unique pair) |
| `problems` | A problem in the catalogue | `platform_id`; unique `(platform_id, external_problem_id)` |
| `submissions` | One attempt on one problem | `student_id`, `problem_id`, `platform_id` |
| `assignments` | A practice set such as "Arrays Practice - Week 2" | Unique `title` |
| `assignment_problems` | Which problems an assignment contains, in order | Composite primary key |
| `assignment_results` | One student's result on one assignment | Composite primary key |
| `analytics` | A precomputed metric for one student | Unique `(student_id, metric_name)` |
| `anomaly_signals` | The current demo or review signal for one student | Unique `student_id` |
| `analysis_jobs` | A background job request | `requested_by` → `profiles` |
| `sync_logs` | One platform sync attempt, for debugging | `platform_id`, optional `student_id` |

### Shared conventions

- Every table has `created_at` and `updated_at`. A trigger sets `updated_at` on every update.
- Primary keys are `uuid` for most tables. `submissions`, `anomaly_signals`, `analytics`, and
  `sync_logs` use `bigint` identities because they grow quickly.
- `is_synthetic` marks demo rows. Delete all rows where `is_synthetic = true` to remove the
  demo data from a shared project.
- Enumerated values (difficulty, status, signal level) use `check` constraints. Adding a new value
  requires changing the constraint in a new migration.

### Indexes

Indexes are added where the dashboard filters or sorts:

- `students (department)`, `students (year_of_study, section)`
- `problems (topic)`, `problems (difficulty)`
- `submissions (student_id, submitted_at desc)`, `submissions (problem_id)`, `submissions (status)`
- `assignment_problems (problem_id)`, `assignment_results (assignment_id)`
- `sync_logs (platform_id, created_at desc)`

## 3. Relationships

```
profiles 1─1 staff
students 1─* coding_profiles *─1 platforms
students 1─* submissions *─1 problems *─1 platforms
assignments *─* problems        (through assignment_problems)
students *─* assignments        (through assignment_results)
students 1─* analytics
students 1─1 anomaly_signals
students 1─* sync_logs *─1 platforms
```

## 4. Row Level Security (RLS)

`002_row_level_security.sql` turns RLS on for every table.

- Signed-in users can read only their own `profiles` row.
- Signed-in **staff** (a row in `staff`, found by `is_staff_member()`) can read academic data.
- Staff can insert, update, and delete students, coding profiles, assignments, and analysis jobs.
- Submissions, analytics, and sync logs have no staff write policy. They are written by server
  jobs using the `service_role` key, which bypasses RLS. Keep that key on the server only.

Anonymous users (not signed in) can read nothing. This is intentional.

To make someone staff, insert their rows in the SQL editor (replace the UUID with the user's ID):

```sql
insert into profiles (id, full_name, role)
values ('00000000-0000-0000-0000-000000000000', 'Placement Officer', 'staff');

insert into staff (profile_id, department)
values ('00000000-0000-0000-0000-000000000000', 'Placement Cell');
```

## 5. Mapping rows to the app

`src/data/repositories/supabaseRepository.ts` reads each table with pagination (1000 rows per
request, the Supabase default maximum) and maps the raw rows to the app's types:

| Table | App type | Notes |
| --- | --- | --- |
| `students` + `coding_profiles` | `Student` | `student_code` becomes `id` |
| `problems` + `platforms` | `Problem` | Platform id becomes a code |
| `submissions` | `Submission` | `id` becomes text |
| `assignments` + `assignment_problems` | `Assignment` | Problems ordered by `sort_order` |
| `assignment_results` | `AssignmentResult` | Student uuid becomes `student_code` |
| `anomaly_signals` | `AnomalySignal` | Same mapping |

Known gap: the base does not load `analytics` yet. Scores are computed in the app from the rows.

## 6. Checking the schema

After running the migrations, check these in the SQL Editor:

```sql
-- Should return 14 table names.
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;

-- Should return 2 rows: leetcode and hackerrank.
select code, display_name from platforms;
```

RLS check: switch to the **anon** role in the SQL Editor and run `select count(*) from students;`.
It must return 0.

## 7. Known limits of the base schema

- No table stores each problem's description. Only titles are stored, to avoid copying copyrighted text.
- Submission `status` allows three values. Add more values in a new migration when a platform needs them.
- Permissions are simple: any staff member can change any student. Add a department scope if needed.
