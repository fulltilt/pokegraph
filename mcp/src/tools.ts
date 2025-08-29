import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { FastMCP } from "fastmcp";
import { getCardPriceTrends, getQuantitySpikes } from "@pokemon/shared/db";

const prisma = new PrismaClient();

const mcp = new FastMCP({
  name: "Github",
  version: "1.0.0",
});

const toolDefinitions = [
  {
    name: "get_price_trends",
    description: "Get price trends for a Pokemon card over time",
    inputSchema: z.object({
      card_name: z.string().describe("Name of the Pokemon card"),
      set_name: z
        .string()
        .optional()
        .describe("Optional set name to filter by"),
      condition: z
        .string()
        .optional()
        .describe("Card condition (mint, near_mint, etc.)"),
      days_back: z
        .number()
        .default(30)
        .describe("Number of days to look back for trends"),
    }),
    execute: async ({
      cardId,
      startDate,
    }: {
      cardId: string;
      startDate: Date;
    }) => {
      try {
        // Your database query logic here
        const priceData = await getCardPriceTrends(cardId, startDate);

        const trendData = priceData.map((item) => ({
          date: item.date.toISOString().split("T")[0],
          price: item.price,
          prev_price: item.prev_price,
          pct_change: item.pct_change,
        }));

        const firstPrice = trendData[0]?.price || 0;
        const lastPrice = trendData[trendData.length - 1]?.price || 0;
        const percentageChange =
          firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;
        const averagePrice =
          trendData.reduce((sum, item) => sum + item.price, 0) /
          trendData.length;

        return {
          // card_name,
          // set_name,
          // condition,
          // period_days: days_back,
          trend_data: trendData,
          trend_direction:
            percentageChange > 0
              ? "upward"
              : percentageChange < 0
              ? "downward"
              : "stable",
          percentage_change: percentageChange,
          average_price: averagePrice,
        };
      } catch (error) {
        throw new Error(
          `Failed to get price trends: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  },
  {
    name: "detect_quantity_spikes",
    description:
      "Get cards whose quantities have spiked recently (last 3 days). Detect unusual quantity spikes that may indicate market events or opportunities",
    inputSchema: z.object({
      threshold: z
        .number()
        .describe("Z-score threshold for spike detection. Default is 1.5"),
    }),
    execute: async ({ threshold = 1.5 }: { threshold: number }) => {
      try {
        // Your database query logic here
        const spikes = await getQuantitySpikes(threshold);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(spikes, null, 2),
            },
          ],
        };
      } catch (error) {
        throw new Error(
          `Failed to get price price spikes: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
  },
];

// Price Analysis Tools

export const getPriceTrendssTool: Tool = {
  name: "get_price_trends",
  description:
    "Get price trends for a specific card over a time period with percentage changes",
  inputSchema: {
    type: "object",
    properties: {
      cardId: { type: "string", description: "The card ID to analyze" },
      startDate: {
        type: "string",
        format: "date",
        description: "Start date (YYYY-MM-DD)",
      },
      endDate: {
        type: "string",
        format: "date",
        description: "End date (YYYY-MM-DD)",
      },
    },
    required: ["cardId", "startDate", "endDate"],
  },
};

export async function handleGetPriceTrends(args: any) {
  const { cardId, startDate, endDate } = args;

  const trends = await prisma.$queryRaw`
    SELECT 
      date,
      price,
      LAG(price) OVER (ORDER BY date) as prev_price,
      (price - LAG(price) OVER (ORDER BY date)) / NULLIF(LAG(price) OVER (ORDER BY date), 0) * 100 as pct_change
    FROM "PriceEntry" 
    WHERE "cardId" = ${cardId}
      AND date >= ${new Date(startDate)}
      AND date <= ${new Date(endDate)}
    ORDER BY date;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(trends, null, 2),
      },
    ],
  };
}

export const calculatePriceVolatilityTool: Tool = {
  name: "calculate_price_volatility",
  description:
    "Calculate price volatility (standard deviation of returns) for a card",
  inputSchema: {
    type: "object",
    properties: {
      cardId: { type: "string", description: "The card ID to analyze" },
      startDate: {
        type: "string",
        format: "date",
        description: "Start date for analysis period",
      },
    },
    required: ["cardId", "startDate"],
  },
};

export async function handleCalculatePriceVolatility(args: any) {
  const { cardId, startDate } = args;

  const volatility = await prisma.$queryRaw`
    WITH daily_returns AS (
      SELECT 
        "cardId",
        date,
        price,
        LAG(price) OVER (PARTITION BY "cardId" ORDER BY date) as prev_price,
        (price - LAG(price) OVER (PARTITION BY "cardId" ORDER BY date)) / NULLIF(LAG(price) OVER (PARTITION BY "cardId" ORDER BY date), 0) as daily_return
      FROM "PriceEntry"
      WHERE "cardId" = ${cardId} AND date >= ${new Date(startDate)}
    )
    SELECT 
      "cardId",
      STDDEV(daily_return) as volatility,
      AVG(daily_return) as avg_return,
      COUNT(*) as data_points
    FROM daily_returns 
    WHERE daily_return IS NOT NULL
    GROUP BY "cardId";
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(volatility, null, 2),
      },
    ],
  };
}

