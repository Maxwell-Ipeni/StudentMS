<?php
/**
 * Environment Variable Loader
 * Loads .env file into PHP environment variables
 */

class EnvLoader {
    
    private static $loaded = false;
    
    /**
     * Load environment variables from .env file
     * @param string|null $path Path to .env file
     */
    public static function load($path = null) {
        if (self::$loaded) {
            return;
        }
        
        $path = $path ?? dirname(__DIR__) . '/.env';
        
        if (!file_exists($path)) {
            error_log("EnvLoader: .env file not found at: " . $path);
            return;
        }
        
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            $line = trim($line);
            
            if (empty($line) || strpos($line, '#') === 0) {
                continue;
            }
            
            if (strpos($line, '=') === false) {
                continue;
            }
            
            $parts = explode('=', $line, 2);
            $key = trim($parts[0]);
            $value = isset($parts[1]) ? trim($parts[1]) : '';
            
            if (empty($key)) {
                continue;
            }
            
            if (!putenv("$key=$value")) {
                error_log("EnvLoader: Failed to set environment variable: $key");
            }
        }
        
        self::$loaded = true;
    }
    
    /**
     * Check if .env has been loaded
     * @return bool
     */
    public static function isLoaded() {
        return self::$loaded;
    }
    
    /**
     * Reset loader state (useful for testing)
     */
    public static function reset() {
        self::$loaded = false;
    }
}