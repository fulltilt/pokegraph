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
