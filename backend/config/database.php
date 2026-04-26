<?php
/**
 * Database Configuration
 * Student Management System
 */

class Database {
    private $host = "localhost";
    private $db_name = "student_management_system";
    private $username = "root"; // Change for production
    private $password = ""; // Change for production
    private $charset = "utf8mb4";
    
    public $conn;
    
    /**
     * Get database connection
     * @return PDO
     */
    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
            // Set timezone for database operations
            $this->conn->exec("SET time_zone = '+00:00'");
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "error" => "Database connection failed",
                "message" => $e->getMessage()
            ]);
            exit;
        }
        
        return $this->conn;
    }
    
    /**
     * Close database connection
     */
    public function closeConnection() {
        $this->conn = null;
    }
}
