-- Drop old policies if they exist to avoid duplicates
drop policy if exists "public read trade screenshots" on storage.objects;
drop policy if exists "upload trade screenshots" on storage.objects;
drop policy if exists "update own trade screenshots" on storage.objects;
drop policy if exists "delete own trade screenshots" on storage.objects;

-- Ensure bucket exists and is public
insert into storage.buckets (id, name, public)
select 'trade-screenshots', 'trade-screenshots', true
where not exists (select 1 from storage.buckets where id = 'trade-screenshots');

-- Public read (view screenshots)
create policy "public read trade screenshots"
on storage.objects
for select
to public
using (bucket_id = 'trade-screenshots');

-- Allow authenticated users to upload into this bucket (owner is set by the storage service)
create policy "upload trade screenshots"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'trade-screenshots' and owner = auth.uid());

-- Allow authenticated users to update their own objects
create policy "update own trade screenshots"
on storage.objects
for update
to authenticated
using (bucket_id = 'trade-screenshots' and owner = auth.uid());

-- Allow authenticated users to delete their own objects
create policy "delete own trade screenshots"
on storage.objects
for delete
to authenticated
using (bucket_id = 'trade-screenshots' and owner = auth.uid());
