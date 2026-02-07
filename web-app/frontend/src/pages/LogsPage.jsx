import React, { useState } from 'react';
import { Search, Filter, Calendar, Download, Clock, User, Activity, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('today');

  const activityLogs = [
    {
      id: 1,
      user: 'John Doe',
      action: 'Created new sale transaction',
      details: 'Sale #12345 - ₱1,250.00',
      timestamp: '2024-12-01 14:30:25',
      type: 'success',
      branch: 'Main Branch'
    },
    {
      id: 2,
      user: 'Maria Santos',
      action: 'Updated inventory stock',
      details: 'Product: Rice 25kg - Added 50 units',
      timestamp: '2024-12-01 14:15:10',
      type: 'info',
      branch: 'Branch 2'
    },
    {
      id: 3,
      user: 'Admin',
      action: 'Failed login attempt',
      details: 'Invalid credentials from IP: 192.168.1.105',
      timestamp: '2024-12-01 13:45:33',
      type: 'error',
      branch: 'Main Branch'
    },
    {
      id: 4,
      user: 'Pedro Cruz',
      action: 'Generated sales report',
      details: 'Monthly Report - November 2024',
      timestamp: '2024-12-01 13:20:15',
      type: 'success',
      branch: 'Branch 3'
    },
    {
      id: 5,
      user: 'Ana Reyes',
      action: 'Added new employee',
      details: 'Employee: Juan dela Cruz - Cashier',
      timestamp: '2024-12-01 12:55:40',
      type: 'success',
      branch: 'Main Branch'
    },
    {
      id: 6,
      user: 'System',
      action: 'Low stock alert',
      details: 'Product: Cooking Oil 1L - Only 5 units left',
      timestamp: '2024-12-01 12:30:00',
      type: 'warning',
      branch: 'Branch 2'
    },
    {
      id: 7,
      user: 'Carlos Ramos',
      action: 'Voided transaction',
      details: 'Sale #12340 - Reason: Customer request',
      timestamp: '2024-12-01 11:45:22',
      type: 'warning',
      branch: 'Main Branch'
    },
    {
      id: 8,
      user: 'Lisa Garcia',
      action: 'Updated product price',
      details: 'Product: Sugar 1kg - From ₱65 to ₱70',
      timestamp: '2024-12-01 11:20:15',
      type: 'info',
      branch: 'Branch 3'
    },
    {
      id: 9,
      user: 'Admin',
      action: 'Backup completed',
      details: 'Database backup saved successfully',
      timestamp: '2024-12-01 10:00:00',
      type: 'success',
      branch: 'System'
    },
    {
      id: 10,
      user: 'Roberto Santos',
      action: 'Deleted expired product',
      details: 'Product: Canned Goods - Batch #2024-09',
      timestamp: '2024-12-01 09:30:45',
      type: 'error',
      branch: 'Branch 2'
    },
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-600" />;
      case 'info':
        return <Info size={20} className="text-blue-600" />;
      default:
        return <Activity size={20} className="text-gray-600" />;
    }
  };

  const getActivityBadge = (type) => {
    const badges = {
      success: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
      warning: 'bg-yellow-100 text-yellow-700',
      info: 'bg-blue-100 text-blue-700'
    };
    return badges[type] || 'bg-gray-100 text-gray-700';
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || log.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const activityStats = [
    { label: 'Total Activities', value: activityLogs.length, color: 'text-blue-600' },
    { label: 'Success', value: activityLogs.filter(l => l.type === 'success').length, color: 'text-green-600' },
    { label: 'Warnings', value: activityLogs.filter(l => l.type === 'warning').length, color: 'text-yellow-600' },
    { label: 'Errors', value: activityLogs.filter(l => l.type === 'error').length, color: 'text-red-600' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Activity Logs & Records</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {activityStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-5">
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities, users, or details..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter by Type */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="success">Success</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Export Button */}
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(log.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-800">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-800">{log.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{log.details}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActivityBadge(log.type)}`}>
                      {log.branch}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} />
                      {log.timestamp}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No activity logs found</p>
          </div>
        )}
      </div>
    </div>
  );
}