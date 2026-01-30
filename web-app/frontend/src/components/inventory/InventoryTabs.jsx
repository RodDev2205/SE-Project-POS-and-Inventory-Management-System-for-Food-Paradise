// InventoryTabs.jsx
import React from 'react';
import { FlaskConical } from 'lucide-react';

const InventoryTabs = ({ activeTab, setActiveTab }) => {
  return (
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
  );
};

export default InventoryTabs;