import React, {useState} from 'react';
import { UserCircle, Users } from 'lucide-react';

export default function EmployeeTable ({employees, type }) {
    return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">{type} List</h2>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center font-medium">
                    {type === 'Admin' ? <UserCircle className="w-4 h-4 mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                        Add {type}
                </button>
    </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Login</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                     </tr>
                 </thead>
            <tbody className="divide-y divide-gray-200">
                {employees.map(employee => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{employee.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{employee.branch}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{employee.username}</td>
                        <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        employee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                        {employee.status}
                    </span>
                </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{employee.lastLogin}</td>
                    <td className="px-6 py-4">
                        <div className="flex space-x-3">
                    <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">Edit</button>
                    </div>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
    )
}