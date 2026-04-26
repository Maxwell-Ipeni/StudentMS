<?php
/**
 * Class Controller
 * Handles class/grade CRUD operations
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JWT.php';

class ClassController {
    
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
     * Get all classes
     * GET /api/classes
     */
    public function getAll() {
        $this->checkAuth();
        
        $academicYear = isset($_GET['academic_year']) ? $_GET['academic_year'] : '';
        $includeStudents = isset($_GET['include_students']) && $_GET['include_students'] === 'true';
        
        try {
            // Get classes
            $query = "SELECT c.*, COUNT(s.id) as student_count
                      FROM classes c
                      LEFT JOIN students s ON c.id = s.class_id AND s.status = 'Active'
                      WHERE 1=1";
            
            $params = [];
            
            if (!empty($academicYear)) {
                $query .= " AND c.academic_year = :academic_year";
                $params[':academic_year'] = $academicYear;
            }
            
            $query .= " GROUP BY c.id ORDER BY c.grade_level, c.section";
            
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->execute();
            
            $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get available academic years
            $yearsQuery = "SELECT DISTINCT academic_year FROM classes ORDER BY academic_year DESC";
            $yearsStmt = $this->conn->prepare($yearsQuery);
            $yearsStmt->execute();
            $academicYears = $yearsStmt->fetchAll(PDO::FETCH_COLUMN);
            
            Response::success([
                'classes' => $classes,
                'academic_years' => $academicYears
            ], "Classes retrieved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to get classes: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get single class with students
     * GET /api/classes/{id}
     */
    public function getOne($id) {
        $this->checkAuth();
        
        try {
            // Get class details
            $query = "SELECT c.*, COUNT(s.id) as student_count
                      FROM classes c
                      LEFT JOIN students s ON c.id = s.class_id AND s.status = 'Active'
                      WHERE c.id = :id
                      GROUP BY c.id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            $class = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$class) {
                Response::notFound("Class");
            }
            
            // Get students in class
            $studentsQuery = "SELECT id, admission_number, full_name, email, phone, gender, status
                             FROM students
                             WHERE class_id = :class_id
                             ORDER BY full_name";
            
            $studentsStmt = $this->conn->prepare($studentsQuery);
            $studentsStmt->bindParam(':class_id', $id);
            $studentsStmt->execute();
            
            $students = $studentsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $class['students'] = $students;
            
            Response::success($class, "Class retrieved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to get class: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Create class
     * POST /api/classes
     */
    public function create() {
        $this->checkAuth();
        
        // Get input data
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validate required fields
        $errors = [];
        
        if (empty($data['class_name'])) {
            $errors['class_name'] = "Class name is required";
        }
        
        if (empty($data['grade_level'])) {
            $errors['grade_level'] = "Grade level is required";
        }
        
        if (empty($data['academic_year'])) {
            $errors['academic_year'] = "Academic year is required";
        }
        
        if (!empty($errors)) {
            Response::validationError($errors);
        }
        
        try {
            // Check if class name exists for same grade and year
            $checkQuery = "SELECT id FROM classes 
                          WHERE class_name = :class_name 
                          AND grade_level = :grade_level 
                          AND academic_year = :academic_year";
            
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':class_name', $data['class_name']);
            $checkStmt->bindParam(':grade_level', $data['grade_level']);
            $checkStmt->bindParam(':academic_year', $data['academic_year']);
            $checkStmt->execute();
            
            if ($checkStmt->fetch()) {
                Response::error("Class already exists for this grade and academic year", 409);
            }
            
            // Insert class
            $query = "INSERT INTO classes 
                      (class_name, grade_level, section, capacity, academic_year, is_active)
                      VALUES 
                      (:class_name, :grade_level, :section, :capacity, :academic_year, :is_active)";
            
            $stmt = $this->conn->prepare($query);
            
            $section = isset($data['section']) ? $data['section'] : 'A';
            $capacity = isset($data['capacity']) ? $data['capacity'] : 30;
            $isActive = isset($data['is_active']) ? $data['is_active'] : true;
            
            $stmt->bindParam(':class_name', $data['class_name']);
            $stmt->bindParam(':grade_level', $data['grade_level']);
            $stmt->bindParam(':section', $section);
            $stmt->bindParam(':capacity', $capacity, PDO::PARAM_INT);
            $stmt->bindParam(':academic_year', $data['academic_year']);
            $stmt->bindParam(':is_active', $isActive, PDO::PARAM_BOOL);
            
            $stmt->execute();
            
            $classId = $this->conn->lastInsertId();
            
            // Get created class
            $getQuery = "SELECT c.*, 0 as student_count 
                         FROM classes c 
                         WHERE c.id = :id";
            
            $getStmt = $this->conn->prepare($getQuery);
            $getStmt->bindParam(':id', $classId);
            $getStmt->execute();
            
            $class = $getStmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success($class, "Class created successfully", 201);
            
        } catch (PDOException $e) {
            Response::error("Failed to create class: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Update class
     * PUT /api/classes/{id}
     */
    public function update($id) {
        $this->checkAuth();
        
        // Get input data
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            // Check if class exists
            $checkQuery = "SELECT id FROM classes WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            
            if (!$checkStmt->fetch()) {
                Response::notFound("Class");
            }
            
            // Check if class name is being changed and if new one exists
            if (!empty($data['class_name']) && !empty($data['grade_level']) && !empty($data['academic_year'])) {
                $existsQuery = "SELECT id FROM classes 
                               WHERE class_name = :class_name 
                               AND grade_level = :grade_level 
                               AND academic_year = :academic_year
                               AND id != :id";
                
                $existsStmt = $this->conn->prepare($existsQuery);
                $existsStmt->bindParam(':class_name', $data['class_name']);
                $existsStmt->bindParam(':grade_level', $data['grade_level']);
                $existsStmt->bindParam(':academic_year', $data['academic_year']);
                $existsStmt->bindParam(':id', $id);
                $existsStmt->execute();
                
                if ($existsStmt->fetch()) {
                    Response::error("Class already exists for this grade and academic year", 409);
                }
            }
            
            // Build update query
            $fields = [];
            $params = [];
            
            $allowedFields = [
                'class_name', 'grade_level', 'section', 'capacity', 
                'academic_year', 'is_active'
            ];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }
            
            if (empty($fields)) {
                Response::error("No fields to update", 400);
            }
            
            $setClause = implode(", ", $fields);
            
            $query = "UPDATE classes SET {$setClause}, updated_at = NOW() WHERE id = :id";
            $params[':id'] = $id;
            
            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            
            // Get updated class
            $getQuery = "SELECT c.*, COUNT(s.id) as student_count
                         FROM classes c
                         LEFT JOIN students s ON c.id = s.class_id AND s.status = 'Active'
                         WHERE c.id = :id
                         GROUP BY c.id";
            
            $getStmt = $this->conn->prepare($getQuery);
            $getStmt->bindParam(':id', $id);
            $getStmt->execute();
            
            $class = $getStmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success($class, "Class updated successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to update class: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Delete class
     * DELETE /api/classes/{id}
     */
    public function delete($id) {
        $this->checkAuth();
        
        try {
            // Check if class exists
            $checkQuery = "SELECT id FROM classes WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            
            if (!$checkStmt->fetch()) {
                Response::notFound("Class");
            }
            
            // Check if class has students
            $studentsQuery = "SELECT COUNT(*) as count FROM students WHERE class_id = :class_id";
            $studentsStmt = $this->conn->prepare($studentsQuery);
            $studentsStmt->bindParam(':class_id', $id);
            $studentsStmt->execute();
            $studentsCount = $studentsStmt->fetch()['count'];
            
            if ($studentsCount > 0) {
                Response::error("Cannot delete class with {$studentsCount} enrolled students", 409);
            }
            
            // Delete class
            $query = "DELETE FROM classes WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            Response::success(null, "Class deleted successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to delete class: " . $e->getMessage(), 500);
        }
    }
}
