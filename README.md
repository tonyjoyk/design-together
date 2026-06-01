# Design Together

AI-assisted UX analysis and lo-fi wireframes for design briefs. Runs locally; your Anthropic API key stays on the server.

## Prerequisites

- Node.js 18+
- [Anthropic API key](https://console.anthropic.com/)

## Setup

```bash
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to the Express server on port 3001.

## Production build (optional)

```bash
npm run build
npm start
```

Serves the built UI and API from a single process (`NODE_ENV=production`).

## Data and privacy

Brief text, uploaded PRDs, notes, and screenshots are sent to the **Anthropic API** when you run analyse or generate wireframes. Nothing is stored on disk by this app.

Use a **private** GitHub repo for internal tools. Never commit `.env` (only `.env.example` belongs in git).

## Repo structure

- `src/` — React UI
- `server/` — Express API proxy
- `src/prompts/` — LLM prompts
- `guides/` — design reference markdown (used at analyse time)
- `docs/legacy/` — old prototypes, not used at runtime
