import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

interface TopMover {
  set_id: string;
  set_name: string;
  card_id: string; // Assuming you have this field, if not, adjust accordingly
  percent_change: number;
}

export async function getTopGainers(period: string = "30 days") {
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
        ((endp."price" - start."price") / start."price") * 100 AS percent_gain
      FROM price_window pw
      JOIN "PriceEntry" start ON start."cardId" = pw."cardId" AND start."date" = pw.start_date
      JOIN "PriceEntry" endp ON endp."cardId" = pw."cardId" AND endp."date" = pw.end_date
    )
    SELECT
      c."id",
      c."data",
      p."start_price",
      p."end_price",
      p."percent_gain"
    FROM prices p
    JOIN "Card" c ON c."id" = p."cardId"
    WHERE p."start_price" > 0
    ORDER BY p."percent_gain" DESC
    LIMIT 10;
  `;

  const movers = await prisma.$queryRawUnsafe(query);
}

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

async function topMovers(by: string, order: string, range: string) {
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
