class MarketTimeManager {
    constructor() {
        this.marketSessions = [
            {
                name: "London Stock Exchange",
                open: "08:00",
                close: "16:30",
                timezone: "Europe/London",
                symbol: "LSE",
                currentStatus: "Loading...",
                localTime: "Loading..."
            },
            {
                name: "New York Stock Exchange",
                open: "09:30",
                close: "16:00",
                timezone: "America/New_York",
                symbol: "NYSE",
                currentStatus: "Loading...",
                localTime: "Loading..."
            },
            {
                name: "Tokyo Stock Exchange",
                open: "09:00",
                close: "15:00",
                timezone: "Asia/Tokyo",
                symbol: "TSE",
                currentStatus: "Loading...",
                localTime: "Loading..."
            },
            {
                name: "Hong Kong Stock Exchange",
                open: "09:30",
                close: "16:00",
                timezone: "Asia/Hong_Kong",
                symbol: "HKEX",
                currentStatus: "Loading...",
                localTime: "Loading..."
            },
            {
                name: "Sydney Stock Exchange",
                open: "10:00",
                close: "16:00",
                timezone: "Australia/Sydney",
                symbol: "ASX",
                currentStatus: "Loading...",
                localTime: "Loading..."
            },
            {
                name: "Frankfurt Stock Exchange",
                open: "09:00",
                close: "17:30",
                timezone: "Europe/Berlin",
                symbol: "FWB",
                currentStatus: "Loading...",
                localTime: "Loading..."
            }
        ];
        
        this.init();
    }

    init() {
        this.updateMarketTimes();
        setInterval(() => this.updateMarketTimes(), 30000); // Update every 30 seconds
        setInterval(() => this.checkMarketBells(), 60000); // Check bells every minute
    }

