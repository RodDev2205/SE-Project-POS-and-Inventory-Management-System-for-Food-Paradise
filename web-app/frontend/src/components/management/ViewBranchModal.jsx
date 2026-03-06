import { useEffect, useState } from "react";
import { X, User } from "lucide-react";
import API_BASE_URL from '../../config/api';

const tabs = ["Branch Info", "Staff", "Menu", "Inventory", "Reports"];

export default function ViewBranchModal({ isOpen, onClose, branch }) {
  // ===== Hooks always run first =====
  const [activeTab, setActiveTab] = useState("Branch Info");
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;


  // ===== Effect to fetch staff safely =====
  useEffect(() => {
    if (!branch || activeTab !== "Staff") return; // early exit inside effect

    const fetchStaff = async () => {
      setLoadingStaff(true);
      setStaffError("");

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/api/superadmin/${branch.branch_id}/staff`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch staff");

        const data = await res.json();
        setStaff(data.staff || []);
      } catch (err) {
        console.error(err);
        setStaffError(err.message);
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, [activeTab, branch]);

  useEffect(() => {
    if (!branch || activeTab !== "Menu") return;

    const fetchMenu = async () => {
      setLoadingMenu(true);
      setMenuError("");
      setCurrentPage(1);

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/api/menu-superadmin/branches/${branch.branch_id}/approved-menu`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch menu");

        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.error(err);
        setMenuError(err.message);
      } finally {
        setLoadingMenu(false);
      }
    };

    fetchMenu();
  }, [activeTab, branch]);


  // ===== Conditional render after hooks =====
  if (!isOpen || !branch) return null;

  // ===== Helper =====
  const formatTime = (timeString) => {
    if (!timeString) return "--";
    const date = new Date(`1970-01-01T${timeString}`);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Pagination Logic
  const totalPages = Math.ceil(menuItems.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = menuItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
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

        {/* Tabs */}
        <div className="flex border-b bg-white px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mr-8 py-3 text-sm font-medium transition
                ${
                  activeTab === tab
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-500 hover:text-green-600"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[320px]">
          {activeTab === "Branch Info" && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <InfoItem label="Contact Number" value={branch.contact} />
              <InfoItem label="Opening Time" value={formatTime(branch.openingTime)} />
              <InfoItem label="Branch Status" value={branch.status || "Active"} />
              <InfoItem label="Closing Time" value={formatTime(branch.closingTime)} />
              <InfoItem label="Created By" value={branch.createdBy || "--"} />
            </div>
          )}

          {activeTab === "Staff" && (
            <>
              {loadingStaff ? (
                <p className="text-gray-500">Loading staff...</p>
              ) : staffError ? (
                <p className="text-red-500">{staffError}</p>
              ) : staff.length === 0 ? (
                <EmptyState text="No staff assigned to this branch." />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {staff.map((user) => (
                    <div
                      key={user.user_id || user.id}
                      className="flex items-center gap-4 rounded-lg border bg-white px-4 py-3 shadow-sm"
                    >
                      <User className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user.role_name} — {user.status === "Activate" ? "Active" : "Deactivated"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "Menu" && (
            <>
              {loadingMenu ? (
                <p className="text-gray-500">Loading menu...</p>
              ) : menuError ? (
                <p className="text-red-500">{menuError}</p>
              ) : menuItems.length === 0 ? (
                <EmptyState text="No approved menu items for this branch." />
              ) : (
                <>
                  {/* Menu Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedItems.map((item) => (
                      <div
                        key={item.product_id}
                        className="rounded-lg border bg-white p-4 shadow-sm"
                      >
                        <div className="h-24 bg-gray-100 rounded mb-3 flex items-center justify-center">
                            {item.image_path ? (
                            <img
                              src={`${API_BASE_URL}${item.image_path}`}
                              alt={item.product_name}
                              className="h-full object-cover rounded"
                            />
                          ) : (
                            "No Image"
                          )}
                        </div>

                        <p className="font-semibold text-gray-800">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.category_name}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          ₱ {item.price}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        Previous
                      </button>

                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-md text-sm font-medium ${
                          currentPage === totalPages
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t bg-gray-50 px-6 py-4">
        </div>
      </div>
    </div>
  );
}

/* ===== Reusable Components ===== */
function InfoItem({ label, value }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-800">{value || "--"}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-gray-50 p-10 text-sm text-gray-500">
      {text}
    </div>
  );
}
