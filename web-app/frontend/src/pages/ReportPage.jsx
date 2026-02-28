import React, { useState } from 'react';
import { Download, Calendar, Filter, TrendingUp, PhilippinePeso, Package, Users, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportPage() {
  const [dateRange, setDateRange] = useState('monthly');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Mock data for sales trend
  const salesTrendData = [
    { date: 'Mon', sales: 12500, target: 15000 },
    { date: 'Tue', sales: 14200, target: 15000 },
    { date: 'Wed', sales: 11800, target: 15000 },
    { date: 'Thu', sales: 16300, target: 15000 },
    { date: 'Fri', sales: 18900, target: 15000 },
    { date: 'Sat', sales: 22100, target: 15000 },
    { date: 'Sun', sales: 19400, target: 15000 },
  ];

  // Mock data for branch comparison
  const branchComparisonData = [
    { branch: 'Main Branch', sales: 95000, transactions: 1250 },
    { branch: 'Branch 2', sales: 72000, transactions: 980 },
    { branch: 'Branch 3', sales: 68000, transactions: 920 },
    { branch: 'Branch 4', sales: 81000, transactions: 1100 },
  ];

  // Calculate branch contribution percentages
  const totalBranchSales = branchComparisonData.reduce((sum, b) => sum + b.sales, 0);
  const branchContribution = branchComparisonData.map((branch, idx) => {
    const percentage = ((branch.sales / totalBranchSales) * 100).toFixed(1);
    const colors = ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6'];
    return {
      name: branch.branch,
      value: parseFloat(percentage),
      color: colors[idx % colors.length],
      sales: branch.sales,
    };
  });

  // Mock data for detailed comparison table
  const detailedComparison = [
    { branch: 'Main Branch', monthlyRevenue: 950000, transactions: 1250, avgOrder: 760, growth: '+12.5%' },
    { branch: 'Branch 2', monthlyRevenue: 720000, transactions: 980, avgOrder: 735, growth: '+8.2%' },
    { branch: 'Branch 3', monthlyRevenue: 680000, transactions: 920, avgOrder: 739, growth: '+5.1%' },
    { branch: 'Branch 4', monthlyRevenue: 810000, transactions: 1100, avgOrder: 736, growth: '+10.3%' },
  ];

  // Mock data for menu performance
  const menuPerformance = [
    { menuItem: 'Iced Coffee', sold: 1245, revenue: 37350, rating: 4.8 },
    { menuItem: 'Pancakes Set', sold: 956, revenue: 43020, rating: 4.7 },
    { menuItem: 'Caesar Salad', sold: 834, revenue: 33360, rating: 4.5 },
    { menuItem: 'Protein Shake', sold: 1123, revenue: 28075, rating: 4.6 },
    { menuItem: 'Grilled Sandwich', sold: 789, revenue: 31560, rating: 4.4 },
  ];

  // KPI Cards
  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '₱3,160,000',
      change: '+12.5%',
      icon: PhilippinePeso,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Total Transactions',
      value: '4,250',
      change: '+8.2%',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Average Order Value',
      value: '₱743',
      change: '+5.1%',
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Active Branches',
      value: '4',
      change: '0%',
      icon: Package,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'Avg Transactions/Day',
      value: '607',
      change: '+3.2%',
      icon: Users,
      color: 'bg-pink-100 text-pink-600',
    },
    {
      title: 'Month-to-Date',
      value: '28 days',
      change: '-2 days',
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.setFontSize(18);
    doc.text('Sales & Performance Report', 40, 40);
    
    doc.setFontSize(12);
    let y = 70;
    
    // KPI Summary
    doc.text('Summary', 40, y);
    y += 20;
    kpiCards.forEach(card => {
      doc.text(`${card.title}: ${card.value} (${card.change})`, 40, y);
      y += 15;
    });
    
    // Branch Comparison Table
    y += 10;
    autoTable(doc, {
      head: [['Branch', 'Monthly Revenue', 'Transactions', 'Avg Order', 'Growth']],
      body: detailedComparison.map(row => [
        row.branch,
        `₱${row.monthlyRevenue.toLocaleString()}`,
        row.transactions,
        `₱${row.avgOrder}`,
        row.growth,
      ]),
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10 },
    });
    
    // Menu Performance Table
    y = doc.lastAutoTable.finalY + 20;
    autoTable(doc, {
      head: [['Menu Item', 'Sold', 'Revenue', 'Rating']],
      body: menuPerformance.map(item => [
        item.menuItem,
        item.sold,
        `₱${item.revenue.toLocaleString()}`,
        `${item.rating} ⭐`,
      ]),
      startY: y,
      theme: 'grid',
      styles: { fontSize: 10 },
    });
    
    doc.save('sales_report.pdf');
  };

  const handleExportCSV = () => {
    let csv = 'Sales & Performance Report\n\n';
    csv += 'Summary\n';
    csv += 'Metric,Value,Change\n';
    kpiCards.forEach(card => {
      csv += `${card.title},${card.value},${card.change}\n`;
    });
    
    csv += '\n\nBranch Comparison\n';
    csv += 'Branch,Monthly Revenue,Transactions,Avg Order,Growth\n';
    detailedComparison.forEach(row => {
      csv += `${row.branch},₱${row.monthlyRevenue},${row.transactions},₱${row.avgOrder},${row.growth}\n`;
    });
    
    csv += '\n\nMenu Performance\n';
    csv += 'Menu Item,Sold,Revenue,Rating\n';
    menuPerformance.forEach(item => {
      csv += `${item.menuItem},${item.sold},₱${item.revenue},${item.rating}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900">Sales & Performance Report</h1>
        <p className="text-gray-600 text-sm mt-1">Real-time analytics across all branches</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-600" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Branches</option>
                  <option value="main">Main Branch</option>
                  <option value="branch2">Branch 2</option>
                  <option value="branch3">Branch 3</option>
                  <option value="branch4">Branch 4</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={18} />
                CSV
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                <Download size={18} />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-sm font-semibold text-green-600">{card.change}</span>
                </div>
                <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Sales Trend Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => `₱${value.toLocaleString()}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#059669"
                strokeWidth={3}
                dot={{ fill: '#059669', r: 5 }}
                name="Actual Sales"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#d1d5db"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Comparison Bar Chart & Payment Breakdown Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branch Comparison */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Comparison</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="branch" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `₱${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="sales" fill="#059669" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Branch Contribution Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Branch Contribution %</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={branchContribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {branchContribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detailed Branch Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Branch</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Monthly Revenue</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Transactions</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Avg Order Value</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Growth</th>
                </tr>
              </thead>
              <tbody>
                {detailedComparison.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.branch}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">₱{row.monthlyRevenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.transactions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">₱{row.avgOrder}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{row.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Menu Performance Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Menu Items</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Menu Item</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Units Sold</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-900">Rating</th>
                </tr>
              </thead>
              <tbody>
                {menuPerformance.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.menuItem}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.sold.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">₱{item.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                        {item.rating} ⭐
                      </span>
                    </td>
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