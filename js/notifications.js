class NotificationManager {
    constructor() {
        this.permission = null;
        this.init();
    }

    async init() {
        this.permission = await this.requestPermission();
        this.loadSettings();
    }

    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return 'denied';
        }

        if (Notification.permission === 'default') {
            return await Notification.requestPermission();
        }

        return Notification.permission;
    }

    loadSettings() {
        // Load settings from localStorage
        const settings = JSON.parse(localStorage.getItem('marketAlertSettings') || '{}');
        
        // Apply settings to UI
        document.getElementById('marketOpenAlert').checked = settings.marketOpenAlert !== false;
        document.getElementById('marketCloseAlert').checked = settings.marketCloseAlert !== false;
        document.getElementById('highImpact').checked = settings.highImpact !== false;
        document.getElementById('mediumImpact').checked = settings.mediumImpact || false;
        document.getElementById('lowImpact').checked = settings.lowImpact || false;
        document.getElementById('browserNotifications').checked = settings.browserNotifications !== false;
        document.getElementById('soundAlert').checked = settings.soundAlert || false;
        document.getElementById('bellAlertTime').value = settings.bellAlertTime || 5;
        document.getElementById('eventAlertTime').value = settings.eventAlertTime || 15;
    }

    saveSettings() {
        const settings = {
            marketOpenAlert: document.getElementById('marketOpenAlert').checked,
            marketCloseAlert: document.getElementById('marketCloseAlert').checked,
            highImpact: document.getElementById('highImpact').checked,
            mediumImpact: document.getElementById('mediumImpact').checked,
            lowImpact: document.getElementById('lowImpact').checked,
            browserNotifications: document.getElementById('browserNotifications').checked,
            soundAlert: document.getElementById('soundAlert').checked,
            bellAlertTime: parseInt(document.getElementById('bellAlertTime').value),
            eventAlertTime: parseInt(document.getElementById('eventAlertTime').value)
        };

        localStorage.setItem('marketAlertSettings', JSON.stringify(settings));
        this.showNotification('Settings saved successfully!', 'success');
    }

    showNotification(message, type = 'info') {
        // Browser notification
        if (this.permission === 'granted' && document.getElementById('browserNotifications').checked) {
            new Notification('Market Alert', {
                body: message,
                icon: '/icon.png'
            });
        }

        // In-app notification
        this.showInAppNotification(message, type);

        // Sound alert
        if (document.getElementById('soundAlert').checked) {
            this.playAlertSound();
        }
    }

    showInAppNotification(message, type) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${type.toUpperCase()}</strong>: ${message}
            </div>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    playAlertSound() {
        const audio = document.getElementById('alertSound');
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    triggerMarketBellAlert(market, eventType) {
        const message = `${market.name} ${eventType === 'open' ? 'opening' : 'closing'} bell in ${document.getElementById('bellAlertTime').value} minutes!`;
        this.showNotification(message, 'warning');
    }

    triggerEconomicEventAlert(event) {
        const message = `${event.currency} ${event.event} in ${document.getElementById('eventAlertTime').value} minutes!`;
        this.showNotification(message, 'warning');
    }
}
