-- Read-only: run in SQL Editor. This does not prove effective permissions for
-- every role; use the role test matrix in OPERATIONS.md in a staging project.
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies where (schemaname = 'public' and tablename in ('dolls','app_admins','user_doll_settings'))
or (schemaname = 'storage' and tablename = 'objects');

select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('dolls','app_admins','user_doll_settings');

select conname, convalidated from pg_constraint where conrelid = 'public.dolls'::regclass;
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'doll-images';

select id, name from public.dolls where
  length(name) not between 1 and 80 or length(slug) not between 1 and 100
  or slug !~ '^[a-z0-9-]+$' or length(weapon_type) not between 1 and 80
  or length(attribute) > 80 or length(default_note) > 1000 or length(common_key) > 200
  or length(common_key_effect) > 3000 or display_order < 0
  or cardinality(recommended_sets) > 100 or cardinality(recommended_muzzle) > 4
  or cardinality(recommended_parts) > 3 or '치명타 피해' = any(recommended_parts);

-- Candidate orphan images older than 7 days. Review URLs and DB backups before
-- removal using the Storage API or Dashboard. NEVER delete storage.objects rows
-- directly: that does not remove the underlying files. No auto-deletion here.
select o.name, o.created_at, o.metadata->>'size' as bytes
from storage.objects o where o.bucket_id = 'doll-images'
and o.created_at < now() - interval '7 days'
and not exists (
  select 1 from public.dolls d
  where split_part(d.image_url, '?', 1) like '%/storage/v1/object/public/doll-images/' || o.name
);
