import { useState } from "react";

const EditMenuModal = ({ item, onClose }) => {
  const [name, setName] = useState(item.name);
  const [ingredients, setIngredients] = useState(item.ingredients);
  const [price, setPrice] = useState(item.price);

  const handleUpdate = () => {
    console.log({ ...item, name, ingredients, price });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-2xl font-bold mb-4">Edit Menu Item</h3>
        <div className="space-y-4">
          <input
            placeholder="Item Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            placeholder="Ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
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
              onClick={handleUpdate}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMenuModal;
