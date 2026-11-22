-- Run manually in Supabase SQL Editor after taking a DB backup.
-- NOT VALID preserves pre-existing rows; new/updated rows must pass checks.
-- Validate the constraints after resolving rows listed by operations-audit.sql.
begin;
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = clock_timestamp(); return new; end $$;

alter table public.dolls drop constraint if exists dolls_input_limits;
alter table public.dolls add constraint dolls_input_limits check (
  length(name) between 1 and 80 and length(slug) between 1 and 100
  and slug ~ '^[a-z0-9-]+$' and length(weapon_type) between 1 and 80
  and length(attribute) <= 80 and length(default_note) <= 1000
  and length(common_key) <= 200 and length(common_key_effect) <= 3000
  and display_order >= 0 and cardinality(recommended_sets) <= 100
  and cardinality(recommended_muzzle) <= 4 and cardinality(recommended_parts) <= 3
  and not ('치명타 피해' = any(recommended_parts))
) not valid;

update storage.buckets set file_size_limit = 5242880,
  allowed_mime_types = array['image/webp','image/png','image/jpeg']
where id = 'doll-images';
commit;
