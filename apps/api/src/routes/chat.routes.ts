import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { buildSystemPrompt } from '../lib/chatContext';

/**
 * POST /api/v1/chat
 *
 * Streams a Groq chat completion grounded in the SI Coin knowledge base plus live platform data
 * (see lib/chatContext.ts). The Groq key is read from GROQ_API_KEY on the server only.
 *
 * Request body:  { messages: [{ role: 'user' | 'assistant', content: string }], page?: string }
 * Response:      200 text/plain stream of the assistant's reply, or JSON { error: string } with a 4xx/5xx status.
 */
export const chatRouter = Router();

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface ModelChoice {
  id: string;
  extra: Record<string, unknown>;
}
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
interface UpstreamError extends Error {
  status?: number;
}

// Tried in order. If one is unavailable (retired, rate limited, overloaded) the next one answers.
const configuredModel = () => process.env.GROQ_MODEL?.trim();
const getModels = (): ModelChoice[] => [
  { id: configuredModel() || 'openai/gpt-oss-120b', extra: configuredModel() ? {} : { reasoning_effort: 'low' } },
  { id: 'qwen/qwen3.8-27b', extra: { reasoning_effort: 'none' } },
  { id: 'openai/gpt-oss-20b', extra: { reasoning_effort: 'low' } },
];

const MAX_TURNS = 12; // most recent messages sent to the model
const MAX_CHARS = 1200; // per message
// Reasoning + answer budget. Groq counts prompt + max_tokens against the per-minute token limit, so keep it modest.
const MAX_TOKENS = 700;

/** Per-IP limit on top of the API-wide limiter: every message costs model tokens. */
const chatLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'You are sending messages very quickly. Please wait a few minutes and try again.' },
});

/** Keep only well-formed user/assistant turns, trimmed and length-capped. */
function cleanMessages(input: unknown): ChatMessage[] {
  if (!Array.isArray(input)) return [];
  const out: ChatMessage[] = [];
  for (const m of input as Array<Record<string, unknown> | null>) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') continue;
    const content = m.content.split('\0').join('').trim().slice(0, MAX_CHARS);
    if (content) out.push({ role: m.role, content });
  }
  const recent = out.slice(-MAX_TURNS);
  while (recent.length && recent[0].role !== 'user') recent.shift();
  return recent;
}

/** The page the visitor is on is only a hint, so accept nothing but a plain path. */
const cleanPage = (page: unknown): string =>
  typeof page === 'string' && /^[\w\-/#.]{1,80}$/.test(page) ? page : '/';

/**
 * Streams one model's answer into `res`. Returns true once something was sent.
 * Headers are only written when the first answer token arrives, so a model that fails (or spends
 * its whole budget "thinking") can be replaced by the next one without the visitor noticing.
 */
async function streamFromModel(
  model: ModelChoice,
  messages: Array<{ role: string; content: string }>,
  res: Response,
  controller: AbortController,
  apiKey: string,
): Promise<boolean> {
  const upstream = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model.id,
      messages,
      stream: true,
      temperature: 0.35, // lower than the marketing sites: this bot quotes financial figures
      top_p: 0.9,
      max_tokens: MAX_TOKENS,
      ...model.extra,
    }),
    signal: controller.signal,
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    const err: UpstreamError = new Error(`Groq ${upstream.status} (${model.id}): ${detail.slice(0, 300)}`);
    err.status = upstream.status;
    throw err;
  }

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let started = false;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      let chunk: { choices?: Array<{ delta?: { content?: string } }> };
      try {
        chunk = JSON.parse(data);
      } catch {
        continue;
      }
      const text = chunk?.choices?.[0]?.delta?.content; // reasoning tokens arrive in delta.reasoning and are ignored
      if (!text) continue;
      if (!started) {
        started = true;
        res.status(200);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, no-transform');
        res.setHeader('X-Accel-Buffering', 'no');
      }
      res.write(text);
    }
  }
  return started;
}

chatRouter.post('/', chatLimiter, async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    console.error('[chat] GROQ_API_KEY is not set.');
    return res.status(503).json({ error: 'The assistant is not available right now. Please use the Contact page.' });
  }

  const history = cleanMessages(req.body?.messages);
  if (!history.length || history[history.length - 1].role !== 'user') {
    return res.status(400).json({ error: 'Please type a message.' });
  }

  const system = await buildSystemPrompt(cleanPage(req.body?.page), history[history.length - 1].content);
  const messages = [{ role: 'system', content: system }, ...history];

  // Stop paying for tokens nobody will read if the visitor closes the chat mid-answer.
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });
  const timeout = setTimeout(() => controller.abort(), 25000);

  let rateLimitedUpstream = false;
  try {
    for (const model of getModels()) {
      try {
        if (await streamFromModel(model, messages, res, controller, apiKey)) {
          return res.end();
        }
        console.warn(`[chat] ${model.id} returned no answer text; trying the next model.`);
      } catch (err) {
        if (controller.signal.aborted) return res.end();
        console.error('[chat]', err instanceof Error ? err.message : err);
        const status = (err as UpstreamError)?.status;
        if (status === 429) rateLimitedUpstream = true;
        if (res.headersSent) return res.end(); // already part-way through an answer: never splice in a second model
        if (status === 401 || status === 403) break; // bad key: other models will not help
      }
    }
    if (!res.headersSent) {
      if (rateLimitedUpstream) {
        return res.status(429).json({ error: 'We are getting a lot of questions right now. Please try again in a few seconds.' });
      }
      return res
        .status(502)
        .json({ error: 'The assistant could not answer just now. Please try again in a moment, or use the Contact page.' });
    }
    return res.end();
  } finally {
    clearTimeout(timeout);
  }
});
