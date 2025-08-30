import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// PRICE ANALYSIS TOOLS

// Price Trend Analysis
// Track price changes over time periods (daily, weekly, monthly, yearly)
export const getCardPriceTrends = async (
  cardId: string,
  startDate: Date
): Promise<
  { date: Date; price: number; prev_price: number; pct_change: number }[]
> => {
  return await prisma.$queryRawUnsafe(
    `
    SELECT 
      date,
      price,
      LAG(price) OVER (ORDER BY date) as prev_price,
      (price - LAG(price) OVER (ORDER BY date)) / LAG(price) OVER (ORDER BY date) * 100 as pct_change
    FROM "PriceEntry" 
    WHERE "cardId" = $1 
      AND date >= $2 
    ORDER BY date;
    `,
    cardId,
    startDate
  );

  // const trends = await prisma.priceEntry.findMany({
  //   where: {
  //     cardId: cardId,
  //     date: {
  //       gte: startDate,
  //       lte: endDate
  //     }
  //   },
  //   orderBy: { date: 'asc' },
  //   select: {
  //     date: true,
  //     price: true
  //   }
  // });
};

// Measure price stability/fluctuation for risk assessment. Calculate volatility (standard deviation of daily returns)
export const getCardVolatility = async (cardId: string, date: Date) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH daily_returns AS (
        SELECT 
          "cardId",
          date,
          price,
          (price - LAG(price) OVER (PARTITION BY "cardId" ORDER BY date)) / LAG(price) OVER (PARTITION BY "cardId" ORDER BY date) as daily_return
        FROM "PriceEntry"
        WHERE "cardId" = $1 AND date >= $2
      )
      SELECT 
        "cardId",
        STDDEV(daily_return) as volatility,
        AVG(daily_return) as avg_return,
        COUNT(*) as data_points
      FROM daily_returns 
      WHERE daily_return IS NOT NULL
      GROUP BY "cardId";
    `,
    cardId,
    date
  );
};

// Identify highest and lowest price points with dates. Find local peaks and valleys using window functions
export const findPricePeaksAndValleys = async (cardId: string, date: Date) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH daily_returns AS (
        SELECT 
          "cardId",
          date,
          price,
          (price - LAG(price) OVER (PARTITION BY "cardId" ORDER BY date)) / LAG(price) OVER (PARTITION BY "cardId" ORDER BY date) as daily_return
        FROM "PriceEntry"
        WHERE "cardId" = $1 AND date >= $2
      )
      SELECT 
        "cardId",
        STDDEV(daily_return) as volatility,
        AVG(daily_return) as avg_return,
        COUNT(*) as data_points
      FROM daily_returns 
      WHERE daily_return IS NOT NULL
      GROUP BY "cardId";
    `,
    cardId,
    date
  );
};

// Calculate percentage growth/decline over specified periods
export const getPriceGrowthRate = async (
  cardId: string,
  startDate: Date,
  endDate: Date
) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH start_end_prices AS (
        SELECT 
          "cardId",
          MIN(CASE WHEN date >= $2 THEN price END) as start_price,
          MAX(CASE WHEN date <= $3 THEN price END) as end_price,
          MIN(CASE WHEN date >= $2 THEN date END) as start_date,
          MAX(CASE WHEN date <= $3 THEN date END) as end_date
        FROM "PriceEntry"
        WHERE "cardId" = $1
        GROUP BY "cardId"
      )
      SELECT 
        "cardId",
        start_price,
        end_price,
        start_date,
        end_date,
        (end_price - start_price) / start_price * 100 as growth_rate_pct,
        EXTRACT(DAYS FROM (end_date - start_date)) as days_elapsed
      FROM start_end_prices;
    `,
    cardId,
    startDate,
    endDate
  );
};

// Comparative Analysis
// Side-by-side price comparison of multiple cards
export const compareCardPerformance = async (
  cardId: string,
  startDate: Date,
  endDate: Date
) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH card_performance AS (
        SELECT 
          pe."cardId",
          c.data->>'name' as card_name,
          MIN(pe.price) as min_price,
          MAX(pe.price) as max_price,
          FIRST_VALUE(pe.price) OVER (PARTITION BY pe."cardId" ORDER BY pe.date) as start_price,
          LAST_VALUE(pe.price) OVER (PARTITION BY pe."cardId" ORDER BY pe.date RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as end_price,
          COUNT(*) as data_points
        FROM "PriceEntry" pe
        JOIN "Card" c ON pe."cardId" = c.id
        WHERE pe."cardId" = ANY($1::text[]) 
          AND pe.date >= $2 
          AND pe.date <= $3
        GROUP BY pe."cardId", c.data, pe.date
      )
      SELECT 
        "cardId",
        card_name,
        min_price,
        max_price,
        start_price,
        end_price,
        (end_price - start_price) / start_price * 100 as return_pct,
        (max_price - min_price) / min_price * 100 as volatility_range,
        data_points
      FROM card_performance;
    `,
    cardId,
    startDate,
    endDate
  );
};

