<?php
/**
 * Database Configuration
 * Student Management System
 */

require_once __DIR__ . '/../utils/EnvLoader.php';
EnvLoader::load();

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $charset = "utf8mb4";
    
    public $conn;
    
    public function __construct() {
        $this->host = getenv('DB_HOST') ?: 'localhost';
        $this->db_name = getenv('DB_NAME') ?: 'student_management_system';
        $this->username = getenv('DB_USER') ?: 'root';
        $this->password = getenv('DB_PASS') ?: '';
    }
    
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
