# Migration Notes: `public.users` -> `public.app_users`

These notes apply if you previously created the schema with `public.users` referencing `auth.users`.

## New baseline

- The schema now uses `public.app_users` as the main users table.
- All user-linked tables reference `public.app_users` via foreign keys.

## If you are starting fresh

1. Drop and recreate your database, then run:
   - `database/001_schema.sql`
   - `database/002_seed_data.sql`

## If you already have data

1. Create `public.app_users` (if not already created) using the current `database/001_schema.sql`.
2. Migrate existing user rows from `public.users` into `public.app_users`.
3. Update foreign keys in user-linked tables to reference `public.app_users`.
4. Drop `public.users` if it is no longer used.

Note: Because existing deployments can vary, do the data migration in a controlled way (export, validate, re-import).
