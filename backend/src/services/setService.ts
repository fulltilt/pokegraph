import { prisma } from "@pokemon/shared";
import { getTimeframeInterval } from "../utils/dateUtils";

type QueryRow = Record<string, unknown>;

export async function getSetsBySeries(series: string): Promise<QueryRow[]> {
  try {
    const sets = await prisma.$queryRawUnsafe(
      `
      SELECT DISTINCT
        c.data->'set'->>'id' AS set_id,
        c.data->'set'->>'name' AS set_name,
        c.data->'set'->>'releaseDate' AS release_date,
        c.data->'set'->'images'->>'logo' AS image
      FROM "Card" c
      WHERE c.data->'set'->>'series' = $1
      ORDER BY c.data->'set'->>'releaseDate' ASC
    `,
      series,
    );

    return sets as QueryRow[];
  } catch (error) {
    console.error("Error fetching sets by series:", error);
    return [];
  }
}

export async function getTopMoversPerSetByPercentage(
  order: string,
  timeframe: string,
): Promise<QueryRow[]> {
  try {
    const results = await prisma.$queryRawUnsafe(
      `
      -- Step 1: Pre-filter relevant PriceEntries
      WITH recent_prices AS (
        SELECT *
        FROM "PriceEntry"
        WHERE date >= NOW() - $1::interval
      ),

      -- Step 2: Precompute price boundaries per card
      price_bounds AS (
        SELECT
          c.id AS card_id,
          (c.data->'set'->>'id') AS set_id,
          (c.data->'set'->>'name') AS set_name,
          (c.data->'name') AS card_name,
          (c.data->'images'->>'large') AS image,
          (c.data->'set'->>'releaseDate') AS release_date,
          MIN(p.date) AS earliest_date,
          MAX(p.date) AS latest_date
        FROM "Card" c
        JOIN recent_prices p ON p."cardId" = c.id
        WHERE (c.data->'set'->>'series') IN ('Sun & Moon', 'Sword & Shield', 'Scarlet & Violet', 'Mega Evolution')
          AND (c.data->'set'->>'id') NOT IN ('smp', 'swshp', 'svp')
        GROUP BY c.id, set_id, set_name, card_name, image, release_date
      ),

      -- Step 3: Get early and recent prices with conditional aggregation
      price_changes AS (
        SELECT
          pb.set_id,
          pb.set_name,
          pb.card_id,
          pb.card_name,
          pb.image,
          pb.release_date,
          MAX(CASE WHEN p.date = pb.earliest_date THEN p.price END) AS early_price,
          MAX(CASE WHEN p.date = pb.latest_date THEN p.price END) AS recent_price
        FROM price_bounds pb
        JOIN recent_prices p ON p."cardId" = pb.card_id
        GROUP BY pb.set_id, pb.set_name, pb.card_id, pb.card_name, pb.image, pb.release_date
      ),

      -- Step 4: Calculate percent change
      with_percent_change AS (
        SELECT
          *,
          ROUND(((recent_price - early_price) / NULLIF(early_price, 0) * 100)::numeric, 2) AS percent_change
        FROM price_changes
      )

      -- Step 5: Pick top movers per set
      SELECT DISTINCT ON (set_id)
        set_id,
        set_name,
        card_id,
        card_name,
        image,
        early_price,
        recent_price,
        release_date,
        percent_change
      FROM with_percent_change
      WHERE early_price IS NOT NULL AND recent_price IS NOT NULL AND early_price != 0
      ORDER BY set_id, percent_change ${order};  -- ${order} = DESC or ASC
    `,
      timeframe,
    );

    return results as QueryRow[];
  } catch (error) {
    console.error("Database query error in getMoversPerSet:", error);
    return [];
  }
}

