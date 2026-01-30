import React from "react";
import { AlertTriangle } from "lucide-react";

const LowStockModal = ({ lowStockItems, onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/20 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-700" /> Low Stock Items
        </h3>

        {lowStockItems.length === 0 ? (
          <p className="text-gray-500">No low stock items.</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {lowStockItems.map(item => (
              <li key={item.id} className="flex justify-between items-center border-b pb-1">
                <span>{item.name}</span>
                <span className="font-semibold text-red-600">{item.currentStock} {item.unit}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockModal;
