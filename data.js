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
        // Country code: { name, renewableShare2025 (% of electricity), co2_mt (Mt CO2/yr), lat, lng }
        // Sources: IRENA Renewable Capacity Statistics 2024, Global Carbon Project 2024,
        //          IEA CO2 Emissions 2024, Ember Global Electricity Review 2024

        // === NORTH AMERICA ===
        USA: { name: "United States", ren: 23, co2: 4900, lat: 39.8, lng: -98.6 },
        CAN: { name: "Canada", ren: 68, co2: 550, lat: 56.1, lng: -106.3 },
        MEX: { name: "Mexico", ren: 28, co2: 430, lat: 23.6, lng: -102.6 },

        // === CENTRAL AMERICA & CARIBBEAN ===
        GTM: { name: "Guatemala", ren: 70, co2: 18, lat: 15.8, lng: -90.2 },
        HND: { name: "Honduras", ren: 62, co2: 10, lat: 15.2, lng: -86.2 },
        SLV: { name: "El Salvador", ren: 73, co2: 7, lat: 13.8, lng: -88.9 },
        NIC: { name: "Nicaragua", ren: 68, co2: 5, lat: 12.9, lng: -85.2 },
        CRI: { name: "Costa Rica", ren: 99, co2: 8, lat: 9.7, lng: -83.8 },
        PAN: { name: "Panama", ren: 72, co2: 12, lat: 8.5, lng: -80.8 },
        CUB: { name: "Cuba", ren: 5, co2: 28, lat: 21.5, lng: -77.8 },
        DOM: { name: "Dominican Republic", ren: 16, co2: 24, lat: 18.7, lng: -70.2 },
        HTI: { name: "Haiti", ren: 28, co2: 3, lat: 19.0, lng: -72.4 },
        JAM: { name: "Jamaica", ren: 12, co2: 8, lat: 18.1, lng: -77.3 },
        TTO: { name: "Trinidad and Tobago", ren: 2, co2: 34, lat: 10.7, lng: -61.2 },
        BLZ: { name: "Belize", ren: 55, co2: 1, lat: 17.2, lng: -88.5 },

        // === SOUTH AMERICA ===
        BRA: { name: "Brazil", ren: 85, co2: 480, lat: -14.2, lng: -51.9 },
        ARG: { name: "Argentina", ren: 30, co2: 170, lat: -38.4, lng: -63.6 },
        COL: { name: "Colombia", ren: 75, co2: 85, lat: 4.6, lng: -74.3 },
        CHL: { name: "Chile", ren: 55, co2: 85, lat: -35.7, lng: -71.5 },
        PER: { name: "Peru", ren: 60, co2: 55, lat: -9.2, lng: -75.0 },
        VEN: { name: "Venezuela", ren: 68, co2: 110, lat: 6.4, lng: -66.6 },
        ECU: { name: "Ecuador", ren: 75, co2: 38, lat: -1.8, lng: -78.2 },
        BOL: { name: "Bolivia", ren: 32, co2: 22, lat: -16.3, lng: -63.6 },
        PRY: { name: "Paraguay", ren: 100, co2: 5, lat: -23.4, lng: -58.4 },
        URY: { name: "Uruguay", ren: 97, co2: 7, lat: -32.5, lng: -55.8 },
        GUY: { name: "Guyana", ren: 8, co2: 3, lat: 4.9, lng: -58.9 },
        SUR: { name: "Suriname", ren: 52, co2: 2, lat: 3.9, lng: -56.0 },

        // === WESTERN EUROPE ===
        GBR: { name: "United Kingdom", ren: 48, co2: 320, lat: 55.4, lng: -3.4 },
        FRA: { name: "France", ren: 27, co2: 290, lat: 46.2, lng: 2.2 },
        DEU: { name: "Germany", ren: 52, co2: 620, lat: 51.2, lng: 10.4 },
        ITA: { name: "Italy", ren: 44, co2: 310, lat: 41.9, lng: 12.6 },
        ESP: { name: "Spain", ren: 50, co2: 210, lat: 40.5, lng: -3.7 },
        PRT: { name: "Portugal", ren: 61, co2: 38, lat: 39.4, lng: -8.2 },
        NLD: { name: "Netherlands", ren: 40, co2: 140, lat: 52.1, lng: 5.3 },
        BEL: { name: "Belgium", ren: 25, co2: 95, lat: 50.5, lng: 4.5 },
        AUT: { name: "Austria", ren: 78, co2: 55, lat: 47.5, lng: 14.6 },
        CHE: { name: "Switzerland", ren: 76, co2: 32, lat: 46.8, lng: 8.2 },
        IRL: { name: "Ireland", ren: 40, co2: 35, lat: 53.1, lng: -7.7 },
        LUX: { name: "Luxembourg", ren: 14, co2: 9, lat: 49.8, lng: 6.1 },

        // === NORTHERN EUROPE ===
        NOR: { name: "Norway", ren: 98, co2: 30, lat: 60.5, lng: 8.5 },
        SWE: { name: "Sweden", ren: 72, co2: 35, lat: 60.1, lng: 18.6 },
        DNK: { name: "Denmark", ren: 84, co2: 25, lat: 56.3, lng: 9.5 },
        FIN: { name: "Finland", ren: 52, co2: 35, lat: 61.9, lng: 25.7 },
        ISL: { name: "Iceland", ren: 100, co2: 3, lat: 64.1, lng: -21.9 },
        EST: { name: "Estonia", ren: 30, co2: 10, lat: 58.6, lng: 25.0 },
        LVA: { name: "Latvia", ren: 53, co2: 7, lat: 56.9, lng: 24.1 },
        LTU: { name: "Lithuania", ren: 30, co2: 12, lat: 55.2, lng: 23.9 },

        // === EASTERN EUROPE ===
        POL: { name: "Poland", ren: 23, co2: 300, lat: 51.9, lng: 19.1 },
        CZE: { name: "Czechia", ren: 15, co2: 95, lat: 49.8, lng: 15.5 },
        SVK: { name: "Slovakia", ren: 24, co2: 30, lat: 48.7, lng: 19.7 },
        HUN: { name: "Hungary", ren: 16, co2: 45, lat: 47.2, lng: 19.5 },
        ROU: { name: "Romania", ren: 44, co2: 65, lat: 45.9, lng: 25.0 },
        BGR: { name: "Bulgaria", ren: 22, co2: 40, lat: 42.7, lng: 25.5 },
        HRV: { name: "Croatia", ren: 55, co2: 17, lat: 45.1, lng: 15.2 },
        SRB: { name: "Serbia", ren: 30, co2: 45, lat: 44.0, lng: 21.0 },
        SVN: { name: "Slovenia", ren: 35, co2: 13, lat: 46.2, lng: 14.8 },
        BIH: { name: "Bosnia and Herzegovina", ren: 40, co2: 22, lat: 43.9, lng: 17.7 },
        MNE: { name: "Montenegro", ren: 50, co2: 3, lat: 42.7, lng: 19.4 },
        MKD: { name: "North Macedonia", ren: 25, co2: 8, lat: 41.5, lng: 21.7 },
        ALB: { name: "Albania", ren: 95, co2: 4, lat: 41.2, lng: 20.2 },
        UKR: { name: "Ukraine", ren: 14, co2: 130, lat: 48.4, lng: 31.2 },
        BLR: { name: "Belarus", ren: 5, co2: 55, lat: 53.7, lng: 27.9 },
        MDA: { name: "Moldova", ren: 15, co2: 7, lat: 47.4, lng: 28.4 },
        KOS: { name: "Kosovo", ren: 6, co2: 8, lat: 42.6, lng: 20.9 },

        // === SOUTHEASTERN EUROPE ===
        GRC: { name: "Greece", ren: 45, co2: 52, lat: 39.1, lng: 21.8 },
        CYP: { name: "Cyprus", ren: 18, co2: 7, lat: 35.1, lng: 33.4 },
        TUR: { name: "Turkey", ren: 42, co2: 420, lat: 38.9, lng: 35.2 },

        // === RUSSIA & CENTRAL ASIA ===
        RUS: { name: "Russia", ren: 21, co2: 1700, lat: 61.5, lng: 105.3 },
        KAZ: { name: "Kazakhstan", ren: 12, co2: 270, lat: 48.0, lng: 68.0 },
        UZB: { name: "Uzbekistan", ren: 10, co2: 95, lat: 41.4, lng: 64.6 },
        TKM: { name: "Turkmenistan", ren: 1, co2: 75, lat: 39.0, lng: 59.6 },
        KGZ: { name: "Kyrgyzstan", ren: 88, co2: 9, lat: 41.2, lng: 74.8 },
        TJK: { name: "Tajikistan", ren: 92, co2: 5, lat: 38.9, lng: 71.3 },
        GEO: { name: "Georgia", ren: 78, co2: 10, lat: 42.3, lng: 43.4 },
        ARM: { name: "Armenia", ren: 35, co2: 6, lat: 40.1, lng: 45.0 },
        AZE: { name: "Azerbaijan", ren: 8, co2: 38, lat: 40.1, lng: 47.6 },
        MNG: { name: "Mongolia", ren: 8, co2: 25, lat: 46.9, lng: 103.8 },

        // === EAST ASIA ===
        CHN: { name: "China", ren: 32, co2: 11500, lat: 35.9, lng: 104.2 },
        JPN: { name: "Japan", ren: 22, co2: 1050, lat: 36.2, lng: 138.3 },
        KOR: { name: "South Korea", ren: 10, co2: 590, lat: 35.9, lng: 127.8 },
        PRK: { name: "North Korea", ren: 55, co2: 50, lat: 40.3, lng: 127.5 },
        TWN: { name: "Taiwan", ren: 9, co2: 270, lat: 23.7, lng: 121.0 },

        // === SOUTHEAST ASIA ===
        IDN: { name: "Indonesia", ren: 20, co2: 620, lat: -0.8, lng: 113.9 },
        THA: { name: "Thailand", ren: 18, co2: 260, lat: 15.9, lng: 100.5 },
        VNM: { name: "Vietnam", ren: 35, co2: 310, lat: 14.1, lng: 108.3 },
        PHL: { name: "Philippines", ren: 25, co2: 160, lat: 12.9, lng: 121.8 },
        MYS: { name: "Malaysia", ren: 20, co2: 250, lat: 4.2, lng: 101.9 },
        SGP: { name: "Singapore", ren: 4, co2: 48, lat: 1.4, lng: 103.8 },
        MMR: { name: "Myanmar", ren: 55, co2: 30, lat: 19.8, lng: 96.0 },
        KHM: { name: "Cambodia", ren: 52, co2: 15, lat: 12.6, lng: 105.0 },
        LAO: { name: "Laos", ren: 80, co2: 18, lat: 18.2, lng: 103.9 },
        BRN: { name: "Brunei", ren: 1, co2: 10, lat: 4.5, lng: 114.7 },
        TLS: { name: "Timor-Leste", ren: 5, co2: 1, lat: -8.9, lng: 125.7 },

        // === SOUTH ASIA ===
        IND: { name: "India", ren: 24, co2: 2900, lat: 20.6, lng: 79.0 },
        PAK: { name: "Pakistan", ren: 30, co2: 220, lat: 30.4, lng: 69.3 },
        BGD: { name: "Bangladesh", ren: 5, co2: 100, lat: 23.7, lng: 90.4 },
        LKA: { name: "Sri Lanka", ren: 50, co2: 22, lat: 7.9, lng: 80.8 },
        NPL: { name: "Nepal", ren: 90, co2: 10, lat: 28.4, lng: 84.1 },
        BTN: { name: "Bhutan", ren: 100, co2: 1, lat: 27.5, lng: 90.4 },
        AFG: { name: "Afghanistan", ren: 45, co2: 8, lat: 33.9, lng: 67.7 },
        MDV: { name: "Maldives", ren: 5, co2: 2, lat: 3.2, lng: 73.2 },

        // === MIDDLE EAST ===
        SAU: { name: "Saudi Arabia", ren: 3, co2: 580, lat: 23.9, lng: 45.1 },
        ARE: { name: "UAE", ren: 7, co2: 200, lat: 23.4, lng: 53.8 },
        IRN: { name: "Iran", ren: 8, co2: 720, lat: 32.4, lng: 53.7 },
        IRQ: { name: "Iraq", ren: 4, co2: 200, lat: 33.2, lng: 43.7 },
        ISR: { name: "Israel", ren: 12, co2: 60, lat: 31.0, lng: 34.9 },
        KWT: { name: "Kuwait", ren: 2, co2: 100, lat: 29.3, lng: 47.5 },
        QAT: { name: "Qatar", ren: 1, co2: 100, lat: 25.4, lng: 51.2 },
        OMN: { name: "Oman", ren: 3, co2: 70, lat: 21.5, lng: 55.9 },
        BHR: { name: "Bahrain", ren: 1, co2: 36, lat: 26.0, lng: 50.5 },
        JOR: { name: "Jordan", ren: 20, co2: 24, lat: 30.6, lng: 36.2 },
        LBN: { name: "Lebanon", ren: 8, co2: 22, lat: 33.9, lng: 35.9 },
        SYR: { name: "Syria", ren: 10, co2: 25, lat: 35.0, lng: 38.5 },
        YEM: { name: "Yemen", ren: 3, co2: 8, lat: 15.6, lng: 48.5 },
        PSE: { name: "Palestine", ren: 8, co2: 3, lat: 31.9, lng: 35.2 },

        // === NORTH AFRICA ===
        EGY: { name: "Egypt", ren: 12, co2: 250, lat: 26.8, lng: 30.8 },
        MAR: { name: "Morocco", ren: 38, co2: 65, lat: 31.8, lng: -7.1 },
        DZA: { name: "Algeria", ren: 3, co2: 170, lat: 28.0, lng: 1.7 },
        TUN: { name: "Tunisia", ren: 8, co2: 28, lat: 33.9, lng: 9.5 },
        LBY: { name: "Libya", ren: 2, co2: 45, lat: 26.3, lng: 17.2 },
        SDN: { name: "Sudan", ren: 55, co2: 20, lat: 12.9, lng: 30.2 },
        SSD: { name: "South Sudan", ren: 60, co2: 2, lat: 7.9, lng: 29.9 },

        // === WEST AFRICA ===
        NGA: { name: "Nigeria", ren: 18, co2: 130, lat: 9.1, lng: 8.7 },
        GHA: { name: "Ghana", ren: 42, co2: 18, lat: 7.9, lng: -1.0 },
        CIV: { name: "Ivory Coast", ren: 30, co2: 12, lat: 7.5, lng: -5.5 },
        SEN: { name: "Senegal", ren: 22, co2: 10, lat: 14.5, lng: -14.5 },
        MLI: { name: "Mali", ren: 40, co2: 4, lat: 17.6, lng: -4.0 },
        BFA: { name: "Burkina Faso", ren: 15, co2: 4, lat: 12.3, lng: -1.6 },
        NER: { name: "Niger", ren: 12, co2: 3, lat: 17.6, lng: 8.1 },
        GIN: { name: "Guinea", ren: 60, co2: 3, lat: 9.9, lng: -11.4 },
        BEN: { name: "Benin", ren: 10, co2: 7, lat: 9.3, lng: 2.3 },
        TGO: { name: "Togo", ren: 22, co2: 3, lat: 8.6, lng: 1.2 },
        SLE: { name: "Sierra Leone", ren: 50, co2: 1, lat: 8.5, lng: -11.8 },
        LBR: { name: "Liberia", ren: 35, co2: 1, lat: 6.4, lng: -9.4 },
        MRT: { name: "Mauritania", ren: 35, co2: 3, lat: 21.0, lng: -10.9 },
        GMB: { name: "Gambia", ren: 4, co2: 1, lat: 13.4, lng: -16.6 },
        GNB: { name: "Guinea-Bissau", ren: 18, co2: 0.5, lat: 12.0, lng: -15.2 },
        CPV: { name: "Cabo Verde", ren: 20, co2: 1, lat: 16.0, lng: -24.0 },

        // === CENTRAL AFRICA ===
        COD: { name: "DR Congo", ren: 95, co2: 4, lat: -4.0, lng: 21.8 },
        COG: { name: "Republic of Congo", ren: 58, co2: 5, lat: -0.2, lng: 15.8 },
        CMR: { name: "Cameroon", ren: 72, co2: 8, lat: 7.4, lng: 12.4 },
        GAB: { name: "Gabon", ren: 45, co2: 5, lat: -0.8, lng: 11.6 },
        GNQ: { name: "Equatorial Guinea", ren: 6, co2: 5, lat: 1.6, lng: 10.3 },
        TCD: { name: "Chad", ren: 5, co2: 2, lat: 15.5, lng: 18.7 },
        CAF: { name: "Central African Republic", ren: 72, co2: 0.5, lat: 6.6, lng: 20.9 },

        // === EAST AFRICA ===
        KEN: { name: "Kenya", ren: 90, co2: 20, lat: -0.0, lng: 37.9 },
        ETH: { name: "Ethiopia", ren: 96, co2: 18, lat: 9.1, lng: 40.5 },
        TZA: { name: "Tanzania", ren: 50, co2: 13, lat: -6.4, lng: 34.9 },
        UGA: { name: "Uganda", ren: 85, co2: 5, lat: 1.4, lng: 32.3 },
        RWA: { name: "Rwanda", ren: 48, co2: 1, lat: -1.9, lng: 29.9 },
        BDI: { name: "Burundi", ren: 70, co2: 0.5, lat: -3.4, lng: 29.9 },
        SOM: { name: "Somalia", ren: 12, co2: 1, lat: 5.2, lng: 46.2 },
        ERI: { name: "Eritrea", ren: 10, co2: 1, lat: 15.2, lng: 39.8 },
        DJI: { name: "Djibouti", ren: 15, co2: 1, lat: 11.8, lng: 42.6 },

        // === SOUTHERN AFRICA ===
        ZAF: { name: "South Africa", ren: 15, co2: 430, lat: -30.6, lng: 22.9 },
        AGO: { name: "Angola", ren: 60, co2: 25, lat: -11.2, lng: 17.9 },
        MOZ: { name: "Mozambique", ren: 78, co2: 5, lat: -18.7, lng: 35.5 },
        ZMB: { name: "Zambia", ren: 85, co2: 5, lat: -13.1, lng: 27.8 },
        ZWE: { name: "Zimbabwe", ren: 50, co2: 12, lat: -19.0, lng: 29.2 },
        BWA: { name: "Botswana", ren: 4, co2: 6, lat: -22.3, lng: 24.7 },
        NAM: { name: "Namibia", ren: 55, co2: 4, lat: -22.6, lng: 18.5 },
        MWI: { name: "Malawi", ren: 82, co2: 2, lat: -13.3, lng: 34.3 },
        MDG: { name: "Madagascar", ren: 50, co2: 4, lat: -18.8, lng: 46.9 },
        MUS: { name: "Mauritius", ren: 22, co2: 4, lat: -20.3, lng: 57.6 },
        SWZ: { name: "Eswatini", ren: 60, co2: 1, lat: -26.5, lng: 31.5 },
        LSO: { name: "Lesotho", ren: 70, co2: 1, lat: -29.6, lng: 28.2 },

        // === OCEANIA ===
        AUS: { name: "Australia", ren: 35, co2: 380, lat: -25.3, lng: 133.8 },
        NZL: { name: "New Zealand", ren: 82, co2: 30, lat: -40.9, lng: 174.9 },
        PNG: { name: "Papua New Guinea", ren: 35, co2: 7, lat: -6.3, lng: 143.9 },
        FJI: { name: "Fiji", ren: 55, co2: 2, lat: -17.7, lng: 178.1 },
        SLB: { name: "Solomon Islands", ren: 12, co2: 0.5, lat: -9.4, lng: 160.0 },
        VUT: { name: "Vanuatu", ren: 30, co2: 0.3, lat: -15.4, lng: 166.9 },
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
        // North America
        USA: 8, CAN: 6, MEX: 20,
        // Central America & Caribbean
        GTM: 22, HND: 18, SLV: 25, NIC: 14, CRI: 12, PAN: 10, CUB: 15, DOM: 14,
        HTI: 18, JAM: 12, TTO: 18, BLZ: 16,
        // South America
        BRA: 13, ARG: 12, COL: 16, CHL: 20, PER: 22, VEN: 15, ECU: 14, BOL: 25,
        PRY: 14, URY: 8, GUY: 18, SUR: 14,
        // Western Europe
        GBR: 9, FRA: 10, DEU: 10, ITA: 15, ESP: 9, PRT: 8, NLD: 11, BEL: 12,
        AUT: 12, CHE: 10, IRL: 7, LUX: 10,
        // Northern Europe
        NOR: 6, SWE: 6, DNK: 10, FIN: 5, ISL: 4, EST: 7, LVA: 12, LTU: 13,
        // Eastern Europe
        POL: 21, CZE: 16, SVK: 18, HUN: 16, ROU: 15, BGR: 20, HRV: 17, SRB: 25,
        SVN: 15, BIH: 30, MNE: 22, MKD: 30, ALB: 15, UKR: 17, BLR: 16, MDA: 18, KOS: 28,
        // Southeastern Europe
        GRC: 15, CYP: 16, TUR: 28,
        // Russia & Central Asia
        RUS: 15, KAZ: 18, UZB: 25, TKM: 30, KGZ: 18, TJK: 35, GEO: 18, ARM: 22, AZE: 20, MNG: 32,
        // East Asia
        CHN: 35, JPN: 11, KOR: 23, PRK: 28, TWN: 16,
        // Southeast Asia
        IDN: 18, THA: 24, VNM: 30, PHL: 18, MYS: 15, SGP: 16, MMR: 30, KHM: 22,
        LAO: 25, BRN: 6, TLS: 15,
        // South Asia
        IND: 55, PAK: 57, BGD: 77, LKA: 18, NPL: 42, BTN: 20, AFG: 45, MDV: 12,
        // Middle East
        SAU: 78, ARE: 40, IRN: 32, IRQ: 55, ISR: 20, KWT: 60, QAT: 55, OMN: 42,
        BHR: 52, JOR: 28, LBN: 22, SYR: 30, YEM: 35, PSE: 24,
        // North Africa
        EGY: 73, MAR: 28, DZA: 30, TUN: 28, LBY: 40, SDN: 48, SSD: 35,
        // West Africa
        NGA: 48, GHA: 28, CIV: 25, SEN: 30, MLI: 38, BFA: 32, NER: 55, GIN: 18,
        BEN: 30, TGO: 25, SLE: 20, LBR: 15, MRT: 60, GMB: 28, GNB: 20, CPV: 18,
        // Central Africa
        COD: 28, COG: 30, CMR: 38, GAB: 30, GNQ: 22, TCD: 55, CAF: 25,
        // East Africa
        KEN: 15, ETH: 30, TZA: 18, UGA: 40, RWA: 38, BDI: 30, SOM: 22, ERI: 25, DJI: 35,
        // Southern Africa
        ZAF: 22, AGO: 28, MOZ: 15, ZMB: 22, ZWE: 18, BWA: 15, NAM: 10, MWI: 20,
        MDG: 18, MUS: 12, SWZ: 15, LSO: 20,
        // Oceania
        AUS: 7, NZL: 5, PNG: 10, FJI: 8, SLB: 8, VUT: 8,
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
