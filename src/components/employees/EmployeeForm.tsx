import React, { useState, useEffect } from 'react';
import { Employee, Department } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface EmployeeFormProps {
  employee: Employee | null;
  departments: Department[];
  onSuccess: () => void;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ employee, departments, onSuccess }) => {
  const { appUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department_id: '',
    job_title: '',
    salary: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    user_email: '',
    user_password: '',
    user_role: 'employee'
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '',
        department_id: employee.department_id || '',
        job_title: employee.job_title || '',
        salary: employee.salary?.toString() || '',
        date_of_joining: employee.date_of_joining,
        user_email: employee.user?.email || '',
        user_password: '',
        user_role: employee.user?.role || 'employee'
      });
    }
  }, [employee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (employee) {
        // Update existing employee
        const { error: empError } = await supabase
          .from('employees')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            department_id: formData.department_id || null,
            job_title: formData.job_title || null,
            salary: formData.salary ? parseFloat(formData.salary) : null,
            date_of_joining: formData.date_of_joining,
          })
          .eq('id', employee.id);

        if (empError) throw empError;

        // Log admin action
        if (appUser?.role === 'admin') {
          await supabase.from('audit_logs').insert({
            admin_id: appUser.id,
            action: 'UPDATE_EMPLOYEE',
            target_type: 'employee',
            target_id: employee.id,
            details: { updated_fields: Object.keys(formData) }
          });
        }
      } else {
        // Create new user first
        const { data: userData, error: userError } = await supabase
          .from('users')
          .insert({
            email: formData.user_email,
            password_hash: '$2a$10$rXKSfmUeYrYJyh4BLzYgp.xGr9JDmHlGKxQ.Wv7JmTuHF8x6r7VaW', // Hashed "password123"
            role: formData.user_role
          })
          .select()
          .single();

        if (userError) throw userError;

        // Create employee record
        const { error: empError } = await supabase
          .from('employees')
          .insert({
            user_id: userData.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            department_id: formData.department_id || null,
            job_title: formData.job_title || null,
            salary: formData.salary ? parseFloat(formData.salary) : null,
            date_of_joining: formData.date_of_joining,
          });

        if (empError) throw empError;

        // Log admin action
        if (appUser?.role === 'admin') {
          await supabase.from('audit_logs').insert({
            admin_id: appUser.id,
            action: 'CREATE_EMPLOYEE',
            target_type: 'employee',
            target_id: userData.id,
            details: { employee_data: formData }
          });
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Error saving employee. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <select
            name="department_id"
            value={formData.department_id}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Title
          </label>
          <input
            type="text"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Salary
          </label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date of Joining *
          </label>
          <input
            type="date"
            name="date_of_joining"
            value={formData.date_of_joining}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {!employee && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Login Email *
              </label>
              <input
                type="email"
                name="user_email"
                value={formData.user_email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Role
              </label>
              <select
                name="user_role"
                value={formData.user_role}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </>
        )}
      </div>

      {!employee && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>Note:</strong> Default password will be "password123". The user should change this after first login.
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{employee ? 'Update Employee' : 'Create Employee'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;