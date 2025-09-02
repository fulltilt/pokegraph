import {
  PrismaClient,
  Card,
  PriceEntry,
  CardPriceChangeSummary,
} from "../generated/prisma";

const prisma = new PrismaClient();

interface TopMover {
  set_id: string;
  set_name: string;
  card_id: string; // Assuming you have this field, if not, adjust accordingly
  percent_change: number;
}

interface PriceChangeResult {
  card_id: string;
  set_id: string;
  series: string;
  card_name: string;
  early_price: number;
  recent_price: number;
  change_pct: number;
}

interface TimeframeConfig {
  days: number;
  count: number;
}

interface SummaryDataItem {
  setId: string;
  series: string;
  timeframe: string;
  type: "gainer" | "loser";
  cardId: string;
  changePct: number;
}

interface UpdateStats {
  gainersCount: number;
  losersCount: number;
  totalInserted: number;
}

// export async function getTopGainers(period: string = "30 days") {
//   const intervalFilter =
//     period === "all" ? "" : `WHERE "date" >= NOW() - INTERVAL '${period}'`;

//   const query = `
//     WITH price_window AS (
//       SELECT
//         "cardId",
//         MIN("date") AS start_date,
//         MAX("date") AS end_date
//       FROM "PriceEntry"
//       ${intervalFilter}
//       GROUP BY "cardId"
//     ),
//     prices AS (
//       SELECT
//         p."cardId",
//         start."price" AS start_price,
//         endp."price" AS end_price,
//         ((endp."price" - start."price") / start."price") * 100 AS percent_gain
//       FROM price_window pw
//       JOIN "PriceEntry" start ON start."cardId" = pw."cardId" AND start."date" = pw.start_date
//       JOIN "PriceEntry" endp ON endp."cardId" = pw."cardId" AND endp."date" = pw.end_date
//     )
//     SELECT
//       c."id",
//       c."data",
//       p."start_price",
//       p."end_price",
//       p."percent_gain"
//     FROM prices p
//     JOIN "Card" c ON c."id" = p."cardId"
//     WHERE p."start_price" > 0
//     ORDER BY p."percent_gain" DESC
//     LIMIT 10;
//   `;

//   const movers = await prisma.$queryRawUnsafe(query);
// }

export async function getTopLosers(period: string = "30 days") {
  const intervalFilter =
    period === "all" ? "" : `WHERE "date" >= NOW() - INTERVAL '${period}'`;

  const query = `
      WITH price_window AS (
        SELECT
          "cardId",
          MIN("date") AS start_date,
          MAX("date") AS end_date
        FROM "PriceEntry"
        ${intervalFilter}
        GROUP BY "cardId"
      ),
      prices AS (
        SELECT
          p."cardId",
          start."price" AS start_price,
          endp."price" AS end_price,
          ((endp."price" - start."price") / start."price") * 100 AS percent_change
        FROM price_window pw
        JOIN "PriceEntry" start ON start."cardId" = pw."cardId" AND start."date" = pw.start_date
        JOIN "PriceEntry" endp ON endp."cardId" = pw."cardId" AND endp."date" = pw.end_date
      )
      SELECT
        c."id",
        c."data",
        p."start_price",
        p."end_price",
        p."percent_change"
      FROM prices p
      JOIN "Card" c ON c."id" = p."cardId"
      WHERE p."start_price" > 0
      ORDER BY p."percent_change" ASC
      LIMIT 10;
    `;

  return await prisma.$queryRawUnsafe(query);
}

