# SEO Web Analyzer

A full-stack web app that analyzes URLs or pasted content for SEO: title, meta, headings, readability, sentiment, and keywords. Includes auth (login/signup, remember me), dashboard, reports, and PDF export.

## Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT (access + refresh), Cheerio for HTML analysis

## Post to GitHub

1. **Create a new repository on GitHub**
   - Go to [github.com/new](https://github.com/new).
   - Name it `seo-web-analyzer` (or any name).
   - Do **not** add a README, .gitignore, or license (this repo already has them).
   - Click **Create repository**.

2. **Push this project**
   ```bash
   cd path/to/seo-web-analyzer
   git remote add origin https://github.com/YOUR_USERNAME/seo-web-analyzer.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username. If you use SSH:
   ```bash
   git remote add origin git@github.com:YOUR_USERNAME/seo-web-analyzer.git
   git push -u origin main
   ```

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/seo-web-analyzer.git
cd seo-web-analyzer
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI, JWT_SECRET, and other values
npm install
```

### 3. Frontend

```bash
cd ../frontend
cp .env.example .env
# For local dev, .env can stay as is (VITE_API_URL=http://localhost:5000/api)
npm install
```

### 4. Run locally

- **Terminal 1 ΓÇô backend:** `cd backend && npm run dev` (runs on http://localhost:5000)
- **Terminal 2 ΓÇô frontend:** `cd frontend && npm run dev` (runs on http://localhost:5173)

Open http://localhost:5173 and sign up / log in to use the app.

## Deploy

- **Backend:** Deploy to Railway, Render, Fly.io, or any Node host. Set env vars (e.g. `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` to your frontend URL).
- **Frontend:** Build with `cd frontend && npm run build`. Deploy the `frontend/dist` folder to Vercel, Netlify, or static hosting. Set `VITE_API_URL` to your backend API URL before building.
- **MongoDB:** Use MongoDB Atlas (free tier) and set `MONGODB_URI` in the backend.

## Project structure

```
seo-web-analyzer/
Γö£ΓöÇΓöÇ backend/          # Express API, auth, reports, SEO analysis
Γöé   Γö£ΓöÇΓöÇ src/
Γöé   Γöé   Γö£ΓöÇΓöÇ server.js
Γöé   Γöé   Γö£ΓöÇΓöÇ app.js
Γöé   Γöé   Γö£ΓöÇΓöÇ config/
Γöé   Γöé   Γö£ΓöÇΓöÇ controllers/
Γöé   Γöé   Γö£ΓöÇΓöÇ middleware/
Γöé   Γöé   Γö£ΓöÇΓöÇ models/
Γöé   Γöé   Γö£ΓöÇΓöÇ routes/
Γöé   Γöé   ΓööΓöÇΓöÇ utils/
Γöé   Γö£ΓöÇΓöÇ .env.example
Γöé   ΓööΓöÇΓöÇ package.json
Γö£ΓöÇΓöÇ frontend/         # React + Vite app
Γöé   Γö£ΓöÇΓöÇ src/
Γöé   Γöé   Γö£ΓöÇΓöÇ api/
Γöé   Γöé   Γö£ΓöÇΓöÇ components/
Γöé   Γöé   Γö£ΓöÇΓöÇ context/
Γöé   Γöé   Γö£ΓöÇΓöÇ pages/
Γöé   Γöé   ΓööΓöÇΓöÇ styles/
Γöé   Γö£ΓöÇΓöÇ .env.example
Γöé   ΓööΓöÇΓöÇ package.json
Γö£ΓöÇΓöÇ .gitignore
ΓööΓöÇΓöÇ README.md
```

## License

MIT
