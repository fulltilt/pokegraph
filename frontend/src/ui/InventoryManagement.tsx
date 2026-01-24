import React, { useState, useEffect } from "react";
import {
  Package,
  DollarSign,
  TrendingUp,
  Search,
  // Plus,
  // Edit2,
  // Trash2,
  Scan,
} from "lucide-react";
import BarcodeScanner from "@/components/BarcodeScanner";

// Type definitions
interface Product {
  id: number;
  upc: string;
  name: string;
  productType?: string;
  setName?: string;
  releaseDate?: Date | string;
  msrp?: number;
  imageUrl?: string;
  description?: string;
}

interface InventoryItem {
  id: number;
  productId: number;
  quantity: number;
  condition: string;
  gradeInfo?: string;
  location?: string;
  purchaseDate: Date | string;
  purchasePrice: number;
  purchasePlatform?: string;
  shippingCost?: number;
  otherFees?: number;
  notes?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  product?: Product;
}

interface Sale {
  id: number;
  inventoryItemId: number;
  saleDate: Date | string;
  salePrice: number;
  quantitySold: number;
  platform?: string;
  buyerInfo?: string;
  shippingCost?: number;
  platformFees?: number;
  paymentProcessingFees?: number;
  otherFees?: number;
  trackingNumber?: string;
  grossProfit?: number;
  netProfit?: number;
  profitMargin?: number;
  notes?: string;
  inventoryItem?: InventoryItem;
}

interface InventoryStats {
  totalItems: number;
  totalValue: number;
  totalProfit: number;
  itemsSold: number;
}

interface NewProductForm {
  upc: string;
  name: string;
  setName: string;
  productType: string;
}

interface NewInventoryForm {
  quantity: number;
  condition: string;
  purchaseDate: string;
  purchasePrice: string;
  purchasePlatform: string;
  shippingCost: number;
  otherFees: number;
  location: string;
  notes: string;
}

interface NewSaleForm {
  saleDate: string;
  salePrice: string;
  platform: string;
  shippingCost: number;
  platformFees: number;
  paymentProcessingFees: number;
  notes: string;
}

interface InventoryItemWithTotal extends InventoryItem {
  totalCost: number;
}

interface SaleProfit {
  salePrice: number;
  costBasis: number;
  totalFees: number;
  netProfit: number;
}

type ActiveView = "list" | "scan" | "add-product" | "add-inventory";
type ActiveTab = "inventory" | "sales";
type FilterStatus = "all" | "In Stock" | "Sold" | "Reserved";

