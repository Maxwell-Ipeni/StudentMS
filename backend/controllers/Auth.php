<?php
/**
 * Authentication Controller
 * Handles user authentication
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JWT.php';

class Auth {
    
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    /**
     * User login
     * POST /api/login
     */
    public function login() {
        // Get input data
        $data = json_decode(file_get_contents("php://input"), true);
        
        // Validate required fields
        if (empty($data['username']) || empty($data['password'])) {
            Response::validationError([
                "username" => "Username is required",
                "password" => "Password is required"
            ]);
        }
        
        $username = trim($data['username']);
        $password = $data['password'];
        
        try {
            // Get user from database
            $query = "SELECT id, username, email, password_hash, full_name, role, is_active, is_approved, last_login 
                      FROM users 
                      WHERE username = :username OR email = :email";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':username', $username);
            $stmt->bindParam(':email', $username);
            $stmt->execute();
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                Response::error("Invalid username or password", 401);
            }
            
            // Check if user is active
            if (!$user['is_active']) {
                Response::error("Account is inactive. Please contact administrator", 403);
            }
            
            // Check if user is approved
            if (!$user['is_approved']) {
                Response::error("Account pending approval. Please wait for administrator to approve your account.", 403);
            }
            
            // Verify password
            if (!password_verify($password, $user['password_hash'])) {
                Response::error("Invalid username or password", 401);
            }
            
            // Update last login
            $updateQuery = "UPDATE users SET last_login = NOW() WHERE id = :id";
            $updateStmt = $this->conn->prepare($updateQuery);
            $updateStmt->bindParam(':id', $user['id']);
            $updateStmt->execute();
            
            // Generate JWT token
            $tokenPayload = [
                'user_id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role']
            ];
            
            $token = JWT::generate($tokenPayload);
            
            // Prepare user data (without password)
            $userData = [
                'id' => $user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'role' => $user['role'],
                'last_login' => $user['last_login']
            ];
            
            Response::success([
                'user' => $userData,
                'token' => $token
            ], "Login successful");
            
        } catch (PDOException $e) {
            Response::error("Login failed: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Verify token
     * GET /api/verify
     */
    public function verify() {
        $token = JWT::getTokenFromHeader();
        
        if (!$token) {
            Response::unauthorized("No token provided");
        }
        
        $payload = JWT::validate($token);
        
        if (!$payload) {
            Response::unauthorized("Invalid or expired token");
        }
        
        Response::success([
            'user_id' => $payload['user_id'],
            'username' => $payload['username'],
            'email' => $payload['email'],
            'full_name' => $payload['full_name'],
            'role' => $payload['role']
        ], "Token is valid");
    }
    
    /**
     * Get current user profile
     * GET /api/profile
     */
    public function profile() {
        $token = JWT::getTokenFromHeader();
        
        if (!$token) {
            Response::unauthorized("No token provided");
        }
        
        $payload = JWT::validate($token);
        
        if (!$payload) {
            Response::unauthorized("Invalid or expired token");
        }
        
        try {
            $query = "SELECT id, username, email, full_name, role, is_active, last_login, created_at 
                      FROM users 
                      WHERE id = :id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $payload['user_id']);
            $stmt->execute();
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                Response::notFound("User");
            }
            
            Response::success($user, "Profile retrieved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to get profile: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Logout user (optional - client-side logout is enough for JWT)
     * POST /api/logout
     */
    public function logout() {
        Response::success(null, "Logout successful");
    }
    
    /**
     * Register new user
     * POST /api/auth/register
     */
    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $full_name = trim($data['full_name'] ?? '');
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $role = trim($data['role'] ?? 'student');
        
        if (empty($full_name) || empty($username) || empty($email) || empty($password)) {
            Response::validationError([
                "full_name" => "Full name is required",
                "username" => "Username is required",
                "email" => "Email is required",
                "password" => "Password is required"
            ]);
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::validationError(["email" => "Invalid email format"]);
        }
        
        if (strlen($password) < 6) {
            Response::validationError(["password" => "Password must be at least 6 characters"]);
        }
        
        $validRoles = ['student', 'teacher', 'admin'];
        if (!in_array($role, $validRoles)) {
            $role = 'student';
        }
        
        try {
            $checkQuery = "SELECT id FROM users WHERE username = :username OR email = :email";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(':username', $username);
            $checkStmt->bindParam(':email', $email);
            $checkStmt->execute();
            
            if ($checkStmt->fetch()) {
                Response::error("Username or email already exists", 400);
            }
            
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            
            $insertQuery = "INSERT INTO users (full_name, username, email, password_hash, role, is_active, is_approved, created_at) 
                            VALUES (:full_name, :username, :email, :password_hash, :role, 1, 0, NOW())";
            
            $insertStmt = $this->conn->prepare($insertQuery);
            $insertStmt->bindParam(':full_name', $full_name);
            $insertStmt->bindParam(':username', $username);
            $insertStmt->bindParam(':email', $email);
            $insertStmt->bindParam(':password_hash', $passwordHash);
            $insertStmt->bindParam(':role', $role);
            $insertStmt->execute();
            
            Response::success([
                'user_id' => $this->conn->lastInsertId()
            ], "Registration successful");
            
        } catch (PDOException $e) {
            Response::error("Registration failed: " . $e->getMessage(), 500);
        }
    }
}
