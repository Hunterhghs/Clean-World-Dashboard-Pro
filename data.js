/**
 * Clean World Dashboard Pro — Data Module
 *
 * Sources:
 *   - IEA World Energy Outlook 2024 (STEPS, APS, NZE scenarios)
 *   - IRENA World Energy Transitions Outlook 2024
 *   - IPCC AR6 WG1/WG3 temperature pathways
 *   - BloombergNEF Energy Transition Investment Trends 2024
 *   - Global Carbon Project 2024
 *   - IEA Global EV Outlook 2024
 *   - WHO Global Air Quality Database
 *
 * All projections are based on published scenario data with linear
 * interpolation between key milestone years (2025, 2030, 2035, 2040, 2050).
 */

const DATA = (() => {

    // Helper: interpolate between milestone years
    function interp(milestones) {
        const years = Object.keys(milestones).map(Number).sort((a, b) => a - b);
        const result = {};
        for (let y = 2025; y <= 2050; y++) {
            if (milestones[y] !== undefined) { result[y] = milestones[y]; continue; }
            let lo = years[0], hi = years[years.length - 1];
            for (let i = 0; i < years.length - 1; i++) {
                if (years[i] <= y && years[i + 1] >= y) { lo = years[i]; hi = years[i + 1]; break; }
            }
            const t = (y - lo) / (hi - lo);
            result[y] = milestones[lo] + t * (milestones[hi] - milestones[lo]);
        }
        return result;
    }

    // Round helper
    function r(obj, decimals = 1) {
        const out = {};
        for (const [k, v] of Object.entries(obj)) out[k] = +v.toFixed(decimals);
        return out;
    }

    // ===== GLOBAL KPI DATA BY SCENARIO =====
    // Sources: IEA WEO 2024, IRENA WETO 2024, IPCC AR6

    const scenarios = {
        // ---- STATED POLICIES (STEPS) ----
        stated: {
            // Renewable share of electricity generation (%)
            // IEA WEO 2024 STEPS
            renewableShare: r(interp({ 2025: 30, 2030: 38, 2035: 44, 2040: 48, 2050: 55 })),

            // Global CO2 emissions from energy (Gt CO2)
            // IEA WEO 2024 STEPS — peaks ~2025, slow decline
            co2: r(interp({ 2025: 36.8, 2030: 35.5, 2035: 34.0, 2040: 32.0, 2050: 28.0 })),

            // Global mean temperature anomaly (°C above pre-industrial)
            // IPCC AR6 SSP2-4.5 approximate trajectory
            temperature: r(interp({ 2025: 1.45, 2030: 1.55, 2035: 1.65, 2040: 1.78, 2050: 2.1 }), 2),

            // EV share of new car sales (%)
            // IEA Global EV Outlook 2024 STEPS
            evShare: r(interp({ 2025: 22, 2030: 35, 2035: 45, 2040: 55, 2050: 70 })),

            // Annual clean energy investment ($ trillion)
            // BloombergNEF / IEA estimates
            cleanInvestment: r(interp({ 2025: 1.8, 2030: 2.2, 2035: 2.5, 2040: 2.7, 2050: 3.0 })),

            // Global coal power capacity (GW)
            // IEA WEO 2024
            coalCapacity: r(interp({ 2025: 2100, 2030: 1950, 2035: 1800, 2040: 1600, 2050: 1200 }), 0),

            // Energy mix (TWh) — Coal, Oil, Gas, Nuclear, Renewables
            energyMix: {
                coal:       r(interp({ 2025: 10200, 2030: 9500, 2035: 8800, 2040: 7800, 2050: 6000 }), 0),
                oil:        r(interp({ 2025: 5300,  2030: 5100, 2035: 4800, 2040: 4400, 2050: 3600 }), 0),
                gas:        r(interp({ 2025: 6500,  2030: 6600, 2035: 6500, 2040: 6200, 2050: 5500 }), 0),
                nuclear:    r(interp({ 2025: 2800,  2030: 3000, 2035: 3200, 2040: 3400, 2050: 3800 }), 0),
                renewables: r(interp({ 2025: 9600,  2030: 13500, 2035: 17000, 2040: 20500, 2050: 27000 }), 0),
            },
        },

        // ---- ANNOUNCED PLEDGES (APS) ----
        announced: {
            renewableShare: r(interp({ 2025: 30, 2030: 42, 2035: 52, 2040: 60, 2050: 72 })),
            co2: r(interp({ 2025: 36.8, 2030: 32.0, 2035: 26.0, 2040: 20.0, 2050: 12.0 })),
            temperature: r(interp({ 2025: 1.45, 2030: 1.52, 2035: 1.58, 2040: 1.64, 2050: 1.7 }), 2),
            evShare: r(interp({ 2025: 22, 2030: 42, 2035: 58, 2040: 72, 2050: 86 })),
            cleanInvestment: r(interp({ 2025: 1.8, 2030: 2.8, 2035: 3.4, 2040: 3.8, 2050: 4.2 })),
            coalCapacity: r(interp({ 2025: 2100, 2030: 1700, 2035: 1300, 2040: 900, 2050: 350 }), 0),
            energyMix: {
                coal:       r(interp({ 2025: 10200, 2030: 8000, 2035: 5800, 2040: 3800, 2050: 1500 }), 0),
                oil:        r(interp({ 2025: 5300,  2030: 4600, 2035: 3800, 2040: 3000, 2050: 1800 }), 0),
                gas:        r(interp({ 2025: 6500,  2030: 6200, 2035: 5500, 2040: 4500, 2050: 3000 }), 0),
                nuclear:    r(interp({ 2025: 2800,  2030: 3200, 2035: 3600, 2040: 4000, 2050: 4800 }), 0),
                renewables: r(interp({ 2025: 9600,  2030: 15000, 2035: 21000, 2040: 27000, 2050: 38000 }), 0),
            },
        },

        // ---- NET ZERO 2050 (NZE) ----
        netzero: {
            renewableShare: r(interp({ 2025: 30, 2030: 50, 2035: 65, 2040: 78, 2050: 90 })),
            co2: r(interp({ 2025: 36.8, 2030: 25.0, 2035: 15.0, 2040: 7.0, 2050: 0.0 })),
            temperature: r(interp({ 2025: 1.45, 2030: 1.50, 2035: 1.52, 2040: 1.50, 2050: 1.45 }), 2),
            evShare: r(interp({ 2025: 22, 2030: 55, 2035: 75, 2040: 88, 2050: 98 })),
            cleanInvestment: r(interp({ 2025: 1.8, 2030: 4.0, 2035: 4.8, 2040: 5.2, 2050: 5.5 })),
            coalCapacity: r(interp({ 2025: 2100, 2030: 1200, 2035: 600, 2040: 200, 2050: 0 }), 0),
            energyMix: {
                coal:       r(interp({ 2025: 10200, 2030: 5500, 2035: 2500, 2040: 800, 2050: 0 }), 0),
                oil:        r(interp({ 2025: 5300,  2030: 3800, 2035: 2500, 2040: 1500, 2050: 500 }), 0),
                gas:        r(interp({ 2025: 6500,  2030: 5000, 2035: 3500, 2040: 2000, 2050: 500 }), 0),
                nuclear:    r(interp({ 2025: 2800,  2030: 3500, 2035: 4200, 2040: 5000, 2050: 5800 }), 0),
                renewables: r(interp({ 2025: 9600,  2030: 18000, 2035: 28000, 2040: 38000, 2050: 52000 }), 0),
            },
        },
    };

    // ===== COUNTRY-LEVEL DATA =====
    // Renewable share % by country for map choropleth
    // Base year 2025 from IRENA Renewable Capacity Statistics 2024
    // Projections scaled per scenario

    const countryBase2025 = {
        // Country code: { name, renewableShare2025, co2_mt, lat, lng }
        // Renewable share = share of electricity from renewables
        USA: { name: "United States", ren: 23, co2: 4900, lat: 39.8, lng: -98.6 },
        CHN: { name: "China", ren: 32, co2: 11500, lat: 35.9, lng: 104.2 },
        IND: { name: "India", ren: 24, co2: 2900, lat: 20.6, lng: 79.0 },
        DEU: { name: "Germany", ren: 52, co2: 620, lat: 51.2, lng: 10.4 },
        GBR: { name: "United Kingdom", ren: 48, co2: 320, lat: 55.4, lng: -3.4 },
        FRA: { name: "France", ren: 27, co2: 290, lat: 46.2, lng: 2.2 },
        BRA: { name: "Brazil", ren: 85, co2: 480, lat: -14.2, lng: -51.9 },
        JPN: { name: "Japan", ren: 22, co2: 1050, lat: 36.2, lng: 138.3 },
        CAN: { name: "Canada", ren: 68, co2: 550, lat: 56.1, lng: -106.3 },
        AUS: { name: "Australia", ren: 35, co2: 380, lat: -25.3, lng: 133.8 },
        KOR: { name: "South Korea", ren: 10, co2: 590, lat: 35.9, lng: 127.8 },
        RUS: { name: "Russia", ren: 21, co2: 1700, lat: 61.5, lng: 105.3 },
        ZAF: { name: "South Africa", ren: 15, co2: 430, lat: -30.6, lng: 22.9 },
        SAU: { name: "Saudi Arabia", ren: 3, co2: 580, lat: 23.9, lng: 45.1 },
        IDN: { name: "Indonesia", ren: 20, co2: 620, lat: -0.8, lng: 113.9 },
        MEX: { name: "Mexico", ren: 28, co2: 430, lat: 23.6, lng: -102.6 },
        TUR: { name: "Turkey", ren: 42, co2: 420, lat: 38.9, lng: 35.2 },
        NOR: { name: "Norway", ren: 98, co2: 30, lat: 60.5, lng: 8.5 },
        SWE: { name: "Sweden", ren: 72, co2: 35, lat: 60.1, lng: 18.6 },
        DNK: { name: "Denmark", ren: 84, co2: 25, lat: 56.3, lng: 9.5 },
        NLD: { name: "Netherlands", ren: 40, co2: 140, lat: 52.1, lng: 5.3 },
        ESP: { name: "Spain", ren: 50, co2: 210, lat: 40.5, lng: -3.7 },
        ITA: { name: "Italy", ren: 44, co2: 310, lat: 41.9, lng: 12.6 },
        POL: { name: "Poland", ren: 23, co2: 300, lat: 51.9, lng: 19.1 },
        EGY: { name: "Egypt", ren: 12, co2: 250, lat: 26.8, lng: 30.8 },
        NGA: { name: "Nigeria", ren: 18, co2: 130, lat: 9.1, lng: 8.7 },
        KEN: { name: "Kenya", ren: 90, co2: 20, lat: -0.0, lng: 37.9 },
        CHL: { name: "Chile", ren: 55, co2: 85, lat: -35.7, lng: -71.5 },
        ARG: { name: "Argentina", ren: 30, co2: 170, lat: -38.4, lng: -63.6 },
        COL: { name: "Colombia", ren: 75, co2: 85, lat: 4.6, lng: -74.3 },
        ARE: { name: "UAE", ren: 7, co2: 200, lat: 23.4, lng: 53.8 },
        THA: { name: "Thailand", ren: 18, co2: 260, lat: 15.9, lng: 100.5 },
        VNM: { name: "Vietnam", ren: 35, co2: 310, lat: 14.1, lng: 108.3 },
        PHL: { name: "Philippines", ren: 25, co2: 160, lat: 12.9, lng: 121.8 },
        MYS: { name: "Malaysia", ren: 20, co2: 250, lat: 4.2, lng: 101.9 },
        PAK: { name: "Pakistan", ren: 30, co2: 220, lat: 30.4, lng: 69.3 },
        BGD: { name: "Bangladesh", ren: 5, co2: 100, lat: 23.7, lng: 90.4 },
        ETH: { name: "Ethiopia", ren: 96, co2: 18, lat: 9.1, lng: 40.5 },
        MAR: { name: "Morocco", ren: 38, co2: 65, lat: 31.8, lng: -7.1 },
        ISR: { name: "Israel", ren: 12, co2: 60, lat: 31.0, lng: 34.9 },
        NZL: { name: "New Zealand", ren: 82, co2: 30, lat: -40.9, lng: 174.9 },
        PRT: { name: "Portugal", ren: 61, co2: 38, lat: 39.4, lng: -8.2 },
        GRC: { name: "Greece", ren: 45, co2: 52, lat: 39.1, lng: 21.8 },
        AUT: { name: "Austria", ren: 78, co2: 55, lat: 47.5, lng: 14.6 },
        CHE: { name: "Switzerland", ren: 76, co2: 32, lat: 46.8, lng: 8.2 },
        FIN: { name: "Finland", ren: 52, co2: 35, lat: 61.9, lng: 25.7 },
        UKR: { name: "Ukraine", ren: 14, co2: 130, lat: 48.4, lng: 31.2 },
        IRN: { name: "Iran", ren: 8, co2: 720, lat: 32.4, lng: 53.7 },
        IRQ: { name: "Iraq", ren: 4, co2: 200, lat: 33.2, lng: 43.7 },
        PER: { name: "Peru", ren: 60, co2: 55, lat: -9.2, lng: -75.0 },
        CRI: { name: "Costa Rica", ren: 99, co2: 8, lat: 9.7, lng: -83.8 },
        ISL: { name: "Iceland", ren: 100, co2: 3, lat: 64.1, lng: -21.9 },
        URY: { name: "Uruguay", ren: 97, co2: 7, lat: -32.5, lng: -55.8 },
    };

    // Scale factors for projecting country renewable share by scenario
    // multiplier applied to (100 - base) to determine how much of the gap is closed by year
    const countryScaleFactors = {
        stated:    r(interp({ 2025: 0, 2030: 0.10, 2035: 0.20, 2040: 0.30, 2050: 0.45 }), 3),
        announced: r(interp({ 2025: 0, 2030: 0.18, 2035: 0.35, 2040: 0.52, 2050: 0.72 }), 3),
        netzero:   r(interp({ 2025: 0, 2030: 0.30, 2035: 0.55, 2040: 0.75, 2050: 0.95 }), 3),
    };

    // CO2 reduction multiplier per scenario (relative to 2025 base)
    const co2ScaleFactors = {
        stated:    r(interp({ 2025: 1.0, 2030: 0.96, 2035: 0.92, 2040: 0.87, 2050: 0.76 }), 3),
        announced: r(interp({ 2025: 1.0, 2030: 0.87, 2035: 0.71, 2040: 0.54, 2050: 0.33 }), 3),
        netzero:   r(interp({ 2025: 1.0, 2030: 0.68, 2035: 0.41, 2040: 0.19, 2050: 0.0 }), 3),
    };

    // Temperature anomaly data (per-country regional variation, simplified)
    const tempBase = {
        stated:    r(interp({ 2025: 1.45, 2030: 1.55, 2035: 1.65, 2040: 1.78, 2050: 2.1 }), 2),
        announced: r(interp({ 2025: 1.45, 2030: 1.52, 2035: 1.58, 2040: 1.64, 2050: 1.7 }), 2),
        netzero:   r(interp({ 2025: 1.45, 2030: 1.50, 2035: 1.52, 2040: 1.50, 2050: 1.45 }), 2),
    };

    // Air quality index improvement factors (PM2.5 relative to 2025)
    const airQualityFactors = {
        stated:    r(interp({ 2025: 1.0, 2030: 0.95, 2035: 0.90, 2040: 0.85, 2050: 0.78 }), 3),
        announced: r(interp({ 2025: 1.0, 2030: 0.88, 2035: 0.76, 2040: 0.65, 2050: 0.50 }), 3),
        netzero:   r(interp({ 2025: 1.0, 2030: 0.78, 2035: 0.58, 2040: 0.40, 2050: 0.25 }), 3),
    };

    // PM2.5 base levels by country (µg/m³, WHO 2024 data, approximate national averages)
    const pm25Base = {
        USA: 8, CHN: 35, IND: 55, DEU: 10, GBR: 9, FRA: 10, BRA: 13, JPN: 11,
        CAN: 6, AUS: 7, KOR: 23, RUS: 15, ZAF: 22, SAU: 78, IDN: 18, MEX: 20,
        TUR: 28, NOR: 6, SWE: 6, DNK: 10, NLD: 11, ESP: 9, ITA: 15, POL: 21,
        EGY: 73, NGA: 48, KEN: 15, CHL: 20, ARG: 12, COL: 16, ARE: 40, THA: 24,
        VNM: 30, PHL: 18, MYS: 15, PAK: 57, BGD: 77, ETH: 30, MAR: 28, ISR: 20,
        NZL: 5, PRT: 8, GRC: 15, AUT: 12, CHE: 10, FIN: 5, UKR: 17, IRN: 32,
        IRQ: 55, PER: 22, CRI: 12, ISL: 4, URY: 8,
    };

    /**
     * Get country data for a given year and scenario
     */
    function getCountryData(year, scenario) {
        const sf = countryScaleFactors[scenario][year];
        const co2sf = co2ScaleFactors[scenario][year];
        const airSf = airQualityFactors[scenario][year];
        const result = {};
        for (const [code, base] of Object.entries(countryBase2025)) {
            const gap = 100 - base.ren;
            const ren = Math.min(100, Math.round(base.ren + gap * sf));
            const co2 = Math.round(base.co2 * co2sf);
            const pm25 = +(pm25Base[code] * airSf).toFixed(1);
            result[code] = {
                name: base.name,
                renewableShare: ren,
                co2_mt: co2,
                pm25: pm25,
                lat: base.lat,
                lng: base.lng,
            };
        }
        return result;
    }

    /**
     * Get global KPIs for a given year and scenario
     */
    function getGlobalKPIs(year, scenario) {
        const s = scenarios[scenario];
        return {
            renewableShare: s.renewableShare[year],
            co2: s.co2[year],
            temperature: s.temperature[year],
            evShare: s.evShare[year],
            cleanInvestment: s.cleanInvestment[year],
            coalCapacity: s.coalCapacity[year],
        };
    }

    /**
     * Get energy mix data for charts
     */
    function getEnergyMix(scenario) {
        return scenarios[scenario].energyMix;
    }

    /**
     * Get CO2 pathway for charts
     */
    function getCO2Pathway(scenario) {
        return scenarios[scenario].co2;
    }

    /**
     * Get investment pathway for charts
     */
    function getInvestmentPathway(scenario) {
        return scenarios[scenario].cleanInvestment;
    }

    /**
     * Get temperature data
     */
    function getTemperatureData(scenario) {
        return tempBase[scenario];
    }

    return {
        getCountryData,
        getGlobalKPIs,
        getEnergyMix,
        getCO2Pathway,
        getInvestmentPathway,
        getTemperatureData,
        scenarios,
        countryBase2025,
        pm25Base,
    };
})();
