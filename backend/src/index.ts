import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "../generated/prisma/index.js";
import { pipeline as hfPipeline, env } from "@xenova/transformers";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Let the library know to use local files
env.localModelPath = true;

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

let classifier: any;
async function loadModel() {
  if (!classifier) {
    // const modelDir = path.resolve(__dirname, "../../trainer/model"); // Adjust if needed
    const modelDir = `file://${path.resolve(__dirname, "../../trainer/model")}`;
    console.log("Loading model from:", modelDir);
    console.log(
      "Files:",
      fs.readdirSync(path.resolve(__dirname, "../../trainer/model"))
    );

    classifier = await hfPipeline("text-classification", modelDir, {
      local_files_only: true, // ⬅️ Tells Xenova to load from local dir
    });
  }
}

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
      include: {
        prices: {
          where: {
            label: "keep",
          },
          orderBy: {
            soldAt: "asc",
          },
        },
      },
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
  const timeframe = req.query.timeframe || "10d";

  const intervalMap: Record<string, string> = {
    "10d": "10 days",
    "1m": "1 month",
    "3m": "3 months",
    "6m": "6 months",
    "1y": "1 year",
  };

  const sqlInterval = intervalMap[timeframe as string] || "10 days";

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
      sqlInterval
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch top movers." });
  }
});

app.get("/api/top-mover-per-set-price/:order", async (req, res) => {
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

  try {
    const result = await prisma.$queryRawUnsafe(
      `-- Step 1: Pre-filter relevant PriceEntries
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
      sqlInterval
    );

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
    console.log(series, sets);
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

app.get("/api/sealed/unlabeled", async (req, res) => {
  try {
    const entries = await prisma.sealedPriceEntry.findMany({
      where: { label: null },
      include: {
        sealed: {
          select: { product: true },
        },
      },
      take: 100, // optional: limit for performance
      orderBy: { soldAt: "desc" },
    });

    const result = entries.map((entry) => ({
      id: entry.id,
      sealedId: entry.sealedId,
      title: entry.title,
      price: entry.price,
      url: entry.url,
      soldAt: entry.soldAt,
      label: entry.label,
      product: entry.sealed.product,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching unlabeled entries:", error);
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

app.post("/api/sealed/label", async (req, res) => {
  const { id, label } = req.body;

  if (!id || (label !== "keep" && label !== "remove")) {
    res.status(400).json({ error: "Invalid id or label" });
    return;
  }

  try {
    await prisma.sealedPriceEntry.update({
      where: { id },
      data: { label },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error labeling entry:", error);
    res.status(500).json({ error: "Failed to label entry" });
  }
});

app.get("/api/sealed/predictions", async (req, res) => {
  const { label, search, page = 1, perPage = 20 } = req.query;
  const where: any = {};

  if (label) where.label = label;
  if (search)
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { sealed: { product: { contains: search, mode: "insensitive" } } },
    ];

  const items = await prisma.sealedPriceEntry.findMany({
    where,
    include: { sealed: true },
    orderBy: { soldAt: "desc" },
    skip: (+page - 1) * +perPage,
    take: +perPage,
  });

  const total = await prisma.sealedPriceEntry.count({ where });

  res.json({ items, total });
});

app.post("/api/sealed/auto-label", async (req, res) => {
  try {
    await loadModel();

    const threshold: number = req.body.threshold ?? 0.9;

    const entries = await prisma.sealedPriceEntry.findMany({
      where: { label: null },
      include: { sealed: true },
    });

    if (!entries.length) {
      res.json({ message: "No unlabeled entries found." });
      return;
    }

    const updates = [];
    const skipped = [];

    for (const entry of entries) {
      const inputText = `${entry.sealed.product} ${entry.title} $${entry.price}`;
      const [result] = await classifier(inputText);

      const prediction = result.label.toLowerCase(); // "keep" or "remove"
      const confidence = result.score;

      if (confidence >= threshold) {
        updates.push(
          prisma.sealedPriceEntry.update({
            where: { id: entry.id },
            data: { label: prediction },
          })
        );
      } else {
        skipped.push({ id: entry.id, score: confidence });
      }
    }

    await prisma.$transaction(updates);

    res.json({
      message: `Auto-labeled ${updates.length} entries.`,
      skipped: skipped.length,
      threshold,
    });
  } catch (err) {
    console.error("Auto-label error:", err);
    res.status(500).json({ error: "Failed to auto-label entries." });
  }
});

// Start the server
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
