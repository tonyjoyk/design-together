import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { callClaudeStructured } from './anthropic.js';
import {
  ANALYSIS_SCHEMA,
  WIREFRAME_PLAN_SCHEMA,
  SINGLE_SCREEN_SCHEMA,
} from './schemas.js';
import {
  buildAnalyzeMessages,
  buildPlanContext,
  buildScreenPrompt,
  buildIteratePrompt,
  logContextSize,
} from './context.js';
import { ANALYSIS_SYSTEM_PROMPT } from '../src/prompts/analysis.js';
import { WIREFRAME_PLAN_PROMPT, WIREFRAME_SYSTEM_PROMPT } from '../src/prompts/wireframes.js';
import { ITERATE_SYSTEM_PROMPT } from '../src/prompts/iterate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
const PORT = process.env.PORT || 3001;

const WIREFRAME_ERROR = 'Wireframe generation failed — try again. If it keeps failing, simplify your brief.';
const RATE_LIMIT_ERROR = 'Too many requests — wait 30 seconds and try again.';
const GENERIC_ERROR = 'Request failed. Try again later.';

function normalizeId(id) {
  const n = Number(id);
  return Number.isNaN(n) ? id : n;
}

function idsMatch(a, b) {
  return normalizeId(a) === normalizeId(b);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clientErrorMessage(err, fallback = GENERIC_ERROR) {
  if (/rate limit/i.test(err.message)) {
    return RATE_LIMIT_ERROR;
  }
  return fallback;
}

const app = express();
app.use(express.json({ limit: '20mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    const messages = buildAnalyzeMessages(req.body);
    logContextSize('analyze', JSON.stringify(messages));

    const result = await callClaudeStructured({
      system: ANALYSIS_SYSTEM_PROMPT,
      messages,
      max_tokens: 2000,
      schema: ANALYSIS_SCHEMA,
    });
    res.json(result);
  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ error: clientErrorMessage(err) });
  }
});

app.post('/api/wireframes', async (req, res) => {
  try {
    const planContext = buildPlanContext(req.body);
    logContextSize('plan', planContext);

    const plan = await callClaudeStructured({
      system: WIREFRAME_PLAN_PROMPT,
      messages: [{ role: 'user', content: planContext }],
      max_tokens: 2000,
      schema: WIREFRAME_PLAN_SCHEMA,
    });

    const planned = (plan.screens || []).slice(0, 2);
    if (planned.length === 0) {
      throw new Error('No screens planned');
    }

    const screens = [];
    for (const spec of planned) {
      await sleep(1500);

      const screenPrompt = buildScreenPrompt(spec, req.body);
      logContextSize(`svg-${spec.id}`, screenPrompt);

      const result = await callClaudeStructured({
        system: WIREFRAME_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: screenPrompt }],
        max_tokens: 4096,
        schema: SINGLE_SCREEN_SCHEMA,
      });

      const screen = result.screens?.[0];
      if (!screen?.svg) {
        throw new Error(`Screen ${spec.id} missing SVG`);
      }
      screens.push({
        id: normalizeId(screen.id ?? spec.id),
        title: screen.title || spec.title,
        sub: screen.sub || spec.sub,
        tag: screen.tag || spec.tag,
        tagColor: screen.tagColor || spec.tagColor,
        layoutNotes: spec.layoutNotes,
        svg: screen.svg,
      });
    }

    res.json({ screens });
  } catch (err) {
    console.error('Wireframes error:', err.message);
    const message = /rate limit/i.test(err.message) ? RATE_LIMIT_ERROR : WIREFRAME_ERROR;
    res.status(500).json({ error: message });
  }
});

app.post('/api/iterate', async (req, res) => {
  try {
    const { selectedIds, screens, iterNote } = req.body;
    const normalizedSelected = (selectedIds || []).map(normalizeId);
    const toUpdate = (screens || []).filter((s) =>
      normalizedSelected.some((sid) => idsMatch(sid, s.id)),
    );

    const updatedScreens = [];
    for (const s of toUpdate) {
      await sleep(1500);

      const text = buildIteratePrompt(s, iterNote);
      logContextSize(`iterate-${s.id}`, text);

      const resultScreen = await callClaudeStructured({
        system: ITERATE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
        max_tokens: 4096,
        schema: SINGLE_SCREEN_SCHEMA,
      });

      const updated = resultScreen.screens?.[0];
      if (!updated?.svg) {
        throw new Error(`Screen ${s.id} missing updated SVG`);
      }
      updatedScreens.push({
        id: normalizeId(updated.id ?? s.id),
        title: updated.title || s.title,
        sub: updated.sub || s.sub,
        tag: updated.tag || s.tag,
        tagColor: updated.tagColor || s.tagColor,
        layoutNotes: s.layoutNotes,
        svg: updated.svg,
      });
    }

    res.json({ screens: updatedScreens });
  } catch (err) {
    console.error('Iterate error:', err.message);
    const message = /rate limit/i.test(err.message) ? RATE_LIMIT_ERROR : WIREFRAME_ERROR;
    res.status(500).json({ error: message });
  }
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// On Vercel, api/index.js exports the app as a serverless function instead.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

export default app;
