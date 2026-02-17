import { useEffect, useState } from "react";
import { X, UserPlus } from "lucide-react";

export default function EditUserModal({ isOpen, onClose, user, role, onUpdate }) {
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    password: "",
    branch_id: "",
  });

  /* ================= FETCH BRANCHES ================= */
  useEffect(() => {
    if (!isOpen) return;
    setLoadingBranches(true);

    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5200/api/branches/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch branches");
        const data = await res.json();
        setBranches(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [isOpen]);

  /* ================= PREFILL DATA ================= */
  useEffect(() => {
    if (!isOpen || !user || branches.length === 0) return;

    const resolvedBranchId =
      user.branch_id ||
      branches.find((b) => b.branch_name === user.branch)?.branch_id ||
      "";

    setFormData({
      full_name: user.name || "",
      username: user.username || "",
      password: "",
      branch_id: resolvedBranchId,
    });
  }, [isOpen, user, branches]);

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setErrorMsg("");

    try {
      const { full_name, username, branch_id, password } = formData;

      if (!full_name || !username || !branch_id) {
        throw new Error("Full name, username, and branch are required");
      }

      const token = localStorage.getItem("token");
      const payload = { full_name, username, branch_id };
      if (password) payload.password = password;

      const userId = user.id || user.user_id;
      const res = await fetch(`http://localhost:5200/api/users/user/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend error:", data);
        throw new Error(data.error || data.message || "Failed to update user");
      }

      onUpdate?.(data.user || { ...user, ...payload });
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center text-lg font-semibold text-gray-800">
            <UserPlus className="mr-2 h-5 w-5 text-green-600" />
            Edit {role}
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password (optional)</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Branch</label>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              required
              disabled={loadingBranches}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-green-500 focus:outline-none"
            >
              <option value="" disabled>{loadingBranches ? "Loading branches..." : "Select a branch"}</option>
              {branches.map((b) => (
                <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-100" disabled={loadingSubmit}>
              Cancel
            </button>
            <button type="submit" disabled={loadingSubmit} className={`rounded-lg px-4 py-2 font-medium text-white ${loadingSubmit ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}>
              {loadingSubmit ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
