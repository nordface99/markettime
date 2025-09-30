class MarketAlertApp {
    constructor() {
        this.marketTimeManager = null;
        this.economicCalendarManager = null;
        this.notificationManager = null;
        this.init();
    }

    init() {
        // Initialize managers
        this.marketTimeManager = new MarketTimeManager();
        this.economicCalendarManager = new EconomicCalendarManager();
        this.notificationManager = new NotificationManager();

        // Setup event listeners
        this.setupEventListeners();
        this.updateCurrentTime();
        
        // Start periodic checks
        setInterval(() => this.updateCurrentTime(), 1000);
        setInterval(() => this.checkAlerts(), 30000); // Check alerts every 30 seconds
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Refresh markets
        document.getElementById('refreshMarkets')?.addEventListener('click', () => {
            this.marketTimeManager.updateMarketTimes();
        });

        // Time frame filter
        document.getElementById('timeFrame')?.addEventListener('change', (e) => {
            this.economicCalendarManager.filterEvents();
        });

        // Save settings
        document.getElementById('saveSettings')?.addEventListener('click', () => {
            this.notificationManager.saveSettings();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    }

    updateCurrentTime() {
        const timeElement = document.getElementById('currentTime');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
        }
    }

    checkAlerts() {
        // This would integrate with both market time and economic calendar
        // to check for upcoming events and trigger alerts
        console.log('Checking alerts...');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MarketAlertApp();
});
