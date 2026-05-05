import { prisma } from "@pokemon/shared";
import { getTimeframeInterval } from "../utils/dateUtils";

type QueryRow = Record<string, unknown>;

function sanitizeOrder(order: string): "ASC" | "DESC" {
  return order === "ASC" ? "ASC" : "DESC";
}

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
    const sortOrder = sanitizeOrder(order);
    const results = await prisma.$queryRawUnsafe(
      `
      WITH recent_prices AS (
        SELECT p."cardId", p.date, p.price, COALESCE(p.quantity, 0) AS quantity
        FROM "PriceEntry"
        p
        WHERE date >= NOW() - $1::interval
          AND price > 0
      ),

      price_bounds AS (
        SELECT
          c.id AS card_id,
          (c.data->'set'->>'id') AS set_id,
          (c.data->'set'->>'name') AS set_name,
          (c.data->'name') AS card_name,
          (c.data->'images'->>'large') AS image,
          (c.data->'set'->>'releaseDate') AS release_date,
          SUM(p.quantity)::integer AS total_sales,
          MIN(p.date) AS earliest_date,
          MAX(p.date) AS latest_date
        FROM "Card" c
        JOIN recent_prices p ON p."cardId" = c.id
        WHERE (c.data->'set'->>'series') IN ('Sun & Moon', 'Sword & Shield', 'Scarlet & Violet', 'Mega Evolution')
          AND (c.data->'set'->>'id') NOT IN ('smp', 'swshp', 'svp')
        GROUP BY c.id, set_id, set_name, card_name, image, release_date
      ),

      price_changes AS (
        SELECT
          pb.set_id,
          pb.set_name,
          pb.card_id,
          pb.card_name,
          pb.image,
          pb.release_date,
          pb.total_sales,
          MAX(CASE WHEN p.date = pb.earliest_date THEN p.price END) AS early_price,
          MAX(CASE WHEN p.date = pb.latest_date THEN p.price END) AS recent_price
        FROM price_bounds pb
        JOIN recent_prices p ON p."cardId" = pb.card_id
        GROUP BY pb.set_id, pb.set_name, pb.card_id, pb.card_name, pb.image, pb.release_date, pb.total_sales
      ),

      with_percent_change AS (
        SELECT
          *,
          ROUND(((recent_price - early_price) / NULLIF(early_price, 0) * 100)::numeric, 2) AS percent_change
        FROM price_changes
      )

      SELECT DISTINCT ON (set_id)
        set_id,
        set_name,
        card_id,
        card_name,
        image,
        early_price,
        recent_price,
        total_sales,
        release_date,
        percent_change
      FROM with_percent_change
      WHERE early_price IS NOT NULL
        AND recent_price IS NOT NULL
        AND early_price != 0
        ${sortOrder === "ASC" ? "AND total_sales > 0" : ""}
      ORDER BY set_id, percent_change ${sortOrder};
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
    const sortOrder = sanitizeOrder(order);
    const results = await prisma.$queryRawUnsafe(
      `WITH recent_prices AS (
          SELECT p."cardId", p.date, p.price, COALESCE(p.quantity, 0) AS quantity
          FROM "PriceEntry"
          p
          WHERE date >= NOW() - $1::interval
            AND price > 0
        ),

        price_bounds AS (
          SELECT
            c.id AS card_id,
            (c.data->'set'->>'id') AS set_id,
            (c.data->'set'->>'name') AS set_name,
            (c.data->'name') AS card_name,
            (c.data->'images'->>'large') AS image,
            (c.data->'set'->>'releaseDate') AS release_date,
            SUM(p.quantity)::integer AS total_sales,
            MIN(p.date) AS earliest_date,
            MAX(p.date) AS latest_date
          FROM "Card" c
          JOIN recent_prices p ON p."cardId" = c.id
          WHERE (c.data->'set'->>'series') IN ('Sun & Moon', 'Sword & Shield', 'Scarlet & Violet', 'Mega Evolution')
            AND (c.data->'set'->>'id') NOT IN ('smp', 'swshp', 'svp')
          GROUP BY c.id, set_id, set_name, card_name, image, release_date
        ),

        price_changes AS (
          SELECT
            pb.set_id,
            pb.set_name,
            pb.card_id,
            pb.card_name,
            pb.image,
            pb.release_date,
            pb.total_sales,
            MAX(CASE WHEN p.date = pb.earliest_date THEN p.price END) AS early_price,
            COALESCE(
              MAX(CASE WHEN p.date = pb.latest_date THEN p.price END),
              (SELECT price FROM recent_prices rp
              WHERE rp."cardId" = pb.card_id AND rp.price > 0
              ORDER BY rp.date DESC LIMIT 1)
            ) AS recent_price
          FROM price_bounds pb
          JOIN recent_prices p ON p."cardId" = pb.card_id
          GROUP BY pb.set_id, pb.set_name, pb.card_id, pb.card_name, pb.image, pb.release_date, pb.total_sales
        ),

        with_price_change AS (
          SELECT
            *,
            ROUND((recent_price - early_price)::numeric, 2) AS absolute_change
          FROM price_changes
        )

        SELECT DISTINCT ON (set_id)
          set_id,
          set_name,
          card_id,
          card_name,
          image,
          early_price,
          recent_price,
          total_sales,
          release_date,
          absolute_change
        FROM with_price_change
        WHERE early_price IS NOT NULL
          AND recent_price IS NOT NULL
          AND early_price != 0
          ${sortOrder === "ASC" ? "AND total_sales > 0" : ""}
        ORDER BY set_id, absolute_change ${sortOrder};
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
    const sortOrder = sanitizeOrder(order);
    const query = `
        WITH recent_prices AS (
          SELECT p."cardId", p.date, p.price, COALESCE(p.quantity, 0) AS quantity
          FROM "PriceEntry" p
          WHERE p.date >= NOW() - $2::interval
            AND p.price > 0
        ),
        price_data AS (
          SELECT
            c.id AS card_id,
            (c.data->'name') AS card_name,
            (c.data->'set'->>'name') AS set_name,
            (c.data->'images'->>'large') AS image,
            (c.data->'set'->>'releaseDate') AS release_date,
            SUM(p.quantity)::integer AS total_sales,
            MIN(p.date) AS earliest_date,
            MAX(p.date) AS latest_date
          FROM "Card" c
          JOIN recent_prices p ON p."cardId" = c.id
          WHERE (c.data->'set'->>'name') = $1
          GROUP BY c.id
        ),
        price_changes AS (
          SELECT
            pd.card_id,
            pd.card_name,
            pd.set_name,
            pd.release_date,
            pd.image,
            pd.total_sales,
            MAX(CASE WHEN rp.date = pd.earliest_date THEN rp.price END) AS early_price,
            MAX(CASE WHEN rp.date = pd.latest_date THEN rp.price END) AS recent_price
          FROM price_data pd
          JOIN recent_prices rp ON rp."cardId" = pd.card_id
          GROUP BY pd.card_id, pd.card_name, pd.set_name, pd.release_date, pd.image, pd.total_sales
        ),
        with_percent_change AS (
          SELECT
            card_id,
            set_name,
            card_name,
            image,
            early_price,
            recent_price,
            total_sales,
            release_date,
            ROUND(((recent_price - early_price) / NULLIF(early_price, 0) * 100)::numeric, 2) AS percent_change
          FROM price_changes
        )
        SELECT *
        FROM with_percent_change
        WHERE early_price IS NOT NULL
          AND recent_price IS NOT NULL
          AND early_price != 0
          ${sortOrder === "ASC" ? "AND total_sales > 0" : ""}
        ORDER BY percent_change ${sortOrder}
        LIMIT 10;
    `;

    const topGainers = await prisma.$queryRawUnsafe(query, setName, interval);

    return topGainers as QueryRow[];
  } catch (error) {
    console.error("Error fetching top gainers:", error);
    return [];
  }
}
