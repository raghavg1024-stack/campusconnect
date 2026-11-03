-- Roles are shared by many users; only user IDs and emails must be unique.
-- Authorization uses verified Supabase Auth app_metadata, never this column.
begin;
alter table public."USER" drop constraint if exists "USER_role_key";
commit;
