import { Context, Next } from 'hono';
import type { Env } from '../types/env.js';

interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
}

export function rateLimit(options: RateLimitOptions = { limit: 120, windowSeconds: 60 }) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const path = new URL(c.req.url).pathname;
    const key = `rate:${ip}:${path}`;

    const current = await c.env.CACHE.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= options.limit) {
      return c.json({ error: 'Too many requests. Please try again later.' }, 429);
    }

    // Use expirationTtl for automatic cleanup
    await c.env.CACHE.put(key, String(count + 1), {
      expirationTtl: options.windowSeconds,
    });

    await next();
  };
}

export const authRateLimit = rateLimit({ limit: 60, windowSeconds: 60 });
export const apiRateLimit = rateLimit({ limit: 120, windowSeconds: 60 });
