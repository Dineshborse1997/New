import React, { useState, useEffect } from 'react';
import { Department, Employee } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

interface DepartmentFormProps {
  department: Department | null;
  employees: Employee[];
  onSuccess: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ department, employees, onSuccess }) => {
  const { appUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    manager_id: ''
  });

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        manager_id: department.manager_id || ''
      });
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (department) {
        // Update existing department
        const { error } = await supabase
          .from('departments')
          .update({
            name: formData.name,
            manager_id: formData.manager_id || null,
          })
          .eq('id', department.id);

        if (error) throw error;

        // Log admin action
        if (appUser?.role === 'admin') {
          await supabase.from('audit_logs').insert({
            admin_id: appUser.id,
            action: 'UPDATE_DEPARTMENT',
            target_type: 'department',
            target_id: department.id,
            details: { updated_fields: Object.keys(formData) }
          });
        }
      } else {
        // Create new department
        const { error } = await supabase
          .from('departments')
          .insert({
            name: formData.name,
            manager_id: formData.manager_id || null,
          });

        if (error) throw error;

        // Log admin action
        if (appUser?.role === 'admin') {
          await supabase.from('audit_logs').insert({
            admin_id: appUser.id,
            action: 'CREATE_DEPARTMENT',
            target_type: 'department',
            target_id: null,
            details: { department_data: formData }
          });
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving department:', error);
      alert('Error saving department. Please try again.');
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
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Department Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter department name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Department Manager
        </label>
        <select
          name="manager_id"
          value={formData.manager_id}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Manager (Optional)</option>
          {employees.map(employee => (
            <option key={employee.id} value={employee.id}>
              {employee.name} - {employee.job_title}
            </option>
          ))}
        </select>
      </div>

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
            <span>{department ? 'Update Department' : 'Create Department'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default DepartmentForm;