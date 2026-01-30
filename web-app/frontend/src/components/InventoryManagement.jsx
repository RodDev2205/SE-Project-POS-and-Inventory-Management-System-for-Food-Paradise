// ------------- FULL UPDATED INVENTORY WITH PORTION FORMULA UI -------------
import React, { useState } from 'react';
import { Package, AlertTriangle, ChevronUp, ChevronDown, Plus, Edit, FlaskConical } from 'lucide-react';

// --- Placeholder Data ---
const initialInventory = [
  { id: 101, name: "All-Purpose Flour", unit: "kg", currentStock: 45, reorderLevel: 50, supplier: "Bulk Foods Co.", lastUpdated: "2025-11-20" },
  { id: 102, name: "Fresh Salmon Fillets", unit: "grams", currentStock: 8000, reorderLevel: 10000, supplier: "Seaside Supply", lastUpdated: "2025-11-21" },
  { id: 103, name: "Chicken Breasts", unit: "kg", currentStock: 15, reorderLevel: 20, supplier: "Farm Fresh Meats", lastUpdated: "2025-11-21" },
  { id: 104, name: "Milk (Whole)", unit: "liters", currentStock: 8, reorderLevel: 10, supplier: "Dairy King", lastUpdated: "2025-11-22" },
  { id: 105, name: "Cooking Oil", unit: "liters", currentStock: 4, reorderLevel: 5, supplier: "Bulk Foods Co.", lastUpdated: "2025-11-20" },
  { id: 106, name: "Coffee Beans (Arabica)", unit: "kg", currentStock: 2, reorderLevel: 5, supplier: "Bean Traders", lastUpdated: "2025-11-22" },
];

// --- Portion formula placeholder data ---
const initialPortions = [
  { id: 1, name: "Chicken Slice", ingredientId: 103, qty: 0.25, unit: "kg" },
  { id: 2, name: "Rice Scoop", ingredientId: 101, qty: 120, unit: "grams" },
];

