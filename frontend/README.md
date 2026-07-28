# AI Resume Builder — UpLinkAI Internship Final Project

A production-ready web application that lets users build, preview, and export a professional resume,
with AI-powered content improvement, Firebase authentication/storage, and a SQL-backed REST API.

## Features
- 🔐 **Google Sign-In** via Firebase Authentication
- 📝 Live resume form with real-time preview
- ✨ **AI-powered rewriting** of summary & experience sections (Claude API)
- ☁️ **Firestore** for real-time resume data storage (per user)
- 🖼️ **Firebase Storage** for profile photo uploads
- 🗄️ **PostgreSQL (SQL)** backend for analytics/search via a REST API
- 📄 One-click **PDF export** of the resume
- 🚀 Frontend deployed on **Vercel**, backend deployed on **Render**

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript (vanilla, ES modules) |
| Auth / Realtime DB / Storage | Firebase |
| Backend | Node.js + Express |
| Database | PostgreSQL (SQL) |
| AI | Anthropic Claude API |
| Deployment | Vercel (frontend), Render (backend + Postgres) |

## Project Structure
```
ai-resume-builder/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   ├── js/firebase-config.js
│   └── vercel.json
├── backend/
│   ├── server.js
│   ├── routes/resume.js
│   ├── routes/ai.js
│   ├── db/db.js
│   ├── db/schema.sql
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup Instructions

### 1. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com) → Create a project.
2. Enable **Authentication → Google Sign-In**.
3. Enable **Firestore Database** (start in test mode, then lock down rules for production).
4. Enable **Storage**.
5. Copy your web app config from Project Settings → General → "Your apps", and paste it into
   `frontend/js/firebase-config.js`.

### 2. Backend / SQL Setup
1. `cd backend && npm install`
2. Create a PostgreSQL database (Render offers a free managed Postgres instance).
3. Run the schema:
   ```bash
   psql <your-database-url> -f db/schema.sql
   ```
4. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` (from your Postgres provider)
   - `ANTHROPIC_API_KEY` (from console.anthropic.com)
   - `FRONTEND_ORIGIN` (your deployed Vercel URL)
5. Run locally: `npm start` (defaults to `http://localhost:5000`)

### 3. Frontend Setup
1. Update `BACKEND_URL` in `frontend/js/app.js` to your deployed Render URL.
2. Open `frontend/index.html` directly, or serve it with any static server for local testing.

## Deployment

### Deploy Backend to Render
1. Push this repo to GitHub.
2. In Render, create a **Web Service**, point it at the `backend/` folder.
3. Build command: `npm install` | Start command: `npm start`
4. Add the environment variables from `.env.example` in Render's dashboard.
5. Create a Render **PostgreSQL** instance and link its connection string as `DATABASE_URL`.

### Deploy Frontend to Vercel
1. In Vercel, import the repo and set the **root directory** to `frontend/`.
2. Deploy — Vercel will serve the static site automatically.
3. Update `BACKEND_URL` in `app.js` to the live Render URL before final deploy.

## How It Works (for your project explanation)
1. User signs in with **Firebase Auth** (Google provider).
2. They fill in resume details in the form; a **live preview** updates instantly via DOM manipulation.
3. Clicking **"Improve with AI"** sends the text to the Express backend (`/api/ai/improve`), which
   calls the **Claude API** with a tailored prompt and returns a polished rewrite.
4. Clicking **"Save"** writes the resume to **Firestore** (per-user document keyed by UID) and also
   syncs a copy to **PostgreSQL** via `/api/resume/sync` (upsert), demonstrating the required SQL layer.
5. Profile photos are uploaded to **Firebase Storage**, and the resulting URL is stored alongside the
   resume data.
6. **"Download PDF"** uses `html2pdf.js` to export the live preview as a downloadable PDF.

## Future Improvements
- Resume templates / themes to choose from
- ATS (Applicant Tracking System) keyword scoring
- Multi-resume support per user
- Email the generated PDF directly from the app

## Author
Built as part of the UpLinkAI Full Stack Development with AI Automation & Tools Internship.