type TimeframeKey = "10d" | "1m" | "3m" | "6m" | "1y";
export async function topMovers(
  by: string = "set",
  order: string,
  range: TimeframeKey
) {
  const topMovers = await prisma.$queryRawUnsafe<TopMover[]>(`
    WITH price_pairs AS (
      SELECT
        c.id AS card_id,
        (c.data->'set'->>'id') AS set_id,
        ${
          by === "set"
            ? `(c.data->'set'->>'name') AS set_name,`
            : `(c.data->'set'->>'series') AS set_series`
        }
        MIN(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '${range}') AS earliest_date,
        MAX(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '${range}') AS latest_date
      FROM "Card" c
      JOIN "PriceEntry" p ON p."cardId" = c.id
      WHERE p.date >= NOW() - INTERVAL '${range}'
      GROUP BY c.id, set_id, set_name
    ),
    with_prices AS (
      SELECT
        pp.set_id,
        pp.set_name,
        MIN(p1.price) FILTER (WHERE p1.date = pp.earliest_date) AS early_price,
        MAX(p2.price) FILTER (WHERE p2.date = pp.latest_date) AS recent_price
      FROM price_pairs pp
      JOIN "PriceEntry" p1 ON p1."cardId" = pp.card_id
      JOIN "PriceEntry" p2 ON p2."cardId" = pp.card_id
      GROUP BY pp.set_id, pp.set_name
    )
    SELECT
      set_id,
      set_name,
      early_price,
      recent_price,
      ROUND((recent_price - early_price) / NULLIF(early_price, 0) * 100, 2) AS percent_change
    FROM with_prices
    ORDER BY percent_change ${order === "top" ? "DESC" : "ASC"}
    LIMIT 10;
  `);

  // Map the results to be saved into the PriceChangeSummary table
  const summaries = topMovers.map((mover: any) => ({
    setId: mover.set_id,
    series: mover.set_name, // or if you have a `series` field in your JSON, map that instead
    timeframe: "30d", // Adjust this based on the actual timeframe (you can generalize it further)
    type: order === "top" ? "gainer" : "loser",
    cardId: mover.card_id, // Assuming you have card_id in the result, otherwise adjust accordingly
    changePct: mover.percent_change,
  }));

  // Save the top gainers into the database
  await prisma.cardPriceChangeSummary.createMany({
    data: summaries,
    skipDuplicates: true, // This prevents duplicates in case the same data is inserted again
  });

  console.log("Top gainers saved!");
}

// const losers = await getTopLosers("1 month"); // or "10 days", "6 months", "year", "all"

async function updatePriceChangeSummaries(
  days: number = 30,
  topCount: number = 10
): Promise<UpdateStats> {
  try {
    console.log(`Calculating price changes for past ${days} days...`);

    // Step 1: Calculate price changes using raw SQL for better performance
    const priceChanges = await prisma.$queryRaw<PriceChangeResult[]>`
      WITH recent_sales AS (
        SELECT *
        FROM "PriceEntry"
        WHERE date >= NOW() - INTERVAL '${days} days'
          AND price > 0
      ),
      
      price_bounds AS (
        SELECT
          c.id AS card_id,
          (c.data->'set'->>'id') AS set_id,
          (c.data->'set'->>'series') AS series,
          (c.data->'name') AS card_name,
          (array_agg(p.price ORDER BY p.date ASC))[1] AS early_price,
          (array_agg(p.price ORDER BY p.date DESC))[1] AS recent_price,
          COUNT(p.price) AS trading_days
        FROM "Card" c
        JOIN recent_sales p ON p."cardId" = c.id
        WHERE (c.data->'set'->>'series') IN ('Sun & Moon', 'Sword & Shield', 'Scarlet & Violet')
          AND (c.data->'set'->>'id') NOT IN ('smp', 'swshp', 'svp')
        GROUP BY c.id, set_id, series, card_name
        HAVING COUNT(p.price) >= 2
      ),
      
      with_price_change AS (
        SELECT
          card_id,
          set_id,
          series,
          card_name,
          early_price,
          recent_price,
          ROUND(((recent_price - early_price) / early_price * 100)::numeric, 2) AS change_pct
        FROM price_bounds
        WHERE early_price IS NOT NULL AND recent_price IS NOT NULL 
          AND early_price > 0 AND recent_price > 0
          AND early_price != recent_price  -- Only cards that actually changed
      )
      
      SELECT * FROM with_price_change
      WHERE change_pct IS NOT NULL
      ORDER BY change_pct DESC;
    `;

    if (priceChanges.length === 0) {
      console.log("No price changes found for the specified period");
      return { gainersCount: 0, losersCount: 0, totalInserted: 0 };
    }

    // Step 2: Clear existing summaries for this timeframe
    const timeframe: string = `${days}d`;
    await prisma.cardPriceChangeSummary.deleteMany({
      where: { timeframe },
    });

    // Step 3: Get top gainers and losers
    const topGainers: PriceChangeResult[] = priceChanges
      .filter((card: PriceChangeResult) => card.change_pct > 0)
      .slice(0, topCount);

    const topLosers: PriceChangeResult[] = priceChanges
      .filter((card: PriceChangeResult) => card.change_pct < 0)
      .sort(
        (a: PriceChangeResult, b: PriceChangeResult) =>
          a.change_pct - b.change_pct
      ) // Sort ascending for losers
      .slice(0, topCount);

    // Step 4: Prepare data for bulk insert
    const summaryData: SummaryDataItem[] = [];

    // Add gainers
    topGainers.forEach((card: PriceChangeResult) => {
      summaryData.push({
        setId: card.set_id,
        series: card.series,
        timeframe,
        type: "gainer",
        cardId: card.card_id,
        changePct: parseFloat(card.change_pct.toString()),
      });
    });

    // Add losers
    topLosers.forEach((card: PriceChangeResult) => {
      summaryData.push({
        setId: card.set_id,
        series: card.series,
        timeframe,
        type: "loser",
        cardId: card.card_id,
        changePct: parseFloat(card.change_pct.toString()),
      });
    });

    // Step 5: Bulk insert the summaries
    if (summaryData.length > 0) {
      await prisma.cardPriceChangeSummary.createMany({
        data: summaryData,
        skipDuplicates: true,
      });

      console.log(`Inserted ${summaryData.length} price change summaries:`);
      console.log(`- ${topGainers.length} gainers`);
      console.log(`- ${topLosers.length} losers`);
    }

    return {
      gainersCount: topGainers.length,
      losersCount: topLosers.length,
      totalInserted: summaryData.length,
    };
  } catch (error) {
    console.error("Error updating price change summaries:", error);
    throw error;
  }
}

