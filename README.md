# Fish App Workspace

## Project structure

- `frontend/` - Vue + Vite client
- `backend/` - FastAPI + YOLO + PostgreSQL API
- `database/` - SQL schema and seed scripts
- `docs/` - deployment and operations notes

## Local development

1. Create and seed PostgreSQL (`fish_db`) using:
   - `database/001_schema.sql`
   - `database/002_seed_data.sql`
2. Start backend:
   - `cd backend`
   - create virtualenv and install `requirements.txt`
   - set `backend/.env` (see `backend/.env.example`)
   - run `python main.py`
3. Start frontend:
   - `cd frontend`
   - `npm install`
   - set `frontend/.env` with `VITE_API_BASE_URL=http://localhost:8000`
   - run `npm run dev:frontend`

## Deployment

Recommended beta/public stack:

- Frontend on Vercel
- Backend on Render
- Database on Neon

See full steps in `docs/DEPLOYMENT.md`.

## Database notes

- Authentication uses local `public.app_users` (not Supabase `auth.users`).
- User-linked tables reference `public.app_users`.
- For older schemas using `public.users`, see `database/MIGRATION_NOTES.md`.
