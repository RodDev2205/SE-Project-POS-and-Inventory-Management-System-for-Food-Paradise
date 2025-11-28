import { useState } from "react";

const AddInventoryModal = ({ onClose }) => {
  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = () => {
    console.log({ itemId, name, unit, amount });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-2xl font-bold mb-4">Add Inventory Item</h3>
        <div className="space-y-4">
          <input
            placeholder="Item ID"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select Unit</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="L">L</option>
            <option value="mL">mL</option>
            <option value="pcs">pcs</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            min="0"
          />
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryModal;