/**
 * Function to run multiple timeframes
 */
async function updateAllTimeframes(): Promise<void> {
  const timeframes: TimeframeConfig[] = [
    { days: 7, count: 10 }, // 1 week
    { days: 30, count: 15 }, // 1 month
    { days: 90, count: 20 }, // 3 months
    { days: 365, count: 25 }, // 1 year
  ];

  for (const { days, count } of timeframes) {
    console.log(`Processing ${days}-day timeframe...`);
    const stats: UpdateStats = await updatePriceChangeSummaries(days, count);
    console.log(`Completed ${days}d: ${stats.totalInserted} records inserted`);
  }

  console.log("All timeframes updated successfully");
}

/**
 * Daily cron job function
 */
async function dailyPriceUpdateJob(): Promise<void> {
  console.log(
    `Starting daily price change update: ${new Date().toISOString()}`
  );

  try {
    await updateAllTimeframes();
    console.log("Daily price update completed successfully");
  } catch (error) {
    console.error("Daily price update failed:", error);
    // You might want to send an alert/notification here
    throw error;
  }
}

/**
 * Get price change summaries with filtering
 */
async function getPriceChangeSummaries(
  prisma: PrismaClient,
  options: {
    timeframe?: string;
    type?: "gainer" | "loser";
    setId?: string;
    series?: string;
    limit?: number;
  } = {}
): Promise<(CardPriceChangeSummary & { card: Card })[]> {
  const { timeframe, type, setId, series, limit = 50 } = options;

  return await prisma.cardPriceChangeSummary.findMany({
    where: {
      ...(timeframe && { timeframe }),
      ...(type && { type }),
      ...(setId && { setId }),
      ...(series && { series }),
    },
    include: {
      card: true,
    },
    orderBy: [
      { type: "asc" }, // gainers first
      { changePct: "desc" }, // highest change first
    ],
    take: limit,
  });
}

async function runDailyUpdate(): Promise<void> {
  try {
    await dailyPriceUpdateJob();
  } catch (error) {
    console.error("Job failed:", error);
  }
}

// Get summaries with type safety
async function getTopGainers(): Promise<void> {
  const gainers = await getPriceChangeSummaries(prisma, {
    timeframe: "30d",
    type: "gainer",
    limit: 10,
  });

  gainers.forEach((summary) => {
    console.log(`${summary.card.data}: +${summary.changePct}%`);
  });
}

// Export the functions with proper typing
export {
  updatePriceChangeSummaries,
  updateAllTimeframes,
  dailyPriceUpdateJob,
  getPriceChangeSummaries,
  type PriceChangeResult,
  type TimeframeConfig,
  type SummaryDataItem,
  type UpdateStats,
};

await dailyPriceUpdateJob();
