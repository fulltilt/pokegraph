import { prisma } from "@pokemon/shared";

export async function getAllProducts() {
  try {
    return await prisma.product.findMany({
      include: {
        inventoryItems: {
          where: { status: "In Stock" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
}

export async function getProductByUpc(upc: string) {
  try {
    return await prisma.product.findUnique({
      where: { upc },
      include: {
        inventoryItems: {
          where: { status: "In Stock" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching product by UPC:", error);
    return null;
  }
}

export async function createProduct(data: {
  upc: string;
  name: string;
  productType?: string;
  setName?: string;
  releaseDate?: string;
  msrp?: number;
  imageUrl?: string;
  description?: string;
}) {
  try {
    return await prisma.product.create({
      data: {
        upc: data.upc,
        name: data.name,
        productType: data.productType,
        setName: data.setName,
        releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
        msrp: data.msrp ? Number.parseFloat(data.msrp.toString()) : null,
        imageUrl: data.imageUrl,
        description: data.description,
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  try {
    return await prisma.product.update({
      where: { id: Number.parseInt(id, 10) },
      data,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return null;
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id: Number.parseInt(id, 10) },
    });
    return true;
  } catch (error) {
    console.error("Error deleting product:", error);
    return false;
  }
}
