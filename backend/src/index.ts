import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import { config } from "./config";
import cardRecognitionRouter from "./routes/cardRecognition";
import cardsRouter from "./routes/cards";
import setsRouter from "./routes/sets";
import sealedRouter from "./routes/sealed";
import salesRouter from "./routes/sales";
import inventoryRouter from "./routes/inventory";
import productsRouter from "./routes/products";
import { getQuantitySpikes } from "../../shared/src/db";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Mount routes
app.use("/api", cardRecognitionRouter);
app.use("/api/cards", cardsRouter);
app.use("/api", setsRouter);
app.use("/api", sealedRouter);
app.use("/api/sales", salesRouter);
app.use("/api/product", productsRouter);
app.use("/api/inventory", inventoryRouter);
// Mount other routes...

app.get("/api/quantity-spikes", async (_req: Request, res: Response) => {
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
