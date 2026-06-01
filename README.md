# Design Together

AI-assisted UX analysis and lo-fi wireframes for design briefs. Runs on your machine; your Anthropic API key stays on the server, not in the browser.

---

## What is this tool?

Design Together helps you explore UX options early in a project. You describe what exists and what should change, and the tool produces:

- **Analysis** — problem category, pushback, assumptions, and two design directions
- **Questions** — follow-ups that shape the wireframes
- **Wireframes** — two lo-fi screens (Direction A vs Direction B) for the same key screen
- **Iteration** — optional updates based on your written feedback

It calls **Claude** through a small Express API. That keeps your API key off the frontend. It is meant for **early layout exploration**, not final production UI.

```
Intake → Analyse → Answer questions → Draw wireframes → (optional) Iterate
```

---

## Prerequisites

- **Node.js 18+**
- **Anthropic API key** — [console.anthropic.com](https://console.anthropic.com/)
- **Git access** to clone the repo (private internal repo)

---

## Install and run

```bash
git clone https://github.com/tonyjoyk/design-together.git
cd design-together
cp .env.example .env
```

Open `.env` and set your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then:

```bash
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

`npm run dev` starts two processes:

- **Vite** (frontend) on port 5173
- **Express** (API) on port 3001 — Vite proxies `/api` requests to it

**Troubleshooting**

- Wireframes fail with a connection error → something else may be using port 3001. Stop it and run `npm run dev` again.
- `ANTHROPIC_API_KEY is not set` → check `.env` exists in the project root and restart the server.

---

## How to use

### 1. Intake

- Choose **platform**, **user type**, and **change type**
- Fill in **what exists** and **what needs to change**
- Optional: **project notes**, **PRD files** (`.txt`, `.md`, `.json` — max 5 files, 500 KB each), **screenshots**

Click through to run analysis.

### 2. Analyse

Review the results:

- Problem category and description
- Pushback (if the request needs reframing)
- Assumptions and blocking gaps
- **Direction A** and **Direction B**

You can correct assumptions before continuing.

### 3. Questions

Answer **all** generated questions — you cannot draw wireframes until every question has an answer. These answers directly influence the layouts.

### 4. Wireframes

- Two variants appear side by side (Direction A and B)
- **Click a wireframe** to expand it
- **Click the screen label or number** to select it for iteration
- Enter feedback and regenerate selected screens

**Tips for better results**

- A clear, focused brief works better than dumping a huge PRD without a summary
- Screenshots are only sent during **analyse** — they help the first step most
- When iterating, be specific and visible: e.g. “move the primary button to the bottom” or “remove the second card”

---

## Production build (optional)

```bash
npm run build
npm start
```

Serves the built UI and API from one process (`NODE_ENV=production`).

---

## Known issues and limitations

### Limited UI pattern coverage

The tool’s design knowledge comes from a **small set of markdown guides** in the `guides/` folder (design thinking, Android/Material-style patterns, wireframe style). That is **not** a full design system or a large training dataset.

Wireframe generation uses a **short rules summary**, not the full guides. So:

- Pattern coverage is **narrow** compared to Figma libraries or platform docs
- Results are strongest for **Android / mobile-style** lo-fi screens
- **Web desktop, iOS-specific, or complex patterns** may be weak or generic

If you need faithful platform chrome or dense component accuracy, treat output as a **sketch**, then refine in your design tool.

### Wireframe generation can fail

- Each run makes **several API calls** (plan + two screens). You may hit Anthropic **rate limits** — wait about 30 seconds and try again
- Very large PRDs or many screenshots can slow or fail **analyse** — shorten the brief or split context
- Output is **minimal** lo-fi SVG (few sections, placeholder labels) — not production-ready UI

### Other limits

- **Two wireframe screens per run** only (Direction A and B on the same screen)
- **No save** — refreshing the page loses your session
- **Local only** — not hosted online; each teammate clones the repo and uses their own API key
- **Confidential data** — briefs, PRDs, and screenshots are sent to **Anthropic**. Get approval before uploading sensitive material

### Iteration

Regeneration does not always pick up subtle feedback. Select the screen, describe a **visible** layout change, and try again if the result looks unchanged.

---

## Data and privacy

- Brief text, uploaded files, and screenshots are sent to the **Anthropic API** when you analyse or generate wireframes
- Nothing is stored on disk by this app
- Never commit `.env` — only `.env.example` belongs in git
- Keep the GitHub repo **private** for internal tools

---

## Repo structure

| Path | Purpose |
|------|---------|
| `src/` | React UI |
| `server/` | Express API proxy to Anthropic |
| `src/prompts/` | LLM prompts |
| `guides/` | Design reference markdown (used at analyse time) |
| `docs/legacy/` | Old prototypes — not used at runtime |

It is recommended to ask agent to follow these instructions when making changes: [AI_RULES.md](AI_RULES.md).
