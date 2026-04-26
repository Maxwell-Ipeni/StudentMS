<?php
/**
 * Student Controller
 * Handles student CRUD operations
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JWT.php';

class Student {
    
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
     * Get all students
     * GET /api/students
     */
    public function getAll() {
        $this->checkAuth();
        
        // Get query parameters
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $classId = isset($_GET['class_id']) ? $_GET['class_id'] : '';
        $status = isset($_GET['status']) ? $_GET['status'] : '';
        
        $offset = ($page - 1) * $limit;
        
        try {
            // Build query
            $whereConditions = [];
            $params = [];
            
            if (!empty($search)) {
                $whereConditions[] = "(s.full_name LIKE :search OR s.admission_number LIKE :search OR s.email LIKE :search)";
                $params[':search'] = "%{$search}%";
            }
            
            if (!empty($classId)) {
                $whereConditions[] = "s.class_id = :class_id";
                $params[':class_id'] = $classId;
            }
            
            if (!empty($status)) {
                $whereConditions[] = "s.status = :status";
                $params[':status'] = $status;
            }
            
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
            
            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM students s {$whereClause}";
            $countStmt = $this->conn->prepare($countQuery);
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value);
            }
            $countStmt->execute();
            $total = $countStmt->fetch()['total'];
            
            // Get students with class info
            $query = "SELECT s.*, c.class_name, c.grade_level, c.section
                      FROM students s
                      LEFT JOIN classes c ON s.class_id = c.id
                      {$whereClause}
                      ORDER BY s.created_at DESC
                      LIMIT :limit OFFSET :offset";
            
            $stmt = $this->conn->prepare($query);
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success([
                'students' => $students,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $total,
                    'totalPages' => ceil($total / $limit)
                ]
            ], "Students retrieved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to get students: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get single student
     * GET /api/students/{id}
     */
    public function getOne($id) {
        $this->checkAuth();
        
        try {
            $query = "SELECT s.*, c.class_name, c.grade_level, c.section
                      FROM students s
                      LEFT JOIN classes c ON s.class_id = c.id
                      WHERE s.id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$student) {
                Response::notFound("Student");
            }
            
            Response::success($student, "Student retrieved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to get student: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Create student
     * POST /api/students
     */
    public function create() {
        $this->checkAuth();
        
        // Get input data
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validate required fields
        $errors = [];
        
        if (empty($data['admission_number'])) {
            $errors['admission_number'] = "Admission number is required";
        }
        
        if (empty($data['full_name'])) {
            $errors['full_name'] = "Full name is required";
        }
        
        if (empty($data['admission_date'])) {
            $errors['admission_date'] = "Admission date is required";
        }
        
        if (!empty($errors)) {
            Response::validationError($errors);
        }
        
        try {
            // Check if admission number exists
            $checkQuery = "SELECT id FROM students WHERE admission_number = :admission_number";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':admission_number', $data['admission_number']);
            $checkStmt->execute();
            
            if ($checkStmt->fetch()) {
                Response::error("Admission number already exists", 409);
            }
            
            // Insert student
            $query = "INSERT INTO students 
                      (admission_number, full_name, email, phone, gender, date_of_birth, 
                       address, class_id, guardian_name, guardian_phone, guardian_email, 
                       admission_date, status, notes)
                      VALUES 
                      (:admission_number, :full_name, :email, :phone, :gender, :date_of_birth,
                       :address, :class_id, :guardian_name, :guardian_phone, :guardian_email,
                       :admission_date, :status, :notes)";
            
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':admission_number', $data['admission_number']);
            $stmt->bindParam(':full_name', $data['full_name']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':phone', $data['phone']);
            $stmt->bindParam(':gender', $data['gender']);
            $stmt->bindParam(':date_of_birth', $data['date_of_birth']);
            $stmt->bindParam(':address', $data['address']);
            $stmt->bindParam(':class_id', $data['class_id']);
            $stmt->bindParam(':guardian_name', $data['guardian_name']);
            $stmt->bindParam(':guardian_phone', $data['guardian_phone']);
            $stmt->bindParam(':guardian_email', $data['guardian_email']);
            $stmt->bindParam(':admission_date', $data['admission_date']);
            $stmt->bindParam(':status', $data['status']);
            $stmt->bindParam(':notes', $data['notes']);
            
            $stmt->execute();
            
            $studentId = $this->conn->lastInsertId();
            
            // Get created student
            $getQuery = "SELECT s.*, c.class_name, c.grade_level, c.section
                         FROM students s
                         LEFT JOIN classes c ON s.class_id = c.id
                         WHERE s.id = :id";
            
            $getStmt = $this->conn->prepare($getQuery);
            $getStmt->bindParam(':id', $studentId);
            $getStmt->execute();
            
            $student = $getStmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success($student, "Student created successfully", 201);
            
        } catch (PDOException $e) {
            Response::error("Failed to create student: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Update student
     * PUT /api/students/{id}
     */
    public function update($id) {
        $this->checkAuth();
        
        // Get input data
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            // Check if student exists
            $checkQuery = "SELECT id FROM students WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            
            if (!$checkStmt->fetch()) {
                Response::notFound("Student");
            }
            
            // Check if admission number is being changed and if new one exists
            if (!empty($data['admission_number'])) {
                $existsQuery = "SELECT id FROM students WHERE admission_number = :admission_number AND id != :id";
                $existsStmt = $this->conn->prepare($existsQuery);
                $existsStmt->bindParam(':admission_number', $data['admission_number']);
                $existsStmt->bindParam(':id', $id);
                $existsStmt->execute();
                
                if ($existsStmt->fetch()) {
                    Response::error("Admission number already exists", 409);
                }
            }
            
            // Build update query
            $fields = [];
            $params = [];
            
            $allowedFields = [
                'admission_number', 'full_name', 'email', 'phone', 'gender', 
                'date_of_birth', 'address', 'class_id', 'guardian_name', 
                'guardian_phone', 'guardian_email', 'admission_date', 'status', 'notes'
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
            
            $query = "UPDATE students SET {$setClause}, updated_at = NOW() WHERE id = :id";
            $params[':id'] = $id;
            
            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            
            // Get updated student
            $getQuery = "SELECT s.*, c.class_name, c.grade_level, c.section
                         FROM students s
                         LEFT JOIN classes c ON s.class_id = c.id
                         WHERE s.id = :id";
            
            $getStmt = $this->conn->prepare($getQuery);
            $getStmt->bindParam(':id', $id);
            $getStmt->execute();
            
            $student = $getStmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success($student, "Student updated successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to update student: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Delete student
     * DELETE /api/students/{id}
     */
    public function delete($id) {
        $this->checkAuth();
        
        try {
            // Check if student exists
            $checkQuery = "SELECT id FROM students WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':id', $id);
            $checkStmt->execute();
            
            if (!$checkStmt->fetch()) {
                Response::notFound("Student");
            }
            
            // Delete student
            $query = "DELETE FROM students WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            Response::success(null, "Student deleted successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to delete student: " . $e->getMessage(), 500);
        }
    }
}
