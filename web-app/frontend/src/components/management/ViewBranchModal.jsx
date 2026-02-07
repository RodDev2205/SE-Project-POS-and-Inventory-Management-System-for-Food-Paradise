import { useEffect, useState } from "react";
import { X, User } from "lucide-react";

/* ================= CONSTANTS ================= */
const tabs = ["Branch Info", "Staff", "Menu", "Inventory", "Reports"];

const ROLE_MAP = {
  1: "Cashier",
  2: "Admin",
};

/* ================= COMPONENT ================= */
export default function ViewBranchModal({ isOpen, onClose, branch }) {
  const [activeTab, setActiveTab] = useState("Branch Info");
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState("");

  /* ================= FETCH STAFF ================= */
  useEffect(() => {
    if (!isOpen || !branch || activeTab !== "Staff") return;

    const fetchStaff = async () => {
      setLoadingStaff(true);
      setStaffError("");

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5200/api/superadmin/${branch.branch_id}/staff`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch staff");

        const data = await res.json();

        const normalizedStaff = (data.staff || []).map((u) => ({
          ...u,
          role: ROLE_MAP[u.role_id] || "Unknown",
        }));

        setStaff(normalizedStaff);
      } catch (err) {
        console.error(err);
        setStaffError(err.message);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [activeTab, branch, isOpen]);

  /* ================= GUARD ================= */
  if (!isOpen || !branch) return null;

  /* ================= HELPERS ================= */
  const formatTime = (time) => {
    if (!time) return "--";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const admins = staff.filter((u) => u.role === "Admin");
  const cashiers = staff.filter((u) => u.role === "Cashier");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
        
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {branch.name || branch.branchName}
            </h2>
            <p className="text-sm text-gray-500">{branch.address}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-200 hover:text-red-500"
          >
            <X size={22} />
          </button>
        </div>

        {/* ================= TABS ================= */}
        <div className="flex border-b bg-white px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mr-8 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-500 hover:text-green-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ================= CONTENT ================= */}
        <div className="min-h-[320px] p-6">
          
          {/* ===== Branch Info ===== */}
          {activeTab === "Branch Info" && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InfoItem label="Contact Number" value={branch.contact} />
              <InfoItem label="Opening Time" value={formatTime(branch.openingTime)} />
              <InfoItem label="Closing Time" value={formatTime(branch.closingTime)} />
              <InfoItem label="Branch Status" value={branch.status || "Active"} />
              <InfoItem label="Created By" value={branch.createdBy || "--"} />
            </div>
          )}

          {/* ===== Staff ===== */}
          {activeTab === "Staff" && (
            <>
              {loadingStaff ? (
                <p className="text-gray-500">Loading staff...</p>
              ) : staffError ? (
                <p className="text-red-500">{staffError}</p>
              ) : staff.length === 0 ? (
                <EmptyState text="No staff assigned to this branch." />
              ) : (
                <div className="space-y-8">
                  
                  {/* ===== ADMINS ===== */}
                  <StaffGroup title="Admins" users={admins} />

                  {/* ===== CASHIERS ===== */}
                  <StaffGroup title="Cashiers" users={cashiers} />
                </div>
              )}
            </>
          )}

          {activeTab === "Menu" && <EmptyState text="Branch menu items will appear here." />}
          {activeTab === "Inventory" && <EmptyState text="Inventory status and alerts go here." />}
          {activeTab === "Reports" && <EmptyState text="Sales and performance reports go here." />}
        </div>

        {/* ================= FOOTER ================= */}
        <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE ================= */

function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-800">
        {value || "--"}
      </p>
    </div>
  );
}

function StaffGroup({ title, users }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500">No {title.toLowerCase()} assigned.</p>
        ) : (
          users.map((user) => (
            <StaffCard key={user.user_id || user.id} user={user} />
          ))
        )}
      </div>
    </div>
  );
}

function StaffCard({ user }) {
  const isActive = user.status === "Activate";

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-white px-4 py-3 shadow-sm">
      <User className="h-6 w-6 text-green-600" />
      <div>
        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
        <p className="text-xs text-gray-500">{user.role}</p>
        <p className={`text-xs ${isActive ? "text-green-600" : "text-red-500"}`}>
          {isActive ? "Active" : "Deactivated"}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex items-center justify-center rounded-lg border border-dashed bg-gray-50 p-10 text-sm text-gray-500">
      {text}
    </div>
  );
}