export const findPricePeaksVallleysTool: Tool = {
  name: "find_price_peaks_valleys",
  description: "Identify local price peaks and valleys for a card",
  inputSchema: {
    type: "object",
    properties: {
      cardId: { type: "string", description: "The card ID to analyze" },
    },
    required: ["cardId"],
  },
};

export async function handleFindPricePeaksValleys(args: any) {
  const { cardId } = args;

  const peaksValleys = await prisma.$queryRaw`
    WITH price_changes AS (
      SELECT 
        *,
        LAG(price) OVER (ORDER BY date) as prev_price,
        LEAD(price) OVER (ORDER BY date) as next_price
      FROM "PriceEntry"
      WHERE "cardId" = ${cardId}
      ORDER BY date
    )
    SELECT 
      date,
      price,
      prev_price,
      next_price,
      CASE 
        WHEN price > prev_price AND price > next_price THEN 'peak'
        WHEN price < prev_price AND price < next_price THEN 'valley'
        ELSE null
      END as point_type
    FROM price_changes
    WHERE (price > prev_price AND price > next_price) 
       OR (price < prev_price AND price < next_price)
    ORDER BY date;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(peaksValleys, null, 2),
      },
    ],
  };
}

export const getPriceGrowthRateTool: Tool = {
  name: "get_price_growth_rate",
  description: "Calculate growth rate over a specific period for a card",
  inputSchema: {
    type: "object",
    properties: {
      cardId: { type: "string", description: "The card ID to analyze" },
      startDate: {
        type: "string",
        format: "date",
        description: "Period start date",
      },
      endDate: {
        type: "string",
        format: "date",
        description: "Period end date",
      },
    },
    required: ["cardId", "startDate", "endDate"],
  },
};

export async function handleGetPriceGrowthRate(args: any) {
  const { cardId, startDate, endDate } = args;

  const growthRate = await prisma.$queryRaw`
    WITH start_end_prices AS (
      SELECT 
        "cardId",
        MIN(CASE WHEN date >= ${new Date(
          startDate
        )} THEN price END) as start_price,
        MAX(CASE WHEN date <= ${new Date(endDate)} THEN price END) as end_price,
        MIN(CASE WHEN date >= ${new Date(
          startDate
        )} THEN date END) as start_date,
        MAX(CASE WHEN date <= ${new Date(endDate)} THEN date END) as end_date
      FROM "PriceEntry"
      WHERE "cardId" = ${cardId}
      GROUP BY "cardId"
    )
    SELECT 
      "cardId",
      start_price,
      end_price,
      start_date,
      end_date,
      (end_price - start_price) / NULLIF(start_price, 0) * 100 as growth_rate_pct,
      EXTRACT(DAYS FROM (end_date - start_date)) as days_elapsed
    FROM start_end_prices;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(growthRate, null, 2),
      },
    ],
  };
}

// Buying/Selling Assistance Tools

export const getFairValueEstimateTool: Tool = {
  name: "get_fair_value_estimate",
  description: "Calculate fair value estimate using multiple pricing methods",
  inputSchema: {
    type: "object",
    properties: {
      cardId: { type: "string", description: "The card ID to evaluate" },
      historicalDays: {
        type: "number",
        description: "Number of days of historical data to use",
        default: 90,
      },
    },
    required: ["cardId"],
  },
};

