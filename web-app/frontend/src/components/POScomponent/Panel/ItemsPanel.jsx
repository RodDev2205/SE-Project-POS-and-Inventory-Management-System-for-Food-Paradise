import React from "react";

export default function ItemsPanel({
  items,
  activeCategory,
  setActiveCategory,
  searchTerm,
  setSearchTerm,
  sortOption,
  setSortOption,
  cart,
  setCart,
}) {
  return (
    <div className="flex-1 bg-white rounded-lg p-6 h-full overflow-y-auto shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">POS</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />

      {/* Sort */}
      <div className="flex gap-2 mb-4">
        <select
          className="border rounded p-2"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="default">Sort: Default</option>
          <option value="nameAsc">Sort: Name A-Z</option>
          <option value="priceAsc">Sort: Price Low-High</option>
          <option value="priceDesc">Sort: Price High-Low</option>
        </select>
      </div>

      {/* Categories */}
      <div className="flex gap-4 mb-6 border-b flex-wrap">
        {["All", ...Array.from(new Set(items.map((item) => item.categories)))].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-2 font-semibold ${
                activeCategory === cat
                  ? "text-black border-b-2 border-green-600"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {items.map((item) => (
          <div
            key={item.product_id}
            onClick={() => {
              const existingItem = cart.find((i) => i.product_id === item.product_id);
              if (existingItem) {
                setCart(
                  cart.map((i) =>
                    i.product_id === item.product_id
                      ? { ...i, qty: i.qty + 1 }
                      : i
                  )
                );
              } else {
                setCart([
                  ...cart,
                  {
                    product_id: item.product_id, // IMPORTANT: include product_id
                    item: item.product_name,
                    qty: 1,
                    price: Number(item.price),
                  },
                ]);
              }
            }}
            className="bg-gray-100 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200"
          >
            <div className="bg-gray-300 h-24 rounded mb-3 flex items-center justify-center text-gray-600 text-sm overflow-hidden">
              {item.image_path ? (
                <img
                  src={`http://localhost:5200${item.image_path}`}
                  alt={item.product_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                "No Image"
              )}
            </div>
            <p className="font-semibold text-gray-800 mb-1">{item.product_name}</p>
            <p className="text-green-600 font-bold">
              ₱ {Number(item.price).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
