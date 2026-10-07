-- =====================================================================
-- CodeChecker core schema
-- Target: Supabase PostgreSQL 15 or newer.
-- Run this file first, then 002_row_level_security.sql.
-- Run each migration only once. Re-running will fail on existing tables.
-- =====================================================================

-- Shared helper: keeps updated_at correct on every UPDATE.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: one row per login account (linked to Supabase auth.users).
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- staff: placement training staff who use the dashboard.
create table staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references profiles (id) on delete cascade,
  department text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- students: one row per student. student_code is the readable ID shown in the UI
-- (for example SYN-0001 in demo data).
create table students (
  id uuid primary key default gen_random_uuid(),
  student_code text not null unique,
  full_name text not null,
  department text not null,
  year_of_study smallint not null check (year_of_study between 1 and 4),
  section text not null,
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index students_department_idx on students (department);
create index students_year_section_idx on students (year_of_study, section);

-- platforms: coding sites we read from (LeetCode, HackerRank, future).
-- Adding a platform is an INSERT, not a schema change.
create table platforms (
  id bigint generated always as identity primary key,
  code text not null unique,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into platforms (code, display_name)
values ('leetcode', 'LeetCode'), ('hackerrank', 'HackerRank')
on conflict (code) do nothing;

-- coding_profiles: a student's username on one platform.
-- A student can have at most one profile per platform.
create table coding_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  platform_id bigint not null references platforms (id),
  username text not null,
  profile_url text,
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coding_profiles_student_platform_key unique (student_id, platform_id),
  constraint coding_profiles_platform_username_key unique (platform_id, username)
);

-- problems: catalogue of problems from all platforms.
create table problems (
  id uuid primary key default gen_random_uuid(),
  platform_id bigint not null references platforms (id),
  external_problem_id text not null,
  title text not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  topic text not null,
  tags text[] not null default '{}',
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint problems_platform_external_key unique (platform_id, external_problem_id)
);

create index problems_topic_idx on problems (topic);
create index problems_difficulty_idx on problems (difficulty);

-- submissions: one row per attempt a student made on a problem.
-- runtime_ms and memory_kb are judge measurements, NOT solving time.
create table submissions (
  id bigint generated always as identity primary key,
  student_id uuid not null references students (id) on delete cascade,
  problem_id uuid not null references problems (id) on delete cascade,
  platform_id bigint not null references platforms (id),
  external_submission_id text,
  submitted_at timestamptz not null,
  status text not null check (status in ('Accepted', 'Wrong Answer', 'Time Limit Exceeded')),
  language text not null,
  runtime_ms integer check (runtime_ms is null or runtime_ms >= 0),
  memory_kb integer check (memory_kb is null or memory_kb >= 0),
  attempt_number integer not null default 1 check (attempt_number >= 1),
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index submissions_student_submitted_idx on submissions (student_id, submitted_at desc);
create index submissions_problem_idx on submissions (problem_id);
create index submissions_status_idx on submissions (status);

-- assignments: practice sets given to students (for example "Arrays Practice - Week 2").
create table assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null unique,
  week_number smallint not null check (week_number >= 1),
  due_date date,
  created_by uuid references staff (id) on delete set null,
  is_synthetic boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- assignment_problems: which problems belong to which assignment, in order.
create table assignment_problems (
  assignment_id uuid not null references assignments (id) on delete cascade,
  problem_id uuid not null references problems (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (assignment_id, problem_id)
);

create index assignment_problems_problem_idx on assignment_problems (problem_id);

-- assignment_results: summary of one student's progress on one assignment.
create table assignment_results (
  student_id uuid not null references students (id) on delete cascade,
  assignment_id uuid not null references assignments (id) on delete cascade,
  completed_count integer not null default 0 check (completed_count >= 0),
  total_count integer not null check (total_count >= 0),
  status text not null check (status in ('Completed', 'Partial', 'Missing')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, assignment_id),
  constraint assignment_results_count_check check (completed_count <= total_count)
);

create index assignment_results_assignment_idx on assignment_results (assignment_id);

-- analytics: precomputed metrics per student (filled later by a background job).
create table analytics (
  id bigint generated always as identity primary key,
  student_id uuid not null references students (id) on delete cascade,
  metric_name text not null,
  metric_value numeric(10, 2) not null,
  computed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analytics_student_metric_key unique (student_id, metric_name)
);

-- anomaly_signals: one current demonstration or review signal per student.
-- is_demo = true means the value was generated for the demo.
-- Signals are prompts for human review, never proof of misconduct.
create table anomaly_signals (
  id bigint generated always as identity primary key,
  student_id uuid not null unique references students (id) on delete cascade,
  signal_level text not null check (signal_level in ('LOW', 'NORMAL', 'REVIEW', 'HIGH')),
  note text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- analysis_jobs: background work requests (for example "analyse this batch").
create table analysis_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references profiles (id) on delete set null,
  job_type text not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- sync_logs: history of platform sync attempts, for debugging.
create table sync_logs (
  id bigint generated always as identity primary key,
  platform_id bigint not null references platforms (id),
  student_id uuid references students (id) on delete set null,
  sync_status text not null check (sync_status in ('started', 'succeeded', 'failed', 'skipped')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sync_logs_platform_created_idx on sync_logs (platform_id, created_at desc);

-- updated_at triggers for every table that has the column.
create or replace trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create or replace trigger staff_set_updated_at before update on staff
  for each row execute function set_updated_at();
create or replace trigger students_set_updated_at before update on students
  for each row execute function set_updated_at();
create or replace trigger platforms_set_updated_at before update on platforms
  for each row execute function set_updated_at();
create or replace trigger coding_profiles_set_updated_at before update on coding_profiles
  for each row execute function set_updated_at();
create or replace trigger problems_set_updated_at before update on problems
  for each row execute function set_updated_at();
create or replace trigger submissions_set_updated_at before update on submissions
  for each row execute function set_updated_at();
create or replace trigger assignments_set_updated_at before update on assignments
  for each row execute function set_updated_at();
create or replace trigger assignment_problems_set_updated_at before update on assignment_problems
  for each row execute function set_updated_at();
create or replace trigger assignment_results_set_updated_at before update on assignment_results
  for each row execute function set_updated_at();
create or replace trigger analytics_set_updated_at before update on analytics
  for each row execute function set_updated_at();
create or replace trigger anomaly_signals_set_updated_at before update on anomaly_signals
  for each row execute function set_updated_at();
create or replace trigger analysis_jobs_set_updated_at before update on analysis_jobs
  for each row execute function set_updated_at();
create or replace trigger sync_logs_set_updated_at before update on sync_logs
  for each row execute function set_updated_at();
