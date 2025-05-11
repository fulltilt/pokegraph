import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "../generated/prisma/index.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

function convertDate(timeframe: string) {
  let fromDate = new Date();

  if (timeframe === "1y") {
    fromDate.setFullYear(fromDate.getFullYear() - 1);
  } else if (timeframe === "6m") {
    fromDate.setMonth(fromDate.getMonth() - 6);
  } else if (timeframe === "3m") {
    fromDate.setMonth(fromDate.getMonth() - 3);
  } else if (timeframe === "10d") {
    fromDate.setDate(fromDate.getDate() - 10);
  } else {
    fromDate.setMonth(fromDate.getMonth() - 1); // default to 1m
  }

  return fromDate;
}

type TimeframeKey = "10d" | "1m" | "3m" | "6m" | "1y";

const timeframeMap: Record<TimeframeKey, string> = {
  "10d": "10 days",
  "1m": "1 month",
  "3m": "3 months",
  "6m": "6 months",
  "1y": "1 year",
};

function getTimeframeInterval(queryValue: unknown): string {
  if (typeof queryValue === "string" && queryValue in timeframeMap) {
    return timeframeMap[queryValue as TimeframeKey];
  }
  return timeframeMap["10d"]; // Default fallback
}

// Get all sealed products
app.get("/sealed", async (_req: Request, res: Response) => {
  const sealed = await prisma.sealed.findMany();
  res.json(sealed);
});

// Get price history for a specific product by title
app.get(
  "/api/sealed/:title/prices",
  async (req: Request<{ title: string }>, res: Response) => {
    const { title } = req.params;

    const sealed = await prisma.sealed.findFirst({
      where: {
        product: {
          equals: title,
          mode: "insensitive", // makes the match case-insensitive. Can't use findUnique
        },
      },
      include: { prices: true },
    });

    if (!sealed) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json(sealed.prices);
  }
);

interface CardData {
  name: string;
  images?: {
    small?: string;
    large?: string;
  };
  set?: {
    name?: string;
  };
}

