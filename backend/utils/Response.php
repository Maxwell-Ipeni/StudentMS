<?php
/**
 * Response Utility
 * Handles API responses
 */

class Response {
    
    /**
     * Send success response
     * @param mixed $data
     * @param string $message
     * @param int $statusCode
     */
    public static function success($data = null, $message = "Success", $statusCode = 200) {
        http_response_code($statusCode);
        
        $response = [
            "success" => true,
            "message" => $message
        ];
        
        if ($data !== null) {
            $response["data"] = $data;
        }
        
        echo json_encode($response);
        exit;
    }
    
    /**
     * Send error response
     * @param string $message
     * @param int $statusCode
     * @param array $errors
     */
    public static function error($message = "An error occurred", $statusCode = 400, $errors = []) {
        http_response_code($statusCode);
        
        $response = [
            "success" => false,
            "message" => $message
        ];
        
        if (!empty($errors)) {
            $response["errors"] = $errors;
        }
        
        echo json_encode($response);
        exit;
    }
    
    /**
     * Send validation error response
     * @param array $errors
     */
    public static function validationError($errors) {
        self::error("Validation failed", 422, $errors);
    }
    
    /**
     * Send unauthorized response
     * @param string $message
     */
    public static function unauthorized($message = "Unauthorized") {
        self::error($message, 401);
    }
    
    /**
     * Send forbidden response
     * @param string $message
     */
    public static function forbidden($message = "Forbidden") {
        self::error($message, 403);
    }
    
    /**
     * Send not found response
     * @param string $resource
     */
    public static function notFound($resource = "Resource") {
        self::error("{$resource} not found", 404);
    }
}
