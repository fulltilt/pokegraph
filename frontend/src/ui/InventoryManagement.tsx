import { useState } from "react";
import {
  Package,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Calendar,
  MapPin,
} from "lucide-react";

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sample data
  const [inventory, setInventory] = useState([
    {
      id: 1,
      upc: "820650809903",
      name: "Scarlet & Violet Booster Box",
      set: "Scarlet & Violet",
      quantity: 2,
      condition: "Sealed",
      purchaseDate: "2024-01-15",
      purchasePrice: 120.0,
      location: "Storage Box A",
      status: "In Stock",
      totalCost: 125.0,
    },
    {
      id: 2,
      upc: "820650809880",
      name: "Scarlet & Violet Elite Trainer Box",
      set: "Scarlet & Violet",
      quantity: 3,
      condition: "Sealed",
      purchaseDate: "2024-02-01",
      purchasePrice: 42.0,
      location: "Shelf 2",
      status: "In Stock",
      totalCost: 44.5,
    },
    {
      id: 3,
      upc: "820650856983",
      name: "Paldean Fates Booster Box",
      set: "Paldean Fates",
      quantity: 1,
      condition: "Sealed",
      purchaseDate: "2023-12-20",
      purchasePrice: 130.0,
      location: "Storage Box B",
      status: "Sold",
      totalCost: 135.0,
    },
  ]);

  const [sales, setSales] = useState([
    {
      id: 1,
      inventoryItemId: 3,
      productName: "Paldean Fates Booster Box",
      saleDate: "2024-01-10",
      salePrice: 165.0,
      costBasis: 135.0,
      netProfit: 25.0,
      platform: "eBay",
      fees: 5.0,
    },
  ]);

  const [newProduct, setNewProduct] = useState({
    upc: "",
    name: "",
    set: "",
    productType: "Booster Box",
  });

  const [newInventory, setNewInventory] = useState({
    quantity: 1,
    condition: "Sealed",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchasePrice: "",
    platform: "",
    location: "",
    notes: "",
  });

  const [newSale, setNewSale] = useState({
    saleDate: new Date().toISOString().split("T")[0],
    salePrice: "",
    platform: "",
    shippingCost: 0,
    platformFees: 0,
    notes: "",
  });

  // Calculate statistics
  const stats = {
    totalItems: inventory
      .filter((i) => i.status === "In Stock")
      .reduce((sum, i) => sum + i.quantity, 0),
    totalValue: inventory
      .filter((i) => i.status === "In Stock")
      .reduce((sum, i) => sum + i.totalCost * i.quantity, 0),
    totalProfit: sales.reduce((sum, s) => sum + s.netProfit, 0),
    itemsSold: sales.length,
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.upc.includes(searchTerm) ||
      item.set.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddInventory = () => {
    // This would integrate with your database
    const newItem = {
      id: inventory.length + 1,
      ...newProduct,
      ...newInventory,
      status: "In Stock",
      totalCost: parseFloat(newInventory.purchasePrice),
    };
    setInventory([...inventory, newItem]);
    setShowAddModal(false);
    // Reset forms
    setNewProduct({ upc: "", name: "", set: "", productType: "Booster Box" });
    setNewInventory({
      quantity: 1,
      condition: "Sealed",
      purchaseDate: new Date().toISOString().split("T")[0],
      purchasePrice: "",
      platform: "",
      location: "",
      notes: "",
    });
  };

  const handleRecordSale = () => {
    if (!selectedItem) return;

    const costBasis = selectedItem.totalCost;
    const revenue = parseFloat(newSale.salePrice);
    const totalFees =
      parseFloat(newSale.shippingCost || 0) +
      parseFloat(newSale.platformFees || 0);
    const netProfit = revenue - costBasis - totalFees;

    const sale = {
      id: sales.length + 1,
      inventoryItemId: selectedItem.id,
      productName: selectedItem.name,
      saleDate: newSale.saleDate,
      salePrice: revenue,
      costBasis,
      netProfit,
      platform: newSale.platform,
      fees: totalFees,
    };

    setSales([...sales, sale]);

    // Update inventory status
    setInventory(
      inventory.map((item) =>
        item.id === selectedItem.id ? { ...item, status: "Sold" } : item,
      ),
    );

    setShowSaleModal(false);
    setSelectedItem(null);
    setNewSale({
      saleDate: new Date().toISOString().split("T")[0],
      salePrice: "",
      platform: "",
      shippingCost: 0,
      platformFees: 0,
      notes: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pokemon Inventory Manager
          </h1>
          <p className="text-gray-600">
            Track your collection, purchases, and sales
          </p>
        </div>

        {/* Stats Cards */}
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
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

          {/* Inventory Tab */}
          {activeTab === "inventory" && (
            <div className="p-6">
              {/* Search and Filter Bar */}
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Sold">Sold</option>
                  <option value="Reserved">Reserved</option>
                </select>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  <Plus size={20} />
                  Add Item
                </button>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        UPC
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
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.set}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">
                          {item.upc}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm">{item.condition}</td>
                        <td className="px-4 py-3 text-sm">{item.location}</td>
                        <td className="px-4 py-3 text-sm">
                          {item.purchaseDate}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          ${item.totalCost.toFixed(2)}
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
                                  setSelectedItem(item);
                                  setShowSaleModal(true);
                                }}
                                className="text-green-600 hover:text-green-800"
                                title="Record Sale"
                              >
                                <DollarSign size={18} />
                              </button>
                            )}
                            <button
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <div className="p-6">
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
                        Fees
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Net Profit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {sale.productName}
                        </td>
                        <td className="px-4 py-3 text-sm">{sale.saleDate}</td>
                        <td className="px-4 py-3 text-sm">{sale.platform}</td>
                        <td className="px-4 py-3 text-sm font-medium">
                          ${sale.salePrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          ${sale.costBasis.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          ${sale.fees.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-medium ${sale.netProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            ${sale.netProfit.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Add Item Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  Add New Inventory Item
                </h2>

                <div className="space-y-6">
                  {/* Product Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Product Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          UPC *
                        </label>
                        <input
                          type="text"
                          value={newProduct.upc}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              upc: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter UPC code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Booster Box</option>
                          <option>Elite Trainer Box</option>
                          <option>Booster Pack</option>
                          <option>Collection Box</option>
                          <option>Tin</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={newProduct.name}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Scarlet & Violet Booster Box"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Set Name *
                        </label>
                        <input
                          type="text"
                          value={newProduct.set}
                          onChange={(e) =>
                            setNewProduct({
                              ...newProduct,
                              set: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Scarlet & Violet"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Purchase Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Purchase Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newInventory.quantity}
                          onChange={(e) =>
                            setNewInventory({
                              ...newInventory,
                              quantity: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Sealed</option>
                          <option>Opened</option>
                          <option>Damaged - Minor</option>
                          <option>Damaged - Major</option>
                          <option>Graded</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Platform
                        </label>
                        <input
                          type="text"
                          value={newInventory.platform}
                          onChange={(e) =>
                            setNewInventory({
                              ...newInventory,
                              platform: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Amazon, GameStop"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Box A, Shelf 2"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notes
                        </label>
                        <textarea
                          value={newInventory.notes}
                          onChange={(e) =>
                            setNewInventory({
                              ...newInventory,
                              notes: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows="2"
                          placeholder="Any additional notes..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddInventory}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    Add to Inventory
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Record Sale Modal */}
        {showSaleModal && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-lg w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Record Sale</h2>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900">
                    {selectedItem.name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedItem.set}</p>
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
                      Notes
                    </label>
                    <textarea
                      value={newSale.notes}
                      onChange={(e) =>
                        setNewSale({ ...newSale, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Additional sale details..."
                    />
                  </div>

                  {newSale.salePrice && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Sale Price:</span>
                        <span className="font-medium">
                          ${parseFloat(newSale.salePrice || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Cost Basis:</span>
                        <span className="font-medium">
                          -${selectedItem.totalCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Total Fees:</span>
                        <span className="font-medium">
                          -$
                          {(
                            parseFloat(newSale.shippingCost || 0) +
                            parseFloat(newSale.platformFees || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-semibold">
                        <span>Net Profit:</span>
                        <span
                          className={
                            parseFloat(newSale.salePrice) -
                              selectedItem.totalCost -
                              parseFloat(newSale.shippingCost || 0) -
                              parseFloat(newSale.platformFees || 0) >=
                            0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          $
                          {(
                            parseFloat(newSale.salePrice) -
                            selectedItem.totalCost -
                            parseFloat(newSale.shippingCost || 0) -
                            parseFloat(newSale.platformFees || 0)
                          ).toFixed(2)}
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
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
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

export default InventoryManagement;
