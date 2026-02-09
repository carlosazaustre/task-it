/**
 * Simple in-memory rate limiter for API endpoints.
 *
 * Uses a Map keyed by identifier (typically IP address) to track request
 * timestamps within a sliding window.  Not suitable for multi-instance
 * deployments -- use Redis-backed solution in that case.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window. */
  maxRequests: number
  /** Time window in milliseconds. */
  windowMs: number
}

interface RateLimitEntry {
  timestamps: number[]
}

const stores = new Map<string, Map<string, RateLimitEntry>>()

/**
 * Create a rate limiter with the given configuration.
 *
 * Returns a function that accepts an identifier string (e.g. IP address) and
 * returns `{ success: true }` when the request is allowed, or
 * `{ success: false, retryAfterMs }` when the limit has been exceeded.
 */
export function createRateLimiter(name: string, config: RateLimitConfig) {
  // Each limiter gets its own store so different endpoints don't share state.
  if (!stores.has(name)) {
    stores.set(name, new Map())
  }
  const store = stores.get(name)!

  return function check(identifier: string): {
    success: boolean
    retryAfterMs?: number
  } {
    const now = Date.now()
    const windowStart = now - config.windowMs

    let entry = store.get(identifier)

    if (!entry) {
      entry = { timestamps: [] }
      store.set(identifier, entry)
    }

    // Prune timestamps outside the current window.
    entry.timestamps = entry.timestamps.filter((t) => t > windowStart)

    if (entry.timestamps.length >= config.maxRequests) {
      const oldestInWindow = entry.timestamps[0]
      const retryAfterMs = oldestInWindow + config.windowMs - now

      return { success: false, retryAfterMs }
    }

    entry.timestamps.push(now)
    return { success: true }
  }
}

/**
 * Extract the client IP address from a Request object.
 * Falls back to "unknown" when no forwarding headers are present.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }
  return 'unknown'
}

// ---------------------------------------------------------------------------
// Pre-configured limiters for auth endpoints
// ---------------------------------------------------------------------------

/** Login: 5 requests per minute per IP */
export const loginLimiter = createRateLimiter('login', {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
})

/** Register: 3 requests per hour per IP */
export const registerLimiter = createRateLimiter('register', {
  maxRequests: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
})