export async function handleGetFairValueEstimate(args: any) {
  const { cardId, historicalDays = 90 } = args;
  const startDate = new Date(Date.now() - historicalDays * 24 * 60 * 60 * 1000);

  const fairValue = await prisma.$queryRaw`
    WITH price_metrics AS (
      SELECT 
        "cardId",
        AVG(price) as mean_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price,
        STDDEV(price) as price_stddev,
        COUNT(*) as data_points,
        MAX(date) as latest_date
      FROM "PriceEntry"
      WHERE "cardId" = ${cardId}
        AND date >= ${startDate}
      GROUP BY "cardId"
    ),
    recent_trend AS (
      SELECT 
        "cardId",
        AVG(price) as recent_avg,
        (LAST_VALUE(price) OVER (ORDER BY date RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) - 
         FIRST_VALUE(price) OVER (ORDER BY date RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)) /
         NULLIF(FIRST_VALUE(price) OVER (ORDER BY date RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), 0) * 100 as trend_direction
      FROM "PriceEntry"
      WHERE "cardId" = ${cardId}
        AND date >= CURRENT_DATE - INTERVAL '14 days'
      GROUP BY "cardId"
    ),
    current_price AS (
      SELECT 
        "cardId",
        price as current_price,
        date as price_date
      FROM "PriceEntry"
      WHERE "cardId" = ${cardId}
      ORDER BY date DESC
      LIMIT 1
    )
    SELECT 
      pm."cardId",
      cp.current_price,
      pm.mean_price,
      pm.median_price,
      rt.recent_avg,
      pm.price_stddev,
      rt.trend_direction,
      (pm.median_price * 0.4 + rt.recent_avg * 0.4 + pm.mean_price * 0.2) as fair_value_estimate,
      CASE 
        WHEN cp.current_price < (pm.median_price * 0.9) THEN 'undervalued'
        WHEN cp.current_price > (pm.median_price * 1.1) THEN 'overvalued'
        ELSE 'fairly_valued'
      END as valuation_signal,
      pm.data_points
    FROM price_metrics pm
    JOIN recent_trend rt ON pm."cardId" = rt."cardId"
    JOIN current_price cp ON pm."cardId" = cp."cardId";
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(fairValue, null, 2),
      },
    ],
  };
}

export const findBestBuyTimingTool: Tool = {
  name: "find_best_buy_timing",
  description: "Analyze historical patterns to identify optimal buying windows",
  inputSchema: {
    type: "object",
    properties: {
      cardId: { type: "string", description: "The card ID to analyze" },
      historicalDays: {
        type: "number",
        description: "Historical analysis period in days",
        default: 365,
      },
    },
    required: ["cardId"],
  },
};

export async function handleFindBestBuyTiming(args: any) {
  const { cardId, historicalDays = 365 } = args;
  const startDate = new Date(Date.now() - historicalDays * 24 * 60 * 60 * 1000);

  const buyTiming = await prisma.$queryRaw`
    WITH daily_changes AS (
      SELECT 
        "cardId",
        date,
        price,
        EXTRACT(DOW FROM date) as day_of_week,
        EXTRACT(DAY FROM date) as day_of_month,
        LAG(price) OVER (PARTITION BY "cardId" ORDER BY date) as prev_price
      FROM "PriceEntry"
      WHERE "cardId" = ${cardId}
        AND date >= ${startDate}
    ),
    timing_analysis AS (
      SELECT 
        day_of_week,
        COUNT(*) as occurrences,
        AVG((price - prev_price) / NULLIF(prev_price, 0) * 100) as avg_daily_change,
        STDDEV((price - prev_price) / NULLIF(prev_price, 0) * 100) as change_volatility,
        COUNT(CASE WHEN (price - prev_price) / NULLIF(prev_price, 0) < -0.05 THEN 1 END) as dip_opportunities
      FROM daily_changes
      WHERE prev_price IS NOT NULL
      GROUP BY day_of_week
      HAVING COUNT(*) >= 3
    )
    SELECT 
      CASE day_of_week
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
      END as weekday,
      avg_daily_change,
      change_volatility,
      dip_opportunities,
      occurrences,
      CASE 
        WHEN avg_daily_change < -2 AND dip_opportunities::float / occurrences > 0.3 THEN 'strong_buy_window'
        WHEN avg_daily_change < 0 AND dip_opportunities::float / occurrences > 0.2 THEN 'buy_window'
        ELSE 'neutral'
      END as timing_signal
    FROM timing_analysis
    ORDER BY avg_daily_change ASC;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(buyTiming, null, 2),
      },
    ],
  };
}

export const calculateHoldingPeriodsTool: Tool = {
  name: "calculate_holding_periods",
  description:
    "Analyze optimal holding periods based on historical return data",
  inputSchema: {
    type: "object",
    properties: {
      cardId: { type: "string", description: "The card ID to analyze" },
      historicalDays: {
        type: "number",
        description: "Historical analysis period in days",
        default: 730,
      },
    },
    required: ["cardId"],
  },
};

