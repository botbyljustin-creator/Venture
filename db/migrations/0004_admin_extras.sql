-- Adds account suspension support for the admin dashboard.
alter table public.profiles add column if not exists disabled boolean not null default false;
