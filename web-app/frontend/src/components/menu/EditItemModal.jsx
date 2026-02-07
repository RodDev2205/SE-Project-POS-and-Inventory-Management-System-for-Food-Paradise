import React, { useState, useEffect } from "react";

export default function EditItemModal({ item, onClose, onSave }) {
  const [productName, setProductName] = useState(item.product_name);
  const [price, setPrice] = useState(item.price);
  const [status, setStatus] = useState(item.status);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(item.image_path || "");

  // Update preview when user selects a new file
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();


    // Prepare object for saving
    const updatedItem = {
      ...item,
      product_name: productName,
      category_id: parseInt(categoryId),
      price: parseFloat(price),
      status,
      file: imageFile,
    };

    onSave(updatedItem);
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
        <h3 className="font-bold text-xl mb-4">Edit Item</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Name */}
          <input
            type="text"
            className="w-full p-3 border rounded-lg"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Product Name"
          />

          {/* Price */}
          <input
            type="number"
            className="w-full p-3 border rounded-lg"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            min="0"
            step="0.01"
          />

          {/* Status */}
          <select
            className="w-full p-3 border rounded-lg"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Product Image</label>
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg"
              />
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <span className="text-sm text-gray-500">Leave empty to keep current image</span>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded-lg"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
