import React, { useEffect, useState } from 'react';
import { Users, Building2, CheckCircle, Calendar, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DashboardStats, Employee } from '../types';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/common/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { appUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEmployees, setRecentEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appUser?.role === 'admin') {
      fetchAdminDashboardData();
    } else {
      fetchEmployeeDashboardData();
    }
  }, [appUser]);

  const fetchAdminDashboardData = async () => {
    try {
      // Fetch stats
      const [employeesRes, departmentsRes, attendanceRes, recentRes] = await Promise.all([
        supabase.from('employees').select('id', { count: 'exact', head: true }),
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('date', new Date().toISOString().split('T')[0])
          .eq('status', 'present'),
        supabase
          .from('employees')
          .select('*, departments(name)')
          .gte('date_of_joining', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalEmployees: employeesRes.count || 0,
        totalDepartments: departmentsRes.count || 0,
        presentToday: attendanceRes.count || 0,
        recentHires: recentRes.data?.length || 0,
      });

      setRecentEmployees(recentRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDashboardData = async () => {
    try {
      // For employees, fetch their own stats
      const { data: employee } = await supabase
        .from('employees')
        .select('*, departments(name), attendance(*)')
        .eq('user_id', appUser?.id)
        .single();

      if (employee) {
        const presentDays = employee.attendance?.filter((a: any) => a.status === 'present').length || 0;
        const totalDays = employee.attendance?.length || 0;
        
        setStats({
          totalEmployees: 1, // Just themselves
          totalDepartments: 1, // Their department
          presentToday: employee.attendance?.some((a: any) => 
            a.date === new Date().toISOString().split('T')[0] && a.status === 'present'
          ) ? 1 : 0,
          recentHires: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0, // Attendance percentage
        });
        
        setRecentEmployees([employee]);
      }
    } catch (error) {
      console.error('Error fetching employee dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (appUser?.role === 'admin') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, Admin! Here's your overview.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon={Users}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Departments"
            value={stats?.totalDepartments || 0}
            icon={Building2}
            color="green"
          />
          <StatsCard
            title="Present Today"
            value={stats?.presentToday || 0}
            icon={CheckCircle}
            color="purple"
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="New Hires (30d)"
            value={stats?.recentHires || 0}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        {/* Recent Employees */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Hires</h2>
          <div className="space-y-4">
            {recentEmployees.length > 0 ? (
              recentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{employee.job_title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {employee.department?.name} • Joined {new Date(employee.date_of_joining).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">No recent hires</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Employee Dashboard
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your personal overview.</p>
        </div>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Status"
          value="Active"
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Department"
          value={recentEmployees[0]?.department?.name || 'N/A'}
          icon={Building2}
          color="blue"
        />
        <StatsCard
          title="Present Today"
          value={stats?.presentToday ? 'Yes' : 'No'}
          icon={Calendar}
          color={stats?.presentToday ? 'green' : 'red'}
        />
        <StatsCard
          title="Attendance Rate"
          value={`${stats?.recentHires || 0}%`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Profile Summary */}
      {recentEmployees[0] && (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Profile</h2>
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-2xl">
                {recentEmployees[0].name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{recentEmployees[0].name}</h3>
              <p className="text-gray-600 dark:text-gray-400">{recentEmployees[0].job_title}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {recentEmployees[0].department?.name} • Joined {new Date(recentEmployees[0].date_of_joining).toLocaleDateString()}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>📧 {recentEmployees[0].email}</span>
                {recentEmployees[0].phone && <span>📞 {recentEmployees[0].phone}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Today's Schedule</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">View your attendance and schedule</p>
        </div>
        
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Team Directory</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Connect with your colleagues</p>
        </div>
        
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 dark:border-gray-700/20 p-6 text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-purple-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Leave Requests</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your time off</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;