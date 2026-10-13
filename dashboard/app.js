document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = 'http://localhost:8081/api/analytics';

    // 1. Fetch Stations Table Data
    const populateStationsTable = async () => {
        try {
            const res = await fetch(`${API_BASE}/station-details`);
            const data = await res.json();
            const tbody = document.getElementById('stations-table-body');

            if (tbody) {
                tbody.innerHTML = data.map(item => {
                    const statusClass = item.status.toLowerCase().replace(/\s+/g, '-');
                    return `
                        <tr>
                            <td><strong>${item.station_name}</strong></td>
                            <td>${item.location}</td>
                            <td>${item.charger_type}</td>
                            <td>${item.max_power_kw} kW</td>
                            <td><span class="badge badge-${statusClass}">${item.status}</span></td>
                            <td>${Number(item.total_kwh_delivered).toFixed(2)} kWh</td>
                        </tr>
                    `;
                }).join('');
            }
        } catch (err) {
            console.error("Error loading station details:", err);
        }
    };

    // 2. Fetch Revenue Table Data
    const populateRevenueTable = async () => {
        try {
            const res = await fetch(`${API_BASE}/revenue-transactions`);
            const data = await res.json();
            const tbody = document.getElementById('revenue-table-body');

            if (tbody) {
                tbody.innerHTML = data.map(item => `
                    <tr>
                        <td>#PAY-${item.payment_id}</td>
                        <td><strong>${item.station_name}</strong></td>
                        <td>₹${Number(item.amount).toFixed(2)}</td>
                        <td>${item.payment_method}</td>
                        <td><span class="badge badge-available">${item.payment_status}</span></td>
                    </tr>
                `).join('');
            }
        } catch (err) {
            console.error("Error loading revenue details:", err);
        }
    };

    // 3. Sidebar Navigation Switcher
    const navLinks = document.querySelectorAll('.nav-link');
    const tabContents = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');

    const titleMap = {
        'overview': 'Operator Control Center',
        'stations': 'Stations & Chargers Management',
        'revenue': 'Revenue & Payment Analytics',
        'demand': 'Charging Demand & Peak Load',
        'maintenance': 'Equipment Maintenance & Diagnostics',
        'energy': 'Energy Consumption Analytics'
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');

            const viewKey = e.target.getAttribute('href').replace('#', '');
            const targetViewId = 'view-' + viewKey;

            tabContents.forEach(content => {
                content.style.display = (content.id === targetViewId) ? 'block' : 'none';
            });

            if (titleMap[viewKey]) {
                pageTitle.innerText = titleMap[viewKey];
            }

            // Fetch data specifically when navigating to sub-views
            if (viewKey === 'stations') populateStationsTable();
            if (viewKey === 'revenue') populateRevenueTable();
        });
    });

    try {
        // Fetch Overview KPIs
        const kpiRes = await fetch(`${API_BASE}/kpis`);
        const kpis = await kpiRes.json();

        document.getElementById('kpi-total-stations').innerText = kpis.totalStations;
        document.getElementById('kpi-total-chargers').innerText = kpis.totalChargers;
        document.getElementById('kpi-available-chargers').innerText = kpis.availableChargers;
        document.getElementById('kpi-completed-sessions').innerText = kpis.completedSessions;
        document.getElementById('kpi-total-revenue').innerText = `₹${kpis.totalRevenue.toFixed(2)}`;
        document.getElementById('kpi-total-energy').innerText = `${kpis.totalEnergyKwh.toFixed(2)} kWh`;

        // Chart 1: Revenue by Station
        const revRes = await fetch(`${API_BASE}/revenue-by-station`);
        const revData = await revRes.json();
        new Chart(document.getElementById('revenueByStationChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: revData.map(item => item.station_name),
                datasets: [{
                    label: 'Revenue (₹)',
                    data: revData.map(item => item.total_revenue),
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f293d' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
                }
            }
        });

        // Chart 2: Peak Hours
        const peakRes = await fetch(`${API_BASE}/peak-hours`);
        const peakData = await peakRes.json();
        new Chart(document.getElementById('peakHoursChart').getContext('2d'), {
            type: 'line',
            data: {
                labels: peakData.map(item => `${item.hour_of_day}:00`),
                datasets: [{
                    label: 'Sessions',
                    data: peakData.map(item => item.session_count),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f293d' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
                }
            }
        });

        // Chart 3: Charger Status
        const statusRes = await fetch(`${API_BASE}/charger-status`);
        const statusData = await statusRes.json();
        new Chart(document.getElementById('chargerStatusChart').getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: statusData.map(item => item.status),
                datasets: [{
                    data: statusData.map(item => item.count),
                    backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#6b7280']
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } }
            }
        });

        // Chart 4: Grid vs Delivered Energy
        const energyRes = await fetch(`${API_BASE}/energy-comparison`);
        const energyData = await energyRes.json();
        new Chart(document.getElementById('energyComparisonChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: energyData.map(item => item.station_name),
                datasets: [
                    {
                        label: 'Grid Input (kWh)',
                        data: energyData.map(item => item.grid_kwh),
                        backgroundColor: '#3b82f6',
                        borderRadius: 4
                    },
                    {
                        label: 'Delivered Power (kWh)',
                        data: energyData.map(item => item.delivered_kwh),
                        backgroundColor: '#10b981',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'top', labels: { color: '#9ca3af' } } },
                scales: {
                    y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f293d' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
                }
            }
        });

        // Initial fetch for sub-views on page load
        populateStationsTable();
        populateRevenueTable();

    } catch (error) {
        console.error("Error connecting to backend API:", error);
    }
});