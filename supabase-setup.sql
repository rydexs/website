-- RYDEXS: enquiries table for the website forms.
-- Run once in Supabase → SQL Editor → New query → Run.

create table if not exists public.enquiries (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  source      text not null check (source in ('contact', 'planner', 'callback')),
  page        text check (char_length(page) <= 100),
  name        text check (char_length(name) <= 100),
  phone       text check (phone ~ '^[0-9]{10}$'),
  travel_date date,
  travellers  int  check (travellers between 1 and 500),
  destination text check (char_length(destination) <= 100),
  trip_type   text check (char_length(trip_type) <= 50),
  message     text check (char_length(message) <= 2000),
  status      text not null default 'new'
);

-- Website visitors may only ADD enquiries, never read, edit or delete them.
alter table public.enquiries enable row level security;

revoke all on public.enquiries from anon, authenticated;
grant insert (source, page, name, phone, travel_date, travellers, destination, trip_type, message)
  on public.enquiries to anon, authenticated;

drop policy if exists "Website can submit enquiries" on public.enquiries;
create policy "Website can submit enquiries"
  on public.enquiries for insert
  to anon, authenticated
  with check (true);
