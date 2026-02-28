import { defineRateLimits } from "convex-helpers/server/rateLimit";

const HOUR = 60 * 60 * 1000;

export const { rateLimit, checkRateLimit, resetRateLimit } = defineRateLimits({
    llmCall: { kind: 'token bucket', rate: 20, period: HOUR, capacity: 5 },
    embedCall: { kind: 'token bucket', rate: 100, period: HOUR, capacity: 100 },
});
