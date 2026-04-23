
-- Fix function search paths
create or replace function public.handle_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

-- Replace broad public select on storage.objects with a per-object policy that does NOT allow listing
drop policy if exists "Pet photos publicly readable" on storage.objects;

-- Public READ via direct URL is handled by the public bucket flag.
-- Restrict storage.objects SELECT to the owner only (prevents anonymous listing of all files).
create policy "Owners can list own pet photos"
  on storage.objects for select
  using (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);
