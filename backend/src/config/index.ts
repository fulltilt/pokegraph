import type { TimeframeKey } from "../types";

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3457,
  embeddingServiceUrl:
    process.env.EMBEDDING_SERVICE_URL || "http://localhost:8000",
  uploadLimit: 10 * 1024 * 1024, // 10MB
};

export const timeframeMap: Record<TimeframeKey, string> = {
  "10d": "10 days",
  "1m": "1 month",
  "3m": "3 months",
  "6m": "6 months",
  "1y": "1 year",
};
