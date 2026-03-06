import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MenuListTab from "../components/management/tabs/MenuListTab";
import InventoryTab from "../components/management/tabs/InventoryTab";

export default function MenuListPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("menu");

  // if navigation set a preferred tab, switch on mount
  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Menu & Inventory Management
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-6">

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-4 py-2 ${
              activeTab === "menu"
                ? "border-b-2 border-green-600 text-green-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Menu List
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 ${
              activeTab === "inventory"
                ? "border-b-2 border-green-600 text-green-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            Inventory
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "menu" && <MenuListTab />}
        {activeTab === "inventory" && <InventoryTab />}
      </div>
    </div>
  );
}
