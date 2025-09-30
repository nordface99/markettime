class EconomicCalendarManager {
    constructor() {
        this.events = [];
        this.currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD', 'CHF', 'CNY'];
        this.selectedCurrencies = new Set(['USD', 'EUR', 'GBP', 'JPY']);
        this.impactColors = {
            'high': '#dc3545',
            'medium': '#ffc107',
            'low': '#28a745'
        };
        this.init();
    }

    async init() {
        this.createCurrencyFilters();
        await this.loadEconomicEvents();
        setInterval(() => this.loadEconomicEvents(), 300000); // Reload every 5 minutes
        setInterval(() => this.checkUpcomingEvents(), 60000); // Check events every minute
    }

    createCurrencyFilters() {
        const container = document.getElementById('currencyFilters');
        if (!container) return;

        const currencyNames = {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'British Pound',
            'JPY': 'Japanese Yen',
            'CAD': 'Canadian Dollar',
            'AUD': 'Australian Dollar',
            'NZD': 'New Zealand Dollar',
            'CHF': 'Swiss Franc',
            'CNY': 'Chinese Yuan'
        };

        container.innerHTML = this.currencies.map(currency => `
            <button class="currency-btn ${this.selectedCurrencies.has(currency) ? 'active' : ''}" 
                    data-currency="${currency}"
                    title="${currencyNames[currency]}">
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
            // Try to fetch from free economic calendar API
            await this.fetchRealEconomicEvents();
        } catch (error) {
            console.log('Falling back to mock data:', error);
            this.events = this.generateRealisticEvents();
        }
        this.displayEvents();
    }

    async fetchRealEconomicEvents() {
        // Using Forex Factory's public data (example)
        const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
        if (response.ok) {
            const data = await response.json();
            this.events = this.processApiData(data);
        } else {
            throw new Error('API not available');
        }
    }

    processApiData(apiData) {
        return apiData.map(item => {
            const eventDate = new Date(item.date);
            const impact = this.mapImpactLevel(item.impact);
            
            return {
                currency: item.currency,
                event: item.title,
                date: eventDate,
                impact: impact,
                forecast: item.forecast,
                previous: item.previous,
                actual: item.actual,
                country: item.country
            };
        }).filter(event => 
            event.currency && 
            this.currencies.includes(event.currency) &&
            event.date > new Date()
        ).sort((a, b) => a.date - b.date);
    }

    mapImpactLevel(impact) {
        switch(impact) {
            case 'High': return 'high';
            case 'Medium': return 'medium';
            case 'Low': return 'low';
            default: return 'low';
        }
    }

    generateRealisticEvents() {
        const events = [];
        const now = new Date();
        
        const eventTemplates = {
            'USD': [
                { name: 'Non-Farm Payrolls', impact: 'high', time: [8, 30] },
                { name: 'CPI Inflation', impact: 'high', time: [8, 30] },
                { name: 'Federal Funds Rate', impact: 'high', time: [14, 0] },
                { name: 'GDP Growth Rate', impact: 'high', time: [8, 30] },
                { name: 'Retail Sales', impact: 'medium', time: [8, 30] },
                { name: 'Unemployment Rate', impact: 'medium', time: [8, 30] }
            ],
            'EUR': [
                { name: 'ECB Interest Rate Decision', impact: 'high', time: [12, 45] },
                { name: 'German ZEW Economic Sentiment', impact: 'medium', time: [10, 0] },
                { name: 'CPI Flash Estimate', impact: 'high', time: [10, 0] },
                { name: 'German GDP', impact: 'medium', time: [8, 0] }
            ],
            'GBP': [
                { name: 'BOE Interest Rate Decision', impact: 'high', time: [12, 0] },
                { name: 'CPI Inflation', impact: 'high', time: [7, 0] },
                { name: 'GDP Growth Rate', impact: 'medium', time: [7, 0] },
                { name: 'Retail Sales', impact: 'medium', time: [7, 0] }
            ],
            'JPY': [
                { name: 'BOJ Interest Rate Decision', impact: 'high', time: [3, 0] },
                { name: 'Tokyo CPI Inflation', impact: 'medium', time: [0, 30] },
                { name: 'GDP Growth Rate', impact: 'medium', time: [1, 0] }
            ]
        };

        // Generate events for the next 3 days
        for (let day = 0; day < 3; day++) {
            const eventDate = new Date(now);
            eventDate.setDate(now.getDate() + day);
            
            Object.keys(eventTemplates).forEach(currency => {
                eventTemplates[currency].forEach(template => {
                    if (Math.random() > 0.3) { // 70% chance to include each event
                        const eventTime = new Date(eventDate);
                        eventTime.setHours(template.time[0], template.time[1], 0, 0);
                        
                        // Add some random variation in timing
                        eventTime.setHours(eventTime.getHours() + Math.floor(Math.random() * 3) - 1);
                        
                        if (eventTime > now) {
                            events.push({
                                currency: currency,
                                event: template.name,
                                date: eventTime,
                                impact: template.impact,
                                forecast: this.generateForecast(),
                                previous: this.generatePrevious(),
                                actual: null
                            });
                        }
                    }
                });
            });
        }

        return events.sort((a, b) => a.date - b.date);
    }

    generateForecast() {
        const values = ['0.2%', '0.3%', '0.1%', '-0.1%', '0.5%', '1.2M', '235K', '2.5%', '3.1%'];
        return values[Math.floor(Math.random() * values.length)];
    }

    generatePrevious() {
        const values = ['0.1%', '0.4%', '0.2%', '0.0%', '0.3%', '1.1M', '240K', '2.3%', '3.0%'];
        return values[Math.floor(Math.random() * values.length)];
    }

    displayEvents() {
        const container = document.getElementById('economicEvents');
        if (!container) return;

        const filteredEvents = this.events.filter(event => 
            this.selectedCurrencies.has(event.currency)
        );

        if (filteredEvents.length === 0) {
            container.innerHTML = `
                <div class="no-events">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No economic events found</h3>
                    <p>Try selecting different currencies or check back later.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredEvents.map(event => {
            const timeString = event.date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short'
            });

            const dateString = event.date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });

            const timeUntil = this.getTimeUntilEvent(event.date);
            
            return `
                <div class="economic-event ${event.impact}-impact">
                    <div class="event-header">
                        <div class="event-main">
                            <span class="event-currency">${event.currency}</span>
                            <span class="event-name">${event.event}</span>
                        </div>
                        <span class="event-impact impact-${event.impact}">
                            ${event.impact.toUpperCase()} IMPACT
                        </span>
                    </div>
                    <div class="event-details">
                        <div class="event-time">
                            <i class="fas fa-clock"></i>
                            ${dateString} ${timeString}
                            <span class="time-until">(${timeUntil})</span>
                        </div>
                        <div class="event-data">
                            <span class="forecast">Forecast: ${event.forecast}</span>
                            <span class="previous">Previous: ${event.previous}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTimeUntilEvent(eventDate) {
        const now = new Date();
        const diffMs = eventDate - now;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHours > 24) {
            const days = Math.floor(diffHours / 24);
            return `in ${days} day${days > 1 ? 's' : ''}`;
        } else if (diffHours > 0) {
            return `in ${diffHours}h ${diffMinutes}m`;
        } else if (diffMinutes > 0) {
            return `in ${diffMinutes}m`;
        } else {
            return 'now';
        }
    }

    filterEvents() {
        this.displayEvents();
    }

    checkUpcomingEvents() {
        const now = new Date();
        const alertThreshold = 15 * 60 * 1000; // 15 minutes
        
        this.events.forEach(event => {
            if (this.selectedCurrencies.has(event.currency)) {
                const timeDiff = event.date - now;
                if (timeDiff > 0 && timeDiff <= alertThreshold) {
                    this.triggerEventAlert(event);
                }
            }
        });
    }

    triggerEventAlert(event) {
        const alertKey = `event_${event.currency}_${event.event}_${event.date.getTime()}`;
        const lastAlert = localStorage.getItem(alertKey);
        
        if (!lastAlert) {
            const message = `${event.currency} ${event.event} in 15 minutes! (${event.impact} impact)`;
            
            // Show notification
            if (Notification.permission === 'granted') {
                new Notification('Economic Event Alert', {
                    body: message,
                    icon: '/icon.png'
                });
            }
            
            console.log(`ALERT: ${message}`);
            localStorage.setItem(alertKey, Date.now().toString());
        }
    }
}
