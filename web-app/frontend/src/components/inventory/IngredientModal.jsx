import React, { useState, useEffect } from "react";

const IngredientModal = ({ item, onSave, onClose }) => {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [reorderLevel, setReorderLevel] = useState(0);
  const [supplier, setSupplier] = useState("");

  // Populate form if editing
  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setUnit(item.unit || "");
      setCurrentStock(item.currentStock || 0);
      setReorderLevel(item.reorderLevel || 0);
      setSupplier(item.supplier || "");
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      id: item?.id || Date.now(),
      name,
      unit,
      currentStock: Number(currentStock),
      reorderLevel: Number(reorderLevel),
      supplier,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/20 backdrop-blur-sm z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-96">
        <h3 className="text-xl font-bold mb-4">{item ? "Edit Ingredient" : "Add New Ingredient"}</h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ingredient Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Unit (kg, liters, etc.)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Current Stock"
            value={currentStock}
            onChange={(e) => setCurrentStock(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Reorder Level"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Supplier Name"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="w-full p-3 border rounded-lg"
            required
          />

          <div className="flex justify-end gap-3">
            <button type="button" className="px-4 py-2 bg-gray-200 rounded-lg" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg">
              {item ? "Save Changes" : "Add Ingredient"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IngredientModal;
