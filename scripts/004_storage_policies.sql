-- Add storage policies for trade-screenshots bucket to fix RLS upload errors

-- Ensure bucket exists and is public
insert into storage.buckets (id, name, public)
select 'trade-screenshots', 'trade-screenshots', true
where not exists (select 1 from storage.buckets where id = 'trade-screenshots');

-- Public read access for this bucket
create policy "public read trade screenshots"
on storage.objects
for select
to public
using (bucket_id = 'trade-screenshots');

-- Allow authenticated users to upload (insert) into this bucket
create policy "upload trade screenshots"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'trade-screenshots');

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
