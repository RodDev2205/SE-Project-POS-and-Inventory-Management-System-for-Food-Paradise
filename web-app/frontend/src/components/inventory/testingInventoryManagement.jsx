// InventoryManagement.jsx
import React, { useState } from "react";
import { AlertTriangle, Plus, Edit } from "lucide-react";
import AddIngredientModal from "../inventory/models/AddIngredientModal";

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([
    { inventory_id: 1, item_name: "Rice", quantity: 2, servings_per_unit: 50, total_servings: 100, low_stock_threshold: 20, status: "active" },
    { inventory_id: 2, item_name: "Chicken", quantity: 1, servings_per_unit: 10, total_servings: 10, low_stock_threshold: 15, status: "active" },
    { inventory_id: 3, item_name: "Sauce", quantity: 5, servings_per_unit: 30, total_servings: 150, low_stock_threshold: 25, status: "active" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const lowStockItems = inventory.filter(item => item.total_servings <= item.low_stock_threshold);

  const handleAddIngredient = (newIngredient) => {
    // Ensure total_servings is calculated correctly
    const ingredientWithTotal = {
      ...newIngredient,
      total_servings: newIngredient.quantity * newIngredient.servings_per_unit,
    };

    setInventory(prev => [
      ...prev,
      { ...ingredientWithTotal, inventory_id: Date.now() } // temporary unique ID
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
        <p className="text-gray-500 mt-1">Overview of ingredient stocks and servings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="Total Ingredients" value={inventory.length} />
        <DashboardCard title="Low Stock Items" value={lowStockItems.length} alert={lowStockItems.length > 0} />
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">Ingredient Stock</h2>
            <p className="text-sm text-gray-500">Manage raw ingredients and monitor servings availability</p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 transition text-white rounded-2xl shadow-md font-medium"
          >
            <Plus size={18} /> Add Ingredient
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search ingredient..."
            className="w-full md:w-80 px-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400 border-b">
                <th className="pb-4">Ingredient</th>
                <th>Units</th>
                <th>Servings/Unit</th>
                <th>Total Servings</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {inventory.map((item) => {
                const isLow = item.total_servings <= item.low_stock_threshold;
                return (
                  <tr key={item.inventory_id} className="border-b last:border-none hover:bg-gray-50 transition">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-800">{item.item_name}</p>
                        <p className="text-xs text-gray-400">Threshold: {item.low_stock_threshold}</p>
                      </div>
                    </td>
                    <td>{item.quantity}</td>
                    <td>{item.servings_per_unit}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isLow ? "text-red-600" : "text-gray-800"}`}>{item.total_servings}</span>
                        {isLow && (
                          <span className="text-xs text-red-500 flex items-center gap-1 px-2 py-0.5 bg-red-100 rounded-full">
                            <AlertTriangle size={14} /> Low
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${item.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="p-2 rounded-xl hover:bg-gray-200 transition">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddIngredientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddIngredient}
      />
    </div>
  );
};

const DashboardCard = ({ title, value, alert }) => (
  <div className={`p-6 rounded-2xl shadow-md ${alert ? "bg-red-50" : "bg-white"} hover:shadow-lg transition`}>
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <p className={`text-2xl font-bold ${alert ? "text-red-600" : "text-gray-800"}`}>{value}</p>
  </div>
);

export default InventoryManagement;