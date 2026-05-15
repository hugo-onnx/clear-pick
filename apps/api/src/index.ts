import { Hono } from 'hono';
import {
  isValidWaitlistEmail,
  normalizeWaitlistEmail,
  type WaitlistSignupRequest,
} from '@clearpick/shared';

export interface Env {
  ASSETS: Fetcher;
  WAITLIST_DB: D1Database;
  WAITLIST_RATE_LIMITER?: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
}

const app = new Hono<{ Bindings: Env }>();
const MAX_WAITLIST_BODY_BYTES = 4096;

async function isWaitlistRateLimited(
  rateLimiter: Env['WAITLIST_RATE_LIMITER'],
  key: string,
): Promise<boolean> {
  if (!rateLimiter) {
    return false;
  }

  try {
    const result = await rateLimiter.limit({ key });

    return !result.success;
  } catch {
    return false;
  }
}

app.post('/api/waitlist', async (c) => {
  const contentType = c.req.header('content-type') ?? '';

  if (!contentType.toLowerCase().includes('application/json')) {
    return c.json({ error: 'unsupported_media_type' }, 415);
  }

  const contentLength = c.req.header('content-length');

  if (
    contentLength &&
    Number.isFinite(Number(contentLength)) &&
    Number(contentLength) > MAX_WAITLIST_BODY_BYTES
  ) {
    return c.json({ error: 'request_too_large' }, 413);
  }

  const ip = c.req.header('cf-connecting-ip') ?? null;
  const rateLimitKey = ip ?? 'anonymous';
  const isRateLimited = await isWaitlistRateLimited(
    c.env.WAITLIST_RATE_LIMITER,
    rateLimitKey,
  );

  if (isRateLimited) {
    return c.json({ error: 'rate_limited' }, 429);
  }

  let body: Partial<WaitlistSignupRequest>;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json' }, 400);
  }

  if (typeof body.email !== 'string' || !isValidWaitlistEmail(body.email)) {
    return c.json({ error: 'invalid_email' }, 400);
  }

  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return c.body(null, 204);
  }

  const originalEmail = body.email.trim();
  const normalizedEmail = normalizeWaitlistEmail(originalEmail);
  const createdAt = new Date().toISOString();

  await c.env.WAITLIST_DB.prepare(
    `INSERT OR IGNORE INTO waitlist_signups
      (email, normalized_email, created_at)
      VALUES (?, ?, ?)`,
  )
    .bind(originalEmail, normalizedEmail, createdAt)
    .run();

  return c.body(null, 204);
});

app.on(['GET', 'PUT', 'PATCH', 'DELETE'], '/api/waitlist', (c) =>
  c.json({ error: 'method_not_allowed' }, 405, {
    Allow: 'POST',
  }),
);

app.notFound((c) => {
  if (new URL(c.req.url).pathname.startsWith('/api/')) {
    return c.json({ error: 'not_found' }, 404);
  }

  return c.env.ASSETS.fetch(c.req.raw);
});

export default app;
