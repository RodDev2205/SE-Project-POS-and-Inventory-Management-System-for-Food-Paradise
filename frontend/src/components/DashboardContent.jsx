import React from 'react';
import { PhilippinePeso, Package, AlertTriangle, Users } from 'lucide-react';

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
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Daily Sales"
          value="₱5,432"
          icon={PhilippinePeso}
          bgColor="bg-green-50"
          textColor="text-green-800"
        />
        <StatCard
          title="Current Inventory"
          value="456 Items"
          icon={Package}
          bgColor="bg-amber-50"
          textColor="text-amber-700"
        />
        <StatCard
          title="Low Stock Alerts"
          value="14 Items"
          icon={AlertTriangle}
          bgColor="bg-red-50"
          textColor="text-red-700"
        />
        <StatCard
          title="Active Cashiers"
          value="8"
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

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent POS Transactions</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#9876</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">John Doe</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">$45.50</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1:50 PM</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#9875</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Jane Smith</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">$12.99</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1:45 PM</td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#9874</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">John Doe</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">$78.25</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1:40 PM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardContent;
