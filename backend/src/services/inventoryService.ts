import { prisma } from "@pokemon/shared";
import type { Prisma } from "@prisma/client";

export async function getAllInventory(filters?: {
  status?: string;
  search?: string;
}) {
  try {
    const where: Prisma.InventoryItemWhereInput = {};

    if (filters?.status && filters.status !== "all") {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.product = {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { upc: { contains: filters.search } },
          { setName: { contains: filters.search, mode: "insensitive" } },
        ],
      };
    }

    return await prisma.inventoryItem.findMany({
      where,
      include: {
        product: true,
        sales: true,
      },
      orderBy: {
        purchaseDate: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return null;
  }
}

export async function getInventoryStats() {
  try {
    // Get total items in stock
    const inventoryAgg = await prisma.inventoryItem.aggregate({
      where: { status: "In Stock" },
      _sum: {
        quantity: true,
      },
    });

    // Get total inventory value
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { status: "In Stock" },
      select: {
        quantity: true,
        purchasePrice: true,
        shippingCost: true,
        otherFees: true,
      },
    });

    const totalValue = inventoryItems.reduce((sum, item) => {
      const itemCost =
        Number(item.purchasePrice) +
        Number(item.shippingCost || 0) +
        Number(item.otherFees || 0);
      return sum + itemCost * item.quantity;
    }, 0);

    // Get sales stats
    const salesAgg = await prisma.sale.aggregate({
      _sum: {
        netProfit: true,
      },
      _count: true,
    });

    return {
      totalItems: Number(inventoryAgg._sum.quantity || 0),
      totalValue: totalValue,
      totalProfit: Number(salesAgg._sum.netProfit || 0),
      itemsSold: salesAgg._count,
    };
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return null;
  }
}

export async function getInventoryItem(id: string) {
  try {
    return await prisma.inventoryItem.findUnique({
      where: { id: Number.parseInt(id, 10) },
      include: {
        product: true,
        sales: true,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory item:", error);
    return null;
  }
}

export async function createInventoryItem(data: {
  productId: number;
  quantity?: number;
  condition?: string;
  gradeInfo?: string;
  location?: string;
  purchaseDate: string;
  purchasePrice: number;
  purchasePlatform?: string;
  shippingCost?: number;
  otherFees?: number;
  notes?: string;
}) {
  try {
    return await prisma.inventoryItem.create({
      data: {
        productId: data.productId,
        quantity: data.quantity || 1,
        condition: data.condition || "Sealed",
        gradeInfo: data.gradeInfo,
        location: data.location,
        purchaseDate: new Date(data.purchaseDate),
        purchasePrice: Number.parseFloat(data.purchasePrice.toString()),
        purchasePlatform: data.purchasePlatform,
        shippingCost: data.shippingCost
          ? Number.parseFloat(data.shippingCost.toString())
          : 0,
        otherFees: data.otherFees
          ? Number.parseFloat(data.otherFees.toString())
          : 0,
        notes: data.notes,
        status: "In Stock",
      },
      include: {
        product: true,
      },
    });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    throw error;
  }
}

export async function updateInventoryItem(
  id: string,
  data: Record<string, unknown>,
) {
  try {
    const updateData = data;

    // Convert date strings to Date objects if present
    if (typeof updateData.purchaseDate === "string") {
      updateData.purchaseDate = new Date(updateData.purchaseDate);
    }

    // Convert numeric strings to numbers
    const numericFields = [
      "purchasePrice",
      "shippingCost",
      "otherFees",
      "quantity",
    ];
    numericFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        const value = updateData[field];
        const normalizedValue =
          typeof value === "string" || typeof value === "number" ? value : null;

        if (normalizedValue === null) {
          return;
        }

        updateData[field] =
          field === "quantity"
            ? Number.parseInt(String(normalizedValue), 10)
            : Number.parseFloat(String(normalizedValue));
      }
    });

    return await prisma.inventoryItem.update({
      where: { id: Number.parseInt(id, 10) },
      data: updateData as Prisma.InventoryItemUpdateInput,
      include: {
        product: true,
      },
    });
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return null;
  }
}

export async function deleteInventoryItem(id: string) {
  try {
    await prisma.inventoryItem.delete({
      where: { id: Number.parseInt(id, 10) },
    });
    return true;
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return false;
  }
}
