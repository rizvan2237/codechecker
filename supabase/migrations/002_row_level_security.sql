-- =====================================================================
-- Row Level Security (RLS)
-- Only signed-in staff can read academic data.
-- Run after 001_core_schema.sql.
-- =====================================================================

-- True when the signed-in user has a staff row.
create or replace function is_staff_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff where profile_id = auth.uid()
  );
$$;

alter table profiles enable row level security;
alter table staff enable row level security;
alter table students enable row level security;
alter table platforms enable row level security;
alter table coding_profiles enable row level security;
alter table problems enable row level security;
alter table submissions enable row level security;
alter table assignments enable row level security;
alter table assignment_problems enable row level security;
alter table assignment_results enable row level security;
alter table analytics enable row level security;
alter table anomaly_signals enable row level security;
alter table analysis_jobs enable row level security;
alter table sync_logs enable row level security;

-- Profiles: each user can read and update only their own profile.
create policy "profiles_select_own" on profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_update_own" on profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Staff: a staff member can read their own staff row.
create policy "staff_select_own" on staff
  for select to authenticated using (profile_id = auth.uid());

-- Reference data: any signed-in staff member can read.
create policy "platforms_read_staff" on platforms
  for select to authenticated using (is_staff_member());

-- Academic data: staff can read everything.
create policy "students_read_staff" on students
  for select to authenticated using (is_staff_member());
create policy "coding_profiles_read_staff" on coding_profiles
  for select to authenticated using (is_staff_member());
create policy "problems_read_staff" on problems
  for select to authenticated using (is_staff_member());
create policy "submissions_read_staff" on submissions
  for select to authenticated using (is_staff_member());
create policy "assignments_read_staff" on assignments
  for select to authenticated using (is_staff_member());
create policy "assignment_problems_read_staff" on assignment_problems
  for select to authenticated using (is_staff_member());
create policy "assignment_results_read_staff" on assignment_results
  for select to authenticated using (is_staff_member());
create policy "analytics_read_staff" on analytics
  for select to authenticated using (is_staff_member());
create policy "anomaly_signals_read_staff" on anomaly_signals
  for select to authenticated using (is_staff_member());
create policy "sync_logs_read_staff" on sync_logs
  for select to authenticated using (is_staff_member());

-- Writes: staff can manage students, coding profiles, assignments and jobs.
-- Submissions, analytics and sync logs are written by server jobs (service role),
-- which bypasses RLS. Add staff write policies there only when needed.
create policy "students_write_staff" on students
  for all to authenticated using (is_staff_member()) with check (is_staff_member());
create policy "coding_profiles_write_staff" on coding_profiles
  for all to authenticated using (is_staff_member()) with check (is_staff_member());
create policy "assignments_write_staff" on assignments
  for all to authenticated using (is_staff_member()) with check (is_staff_member());
create policy "assignment_problems_write_staff" on assignment_problems
  for all to authenticated using (is_staff_member()) with check (is_staff_member());
create policy "analysis_jobs_write_staff" on analysis_jobs
  for all to authenticated using (is_staff_member()) with check (is_staff_member());
