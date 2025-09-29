/*
# Employee Management System Database Schema

1. New Tables
   - `users` - Authentication and role management
     - `id` (uuid, primary key)
     - `email` (text, unique)
     - `password_hash` (text)
     - `role` (text: 'admin' or 'employee')
     - `created_at` (timestamp)
   - `departments` - Department information
     - `id` (uuid, primary key)
     - `name` (text, unique)
     - `manager_id` (uuid, foreign key to employees)
     - `created_at` (timestamp)
   - `employees` - Employee details
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to users)
     - `name` (text)
     - `email` (text, unique)
     - `phone` (text)
     - `department_id` (uuid, foreign key to departments)
     - `job_title` (text)
     - `salary` (numeric)
     - `date_of_joining` (date)
     - `created_at` (timestamp)
   - `attendance` - Employee attendance records
     - `id` (uuid, primary key)
     - `employee_id` (uuid, foreign key to employees)
     - `date` (date)
     - `status` (text: 'present', 'absent', 'late')
     - `created_at` (timestamp)
   - `notifications` - System notifications
     - `id` (uuid, primary key)
     - `user_id` (uuid, foreign key to users)
     - `title` (text)
     - `message` (text)
     - `read` (boolean, default false)
     - `created_at` (timestamp)
   - `audit_logs` - Admin action logging
     - `id` (uuid, primary key)
     - `admin_id` (uuid, foreign key to users)
     - `action` (text)
     - `target_type` (text)
     - `target_id` (uuid)
     - `details` (jsonb)
     - `created_at` (timestamp)

2. Security
   - Enable RLS on all tables
   - Add policies for role-based access control
   - Admin users can access all data
   - Employee users can only access their own data
*/

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
  created_at timestamptz DEFAULT now()
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  manager_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  department_id uuid REFERENCES departments(id),
  job_title text,
  salary numeric(10,2),
  date_of_joining date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for department manager
ALTER TABLE departments 
ADD CONSTRAINT departments_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES employees(id);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Admin can access all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for departments table
CREATE POLICY "Admin can manage departments" ON departments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Everyone can read departments" ON departments
  FOR SELECT TO authenticated
  USING (true);

-- RLS Policies for employees table
CREATE POLICY "Admin can manage all employees" ON employees
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Employees can read own data" ON employees
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Employees can update own data" ON employees
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for attendance table
CREATE POLICY "Admin can manage all attendance" ON attendance
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Employees can read own attendance" ON attendance
  FOR SELECT TO authenticated
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for notifications table
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for audit_logs table
CREATE POLICY "Admin can read audit logs" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Insert sample data
DO $$
BEGIN
  -- Insert admin user (password: admin123)
  INSERT INTO users (id, email, password_hash, role) VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@company.com', '$2a$10$rXKSfmUeYrYJyh4BLzYgp.xGr9JDmHlGKxQ.Wv7JmTuHF8x6r7VaW', 'admin')
  ON CONFLICT (email) DO NOTHING;
  
  -- Insert sample departments
  INSERT INTO departments (id, name) VALUES 
    ('d1111111-1111-4444-8888-123456789abc', 'Engineering'),
    ('d2222222-2222-4444-8888-123456789abc', 'Human Resources'),
    ('d3333333-3333-4444-8888-123456789abc', 'Marketing'),
    ('d4444444-4444-4444-8888-123456789abc', 'Finance')
  ON CONFLICT (name) DO NOTHING;
  
  -- Insert sample employee users
  INSERT INTO users (id, email, password_hash, role) VALUES 
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'john.doe@company.com', '$2a$10$rXKSfmUeYrYJyh4BLzYgp.xGr9JDmHlGKxQ.Wv7JmTuHF8x6r7VaW', 'employee'),
    ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'jane.smith@company.com', '$2a$10$rXKSfmUeYrYJyh4BLzYgp.xGr9JDmHlGKxQ.Wv7JmTuHF8x6r7VaW', 'employee')
  ON CONFLICT (email) DO NOTHING;
  
  -- Insert sample employees
  INSERT INTO employees (id, user_id, name, email, phone, department_id, job_title, salary, date_of_joining) VALUES 
    ('emp00001-1111-4444-8888-123456789abc', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'John Doe', 'john.doe@company.com', '123-456-7890', 'd1111111-1111-4444-8888-123456789abc', 'Senior Developer', 75000.00, '2023-01-15'),
    ('emp00002-2222-4444-8888-123456789abc', 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jane Smith', 'jane.smith@company.com', '123-456-7891', 'd2222222-2222-4444-8888-123456789abc', 'HR Manager', 65000.00, '2023-03-01')
  ON CONFLICT (email) DO NOTHING;
  
  -- Insert sample attendance records
  INSERT INTO attendance (employee_id, date, status) VALUES 
    ('emp00001-1111-4444-8888-123456789abc', CURRENT_DATE - INTERVAL '1 day', 'present'),
    ('emp00001-1111-4444-8888-123456789abc', CURRENT_DATE - INTERVAL '2 days', 'present'),
    ('emp00002-2222-4444-8888-123456789abc', CURRENT_DATE - INTERVAL '1 day', 'late'),
    ('emp00002-2222-4444-8888-123456789abc', CURRENT_DATE - INTERVAL '2 days', 'present')
  ON CONFLICT (employee_id, date) DO NOTHING;
END $$;