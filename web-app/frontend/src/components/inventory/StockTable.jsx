// StockTabContent.jsx
import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import StockTable from './StockTable'; // Assuming StockTable.jsx is in the same directory

const StockTabContent = ({
  lowStockItems,
  setShowLowStockModal,
  setShowAddModal,
  // Props for StockTable
  sortedItems,
  searchTerm,
  setSearchTerm,
  sortConfig,
  requestSort,
  setEditingItem
}) => {
  return (
    <>
      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
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

        {/* Add New Ingredient Card */}
        <div
          onClick={() => setShowAddModal(true)}
          className="bg-[#E8F5E9] p-6 rounded-xl shadow-lg flex flex-col justify-center items-center cursor-pointer hover:bg-green-100 transition"
        >
          <Plus className="w-6 h-6 text-green-800 mb-2" />
          <p className="text-lg font-semibold text-green-800">Add New Ingredient</p>
        </div>
      </div>

      {/* Stock Table */}
      <StockTable 
        sortedItems={sortedItems}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortConfig={sortConfig}
        requestSort={requestSort}
        setEditingItem={setEditingItem}
      />
    </>
  );
};

export default StockTabContent;