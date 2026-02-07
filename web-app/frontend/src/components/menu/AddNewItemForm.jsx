import React, { useState } from "react";
import { Plus } from "lucide-react";

export default function AddNewItemForm({ onAddItem, categories }) {
  const [productName, setProductName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.category_id || "");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !categoryId || !price) return;

    onAddItem({
      product_name: productName,
      category_id: categoryId,
      price: parseFloat(price),
      status: "available",
      file: imageFile,
    });

    // Reset form
    setProductName("");
    setCategoryId("");
    setPrice("");
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6"
    >
      <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Plus className="text-green-700" /> Add New Menu Item
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Product Name */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Item Name</label>
          <input
            className="p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-600 w-full"
            placeholder="Ex: Cheeseburger"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Category</label>
          <select
            className="p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-600 w-full"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            {/* Default placeholder option */}
            <option value="" disabled>
              Select Category
            </option>
            
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-600">Price</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className="p-3 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-600 w-full"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-600">Product Image</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50"
          onClick={() => document.getElementById("imageUpload").click()}
        >
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {!imagePreview ? (
            <p className="text-gray-500">
              <span className="font-semibold">Click to upload</span>
            </p>
          ) : (
            <div className="flex justify-center">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg shadow"
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-2 w-full md:w-auto px-8 py-3 bg-green-700 text-white font-medium rounded-xl hover:bg-green-800"
      >
        Create Item
      </button>
    </form>
  );
}
