# SEO Web Analyzer

A full-stack web app that analyzes URLs or pasted content for SEO: title, meta, headings, readability, sentiment, and keywords. Includes auth (login/signup, remember me), dashboard, reports, and PDF export.

## Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Axios
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT (access + refresh), Cheerio for HTML analysis

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

- **Terminal 1 – backend:** `cd backend && npm run dev` (runs on http://localhost:5000)
- **Terminal 2 – frontend:** `cd frontend && npm run dev` (runs on http://localhost:5173)

Open http://localhost:5173 and sign up / log in to use the app.

## Deploy

- **Backend:** Deploy to Railway, Render, Fly.io, or any Node host. Set env vars (e.g. `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` to your frontend URL).
- **Frontend:** Build with `cd frontend && npm run build`. Deploy the `frontend/dist` folder to Vercel, Netlify, or static hosting. Set `VITE_API_URL` to your backend API URL before building.
- **MongoDB:** Use MongoDB Atlas (free tier) and set `MONGODB_URI` in the backend.

## Project structure

```
seo-web-analyzer/
├── backend/          # Express API, auth, reports, SEO analysis
│   ├── src/
│   │   ├── server.js
│   │   ├── app.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
├── frontend/         # React + Vite app
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── styles/
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## License

MIT
