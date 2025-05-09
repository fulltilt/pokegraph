import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "../generated/prisma/index.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

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
    ORDER BY (data->>'number')::int
    OFFSET ${skip}
    LIMIT ${take}
    `,
      set
    );

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

  const fromDate = (() => {
    const now = new Date();
    if (timeframe === "1y")
      return new Date(now.setFullYear(now.getFullYear() - 1));
    if (timeframe === "6m") return new Date(now.setMonth(now.getMonth() - 6));
    if (timeframe === "3m") return new Date(now.setMonth(now.getMonth() - 3));
    return new Date(now.setMonth(now.getMonth() - 1)); // default 1m
  })();

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

app.get("/api/top-mover-per-set/:order", async (req, res) => {
  const { order } = req.params;

  try {
    const result = await prisma.$queryRawUnsafe(`
      WITH price_bounds AS (
        SELECT
          c.id AS card_id,
          (c.data->'set'->>'id') AS set_id,
          (c.data->'set'->>'name') AS set_name,
          (c.data->'name') AS card_name,
          (c.data->'images'->>'large') AS image,
          (c.data->'set'->>'releaseDate') AS release_date,
          MIN(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '10 days') AS earliest_date,
          MAX(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '10 days') AS latest_date
        FROM "Card" c
        JOIN "PriceEntry" p ON p."cardId" = c.id
        WHERE p.date >= NOW() - INTERVAL '10 days'
          AND (c.data->'set'->>'series') IN ('Sun & Moon', 'Sword & Shield', 'Scarlet & Violet')
        GROUP BY c.id, set_id, set_name, card_name, image
      ),
      price_changes AS (
        SELECT
          pb.set_id,
          pb.set_name,
          pb.card_id,
          pb.card_name,
          pb.image,
          pb.release_date,
          MIN(p1.price) FILTER (WHERE p1.date = pb.earliest_date) AS early_price,
          MAX(p2.price) FILTER (WHERE p2.date = pb.latest_date) AS recent_price
        FROM price_bounds pb
        JOIN "PriceEntry" p1 ON p1."cardId" = pb.card_id
        JOIN "PriceEntry" p2 ON p2."cardId" = pb.card_id
        GROUP BY pb.set_id, pb.set_name, pb.card_id, pb.card_name, pb.image, pb.release_date
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
        release_date,
        percent_change
      FROM with_percent_change
      WHERE early_price != 0 AND recent_price != 0
      ORDER BY set_id, percent_change ${order};
    `);

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
            MIN(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '30 days') AS earliest_date,
            MAX(p.date) FILTER (WHERE p.date >= NOW() - INTERVAL '30 days') AS latest_date
          FROM "Card" c
          JOIN "PriceEntry" p ON p."cardId" = c.id
          WHERE (c.data->'set'->>'name') = $1
            AND p.date >= NOW() - INTERVAL '30 days'
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
      const topGainers = await prisma.$queryRawUnsafe(query, setName);

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
