import dotenv from "dotenv";
import { resolve } from "node:path";
import { prisma } from "@pokemon/shared";

dotenv.config({ path: resolve(__dirname, "../../.env") });

import type { Prisma } from "@prisma/client";

import { Router } from "express";
import type { Request, Response } from "express";
import {
  getAllSealedProducts,
  getPredictionsForSealedProducts,
  getSealedByTitle,
  getUnlabledSealedProduct,
  labelSealedProduct,
} from "../services/sealedService";

const router = Router();

// Get all sealed products
router.get("/sealed", async (_req: Request, res: Response) => {
  try {
    const sealed = await getAllSealedProducts();
    res.json(sealed);
  } catch (error) {
    console.error("Error fetching sealed products:", error);
    res.status(500).json({ error: "Error fetching sealed products" });
  }
});

// Get price history for a specific product by title
router.get("/sealed/:title/prices", async (req: Request, res: Response) => {
  const { title } = req.params;

  try {
    const sealed = await getSealedByTitle(title);

    if (!sealed) {
      res.status(404).json({ error: "Sealed product not found" });
      return;
    }

    res.json(sealed.prices);
  } catch (error) {
    console.error("Error fetching sealed products by title:", error);
    res.status(500).json({ error: "Error fetching sealed products by title" });
  }
});

router.get("/sealed/unlabeled", async (_req: Request, res: Response) => {
  try {
    const entries = await getUnlabledSealedProduct();

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

router.post("/sealed/label", async (req: Request, res: Response) => {
  const { id, label } = req.body;

  if (!id || (label !== "keep" && label !== "remove")) {
    res.status(400).json({ error: "Invalid id or label" });
    return;
  }

  try {
    await labelSealedProduct(id, label);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error labeling entry:", error);
    res.status(500).json({ error: "Failed to label entry" });
  }
});

router.get("/sealed/predictions", async (req: Request, res: Response) => {
  const { label, search, page = 1, perPage = 20 } = req.query;
  const where: Prisma.SealedPriceEntryWhereInput = {};

  try {
    const prediction = await getPredictionsForSealedProducts(
      label as string,
      where,
      search as string,
      Number(page),
      Number(perPage),
    );
    res.json(prediction);
  } catch (error) {
    console.error("Error fetching predictions:", error);
    res.status(500).json({ error: "Failed to fetch predictions" });
  }
});

router.post("/sealed/auto-label", async (_req: Request, res: Response) => {
  try {
    const threshold: number = 0.9;
    const batchSize = 100;

    const PYTHON_URL =
      process.env.PYTHON_CLASSIFIER_URL ??
      "http://sealed-classifier-service:8000/classify";

    const entries = await prisma.sealedPriceEntry.findMany({
      where: { label: null },
      include: { sealed: true },
    });

    if (!entries.length) {
      return res.json({ message: "No unlabeled entries." });
    }

    const updates = [];
    const skipped: Array<{ id: string; confidence: number }> = [];

    // Build all texts for classification
    const texts = entries.map(
      (e) => `${e.sealed.product} ${e.title} $${e.price}`,
    );

    // Break into batches
    for (let i = 0; i < texts.length; i += batchSize) {
      const chunk = texts.slice(i, i + batchSize);
      const chunkEntries = entries.slice(i, i + batchSize);

      const response = await fetch(PYTHON_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: chunk }),
      });

      if (!response.ok) {
        throw new Error(`Classifier error: ${await response.text()}`);
      }

      const res = await response.json();

      // Apply updates
      for (let j = 0; j < res.predictions.length; j++) {
        const { label, score: confidence } = res.predictions[j];
        const entry = chunkEntries[j];

        if (confidence >= threshold) {
          updates.push(
            prisma.sealedPriceEntry.update({
              where: { id: entry.id },
              data: { label },
            }),
          );
        } else {
          skipped.push({ id: entry.id, confidence });
        }
      }
    }

    if (updates.length > 0) {
      await prisma.$transaction(updates);
    }

    res.json({
      labeled: updates.length,
      skipped: skipped.length,
      threshold,
      batchSize,
    });
  } catch (err) {
    console.error("Batch auto-label error:", err);
    res.status(500).json({ error: "Batch auto-label failed" });
  }
});

export default router;
