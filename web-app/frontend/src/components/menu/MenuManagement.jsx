import React, { useState, useEffect } from "react";
import MenuItemCard from "./MenuItemCard";
import AddNewItemForm from "./AddNewItemForm";
import EditItemModal from "./EditItemModal";

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Items");
  const [editingItem, setEditingItem] = useState(null);

  const API_MENU = "http://localhost:5200/api/menu";
  const API_CATEGORIES = "http://localhost:5200/api/categories";

  // Fetch categories and products on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const res = await fetch(API_CATEGORIES);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Fetch categories failed:", err);
    }
  };

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      const res = await fetch(API_MENU);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setMenuItems(data);
    } catch (err) {
      console.error("Fetch products failed:", err);
    }
  };

  // Add new product
  const handleAddItem = async (item) => {
    try {
      const formData = new FormData();
      formData.append("product_name", item.product_name);
      formData.append("category_id", item.category_id);
      formData.append("price", item.price);
      if (item.file) formData.append("image", item.file);

      const res = await fetch(API_MENU, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Add item error:", text);
        return;
      }

      const newItem = await res.json();
      setMenuItems([...menuItems, newItem]);
      fetchCategories();
      fetchProducts();
      
    } catch (err) {
      console.error("Add item failed:", err);
    }
  };

  // Delete product
  const handleDeleteItem = async (product_id) => {
    try {
      const res = await fetch(`${API_MENU}/${product_id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        console.error("Delete item error:", text);
        return;
      }
      setMenuItems(menuItems.filter(item => item.product_id !== product_id));
    } catch (err) {
      console.error("Delete item failed:", err);
    }
  };

  // Save edited product
  const handleSaveEditedItem = async (updatedItem) => {
  try {
    const formData = new FormData();
    formData.append("product_name", updatedItem.product_name);
    formData.append("category_id", parseInt(updatedItem.category_id)); // FIXED
    formData.append("price", updatedItem.price);
    formData.append("status", updatedItem.status);

    // Only append file if a new image was selected
    if (updatedItem.file) {
      formData.append("image", updatedItem.file);
    }

    const res = await fetch(`http://localhost:5200/api/menu/${updatedItem.product_id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    console.log("Sending category_id:", updatedItem.category_id);

    if (!res.ok) {
      console.error("Edit item error:", data);
      alert("Failed to update item.");
      return;
    }

    // Refresh UI
    fetchProducts();
    fetchCategories();
    setEditingItem(null);

  } catch (err) {
    console.error("Edit item error:", err);
  }
};


  // Filter items by category
  const filteredItems =
    activeCategory === "All Items"
      ? menuItems
      : menuItems.filter(item => item.category_name === activeCategory);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Menu Management</h2>

      <AddNewItemForm onAddItem={handleAddItem} categories={categories} />

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap bg-white p-4 rounded-xl shadow-md gap-3">
        <button
          key="All Items"
          onClick={() => setActiveCategory("All Items")}
          className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
            activeCategory === "All Items" ? "bg-[#1B5E20] text-white" : "bg-gray-100 hover:bg-green-100"
          }`}
        >
          All Items ({menuItems.length})
        </button>

        {categories.map(cat => {
          const count = menuItems.filter(item => item.category_name === cat.category_name).length;
          return (
            <button
              key={cat.category_id}
              onClick={() => setActiveCategory(cat.category_name)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat.category_name ? "bg-[#1B5E20] text-white" : "bg-gray-100 hover:bg-green-100"
              }`}
            >
              {cat.category_name} ({count})
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <MenuItemCard
              key={item.product_id}
              item={item}
              onEdit={() => setEditingItem(item)}
              onDelete={() => handleDeleteItem(item.product_id)}
            />
          ))
        ) : (
          <p className="text-center col-span-4 text-gray-500 py-10">
            No items found in {activeCategory}
          </p>
        )}
      </div>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveEditedItem}
          categories={categories}
        />
      )}
    </div>
  );
}
