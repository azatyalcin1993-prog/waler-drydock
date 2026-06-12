-- Add Daily Reports Table for Project Daily Progress Tracking
-- Stores daily updates including weather, manpower, completed works, safety incidents

create table if not exists daily_reports (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null,
  report_date       date not null,

  -- Weather & Environment
  weather           text check (weather in ('Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Windy', 'Foggy')),
  temperature       text,

  -- Manpower Tracking
  crew_count        integer default 0,
  contractor_count  integer default 0,

  -- Daily Works
  completed_works   text not null,
  delay_reasons     text,
  safety_incidents  text,

  -- Photos (stored as JSON array of URLs)
  photos            jsonb default '[]'::jsonb,

  -- Notes
  notes             text,

  -- Creator
  created_by        uuid,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),

  -- Ensure unique report per project per day
  unique(project_id, report_date)
);

-- Add RLS
alter table daily_reports enable row level security;

create policy "Enable all for authenticated users"
  on daily_reports for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Indexes
create index if not exists idx_daily_reports_project_id on daily_reports(project_id);
create index if not exists idx_daily_reports_report_date on daily_reports(report_date);
create index if not exists idx_daily_reports_project_date on daily_reports(project_id, report_date);