// Sort cards by return on investment over time periods
export const rankCardsByROI = async (startDate: Date, limit: number) => {
  return await prisma.$queryRaw`
    WITH card_roi AS (
      SELECT 
        pe."cardId",
        c.data->>'name' as card_name,
        FIRST_VALUE(pe.price) OVER (PARTITION BY pe."cardId" ORDER BY pe.date) as start_price,
        LAST_VALUE(pe.price) OVER (PARTITION BY pe."cardId" ORDER BY pe.date RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as current_price
      FROM "PriceEntry" pe
      JOIN "Card" c ON pe."cardId" = c.id
      WHERE pe.date >= ${startDate}
    )
    SELECT 
      "cardId",
      card_name,
      start_price,
      current_price,
      (current_price - start_price) / start_price * 100 as roi_pct
    FROM card_roi
    ORDER BY roi_pct DESC
    LIMIT ${limit};
  `;
};

// Identify cards that tend to move together in price
export const findPriceCorrelations = async (startDate: Date) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH daily_returns AS (
        SELECT 
          pe."cardId",
          pe.date,
          (pe.price - LAG(pe.price) OVER (PARTITION BY pe."cardId" ORDER BY pe.date)) / LAG(pe.price) OVER (PARTITION BY pe."cardId" ORDER BY pe.date) as return_rate
        FROM "PriceEntry" pe
        WHERE pe.date >= $1
      )
      SELECT 
        a."cardId" as card_a,
        b."cardId" as card_b,
        CORR(a.return_rate, b.return_rate) as correlation
      FROM daily_returns a
      JOIN daily_returns b ON a.date = b.date AND a."cardId" < b."cardId"
      WHERE a.return_rate IS NOT NULL AND b.return_rate IS NOT NULL
      GROUP BY a."cardId", b."cardId"
      HAVING COUNT(*) >= 30  -- Minimum 30 data points
        AND ABS(CORR(a.return_rate, b.return_rate)) >= 0.7  -- Strong correlation
      ORDER BY ABS(correlation) DESC;
    `,
    startDate
  );
};

// Market Intelligence Tools

// Market Opportunity Detection
// Cards trading below historical averages or showing unusual dips
export const findUndervaluedCards = async (startDate: Date, limit: number) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH price_stats AS (
        SELECT 
          "cardId",
          AVG(price) as avg_price,
          STDDEV(price) as price_stddev,
          MAX(price) as max_price,
          MIN(price) as min_price
        FROM "PriceEntry"
        WHERE date >= $1  -- Historical period (e.g., last 6 months)
        GROUP BY "cardId"
      ),
      current_prices AS (
        SELECT DISTINCT
          "cardId",
          FIRST_VALUE(price) OVER (PARTITION BY "cardId" ORDER BY date DESC) as current_price
        FROM "PriceEntry"
        WHERE date >= CURRENT_DATE - INTERVAL '7 days'  -- Recent price
      )
      SELECT 
        ps."cardId",
        c.data->>'name' as card_name,
        c.data->>'set' as set_name,
        ps.avg_price,
        cp.current_price,
        (cp.current_price - ps.avg_price) / ps.avg_price * 100 as deviation_from_avg,
        (ps.max_price - cp.current_price) / cp.current_price * 100 as upside_potential
      FROM price_stats ps
      JOIN current_prices cp ON ps."cardId" = cp."cardId"
      JOIN "Card" c ON ps."cardId" = c.id
      WHERE cp.current_price < (ps.avg_price - ps.price_stddev * 0.5)  -- Below avg minus half std dev
      ORDER BY deviation_from_avg ASC
      LIMIT $2;
    `,
    startDate,
    limit
  );
};

