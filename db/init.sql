-- Supabase DB initialization for Quotation App
create extension if not exists "pgcrypto";

-- Drop existing tables to recreate them with the correct schema
drop table if exists quotation_items;
drop table if exists quotations;

create table quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text,
  customer_name text not null,
  company_name text,
  email text,
  phone text,
  quotation_date date not null,
  valid_until date,
  subtotal numeric not null,
  gst_percent numeric not null default 18,
  gst numeric not null,
  total numeric not null,
  status text not null default 'pending' check (status in ('approved', 'pending', 'draft', 'rejected')),
  created_at timestamptz default now(),
  user_id uuid not null references auth.users(id) on delete cascade
);

create table quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references quotations(id) on delete cascade,
  product_name text not null,
  quantity integer not null,
  unit_price numeric not null,
  discount numeric not null,
  amount numeric not null
);

-- Enable Row Level Security
alter table quotations enable row level security;
alter table quotation_items enable row level security;

-- Policies for quotations
create policy "Users can view their own quotations" 
  on quotations for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own quotations" 
  on quotations for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own quotations" 
  on quotations for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own quotations" 
  on quotations for delete 
  using (auth.uid() = user_id);

-- Policies for quotation_items
-- Users can manage items if they own the parent quotation
create policy "Users can view items of their quotations" 
  on quotation_items for select 
  using (exists (
    select 1 from quotations where quotations.id = quotation_items.quotation_id and quotations.user_id = auth.uid()
  ));

create policy "Users can insert items for their quotations" 
  on quotation_items for insert 
  with check (exists (
    select 1 from quotations where quotations.id = quotation_items.quotation_id and quotations.user_id = auth.uid()
  ));

create policy "Users can update items of their quotations" 
  on quotation_items for update 
  using (exists (
    select 1 from quotations where quotations.id = quotation_items.quotation_id and quotations.user_id = auth.uid()
  ));

create policy "Users can delete items of their quotations" 
  on quotation_items for delete 
  using (exists (
    select 1 from quotations where quotations.id = quotation_items.quotation_id and quotations.user_id = auth.uid()
  ));
