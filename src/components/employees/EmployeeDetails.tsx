import React from 'react';
import { Employee } from '../../types';
import { Mail, Phone, Building2, Calendar, DollarSign, User } from 'lucide-react';

interface EmployeeDetailsProps {
  employee: Employee;
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({ employee }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start space-x-6">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-2xl">
            {employee.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{employee.name}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">{employee.job_title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">{employee.department?.name}</p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
              <p className="text-gray-900 dark:text-white">{employee.email}</p>
            </div>
          </div>

          {employee.phone && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
                <p className="text-gray-900 dark:text-white">{employee.phone}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</p>
              <p className="text-gray-900 dark:text-white">{employee.department?.name || 'Not assigned'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</p>
              <p className="text-gray-900 dark:text-white">{employee.job_title || 'Not specified'}</p>
            </div>
          </div>

          {employee.salary && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Salary</p>
                <p className="text-gray-900 dark:text-white">${employee.salary.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Joined</p>
              <p className="text-gray-900 dark:text-white">
                {new Date(employee.date_of_joining).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee ID</p>
            <p className="text-gray-900 dark:text-white font-mono text-sm">{employee.id.slice(0, 8)}...</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</p>
            <p className="text-green-600 dark:text-green-400 font-semibold">Active</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</p>
            <p className="text-gray-900 dark:text-white">{new Date(employee.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;