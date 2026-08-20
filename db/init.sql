-- Supabase DB initialization for Quotation App
create extension if not exists "pgcrypto";

create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text,
  customer_name text not null,
  company_name text,
  email text,
  phone text,
  quotation_date date not null,
  valid_until date,
  subtotal numeric,
  gst numeric,
  total numeric,
  created_at timestamptz default now()
);

create table if not exists quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid references quotations(id) on delete cascade,
  product_name text not null,
  quantity integer not null,
  unit_price numeric not null,
  discount numeric not null,
  amount numeric not null
);

-- Optional: simple policies (uncomment and adapt if RLS enabled)
-- alter table quotations enable row level security;
-- create policy "allow authenticated" on quotations
--   for all using (auth.role() = 'authenticated');
