import { timeframeMap } from "../config";
import { TimeframeKey } from "../types";

export function convertTimeframeToDate(timeframe: string): Date {
  const date = new Date();

  switch (timeframe) {
    case "1y":
      date.setFullYear(date.getFullYear() - 1);
      break;
    case "6m":
      date.setMonth(date.getMonth() - 6);
      break;
    case "3m":
      date.setMonth(date.getMonth() - 3);
      break;
    case "10d":
      date.setDate(date.getDate() - 10);
      break;
    default:
      date.setMonth(date.getMonth() - 1);
  }

  return date;
}

export function getTimeframeInterval(queryValue: unknown): string {
  if (typeof queryValue === "string" && queryValue in timeframeMap) {
    return timeframeMap[queryValue as TimeframeKey];
  }

  return timeframeMap["10d"];
}
