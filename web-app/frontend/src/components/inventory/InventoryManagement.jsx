import { useState } from "react";
import InventoryTable from "./InventoryTable";
import AddInventoryModal from "./AddInventoryModal";
import EditInventoryModal from "./EditInventoryModal";

const InventoryManagement = () => {
  const [inventoryItems, setInventoryItems] = useState([]); // Replace with API data
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [showEditInventoryModal, setShowEditInventoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowEditInventoryModal(true);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>

      <InventoryTable
        inventoryItems={inventoryItems}
        onEdit={handleEditItem}
        onDelete={(id) => console.log("Delete", id)}
      />

      <button
        onClick={() => setShowAddInventoryModal(true)}
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        Add Inventory Item
      </button>

      {showAddInventoryModal && (
        <AddInventoryModal onClose={() => setShowAddInventoryModal(false)} />
      )}
      {showEditInventoryModal && selectedItem && (
        <EditInventoryModal
          item={selectedItem}
          onClose={() => setShowEditInventoryModal(false)}
        />
      )}
    </div>
  );
};

export default InventoryManagement;
