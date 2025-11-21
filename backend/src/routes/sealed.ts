import dotenv from "dotenv";
import { resolve } from "path";
import path from "path";
import fs from "fs";
import { pipeline as hfPipeline } from "@xenova/transformers";
import { prisma } from "@pokemon/shared";

dotenv.config({ path: resolve(__dirname, "../../.env") });

import { Prisma } from "@prisma/client";

import { Router, Request, Response } from "express";
import {
  // classifyText,
  getAllSealedProducts,
  getPredictionsForSealedProducts,
  getSealedByTitle,
  getUnlabeledEntries,
  getUnlabledSealedProduct,
  labelSealedProduct,
  // loadModel,
  updateLabeledEntries,
} from "../services/sealedService";
// import { Prisma } from "@prisma/client";

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

    const result = entries.map((entry: any) => ({
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
      Number(perPage)
    );
    res.json(prediction);
  } catch (error) {}
});

router.post("/sealed/auto-label", async (req: Request, res: Response) => {
  try {
    const threshold: number = req.body.threshold ?? 0.9;
    const batchSize = req.body.batchSize ?? 100;

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
    const skipped: any[] = [];

    // Build all texts for classification
    const texts = entries.map(
      (e) => `${e.sealed.product} ${e.title} $${e.price}`
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
        const { label, confidence } = res.predictions[j];
        const entry = chunkEntries[j];

        if (confidence >= threshold) {
          updates.push(
            prisma.sealedPriceEntry.update({
              where: { id: entry.id },
              data: { label },
            })
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

// let classifier: any;
// async function loadModel() {
//   if (!classifier) {
//     // const modelDir = path.resolve(__dirname, "../../trainer/model"); // Adjust if needed
//     const modelDir = `file://${path.resolve(
//       __dirname,
//       "../../../trainer/model"
//     )}`;
//     console.log("Loading model from:", modelDir);
//     console.log(
//       "Files:",
//       fs.readdirSync(path.resolve(__dirname, "../../../trainer/model"))
//     );

//     classifier = await hfPipeline("text-classification", modelDir, {
//       local_files_only: true, // ⬅️ Tells Xenova to load from local dir
//     });
//   }
// }
// router.post("/sealed/auto-label", async (req: Request, res: Response) => {
// try {
//   await loadModel();

//   const threshold: number = req.body.threshold ?? 0.9;

//   const entries = await getUnlabeledEntries();
//   if (!entries.length) {
//     return res.json({ message: "No unlabeled entries found." });
//   }

//   const updates = [];
//   const skipped = [];

//   for (const entry of entries) {
//     const text = `${entry.sealed.product} ${entry.title} $${entry.price}`;
//     const { prediction, confidence } = await classifyText(text);

//     if (confidence >= threshold) {
//       updates.push({ id: entry.id, label: prediction });
//     } else {
//       skipped.push({ id: entry.id, score: confidence });
//     }
//   }

//   await updateLabeledEntries(updates);

//   return res.json({
//     message: `Auto-labeled ${updates.length} entries.`,
//     skipped: skipped.length,
//     threshold,
//   });
// } catch (error) {
//   console.error("Auto-label error:", error);
//   return res.status(500).json({ error: "Failed to auto-label entries." });
// }
// });

export default router;
