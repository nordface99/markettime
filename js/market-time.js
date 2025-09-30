class MarketTimeManager {
    constructor() {
        this.marketSessions = [
            {
                name: "New York Stock Exchange",
                open: "09:30",
                close: "16:00",
                timezone: "America/New_York",
                symbol: "NYSE"
            },
            {
                name: "London Stock Exchange",
                open: "08:00",
                close: "16:30",
                timezone: "Europe/London",
                symbol: "LSE"
            },
            {
                name: "Tokyo Stock Exchange",
                open: "09:00",
                close: "15:00",
                timezone: "Asia/Tokyo",
                symbol: "TSE"
            },
            {
                name: "Hong Kong Stock Exchange",
                open: "09:30",
                close: "16:00",
                timezone: "Asia/Hong_Kong",
                symbol: "HKEX"
            },
            {
                name: "Sydney Stock Exchange",
                open: "10:00",
                close: "16:00",
                timezone: "Australia/Sydney",
                symbol: "ASX"
            },
            {
                name: "Frankfurt Stock Exchange",
                open: "09:00",
                close: "17:30",
                timezone: "Europe/Berlin",
                symbol: "FWB"
            }
        ];
        
        this.init();
    }

    init() {
        this.updateMarketTimes();
        setInterval(() => this.updateMarketTimes(), 60000); // Update every minute
        setInterval(() => this.checkMarketBells(), 30000); // Check bells every 30 seconds
    }

    updateMarketTimes() {
        const container = document.getElementById('marketSessions');
        if (!container) return;

        container.innerHTML = this.marketSessions.map(session => {
            const status = this.getMarketStatus(session);
            const localTime = this.getLocalTime(session.timezone);
            
            return `
                <div class="market-session ${status.isOpen ? 'open' : 'closed'}">
                    <div class="session-info">
                        <h3>${session.name} (${session.symbol})</h3>
                        <div class="session-times">
                            Local Time: ${localTime} | 
                            Open: ${session.open} - Close: ${session.close}
                        </div>
                    </div>
                    <div class="session-status ${status.isOpen ? 'status-open' : 'status-closed'}">
                        ${status.isOpen ? 'OPEN' : 'CLOSED'}
                    </div>
                </div>
            `;
        }).join('');

        this.updateNextBell();
    }

    getMarketStatus(session) {
        const now = this.getTimeInTimezone(session.timezone);
        const [openHour, openMinute] = session.open.split(':').map(Number);
        const [closeHour, closeMinute] = session.close.split(':').map(Number);
        
        const openTime = new Date(now);
        openTime.setHours(openHour, openMinute, 0, 0);
        
        const closeTime = new Date(now);
        closeTime.setHours(closeHour, closeMinute, 0, 0);
        
        return {
            isOpen: now >= openTime && now < closeTime,
            nextEvent: now < openTime ? 'open' : 'close',
            nextEventTime: now < openTime ? openTime : closeTime
        };
    }

    getTimeInTimezone(timezone) {
        return new Date().toLocaleString("en-US", { timeZone: timezone });
    }

    getLocalTime(timezone) {
        return new Date().toLocaleTimeString("en-US", { 
            timeZone: timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    updateNextBell() {
        const nextBellInfo = document.getElementById('nextBellInfo');
        if (!nextBellInfo) return;

        const now = new Date();
        let nextEvent = null;
        let nextSession = null;

        this.marketSessions.forEach(session => {
            const status = this.getMarketStatus(session);
            if (status.nextEventTime > now) {
                if (!nextEvent || status.nextEventTime < nextEvent) {
                    nextEvent = status.nextEventTime;
                    nextSession = session;
                }
            }
        });

        if (nextSession && nextEvent) {
            const timeDiff = nextEvent - now;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            
            const eventType = this.getMarketStatus(nextSession).nextEvent;
            nextBellInfo.innerHTML = `
                <strong>${nextSession.name}</strong> ${eventType === 'open' ? 'Opening' : 'Closing'} 
                in ${hours}h ${minutes}m (${nextEvent.toLocaleTimeString()})
            `;
        } else {
            nextBellInfo.textContent = 'No upcoming market bells today';
        }
    }

    checkMarketBells() {
        // Check if we should trigger alerts for market bells
        // This would integrate with the notification system
        console.log('Checking market bells...');
    }
}
