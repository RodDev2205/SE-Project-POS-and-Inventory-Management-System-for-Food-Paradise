import React, { useState, useEffect } from "react";
import { Store } from "lucide-react";
import AddBranchModal from "./AddBranches";

export default function BranchList() {
  const [branches, setBranches] = useState([]);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5200/api/branches/getBranches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch branches");

      setBranches(data.branches || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleCreateBranch = () => {
    // Re-fetch everything from the server to ensure the UI matches the DB perfectly
    fetchBranches();
    setIsAddBranchModalOpen(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Branch List</h2>
        <button
          onClick={() => setIsAddBranchModalOpen(true)}
          className="flex items-center rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
        >
          <Store className="mr-2 h-4 w-4" />
          Add New Branch
        </button>
      </div>

      {loading ? (
        <p>Loading branches...</p>
      ) : (
        <div className="grid gap-4">
          {branches.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
              No branches yet.
            </div>
          )}

          {branches.map((branch) => (
            // Use _id for MongoDB or id for other DBs. Added a fallback to index if needed.
            <div
              key={branch._id || branch.id}
              className="rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {/* 3. Handle both 'name' and 'branchName' just in case */}
                      {branch.name || branch.branchName || "Unnamed Branch"}
                    </h3>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700">
                      {branch.openingTime} - {branch.closingTime}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{branch.address}</p>
                    <p>{branch.contact}</p>
                    <p>Created by: {branch.createdBy}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="rounded border border-green-600 px-3 py-1 font-medium text-green-600 hover:bg-green-50">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddBranchModal
        isOpen={isAddBranchModalOpen}
        onClose={() => setIsAddBranchModalOpen(false)}
        onSubmit={handleCreateBranch}
      />
    </div>
  );
}