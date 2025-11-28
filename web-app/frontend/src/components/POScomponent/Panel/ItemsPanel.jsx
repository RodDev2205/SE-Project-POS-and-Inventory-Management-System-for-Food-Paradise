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

      <input
        type="text"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      />

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

      <div className="flex gap-4 mb-6 border-b">
        {["All", "Meals", "Drinks", "Dessert", "Add-ons"].map((cat) => (
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
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => {
              const existingItem = cart.find((i) => i.item === item.name);
              if (existingItem) {
                setCart(cart.map((i) => (i.item === item.name ? { ...i, qty: i.qty + 1 } : i)));
              } else {
                setCart([...cart, { item: item.name, qty: 1, price: item.price }]);
              }
            }}
            className="bg-gray-100 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200"
          >
            <div className="bg-gray-300 h-24 rounded mb-3 flex items-center justify-center text-gray-600 text-sm">
              Image
            </div>
            <p className="font-semibold text-gray-800 mb-1">{item.name}</p>
            <p className="text-green-600 font-bold">₱ {item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
