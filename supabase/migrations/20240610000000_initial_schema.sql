-- WALER DRYDOCK - Initial Database Schema
-- Run this in Supabase Dashboard > SQL Editor

-- ORGANIZATIONS
create table organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz default now()
);

-- PROFILES
create table profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid references organizations(id),
  full_name       text,
  role            text not null default 'VIEWER'
                  check (role in ('ADMIN','MANAGER','INSPECTOR','VIEWER')),
  created_at      timestamptz default now()
);

-- VESSELS
create table vessels (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  name            text not null,
  imo_number      text unique,
  flag            text,
  vessel_type     text,
  created_at      timestamptz default now()
);

-- PROJECTS
create table projects (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) not null,
  vessel_id       uuid references vessels(id) not null,
  name            text not null,
  status          text not null default 'PLANNING'
                  check (status in ('PLANNING','TENDERING','AWARDED','IN_PROGRESS','COMPLETED','CANCELLED')),
  planned_start   date,
  planned_end     date,
  actual_start    date,
  actual_end      date,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- WORK ORDERS
create table work_orders (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade not null,
  sfi_code    text,
  title       text not null,
  description text,
  category    text,
  priority    text not null default 'NORMAL'
              check (priority in ('LOW','NORMAL','HIGH','CRITICAL')),
  status      text not null default 'PENDING'
              check (status in ('PENDING','IN_PROGRESS','COMPLETED','ON_HOLD','CANCELLED')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- WORK ORDER UPDATES
create table work_order_updates (
  id              uuid primary key default gen_random_uuid(),
  work_order_id   uuid references work_orders(id) on delete cascade not null,
  user_id         uuid references auth.users(id) not null,
  progress        integer not null check (progress between 0 and 100),
  note            text,
  offline_id      text,
  created_at      timestamptz default now()
);

-- TENDERS
create table tenders (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references projects(id) on delete cascade not null,
  yard_name    text not null,
  yard_country text,
  status       text not null default 'DRAFT'
               check (status in ('DRAFT','SENT','RECEIVED','REJECTED','AWARDED')),
  sent_at      timestamptz,
  due_date     date,
  created_at   timestamptz default now()
);

-- QUOTATIONS
create table quotations (
  id          uuid primary key default gen_random_uuid(),
  tender_id   uuid references tenders(id) on delete cascade not null,
  total_amount numeric,
  currency    text default 'USD',
  notes       text,
  file_url    text,
  is_awarded  boolean default false,
  created_at  timestamptz default now()
);

-- DOCUMENTS
create table documents (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references projects(id),
  work_order_id uuid references work_orders(id),
  update_id     uuid references work_order_updates(id),
  name          text not null,
  doc_type      text not null
                check (doc_type in ('SPECIFICATION','QUOTATION','REPORT','PHOTO','CERTIFICATE','OTHER')),
  storage_path  text not null,
  mime_type     text,
  size_bytes    bigint,
  created_at    timestamptz default now()
);

-- REPORTS
create table reports (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade not null,
  report_type text not null
              check (report_type in ('PROGRESS_REPORT','COMPLETION_REPORT','WORK_ORDER_LIST','DAILY_REPORT')),
  status      text not null default 'PENDING'
              check (status in ('PENDING','GENERATING','READY','FAILED')),
  file_url    text,
  created_at  timestamptz default now()
);

-- Auto updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger set_updated_at before update on projects
  for each row execute function update_updated_at();
create trigger set_updated_at before update on work_orders
  for each row execute function update_updated_at();

-- RLS
alter table organizations enable row level security;
alter table vessels enable row level security;
alter table projects enable row level security;
alter table work_orders enable row level security;
alter table work_order_updates enable row level security;
alter table tenders enable row level security;
alter table quotations enable row level security;
alter table documents enable row level security;
alter table reports enable row level security;

create or replace function my_org_id()
returns uuid as $$
  select organization_id from profiles where id = auth.uid()
$$ language sql security definer;

create policy "Users see own org projects"
  on projects for all
  using (organization_id = my_org_id());

create policy "Users see own org vessels"
  on vessels for all
  using (organization_id = my_org_id());

create policy "Users see own org work_orders"
  on work_orders for all
  using (
    project_id in (
      select id from projects where organization_id = my_org_id()
    )
  );

create policy "Users see own org work_order_updates"
  on work_order_updates for all
  using (
    work_order_id in (
      select wo.id from work_orders wo
      join projects p on p.id = wo.project_id
      where p.organization_id = my_org_id()
    )
  );

create policy "Users see own org tenders"
  on tenders for all
  using (
    project_id in (
      select id from projects where organization_id = my_org_id()
    )
  );

create policy "Users see own org quotations"
  on quotations for all
  using (
    tender_id in (
      select t.id from tenders t
      join projects p on p.id = t.project_id
      where p.organization_id = my_org_id()
    )
  );

create policy "Users see own org documents"
  on documents for all
  using (
    project_id in (
      select id from projects where organization_id = my_org_id()
    )
  );

create policy "Users see own org reports"
  on reports for all
  using (
    project_id in (
      select id from projects where organization_id = my_org_id()
    )
  );