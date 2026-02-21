import React from "react";
import { Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminReportsPage() {
  const kpis = [
    { title: "Total Sales Today", value: "₱45,320" },
    { title: "Total Transactions", value: "312" },
    { title: "Average Order Value", value: "₱145.20" },
    { title: "Low Stock Items", value: "7 Items" },
  ];

  const salesTrend = [
    { date: "Mon", sales: 12000 },
    { date: "Tue", sales: 18000 },
    { date: "Wed", sales: 15000 },
    { date: "Thu", sales: 22000 },
    { date: "Fri", sales: 30000 },
    { date: "Sat", sales: 45000 },
    { date: "Sun", sales: 38000 },
  ];

  const salesByCategory = [
    { name: "Food", value: 40000 },
    { name: "Drinks", value: 15000 },
    { name: "Desserts", value: 10000 },
    { name: "Add-ons", value: 8000 },
  ];

  const paymentMethods = [
    { name: "Cash", value: 30000 },
    { name: "GCash", value: 20000 },
    { name: "Card", value: 15000 },
  ];

  const topProducts = [
    { name: "Burger", qty: 230, revenue: "₱23,000", profit: "₱8,000" },
    { name: "Fries", qty: 180, revenue: "₱12,600", profit: "₱4,500" },
    { name: "Milk Tea", qty: 150, revenue: "₱15,000", profit: "₱6,200" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Branch Reports</h1>
          <p className="text-gray-500 text-sm">
            CDO Main Branch | Jan 1 - Jan 31
          </p>
        </div>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl shadow-md hover:opacity-90">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition"
          >
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="text-2xl font-bold mt-2">{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Weekly Sales Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Sales by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Sales by Payment Method
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethods}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {paymentMethods.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">
            Top Selling Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Product</th>
                  <th>Qty Sold</th>
                  <th>Revenue</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 transition"
                  >
                    <td className="py-2">{product.name}</td>
                    <td>{product.qty}</td>
                    <td>{product.revenue}</td>
                    <td>{product.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
