// let classifier: any;
// async function loadModel() {
//   if (!classifier) {
//     // const modelDir = path.resolve(__dirname, "../../trainer/model"); // Adjust if needed
//     const modelDir = `file://${path.resolve(__dirname, "../../trainer/model")}`;
//     console.log("Loading model from:", modelDir);
//     console.log(
//       "Files:",
//       fs.readdirSync(path.resolve(__dirname, "../../trainer/model"))
//     );

//     classifier = await hfPipeline("text-classification", modelDir, {
//       local_files_only: true, // ⬅️ Tells Xenova to load from local dir
//     });
//   }
// }

// // Get all sealed products
// app.get("/sealed", async (_req: Request, res: Response) => {
//   const sealed = await prisma.sealed.findMany();
//   res.json(sealed);
// });

// // Get price history for a specific product by title
// app.get(
//   "/api/sealed/:title/prices",
//   async (req: Request<{ title: string }>, res: Response) => {
//     const { title } = req.params;

//     const sealed = await prisma.sealed.findFirst({
//       where: {
//         product: {
//           equals: title,
//           mode: "insensitive", // makes the match case-insensitive. Can't use findUnique
//         },
//       },
//       include: {
//         prices: {
//           where: {
//             label: "keep",
//           },
//           orderBy: {
//             soldAt: "asc",
//           },
//         },
//       },
//     });

//     if (!sealed) {
//       res.status(404).json({ message: "Product not found" });
//       return;
//     }

//     res.json(sealed.prices);
//   }
// );

// interface CardData {
//   name: string;
//   images?: {
//     small?: string;
//     large?: string;
//   };
//   set?: {
//     name?: string;
//   };
// }

// app.get("/api/cards", async (req: Request, res: Response) => {
//   const { set, q = "", filter = "", page = "1", pageSize = "20" } = req.query;

//   const take = parseInt(pageSize as string);
//   const skip = (parseInt(page as string) - 1) * take;

//   if (!set || isNaN(skip) || isNaN(take)) {
//     res.status(400).json({ message: "Invalid query params" });
//     return;
//   }

//   /*
//   This solution uses a multi-part sorting approach to handle your mixed numeric and alphanumeric values:

//   First, it sorts pure numeric values (like 17, 18, 19, 20) by their integer value
//   Next, it handles alphanumeric values (like '19a') by extracting and sorting by the numeric prefix
//   Finally, it sorts by the full string value to handle any remaining ties

//   This approach will give you the sorting you want: 17, 18, 19, 19a, 20.

//   NOTE: the query doesn't work as intended but I'm okay with the result. If the card is '101a', that
//   card will be appended at the end of the numeric-only cards
//   */
//   try {
//     const cards = (await prisma.$queryRawUnsafe(
//       `
//     SELECT *
//     FROM "Card"
//     WHERE data->'set'->>'name' = $1
//     ORDER BY
//       CASE
//         WHEN data->>'number' ~ '^[0-9]+$' THEN (data->>'number')::int
//         ELSE NULL
//       END NULLS LAST,
//       CASE
//         WHEN data->>'number' ~ '^[0-9]+$' THEN NULL
//         ELSE SUBSTRING(data->>'number', '^[0-9]+')::int
//       END NULLS LAST,
//       data->>'number'
//     OFFSET ${skip}
//     LIMIT ${take}
//     `,
//       set
//     )) as any[];
//     // ORDER BY (data->>'number')::int

//     res.json(
//       cards.map((card: any) => {
//         const data = card.data as unknown as CardData;

//         return {
//           id: card.id,
//           name: data.name,
//           image: data.images?.small,
//           set: data.set?.name,
//         };
//       })
//     );
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch cards" });
//   }
// });

// app.get("/api/card/history/:id", async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const { timeframe = "1m" } = req.query;

//   const fromDate = convertDate(timeframe as string);

//   const history = await prisma.$queryRawUnsafe(
//     `
//     SELECT
//       DATE("date") AS date,
//       price,
//       quantity
//     FROM "PriceEntry"
//     WHERE "cardId" = $1
//       AND "date" >= $2
//     ORDER BY DATE("date") ASC
//     `,
//     id,
//     fromDate
//   );

//   res.json(history);
// });

// app.get("/api/sealed/unlabeled", async (req: Request, res: Response) => {
//   try {
//     const entries = await prisma.sealedPriceEntry.findMany({
//       where: { label: null },
//       include: {
//         sealed: {
//           select: { product: true },
//         },
//       },
//       take: 100, // optional: limit for performance
//       orderBy: { soldAt: "desc" },
//     });

