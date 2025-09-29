export interface User {
  id: string;
  email: string;
  role: 'admin' | 'employee';
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  manager_id: string | null;
  created_at: string;
  manager?: Employee;
}

export interface Employee {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  department_id: string | null;
  job_title: string | null;
  salary: number | null;
  date_of_joining: string;
  created_at: string;
  department?: Department;
  user?: User;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  created_at: string;
  employee?: Employee;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Record<string, any> | null;
  created_at: string;
  admin?: User;
}

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  presentToday: number;
  recentHires: number;
}