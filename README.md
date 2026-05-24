# Careline Deployment Guide

This repository is split into:

- `frontend/`: Vite + React app (deploy to Vercel)
- `backend/`: Express + MongoDB API (deploy to Render)
- `ai/`: Python AI inference service (deploy to Render)

## 1. Backend Deployment (Render)

### Render Blueprint (recommended)

1. Push this repository to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Select your repository.
4. Render will detect `backend/render.yaml`.
5. Fill the required environment variables when prompted.

The Render blueprint also creates a separate Python AI service in `ai/` that the backend calls for doctor recommendations.

### Manual Web Service (alternative)

1. Create a new **Web Service** in Render.
2. Set:
	- Root Directory: `backend`
	- Build Command: `npm install`
	- Start Command: `npm start`
3. Add environment variables listed below.

### Required backend environment variables

Use `backend/.env.example` as the template.

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `CORS_ORIGIN` (your Vercel frontend URL, or comma-separated list)
- `FRONTEND_URL` (your Vercel frontend URL)
- `GOOGLE_CLIENT_ID`
- `GROQ_API_KEY`
- `EMAIL_USER`
- `EMAIL_PASS`
- `AI_SERVICE_URL` (the Render URL of the Python AI service, for example `https://your-ai-service.onrender.com`)

Health check endpoint:

- `GET /api/health`

### AI service deployment (Render)

The AI service runs from `ai/app.py` and exposes:

- `GET /api/health`
- `POST /api/ai/predict`
- `POST /api/ai/recommend`
- `POST /api/ai/quick-suggestion`

Render blueprint settings for the AI service:

- Root Directory: `ai`
- Build Command: `pip install -r requirements.txt && python train_model.py`
- Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT`

After deployment, copy the AI service URL into the backend `AI_SERVICE_URL` variable and redeploy the backend.

## 2. Frontend Deployment (Vercel)

1. Import this repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add required environment variables.

### Required frontend environment variables

Use `frontend/.env.example` as the template.

- `VITE_API_URL` (Render backend URL + `/api`, for example `https://your-backend.onrender.com/api`)
- `VITE_GOOGLE_CLIENT_ID`

`frontend/vercel.json` includes SPA rewrites so client-side routes resolve to `index.html`.

## 3. Cross-service wiring

After both are deployed:

1. Copy your Vercel production URL.
2. Set `CORS_ORIGIN` and `FRONTEND_URL` in Render to that URL.
3. Copy your Render backend URL.
4. Set `VITE_API_URL` in Vercel to `https://your-backend.onrender.com/api`.
5. Copy your AI service URL from Render.
6. Set `AI_SERVICE_URL` in the backend to that AI URL.
7. Redeploy both services.

## 4. Local setup

1. Backend:
	- Copy `backend/.env.example` to `backend/.env`
	- `npm install`
	- `npm run dev`
2. Frontend:
	- Copy `frontend/.env.example` to `frontend/.env`
	- `npm install`
	- `npm run dev`

## Security note

If secrets were committed in `.env` files earlier, rotate them (API keys, email password, JWT secret, OAuth credentials) before production deployment.