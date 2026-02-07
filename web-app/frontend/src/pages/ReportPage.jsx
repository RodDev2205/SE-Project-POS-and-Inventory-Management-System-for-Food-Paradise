import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, TrendingUp, PhilippinePeso, Package, Users } from 'lucide-react';

export default function ReportPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const summaryCards = [
    { 
      icon: PhilippinePeso, 
      label: 'Total Revenue', 
      value: '₱1,245,680', 
      change: '+12.5%',
      color: 'bg-green-100 text-green-600'
    },
    { 
      icon: Package, 
      label: 'Total Sales', 
      value: '3,456', 
      change: '+8.2%',
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      icon: TrendingUp, 
      label: 'Avg Order Value', 
      value: '₱360', 
      change: '+5.1%',
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      icon: Users, 
      label: 'Active Customers', 
      value: '892', 
      change: '+15.3%',
      color: 'bg-orange-100 text-orange-600'
    },
  ];

  const reportTypes = [
    { name: 'Sales Report', description: 'Detailed sales transactions and revenue', icon: PhilippinePeso },
    { name: 'Inventory Report', description: 'Stock levels and product movement', icon: Package },
    { name: 'Employee Performance', description: 'Staff productivity and metrics', icon: Users },
    { name: 'Financial Summary', description: 'Profit, loss, and cash flow analysis', icon: TrendingUp },
  ];

  const recentReports = [
    { name: 'Monthly Sales Report - November 2024', date: '2024-11-30', size: '2.4 MB' },
    { name: 'Inventory Status - Q4 2024', date: '2024-11-28', size: '1.8 MB' },
    { name: 'Employee Performance - November', date: '2024-11-25', size: '890 KB' },
    { name: 'Financial Summary - October 2024', date: '2024-10-31', size: '3.1 MB' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <select 
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select 
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              <option value="main">Main Branch</option>
              <option value="branch2">Branch 2</option>
              <option value="branch3">Branch 3</option>
            </select>
          </div>

          <button className="ml-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
            Apply Filters
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon size={24} />
                </div>
                <span className="text-sm font-semibold text-green-600">{card.change}</span>
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{card.label}</h3>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Generate Reports */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report, idx) => {
            const Icon = report.icon;
            return (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:bg-green-50 transition cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Icon size={20} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                  <button className="text-green-600 hover:text-green-700">
                    <Download size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Reports</h2>
        <div className="space-y-3">
          {recentReports.map((report, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-gray-500" />
                <div>
                  <h3 className="font-semibold text-gray-800">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.date} • {report.size}</p>
                </div>
              </div>
              <button className="text-green-600 hover:text-green-700 flex items-center gap-2">
                <Download size={18} />
                <span className="text-sm font-semibold">Download</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}