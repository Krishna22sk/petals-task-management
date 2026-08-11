-- Seed Data for Petals Automation Task Management Database

USE petals_task_management;

-- Insert Roles
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'Admin', 'Full administrative authority across system settings, user roles, and reporting'),
(2, 'Team Leader', 'Can assign tasks, review code/designs, and manage project schedules'),
(3, 'Employee', 'Can execute assigned tasks, update checklists, log hours, and post comments');

-- Insert Departments
INSERT INTO departments (department_id, department_name, code) VALUES
(1, 'Embedded Systems', 'DEPT-EMB'),
(2, 'Automation & Robotics', 'DEPT-AUT'),
(3, 'Hardware & PCB Design', 'DEPT-PCB'),
(4, 'SCADA & Industrial Software', 'DEPT-SCA'),
(5, 'Quality Assurance & Compliance', 'DEPT-QAC');

-- No seed data for users, employees, projects, or tasks.
-- Create them through the application UI.

