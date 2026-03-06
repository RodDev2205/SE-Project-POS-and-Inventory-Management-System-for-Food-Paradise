import React from 'react';
import { PhilippinePeso, Package, AlertTriangle, Users } from 'lucide-react';
import API_BASE_URL from '../config/api';

const StatCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
  <div className={`p-6 rounded-xl shadow hover:shadow-xl transition duration-300 flex items-center justify-between ${bgColor}`}>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${textColor} mt-1`}>{value}</p>
    </div>
    <Icon className={`w-8 h-8 ${textColor}`} />
  </div>
);

const BarChartPlaceholder = () => (
  <div className="h-64 bg-gray-50 p-4 rounded-lg shadow flex items-end justify-around">
    {[...Array(7)].map((_, i) => (
      <div 
        key={i} 
        className={`w-8 rounded-t-lg transition-all duration-500 ${i % 2 === 0 ? 'bg-green-600' : 'bg-blue-500'}`} 
        style={{ height: `${Math.floor(Math.random() * (90 - 30 + 1) + 30)}%` }} 
      />
    ))}
  </div>
);

const LineChartPlaceholder = () => (
  <div className="h-64 bg-gray-50 p-4 rounded-lg shadow relative">
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline 
        fill="none" 
        stroke="rgb(22, 163, 74)" 
        strokeWidth="2" 
        points="0,80 15,65 30,50 45,75 60,40 75,55 90,30 100,20" 
      />
      <polyline 
        fill="none" 
        stroke="rgb(59, 130, 246)" 
        strokeWidth="2" 
        points="0,30 15,45 30,60 45,35 60,70 75,55 90,80 100,90" 
      />
    </svg>
    <div className="absolute top-2 left-6 text-sm text-gray-500">Sales vs. Orders Trend</div>
  </div>
);

const DashboardContent = () => {
  const [inventoryCount, setInventoryCount] = React.useState(0);
  const [lowStockCount, setLowStockCount] = React.useState(0);
  const [branchSales, setBranchSales] = React.useState([]);
  const [branches, setBranches] = React.useState([]);
  const [activeUsers, setActiveUsers] = React.useState(0);
  const [recentTransactions, setRecentTransactions] = React.useState({});

  React.useEffect(() => {
    const token = localStorage.getItem("token");

    // fetch total inventory count
    fetch(`${API_BASE_URL}/api/inventory/count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setInventoryCount(data.count);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch inventory count", err);
      });

    // fetch low stock count
    fetch(`${API_BASE_URL}/api/inventory/low-stock-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setLowStockCount(data.count);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch low stock count", err);
      });

    // fetch branch sales summary
    fetch(`${API_BASE_URL}/api/sales-superadmin/branch-sales-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.branches)) setBranchSales(data.branches);
      })
      .catch((err) => console.error('Failed to fetch branch sales', err));

    // fetch dashboard stats (includes active employees)
    fetch(`${API_BASE_URL}/api/sales-superadmin/dashboard-stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.active_employees === 'number') setActiveUsers(data.active_employees);
      })
      .catch((err) => console.error('Failed to fetch dashboard stats', err));

    // branches will be derived from branchSales in a later effect; no need to hit a separate endpoint
    // (original code attempted to call `/api/branches` which does not exist on the deployed backend).
    // The effect below watching `branchSales` will populate `branches` and then fetch recent transactions.
    
    // nothing else here


    // If branches endpoint doesn't exist, fallback to using branchSales for branch list
    // (branchSales may arrive slightly later; handle in a separate effect)
  }, []);

  // derive branches from branchSales when branches endpoint is not available
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if ((!branches || branches.length === 0) && branchSales && branchSales.length) {
      const derived = branchSales.map((b) => ({ id: b.branch_id ?? b.id, name: b.branch_name ?? b.name }));
      setBranches(derived);

      // fetch recent transactions for derived branches
      (async () => {
        const txMap = {};
        await Promise.all(
          derived.map(async (b) => {
            const bId = b.id;
            if (!bId) return;
            // try only the sales-superadmin endpoint; silently ignore failures
            try {
              const r = await fetch(`${API_BASE_URL}/api/sales-superadmin/recent-transactions?branchId=${bId}&limit=3`, { headers: { Authorization: `Bearer ${token}` } });
              if (r.ok) {
                const json = await r.json();
                if (Array.isArray(json)) {
                  txMap[bId] = json.slice(0, 3);
                } else if (json && Array.isArray(json.transactions)) {
                  txMap[bId] = json.transactions.slice(0, 3);
                }
              }
            } catch (e) {
              // ignore network/parse errors, the endpoint may not exist on this backend
            }
          })
        );
        setRecentTransactions((prev) => ({ ...prev, ...txMap }));
      })();
    }
  }, [branchSales]);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Daily Sales"
          value={branchSales && branchSales.length ? `₱${Number(branchSales.reduce((s, b) => s + (Number(b.total_sales) || 0), 0)).toLocaleString()}` : '₱0'}
          icon={PhilippinePeso}
          bgColor="bg-green-50"
          textColor="text-green-800"
        />
        <StatCard
          title="Current Inventory"
          value={`${inventoryCount} Items`}
          icon={Package}
          bgColor="bg-amber-50"
          textColor="text-amber-700"
        />
        <StatCard
          title="Low Stock Alerts"
          value={`${lowStockCount} Items`}
          icon={AlertTriangle}
          bgColor="bg-red-50"
          textColor="text-red-700"
        />
        <StatCard
          title="Active Cashiers"
          value={`${activeUsers} Users`}
          icon={Users}
          bgColor="bg-white"
          textColor="text-indigo-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Revenue by Category</h3>
          <BarChartPlaceholder /> 
          <p className="text-center text-sm text-gray-500 mt-2">Placeholder: Green (Food) and Blue (Drinks) revenue breakdown.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Daily Transaction Trends</h3>
          <LineChartPlaceholder />
          <p className="text-center text-sm text-gray-500 mt-2">Placeholder: Sales (Green) vs. Order Count (Blue) over the last week.</p>
        </div>
      </div>


      {/* Recent Transactions (flattened recent items up to 3 per branch) */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent POS Transactions</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.values(recentTransactions)
                .flat()
                .slice(0, 12) // show up to 12 rows (e.g., 3 per up to 4 branches)
                .map((t) => (
                  <tr key={t.transaction_id || t.id || t.tx_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t.transaction_number || t.id || t.tx_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.cashier_username || t.cashier || t.user}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">₱{Number(t.total_amount || t.amount || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.created_at || t.time || t.timestamp || t.date ? new Date(t.created_at || t.time || t.timestamp || t.date).toLocaleString(undefined, { hour: 'numeric', minute: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' }) : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{t.status}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
