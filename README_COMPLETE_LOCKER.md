# Complete Mobile Device Locker

This system creates a link that, when opened on a mobile device, completely locks the device by disabling all buttons and touchscreen functionality. It also attempts to collect Google account credentials and gallery data, storing them in a database.

## Features

- **Complete Device Locking**: Disables power button, volume buttons, back button, home button, and touchscreen
- **Persistent Fullscreen**: Forces the browser to stay in fullscreen mode
- **Credential Collection**: Simulates a Google login to collect account credentials
- **Gallery Access**: Requests access to the device's photo gallery
- **Data Storage**: Stores all collected data in a MySQL database
- **Sharing Tools**: Includes a QR code generator for easy sharing of the attack link

## Setup Instructions

1. Ensure you have a web server with PHP and MySQL installed (like XAMPP, WAMP, or LAMP)
2. Place all files in your web server's document root or a subdirectory
3. Make sure the web server has write permissions to create/modify the database
4. Access the `share_link.html` file in your browser to generate a QR code and link

## File Structure

- `complete_locker.js`: The main JavaScript file that implements the device locking functionality
- `complete_lock.php`: The PHP file that serves as the entry point and handles data collection
- `share_link.html`: HTML file with QR code generator for sharing the attack link
- `README_COMPLETE_LOCKER.md`: This documentation file

## How It Works

1. When a victim opens the link on their mobile device, `complete_lock.php` loads
2. The PHP script sets up the database connection and prepares to receive data
3. The JavaScript in `complete_locker.js` initializes and:
   - Creates a fullscreen overlay that prevents normal interaction
   - Sets up event listeners to block all user inputs
   - Attempts to disable hardware buttons (with browser limitations)
   - Prevents the device from sleeping
   - Displays a fake "System Update" progress screen
   - After a delay, shows a fake Google login form
   - Requests access to the device's photo gallery
4. Any collected data is sent back to the server and stored in the database

## Database Structure

The system creates a MySQL database named `virous_data` with a table called `victim_data` that has the following structure:

- `id`: Auto-incrementing primary key
- `device_id`: Unique identifier for the device
- `ip_address`: IP address of the victim
- `user_agent`: Browser user agent string
- `google_account`: Google account username/email
- `email`: Email address entered in the fake login
- `passwords`: Password entered in the fake login
- `gallery_data`: JSON-encoded gallery data (if collected)
- `timestamp`: When the data was collected

## Viewing Collected Data

To view the collected data, you can:

1. Access your MySQL database using phpMyAdmin or another database management tool
2. Connect to the `virous_data` database
3. View the contents of the `victim_data` table

## Important Notes

- This system is designed for educational and authorized testing purposes only
- Using this system without explicit permission from the device owner may be illegal
- Some functionality is limited by browser security restrictions
- Modern browsers have security measures that may prevent some features from working fully
- The effectiveness varies depending on the device, browser, and operating system

## Troubleshooting

- If the database connection fails, check your MySQL server settings
- If the device is not being locked properly, ensure JavaScript is enabled in the browser
- Some devices may have security features that prevent full locking
- Gallery access requires user permission and may not work on all devices

## Usage

1. Open `share_link.html` in your browser
2. Share the generated link or QR code with the target (with permission)
3. When they open the link on their mobile device, the locking mechanism will activate
4. Any collected data will be stored in the database automatically