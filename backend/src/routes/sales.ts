import { Router } from "express";
import type { Request, Response } from "express";
import {
  getAllSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  getSalesSummary,
  getTopProducts,
} from "../services/salesService";

const router = Router();

// GET all sales
router.get("/", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, platform } = req.query;

    const sales = await getAllSales({
      startDate: startDate as string,
      endDate: endDate as string,
      platform: platform as string,
    });

    if (!sales) {
      return res.status(500).json({ error: "Failed to fetch sales" });
    }

    res.json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

// GET single sale
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sale = await getSale(id);

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    console.error("Error fetching sale:", error);
    res.status(500).json({ error: "Failed to fetch sale" });
  }
});

// POST create new sale
router.post("/", async (req: Request, res: Response) => {
  try {
    const { inventoryItemId, saleDate, salePrice } = req.body;

    if (!inventoryItemId || !saleDate || salePrice === undefined) {
      return res.status(400).json({
        error: "Inventory item ID, sale date, and sale price are required",
      });
    }

    const sale = await createSale(req.body);
    res.status(201).json(sale);
  } catch (error: unknown) {
    console.error("Error creating sale:", error);

    if (
      error instanceof Error &&
      error.message === "Inventory item not found"
    ) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to create sale" });
  }
});

// PATCH update sale
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sale = await updateSale(id, req.body);

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    console.error("Error updating sale:", error);
    res.status(500).json({ error: "Failed to update sale" });
  }
});

// DELETE sale
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await deleteSale(id);

    if (!success) {
      return res.status(404).json({ error: "Sale not found" });
    }

    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Error deleting sale:", error);
    res.status(500).json({ error: "Failed to delete sale" });
  }
});

// GET sales summary
router.get("/sales-summary", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const summary = await getSalesSummary({
      startDate: startDate as string,
      endDate: endDate as string,
    });

    if (!summary) {
      return res.status(500).json({ error: "Failed to fetch sales summary" });
    }

    res.json(summary);
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    res.status(500).json({ error: "Failed to fetch sales summary" });
  }
});

// GET top performing products
router.get("/top-products", async (req: Request, res: Response) => {
  try {
    const limit = Number.parseInt(req.query.limit as string, 10) || 10;

    const topProducts = await getTopProducts(limit);

    if (!topProducts) {
      return res.status(500).json({ error: "Failed to fetch top products" });
    }

    res.json(topProducts);
  } catch (error) {
    console.error("Error fetching top products:", error);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
});

export default router;