    updateMarketTimes() {
        const now = new Date();
        
        this.marketSessions.forEach(session => {
            // Get current time in market timezone
            const marketTime = this.getTimeInTimezone(session.timezone);
            session.localTime = marketTime.toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: session.timezone
            });

            // Check if market is open
            session.isOpen = this.isMarketOpen(session, marketTime);
            session.currentStatus = session.isOpen ? 'OPEN' : 'CLOSED';
            
            // Calculate next event
            session.nextEvent = this.getNextEvent(session, marketTime);
        });

        this.displayMarketSessions();
        this.updateNextBell();
    }

    getTimeInTimezone(timezone) {
        return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    }

    isMarketOpen(session, marketTime) {
        const [openHour, openMinute] = session.open.split(':').map(Number);
        const [closeHour, closeMinute] = session.close.split(':').map(Number);
        
        const marketHours = marketTime.getHours();
        const marketMinutes = marketTime.getMinutes();
        const totalMinutes = marketHours * 60 + marketMinutes;
        
        const openMinutes = openHour * 60 + openMinute;
        const closeMinutes = closeHour * 60 + closeMinute;
        
        // Check if current time is within trading hours
        return totalMinutes >= openMinutes && totalMinutes < closeMinutes;
    }

    getNextEvent(session, marketTime) {
        const [openHour, openMinute] = session.open.split(':').map(Number);
        const [closeHour, closeMinute] = session.close.split(':').map(Number);
        
        const marketHours = marketTime.getHours();
        const marketMinutes = marketTime.getMinutes();
        const totalMinutes = marketHours * 60 + marketMinutes;
        
        const openMinutes = openHour * 60 + openMinute;
        const closeMinutes = closeHour * 60 + closeMinute;
        
        if (totalMinutes < openMinutes) {
            return {
                type: 'open',
                time: `${session.open}`,
                inMinutes: openMinutes - totalMinutes
            };
        } else if (totalMinutes < closeMinutes) {
            return {
                type: 'close',
                time: `${session.close}`,
                inMinutes: closeMinutes - totalMinutes
            };
        } else {
            // Market closed for today, next opening is tomorrow
            return {
                type: 'open',
                time: `${session.open}`,
                inMinutes: (24 * 60 - totalMinutes) + openMinutes
            };
        }
    }

    displayMarketSessions() {
        const container = document.getElementById('marketSessions');
        if (!container) return;

        container.innerHTML = this.marketSessions.map(session => {
            const statusClass = session.isOpen ? 'open' : 'closed';
            const statusText = session.isOpen ? 'OPEN' : 'CLOSED';
            const statusColor = session.isOpen ? 'status-open' : 'status-closed';
            
            const nextEventText = session.nextEvent ? 
                `Next: ${session.nextEvent.type === 'open' ? 'Open' : 'Close'} at ${session.nextEvent.time} (in ${session.nextEvent.inMinutes}m)` : 
                '';

            return `
                <div class="market-session ${statusClass}">
                    <div class="session-info">
                        <h3>${session.name} (${session.symbol})</h3>
                        <div class="session-times">
                            Local Time: <strong>${session.localTime}</strong> | 
                            Trading: ${session.open} - ${session.close} |
                            ${nextEventText}
                        </div>
                        <div class="session-timezone">
                            Timezone: ${session.timezone}
                        </div>
                    </div>
                    <div class="session-status ${statusColor}">
                        ${statusText}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateNextBell() {
        const nextBellInfo = document.getElementById('nextBellInfo');
        if (!nextBellInfo) return;

        let nextEvent = null;
        let nextSession = null;

        this.marketSessions.forEach(session => {
            if (session.nextEvent && (!nextEvent || session.nextEvent.inMinutes < nextEvent.inMinutes)) {
                nextEvent = session.nextEvent;
                nextSession = session;
            }
        });

        if (nextSession && nextEvent) {
            const hours = Math.floor(nextEvent.inMinutes / 60);
            const minutes = nextEvent.inMinutes % 60;
            
            nextBellInfo.innerHTML = `
                <strong>${nextSession.name}</strong><br>
                ${nextEvent.type === 'open' ? 'Opening' : 'Closing'} bell in 
                <strong>${hours}h ${minutes}m</strong><br>
                (at ${nextEvent.time} local time)
            `;
        } else {
            nextBellInfo.textContent = 'No upcoming market bells found';
        }
    }

    checkMarketBells() {
        // Check for upcoming market bells (within 5 minutes)
        this.marketSessions.forEach(session => {
            if (session.nextEvent && session.nextEvent.inMinutes <= 5) {
                this.triggerBellAlert(session, session.nextEvent.type);
            }
        });
    }

    triggerBellAlert(session, eventType) {
        if (this.shouldTriggerAlert(session.symbol, eventType)) {
            const message = `${session.name} ${eventType === 'open' ? 'opening' : 'closing'} bell in ${session.nextEvent.inMinutes} minutes!`;
            
            // Show browser notification
            if (Notification.permission === 'granted') {
                new Notification('Market Bell Alert', {
                    body: message,
                    icon: '/icon.png'
                });
            }
            
            // Show in-app notification
            this.showInAppNotification(message, 'warning');
            
            // Mark as triggered to avoid duplicate alerts
            this.markAlertTriggered(session.symbol, eventType);
        }
    }

    shouldTriggerAlert(symbol, eventType) {
        const key = `${symbol}_${eventType}`;
        const lastTriggered = localStorage.getItem(key);
        const now = Date.now();
        
        // Only trigger if not triggered in the last 10 minutes
        if (!lastTriggered || (now - parseInt(lastTriggered)) > 10 * 60 * 1000) {
            localStorage.setItem(key, now.toString());
            return true;
        }
        return false;
    }

    markAlertTriggered(symbol, eventType) {
        const key = `${symbol}_${eventType}`;
        localStorage.setItem(key, Date.now().toString());
    }

    showInAppNotification(message, type) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>MARKET BELL</strong><br>
                ${message}
            </div>
        `;

        container.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
}