export async function getTopMoverPerSetByPrice(
  order: string,
  timeframe: string,
): Promise<QueryRow[]> {
  try {
    const results = await prisma.$queryRawUnsafe(
      `-- Step 1: Pre-filter relevant PriceEntries
        WITH recent_prices AS (
          SELECT *
          FROM "PriceEntry"
          WHERE date >= NOW() - $1::interval
            AND price > 0
        ),

        -- Step 2: Precompute price boundaries per card
        price_bounds AS (
          SELECT
            c.id AS card_id,
            (c.data->'set'->>'id') AS set_id,
            (c.data->'set'->>'name') AS set_name,
            (c.data->'name') AS card_name,
            (c.data->'images'->>'large') AS image,
            (c.data->'set'->>'releaseDate') AS release_date,
            MIN(p.date) AS earliest_date,
            MAX(p.date) AS latest_date
          FROM "Card" c
          JOIN recent_prices p ON p."cardId" = c.id
          WHERE (c.data->'set'->>'series') IN ('Sun & Moon', 'Sword & Shield', 'Scarlet & Violet', 'Mega Evolution')
            AND (c.data->'set'->>'id') NOT IN ('smp', 'swshp', 'svp')
          GROUP BY c.id, set_id, set_name, card_name, image, release_date
        ),

        -- Step 3: Get early and recent prices with conditional aggregation
        price_changes AS (
          SELECT
            pb.set_id,
            pb.set_name,
            pb.card_id,
            pb.card_name,
            pb.image,
            pb.release_date,
            MAX(CASE WHEN p.date = pb.earliest_date THEN p.price END) AS early_price,
            COALESCE(
              MAX(CASE WHEN p.date = pb.latest_date THEN p.price END),
              (SELECT price FROM recent_prices rp
              WHERE rp."cardId" = pb.card_id AND rp.price > 0
              ORDER BY rp.date DESC LIMIT 1)
            ) AS recent_price
          FROM price_bounds pb
          JOIN recent_prices p ON p."cardId" = pb.card_id
          GROUP BY pb.set_id, pb.set_name, pb.card_id, pb.card_name, pb.image, pb.release_date
        ),

        -- Step 4: Calculate absolute price change
        with_price_change AS (
          SELECT
            *,
            ROUND((recent_price - early_price)::numeric, 2) AS absolute_change
          FROM price_changes
        )

        -- Step 5: Pick top movers per set by absolute price change
        SELECT DISTINCT ON (set_id)
          set_id,
          set_name,
          card_id,
          card_name,
          image,
          early_price,
          recent_price,
          release_date,
          absolute_change
        FROM with_price_change
        WHERE early_price IS NOT NULL AND recent_price IS NOT NULL AND early_price != 0
        ORDER BY set_id, absolute_change ${order};  -- ${order} = DESC (gainers) or ASC (losers)
        `,
      timeframe,
    );

    return results as QueryRow[];
  } catch (error) {
    console.error("Database query error in getMoverPerSet:", error);
    return [];
  }
}

export async function getTopMoversBySet(
  setName: string,
  order: string,
  rawTimeframe: string,
): Promise<QueryRow[]> {
  const interval = getTimeframeInterval(rawTimeframe);

  try {
    // Execute the raw SQL query using Prisma
    const query = `
        WITH price_data AS (
          SELECT
            c.id AS card_id,
            (c.data->'name') AS card_name,
            (c.data->'set'->>'name') AS set_name,
            (c.data->'images'->>'large') AS image,
            (c.data->'set'->>'releaseDate') AS release_date,
            MIN(p.date) FILTER (WHERE p.date >= NOW() - $2::interval) AS earliest_date,
            MAX(p.date) FILTER (WHERE p.date >= NOW() - $2::interval) AS latest_date
          FROM "Card" c
          JOIN "PriceEntry" p ON p."cardId" = c.id
          WHERE (c.data->'set'->>'name') = $1
            AND p.date >= NOW() - $2::interval
          GROUP BY c.id
        ),
        price_changes AS (
          SELECT
            pd.card_id,
            pd.card_name,
            pd.set_name,
            pd.release_date,
            pd.image,
            (
              SELECT pe1.price
              FROM "PriceEntry" pe1
              WHERE pe1."cardId" = pd.card_id AND pe1.date = pd.earliest_date
              LIMIT 1
            ) AS early_price,
            (
              SELECT pe2.price
              FROM "PriceEntry" pe2
              WHERE pe2."cardId" = pd.card_id AND pe2.date = pd.latest_date
              LIMIT 1
            ) AS recent_price
          FROM price_data pd
        ),
        with_percent_change AS (
          SELECT
            card_id,
            set_name,
            card_name,
            image,
            early_price,
            recent_price,
            release_date,
            ROUND(((recent_price - early_price) / NULLIF(early_price, 0) * 100)::numeric, 2) AS percent_change
          FROM price_changes
        )
        SELECT *
        FROM with_percent_change
        WHERE early_price IS NOT NULL AND recent_price IS NOT NULL
        ORDER BY percent_change ${order}
        LIMIT 10;
    `;

    const topGainers = await prisma.$queryRawUnsafe(query, setName, interval);

    return topGainers as QueryRow[];
  } catch (error) {
    console.error("Error fetching top gainers:", error);
    return [];
  }
}
