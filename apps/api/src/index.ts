import { Hono } from 'hono';
import {
  isValidWaitlistEmail,
  normalizeWaitlistEmail,
  type WaitlistSignupRequest,
} from '@clearpick/shared';

export interface Env {
  ASSETS: Fetcher;
  WAITLIST_DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.post('/api/waitlist', async (c) => {
  let body: Partial<WaitlistSignupRequest>;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'invalid_json' }, 400);
  }

  if (typeof body.email !== 'string' || !isValidWaitlistEmail(body.email)) {
    return c.json({ error: 'invalid_email' }, 400);
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