// Cards with recent sharp price increases or unusual volume
export const findTrendingCards = async () => {
  return await prisma.cardPriceChangeSummary.findMany({
    where: {
      timeframe: "10d",
      type: "gainer",
      changePct: {
        gte: 20, // 20%+ increase
      },
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours of summaries
      },
    },
    include: {
      card: {
        select: {
          data: true,
          prices: {
            orderBy: { date: "desc" },
            take: 30, // Last 30 days for trend analysis
          },
        },
      },
    },
    orderBy: {
      changePct: "desc",
    },
  });
};

// Cards showing early signs of price momentum
export const findBreakoutCandidates = async (limit: number) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH momentum_analysis AS (
        SELECT 
          pe."cardId",
          pe.date,
          pe.price,
          AVG(pe.price) OVER (
            PARTITION BY pe."cardId" 
            ORDER BY pe.date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
          ) as ma_7d,
          AVG(pe.price) OVER (
            PARTITION BY pe."cardId" 
            ORDER BY pe.date 
            ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
          ) as ma_30d
        FROM "PriceEntry" pe
        WHERE pe.date >= CURRENT_DATE - INTERVAL '60 days'
      ),
      recent_momentum AS (
        SELECT 
          "cardId",
          MAX(CASE WHEN date >= CURRENT_DATE - INTERVAL '7 days' THEN ma_7d END) as recent_ma_7d,
          MAX(CASE WHEN date >= CURRENT_DATE - INTERVAL '30 days' THEN ma_30d END) as recent_ma_30d,
          MAX(price) as current_price
        FROM momentum_analysis
        GROUP BY "cardId"
      )
      SELECT 
        rm."cardId",
        c.data->>'name' as card_name,
        rm.current_price,
        rm.recent_ma_7d,
        rm.recent_ma_30d,
        (rm.recent_ma_7d - rm.recent_ma_30d) / rm.recent_ma_30d * 100 as momentum_signal
      FROM recent_momentum rm
      JOIN "Card" c ON rm."cardId" = c.id
      WHERE rm.recent_ma_7d > rm.recent_ma_30d * 1.05  -- 7d avg > 30d avg by 5%
      ORDER BY momentum_signal DESC
      LIMIT $1;
    `,
    limit
  );
};

// Detect unusual price movements (statistical anomalies) that might indicate opportunities
export const findAnomalies = async (startDate: Date) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH price_changes AS (
        SELECT 
          "cardId",
          date,
          price,
          LAG(price) OVER (PARTITION BY "cardId" ORDER BY date) as prev_price,
          (price - LAG(price) OVER (PARTITION BY "cardId" ORDER BY date)) / LAG(price) OVER (PARTITION BY "cardId" ORDER BY date) as daily_change
        FROM "PriceEntry"
        WHERE date >= $1
      ),
      change_stats AS (
        SELECT 
          "cardId",
          AVG(daily_change) as avg_change,
          STDDEV(daily_change) as stddev_change
        FROM price_changes
        WHERE daily_change IS NOT NULL
        GROUP BY "cardId"
        HAVING COUNT(*) >= 10  -- Minimum data points
      )
      SELECT 
        pc."cardId",
        c.data->>'name' as card_name,
        pc.date,
        pc.price,
        pc.prev_price,
        pc.daily_change * 100 as change_pct,
        ABS(pc.daily_change - cs.avg_change) / cs.stddev_change as z_score
      FROM price_changes pc
      JOIN change_stats cs ON pc."cardId" = cs."cardId"
      JOIN "Card" c ON pc."cardId" = c.id
      WHERE ABS(pc.daily_change - cs.avg_change) > cs.stddev_change * 2  -- 2+ standard deviations
        AND pc.daily_change IS NOT NULL
      ORDER BY ABS(pc.daily_change - cs.avg_change) / cs.stddev_change DESC;
    `,
    startDate
  );
};