export async function handleCalculateHoldingPeriods(args: any) {
  const { cardId, historicalDays = 730 } = args;
  const startDate = new Date(Date.now() - historicalDays * 24 * 60 * 60 * 1000);

  const holdingAnalysis = await prisma.$queryRaw`
    WITH holding_analysis AS (
      SELECT 
        buy_date.date as buy_date,
        buy_date.price as buy_price,
        sell_date.date as sell_date,
        sell_date.price as sell_price,
        EXTRACT(DAYS FROM (sell_date.date - buy_date.date)) as holding_days,
        (sell_date.price - buy_date.price) / NULLIF(buy_date.price, 0) * 100 as return_pct
      FROM "PriceEntry" buy_date
      JOIN "PriceEntry" sell_date ON buy_date."cardId" = sell_date."cardId"
      WHERE buy_date."cardId" = ${cardId}
        AND sell_date.date > buy_date.date
        AND buy_date.date >= ${startDate}
    ),
    period_performance AS (
      SELECT 
        CASE 
          WHEN holding_days <= 7 THEN '1_week'
          WHEN holding_days <= 30 THEN '1_month'
          WHEN holding_days <= 90 THEN '3_months'
          WHEN holding_days <= 180 THEN '6_months'
          WHEN holding_days <= 365 THEN '1_year'
          ELSE 'over_1_year'
        END as holding_period,
        COUNT(*) as scenarios,
        AVG(return_pct) as avg_return,
        STDDEV(return_pct) as return_volatility,
        COUNT(CASE WHEN return_pct > 0 THEN 1 END)::float / COUNT(*) * 100 as win_rate,
        MAX(return_pct) as best_return,
        MIN(return_pct) as worst_return
      FROM holding_analysis
      GROUP BY 
        CASE 
          WHEN holding_days <= 7 THEN '1_week'
          WHEN holding_days <= 30 THEN '1_month'
          WHEN holding_days <= 90 THEN '3_months'
          WHEN holding_days <= 180 THEN '6_months'
          WHEN holding_days <= 365 THEN '1_year'
          ELSE 'over_1_year'
        END
    )
    SELECT 
      holding_period,
      scenarios,
      ROUND(avg_return, 2) as avg_return_pct,
      ROUND(return_volatility, 2) as volatility,
      ROUND(win_rate, 1) as win_rate_pct,
      ROUND(best_return, 2) as max_gain_pct,
      ROUND(worst_return, 2) as max_loss_pct,
      ROUND(avg_return / NULLIF(return_volatility, 0), 3) as risk_adjusted_return
    FROM period_performance
    ORDER BY risk_adjusted_return DESC;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(holdingAnalysis, null, 2),
      },
    ],
  };
}

export const alertPriceThresholdsTool: Tool = {
  name: "alert_price_thresholds",
  description:
    "Monitor cards for buy/sell threshold alerts based on statistical analysis",
  inputSchema: {
    type: "object",
    properties: {
      cardIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of card IDs to monitor",
      },
      historicalDays: {
        type: "number",
        description: "Historical period for threshold calculation",
        default: 180,
      },
    },
    required: ["cardIds"],
  },
};

export async function handleAlertPriceThresholds(args: any) {
  const { cardIds, historicalDays = 180 } = args;
  const historicalDate = new Date(
    Date.now() - historicalDays * 24 * 60 * 60 * 1000
  );

  const alerts = await prisma.$queryRaw`
    WITH current_prices AS (
      SELECT DISTINCT
        "cardId",
        FIRST_VALUE(price) OVER (PARTITION BY "cardId" ORDER BY date DESC) as current_price,
        FIRST_VALUE(date) OVER (PARTITION BY "cardId" ORDER BY date DESC) as latest_date
      FROM "PriceEntry"
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    ),
    thresholds AS (
      SELECT 
        pe."cardId",
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY pe.price) as q1_price,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY pe.price) as q3_price,
        AVG(pe.price) as avg_price,
        STDDEV(pe.price) as price_stddev
      FROM "PriceEntry" pe
      WHERE pe.date >= ${historicalDate}
      GROUP BY pe."cardId"
    )
    SELECT 
      cp."cardId",
      c.data->>'name' as card_name,
      cp.current_price,
      t.avg_price,
      t.q1_price as buy_threshold,
      t.q3_price as sell_threshold,
      CASE 
        WHEN cp.current_price <= t.q1_price THEN 'buy_signal'
        WHEN cp.current_price >= t.q3_price THEN 'sell_signal'
        WHEN cp.current_price <= (t.avg_price - t.price_stddev) THEN 'buy_opportunity'
        WHEN cp.current_price >= (t.avg_price + t.price_stddev) THEN 'sell_opportunity'
        ELSE 'hold'
      END as signal,
      cp.latest_date
    FROM current_prices cp
    JOIN thresholds t ON cp."cardId" = t."cardId"
    JOIN "Card" c ON cp."cardId" = c.id
    WHERE cp."cardId" = ANY(${cardIds}::text[])
    ORDER BY 
      CASE 
        WHEN cp.current_price <= t.q1_price THEN 1
        WHEN cp.current_price >= t.q3_price THEN 2
        ELSE 3
      END;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(alerts, null, 2),
      },
    ],
  };
}

// Quantity Spike Detection Tools

export const detectQuantitySpikesTool: Tool = {
  name: "detect_quantity_spikes",
  description:
    "Detect unusual quantity spikes that may indicate market events or opportunities",
  inputSchema: {
    type: "object",
    properties: {
      zScoreThreshold: {
        type: "number",
        description:
          "Z-score threshold for spike detection (recommend 1.5-2.0)",
        default: 2.0,
      },
      analysisDays: {
        type: "number",
        description: "Number of days to analyze",
        default: 30,
      },
      cardId: {
        type: "string",
        description: "Optional: analyze specific card only",
      },
    },
    required: [],
  },
};

