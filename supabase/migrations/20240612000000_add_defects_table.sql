-- Add Defects Table for Work Order Defect Tracking
-- Stores discovered defects with before/after photos and location tracking

create table defects (
  id                uuid primary key default gen_random_uuid(),
  work_order_id     uuid references work_orders(id) on delete cascade,
  project_id        uuid references projects(id) on delete cascade not null,
  title             text not null,
  description       text,
  location          text not null
                    check (location in ('Deck', 'Engine Room', 'Hull', 'Propeller', 'Rudder', 'Valves', 'Piping', 'Electrical', 'Other')),
  severity          text not null default 'Medium'
                    check (severity in ('Low', 'Medium', 'High', 'Critical')),
  status            text not null default 'Open'
                    check (status in ('Open', 'In Progress', 'Closed', 'Deferred')),

  -- Photo references (stored as JSON for flexibility)
  photo_before_url  text,
  photo_after_url   text,

  -- Tracking
  reported_by       uuid references auth.users(id),
  assigned_to       uuid references auth.users(id),

  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  closed_at         timestamptz
);

-- Add RLS policies for defects
alter table defects enable row level security;

create policy "Users see own org defects"
  on defects for all
  using (
    project_id in (
      select id from projects where organization_id = my_org_id()
    )
  );

-- Add index for faster queries
create index idx_defects_project_id on defects(project_id);
create index idx_defects_work_order_id on defects(work_order_id);
create index idx_defects_status on defects(status);
create index idx_defects_location on defects(location);

-- Auto update trigger for defects
create trigger set_defects_updated_at before update on defects
  for each row execute function update_updated_at();
