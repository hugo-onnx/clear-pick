import { describe, expect, it, vi } from 'vitest';
import app, { type Env } from './index';

function createEnv({
  includeRateLimiter = true,
  rateLimitRejects = false,
  rateLimitSuccess = true,
} = {}) {
  const run = vi.fn().mockResolvedValue({ success: true });
  const bind = vi.fn().mockReturnValue({ run });
  const prepare = vi.fn().mockReturnValue({ bind });
  const fetch = vi.fn().mockResolvedValue(new Response('asset'));
  const limit = rateLimitRejects
    ? vi.fn().mockRejectedValue(new Error('Rate limiter unavailable'))
    : vi.fn().mockResolvedValue({ success: rateLimitSuccess });

  const env = {
    ASSETS: { fetch },
    WAITLIST_DB: { prepare },
    ...(includeRateLimiter ? { WAITLIST_RATE_LIMITER: { limit } } : {}),
  } as unknown as Env;

  return { bind, env, fetch, limit, prepare, run };
}

describe('waitlist API', () => {
  it('stores a valid waitlist email', async () => {
    const { bind, env, limit } = createEnv();

    const response = await app.request(
      '/api/waitlist',
      {
        body: JSON.stringify({
          email: ' Person@Example.com ',
          website: '',
        }),
        headers: {
          'CF-Connecting-IP': '203.0.113.10',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(204);
    expect(limit).toHaveBeenCalledWith({ key: '203.0.113.10' });
    expect(bind).toHaveBeenCalledWith(
      'Person@Example.com',
      'person@example.com',
      expect.any(String),
    );
  });

  it('returns 415 for non-json requests before rate limiting', async () => {
    const { env, limit, prepare } = createEnv();

    const response = await app.request(
      '/api/waitlist',
      {
        body: 'email=person@example.com',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(415);
    expect(limit).not.toHaveBeenCalled();
    expect(prepare).not.toHaveBeenCalled();
  });

  it('returns 413 for oversized requests before rate limiting', async () => {
    const { env, limit, prepare } = createEnv();

    const response = await app.request(
      '/api/waitlist',
      {
        body: JSON.stringify({ email: 'person@example.com' }),
        headers: {
          'Content-Length': '4097',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(413);
    expect(limit).not.toHaveBeenCalled();
    expect(prepare).not.toHaveBeenCalled();
  });

  it('returns 429 before D1 writes when rate limited', async () => {
    const { env, prepare } = createEnv({ rateLimitSuccess: false });

    const response = await app.request(
      '/api/waitlist',
      {
        body: JSON.stringify({
          email: 'person@example.com',
          website: '',
        }),
        headers: {
          'CF-Connecting-IP': '203.0.113.10',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(429);
    expect(prepare).not.toHaveBeenCalled();
  });

  it('stores email when the rate limiter binding is missing', async () => {
    const { bind, env } = createEnv({ includeRateLimiter: false });

    const response = await app.request(
      '/api/waitlist',
      {
        body: JSON.stringify({
          email: 'person@example.com',
          website: '',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(204);
    expect(bind).toHaveBeenCalledWith(
      'person@example.com',
      'person@example.com',
      expect.any(String),
    );
  });

  it('stores email when the rate limiter binding fails', async () => {
    const { bind, env } = createEnv({ rateLimitRejects: true });

    const response = await app.request(
      '/api/waitlist',
      {
        body: JSON.stringify({
          email: 'person@example.com',
          website: '',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(204);
    expect(bind).toHaveBeenCalledWith(
      'person@example.com',
      'person@example.com',
      expect.any(String),
    );
  });

  it('returns 400 for invalid emails', async () => {
    const { env, prepare } = createEnv();

    const response = await app.request(
      '/api/waitlist',
      {
        body: JSON.stringify({
          email: 'not-an-email',
          website: '',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(400);
    expect(prepare).not.toHaveBeenCalled();
  });

  it('returns 204 without writing when the honeypot is filled', async () => {
    const { env, prepare } = createEnv();

    const response = await app.request(
      '/api/waitlist',
      {
        body: JSON.stringify({
          email: 'person@example.com',
          website: 'https://spam.example',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(204);
    expect(prepare).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON', async () => {
    const { env, prepare } = createEnv();

    const response = await app.request(
      '/api/waitlist',
      {
        body: '{',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(400);
    expect(prepare).not.toHaveBeenCalled();
  });

  it('returns 405 for unsupported waitlist methods', async () => {
    const { env } = createEnv();

    const response = await app.request('/api/waitlist', { method: 'GET' }, env);

    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('POST');
  });

  it('falls through to static assets for non-api routes', async () => {
    const { env, fetch } = createEnv();

    const response = await app.request('/pricing', { method: 'GET' }, env);

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('asset');
    expect(fetch).toHaveBeenCalledOnce();
  });
});
