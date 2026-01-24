import { Router, Request, Response } from "express";
import {
  getAllProducts,
  getProductByUpc,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

const router = Router();

// GET all products
router.get("/api/products", async (req: Request, res: Response) => {
  try {
    const products = await getAllProducts();

    if (!products) {
      return res.status(500).json({ error: "Failed to fetch products" });
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET product by UPC
router.get("/api/products/upc/:upc", async (req: Request, res: Response) => {
  try {
    const { upc } = req.params;

    const product = await getProductByUpc(upc);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST create new product
router.post("/api/products", async (req: Request, res: Response) => {
  try {
    const { upc, name } = req.body;

    if (!upc || !name) {
      return res.status(400).json({ error: "UPC and name are required" });
    }

    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (error: any) {
    console.error("Error creating product:", error);

    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Product with this UPC already exists" });
    }

    res.status(500).json({ error: "Failed to create product" });
  }
});

// PATCH update product
router.patch("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await updateProduct(id, req.body);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE product
router.delete("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const success = await deleteProduct(id);

    if (!success) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;
