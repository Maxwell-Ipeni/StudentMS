<?php
/**
 * API Router
 * Student Management System - Main Entry Point
 */

// CORS headers are handled by .htaccess
// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Require all controllers
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../controllers/Auth.php';
require_once __DIR__ . '/../controllers/Student.php';
require_once __DIR__ . '/../controllers/ClassController.php';
require_once __DIR__ . '/../controllers/Dashboard.php';

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode('/', $uri);

// Remove empty elements and "api" from URI
$uri = array_filter($uri);
$uri = array_values($uri);

// Find where "api" is and take everything after it
$apiIndex = array_search('api', $uri);
if ($apiIndex !== false) {
    $uri = array_slice($uri, $apiIndex + 1);
}

// Get the endpoint and ID
$endpoint = isset($uri[0]) ? $uri[0] : '';
$id = isset($uri[1]) ? $uri[1] : null;

// Route requests
try {
    switch ($endpoint) {
        case '':
            // API root
            echo json_encode([
                "success" => true,
                "message" => "Student Management System API",
                "version" => "1.0.0",
                "endpoints" => [
                    "POST /api/login" => "Admin login",
                    "GET /api/verify" => "Verify token",
                    "GET /api/profile" => "Get user profile",
                    "GET /api/dashboard" => "Dashboard statistics",
                    "GET /api/students" => "List all students",
                    "POST /api/students" => "Create student",
                    "GET /api/students/{id}" => "Get student details",
                    "PUT /api/students/{id}" => "Update student",
                    "DELETE /api/students/{id}" => "Delete student",
                    "GET /api/classes" => "List all classes",
                    "POST /api/classes" => "Create class",
                    "GET /api/classes/{id}" => "Get class details",
                    "PUT /api/classes/{id}" => "Update class",
                    "DELETE /api/classes/{id}" => "Delete class"
                ]
            ]);
            break;
            
        case 'login':
            $auth = new Auth();
            if ($method === 'POST') {
                $auth->login();
            } else {
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed. Use POST."]);
            }
            break;
            
        case 'logout':
            $auth = new Auth();
            if ($method === 'POST') {
                $auth->logout();
            } else {
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed. Use POST."]);
            }
            break;
            
        case 'verify':
            $auth = new Auth();
            if ($method === 'GET') {
                $auth->verify();
            } else {
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed. Use GET."]);
            }
            break;
            
        case 'profile':
            $auth = new Auth();
            if ($method === 'GET') {
                $auth->profile();
            } else {
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed. Use GET."]);
            }
            break;
            
        case 'dashboard':
            $dashboard = new Dashboard();
            if ($method === 'GET') {
                if ($id === 'quick-stats') {
                    $dashboard->getQuickStats();
                } else {
                    $dashboard->getStats();
                }
            } else {
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed. Use GET."]);
            }
            break;
            
        case 'students':
            $student = new Student();
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $student->getOne($id);
                    } else {
                        $student->getAll();
                    }
                    break;
                case 'POST':
                    $student->create();
                    break;
                case 'PUT':
                    if ($id) {
                        $student->update($id);
                    } else {
                        http_response_code(400);
                        echo json_encode(["error" => "Student ID required"]);
                    }
                    break;
                case 'DELETE':
                    if ($id) {
                        $student->delete($id);
                    } else {
                        http_response_code(400);
                        echo json_encode(["error" => "Student ID required"]);
                    }
                    break;
                default:
                    http_response_code(405);
                    echo json_encode(["error" => "Method not allowed"]);
            }
            break;
            
        case 'classes':
            $class = new ClassController();
            switch ($method) {
                case 'GET':
                    if ($id) {
                        $class->getOne($id);
                    } else {
                        $class->getAll();
                    }
                    break;
                case 'POST':
                    $class->create();
                    break;
                case 'PUT':
                    if ($id) {
                        $class->update($id);
                    } else {
                        http_response_code(400);
                        echo json_encode(["error" => "Class ID required"]);
                    }
                    break;
                case 'DELETE':
                    if ($id) {
                        $class->delete($id);
                    } else {
                        http_response_code(400);
                        echo json_encode(["error" => "Class ID required"]);
                    }
                    break;
                default:
                    http_response_code(405);
                    echo json_encode(["error" => "Method not allowed"]);
            }
            break;
            
        default:
            http_response_code(404);
            echo json_encode(["error" => "Endpoint not found"]);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => "Internal server error",
        "message" => $e->getMessage()
    ]);
}
