import { useState } from "react";

export default function InventoryTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  const dummyData = Array.from({ length: 20 }, (_, i) => {
    const stock = Math.floor(Math.random() * 50);

    let status = "In Stock";
    if (stock === 0) status = "Out of Stock";
    else if (stock < 10) status = "Low Stock";

    return {
      id: i + 1,
      name: `Inventory Item ${i + 1}`,
      category: i % 2 === 0 ? "Ingredients" : "Supplies",
      stock,
      status,
    };
  });

  const filtered = dummyData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      item.status.toLowerCase().replace(/\s/g, "") === filter;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = filtered.slice(start, start + ITEMS_PER_PAGE);

  const handleClear = () => {
    setSearch("");
    setFilter("all");
    setPage(1);
  };

  return (
    <>
      {/* Search + Filter */}
      <div className="flex justify-between mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search inventory..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="border px-4 py-2 rounded-lg w-64"
          />

          <select
            value={filter}
            onChange={(e) => {
              setPage(1);
              setFilter(e.target.value);
            }}
            className="border px-4 py-2 rounded-lg"
          >
            <option value="all">All Stock</option>
            <option value="instock">In Stock</option>
            <option value="lowstock">Low Stock</option>
            <option value="outofstock">Out of Stock</option>
          </select>

          <button
            onClick={handleClear}
            className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>
        </div>

        <button className="bg-green-600 text-white px-4 py-2 rounded-lg">
          + Add Inventory
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {currentItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-6 border"
          >
            <div className="h-24 bg-gray-100 rounded mb-4 flex items-center justify-center">
              Item Image
            </div>

            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.category}</p>
            <p className="text-sm">Stock: {item.stock}</p>
            <p
              className={`text-sm font-medium ${
                item.status === "In Stock"
                  ? "text-green-600"
                  : item.status === "Low Stock"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {item.status}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          {/* Prev */}
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            « Prev
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-green-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next »
          </button>
        </div>
      )}
    </>
  );
}
