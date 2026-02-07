import { LogOut, User } from "lucide-react";

const DashboardLayout = ({ navItems, currentPage, setCurrentPage, handleLogout, children }) => {
  return (
    <div className="flex h-screen bg-gray-200">
      <aside className="w-64 bg-white flex flex-col shadow-lg">
        <div className="p-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors text-left font-medium ${
                currentPage === item.id
                  ? "bg-green-200 text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <header className="bg-green-600 text-white rounded-xl p-6 mb-8 flex justify-between items-center shadow-lg">
          <h1 className="text-3xl font-bold">Food Paradise: Admin</h1>
          <div className="flex items-center gap-3">
            <span className="font-medium">Admin Username</span>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <User className="text-green-600" size={24} />
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
