<?php
/**
 * Dashboard Controller
 * Handles dashboard statistics and analytics
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JWT.php';

class Dashboard {
    
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    /**
     * Check authentication
     */
    private function checkAuth() {
        $token = JWT::getTokenFromHeader();
        
        if (!$token) {
            Response::unauthorized("No token provided");
        }
        
        $payload = JWT::validate($token);
        
        if (!$payload) {
            Response::unauthorized("Invalid or expired token");
        }
        
        return $payload;
    }
    
    /**
     * Get dashboard statistics
     * GET /api/dashboard
     */
    public function getStats() {
        $this->checkAuth();
        
        try {
            // Total students
            $totalStudentsQuery = "SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'Active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive,
                COUNT(CASE WHEN status = 'Graduated' THEN 1 END) as graduated,
                COUNT(CASE WHEN status = 'Dropped' THEN 1 END) as dropped
                FROM students";
            
            $stmt = $this->conn->prepare($totalStudentsQuery);
            $stmt->execute();
            $students = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Total classes
            $totalClassesQuery = "SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active
                FROM classes";
            
            $stmt = $this->conn->prepare($totalClassesQuery);
            $stmt->execute();
            $classes = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Students by gender
            $genderQuery = "SELECT 
                gender,
                COUNT(*) as count
                FROM students
                WHERE status = 'Active'
                GROUP BY gender";
            
            $stmt = $this->conn->prepare($genderQuery);
            $stmt->execute();
            $genderStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Students by class (top 10)
            $byClassQuery = "SELECT 
                c.class_name,
                c.grade_level,
                COUNT(s.id) as student_count
                FROM classes c
                LEFT JOIN students s ON c.id = s.class_id AND s.status = 'Active'
                GROUP BY c.id
                ORDER BY student_count DESC
                LIMIT 10";
            
            $stmt = $this->conn->prepare($byClassQuery);
            $stmt->execute();
            $byClass = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Recent admissions (last 7 days)
            $recentQuery = "SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
                FROM students
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                GROUP BY DATE(created_at)
                ORDER BY date DESC";
            
            $stmt = $this->conn->prepare($recentQuery);
            $stmt->execute();
            $recentAdmissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Recent students (last 5)
            $recentStudentsQuery = "SELECT 
                s.id,
                s.admission_number,
                s.full_name,
                s.email,
                s.gender,
                s.admission_date,
                s.status,
                c.class_name,
                c.grade_level
                FROM students s
                LEFT JOIN classes c ON s.class_id = c.id
                ORDER BY s.created_at DESC
                LIMIT 5";
            
            $stmt = $this->conn->prepare($recentStudentsQuery);
            $stmt->execute();
            $recentStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Monthly admissions (last 6 months)
            $monthlyQuery = "SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                DATE_FORMAT(created_at, '%M %Y') as month_name,
                COUNT(*) as count
                FROM students
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY month";
            
            $stmt = $this->conn->prepare($monthlyQuery);
            $stmt->execute();
            $monthlyAdmissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success([
                'summary' => [
                    'total_students' => (int)$students['total'],
                    'active_students' => (int)$students['active'],
                    'inactive_students' => (int)$students['inactive'],
                    'graduated_students' => (int)$students['graduated'],
                    'dropped_students' => (int)$students['dropped'],
                    'total_classes' => (int)$classes['total'],
                    'active_classes' => (int)$classes['active']
                ],
                'gender_distribution' => $genderStats,
                'students_by_class' => $byClass,
                'recent_admissions' => [
                    'data' => $recentAdmissions,
                    'total_last_7_days' => array_sum(array_column($recentAdmissions, 'count'))
                ],
                'monthly_admissions' => $monthlyAdmissions,
                'recent_students' => $recentStudents
            ], "Dashboard statistics retrieved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to get dashboard statistics: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get quick stats for cards
     * GET /api/dashboard/quick-stats
     */
    public function getQuickStats() {
        $this->checkAuth();
        
        try {
            // Quick stats
            $statsQuery = "SELECT 
                (SELECT COUNT(*) FROM students WHERE status = 'Active') as active_students,
                (SELECT COUNT(*) FROM classes WHERE is_active = 1) as active_classes,
                (SELECT COUNT(*) FROM students WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)) as new_admissions,
                (SELECT COUNT(*) FROM students WHERE status = 'Inactive') as inactive_students
                FROM DUAL";
            
            $stmt = $this->conn->prepare($statsQuery);
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success([
                'active_students' => (int)$stats['active_students'],
                'active_classes' => (int)$stats['active_classes'],
                'new_admissions' => (int)$stats['new_admissions'],
                'inactive_students' => (int)$stats['inactive_students']
            ], "Quick stats retrieved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to get quick stats: " . $e->getMessage(), 500);
        }
    }
}
