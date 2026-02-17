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
  const token = localStorage.getItem("token"); // centralize token

  // -------------------
  // Fetch categories and products on mount
  // -------------------
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // -------------------
  // Fetch categories
  // -------------------
  const fetchCategories = async () => {
    try {
      const res = await fetch(API_CATEGORIES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Fetch categories failed:", err);
    }
  };

  // -------------------
  // Fetch products
  // -------------------
  const fetchProducts = async () => {
    try {
      const res = await fetch(API_MENU, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setMenuItems(data);
    } catch (err) {
      console.error("Fetch products failed:", err);
    }
  };

  // -------------------
  // Add new product
  // -------------------
  const handleAddItem = async (item) => {
    try {
      const formData = new FormData();
      formData.append("product_name", item.product_name);
      formData.append("category_id", item.category_id);
      formData.append("price", item.price);
      if (item.file) formData.append("image", item.file);

      const res = await fetch(API_MENU, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Add item error:", text);
        return;
      }

      const newItem = await res.json();
      setMenuItems((prev) => [...prev, newItem]); // immediate UI update
    } catch (err) {
      console.error("Add item failed:", err);
    }
  };

  // -------------------
  // Delete product
  // -------------------
  const handleDeleteItem = async (product_id) => {
    try {
      const res = await fetch(`${API_MENU}/${product_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete item error:", text);
        return;
      }

      setMenuItems((prev) => prev.filter((item) => item.product_id !== product_id));
    } catch (err) {
      console.error("Delete item failed:", err);
    }
  };

  // -------------------
  // Save edited product
  // -------------------
  const handleSaveEditedItem = async (updatedItem) => {
    try {
      const formData = new FormData();
      formData.append("product_name", updatedItem.product_name);
      formData.append("category_id", parseInt(updatedItem.category_id));
      formData.append("price", updatedItem.price);
      formData.append("status", updatedItem.status);

      if (updatedItem.file) formData.append("image", updatedItem.file);

      const res = await fetch(`${API_MENU}/${updatedItem.product_id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Edit item error:", data);
        alert("Failed to update item.");
        return;
      }

      // Update UI immediately
      setMenuItems((prev) =>
        prev.map((item) => (item.product_id === data.product_id ? data : item))
      );
      setEditingItem(null);
    } catch (err) {
      console.error("Edit item error:", err);
    }
  };

  // -------------------
  // Filter items by category
  // -------------------
  const filteredItems =
      activeCategory === "All Items"
        ? menuItems.filter((item) => item.approval_status === "APPROVED")
        : menuItems
            .filter((item) => item.category_name === activeCategory)
            .filter((item) => item.approval_status === "APPROVED");


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
            activeCategory === "All Items"
              ? "bg-[#1B5E20] text-white"
              : "bg-gray-100 hover:bg-green-100"
          }`}
        >
          All Items ({menuItems.length})
        </button>

        {categories.map((cat) => {
          const count = menuItems.filter((item) => item.category_name === cat.category_name).length;
          return (
            <button
              key={cat.category_id}
              onClick={() => setActiveCategory(cat.category_name)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat.category_name
                  ? "bg-[#1B5E20] text-white"
                  : "bg-gray-100 hover:bg-green-100"
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
          filteredItems.map((item) => (
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
