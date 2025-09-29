import React, { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Department, Employee } from '../types';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import DepartmentForm from '../components/departments/DepartmentForm';

const Departments: React.FC = () => {
  const { appUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          manager:employees!departments_manager_id_fkey (
            id,
            name,
            email
          )
        `)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId);

      if (error) throw error;
      
      // Log admin action
      if (appUser?.role === 'admin') {
        await supabase.from('audit_logs').insert({
          admin_id: appUser.id,
          action: 'DELETE_DEPARTMENT',
          target_type: 'department',
          target_id: departmentId,
          details: { department_id: departmentId }
        });
      }

      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Error deleting department');
    }
  };

  const getDepartmentEmployeeCount = (departmentId: string) => {
    return employees.filter(emp => emp.department_id === departmentId).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage organizational departments</p>
        </div>
        {appUser?.role === 'admin' && (
          <button
            onClick={() => {
              setSelectedDepartment(null);
              setIsEditing(false);
              setIsFormModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(department => {
          const employeeCount = getDepartmentEmployeeCount(department.id);
          
          return (
            <div key={department.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {department.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{department.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {employeeCount} employee{employeeCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                {appUser?.role === 'admin' && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedDepartment(department);
                        setIsEditing(true);
                        setIsFormModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(department.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {department.manager && (
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Manager</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {department.manager.name}
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Team Size</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {employeeCount}
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Created {new Date(department.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No departments found.</p>
          {appUser?.role === 'admin' && (
            <button
              onClick={() => {
                setSelectedDepartment(null);
                setIsEditing(false);
                setIsFormModalOpen(true);
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Create your first department
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? 'Edit Department' : 'Add New Department'}
      >
        <DepartmentForm
          department={isEditing ? selectedDepartment : null}
          employees={employees}
          onSuccess={() => {
            setIsFormModalOpen(false);
            fetchDepartments();
          }}
        />
      </Modal>
    </div>
  );
};

export default Departments;