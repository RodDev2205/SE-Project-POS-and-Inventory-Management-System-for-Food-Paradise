import React, { useState } from 'react';
import { Package, AlertTriangle, ChevronUp, ChevronDown, Plus, Edit } from 'lucide-react';

// --- Placeholder Data ---
const initialInventory = [
  { id: 101, name: "All-Purpose Flour", unit: "kg", currentStock: 45, reorderLevel: 50, supplier: "Bulk Foods Co.", lastUpdated: "2025-11-20" },
  { id: 102, name: "Fresh Salmon Fillets", unit: "grams", currentStock: 8000, reorderLevel: 10000, supplier: "Seaside Supply", lastUpdated: "2025-11-21" },
  { id: 103, name: "Chicken Breasts", unit: "kg", currentStock: 15, reorderLevel: 20, supplier: "Farm Fresh Meats", lastUpdated: "2025-11-21" },
  { id: 104, name: "Milk (Whole)", unit: "liters", currentStock: 8, reorderLevel: 10, supplier: "Dairy King", lastUpdated: "2025-11-22" },
  { id: 105, name: "Cooking Oil", unit: "liters", currentStock: 4, reorderLevel: 5, supplier: "Bulk Foods Co.", lastUpdated: "2025-11-20" },
  { id: 106, name: "Coffee Beans (Arabica)", unit: "kg", currentStock: 2, reorderLevel: 5, supplier: "Bean Traders", lastUpdated: "2025-11-22" },
];

const InventoryManagement = () => {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showLowStockModal, setShowLowStockModal] = useState(false); // Added state

  // --- Filtering Logic ---
  const lowStockItems = inventory.filter(item => item.currentStock < item.reorderLevel);
  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Sorting Logic ---
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
    return sortConfig.direction === 'ascending' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const tableHeaders = [
    { key: 'name', label: 'Ingredient Name' },
    { key: 'unit', label: 'Unit' },
    { key: 'currentStock', label: 'Current Stock' },
    { key: 'reorderLevel', label: 'Reorder Level' },
    { key: 'supplier', label: 'Supplier' },
  ];

  // --- Add / Edit Handlers ---
  const handleAddIngredient = (newItem) => {
    setInventory([...inventory, { ...newItem, id: Date.now(), lastUpdated: new Date().toISOString().split('T')[0] }]);
    setShowAddModal(false);
  };

  const handleSaveEditedItem = (updatedItem) => {
    setInventory(inventory.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
  };

  // --- Modals ---
  const IngredientModal = ({ item, onClose, onSave }) => {
    const [name, setName] = useState(item?.name || '');
    const [unit, setUnit] = useState(item?.unit || '');
    const [currentStock, setCurrentStock] = useState(item?.currentStock || '');
    const [reorderLevel, setReorderLevel] = useState(item?.reorderLevel || '');
    const [supplier, setSupplier] = useState(item?.supplier || '');

    const handleSubmit = (e) => {
      e.preventDefault();
      const newItem = {
        id: item?.id || Date.now(),
        name,
        unit,
        currentStock: Number(currentStock),
        reorderLevel: Number(reorderLevel),
        supplier,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      onSave(newItem);
    };

    return (
      <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-30 backdrop-blur-sm">
        <div className="bg-white backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg w-96">
          <h3 className="text-xl font-bold mb-4">{item ? 'Edit Ingredient' : 'Add New Ingredient'}</h3>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input type="text" placeholder="Ingredient Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-lg bg-white/40 backdrop-blur-sm" required />
            <input type="text" placeholder="Unit (kg, liters, etc.)" value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full p-3 border rounded-lg bg-white/40 backdrop-blur-sm" required />
            <input type="number" placeholder="Current Stock" value={currentStock} onChange={(e) => setCurrentStock(e.target.value)} className="w-full p-3 border rounded-lg bg-white/40 backdrop-blur-sm" required />
            <input type="number" placeholder="Reorder Level" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} className="w-full p-3 border rounded-lg bg-white/40 backdrop-blur-sm" required />
            <input type="text" placeholder="Supplier Name" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="w-full p-3 border rounded-lg bg-white/40 backdrop-blur-sm" required />
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onClose}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">{item ? 'Save Changes' : 'Add Ingredient'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // --- Low Stock Modal ---
  const LowStockModal = ({ lowStockItems, onClose }) => (
    <div className="fixed inset-0 flex justify-center items-center z-50 bg-opacity-30 backdrop-blur-sm">
      <div className="bg-white backdrop-blur-md border border-white/20 p-6 rounded-xl shadow-lg w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-700 mr-2" /> Low Stock Ingredients
        </h3>
        {lowStockItems.length > 0 ? (
          <ul className="space-y-2">
            {lowStockItems.map(item => (
              <li key={item.id} className="flex justify-between p-2 rounded-lg bg-red-50">
                <span className="font-medium">{item.name}</span>
                <span className="text-red-600 font-bold">{item.currentStock} {item.unit}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center">No low stock items.</p>
        )}
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Close</button>
        </div>
      </div>
    </div>
  );

  // --- Rendering ---
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Ingredient Inventory Management</h2>

      {/* Alerts and Actions */}
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
        <div onClick={() => setShowAddModal(true)} className="bg-[#E8F5E9] p-6 rounded-xl shadow-lg flex flex-col justify-center items-center cursor-pointer hover:bg-green-100 transition duration-200">
          <Plus className="w-6 h-6 text-green-800 mb-2" />
          <p className="text-lg font-semibold text-green-800">Add New Ingredient</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <Package className="w-5 h-5 mr-2 text-[#1B5E20]" /> Current Stock List
          </h3>
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg focus:ring-[#33691E] focus:border-[#33691E] transition w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {tableHeaders.map(header => (
                  <th
                    key={header.key}
                    onClick={() => requestSort(header.key)}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center">{header.label}{getSortIcon(header.key)}</div>
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedItems.map(item => {
                const isLowStock = item.currentStock < item.reorderLevel;
                const rowClass = isLowStock ? 'bg-yellow-50 hover:bg-yellow-100' : 'hover:bg-gray-50';
                return (
                  <tr key={item.id} className={rowClass}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>{item.currentStock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.reorderLevel}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.supplier}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button onClick={() => setEditingItem(item)} className="text-[#1B5E20] hover:text-[#33691E] transition">
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {sortedItems.length === 0 && <p className="p-4 text-center text-gray-500">No ingredients found matching your criteria.</p>}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && <IngredientModal onClose={() => setShowAddModal(false)} onSave={handleAddIngredient} />}
      {editingItem && <IngredientModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleSaveEditedItem} />}
      {showLowStockModal && <LowStockModal lowStockItems={lowStockItems} onClose={() => setShowLowStockModal(false)} />}
    </div>
  );
};

export default InventoryManagement;
