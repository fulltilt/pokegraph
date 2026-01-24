import { Router, Request, Response } from "express";
import {
  getAllInventory,
  getInventoryStats,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../services/inventoryService";

const router = Router();

// GET all inventory items
router.get("/api/inventory", async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    const inventory = await getAllInventory({
      status: status as string,
      search: search as string,
    });

    if (!inventory) {
      return res.status(500).json({ error: "Failed to fetch inventory" });
    }

    res.json(inventory);
  } catch (error) {
    console.error("Error fetching inventory:", error);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

// GET inventory statistics
router.get("/api/inventory/stats", async (req: Request, res: Response) => {
  try {
    const stats = await getInventoryStats();

    if (!stats) {
      return res.status(500).json({ error: "Failed to fetch inventory stats" });
    }

    res.json(stats);
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    res.status(500).json({ error: "Failed to fetch inventory stats" });
  }
});

// GET single inventory item
router.get("/api/inventory/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const inventoryItem = await getInventoryItem(id);

    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json(inventoryItem);
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    res.status(500).json({ error: "Failed to fetch inventory item" });
  }
});

// POST create new inventory item
router.post("/api/inventory", async (req: Request, res: Response) => {
  try {
    const { productId, purchaseDate, purchasePrice } = req.body;

    if (!productId || !purchaseDate || purchasePrice === undefined) {
      return res.status(400).json({
        error: "Product ID, purchase date, and purchase price are required",
      });
    }

    const inventoryItem = await createInventoryItem(req.body);
    res.status(201).json(inventoryItem);
  } catch (error) {
    console.error("Error creating inventory item:", error);
    res.status(500).json({ error: "Failed to create inventory item" });
  }
});

// PATCH update inventory item
router.patch("/api/inventory/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const inventoryItem = await updateInventoryItem(id, req.body);

    if (!inventoryItem) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json(inventoryItem);
  } catch (error) {
    console.error("Error updating inventory item:", error);
    res.status(500).json({ error: "Failed to update inventory item" });
  }
});

// DELETE inventory item
router.delete("/api/inventory/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await deleteInventoryItem(id);

    if (!success) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json({ message: "Inventory item deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    res.status(500).json({ error: "Failed to delete inventory item" });
  }
});

export default router;
