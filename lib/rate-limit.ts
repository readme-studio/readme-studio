import { Redis } from "@upstash/redis";

// 每个 IP 每天可调用 AI 总结的次数上限
export const DAILY_SUMMARY_LIMIT = 3;

// 未配置 Redis 时（本地开发）返回 null，调用方据此放行
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  // null 表示未配置 Redis（开发环境放行，不计入限制）
  limit: number | null;
}

// 基于 Upstash Redis 的「每日 N 次」滑动计数；key 由调用方按 IP/用户拼装
export async function checkDailySummaryLimit(
  key: string,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) {
    return { allowed: true, remaining: DAILY_SUMMARY_LIMIT, limit: null };
  }

  const current = Number((await redis.get(key)) ?? 0);
  if (current >= DAILY_SUMMARY_LIMIT) {
    return { allowed: false, remaining: 0, limit: DAILY_SUMMARY_LIMIT };
  }

  const next = await redis.incr(key);
  if (next === 1) {
    // 滚动 24 小时窗口，近似「每日」
    await redis.expire(key, 86_400);
  }

  return {
    allowed: true,
    remaining: Math.max(0, DAILY_SUMMARY_LIMIT - next),
    limit: DAILY_SUMMARY_LIMIT,
  };
}