// Set and Rarity Analysis
// How entire sets are performing price-wise
export const analyzeSetPerformance = async (
  timeframe: "10d" | "1m" | "6m" | "1y",
  startDate: Date
) => {
  return await prisma.$queryRaw`
    SELECT 
      c.data->>'set' as set_name,
      COUNT(DISTINCT c.id) as card_count,
      AVG(cps."changePct") as avg_change_pct,
      STDDEV(cps."changePct") as volatility,
      MAX(cps."changePct") as best_performer,
      MIN(cps."changePct") as worst_performer
    FROM "Card" c
    JOIN "CardPriceChangeSummary" cps ON c.id = cps."cardId"
    WHERE cps.timeframe = ${timeframe}
      AND cps."createdAt" >= ${startDate}
    GROUP BY c.data->>'set'
    HAVING COUNT(DISTINCT c.id) >= 5  -- Sets with at least 5 cards
    ORDER BY avg_change_pct DESC;
  `;
};

// Price Discovery and Liquidity Analysis
// Find significant price gaps (large jumps between consecutive days)
export const analyzePriceGaps = async (date: Date) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH price_gaps AS (
        SELECT 
          pe."cardId",
          pe.date,
          pe.price,
          LAG(pe.price) OVER (PARTITION BY pe."cardId" ORDER BY pe.date) as prev_price,
          LAG(pe.date) OVER (PARTITION BY pe."cardId" ORDER BY pe.date) as prev_date
        FROM "PriceEntry" pe
        WHERE pe.date >= $1
      ),
      significant_gaps AS (
        SELECT 
          *,
          (price - prev_price) / prev_price * 100 as gap_pct,
          EXTRACT(DAYS FROM (date - prev_date)) as days_between
        FROM price_gaps
        WHERE prev_price IS NOT NULL
          AND ABS((price - prev_price) / prev_price) > 0.15  -- 15%+ gap
          AND EXTRACT(DAYS FROM (date - prev_date)) <= 3  -- Within 3 days
      )
      SELECT 
        sg."cardId",
        c.data->>'name' as card_name,
        sg.date,
        sg.prev_price,
        sg.price,
        sg.gap_pct,
        sg.days_between,
        CASE WHEN sg.gap_pct > 0 THEN 'gap_up' ELSE 'gap_down' END as gap_direction
      FROM significant_gaps sg
      JOIN "Card" c ON sg."cardId" = c.id
      ORDER BY ABS(sg.gap_pct) DESC;
    `,
    date
  );
};

// Find which cards/sets dominate price movements
export const marketConcentrationAnalysis = async (
  timeFrame: "10d" | "1m" | "6m" | "1y",
  startDate: Date
) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH performance_contribution AS (
        SELECT 
          c.data->>'set' as set_name,
          cps."cardId",
          c.data->>'name' as card_name,
          cps."changePct",
          ABS(cps."changePct") as abs_change
        FROM "CardPriceChangeSummary" cps
        JOIN "Card" c ON cps."cardId" = c.id
        WHERE cps.timeframe = $1
          AND cps."createdAt" >= $2
      ),
      total_movement AS (
        SELECT SUM(abs_change) as total_abs_movement
        FROM performance_contribution
      )
      SELECT 
        pc.set_name,
        pc."cardId",
        pc.card_name,
        pc."changePct",
        pc.abs_change / tm.total_abs_movement * 100 as movement_contribution_pct
      FROM performance_contribution pc
      CROSS JOIN total_movement tm
      ORDER BY pc.abs_change DESC
      LIMIT 20;  -- Top 20 contributors to market movement
    `,
    timeFrame,
    startDate
  );
};

// Identify seasonal trends by month/quarter
export const findSeasonalPatterns = async (startDate: Date) => {
  return await prisma.$queryRawUnsafe(
    `
      SELECT 
        EXTRACT(MONTH FROM pe.date) as month,
        EXTRACT(QUARTER FROM pe.date) as quarter,
        c.data->>'set' as set_name,
        COUNT(*) as price_points,
        AVG((pe.price - LAG(pe.price) OVER (PARTITION BY pe."cardId", EXTRACT(YEAR FROM pe.date) ORDER BY pe.date)) / 
            LAG(pe.price) OVER (PARTITION BY pe."cardId", EXTRACT(YEAR FROM pe.date) ORDER BY pe.date) * 100) as avg_monthly_change
      FROM "PriceEntry" pe
      JOIN "Card" c ON pe."cardId" = c.id
      WHERE pe.date >= $1
      GROUP BY EXTRACT(MONTH FROM pe.date), EXTRACT(QUARTER FROM pe.date), c.data->>'set'
      HAVING COUNT(*) >= 10
      ORDER BY month;
    `,
    startDate
  );
};