//     const result = entries.map((entry: any) => ({
//       id: entry.id,
//       sealedId: entry.sealedId,
//       title: entry.title,
//       price: entry.price,
//       url: entry.url,
//       soldAt: entry.soldAt,
//       label: entry.label,
//       product: entry.sealed.product,
//     }));

//     res.json(result);
//   } catch (error) {
//     console.error("Error fetching unlabeled entries:", error);
//     res.status(500).json({ error: "Failed to fetch entries" });
//   }
// });

// app.post("/api/sealed/label", async (req: Request, res: Response) => {
//   const { id, label } = req.body;

//   if (!id || (label !== "keep" && label !== "remove")) {
//     res.status(400).json({ error: "Invalid id or label" });
//     return;
//   }

//   try {
//     await prisma.sealedPriceEntry.update({
//       where: { id },
//       data: { label },
//     });

//     res.status(200).json({ success: true });
//   } catch (error) {
//     console.error("Error labeling entry:", error);
//     res.status(500).json({ error: "Failed to label entry" });
//   }
// });

// app.get("/api/sealed/predictions", async (req: Request, res: Response) => {
//   const { label, search, page = 1, perPage = 20 } = req.query;
//   const where: any = {};

//   if (label) where.label = label;
//   if (search)
//     where.OR = [
//       { title: { contains: search, mode: "insensitive" } },
//       { sealed: { product: { contains: search, mode: "insensitive" } } },
//     ];

//   const items = await prisma.sealedPriceEntry.findMany({
//     where,
//     include: { sealed: true },
//     orderBy: { soldAt: "desc" },
//     skip: (+page - 1) * +perPage,
//     take: +perPage,
//   });

//   const total = await prisma.sealedPriceEntry.count({ where });

//   res.json({ items, total });
// });

// app.post("/api/sealed/auto-label", async (req: Request, res: Response) => {
//   try {
//     await loadModel();

//     const threshold: number = req.body.threshold ?? 0.9;

//     const entries = await prisma.sealedPriceEntry.findMany({
//       where: { label: null },
//       include: { sealed: true },
//     });

//     if (!entries.length) {
//       res.json({ message: "No unlabeled entries found." });
//       return;
//     }

//     const updates = [];
//     const skipped = [];

//     for (const entry of entries) {
//       const inputText = `${entry.sealed.product} ${entry.title} $${entry.price}`;
//       const [result] = await classifier(inputText);

//       const prediction = result.label.toLowerCase(); // "keep" or "remove"
//       const confidence = result.score;

//       if (confidence >= threshold) {
//         updates.push(
//           prisma.sealedPriceEntry.update({
//             where: { id: entry.id },
//             data: { label: prediction },
//           })
//         );
//       } else {
//         skipped.push({ id: entry.id, score: confidence });
//       }
//     }

//     await prisma.$transaction(updates);

//     res.json({
//       message: `Auto-labeled ${updates.length} entries.`,
//       skipped: skipped.length,
//       threshold,
//     });
//   } catch (err) {
//     console.error("Auto-label error:", err);
//     res.status(500).json({ error: "Failed to auto-label entries." });
//   }
// });

// // Health check endpoint
// app.get("/api/health", async (req: Request, res: Response) => {
//   try {
//     // Check if Python service is running
//     const embeddingServiceHealth = await fetch(
//       `${EMBEDDING_SERVICE_URL}/health`,
//       {
//         method: "GET",
//       }
//     )
//       .then((r) => r.ok)
//       .catch(() => false);

//     // Check database connection
//     await prisma.$queryRaw`SELECT 1`;

//     res.json({
//       status: "ok",
//       embeddingService: embeddingServiceHealth ? "connected" : "disconnected",
//       database: "connected",
//     });
//   } catch (error) {
//     res.status(503).json({
//       status: "error",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// });

import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config";
import cardRecognitionRouter from "./routes/cardRecognition";
import cardsRouter from "./routes/cards";
import setsRouter from "./routes/sets";
import { getQuantitySpikes } from "@pokemon/shared/db";
// Import other routers...

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Mount routes
app.use("/api", cardRecognitionRouter);
app.use("/api", cardsRouter);
app.use("/api", setsRouter);
// Mount other routes...

app.get("/api/quantity-spikes", async (req: Request, res: Response) => {
  try {
    const quantitySpikes = await getQuantitySpikes();
    res.json(quantitySpikes);
  } catch (error) {
    console.error("Error fetching quantity spikes:", error);
    res.status(500).send("Error fetching quantity spikes");
  }
});

// Start server
app.listen(config.port, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
