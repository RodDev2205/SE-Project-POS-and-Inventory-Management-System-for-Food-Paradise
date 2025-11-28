import { useState } from "react";
import MenuTable from "./MenuTable";
import AddMenuModal from "./AddMenuModal";
import EditMenuModal from "./EditMenuModal";

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]); // Replace with API data
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowEditMenuModal(true);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Menu Management</h2>

      <MenuTable
        menuItems={menuItems}
        onEdit={handleEditItem}
        onDelete={(id) => console.log("Delete menu item", id)}
      />

      <button
        onClick={() => setShowAddMenuModal(true)}
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
      >
        Add Menu Item
      </button>

      {showAddMenuModal && (
        <AddMenuModal onClose={() => setShowAddMenuModal(false)} />
      )}
      {showEditMenuModal && selectedItem && (
        <EditMenuModal
          item={selectedItem}
          onClose={() => setShowEditMenuModal(false)}
        />
      )}
    </div>
  );
};

export default MenuManagement;
