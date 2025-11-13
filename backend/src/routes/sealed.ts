import { Router, Request, Response } from "express";
import {
  classifyText,
  getAllSealedProducts,
  getPredictionsForSealedProducts,
  getSealedByTitle,
  getUnlabeledEntries,
  getUnlabledSealedProduct,
  labelSealedProduct,
  loadModel,
  updateLabeledEntries,
} from "../services/sealedService";
import { Prisma } from "@prisma/client";

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
router.get("/api/sealed/:title/prices", async (req: Request, res: Response) => {
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

router.get("/api/sealed/unlabeled", async (_req: Request, res: Response) => {
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

router.post("/api/sealed/label", async (req: Request, res: Response) => {
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

router.get("/api/sealed/predictions", async (req: Request, res: Response) => {
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

router.post("/api/sealed/auto-label", async (req: Request, res: Response) => {
  try {
    await loadModel();

    const threshold: number = req.body.threshold ?? 0.9;

    const entries = await getUnlabeledEntries();
    if (!entries.length) {
      return res.json({ message: "No unlabeled entries found." });
    }

    const updates = [];
    const skipped = [];

    for (const entry of entries) {
      const text = `${entry.sealed.product} ${entry.title} $${entry.price}`;
      const { prediction, confidence } = await classifyText(text);

      if (confidence >= threshold) {
        updates.push({ id: entry.id, label: prediction });
      } else {
        skipped.push({ id: entry.id, score: confidence });
      }
    }

    await updateLabeledEntries(updates);

    return res.json({
      message: `Auto-labeled ${updates.length} entries.`,
      skipped: skipped.length,
      threshold,
    });
  } catch (error) {
    console.error("Auto-label error:", error);
    return res.status(500).json({ error: "Failed to auto-label entries." });
  }
});
