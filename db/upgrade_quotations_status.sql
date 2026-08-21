-- Run this in the Supabase SQL Editor for an existing project.
alter table public.quotations
  add column if not exists gst_percent numeric;

update public.quotations
set gst_percent = 18
where gst_percent is null;

alter table public.quotations
  alter column gst_percent set default 18,
  alter column gst_percent set not null;

alter table public.quotations
  add column if not exists status text;

update public.quotations
set status = 'pending'
where status is null;

alter table public.quotations
  alter column status set default 'pending',
  alter column status set not null;

alter table public.quotations
  drop constraint if exists quotations_status_check;

alter table public.quotations
  add constraint quotations_status_check
  check (status in ('approved', 'pending', 'draft', 'rejected'));

notify pgrst, 'reload schema';