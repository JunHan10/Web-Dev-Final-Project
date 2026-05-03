# ResumAi

A resume builder app that lets students focus on content instead of formatting.
Built for CSC3100 Final Project.

## Features
- **Local accounts** — register and log in; each user's data is scoped to their account.
- **Jobs** — add jobs with title, company, location, and dates. Add, edit, and delete bullet-point responsibilities under each job.
- **Skills** — group skills by category (e.g. Languages, Frameworks).
- **Certifications** and **Awards** — track credentials with issuer/granter and dates.
- **Resume Builder** — pick which jobs (and which specific bullet points), skills, certs, and awards belong on a given resume. Save multiple resumes targeted at different roles.
- **Print / Save as PDF** — render the selected resume in a clean print layout (uses the browser's Print to PDF for output).
- **AI feedback** — per-bullet "Get AI Feedback" button calls Google Gemini with prompts tuned per content type (job bullet, skill, cert, award).
- **Settings** — store a personal Gemini API key on your user record (overrides the project-wide key in `.env`).

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a `.env` file in the project root with your Gemini API key (optional — you can also set it per-user in Settings):
   ```
   GEMINI_API_KEY=your_key_here
   ```
   Get a free key at https://aistudio.google.com/apikey.
4. Run `npm start` to launch the Electron app.

The SQLite database is created automatically on first run (`database/resume.db`).

### Alternate scripts
- `npm run server` — run the Express backend without Electron (open http://localhost:3000 in a browser).
- `npm run init-db` — re-initialize the database tables.

## Tech Stack
- HTML / CSS / Vanilla JavaScript (no frontend frameworks)
- Bootstrap + Yeti theme, Bootstrap Icons, SweetAlert2
- Node.js + Express
- SQLite (better-sqlite3)
- Electron
- Google Gemini API

## Project Structure
```
main.js              Electron entry point
server.js            Express server (mounts /api routes, serves /public)
preload.js           Electron preload bridge
routes/              Express route handlers (users, jobs, skills, certs, awards, resumes, ai)
database/
  db.js              better-sqlite3 connection + schema bootstrap
  schema.sql         Table definitions
  resume.db          SQLite file (created on first run)
public/
  index.html         Single-page UI shell
  css/               Bootstrap, Pulse theme, print stylesheet
  js/                Per-section client scripts (jobs.js, skills.js, ...)
docs/                Project documentation (AI usage, etc.)
```

## AI Usage
See [docs/ai-usage.md](docs/ai-usage.md) for a log of how AI tools were used during development.

## Sharing
Sharing is welcome to everybody

## Author
Jun Han

## GitHub
https://github.com/JunHan10/Web-Dev-Final-Project

## Thank you
Huge thank you to Claude for making this project possible :D