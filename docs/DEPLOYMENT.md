# Deployment Guide (Vercel + Render + Neon)

## Target setup

- Frontend: Vercel
- Backend API/ML: Render Web Service
- Database: Neon Postgres

## Recommended project layout

Keep your current structure and treat each folder as a separate deploy root:

- `frontend/` -> Vercel Root Directory
- `backend/` -> Render Root Directory
- `database/` -> SQL migrations/seeds

Optional later refactor if you want monorepo style naming:

- `apps/frontend`
- `apps/backend`
- `database/migrations`

## 1) Neon database

1. Create a Neon project and copy the pooled connection string.
2. Run:
   - `database/001_schema.sql`
   - `database/002_seed_data.sql`
3. Use the Neon URL as `DATABASE_URL` in Render.

## 2) Backend on Render

### Service settings

- Runtime: Python
- Root Directory: `backend`
- Build Command: `pip install --no-cache-dir -r requirements-render.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment variables

- `DATABASE_URL=<neon pooled postgres url>`
- `PUBLIC_BASE_URL=https://<your-service>.onrender.com`
- `CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://<your-vercel-domain>`
- `UPLOADS_DIR=/tmp/uploads`
- `MODEL_DIR=/opt/render/project/src/backend/models`
- `PYTHON_VERSION=3.11.9`

### Notes

- `backend/main.py` now supports:
  - env-based CORS origins
  - absolute upload URLs for frontend usage
  - env-based model/upload paths
- `backend/requirements-render.txt` is optimized for Render and pins CPU PyTorch wheels.
- `backend/runtime.txt` pins Python 3.11.9 for Render compatibility.
- If you need persistent image storage, add a Render disk mounted at `/var/data` and change `UPLOADS_DIR=/var/data/uploads`.

## 3) Frontend on Vercel

### Project settings

- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### Environment variable

- `VITE_API_BASE_URL=https://<your-service>.onrender.com`

### SPA routing

`frontend/vercel.json` includes rewrite fallback so Vue routes work on refresh.

## 4) Pre-launch checklist

- Backend health endpoint responds: `/api/health`
- CORS includes your Vercel production URL
- Upload + identify + history flow works end-to-end
- Database migrations and seed data are applied in Neon
- Model files exist in `backend/models` (or update `MODEL_DIR`)
