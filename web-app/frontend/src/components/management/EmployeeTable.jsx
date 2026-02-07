import { useEffect, useState } from "react";
import {
  UserCircle,
  Users,
  Lock,
  Unlock,
  Eye,
  Pencil,
} from "lucide-react";

import AddAdminModal from "./AddAdmin";
import AddCashierModal from "./AddCashier";

export default function UserList({ type }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  /* ==============================
     Fetch users
  ============================== */
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5200/api/superadmin/get${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      setUsers(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [type]);

  /* ==============================
     Toggle user status
  ============================== */
  const toggleStatus = async (userId, currentStatus) => {
    const token = localStorage.getItem("token");
    const newStatus = currentStatus === "Activate" ? "Deactivate" : "Activate";

    try {
      const res = await fetch(
        `http://localhost:5200/api/superadmin/users/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setUsers((prev) =>
        prev.map((user) =>
          (user.id || user.user_id) === userId
            ? { ...user, status: data.user.status }
            : user
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  /* ==============================
     View / Edit handlers
     (plug modals here later)
  ============================== */
  const handleViewUser = (user) => {
    console.log("View user:", user);
    // open ViewUserModal(user)
  };

  const handleEditUser = (user) => {
    console.log("Edit user:", user);
    // open EditUserModal(user)
  };

  /* ==============================
     After create
  ============================== */
  const handleCreateUser = async () => {
    await fetchUsers();
    setIsAddModalOpen(false);
  };

  /* ==============================
     UI states
  ============================== */
  if (loading) {
    return <p className="text-gray-600">Loading {type.toLowerCase()}s...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      {/* ===== Header ===== */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {type} List
        </h2>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
        >
          {type === "Admin" ? (
            <UserCircle className="mr-2 h-4 w-4" />
          ) : (
            <Users className="mr-2 h-4 w-4" />
          )}
          Add {type}
        </button>
      </div>

      {/* ===== Table ===== */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                Branch
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-6 text-center text-gray-500">
                  No {type.toLowerCase()} accounts found
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const userId = user.id || user.user_id;
                const isActive = user.status === "Activate";

                return (
                  <tr key={userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.branch || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.username}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isActive ? "Activated" : "Deactivated"}
                      </span>
                    </td>

                    {/* ===== Actions ===== */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {/* View */}
                        <button
                          onClick={() => handleViewUser(user)}
                          className="rounded-full bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                          title="View user"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleEditUser(user)}
                          className="rounded-full bg-yellow-100 p-2 text-yellow-600 hover:bg-yellow-200"
                          title="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* Activate / Deactivate */}
                        <button
                          onClick={() => toggleStatus(userId, user.status)}
                          className={`rounded-full p-2 transition ${
                            isActive
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-red-100 text-red-600 hover:bg-red-200"
                          }`}
                          title={
                            isActive ? "Deactivate user" : "Activate user"
                          }
                        >
                          {isActive ? (
                            <Unlock className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Modals ===== */}
      {type === "Admin" && (
        <AddAdminModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {type === "Cashier" && (
        <AddCashierModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreateUser}
        />
      )}
    </div>
  );
}
