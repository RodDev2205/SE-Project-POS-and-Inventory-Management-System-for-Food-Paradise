import { useEffect, useState } from "react";
import { X, UserPlus } from "lucide-react";

export default function EditAdminModal({
  isOpen,
  onClose,
  admin,       // 👈 admin data to edit
  onSubmit,    // 👈 submit handler
}) {
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

  /* ================= PREFILL DATA ================= */
  useEffect(() => {
    if (!isOpen || !admin) return;

    setFormData({
      full_name: admin.full_name || "",
      username: admin.username || "",
      password: "", // leave empty on edit
      branch_id: admin.branch_id || "",
    });
  }, [isOpen, admin]);

  /* ================= FETCH BRANCHES ================= */
  useEffect(() => {
    if (!isOpen) return;

    const fetchBranches = async () => {
      setLoadingBranches(true);
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5200/api/branches/getAll", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch branches");

        const data = await res.json();
        setBranches(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [isOpen]);

  if (!isOpen || !admin) return null;

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
      const payload = {
        full_name: formData.full_name,
        username: formData.username,
        branch_id: formData.branch_id,
        ...(formData.password && { password: formData.password }),
      };

      await onSubmit(admin.user_id, payload);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to update admin");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        
        {/* ================= HEADER ================= */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center text-lg font-semibold text-gray-800">
            <UserPlus className="mr-2 h-5 w-5 text-green-600" />
            Edit Admin
          </h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* ================= FORM ================= */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <p className="text-sm text-red-500">{errorMsg}</p>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Password (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password (optional)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Branch
            </label>
            <select
              name="branch_id"
              required
              value={formData.branch_id}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-green-500 focus:outline-none"
            >
              <option value="" disabled>
                {loadingBranches ? "Loading branches..." : "Select a branch"}
              </option>

              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-100"
              disabled={loadingSubmit}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loadingSubmit}
              className={`rounded-lg px-4 py-2 font-medium text-white ${
                loadingSubmit
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loadingSubmit ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
