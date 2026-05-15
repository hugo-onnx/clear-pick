import { describe, expect, it, vi } from 'vitest';
import app, { type Env } from './index';

function createEnv() {
  const run = vi.fn().mockResolvedValue({ success: true });
  const bind = vi.fn().mockReturnValue({ run });
  const prepare = vi.fn().mockReturnValue({ bind });
  const fetch = vi.fn().mockResolvedValue(new Response('asset'));

  const env = {
    ASSETS: { fetch },
    WAITLIST_DB: { prepare },
  } as unknown as Env;

  return { bind, env, fetch, prepare, run };
}

describe('waitlist API', () => {
  it('stores a valid waitlist email', async () => {
    const { bind, env } = createEnv();

    const response = await app.request(
      '/api/waitlist',
      {
        body: JSON.stringify({ email: ' Person@Example.com ' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(204);
    expect(bind).toHaveBeenCalledWith(
      'Person@Example.com',
      'person@example.com',
      expect.any(String),
    );
  });

  it('returns 400 for invalid emails', async () => {
    const { env, prepare } = createEnv();

    const response = await app.request(
      '/api/waitlist',
      {
        body: JSON.stringify({ email: 'not-an-email' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      },
      env,
    );

    expect(response.status).toBe(400);
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
