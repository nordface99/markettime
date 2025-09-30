class EconomicCalendarManager {
    constructor() {
        this.events = [];
        this.currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD', 'CHF'];
        this.selectedCurrencies = new Set(['USD', 'EUR', 'GBP', 'JPY']);
        this.init();
    }

    async init() {
        this.createCurrencyFilters();
        await this.loadEconomicEvents();
        setInterval(() => this.loadEconomicEvents(), 300000); // Reload every 5 minutes
    }

    createCurrencyFilters() {
        const container = document.getElementById('currencyFilters');
        if (!container) return;

        container.innerHTML = this.currencies.map(currency => `
            <button class="currency-btn ${this.selectedCurrencies.has(currency) ? 'active' : ''}" 
                    data-currency="${currency}">
                ${currency}
            </button>
        `).join('');

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('currency-btn')) {
                const currency = e.target.dataset.currency;
                if (this.selectedCurrencies.has(currency)) {
                    this.selectedCurrencies.delete(currency);
                    e.target.classList.remove('active');
                } else {
                    this.selectedCurrencies.add(currency);
                    e.target.classList.add('active');
                }
                this.filterEvents();
            }
        });
    }

    async loadEconomicEvents() {
        try {
            // In a real app, you would fetch from an API
            // For demo purposes, we'll generate mock data
            this.events = this.generateMockEvents();
            this.displayEvents();
        } catch (error) {
            console.error('Error loading economic events:', error);
        }
    }

    generateMockEvents() {
        const events = [];
        const eventTypes = {
            'USD': ['Non-Farm Payrolls', 'CPI', 'GDP', 'Retail Sales', 'Fed Interest Rate Decision'],
            'EUR': ['GDP', 'CPI', 'ECB Interest Rate Decision', 'German ZEW Economic Sentiment'],
            'GBP': ['GDP', 'CPI', 'BOE Interest Rate Decision', 'Retail Sales'],
            'JPY': ['GDP', 'CPI', 'BOJ Interest Rate Decision', 'Tankan Survey'],
            'CAD': ['GDP', 'CPI', 'BOC Interest Rate Decision', 'Employment Change'],
            'AUD': ['GDP', 'CPI', 'RBA Interest Rate Decision', 'Employment Change'],
            'NZD': ['GDP', 'CPI', 'RBNZ Interest Rate Decision'],
            'CHF': ['GDP', 'CPI', 'SNB Interest Rate Decision']
        };

        const impacts = ['high', 'medium', 'medium', 'low']; // Weighted distribution

        this.currencies.forEach(currency => {
            eventTypes[currency].forEach(eventName => {
                const impact = impacts[Math.floor(Math.random() * impacts.length)];
                const eventDate = new Date();
                eventDate.setHours(eventDate.getHours() + Math.floor(Math.random() * 48));
                
                events.push({
                    currency: currency,
                    event: eventName,
                    date: eventDate,
                    impact: impact,
                    forecast: (Math.random() * 5 - 2.5).toFixed(1) + '%',
                    previous: (Math.random() * 5 - 2.5).toFixed(1) + '%'
                });
            });
        });

        return events.sort((a, b) => a.date - b.date);
    }

    displayEvents() {
        const container = document.getElementById('economicEvents');
        if (!container) return;

        const filteredEvents = this.events.filter(event => 
            this.selectedCurrencies.has(event.currency)
        );

        if (filteredEvents.length === 0) {
            container.innerHTML = '<div class="no-events">No economic events found for selected currencies</div>';
            return;
        }

        container.innerHTML = filteredEvents.map(event => {
            const timeString = event.date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            });

            return `
                <div class="economic-event ${event.impact}-impact">
                    <div class="event-header">
                        <span class="event-currency">${event.currency} - ${event.event}</span>
                        <span class="event-impact impact-${event.impact}">
                            ${event.impact.toUpperCase()} IMPACT
                        </span>
                    </div>
                    <div class="event-details">
                        <div class="event-time">${event.date.toLocaleDateString()} ${timeString}</div>
                        <div class="event-forecast">
                            Forecast: ${event.forecast} | Previous: ${event.previous}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterEvents() {
        this.displayEvents();
    }

    checkUpcomingEvents() {
        // Check for events happening soon and trigger alerts
        const now = new Date();
        const alertThreshold = 15 * 60 * 1000; // 15 minutes
        
        this.events.forEach(event => {
            const timeDiff = event.date - now;
            if (timeDiff > 0 && timeDiff <= alertThreshold) {
                // Trigger alert
                this.triggerEventAlert(event);
            }
        });
    }

    triggerEventAlert(event) {
        // This would integrate with the notification system
        console.log(`Alert: ${event.currency} ${event.event} in 15 minutes!`);
    }
}