app.get("/api/cards", async (req, res) => {
  const { set, q = "", filter = "", page = "1", pageSize = "20" } = req.query;

  const take = parseInt(pageSize as string);
  const skip = (parseInt(page as string) - 1) * take;

  if (!set || isNaN(skip) || isNaN(take)) {
    res.status(400).json({ message: "Invalid query params" });
    return;
  }

  /*
  This solution uses a multi-part sorting approach to handle your mixed numeric and alphanumeric values:

  First, it sorts pure numeric values (like 17, 18, 19, 20) by their integer value
  Next, it handles alphanumeric values (like '19a') by extracting and sorting by the numeric prefix
  Finally, it sorts by the full string value to handle any remaining ties

  This approach will give you the sorting you want: 17, 18, 19, 19a, 20.

  NOTE: the query doesn't work as intended but I'm okay with the result. If the card is '101a', that 
  card will be appended at the end of the numeric-only cards
  */
  try {
    const cards = await prisma.$queryRawUnsafe<
      {
        id: string;
        data: any;
      }[]
    >(
      `
    SELECT *
    FROM "Card"
    WHERE data->'set'->>'name' = $1
    ORDER BY 
      CASE 
        WHEN data->>'number' ~ '^[0-9]+$' THEN (data->>'number')::int
        ELSE NULL
      END NULLS LAST,
      CASE 
        WHEN data->>'number' ~ '^[0-9]+$' THEN NULL
        ELSE SUBSTRING(data->>'number', '^[0-9]+')::int
      END NULLS LAST,
      data->>'number'
    OFFSET ${skip}
    LIMIT ${take}
    `,
      set
    );
    // ORDER BY (data->>'number')::int

    res.json(
      cards.map((card) => {
        const data = card.data as unknown as CardData;

        return {
          id: card.id,
          name: data.name,
          image: data.images?.small,
          set: data.set?.name,
        };
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cards" });
  }
});

app.get("/api/card/history/:id", async (req, res) => {
  const { id } = req.params;
  const { timeframe = "1m" } = req.query;

  const fromDate = convertDate(timeframe as string);

  const history = await prisma.$queryRawUnsafe<
    { date: Date; price: number; quantity: number }[]
  >(
    `
    SELECT 
      DATE("date") AS date,
      price,
      quantity
    FROM "PriceEntry"
    WHERE "cardId" = $1
      AND "date" >= $2
    ORDER BY DATE("date") ASC
    `,
    id,
    fromDate
  );

  res.json(history);
});

app.get("/api/cards-search", async (req, res) => {
  const name = req.query.name as string;
  console.log(name);
  if (!name) {
    res.status(400).json({ error: "Missing card name" });
    return;
  }

  try {
    const results = await prisma.$queryRawUnsafe(
      `
      SELECT *
      FROM "Card"
      WHERE SIMILARITY(data->>'name', $1) > 0.3
      ORDER BY SIMILARITY(data->>'name', $1) DESC
      LIMIT 10
    `,
      name
    );
    console.log(results);
    res.json(results);
  } catch (err) {
    console.error("Search failed:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

app.get("/api/cards/:id", async (req, res) => {
  const { id } = req.params;

  const card = await prisma.card.findUnique({
    where: {
      id,
    },
  });

  if (!card) {
    res.status(404).json({ message: "Card not found" });
    return;
  }

  res.json(card);
});

// WITH price_bounds AS (
//   SELECT
//     c.id AS card_id,
//     (c.data->'set'->>'id') AS set_id,
//     (c.data->'set'->>'name') AS set_name,
//     (c.data->'name') AS card_name,
//     (c.data->'images'->>'large') AS image,
//     (c.data->'set'->>'releaseDate') AS release_date,
//     MIN(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '10 days') AS earliest_date,
//     MAX(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '10 days') AS latest_date
//   FROM "Card" c
//   JOIN "PriceEntry" p ON p."cardId" = c.id
//   WHERE p.date >= NOW() - INTERVAL '10 days'
//     AND (c.data->'set'->>'series') IN ('Sun & Moon', 'Sword & Shield', 'Scarlet & Violet')
//   GROUP BY c.id, set_id, set_name, card_name, image
// ),
// price_changes AS (
//   SELECT
//     pb.set_id,
//     pb.set_name,
//     pb.card_id,
//     pb.card_name,
//     pb.image,
//     pb.release_date,
//     MIN(p1.price) FILTER (WHERE p1.date = pb.earliest_date) AS early_price,
//     MAX(p2.price) FILTER (WHERE p2.date = pb.latest_date) AS recent_price
//   FROM price_bounds pb
//   JOIN "PriceEntry" p1 ON p1."cardId" = pb.card_id
//   JOIN "PriceEntry" p2 ON p2."cardId" = pb.card_id
//   GROUP BY pb.set_id, pb.set_name, pb.card_id, pb.card_name, pb.image, pb.release_date
// ),
// with_percent_change AS (
//   SELECT
//     *,
//     ROUND(((recent_price - early_price) / NULLIF(early_price, 0) * 100)::numeric, 2) AS percent_change
//   FROM price_changes
// )
// SELECT DISTINCT ON (set_id)
//   set_id,
//   set_name,
//   card_id,
//   card_name,
//   image,
//   early_price,
//   recent_price,
//   release_date,
//   percent_change
// FROM with_percent_change
// WHERE early_price != 0 AND recent_price != 0
// ORDER BY set_id, percent_change ${order};
app.get("/api/top-mover-per-set/:order", async (req, res) => {
  const { order } = req.params;
  const timeframe = req.query.timeframe || "10d";

  const intervalMap: Record<string, string> = {
    "10d": "10 days",
    "1m": "1 month",
    "3m": "3 months",
    "6m": "6 months",
    "1y": "1 year",
  };

  const sqlInterval = intervalMap[timeframe as string] || "10 days";
  console.log(sqlInterval);
  try {
    const result = await prisma.$queryRawUnsafe(
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
        WHERE (c.data->'set'->>'series') IN ('Sun & Moon', 'Sword & Shield', 'Scarlet & Violet')
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
      sqlInterval
    );
    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch top movers." });
  }
});

app.get("/api/sets-by-series", async (req, res) => {
  const series = req.query.series as string;

  if (!series) {
    res.status(400).json({ error: "Missing series parameter" });
    return;
  }

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
      series
    );

    res.json(sets);
  } catch (error) {
    console.error("Error fetching sets by series:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get(
  "/api/top-movers-by-set/:setName/:order",
  async (req: Request, res: Response) => {
    const { setName, order } = req.params;
    const rawTimeframe = req.query.timeframe;
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

      // Run the query with the set ID
      const topGainers = await prisma.$queryRawUnsafe(query, setName, interval);

      // Send the response with the top gainers data
      res.json(topGainers);
    } catch (error) {
      console.error("Error fetching top gainers:", error);
      res.status(500).send("Error fetching top gainers");
    }
  }
);

// app.get("/api/top-gainers-per-set", async (req, res) => {
//   const sets = req.query.sets;

//   if (!sets || typeof sets !== "string") {
//     res.status(400).json({ error: "Missing or invalid 'sets' query param." });
//     return;
//   }

//   try {
//     const setIds = Array.isArray(sets) ? sets : sets.split(",");
//     const placeholders = setIds.map((_, i) => `$${i + 1}`).join(", ");

//     const query = await prisma.$queryRawUnsafe(
//       `
//       WITH price_data AS (
//     SELECT
//       c.id::uuid AS card_id,
//       (c.data->'set'->>'id') AS set_id,
//       MIN(p.date) AS earliest_date,
//       MAX(p.date) AS latest_date
//     FROM "Card" c
//     JOIN "PriceEntry" p ON p."cardId" = c.id
//     WHERE p.date >= NOW() - INTERVAL '30 days'
//       AND (c.data->'set'->>'name') IN (${placeholders})
//     GROUP BY c.id, set_id
//   ),
//   price_changes AS (
//     SELECT
//       pd.set_id,
//       pd.card_id,
//       (
//         SELECT price::numeric
//         FROM "PriceEntry"
//         WHERE "cardId" = pd.card_id::uuid AND date = pd.earliest_date
//         LIMIT 1
//       ) AS early_price,
//       (
//         SELECT price::numeric
//         FROM "PriceEntry"
//         WHERE "cardId" = pd.card_id::uuid AND date = pd.latest_date
//         LIMIT 1
//       ) AS recent_price
//     FROM price_data pd
//   ),
//   with_percent_change AS (
//     SELECT
//       pc.set_id,
//       pc.card_id,
//       pc.early_price,
//       pc.recent_price,
//       ROUND(((pc.recent_price - pc.early_price) / NULLIF(pc.early_price, 0) * 100)::numeric, 2) AS percent_change
//     FROM price_changes pc
//   ),
//   ranked_changes AS (
//     SELECT *,
//            ROW_NUMBER() OVER (PARTITION BY set_id ORDER BY percent_change DESC) AS rank
//     FROM with_percent_change
//   )
//   SELECT
//     set_id,
//     card_id::text,
//     early_price,
//     recent_price,
//     percent_change,
//     rank
//   FROM ranked_changes
//   WHERE rank <= 10
//   ORDER BY set_id, rank;
//     `,
//       ...setIds
//     );

//     // try {
//     //   const placeholders = setIds.map((_, i) => `$${i + 1}`).join(", ");
//     //   console.log(setIds, placeholders);
//     //   const query = `
//     //     WITH price_points AS (
//     //       SELECT
//     //         c.id AS card_id,
//     //         (c.data->'set'->>'id') AS set_id,
//     //         MIN(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '10 days') AS earliest_date,
//     //         MAX(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '10 days') AS latest_date
//     //       FROM "Card" c
//     //       JOIN "PriceEntry" p ON p."cardId" = c.id
//     //       WHERE (c.data->'set'->>'name') IN (${placeholders})
//     //         AND p.date >= NOW() - INTERVAL '10 days'
//     //       GROUP BY c.id, set_id
//     //     ),
//     //     price_changes AS (
//     //       SELECT
//     //         pp.set_id,
//     //         pp.card_id,
//     //         MIN(p1.price) FILTER (WHERE p1.date = pp.earliest_date) AS early_price,
//     //         MAX(p2.price) FILTER (WHERE p2.date = pp.latest_date) AS recent_price
//     //       FROM price_points pp
//     //       JOIN "PriceEntry" p1 ON p1."cardId" = pp.card_id
//     //       JOIN "PriceEntry" p2 ON p2."cardId" = pp.card_id
//     //       GROUP BY pp.set_id, pp.card_id
//     //     ),
//     //     with_percent_change AS (
//     //       SELECT
//     //         set_id,
//     //         card_id,
//     //         early_price,
//     //         recent_price,
//     //         ROUND(((recent_price - early_price) / NULLIF(early_price, 0) * 100)::numeric, 2) AS percent_change
//     //       FROM price_changes
//     //     )
//     //     SELECT DISTINCT ON (set_id) *
//     //     FROM with_percent_change
//     //     WHERE early_price IS NOT NULL AND recent_price IS NOT NULL
//     //     ORDER BY set_id, percent_change DESC;
//     //   `;

//     res.json(query);
//   } catch (error) {
//     console.error("Error fetching top movers by set:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// Start the server
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