const InventoryPage: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>("list");
  const [activeTab, setActiveTab] = useState<ActiveTab>("inventory");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [, setScannedUPC] = useState<string>("");
  const [selectedItem, setSelectedItem] =
    useState<InventoryItemWithTotal | null>(null);
  const [showSaleModal, setShowSaleModal] = useState<boolean>(false);

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    totalValue: 0,
    totalProfit: 0,
    itemsSold: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    upc: "",
    name: "",
    setName: "",
    productType: "Booster Box",
  });

  const [newInventory, setNewInventory] = useState<NewInventoryForm>({
    quantity: 1,
    condition: "Sealed",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchasePrice: "",
    purchasePlatform: "",
    shippingCost: 0,
    otherFees: 0,
    location: "",
    notes: "",
  });

  const [newSale, setNewSale] = useState<NewSaleForm>({
    saleDate: new Date().toISOString().split("T")[0],
    salePrice: "",
    platform: "",
    shippingCost: 0,
    platformFees: 0,
    paymentProcessingFees: 0,
    notes: "",
  });

  useEffect(() => {
    fetchInventory();
    fetchSales();
    fetchStats();
  }, []);

  const fetchInventory = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch("/api/inventory");
      const data: InventoryItem[] = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async (): Promise<void> => {
    try {
      const response = await fetch("/api/sales");
      const data: Sale[] = await response.json();
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  const fetchStats = async (): Promise<void> => {
    try {
      const response = await fetch("/api/inventory/stats");
      const data: InventoryStats = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleScanComplete = async (upc: string): Promise<void> => {
    setScannedUPC(upc);
    console.log(upc);
    try {
      const response = await fetch(`/api/products/upc/${upc}`);

      if (response.ok) {
        const product: Product = await response.json();
        setNewProduct({
          upc: product.upc,
          name: product.name,
          setName: product.setName || "",
          productType: product.productType || "Booster Box",
        });
        setActiveView("add-inventory");
      } else {
        setNewProduct({
          ...newProduct,
          upc: upc,
        });
        setActiveView("add-product");
      }
    } catch (error) {
      console.error("Error checking product:", error);
      setNewProduct({
        ...newProduct,
        upc: upc,
      });
      setActiveView("add-product");
    }
  };

  const handleAddProduct = async (): Promise<void> => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        setActiveView("add-inventory");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    }
  };

  const handleAddInventory = async (): Promise<void> => {
    try {
      const productResponse = await fetch(
        `/api/products/upc/${newProduct.upc}`,
      );
      const product: Product = await productResponse.json();

      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          ...newInventory,
          purchasePrice: parseFloat(newInventory.purchasePrice),
        }),
      });

      if (response.ok) {
        await fetchInventory();
        await fetchStats();
        resetForms();
        setActiveView("list");
      }
    } catch (error) {
      console.error("Error adding inventory:", error);
      alert("Error adding inventory. Please try again.");
    }
  };

  const handleRecordSale = async (): Promise<void> => {
    if (!selectedItem) return;

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inventoryItemId: selectedItem.id,
          ...newSale,
          salePrice: parseFloat(newSale.salePrice),
        }),
      });

      if (response.ok) {
        await fetchInventory();
        await fetchSales();
        await fetchStats();
        setShowSaleModal(false);
        setSelectedItem(null);
        setNewSale({
          saleDate: new Date().toISOString().split("T")[0],
          salePrice: "",
          platform: "",
          shippingCost: 0,
          platformFees: 0,
          paymentProcessingFees: 0,
          notes: "",
        });
      }
    } catch (error) {
      console.error("Error recording sale:", error);
      alert("Error recording sale. Please try again.");
    }
  };

  const resetForms = (): void => {
    setNewProduct({
      upc: "",
      name: "",
      setName: "",
      productType: "Booster Box",
    });
    setNewInventory({
      quantity: 1,
      condition: "Sealed",
      purchaseDate: new Date().toISOString().split("T")[0],
      purchasePrice: "",
      purchasePlatform: "",
      shippingCost: 0,
      otherFees: 0,
      location: "",
      notes: "",
    });
    setScannedUPC("");
  };

  const filteredInventory: InventoryItem[] = inventory.filter((item) => {
    const matchesSearch =
      item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.upc?.includes(searchTerm) ||
      item.product?.setName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const calculateSaleProfit = (): SaleProfit | null => {
    if (!selectedItem || !newSale.salePrice) return null;

    const totalCost =
      Number(selectedItem.purchasePrice || 0) +
      Number(selectedItem.shippingCost || 0) +
      Number(selectedItem.otherFees || 0);
    const totalFees =
      Number(newSale.shippingCost || 0) +
      Number(newSale.platformFees || 0) +
      Number(newSale.paymentProcessingFees || 0);
    const netProfit = Number(newSale.salePrice) - totalCost - totalFees;

    return {
      salePrice: Number(newSale.salePrice),
      costBasis: totalCost,
      totalFees,
      netProfit,
    };
  };

  const calculateTotalCost = (item: InventoryItem): number => {
    return (
      Number(item.purchasePrice || 0) +
      Number(item.shippingCost || 0) +
      Number(item.otherFees || 0)
    );
  };

  if (activeView === "scan") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => setActiveView("list")}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
            >
              ← Back to Inventory
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Scan Product UPC
            </h1>
          </div>
          <BarcodeScanner
            onScanComplete={handleScanComplete}
            onCancel={() => setActiveView("list")}
          />
        </div>
      </div>
    );
  }

  if (activeView === "add-product") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => {
                resetForms();
                setActiveView("list");
              }}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
            >
              ← Cancel
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Add New Product
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              UPC: {newProduct.upc}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Scarlet & Violet Booster Box"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Set Name *
                </label>
                <input
                  type="text"
                  value={newProduct.setName}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, setName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Scarlet & Violet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Type *
                </label>
                <select
                  value={newProduct.productType}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      productType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option>Booster Box</option>
                  <option>Elite Trainer Box</option>
                  <option>Booster Pack</option>
                  <option>Collection Box</option>
                  <option>Tin</option>
                  <option>Premium Collection</option>
                  <option>Theme Deck</option>
                  <option>Battle Deck</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    resetForms();
                    setActiveView("list");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={!newProduct.name || !newProduct.setName}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  Continue to Add Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === "add-inventory") {
    const totalCost =
      parseFloat(newInventory.purchasePrice || "0") +
      newInventory.shippingCost +
      newInventory.otherFees;

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => {
                resetForms();
                setActiveView("list");
              }}
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
            >
              ← Cancel
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Add to Inventory
            </h1>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <p className="font-semibold text-gray-900 dark:text-white">
                {newProduct.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {newProduct.setName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                UPC: {newProduct.upc}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newInventory.quantity}
                    onChange={(e) =>
                      setNewInventory({
                        ...newInventory,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Condition *
                  </label>
                  <select
                    value={newInventory.condition}
                    onChange={(e) =>
                      setNewInventory({
                        ...newInventory,
                        condition: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option>Sealed</option>
                    <option>Opened</option>
                    <option>Damaged - Minor</option>
                    <option>Damaged - Major</option>
                    <option>Graded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    value={newInventory.purchaseDate}
                    onChange={(e) =>
                      setNewInventory({
                        ...newInventory,
                        purchaseDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newInventory.purchasePrice}
                    onChange={(e) =>
                      setNewInventory({
                        ...newInventory,
                        purchasePrice: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Shipping Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newInventory.shippingCost}
                    onChange={(e) =>
                      setNewInventory({
                        ...newInventory,
                        shippingCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Other Fees
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newInventory.otherFees}
                    onChange={(e) =>
                      setNewInventory({
                        ...newInventory,
                        otherFees: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Platform
                </label>
                <input
                  type="text"
                  value={newInventory.purchasePlatform}
                  onChange={(e) =>
                    setNewInventory({
                      ...newInventory,
                      purchasePlatform: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Amazon, GameStop, Local Store"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Storage Location
                </label>
                <input
                  type="text"
                  value={newInventory.location}
                  onChange={(e) =>
                    setNewInventory({
                      ...newInventory,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Box A, Shelf 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={newInventory.notes}
                  onChange={(e) =>
                    setNewInventory({ ...newInventory, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Any additional notes..."
                />
              </div>

              {newInventory.purchasePrice && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Cost per Unit:
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalCost.toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    resetForms();
                    setActiveView("list");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddInventory}
                  disabled={!newInventory.purchasePrice}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 dark:disabled:bg-gray-600"
                >
                  Add to Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pokemon Inventory Manager
          </h1>
          <p className="text-gray-600">
            Track your collection, purchases, and sales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalItems}
                </p>
              </div>
              <Package className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalValue.toFixed(2)}
                </p>
              </div>
              <DollarSign className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Profit</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalProfit.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.itemsSold}
                </p>
              </div>
              <Package className="text-orange-500" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("inventory")}
                className={`px-6 py-3 font-medium ${
                  activeTab === "inventory"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`px-6 py-3 font-medium ${
                  activeTab === "sales"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sales History
              </button>
            </nav>
          </div>

          {activeTab === "inventory" && (
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-3 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, UPC, or set..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Sold">Sold</option>
                  <option value="Reserved">Reserved</option>
                </select>

                <button
                  onClick={() => setActiveView("scan")}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  <Scan size={20} />
                  Scan UPC
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading inventory...</p>
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-500 mb-4">No inventory items found</p>
                  <button
                    onClick={() => setActiveView("scan")}
                    className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                  >
                    <Scan size={20} />
                    Scan Your First Item
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Condition
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Purchase
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Cost
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredInventory.map((item) => {
                        const totalCost = calculateTotalCost(item);
                        return (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {item.product?.name || "Unknown"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.product?.setName || ""}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.condition}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.location || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(item.purchaseDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              ${totalCost.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${
                                  item.status === "In Stock"
                                    ? "bg-green-100 text-green-800"
                                    : item.status === "Sold"
                                      ? "bg-gray-100 text-gray-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {item.status === "In Stock" && (
                                  <button
                                    onClick={() => {
                                      setSelectedItem({
                                        ...item,
                                        totalCost,
                                      });
                                      setShowSaleModal(true);
                                    }}
                                    className="text-green-600 hover:text-green-800"
                                    title="Record Sale"
                                  >
                                    <DollarSign size={18} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "sales" && (
            <div className="p-6">
              {sales.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign
                    className="mx-auto text-gray-400 mb-4"
                    size={48}
                  />
                  <p className="text-gray-500">No sales recorded yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sale Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Platform
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sale Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Cost
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Net Profit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sales.map((sale) => {
                        const costBasis = sale.inventoryItem
                          ? calculateTotalCost(sale.inventoryItem)
                          : 0;

                        return (
                          <tr key={sale.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">
                              {sale.inventoryItem?.product?.name || "Unknown"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(sale.saleDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {sale.platform || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              ${Number(sale.salePrice).toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              ${costBasis.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`font-medium ${Number(sale.netProfit) >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                ${Number(sale.netProfit || 0).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {showSaleModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Record Sale</h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900">
                    {selectedItem.product?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedItem.product?.setName}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Cost Basis: ${selectedItem.totalCost.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Date *
                      </label>
                      <input
                        type="date"
                        value={newSale.saleDate}
                        onChange={(e) =>
                          setNewSale({ ...newSale, saleDate: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSale.salePrice}
                        onChange={(e) =>
                          setNewSale({ ...newSale, salePrice: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Platform
                    </label>
                    <input
                      type="text"
                      value={newSale.platform}
                      onChange={(e) =>
                        setNewSale({ ...newSale, platform: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., eBay, TCGPlayer, Local"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSale.shippingCost}
                        onChange={(e) =>
                          setNewSale({
                            ...newSale,
                            shippingCost: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Platform Fees
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSale.platformFees}
                        onChange={(e) =>
                          setNewSale({
                            ...newSale,
                            platformFees: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Fees
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newSale.paymentProcessingFees}
                        onChange={(e) =>
                          setNewSale({
                            ...newSale,
                            paymentProcessingFees:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={newSale.notes}
                      onChange={(e) =>
                        setNewSale({ ...newSale, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Additional sale details..."
                    />
                  </div>

                  {newSale.salePrice && calculateSaleProfit() && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Sale Price:</span>
                        <span className="font-medium">
                          ${calculateSaleProfit()!.salePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cost Basis:</span>
                        <span className="font-medium">
                          -${calculateSaleProfit()!.costBasis.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Fees:</span>
                        <span className="font-medium">
                          -${calculateSaleProfit()!.totalFees.toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-semibold">
                        <span>Net Profit:</span>
                        <span
                          className={
                            calculateSaleProfit()!.netProfit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          ${calculateSaleProfit()!.netProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowSaleModal(false);
                      setSelectedItem(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRecordSale}
                    disabled={!newSale.salePrice}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-300"
                  >
                    Record Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default InventoryPage;
