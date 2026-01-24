import { prisma } from "@pokemon/shared";

export async function getAllSales(filters?: {
  startDate?: string;
  endDate?: string;
  platform?: string;
}) {
  try {
    const where: any = {};

    if (filters?.startDate && filters?.endDate) {
      where.saleDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    if (filters?.platform) {
      where.platform = filters.platform;
    }

    return await prisma.sale.findMany({
      where,
      include: {
        inventoryItem: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        saleDate: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching sales:", error);
    return null;
  }
}

export async function getSale(id: string) {
  try {
    return await prisma.sale.findUnique({
      where: { id: parseInt(id) },
      include: {
        inventoryItem: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching sale:", error);
    return null;
  }
}

export async function createSale(data: {
  inventoryItemId: number;
  saleDate: string;
  salePrice: number;
  quantitySold?: number;
  platform?: string;
  buyerInfo?: string;
  shippingCost?: number;
  platformFees?: number;
  paymentProcessingFees?: number;
  otherFees?: number;
  trackingNumber?: string;
  notes?: string;
}) {
  try {
    // Get inventory item to calculate profit
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id: data.inventoryItemId },
    });

    if (!inventoryItem) {
      throw new Error("Inventory item not found");
    }

    // Calculate costs and profit
    const totalCost =
      Number(inventoryItem.purchasePrice) +
      Number(inventoryItem.shippingCost || 0) +
      Number(inventoryItem.otherFees || 0);

    const totalFees =
      Number(data.shippingCost || 0) +
      Number(data.platformFees || 0) +
      Number(data.paymentProcessingFees || 0) +
      Number(data.otherFees || 0);

    const grossProfit = Number(data.salePrice) - totalCost;
    const netProfit = grossProfit - totalFees;
    const profitMargin = (netProfit / Number(data.salePrice)) * 100;

    // Create sale and update inventory status in a transaction
    const [sale] = await prisma.$transaction([
      prisma.sale.create({
        data: {
          inventoryItemId: data.inventoryItemId,
          saleDate: new Date(data.saleDate),
          salePrice: parseFloat(data.salePrice.toString()),
          quantitySold: data.quantitySold || 1,
          platform: data.platform,
          buyerInfo: data.buyerInfo,
          shippingCost: data.shippingCost
            ? parseFloat(data.shippingCost.toString())
            : 0,
          platformFees: data.platformFees
            ? parseFloat(data.platformFees.toString())
            : 0,
          paymentProcessingFees: data.paymentProcessingFees
            ? parseFloat(data.paymentProcessingFees.toString())
            : 0,
          otherFees: data.otherFees ? parseFloat(data.otherFees.toString()) : 0,
          trackingNumber: data.trackingNumber,
          grossProfit,
          netProfit,
          profitMargin,
          notes: data.notes,
        },
        include: {
          inventoryItem: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.inventoryItem.update({
        where: { id: data.inventoryItemId },
        data: { status: "Sold" },
      }),
    ]);

    return sale;
  } catch (error) {
    console.error("Error creating sale:", error);
    throw error;
  }
}

export async function updateSale(id: string, data: any) {
  try {
    // Convert date strings to Date objects if present
    if (data.saleDate) {
      data.saleDate = new Date(data.saleDate);
    }

    // Convert numeric strings to numbers
    const numericFields = [
      "salePrice",
      "shippingCost",
      "platformFees",
      "paymentProcessingFees",
      "otherFees",
      "grossProfit",
      "netProfit",
      "profitMargin",
      "quantitySold",
    ];

    numericFields.forEach((field) => {
      if (data[field] !== undefined) {
        data[field] = parseFloat(data[field]);
      }
    });

    return await prisma.sale.update({
      where: { id: parseInt(id) },
      data,
      include: {
        inventoryItem: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error updating sale:", error);
    return null;
  }
}

export async function deleteSale(id: string) {
  try {
    // Get the sale to find the inventory item
    const sale = await prisma.sale.findUnique({
      where: { id: parseInt(id) },
    });

    if (!sale) {
      return false;
    }

    // Delete sale and revert inventory status
    await prisma.$transaction([
      prisma.sale.delete({
        where: { id: parseInt(id) },
      }),
      prisma.inventoryItem.update({
        where: { id: sale.inventoryItemId },
        data: { status: "In Stock" },
      }),
    ]);

    return true;
  } catch (error) {
    console.error("Error deleting sale:", error);
    return false;
  }
}

export async function getSalesSummary(filters?: {
  startDate?: string;
  endDate?: string;
}) {
  try {
    const where: any = {};

    if (filters?.startDate && filters?.endDate) {
      where.saleDate = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    return await prisma.sale.aggregate({
      where,
      _sum: {
        salePrice: true,
        grossProfit: true,
        netProfit: true,
        platformFees: true,
        shippingCost: true,
      },
      _avg: {
        profitMargin: true,
      },
      _count: true,
    });
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    return null;
  }
}

export async function getTopProducts(limit: number = 10) {
  try {
    const topProducts = await prisma.sale.groupBy({
      by: ["inventoryItemId"],
      _sum: {
        netProfit: true,
      },
      _count: true,
      orderBy: {
        _sum: {
          netProfit: "desc",
        },
      },
      take: limit,
    });

    // Enrich with product details
    const enrichedProducts = await Promise.all(
      topProducts.map(async (item: any) => {
        const inventoryItem = await prisma.inventoryItem.findUnique({
          where: { id: item.inventoryItemId },
          include: { product: true },
        });

        return {
          product: inventoryItem?.product,
          totalProfit: item._sum.netProfit,
          salesCount: item._count,
        };
      }),
    );

    return enrichedProducts;
  } catch (error) {
    console.error("Error fetching top products:", error);
    return null;
  }
}
