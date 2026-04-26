<?php
/**
 * Admin Controller
 * Handles administrative operations
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/JWT.php';

class Admin {
    
    private $conn;
    
    public function __construct() {
        $database = new Database();
        $this->conn = $database->getConnection();
    }
    
    /**
     * Verify admin access
     */
    private function verifyAdmin() {
        $token = JWT::getTokenFromHeader();
        
        if (!$token) {
            Response::unauthorized("No token provided");
        }
        
        $payload = JWT::validate($token);
        
        if (!$payload) {
            Response::unauthorized("Invalid or expired token");
        }
        
        if ($payload['role'] !== 'admin') {
            Response::error("Access denied. Admin privileges required.", 403);
        }
        
        return $payload;
    }
    
    /**
     * Get pending users (not yet approved)
     * GET /api/admin/pending-users
     */
    public function getPendingUsers() {
        $this->verifyAdmin();
        
        try {
            $query = "SELECT id, username, email, full_name, role, is_active, created_at 
                      FROM users 
                      WHERE is_approved = 0 
                      ORDER BY created_at DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success([
                'users' => $users,
                'count' => count($users)
            ], "Pending users retrieved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to get pending users: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Get all users
     * GET /api/admin/users
     */
    public function getAllUsers() {
        $this->verifyAdmin();
        
        try {
            $query = "SELECT id, username, email, full_name, role, is_active, is_approved, created_at, last_login 
                      FROM users 
                      ORDER BY created_at DESC";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success([
                'users' => $users,
                'count' => count($users)
            ], "Users retrieved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to get users: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Approve a user
     * POST /api/admin/approve-user/:id
     */
    public function approveUser($id) {
        $this->verifyAdmin();
        
        if (!$id) {
            Response::validationError(["id" => "User ID is required"]);
        }
        
        try {
            $query = "UPDATE users SET is_approved = 1 WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                Response::notFound("User");
            }
            
            Response::success(null, "User approved successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to approve user: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Reject/delete a user
     * DELETE /api/admin/users/:id
     */
    public function rejectUser($id) {
        $this->verifyAdmin();
        
        if (!$id) {
            Response::validationError(["id" => "User ID is required"]);
        }
        
        try {
            $query = "DELETE FROM users WHERE id = :id AND is_approved = 0";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                Response::error("User not found or already approved", 404);
            }
            
            Response::success(null, "User rejected and removed successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to reject user: " . $e->getMessage(), 500);
        }
    }
    
    /**
     * Toggle user active status
     * POST /api/admin/toggle-user/:id
     */
    public function toggleUserStatus($id) {
        $this->verifyAdmin();
        
        if (!$id) {
            Response::validationError(["id" => "User ID is required"]);
        }
        
        $data = json_decode(file_get_contents("php://input"), true);
        $isActive = $data['is_active'] ?? false;
        
        try {
            $query = "UPDATE users SET is_active = :is_active WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':is_active', $isActive, PDO::PARAM_BOOL);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                Response::notFound("User");
            }
            
            Response::success(null, "User status updated successfully");
            
        } catch (PDOException $e) {
            Response::error("Failed to update user status: " . $e->getMessage(), 500);
        }
    }
}