// Practical Utility Tools

// Buying/Selling Assistance
// Current fair market value based on recent trends
export const getFairValueEstimate = async (cardId: string, startDate: Date) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH price_metrics AS (
        SELECT 
          "cardId",
          AVG(price) as mean_price,
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) as median_price,
          STDDEV(price) as price_stddev,
          COUNT(*) as data_points,
          MAX(date) as latest_date
        FROM "PriceEntry"
        WHERE "cardId" = $1 
          AND date >= $2  -- Historical period (e.g., last 90 days)
        GROUP BY "cardId"
      ),
      recent_trend AS (
        SELECT 
          "cardId",
          AVG(price) as recent_avg,
          (LAST_VALUE(price) OVER (ORDER BY date RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) - 
          FIRST_VALUE(price) OVER (ORDER BY date RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)) /
          FIRST_VALUE(price) OVER (ORDER BY date RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) * 100 as trend_direction
        FROM "PriceEntry"
        WHERE "cardId" = $1 
          AND date >= CURRENT_DATE - INTERVAL '14 days'  -- Recent 2 weeks
        GROUP BY "cardId"
      ),
      current_price AS (
        SELECT 
          "cardId",
          price as current_price,
          date as price_date
        FROM "PriceEntry"
        WHERE "cardId" = $1
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
        -- Fair value estimate (weighted average of different methods)
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
    `,
    cardId,
    startDate
  );
};

// Historical analysis of optimal purchase windows
export const getBestBuyTiming = async (cardId: string, startDate: Date) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH daily_changes AS (
        SELECT 
          "cardId",
          date,
          price,
          EXTRACT(DOW FROM date) as day_of_week,  -- 0=Sunday, 6=Saturday
          EXTRACT(DAY FROM date) as day_of_month,
          LAG(price) OVER (PARTITION BY "cardId" ORDER BY date) as prev_price
        FROM "PriceEntry"
        WHERE "cardId" = $1 
          AND date >= $2
      ),
      timing_analysis AS (
        SELECT 
          day_of_week,
          day_of_month,
          COUNT(*) as occurrences,
          AVG((price - prev_price) / prev_price * 100) as avg_daily_change,
          STDDEV((price - prev_price) / prev_price * 100) as change_volatility,
          COUNT(CASE WHEN (price - prev_price) / prev_price < -0.05 THEN 1 END) as dip_opportunities
        FROM daily_changes
        WHERE prev_price IS NOT NULL
        GROUP BY day_of_week, day_of_month
        HAVING COUNT(*) >= 3  -- Minimum occurrences for statistical relevance
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
        day_of_month,
        avg_daily_change,
        change_volatility,
        dip_opportunities,
        occurrences,
        -- Buy signal: negative average change + high dip frequency
        CASE 
          WHEN avg_daily_change < -2 AND dip_opportunities::float / occurrences > 0.3 THEN 'strong_buy_window'
          WHEN avg_daily_change < 0 AND dip_opportunities::float / occurrences > 0.2 THEN 'buy_window'
          ELSE 'neutral'
        END as timing_signal
      FROM timing_analysis
      ORDER BY avg_daily_change ASC;  -- Best buying opportunities first
    `,
    cardId,
    startDate
  );
};

