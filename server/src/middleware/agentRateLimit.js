const buckets = new Map();

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 30;

export function agentRateLimit(req, res, next) {
  const userId = String(req.user?._id || "anonymous");
  const now = Date.now();

  let bucket = buckets.get(userId);

  if (!bucket || now - bucket.startedAt >= WINDOW_MS) {
    bucket = { startedAt: now, count: 0 };
    buckets.set(userId, bucket);
  }

  bucket.count += 1;

  if (bucket.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many agent requests. Please try again later.",
    });
  }

  next();
}