export async function handleDetectQuantitySpikes(args: any) {
  const { zScoreThreshold = 2.0, analysisDays = 30, cardId } = args;
  const startDate = new Date(Date.now() - analysisDays * 24 * 60 * 60 * 1000);

  const spikes = await prisma.$queryRaw`
    WITH quantity_stats AS (
      SELECT 
        "cardId",
        date,
        quantity,
        AVG(quantity) OVER (
          PARTITION BY "cardId" 
          ORDER BY date 
          ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING
        ) as rolling_avg_30d,
        STDDEV(quantity) OVER (
          PARTITION BY "cardId" 
          ORDER BY date 
          ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING
        ) as rolling_stddev_30d
      FROM "PriceEntry"
      WHERE quantity IS NOT NULL
        AND date >= ${startDate}
        ${cardId ? `AND "cardId" = ${cardId}` : ""}
    ),
    spike_detection AS (
      SELECT 
        qs.*,
        CASE 
          WHEN qs.rolling_stddev_30d > 0 
          THEN (qs.quantity - qs.rolling_avg_30d) / qs.rolling_stddev_30d
          ELSE 0 
        END as z_score_30d,
        CASE 
          WHEN qs.rolling_avg_30d > 0 
          THEN (qs.quantity - qs.rolling_avg_30d) / qs.rolling_avg_30d * 100
          ELSE 0 
        END as pct_above_avg_30d
      FROM quantity_stats qs
      WHERE qs.rolling_avg_30d IS NOT NULL
    )
    SELECT 
      sd."cardId",
      c.data->>'name' as card_name,
      c.data->>'set' as set_name,
      sd.date,
      sd.quantity as spike_quantity,
      ROUND(sd.rolling_avg_30d, 1) as normal_avg_quantity,
      ROUND(sd.z_score_30d, 2) as z_score_30d,
      ROUND(sd.pct_above_avg_30d, 1) as pct_above_normal,
      pe.price as spike_day_price,
      LAG(pe.price) OVER (PARTITION BY sd."cardId" ORDER BY sd.date) as prev_day_price,
      CASE 
        WHEN sd.z_score_30d >= 3 THEN 'extreme_spike'
        WHEN sd.z_score_30d >= 2 THEN 'major_spike'  
        WHEN sd.z_score_30d >= 1.5 THEN 'moderate_spike'
        ELSE 'normal'
      END as spike_severity
    FROM spike_detection sd
    JOIN "Card" c ON sd."cardId" = c.id
    JOIN "PriceEntry" pe ON sd."cardId" = pe."cardId" AND sd.date = pe.date
    WHERE sd.z_score_30d >= ${zScoreThreshold}
    ORDER BY sd.z_score_30d DESC, sd.date DESC;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(spikes, null, 2),
      },
    ],
  };
}

export const quantityPriceCorrelationTool: Tool = {
  name: "quantity_price_correlation",
  description:
    "Analyze correlation between quantity spikes and subsequent price movements",
  inputSchema: {
    type: "object",
    properties: {
      zScoreThreshold: {
        type: "number",
        description: "Z-score threshold for spike detection",
        default: 2.0,
      },
      analysisDays: {
        type: "number",
        description: "Number of days to analyze",
        default: 90,
      },
      cardId: {
        type: "string",
        description: "Optional: analyze specific card only",
      },
    },
    required: [],
  },
};

export async function handleQuantityPriceCorrelation(args: any) {
  const { zScoreThreshold = 2.0, analysisDays = 90, cardId } = args;
  const startDate = new Date(Date.now() - analysisDays * 24 * 60 * 60 * 1000);

  const correlation = await prisma.$queryRaw`
    WITH quantity_events AS (
      SELECT 
        pe."cardId",
        pe.date as event_date,
        pe.quantity,
        pe.price as event_price,
        AVG(pe.quantity) OVER (
          PARTITION BY pe."cardId" 
          ORDER BY pe.date 
          ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING
        ) as baseline_quantity,
        STDDEV(pe.quantity) OVER (
          PARTITION BY pe."cardId" 
          ORDER BY pe.date 
          ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING
        ) as quantity_stddev
      FROM "PriceEntry" pe
      WHERE pe.quantity IS NOT NULL
        AND pe.date >= ${startDate}
        ${cardId ? `AND pe."cardId" = ${cardId}` : ""}
    ),
    spike_events AS (
      SELECT *,
        (quantity - baseline_quantity) / NULLIF(quantity_stddev, 0) as spike_z_score
      FROM quantity_events
      WHERE (quantity - baseline_quantity) / NULLIF(quantity_stddev, 0) >= ${zScoreThreshold}
    ),
    price_impact AS (
      SELECT 
        se."cardId",
        se.event_date,
        se.spike_z_score,
        se.event_price,
        pe1.price as price_1d_after,
        pe3.price as price_3d_after,
        pe7.price as price_7d_after,
        (pe1.price - se.event_price) / NULLIF(se.event_price, 0) * 100 as change_1d,
        (pe3.price - se.event_price) / NULLIF(se.event_price, 0) * 100 as change_3d,
        (pe7.price - se.event_price) / NULLIF(se.event_price, 0) * 100 as change_7d
      FROM spike_events se
      LEFT JOIN "PriceEntry" pe1 ON se."cardId" = pe1."cardId" 
        AND pe1.date = se.event_date + INTERVAL '1 day'
      LEFT JOIN "PriceEntry" pe3 ON se."cardId" = pe3."cardId" 
        AND pe3.date = se.event_date + INTERVAL '3 days'
      LEFT JOIN "PriceEntry" pe7 ON se."cardId" = pe7."cardId" 
        AND pe7.date = se.event_date + INTERVAL '7 days'
    )
    SELECT 
      pi."cardId",
      c.data->>'name' as card_name,
      pi.event_date,
      ROUND(pi.spike_z_score, 2) as spike_intensity,
      pi.event_price,
      ROUND(pi.change_1d, 2) as price_impact_1d,
      ROUND(pi.change_3d, 2) as price_impact_3d, 
      ROUND(pi.change_7d, 2) as price_impact_7d,
      CASE 
        WHEN pi.change_1d > 10 THEN 'immediate_pump'
        WHEN pi.change_1d < -10 THEN 'immediate_dump'
        WHEN pi.change_3d > 15 THEN 'delayed_pump'
        WHEN pi.change_7d < -15 THEN 'delayed_dump'
        ELSE 'minimal_impact'
      END as pattern_type,
      CASE
        WHEN pi.spike_z_score >= 3 THEN 'investigate_immediately'
        WHEN pi.spike_z_score >= 2 AND pi.change_1d < -3 THEN 'potential_buy_opportunity'
        WHEN pi.spike_z_score >= 2 AND pi.change_1d > 5 THEN 'potential_sell_pressure'
        ELSE 'monitor'
      END as action_signal
    FROM price_impact pi
    JOIN "Card" c ON pi."cardId" = c.id
    WHERE pi.spike_z_score >= ${zScoreThreshold}
    ORDER BY pi.event_date DESC, pi.spike_z_score DESC;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(correlation, null, 2),
      },
    ],
  };
}

