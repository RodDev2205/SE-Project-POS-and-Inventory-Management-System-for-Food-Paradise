import React, { useState } from "react";
import AddMenuItemModal from "../menu/modal/AddMenuItemModal";

// Dummy Data
const categories = [
  { category_id: 1, category_name: "Food" },
  { category_id: 2, category_name: "Drinks" },
];
const ingredients = [
  { id: 1, name: "Rice" },
  { id: 2, name: "Chicken" },
  { id: 3, name: "Vegetables" },
];
const menuItemsMock = [
  { product_id: 1, product_name: "Chicken Rice", category_name: "Food", price: 150 },
  { product_id: 2, product_name: "Fruit Juice", category_name: "Drinks", price: 80 },
];

export default function MenuManagementUI() {
  const [menuItems, setMenuItems] = useState(menuItemsMock);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredItems =
    activeCategory === "All Items"
      ? menuItems
      : menuItems.filter((item) => item.category_name === activeCategory);

  const handleAddItem = (item) => {
    console.log("New Item:", item);
    setMenuItems((prev) => [
      ...prev,
      {
        product_id: prev.length + 1,
        product_name: item.product_name,
        category_name: categories.find((c) => c.category_id == item.category_id)?.category_name,
        price: item.price,
      },
    ]);
  };

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-bold">Menu Management</h2>

      {/* Add New Item Button */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition"
      >
        + Add New Menu Item
      </button>

      {/* CATEGORY FILTER */}
      <div className="flex flex-wrap bg-white p-4 rounded-xl shadow-md gap-3 mt-4">
        <button
          onClick={() => setActiveCategory("All Items")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            activeCategory === "All Items" ? "bg-green-600 text-white" : "bg-gray-100 hover:bg-green-100"
          }`}
        >
          All Items ({filteredItems.length})
        </button>
        {categories.map((cat) => {
          const count = filteredItems.filter((item) => item.category_name === cat.category_name).length;
          return (
            <button
              key={cat.category_id}
              onClick={() => setActiveCategory(cat.category_name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat.category_name ? "bg-green-600 text-white" : "bg-gray-100 hover:bg-green-100"
              }`}
            >
              {cat.category_name} ({count})
            </button>
          );
        })}
      </div>

      {/* MENU GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div key={item.product_id} className="bg-white shadow-md p-4 rounded-xl">
              <h3 className="font-semibold text-lg">{item.product_name}</h3>
              <p className="text-sm text-gray-500">{item.category_name}</p>
              <p className="text-green-600 font-bold">₱{item.price}</p>
            </div>
          ))
        ) : (
          <p className="text-center col-span-4 text-gray-500 py-10">No items found</p>
        )}
      </div>

      {/* ------------------ ADD MODAL ------------------ */}
      <AddMenuItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItem={handleAddItem}
        categories={categories}
        ingredients={ingredients}
      />
    </div>
  );
}