<?php
/**
 * JWT Token Handler
 * Handles JWT token generation and validation
 */

class JWT {
    
    private static $secretKey;
    private static $algorithm = "HS256";
    
    private static function getSecretKey() {
        if (self::$secretKey === null) {
            self::$secretKey = getenv('JWT_SECRET') ?: 'change-this-secret-in-production';
        }
        return self::$secretKey;
    }
    
    /**
     * Generate JWT token
     * @param array $payload
     * @param int $expiry Expiry time in seconds (default: 24 hours)
     * @return string
     */
    public static function generate($payload, $expiry = 86400) {
        $header = json_encode([
            "typ" => "JWT",
            "alg" => self::$algorithm
        ]);
        
        $time = time();
        $payload['iat'] = $time;
        $payload['exp'] = $time + $expiry;
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::getSecretKey(), true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }
    
    /**
     * Validate JWT token
     * @param string $token
     * @return array|false
     */
    public static function validate($token) {
        try {
            // Split token
            $tokenParts = explode('.', $token);
            
            if (count($tokenParts) != 3) {
                return false;
            }
            
            $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
            $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
            $signatureProvided = $tokenParts[2];
            
            // Check expiration
            $payloadData = json_decode($payload, true);
            
            if (isset($payloadData['exp']) && $payloadData['exp'] < time()) {
                return false;
            }
            
            // Verify signature
            $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
            $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
            
            $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, self::getSecretKey(), true);
            $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
            
            if (!hash_equals($base64Signature, $signatureProvided)) {
                return false;
            }
            
            return $payloadData;
            
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Get token from Authorization header
     * @return string|null
     */
    public static function getTokenFromHeader() {
        $headers = null;
        
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } else if (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(
                array_map('ucwords', array_keys($requestHeaders)),
                array_values($requestHeaders)
            );
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        
        if (!empty($headers) && preg_match('/Bearer\s+(.*)$/i', $headers, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
}