export const quantityAnomalyDashboardTool: Tool = {
  name: "quantity_anomaly_dashboard",
  description:
    "Real-time dashboard of quantity anomalies and their activity levels",
  inputSchema: {
    type: "object",
    properties: {
      minZScore: {
        type: "number",
        description: "Minimum Z-score to include",
        default: 1.5,
      },
      daysPeriod: {
        type: "number",
        description: "Period to analyze for anomalies",
        default: 14,
      },
    },
    required: [],
  },
};

export async function handleQuantityAnomalyDashboard(args: any) {
  const { minZScore = 1.5, daysPeriod = 14 } = args;

  const dashboard = await prisma.$queryRaw`
    WITH recent_spikes AS (
      SELECT 
        pe."cardId",
        pe.date,
        pe.quantity,
        pe.price,
        AVG(pe.quantity) OVER (
          PARTITION BY pe."cardId" 
          ORDER BY pe.date 
          ROWS BETWEEN 14 PRECEDING AND 1 PRECEDING
        ) as avg_14d,
        STDDEV(pe.quantity) OVER (
          PARTITION BY pe."cardId" 
          ORDER BY pe.date 
          ROWS BETWEEN 14 PRECEDING AND 1 PRECEDING
        ) as stddev_14d
      FROM "PriceEntry" pe
      WHERE pe.quantity IS NOT NULL
        AND pe.date >= CURRENT_DATE - INTERVAL '${daysPeriod} days'
    ),
    spike_summary AS (
      SELECT 
        rs."cardId",
        c.data->>'name' as card_name,
        c.data->>'set' as set_name,
        c.data->>'rarity' as rarity,
        COUNT(CASE WHEN (rs.quantity - rs.avg_14d) / NULLIF(rs.stddev_14d, 0) >= 2 THEN 1 END) as spike_count_14d,
        MAX(CASE WHEN (rs.quantity - rs.avg_14d) / NULLIF(rs.stddev_14d, 0) >= 2 
                THEN rs.date END) as last_spike_date,
        MAX((rs.quantity - rs.avg_14d) / NULLIF(rs.stddev_14d, 0)) as max_z_score,
        FIRST_VALUE(rs.price) OVER (PARTITION BY rs."cardId" ORDER BY rs.date DESC) as current_price
      FROM recent_spikes rs
      JOIN "Card" c ON rs."cardId" = c.id
      WHERE rs.avg_14d IS NOT NULL
      GROUP BY rs."cardId", c.data
    )
    SELECT 
      "cardId",
      card_name,
      set_name,
      rarity,
      spike_count_14d,
      last_spike_date,
      ROUND(max_z_score, 2) as strongest_spike_z_score,
      current_price,
      CASE 
        WHEN spike_count_14d >= 3 THEN 'high_activity'
        WHEN spike_count_14d >= 1 AND last_spike_date >= CURRENT_DATE - INTERVAL '3 days' THEN 'recent_spike'
        ELSE 'normal'
      END as activity_level
    FROM spike_summary
    WHERE spike_count_14d > 0 OR max_z_score >= ${minZScore}
    ORDER BY last_spike_date DESC, max_z_score DESC;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(dashboard, null, 2),
      },
    ],
  };
}

export const realTimeQuantityAlertsTool: Tool = {
  name: "realtime_quantity_alerts",
  description:
    "Real-time monitoring for quantity spikes happening right now or in the last few days",
  inputSchema: {
    type: "object",
    properties: {
      alertThreshold: {
        type: "number",
        description: "Z-score threshold for immediate alerts",
        default: 2.5,
      },
      hoursBack: {
        type: "number",
        description: "Hours to look back for recent spikes",
        default: 72,
      },
    },
    required: [],
  },
};

export async function handleRealTimeQuantityAlerts(args: any) {
  const { alertThreshold = 2.5, hoursBack = 72 } = args;

  const alerts = await prisma.$queryRaw`
    WITH recent_data AS (
      SELECT 
        pe."cardId",
        pe.date,
        pe.quantity,
        pe.price,
        AVG(pe.quantity) OVER (
          PARTITION BY pe."cardId" 
          ORDER BY pe.date 
          ROWS BETWEEN 21 PRECEDING AND 1 PRECEDING
        ) as baseline_avg,
        STDDEV(pe.quantity) OVER (
          PARTITION BY pe."cardId" 
          ORDER BY pe.date 
          ROWS BETWEEN 21 PRECEDING AND 1 PRECEDING
        ) as baseline_stddev,
        ROW_NUMBER() OVER (PARTITION BY pe."cardId" ORDER BY pe.date DESC) as recency_rank
      FROM "PriceEntry" pe
      WHERE pe.quantity IS NOT NULL
        AND pe.date >= CURRENT_TIMESTAMP - INTERVAL '${hoursBack} hours'
    ),
    current_spikes AS (
      SELECT 
        rd.*,
        (rd.quantity - rd.baseline_avg) / NULLIF(rd.baseline_stddev, 0) as z_score,
        (rd.quantity - rd.baseline_avg) / NULLIF(rd.baseline_avg, 0) * 100 as pct_increase
      FROM recent_data rd
      WHERE rd.baseline_avg IS NOT NULL
        AND rd.recency_rank <= 3  -- Last 3 data points per card
    )
    SELECT 
      cs."cardId",
      c.data->>'name' as card_name,
      c.data->>'set' as set_name,
      cs.date as alert_timestamp,
      cs.quantity as current_quantity,
      ROUND(cs.baseline_avg, 1) as typical_quantity,
      ROUND(cs.z_score, 2) as spike_z_score,
      ROUND(cs.pct_increase, 1) as increase_percentage,
      cs.price as current_price,
      CASE 
        WHEN cs.z_score >= 4 THEN 'CRITICAL'
        WHEN cs.z_score >= 3 THEN 'HIGH'
        WHEN cs.z_score >= 2.5 THEN 'MEDIUM'
        ELSE 'LOW'
      END as alert_priority,
      EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - cs.date)) / 3600 as hours_ago
    FROM current_spikes cs
    JOIN "Card" c ON cs."cardId" = c.id
    WHERE cs.z_score >= ${alertThreshold}
    ORDER BY cs.z_score DESC, cs.date DESC;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(alerts, null, 2),
      },
    ],
  };
}