// Optimal time to hold cards for maximum returns
export const calculateHoldingPeriods = async (
  cardId: string,
  startDate: Date
) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH holding_analysis AS (
        SELECT 
          buy_date.date as buy_date,
          buy_date.price as buy_price,
          sell_date.date as sell_date,
          sell_date.price as sell_price,
          EXTRACT(DAYS FROM (sell_date.date - buy_date.date)) as holding_days,
          (sell_date.price - buy_date.price) / buy_date.price * 100 as return_pct
        FROM "PriceEntry" buy_date
        JOIN "PriceEntry" sell_date ON buy_date."cardId" = sell_date."cardId"
        WHERE buy_date."cardId" = $1
          AND sell_date.date > buy_date.date
          AND buy_date.date >= $2  -- Historical analysis period
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
    `,
    cardId,
    startDate
  );
};

// Prisma query for threshold monitoring
export const priceAlerts = async (cardIds: string[], date: Date) => {
  return await prisma.$queryRaw`
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
    WHERE pe.date >= ${date}
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
};

// Detect unusual quantity spikes using rolling statistics
// Z-score thresholds:
// 1.5-2.0: Moderate spikes (worth monitoring)
// 2.0-2.5: Major spikes (investigate)
// 3.0+: Extreme spikes (immediate action needed)
export const getQuantitySpikes = async (threshold: number = 1.5) => {
  try {
    const res = await prisma.$queryRawUnsafe(
      `
      WITH quantity_stats AS (
        SELECT 
          "cardId",
          date,
          quantity,
          -- Rolling 30-day statistics
          AVG(quantity) OVER (
            PARTITION BY "cardId" 
            ORDER BY date 
            ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING
          ) as rolling_avg_30d,
          STDDEV(quantity) OVER (
            PARTITION BY "cardId" 
            ORDER BY date 
            ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING
          ) as rolling_stddev_30d,
          -- Rolling 7-day for more sensitive detection
          AVG(quantity) OVER (
            PARTITION BY "cardId" 
            ORDER BY date 
            ROWS BETWEEN 6 PRECEDING AND 1 PRECEDING
          ) as rolling_avg_7d,
          STDDEV(quantity) OVER (
            PARTITION BY "cardId" 
            ORDER BY date 
            ROWS BETWEEN 6 PRECEDING AND 1 PRECEDING
          ) as rolling_stddev_7d
        FROM "PriceEntry"
        WHERE quantity IS NOT NULL
          AND date >= CURRENT_DATE - INTERVAL '45 days'  -- Extended lookback for statistics
      ),
      spike_detection AS (
        SELECT 
          qs.*,
          -- Z-score calculations
          CASE 
            WHEN qs.rolling_stddev_30d > 0 
            THEN (qs.quantity - qs.rolling_avg_30d) / qs.rolling_stddev_30d
            ELSE 0 
          END as z_score_30d,
          CASE 
            WHEN qs.rolling_stddev_7d > 0 
            THEN (qs.quantity - qs.rolling_avg_7d) / qs.rolling_stddev_7d
            ELSE 0 
          END as z_score_7d,
          -- Percentage increase from average
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
        ROUND(sd.z_score_7d, 2) as z_score_7d,
        ROUND(sd.pct_above_avg_30d, 1) as pct_above_normal,
        -- Get corresponding price to see if quantity spike affects price
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
      WHERE sd.z_score_30d >= $1  -- threshold for moderate+ spikes
        AND sd.date >= CURRENT_DATE - INTERVAL '3 days'  -- Only show spikes from last 3 days
      ORDER BY sd.z_score_30d DESC, sd.date DESC;
    `,
      threshold
    );

    return res;
  } catch (error) {
    console.error("Error fetching quantity spikes:", error);
    throw error;
  }
};

