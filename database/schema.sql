-- Student Management System Database Schema
-- Database: student_management_system

-- Set proper collation
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create database
CREATE DATABASE IF NOT EXISTS student_management_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE student_management_system;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users table (for admin authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'teacher', 'student') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Classes table
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL,
    grade_level VARCHAR(20) NOT NULL,
    section VARCHAR(10) DEFAULT 'A',
    capacity INT DEFAULT 30,
    academic_year VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Students table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admission_number VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    gender ENUM('Male', 'Female', 'Other') DEFAULT 'Other',
    date_of_birth DATE,
    address TEXT,
    class_id INT,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(100),
    admission_date DATE NOT NULL,
    status ENUM('Active', 'Inactive', 'Graduated', 'Dropped') DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for better performance
CREATE INDEX idx_students_admission ON students(admission_number);
CREATE INDEX idx_students_class ON students(class_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_admission_date ON students(admission_date);
CREATE INDEX idx_classes_grade ON classes(grade_level);
CREATE INDEX idx_classes_year ON classes(academic_year);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@school.edu', '$2y$10$uAXDpoDpqSU263DlS1dLgusKlhk4DxoaFNe6A9X8YJt/928BiKhpm', 'System Administrator', 'admin');

-- Insert sample classes
INSERT INTO classes (class_name, grade_level, section, capacity, academic_year) VALUES
('Class 1-A', '1', 'A', 30, '2024-2025'),
('Class 1-B', '1', 'B', 30, '2024-2025'),
('Class 2-A', '2', 'A', 30, '2024-2025'),
('Class 2-B', '2', 'B', 30, '2024-2025'),
('Class 3-A', '3', 'A', 30, '2024-2025'),
('Class 3-B', '3', 'B', 30, '2024-2025'),
('Class 4-A', '4', 'A', 30, '2024-2025'),
('Class 5-A', '5', 'A', 30, '2024-2025'),
('Class 6-A', '6', 'A', 30, '2024-2025'),
('Class 7-A', '7', 'A', 30, '2024-2025'),
('Class 8-A', '8', 'A', 30, '2024-2025'),
('Class 9-A', '9', 'A', 30, '2024-2025'),
('Class 10-A', '10', 'A', 30, '2024-2025');

-- Insert sample students
INSERT INTO students (admission_number, full_name, email, phone, gender, date_of_birth, address, class_id, guardian_name, guardian_phone, guardian_email, admission_date, status, notes) VALUES
('ADM2024001', 'John Smith', 'john.smith@email.com', '555-0101', 'Male', '2010-05-15', '123 Main St, Cityville', 1, 'Mr. Smith', '555-0102', 'parent.smith@email.com', '2024-01-15', 'Active', 'Good student'),
('ADM2024002', 'Emma Johnson', 'emma.j@email.com', '555-0103', 'Female', '2010-08-22', '456 Oak Ave, Townsburg', 1, 'Mrs. Johnson', '555-0104', 'parent.johnson@email.com', '2024-01-16', 'Active', 'Excellent in math'),
('ADM2024003', 'Michael Chen', 'michael.c@email.com', '555-0105', 'Male', '2009-11-10', '789 Pine Rd, Villageton', 3, 'Mr. Chen', '555-0106', 'parent.chen@email.com', '2024-01-17', 'Active', 'Loves science'),
('ADM2024004', 'Sarah Williams', 'sarah.w@email.com', '555-0107', 'Female', '2010-03-25', '321 Elm St, Hamletville', 3, 'Mrs. Williams', '555-0108', 'parent.williams@email.com', '2024-01-18', 'Active', 'Great artist'),
('ADM2024005', 'David Brown', 'david.b@email.com', '555-0109', 'Male', '2009-07-12', '654 Maple Dr, Suburbia', 5, 'Mr. Brown', '555-0110', 'parent.brown@email.com', '2024-01-20', 'Active', 'Sports enthusiast'),
('ADM2024006', 'Sophia Garcia', 'sophia.g@email.com', '555-0111', 'Female', '2008-09-30', '987 Cedar Ln, Metro City', 5, 'Mrs. Garcia', '555-0112', 'parent.garcia@email.com', '2024-02-01', 'Active', 'Class representative'),
('ADM2024007', 'James Wilson', 'james.w@email.com', '555-0113', 'Male', '2007-12-05', '147 Birch St, Coastal Town', 7, 'Mr. Wilson', '555-0114', 'parent.wilson@email.com', '2024-02-05', 'Active', 'Tech savvy'),
('ADM2024008', 'Olivia Martinez', 'olivia.m@email.com', '555-0115', 'Female', '2008-01-18', '258 Spruce Ave, Mountain View', 7, 'Mrs. Martinez', '555-0116', 'parent.martinez@email.com', '2024-02-10', 'Active', 'Debate champion');

-- Verify data
SELECT 'Users created:' AS message, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Classes created:', COUNT(*) FROM classes
UNION ALL
SELECT 'Students created:', COUNT(*) FROM students;
