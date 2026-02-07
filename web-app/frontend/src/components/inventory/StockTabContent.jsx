import React from 'react';
import { Package, AlertTriangle, Edit } from 'lucide-react';

const StockTab = ({
  inventory = [],
  sortedItems = [],
  tableHeaders, // optional override
  requestSort = () => {},
  getSortIcon = () => null,
  setEditingItem = () => {},
  lowStockItems = [],
  setShowAddModal = () => {},
  setShowLowStockModal = () => {}
}) => {
  // Default headers if none passed
  const defaultHeaders = [
    { key: 'name', label: 'Ingredient Name' },
    { key: 'currentStock', label: 'Current Stock' },
    { key: 'unit', label: 'Unit' },
    { key: 'supplier', label: 'Supplier' },
  ];

  const headers = tableHeaders || defaultHeaders;

  return (
    <>
      {/* Quick Action Cards */}
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
          <Package className="w-6 h-6 text-green-800 mb-2" />
          <p className="text-lg font-semibold text-green-800">Add New Ingredient</p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header) => (
                  <th key={header.key} className="px-6 py-3 cursor-pointer">
                    <div
                      onClick={() => requestSort(header.key)}
                      className="flex items-center text-xs font-medium text-gray-500 uppercase"
                    >
                      {header.label}{getSortIcon(header.key)}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(sortedItems || []).map((item) => {
                const isLow = item.currentStock < item.reorderLevel;
                return (
                  <tr key={item.id} className={isLow ? "bg-yellow-50" : ""}>
                    <td className="px-6 py-4 text-sm font-medium">{item.name}</td>
                    <td
                      className={`px-6 py-4 text-sm font-bold ${
                        isLow ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm">{item.unit}</td>
                    <td className="px-6 py-4 text-sm">{item.supplier}</td>
                    <td className="px-6 py-4 ">
                      <button onClick={() => setEditingItem(item)} className="text-green-700">
                        <Edit className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {/* Show message if no items */}
              {(!sortedItems || sortedItems.length === 0) && (
                <tr>
                  <td colSpan={headers.length + 1} className="text-center py-4 text-gray-500">
                    No inventory items to display.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default StockTab;
