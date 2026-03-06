import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import API_BASE_URL from '../../../config/api';

export default function InventoryTab() {
  const [inventory, setInventory] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 5;

  // ✅ Fetch ingredients from backend (all branches for SuperAdmin, or branch-based for Admin)
  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");

      // Try to get all inventory first (superadmin)
      try {
        const allResponse = await fetch(`${API_BASE_URL}/api/inventory/all-inventory`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (allResponse.ok) {
          const data = await allResponse.json();
          setInventory(data);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Not superadmin or endpoint error, fall through to branch-specific
      }

      // Fall back to branch-specific inventory
      const response = await fetch(`${API_BASE_URL}/api/inventory/get-ingredients`, {
          headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch inventory");
      }

      setInventory(data);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setLoading(false);
    }
  };

  // 🔄 Load on mount
  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = inventory.filter((item) => {
    const matchesSearch = item.item_name
      .toLowerCase()
      .includes(search.toLowerCase());

    let matchesFilter = filter === "all";
    if (filter === "lowstock") {
      matchesFilter = item.total_servings <= item.low_stock_threshold;
    } else if (filter === "instock") {
      matchesFilter = item.total_servings > item.low_stock_threshold;
    } else if (filter === "outofstock") {
      matchesFilter = item.total_servings === 0;
    }

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

  if (loading) {
    return <div className="p-8">Loading inventory...</div>;
  }

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

      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pb-5">
          {/* Prev */}
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            « Prev
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1
                  ? "bg-green-600 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}

          {/* Next */}
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            Next »
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border mb-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs uppercase font-semibold text-gray-600 border-b">
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4">Units</th>
                <th className="px-6 py-4">Servings/Unit</th>
                <th className="px-6 py-4">Total Servings</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody className="text-sm text-gray-700">
              {currentItems.map((item) => {
                const isLow = item.total_servings <= item.low_stock_threshold;
                const isEmpty = item.total_servings === 0;

                return (
                  <tr
                    key={item.inventory_id}
                    className="border-b last:border-none hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {item.item_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Threshold: {item.low_stock_threshold}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {item.branch_name || "Branch"}
                      </span>
                    </td>

                    <td className="px-6 py-4">{item.quantity}</td>
                    <td className="px-6 py-4">{item.servings_per_unit}</td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isLow ? "text-red-600" : "text-gray-800"
                          }`}
                        >
                          {item.total_servings}
                        </span>

                        {isLow && !isEmpty && (
                          <span className="text-xs text-yellow-600 flex items-center gap-1 px-2 py-0.5 bg-yellow-100 rounded-full">
                            <AlertTriangle size={12} /> Low
                          </span>
                        )}

                        {isEmpty && (
                          <span className="text-xs text-red-600 flex items-center gap-1 px-2 py-0.5 bg-red-100 rounded-full">
                            <AlertTriangle size={12} /> Empty
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "available"
                            ? "bg-green-100 text-green-700"
                            : item.status === "low_stock"
                            ? "bg-yellow-100 text-yellow-700"
                            : item.status === "out_of_stock"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.status.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {currentItems.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No inventory items found.
            </div>
          )}
        </div>
      </div>

    </>
  );
}
