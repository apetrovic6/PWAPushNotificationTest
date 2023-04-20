(function () {
    // Note: Replace with your own key pair before deploying
    const applicationServerPublicKey = '';

    window.blazorPushNotifications = {
        requestSubscription: async () => {
            console.log("REQUEST SUB");
            
            const worker = await navigator.serviceWorker.getRegistration();

       
            const existingSubscription = await worker.pushManager.getSubscription();
            if(existingSubscription) {
                console.log("Existing", existingSubscription.toJSON())
                return {
                    url: existingSubscription.endpoint,
                    p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')),
                    auth: arrayBufferToBase64(existingSubscription.getKey('auth'))
                };
            }
            if (!existingSubscription) {
                const newSubscription = await subscribe(worker);
                if (newSubscription) {
                    return {
                        url: newSubscription.endpoint,
                        p256dh: arrayBufferToBase64(newSubscription.getKey('p256dh')),
                        auth: arrayBufferToBase64(newSubscription.getKey('auth'))
                    };
                }
            }
        },
        isSubscribed: async () => {
            const worker = await navigator.serviceWorker.getRegistration();
            const existingSubscription = await worker.pushManager.getSubscription();
            return !!existingSubscription;
        },
        
        turnOffNotifications: async () => {
 
                // Disable push notifications
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        navigator.serviceWorker.register('/service-worker.js').then(registration => {
                            registration.pushManager.getSubscription().then(subscription => {
                                if (subscription) {
                                    subscription.unsubscribe();
                                }
                            });
                        });
                    }
                });
        }
    };

    async function subscribe(worker) {
        try {
            return await worker.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerPublicKey
            });
        } catch (error) {
            if (error.name === 'NotAllowedError') {
                return null;
            }
            throw error;
        }
    }

    function arrayBufferToBase64(buffer) {
        // https://stackoverflow.com/a/9458996
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
})();