export const getQuantitySpikesWithPriceImpact = async (
  startDate: Date,
  threshold: number = 1.5
) => {
  return await prisma.$queryRawUnsafe(
    `
      WITH quantity_spikes AS (
        SELECT 
          pe."cardId",
          pe.date,
          pe.quantity,
          pe.price,
          AVG(pe.quantity) OVER (
            PARTITION BY pe."cardId" 
            ORDER BY pe.date 
            ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING
          ) as avg_quantity_30d,
          STDDEV(pe.quantity) OVER (
            PARTITION BY pe."cardId" 
            ORDER BY pe.date 
            ROWS BETWEEN 29 PRECEDING AND 1 PRECEDING
          ) as stddev_quantity_30d,
          LAG(pe.price) OVER (PARTITION BY pe."cardId" ORDER BY pe.date) as prev_price,
          LEAD(pe.price) OVER (PARTITION BY pe."cardId" ORDER BY pe.date) as next_price
        FROM "PriceEntry" pe
        WHERE pe.quantity IS NOT NULL
          AND pe.date >= $1
      ),
      analyzed_spikes AS (
        SELECT 
          *,
          CASE 
            WHEN stddev_quantity_30d > 0 
            THEN (quantity - avg_quantity_30d) / stddev_quantity_30d
            ELSE 0 
          END as z_score,
          (price - prev_price) / NULLIF(prev_price, 0) * 100 as same_day_change,
          (next_price - price) / NULLIF(price, 0) * 100 as next_day_change
        FROM quantity_spikes
        WHERE avg_quantity_30d IS NOT NULL
      )
      SELECT 
        as_."cardId",
        c.data->>'name' as card_name,
        as_.date,
        as_.quantity as spike_quantity,
        ROUND(as_.avg_quantity_30d, 1) as normal_quantity,
        ROUND(as_.z_score, 2) as spike_z_score,
        as_.price as spike_price,
        as_.prev_price,
        ROUND(as_.same_day_change, 2) as price_change_same_day,
        ROUND(as_.next_day_change, 2) as price_change_next_day,
        -- Quantity-price relationship analysis
        CASE 
          WHEN as_.z_score >= 2 AND as_.same_day_change > 5 THEN 'spike_with_pump'
          WHEN as_.z_score >= 2 AND as_.same_day_change < -5 THEN 'spike_with_dump' 
          WHEN as_.z_score >= 2 THEN 'spike_neutral_price'
          ELSE 'normal'
        END as spike_type,
        -- Market signal interpretation
        CASE
          WHEN as_.z_score >= 3 THEN 'investigate_immediately'
          WHEN as_.z_score >= 2 AND as_.same_day_change < -3 THEN 'potential_buy_opportunity'
          WHEN as_.z_score >= 2 AND as_.same_day_change > 5 THEN 'potential_sell_pressure'
          ELSE 'monitor'
        END as action_signal
      FROM analyzed_spikes as_
      JOIN "Card" c ON as_."cardId" = c.id
      WHERE as_.z_score >= $2  -- Threshold parameter (recommend 1.5-2.0)
      ORDER BY as_.z_score DESC, as_.date DESC;
    `,
    startDate,
    threshold
  );
};

// Real-time dashboard query for quantity anomalies
export const quantityAnomalyDashboard = async () => {
  return await prisma.$queryRawUnsafe(
    `
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
          AND pe.date >= CURRENT_DATE - INTERVAL '30 days'
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
      WHERE spike_count_14d > 0 OR max_z_score >= 2
      ORDER BY last_spike_date DESC, max_z_score DESC;
    `
  );
};

export const topGainers = async (
  timeframe: "10d" | "1m" | "6m" | "1y",
  limit: number
) => {
  return await prisma.cardPriceChangeSummary.findMany({
    where: {
      timeframe: timeframe, // '10d', '1m', '6m', '1y'
      type: "gainer",
    },
    include: {
      card: {
        select: {
          data: true,
        },
      },
    },
    orderBy: {
      changePct: "desc",
    },
    take: limit,
  });
};

// Compare performance across different timeframes
export const analyzeTimeframePerformance = async (startDate: Date) => {
  return await prisma.$queryRawUnsafe(
    `
      SELECT 
        cps.timeframe,
        cps.type,
        AVG(cps."changePct") as avg_change,
        STDDEV(cps."changePct") as volatility,
        COUNT(*) as card_count,
        MAX(cps."changePct") as max_change,
        MIN(cps."changePct") as min_change
      FROM "CardPriceChangeSummary" cps
      WHERE cps."createdAt" >= $1  -- Recent summaries only
      GROUP BY cps.timeframe, cps.type
      ORDER BY cps.timeframe, cps.type;
    `,
    startDate
  );
};

// Create market overview using summary data of last 24 hours
export const getMarketOverview = async () => {
  return await prisma.cardPriceChangeSummary.groupBy({
    by: ["timeframe", "type"],
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    _avg: {
      changePct: true,
    },
    _count: {
      cardId: true,
    },
    orderBy: {
      timeframe: "asc",
    },
  });
};