const InventoryManagement = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [portions, setPortions] = useState(initialPortions);
  const [activeTab, setActiveTab] = useState("stock"); // NEW
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showLowStockModal, setShowLowStockModal] = useState(false);

  // --- Portion modal states (NEW)
  const [showPortionModal, setShowPortionModal] = useState(false);
  const [editingPortion, setEditingPortion] = useState(null);

  const lowStockItems = inventory.filter(item => item.currentStock < item.reorderLevel);

  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending'
      ? <ChevronUp className="w-4 h-4 ml-1" />
      : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const tableHeaders = [
    { key: 'name', label: 'Ingredient Name' },
    { key: 'unit', label: 'Unit' },
    { key: 'currentStock', label: 'Current Stock' },
    { key: 'reorderLevel', label: 'Reorder Level' },
    { key: 'supplier', label: 'Supplier' },
  ];

  // --- Save Portion Formula (NEW)
  const handleSavePortion = (portion) => {
    if (portion.id) {
      setPortions(portions.map(p => p.id === portion.id ? portion : p));
    } else {
      setPortions([...portions, { ...portion, id: Date.now() }]);
    }
    setShowPortionModal(false);
    setEditingPortion(null);
  };

  // --- Portion Formula Modal UI (NEW)
  const PortionFormulaModal = ({ portion, onSave, onClose }) => {
    const [name, setName] = useState(portion?.name || "");
    const [ingredientId, setIngredientId] = useState(portion?.ingredientId || "");
    const [qty, setQty] = useState(portion?.qty || "");
    const selectedIngredient = inventory.find(i => i.id === Number(ingredientId));
    const unit = selectedIngredient?.unit || "";

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({
        id: portion?.id,
        name,
        ingredientId: Number(ingredientId),
        qty: Number(qty),
        unit
      });
    };

    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black/20 backdrop-blur-sm z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl w-96">
          <h3 className="text-xl font-bold mb-4">
            {portion ? "Edit Portion Formula" : "Add Portion Formula"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input className="w-full p-3 border rounded-lg" placeholder="Portion Name"
              value={name} onChange={(e) => setName(e.target.value)} required />

            {/* Ingredient dropdown */}
            <select
              className="w-full p-3 border rounded-lg"
              value={ingredientId}
              onChange={(e) => setIngredientId(e.target.value)}
              required
            >
              <option value="">Select Ingredient</option>
              {inventory.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name}</option>
              ))}
            </select>

            <input className="w-full p-3 border rounded-lg"
              type="number"
              placeholder="Quantity"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              required />

            <div className="text-gray-600 text-sm">Unit: <strong>{unit || "—"}</strong></div>

            <div className="flex justify-end gap-3">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onClose}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
                {portion ? "Save Changes" : "Add Portion"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------------
  // --------------------------- RENDERING ------------------------------
  // -------------------------------------------------------------------

  return (
    <div className="space-y-8">

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800">Ingredient Inventory Management</h2>

      {/* --- NEW TAB MENU --- */}
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setActiveTab("stock")}
          className={`px-4 py-2 rounded-t-lg font-semibold ${
            activeTab === "stock"
              ? "bg-green-700 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Current Stock
        </button>

        <button
          onClick={() => setActiveTab("portion")}
          className={`px-4 py-2 rounded-t-lg font-semibold flex items-center gap-2 ${
            activeTab === "portion"
              ? "bg-green-700 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <FlaskConical className="w-4 h-4" /> Portion Formulas
        </button>
      </div>

      {/* ======================= TAB CONTENT ========================= */}

      {activeTab === "stock" && (
        <>
          {/* Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="md:col-span-2 bg-[#FFCDD2] p-6 rounded-xl shadow-lg border-2 border-red-300 flex items-center justify-between cursor-pointer hover:bg-red-100 transition"
              onClick={() => setShowLowStockModal(true)}
            >
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-700 mr-4" />
                <div>
                  <p className="text-xl font-bold text-red-800">{lowStockItems.length} Low Stock Items</p>
                  <p className="text-sm text-red-700">Immediate attention required! Click to view.</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setShowAddModal(true)}
              className="bg-[#E8F5E9] p-6 rounded-xl shadow-lg flex flex-col justify-center items-center cursor-pointer hover:bg-green-100 transition"
            >
              <Plus className="w-6 h-6 text-green-800 mb-2" />
              <p className="text-lg font-semibold text-green-800">Add New Ingredient</p>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold flex items-center text-gray-800">
                <Package className="w-5 h-5 mr-2 text-[#1B5E20]" /> Current Stock List
              </h3>

              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map(header => (
                      <th key={header.key} className="px-6 py-3 cursor-pointer">
                        <div onClick={() => requestSort(header.key)} className="flex items-center text-xs font-medium text-gray-500 uppercase">
                          {header.label}{getSortIcon(header.key)}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedItems.map(item => {
                    const isLow = item.currentStock < item.reorderLevel;
                    return (
                      <tr key={item.id} className={isLow ? "bg-yellow-50" : ""}>
                        <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-sm">{item.unit}</td>
                        <td className={`px-6 py-4 text-sm font-bold ${isLow ? "text-red-600" : "text-green-600"}`}>{item.currentStock}</td>
                        <td className="px-6 py-4 text-sm">{item.reorderLevel}</td>
                        <td className="px-6 py-4 text-sm">{item.supplier}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => setEditingItem(item)} className="text-green-700">
                            <Edit className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {sortedItems.length === 0 && (
                <p className="text-center text-gray-500 p-4">No ingredients found.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ==================== PORTION FORMULA TAB ==================== */}
      {activeTab === "portion" && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold flex items-center text-gray-800">
              <FlaskConical className="w-5 h-5 mr-2 text-green-800" /> Portion Formulas
            </h3>

            <button
              onClick={() => setShowPortionModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Portion
            </button>
          </div>

          {/* Portion Table */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Portion Name</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ingredient</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {portions.map(p => {
                const ingredient = inventory.find(i => i.id === p.ingredientId);
                return (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm font-medium">{p.name}</td>
                    <td className="px-6 py-4 text-sm">{ingredient?.name}</td>
                    <td className="px-6 py-4 text-sm">{p.qty}</td>
                    <td className="px-6 py-4 text-sm">{p.unit}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setEditingPortion(p);
                          setShowPortionModal(true);
                        }}
                        className="text-green-700"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {portions.length === 0 && (
            <p className="text-center text-gray-500 pt-4">No portion formulas yet.</p>
          )}
        </div>
      )}

      {/* ======================= MODALS ========================= */}
      {showAddModal && (
        <IngredientModal
          onClose={() => setShowAddModal(false)}
          onSave={(newItem) => {
            setInventory([...inventory, newItem]);
            setShowAddModal(false);
          }}
        />
      )}

      {editingItem && (
        <IngredientModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => {
            setInventory(inventory.map(i => (i.id === updated.id ? updated : i)));
            setEditingItem(null);
          }}
        />
      )}

      {showPortionModal && (
        <PortionFormulaModal
          portion={editingPortion}
          onSave={handleSavePortion}
          onClose={() => {
            setShowPortionModal(false);
            setEditingPortion(null);
          }}
        />
      )}

      {showLowStockModal && (
        <LowStockModal
          lowStockItems={lowStockItems}
          onClose={() => setShowLowStockModal(false)}
        />
      )}
    </div>
  );
};

export default InventoryManagement;
