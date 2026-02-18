create table if not exists legal_acceptances (
    id uuid primary key default gen_random_uuid(),
    parent_id uuid not null references parents(id) on delete cascade,
    document_type text not null,
    version text not null,
    accepted_at timestamp with time zone default now(),
    user_agent text
);

alter table legal_acceptances enable row level security;

create policy "Parent can view own acceptances"
on legal_acceptances
for select
using (parent_id = auth.uid());

create policy "Parent can insert own acceptance"
on legal_acceptances
for insert
with check (parent_id = auth.uid());