// Advanced Quantity Analysis

export const quantityTrendAnalysisTool: Tool = {
  name: "quantity_trend_analysis",
  description:
    "Analyze quantity trends to distinguish between natural growth and artificial spikes",
  inputSchema: {
    type: "object",
    properties: {
      cardId: { type: "string", description: "The card ID to analyze" },
      analysisDays: {
        type: "number",
        description: "Number of days to analyze",
        default: 60,
      },
    },
    required: ["cardId"],
  },
};

export async function handleQuantityTrendAnalysis(args: any) {
  const { cardId, analysisDays = 60 } = args;
  const startDate = new Date(Date.now() - analysisDays * 24 * 60 * 60 * 1000);

  const trendAnalysis = await prisma.$queryRaw`
    WITH quantity_trends AS (
      SELECT 
        "cardId",
        date,
        quantity,
        price,
        -- Moving averages of different periods
        AVG(quantity) OVER (
          PARTITION BY "cardId" 
          ORDER BY date 
          ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) as ma_7d,
        AVG(quantity) OVER (
          PARTITION BY "cardId" 
          ORDER BY date 
          ROWS BETWEEN 13 PRECEDING AND CURRENT ROW
        ) as ma_14d,
        AVG(quantity) OVER (
          PARTITION BY "cardId" 
          ORDER BY date 
          ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
        ) as ma_30d,
        -- Rate of change
        (quantity - LAG(quantity, 7) OVER (PARTITION BY "cardId" ORDER BY date)) / 
        NULLIF(LAG(quantity, 7) OVER (PARTITION BY "cardId" ORDER BY date), 0) * 100 as weekly_change_pct
      FROM "PriceEntry"
      WHERE "cardId" = ${cardId}
        AND quantity IS NOT NULL
        AND date >= ${startDate}
    )
    SELECT 
      qt.date,
      qt.quantity,
      qt.price,
      ROUND(qt.ma_7d, 1) as ma_7d,
      ROUND(qt.ma_14d, 1) as ma_14d, 
      ROUND(qt.ma_30d, 1) as ma_30d,
      ROUND(qt.weekly_change_pct, 2) as weekly_change_pct,
      -- Trend classification
      CASE 
        WHEN qt.ma_7d > qt.ma_14d AND qt.ma_14d > qt.ma_30d THEN 'strong_uptrend'
        WHEN qt.ma_7d > qt.ma_14d THEN 'uptrend'
        WHEN qt.ma_7d < qt.ma_14d AND qt.ma_14d < qt.ma_30d THEN 'downtrend'
        ELSE 'sideways'
      END as trend_direction,
      -- Spike vs trend detection
      CASE 
        WHEN qt.quantity > qt.ma_7d * 3 THEN 'likely_spike'
        WHEN qt.quantity > qt.ma_14d * 2 AND qt.weekly_change_pct > 100 THEN 'possible_spike'
        WHEN qt.ma_7d > qt.ma_30d * 1.5 THEN 'sustained_increase'
        ELSE 'normal_pattern'
      END as pattern_type
    FROM quantity_trends qt
    ORDER BY qt.date DESC;
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(trendAnalysis, null, 2),
      },
    ],
  };
}

// Market-wide quantity monitoring

export const marketQuantityOverviewTool: Tool = {
  name: "market_quantity_overview",
  description: "Get market-wide overview of quantity spikes across all cards",
  inputSchema: {
    type: "object",
    properties: {
      zScoreThreshold: {
        type: "number",
        description: "Minimum Z-score for inclusion",
        default: 2.0,
      },
      topN: {
        type: "number",
        description: "Number of top cards to return",
        default: 20,
      },
    },
    required: [],
  },
};

export async function handleMarketQuantityOverview(args: any) {
  const { zScoreThreshold = 2.0, topN = 20 } = args;

  const overview = await prisma.$queryRaw`
    WITH market_spikes AS (
      SELECT 
        pe."cardId",
        pe.date,
        pe.quantity,
        pe.price,
        AVG(pe.quantity) OVER (
          PARTITION BY pe."cardId" 
          ORDER BY pe.date 
          ROWS BETWEEN 21 PRECEDING AND 1 PRECEDING
        ) as baseline_avg,
        STDDEV(pe.quantity) OVER (
          PARTITION BY pe."cardId" 
          ORDER BY pe.date 
          ROWS BETWEEN 21 PRECEDING AND 1 PRECEDING
        ) as baseline_stddev
      FROM "PriceEntry" pe
      WHERE pe.quantity IS NOT NULL
        AND pe.date >= CURRENT_DATE - INTERVAL '7 days'
    ),
    significant_spikes AS (
      SELECT 
        ms."cardId",
        ms.date,
        ms.quantity,
        ms.price,
        (ms.quantity - ms.baseline_avg) / NULLIF(ms.baseline_stddev, 0) as z_score,
        ROW_NUMBER() OVER (PARTITION BY ms."cardId" ORDER BY 
          (ms.quantity - ms.baseline_avg) / NULLIF(ms.baseline_stddev, 0) DESC) as spike_rank
      FROM market_spikes ms
      WHERE ms.baseline_avg IS NOT NULL
        AND (ms.quantity - ms.baseline_avg) / NULLIF(ms.baseline_stddev, 0) >= ${zScoreThreshold}
    )
    SELECT 
      ss."cardId",
      c.data->>'name' as card_name,
      c.data->>'set' as set_name,
      c.data->>'rarity' as rarity,
      ss.date as spike_date,
      ss.quantity as spike_quantity,
      ROUND(ss.z_score, 2) as z_score,
      ss.price as price_at_spike,
      EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ss.date)) / 3600 as hours_ago,
      -- Market context
      CASE 
        WHEN ss.z_score >= 4 THEN 'EXTREME'
        WHEN ss.z_score >= 3 THEN 'MAJOR'
        WHEN ss.z_score >= 2.5 THEN 'NOTABLE'
        ELSE 'MODERATE'
      END as spike_magnitude
    FROM significant_spikes ss
    JOIN "Card" c ON ss."cardId" = c.id
    WHERE ss.spike_rank = 1  -- Only the biggest spike per card
    ORDER BY ss.z_score DESC
    LIMIT ${topN};
  `;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(overview, null, 2),
      },
    ],
  };
}

// Tool registration array for easy MCP server setup
export const allPokemonTools: Tool[] = [
  getPriceTrendssTool,
  calculatePriceVolatilityTool,
  findPricePeaksVallleysTool,
  getPriceGrowthRateTool,
  getFairValueEstimateTool,
  findBestBuyTimingTool,
  calculateHoldingPeriodsTool,
  alertPriceThresholdsTool,
  detectQuantitySpikesTool,
  quantityPriceCorrelationTool,
  quantityAnomalyDashboardTool,
  realTimeQuantityAlertsTool,
  quantityTrendAnalysisTool,
  marketQuantityOverviewTool,
];

// Handler mapping for easy dispatch
export const toolHandlers = {
  get_price_trends: handleGetPriceTrends,
  calculate_price_volatility: handleCalculatePriceVolatility,
  find_price_peaks_valleys: handleFindPricePeaksValleys,
  get_price_growth_rate: handleGetPriceGrowthRate,
  get_fair_value_estimate: handleGetFairValueEstimate,
  find_best_buy_timing: handleFindBestBuyTiming,
  calculate_holding_periods: handleCalculateHoldingPeriods,
  alert_price_thresholds: handleAlertPriceThresholds,
  detect_quantity_spikes: handleDetectQuantitySpikes,
  quantity_price_correlation: handleQuantityPriceCorrelation,
  quantity_anomaly_dashboard: handleQuantityAnomalyDashboard,
  realtime_quantity_alerts: handleRealTimeQuantityAlerts,
  quantity_trend_analysis: handleQuantityTrendAnalysis,
  market_quantity_overview: handleMarketQuantityOverview,
};

// Example MCP Server implementation
export class PokemonAnalyticsMCPServer {
  async handleToolCall(name: string, args: any) {
    const handler = toolHandlers[name as keyof typeof toolHandlers];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }
    return await handler(args);
  }

  getTools(): Tool[] {
    return allPokemonTools;
  }
}

// Usage example:
/*
const server = new PokemonAnalyticsMCPServer();

// Handle a tool call
const result = await server.handleToolCall('detect_quantity_spikes', {
  zScoreThreshold: 2.0,
  analysisDays: 30
});

// Get all available tools
const tools = server.getTools();
*/

// Function to start stdio mode (your original functionality)
async function startStdioServer() {
  try {
    await mcp.start({
      transportType: "stdio",
    });
    // debugPrint("GitHub MCP Server started successfully (stdio)");
  } catch (error) {
    // debugPrint("Failed to start GitHub MCP Server:", error);
    process.exit(1);
  }
}

// Function to start HTTP mode with streamableHttp
async function startHttpServer() {
  try {
    await mcp.start({
      transportType: "httpStream",
      httpStream: {
        port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
        host: process.env.HOST || "localhost",
      },
    });
    const port = process.env.PORT || 3000;
    // console.log(
    //   `GitHub MCP Server started successfully (HTTP) on port ${port}`
    // );
  } catch (error) {
    // debugPrint("Failed to start GitHub MCP Server (HTTP):", error);
    process.exit(1);
  }
}

// Start server based on command line argument or environment variable
if (import.meta.url === `file://${process.argv[1]}`) {
  const serverType = process.argv[2] || process.env.SERVER_TYPE || "stdio";
  console.log(serverType);
  if (serverType === "http") {
    startHttpServer();
  } else {
    startStdioServer();
  }
}

// Export everything for use in other modules
export { mcp, toolDefinitions, startStdioServer, startHttpServer };
