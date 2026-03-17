/**
 * Clean World Dashboard Pro — Application Logic
 */

(function () {
    'use strict';

    // ===== STATE =====
    let currentYear = 2025;
    let currentScenario = 'netzero';
    let currentLayer = 'renewable';
    let isPlaying = false;
    let playInterval = null;
    let playSpeed = 800;
    let map, countryMarkers = [], geoJsonLayer = null;
    let chartEnergyMix, chartCO2, chartInvestment;

    // ===== DOM REFS =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const yearSlider = $('#yearSlider');
    const yearDisplay = $('#yearDisplay');
    const playBtn = $('#playBtn');
    const playIcon = $('#playIcon');
    const pauseIcon = $('#pauseIcon');
    const scenarioSelect = $('#scenarioSelect');
    const speedSelect = $('#speedSelect');
    const layerBtns = $$('.map-layer-btn');

    // ===== INIT =====
    function init() {
        initMap();
        initCharts();
        bindEvents();
        update();
    }

    // ===== MAP =====
    function initMap() {
        map = L.map('map', {
            center: [25, 10],
            zoom: 2.5,
            minZoom: 2,
            maxZoom: 6,
            zoomControl: true,
            attributionControl: true,
            worldCopyJump: true,
        });

        // Dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(map);

        // Labels on top
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19,
            pane: 'shadowPane',
        }).addTo(map);
    }

    function updateMapMarkers() {
        // Remove existing markers
        countryMarkers.forEach(m => map.removeLayer(m));
        countryMarkers = [];

        const countries = DATA.getCountryData(currentYear, currentScenario);

        for (const [code, data] of Object.entries(countries)) {
            const value = getLayerValue(data);
            const color = getLayerColor(value);
            const radius = getMarkerRadius(code);

            const marker = L.circleMarker([data.lat, data.lng], {
                radius: radius,
                fillColor: color,
                color: color,
                weight: 1.5,
                opacity: 0.9,
                fillOpacity: 0.6,
            }).addTo(map);

            marker.bindPopup(createPopupContent(code, data), {
                maxWidth: 280,
                className: 'dark-popup',
            });

            // Hover effect
            marker.on('mouseover', function () {
                this.setStyle({ fillOpacity: 0.85, weight: 2.5, radius: radius + 2 });
                this.openPopup();
            });
            marker.on('mouseout', function () {
                this.setStyle({ fillOpacity: 0.6, weight: 1.5, radius: radius });
                this.closePopup();
            });

            countryMarkers.push(marker);
        }
    }

    function getLayerValue(data) {
        switch (currentLayer) {
            case 'renewable': return data.renewableShare;
            case 'emissions': return data.co2_mt;
            case 'temperature': return DATA.getTemperatureData(currentScenario)[currentYear];
            case 'air': return data.pm25;
            default: return data.renewableShare;
        }
    }

    function getLayerColor(value) {
        switch (currentLayer) {
            case 'renewable':
                return renewableColor(value);
            case 'emissions':
                return emissionsColor(value);
            case 'temperature':
                return temperatureColor(value);
            case 'air':
                return airQualityColor(value);
            default:
                return renewableColor(value);
        }
    }

    function renewableColor(pct) {
        if (pct >= 80) return '#22c55e';
        if (pct >= 60) return '#84cc16';
        if (pct >= 40) return '#eab308';
        if (pct >= 20) return '#f97316';
        return '#ef4444';
    }

    function emissionsColor(mt) {
        if (mt <= 50) return '#22c55e';
        if (mt <= 200) return '#84cc16';
        if (mt <= 500) return '#eab308';
        if (mt <= 2000) return '#f97316';
        return '#ef4444';
    }

    function temperatureColor(temp) {
        if (temp <= 1.5) return '#22c55e';
        if (temp <= 1.7) return '#eab308';
        if (temp <= 2.0) return '#f97316';
        return '#ef4444';
    }

    function airQualityColor(pm25) {
        if (pm25 <= 5) return '#22c55e';
        if (pm25 <= 10) return '#84cc16';
        if (pm25 <= 25) return '#eab308';
        if (pm25 <= 50) return '#f97316';
        return '#ef4444';
    }

    function getMarkerRadius(code) {
        const large = ['CHN', 'USA', 'IND', 'RUS', 'BRA'];
        const medium = ['CAN', 'AUS', 'DEU', 'GBR', 'FRA', 'JPN', 'KOR', 'IDN', 'MEX', 'SAU', 'ZAF'];
        if (large.includes(code)) return 14;
        if (medium.includes(code)) return 10;
        return 7;
    }

    function createPopupContent(code, data) {
        const tempData = DATA.getTemperatureData(currentScenario);
        return `
            <div class="country-popup">
                <h3>${data.name}</h3>
                <div class="popup-row">
                    <span class="popup-label">Renewable Share</span>
                    <span class="popup-value" style="color:#22c55e">${data.renewableShare}%</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">CO₂ Emissions</span>
                    <span class="popup-value" style="color:#f59e0b">${data.co2_mt.toLocaleString()} Mt</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Air Quality (PM2.5)</span>
                    <span class="popup-value" style="color:${airQualityColor(data.pm25)}">${data.pm25} µg/m³</span>
                </div>
                <div class="popup-row">
                    <span class="popup-label">Temperature Δ</span>
                    <span class="popup-value" style="color:${temperatureColor(tempData[currentYear])}">+${tempData[currentYear]}°C</span>
                </div>
            </div>
        `;
    }

    function updateLegend() {
        const legend = $('#mapLegend');
        const bar = legend.querySelector('.legend-bar');
        const labels = legend.querySelector('.legend-labels');

        switch (currentLayer) {
            case 'renewable':
                legend.querySelector('h4').textContent = 'Renewable Energy Share (%)';
                bar.style.background = 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)';
                labels.innerHTML = '<span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>';
                break;
            case 'emissions':
                legend.querySelector('h4').textContent = 'CO₂ Emissions (Mt/year)';
                bar.style.background = 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)';
                labels.innerHTML = '<span>0</span><span>500</span><span>2,000</span><span>5,000</span><span>10,000+</span>';
                break;
            case 'temperature':
                legend.querySelector('h4').textContent = 'Temperature Anomaly (°C)';
                bar.style.background = 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)';
                labels.innerHTML = '<span>+1.0</span><span>+1.5</span><span>+1.7</span><span>+2.0</span><span>+2.5</span>';
                break;
            case 'air':
                legend.querySelector('h4').textContent = 'Air Quality — PM2.5 (µg/m³)';
                bar.style.background = 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444)';
                labels.innerHTML = '<span>0</span><span>10</span><span>25</span><span>50</span><span>75+</span>';
                break;
        }
    }

    // ===== KPIs =====
    function updateKPIs() {
        const kpis = DATA.getGlobalKPIs(currentYear, currentScenario);
        const prev = currentYear > 2025 ? DATA.getGlobalKPIs(currentYear - 1, currentScenario) : null;

        // Renewable
        $('#kpiRenewable').textContent = `${kpis.renewableShare}%`;
        if (prev) {
            const d = +(kpis.renewableShare - prev.renewableShare).toFixed(1);
            $('#kpiRenewableDelta').textContent = `${d >= 0 ? '+' : ''}${d}% from ${currentYear - 1}`;
            $('#kpiRenewableDelta').className = `kpi-delta ${d >= 0 ? 'positive' : 'negative'}`;
        }

        // CO2
        $('#kpiCO2').textContent = `${kpis.co2} Gt`;
        if (prev) {
            const d = +(kpis.co2 - prev.co2).toFixed(1);
            $('#kpiCO2Delta').textContent = `${d >= 0 ? '+' : ''}${d} Gt from ${currentYear - 1}`;
            $('#kpiCO2Delta').className = `kpi-delta ${d <= 0 ? 'positive' : 'negative'}`;
        }

        // Temperature
        $('#kpiTemp').textContent = `+${kpis.temperature}°C`;
        $('#kpiTempDelta').textContent = 'vs pre-industrial';
        const tempClass = kpis.temperature <= 1.5 ? 'positive' : kpis.temperature <= 2.0 ? 'neutral' : 'negative';
        $('#kpiTempDelta').className = `kpi-delta ${tempClass}`;

        // EV
        $('#kpiEV').textContent = `${kpis.evShare}%`;
        if (prev) {
            const d = +(kpis.evShare - prev.evShare).toFixed(1);
            $('#kpiEVDelta').textContent = `${d >= 0 ? '+' : ''}${d}% from ${currentYear - 1}`;
            $('#kpiEVDelta').className = `kpi-delta ${d >= 0 ? 'positive' : 'negative'}`;
        }

        // Investment
        $('#kpiInvest').textContent = `$${kpis.cleanInvestment}T`;
        if (prev) {
            const d = +(kpis.cleanInvestment - prev.cleanInvestment).toFixed(1);
            $('#kpiInvestDelta').textContent = `${d >= 0 ? '+' : ''}$${d}T from ${currentYear - 1}`;
            $('#kpiInvestDelta').className = `kpi-delta ${d >= 0 ? 'positive' : 'negative'}`;
        }

        // Coal
        $('#kpiCoal').textContent = `${kpis.coalCapacity.toLocaleString()} GW`;
        if (prev) {
            const d = Math.round(kpis.coalCapacity - prev.coalCapacity);
            $('#kpiCoalDelta').textContent = `${d >= 0 ? '+' : ''}${d.toLocaleString()} GW from ${currentYear - 1}`;
            $('#kpiCoalDelta').className = `kpi-delta ${d <= 0 ? 'positive' : 'negative'}`;
        }
    }

    // ===== CHARTS =====
    const chartColors = {
        coal: '#6b7280',
        oil: '#a16207',
        gas: '#d97706',
        nuclear: '#7c3aed',
        renewables: '#22c55e',
    };

    function initCharts() {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = '#1e2d4a';
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.font.size = 10;

        const years = [];
        for (let y = 2025; y <= 2050; y++) years.push(y);

        // Energy Mix — stacked area
        chartEnergyMix = new Chart($('#chartEnergyMix'), {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    { label: 'Renewables', data: [], borderColor: chartColors.renewables, backgroundColor: 'rgba(34,197,94,0.2)', fill: true, tension: 0.3, pointRadius: 0 },
                    { label: 'Nuclear', data: [], borderColor: chartColors.nuclear, backgroundColor: 'rgba(124,58,237,0.15)', fill: true, tension: 0.3, pointRadius: 0 },
                    { label: 'Gas', data: [], borderColor: chartColors.gas, backgroundColor: 'rgba(217,119,6,0.15)', fill: true, tension: 0.3, pointRadius: 0 },
                    { label: 'Oil', data: [], borderColor: chartColors.oil, backgroundColor: 'rgba(161,98,7,0.15)', fill: true, tension: 0.3, pointRadius: 0 },
                    { label: 'Coal', data: [], borderColor: chartColors.coal, backgroundColor: 'rgba(107,114,128,0.15)', fill: true, tension: 0.3, pointRadius: 0 },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
                    y: { stacked: true, grid: { color: '#1e2d4a' }, ticks: { callback: v => (v / 1000) + 'k' } },
                },
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 8, padding: 8, font: { size: 9 } } },
                    tooltip: {
                        backgroundColor: '#1a2236',
                        borderColor: '#1e2d4a',
                        borderWidth: 1,
                        titleFont: { weight: '600' },
                        callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} TWh` },
                    },
                },
            },
        });

        // CO2 Pathway
        chartCO2 = new Chart($('#chartCO2'), {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    { label: 'STEPS', data: [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                    { label: 'APS', data: [], borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                    { label: 'NZE', data: [], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
                    y: { grid: { color: '#1e2d4a' }, ticks: { callback: v => v + ' Gt' } },
                },
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { boxWidth: 8, padding: 8, font: { size: 9 } } },
                    tooltip: {
                        backgroundColor: '#1a2236',
                        borderColor: '#1e2d4a',
                        borderWidth: 1,
                        callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y} Gt CO₂` },
                    },
                    annotation: undefined,
                },
            },
        });

        // Investment
        chartInvestment = new Chart($('#chartInvestment'), {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Clean Energy Investment',
                    data: [],
                    backgroundColor: [],
                    borderRadius: 2,
                    borderSkipped: false,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
                    y: { grid: { color: '#1e2d4a' }, ticks: { callback: v => '$' + v + 'T' } },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a2236',
                        borderColor: '#1e2d4a',
                        borderWidth: 1,
                        callbacks: { label: ctx => `$${ctx.parsed.y}T` },
                    },
                },
            },
        });
    }

    function updateCharts() {
        const years = [];
        for (let y = 2025; y <= 2050; y++) years.push(y);

        // Energy mix
        const mix = DATA.getEnergyMix(currentScenario);
        chartEnergyMix.data.datasets[0].data = years.map(y => mix.renewables[y]);
        chartEnergyMix.data.datasets[1].data = years.map(y => mix.nuclear[y]);
        chartEnergyMix.data.datasets[2].data = years.map(y => mix.gas[y]);
        chartEnergyMix.data.datasets[3].data = years.map(y => mix.oil[y]);
        chartEnergyMix.data.datasets[4].data = years.map(y => mix.coal[y]);
        chartEnergyMix.update('none');

        // CO2 — all three scenarios
        const co2Steps = DATA.getCO2Pathway('stated');
        const co2Aps = DATA.getCO2Pathway('announced');
        const co2Nze = DATA.getCO2Pathway('netzero');
        chartCO2.data.datasets[0].data = years.map(y => co2Steps[y]);
        chartCO2.data.datasets[1].data = years.map(y => co2Aps[y]);
        chartCO2.data.datasets[2].data = years.map(y => co2Nze[y]);

        // Highlight current scenario line
        const scenarioIdx = { stated: 0, announced: 1, netzero: 2 };
        chartCO2.data.datasets.forEach((ds, i) => {
            ds.borderWidth = i === scenarioIdx[currentScenario] ? 3 : 1.5;
            ds.borderDash = i === scenarioIdx[currentScenario] ? [] : [4, 3];
        });
        chartCO2.update('none');

        // Investment
        const inv = DATA.getInvestmentPathway(currentScenario);
        const invData = years.map(y => inv[y]);
        const invColors = invData.map(v => {
            if (v >= 4) return 'rgba(34,197,94,0.7)';
            if (v >= 3) return 'rgba(132,204,22,0.7)';
            if (v >= 2) return 'rgba(245,158,11,0.7)';
            return 'rgba(239,68,68,0.7)';
        });
        chartInvestment.data.datasets[0].data = invData;
        chartInvestment.data.datasets[0].backgroundColor = invColors;
        chartInvestment.update('none');

        // Draw current year indicator on charts
        drawYearIndicator();
    }

    function drawYearIndicator() {
        const yearIdx = currentYear - 2025;

        // Add vertical line plugin for year indicator
        const plugin = {
            id: 'yearLine',
            afterDraw(chart) {
                const meta = chart.getDatasetMeta(0);
                if (!meta.data[yearIdx]) return;
                const x = meta.data[yearIdx].x;
                const ctx = chart.ctx;
                const topY = chart.chartArea.top;
                const bottomY = chart.chartArea.bottom;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgba(255,255,255,0.4)';
                ctx.setLineDash([4, 3]);
                ctx.stroke();
                ctx.restore();
            },
        };

        // Register plugin on each chart (replace if exists)
        [chartEnergyMix, chartCO2, chartInvestment].forEach(chart => {
            chart.config.plugins = chart.config.plugins || [];
            chart.config.plugins = chart.config.plugins.filter(p => p.id !== 'yearLine');
            chart.config.plugins.push(plugin);
            chart.update('none');
        });
    }

    // ===== UPDATE ALL =====
    function update() {
        yearDisplay.textContent = currentYear;
        yearSlider.value = currentYear;
        updateKPIs();
        updateMapMarkers();
        updateLegend();
        updateCharts();
    }

    // ===== PLAYBACK =====
    function togglePlay() {
        if (isPlaying) {
            stopPlay();
        } else {
            startPlay();
        }
    }

    function startPlay() {
        isPlaying = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        playBtn.style.background = '#f59e0b';

        if (currentYear >= 2050) currentYear = 2025;

        playInterval = setInterval(() => {
            if (currentYear >= 2050) {
                stopPlay();
                return;
            }
            currentYear++;
            update();
        }, playSpeed);
    }

    function stopPlay() {
        isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        playBtn.style.background = '';
        if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
        }
    }

    // ===== EVENTS =====
    function bindEvents() {
        yearSlider.addEventListener('input', (e) => {
            currentYear = parseInt(e.target.value);
            if (isPlaying) stopPlay();
            update();
        });

        playBtn.addEventListener('click', togglePlay);

        scenarioSelect.addEventListener('change', (e) => {
            currentScenario = e.target.value;
            update();
        });

        speedSelect.addEventListener('change', (e) => {
            playSpeed = parseInt(e.target.value);
            if (isPlaying) {
                stopPlay();
                startPlay();
            }
        });

        layerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                layerBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentLayer = btn.dataset.layer;
                updateMapMarkers();
                updateLegend();
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                togglePlay();
            }
            if (e.key === 'ArrowRight' && currentYear < 2050) {
                if (isPlaying) stopPlay();
                currentYear++;
                update();
            }
            if (e.key === 'ArrowLeft' && currentYear > 2025) {
                if (isPlaying) stopPlay();
                currentYear--;
                update();
            }
        });
    }

    // ===== GO =====
    document.addEventListener('DOMContentLoaded', init);

})();
