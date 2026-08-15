/* ============================================================
   JIRSTAN LOGISTICS — STATICKÁ DATA & KONFIGURACE (data.js)
   ============================================================ */

// 1. LOKACE A TYPY (UPRAVENO PRO GLOBAL V4.0)
const CITIES = {
    // EVROPA
    "Praha": {x: .75, y: .55, isAirport: true, isPort: false, lat: 50.0755, lng: 14.4378}, 
    "Zájezd": {x: .74, y: .54, isAirport: false, isPort: false, lat: 50.155, lng: 14.162},
    "Brno": {x: .85, y: .65, isAirport: false, isPort: false, lat: 49.1951, lng: 16.6068}, 
    "Plzeň": {x: .68, y: .58, isAirport: false, isPort: false, lat: 49.7384, lng: 13.3736}, 
    "Ostrava": {x: .90, y: .55, isAirport: false, isPort: false, lat: 49.8209, lng: 18.2625}, 
    "Mnichov": {x: .60, y: .70, isAirport: true, isPort: false, lat: 48.1351, lng: 11.5820}, 
    "Vídeň": {x: .80, y: .75, isAirport: true, isPort: false, lat: 48.2082, lng: 16.3738}, 
    "Berlín": {x: .65, y: .35, isAirport: true, isPort: false, lat: 52.5200, lng: 13.4050}, 
    "Varšava": {x: .88, y: .35, isAirport: true, isPort: false, lat: 52.2297, lng: 21.0122}, 
    "Hamburk": {x: .62, y: .25, isAirport: false, isPort: true, lat: 53.5511, lng: 9.9937}, 
    "Drážďany": {x: .70, y: .45, isAirport: false, isPort: false, lat: 51.0504, lng: 13.7373}, 
    "Bratislava": {x: .82, y: .70, isAirport: false, isPort: false, lat: 48.1486, lng: 17.1077}, 
    "Budapešť": {x: .88, y: .80, isAirport: false, isPort: false, lat: 47.4979, lng: 19.0402},
    "Paříž": {x: .55, y: .50, isAirport: true, isPort: false, lat: 48.8566, lng: 2.3522}, 
    "Řím": {x: .70, y: .90, isAirport: true, isPort: true, lat: 41.9028, lng: 12.4964}, 
    "Londýn": {x: .52, y: .35, isAirport: true, isPort: true, lat: 51.5074, lng: -0.1278},
    // SEVERNÍ AMERIKA (NOVÉ)
    "New York": {x: .25, y: .40, isAirport: true, isPort: true, lat: 40.7128, lng: -74.0060},
    "Los Angeles": {x: .08, y: .55, isAirport: true, isPort: true, lat: 34.0522, lng: -118.2437},
    "Miami": {x: .22, y: .75, isAirport: true, isPort: true, lat: 25.7617, lng: -80.1918},
    "Toronto": {x: .20, y: .30, isAirport: true, isPort: false, lat: 43.6532, lng: -79.3832},
    "Chicago": {x: .18, y: .42, isAirport: true, isPort: false, lat: 41.8781, lng: -87.6298}
};

const LICENSES = [
    {id: 'express', n: 'EXPRES', color: '#ff9d00', minLvl: 1, cost: 15000}, 
    {id: 'stehovani', n: 'STĚHOVÁNÍ', color: '#8d6e63', minLvl: 3, cost: 20000},
    {id: 'sypky', n: 'SYPKÉ', color: '#ffca28', minLvl: 5, cost: 30000}, 
    {id: 'wood', n: 'DŘEVO', color: '#795548', minLvl: 6, cost: 35000},
    {id: 'frigo', n: 'FRIGO', color: '#00e5ff', minLvl: 8, cost: 40000},
    {id: 'leky', n: 'LÉKY', color: '#ff4081', minLvl: 10, cost: 50000}, 
    {id: 'cars', n: 'AUTA', color: '#ab47bc', minLvl: 12, cost: 60000},
    {id: 'adr', n: 'ADR', color: '#ff1744', minLvl: 15, cost: 80000},
    {id: 'heavy', n: 'NADROZMĚR', color: '#f57c00', minLvl: 15, cost: 80000}, 
    {id: 'ceniny', n: 'CENINY', color: '#ffd700', minLvl: 20, cost: 120000}
];

const CARGO_TYPES = {
    'express': ['Důležité dokumenty', 'Náhradní díly do letadla', 'Krevní plazma'], 
    'stehovani': ['Vybavení kanceláří', 'Starožitný nábytek', 'Klavír'],
    'sypky': ['Stavební písek', 'Drcený štěrk', 'Zemina z výkopu'], 
    'wood': ['Smrkové klády', 'Dřevní štěpka', 'Nařezané desky'],
    'frigo': ['Mražené ryby', 'Zmrzlina', 'Exotické ovoce'],
    'leky': ['Vakcíny v chladu', 'Antibiotika', 'Chirurgické nástroje'], 
    'cars': ['Nová auta Škoda', 'Luxusní vozy Porsche', 'Ojetiny z Německa'],
    'adr': ['Sudy s chemikáliemi', 'Kyselina sírová', 'Propan-butan'],
    'heavy': ['Ocelové nosníky', 'Turbína do elektrárny', 'Bagr Caterpillar'], 
    'ceniny': ['Zlaté cihly', 'Hotovost pro bankomaty', 'Diamanty'],
    'none': ['Palety papíru', 'Minerální voda', 'Elektronika', 'Díly pro Škoda Auto', 'Hračky'],
    // Nové pro lodě a letadla (V4.0)
    'sea': ['Tisíce kontejnerů s elektronikou z Asie', 'Nákladní automobily pro export', 'Ropa v barelech', 'Tuny exotických surovin'],
    'air': ['High-tech servery', 'Záchranné zdravotní vybavení', 'Zásilky z E-shopů', 'Součástky pro raketoplány']
};

const BLACK_MARKET_CARGO = [
    'Nelegální zbraně 📦', 'Neregistrované farmaceutika 💊', 'Kradená luxusní auta 🏎️', 
    'Pašované diamanty 💎', 'Padělané bankovky 💶', 'Exotická zvířata 🦎'
];

const FACTIONS_DB = {
    nexus: { id: 'nexus', n: 'NEXUS TECH', icon: '💻', img: 'faction_nexus.jpg', color: '#00f5d4', desc: 'Gigant v elektronice. Zvyšuje efektivitu tvé flotily.',
        perks: [
            { req: 250, desc: 'Tier 1: Rychlost všech aut +5%' },
            { req: 500, desc: 'Tier 2: Spotřeba paliva -10%' },
            { req: 1000, desc: 'Tier 3 (MAX): Rychlost +15%, Spotřeba -20%' }
        ]
    },
    stavba: { id: 'stavba', n: 'GLOBAL STAVBA', icon: '🏗️', img: 'faction_stavba.jpg', color: '#f57c00', desc: 'Mezinárodní stavební holding. Zaměření na nadrozměr a těžké váhy.',
        perks: [
            { req: 250, desc: 'Tier 1: Odměny za ADR a Sypké +10%' },
            { req: 500, desc: 'Tier 2: Opotřebení vozidel klesá o 20% pomaleji' },
            { req: 1000, desc: 'Tier 3 (MAX): Odměny za Nadrozměr a Auta +30%' }
        ]
    },
    fresh: { id: 'fresh', n: 'FRESH FOODS', icon: '🍎', img: 'faction_fresh.jpg', color: '#00f260', desc: 'Zásobuje řetězce po celé Evropě. Klade důraz na odpočinek a rychlost.',
        perks: [
            { req: 250, desc: 'Tier 1: Únava řidičů klesá o 10% pomaleji' },
            { req: 500, desc: 'Tier 2: Odměny za Frigo a Expres +20%' },
            { req: 1000, desc: 'Tier 3 (MAX): Řidiči nepotřebují spát tak dlouho (-2h spánku)' }
        ]
    }
};

const NAMES_F = ["Martin", "Jakub", "David", "Lukáš", "Jan", "Tomáš", "Michal", "Pavel", "Ondřej", "Marek", "Zdeněk", "Josef"];
const NAMES_L = ["Zeman", "Krejčí", "Svoboda", "Novák", "Dvořák", "Černý", "Procházka", "Kučera", "Veselý", "Horák", "Němec"];
const BIOS = ["Nadšenec do veteránů.", "Jezdí zásadně v noci.", "Miluje kávu z benzínky.", "Bývalý závodník rallye.", "Kliďas a flegmatik.", "Neustále nadává na dispečink.", "Mistr ve couvání.", "Bývalý voják, teď řídí."];
const TRAITS = [ {id: 'normal', n: 'Běžný', speed: 1.0, cons: 1.0, fatigue: 1.0}, {id: 'racer', n: 'Závodník', speed: 1.15, cons: 1.2, fatigue: 1.1}, {id: 'eco', n: 'Ekolog', speed: 0.85, cons: 0.8, fatigue: 0.9}, {id: 'iron', n: 'Držák', speed: 1.0, cons: 1.0, fatigue: 0.8} ];

// 2. KOMPLETNÍ DATABÁZE VYLEPŠENÍ, VÝZKUMŮ A BUDOV
const UPGRADES_DB = [
    {id: 'chip', n: 'CHIP ST.1', cost: 50000, desc: 'Rychlost vozidla +25%'}, 
    {id: 'chip2', n: 'CHIP ST.2', cost: 120000, desc: 'Rychlost vozidla +40% (Vyžaduje ST.1)'},
    {id: 'ecotires', n: 'ÉKO PNEU', cost: 40000, desc: 'Spotřeba paliva -10%'}, 
    {id: 'aero', n: 'AEROKYT', cost: 60000, desc: 'Spotřeba paliva -15%'},
    {id: 'seats', n: 'MASÁŽNÍ SED.', cost: 30000, desc: 'Únava řidiče -10%'}, 
    {id: 'bed', n: 'MATRACE', cost: 25000, desc: 'Únava řidiče -10%'},
    {id: 'ac', n: 'KLIMATIZACE', cost: 40000, desc: 'Únava řidiče -15%'}, 
    {id: 'coffee', n: 'KÁVOVAR', cost: 15000, desc: 'Únava řidiče -5%'},
    {id: 'fridge', n: 'LEDNICE', cost: 18000, desc: 'Únava řidiče -3%'},
    {id: 'gps', n: 'SMART GPS', cost: 45000, desc: 'Rychlost vozidla +10%'},
    {id: 'frame', n: 'ZESÍLENÝ RÁM', cost: 150000, desc: 'Opotřebení klesá o 50% pomaleji'},
    {id: 'bigtank', n: 'MEGA NÁDRŽ', cost: 85000, desc: 'Dvojnásobný dojezd (Spotřeba -50%)'}
];

const TECH_DB = [
    {id: 'bulk_buy', n: 'Hromadný nákup paliva', cost: 100000, desc: 'Nafta bude trvale o 10% levnější', req: null, time: 120, minRep: 0},
    {id: 'recruit', n: 'HR Oddělení', cost: 150000, desc: 'Nábor nových řidičů bude o 50% levnější', req: null, time: 180, minRep: 100},
    {id: 'logistics', n: 'Pokročilá logistika', cost: 250000, desc: 'Rychlost všech aut se zvýší o 5%', req: 'bulk_buy', time: 300, minRep: 110},
    {id: 'branding', n: 'Firemní branding', cost: 500000, desc: 'Odběratelé budou platit o 5% více', req: 'logistics', time: 480, minRep: 120},
    {id: 'eco_trucks', n: 'Eko Dotace', cost: 600000, desc: 'Nižší spotřeba paliva o 15%', req: 'branding', time: 400, minRep: 130},
    {id: 'sim', n: 'Simulátor jízdy', cost: 300000, desc: 'Řidiči budou získávat zkušenosti 2x rychleji', req: 'recruit', time: 360, minRep: 115},
    {id: 'global_lic', n: 'Globální licence', cost: 1000000, desc: 'Výdělky ze všech zakázek se zvednou o 10%', req: 'branding', time: 720, minRep: 150},
    {id: 'gps_fleet', n: 'Satelitní flotila', cost: 800000, desc: 'Plošné zrychlení všech aut o 15%', req: 'logistics', time: 600, minRep: 140},
    {id: 'ai_disp', n: 'AI Dispečink', cost: 2000000, desc: 'Příjmy narostou plošně o 20%', req: 'sim', time: 1000, minRep: 200},
    {id: 'nightshift', n: 'Noční provoz', cost: 400000, desc: 'Noční zakázky (20:00-06:00) platí o +40% víc.', req: 'logistics', time: 300, minRep: 120},
    {id: 'corp_network', n: 'Korporátní sítě', cost: 750000, desc: 'Odemyká přístup k Frakcím a VIP korporátním klientům.', req: 'branding', time: 400, minRep: 130},
    {id: 'darkweb', n: 'Přístup na Dark Web', cost: 1500000, desc: 'Odemyká přístup k Černému trhu. Brutální odměny, ale riskantní.', req: 'logistics', time: 600, minRep: 80},
    {id: 'mega_trailers', n: 'Vývoj Mega-Návěsů', cost: 1000000, desc: 'Zvýší výdělky všech návěsů o 20%.', req: 'logistics', time: 500, minRep: 120},
    {id: 'aero_design', n: 'Aero Dynamika', cost: 1500000, desc: 'Opotřebení všech vozidel na cestách klesá o 30% pomaleji.', req: 'eco_trucks', time: 600, minRep: 140},
    {id: 'drone_delivery', n: 'Dronové trasování', cost: 3000000, desc: 'Díky dronům se auta vyhnou zácpám. Rychlost +10%.', req: 'ai_disp', time: 800, minRep: 180},
    {id: 'quantum_gps', n: 'Satelity Jirstan', cost: 4000000, desc: 'Vlastní síť satelitů. +20% Rychlost pro Zámořskou divizi (Lodě a Letadla).', req: 'gps_fleet', time: 1000, minRep: 200}
];

const HQ_DB = [
    {id: 'garage', n: '🏗️ Garáž', desc: 'Každý level zvyšuje maximální počet aut.', maxLvl: 15, baseCost: 150000, icon: '🚛', bonus: 'Kapacita aut +2/lvl'},
    {id: 'office', n: '🏢 Kancelář', desc: 'Od Lvl 3 ti kancelář začne pasivně generovat reputaci.', maxLvl: 5, baseCost: 150000, icon: '📋', bonus: 'Reputace +/den od L3'},
    {id: 'workshop', n: '🔧 Dílna', desc: 'S každým levelem jsou opravy levnější o 10%.', maxLvl: 5, baseCost: 100000, icon: '⚙️', bonus: 'Opravy -10%/lvl'},
    {id: 'logistics_center', n: '📦 Logistické centrum', desc: 'Zajišťuje ti příplatek ke každé odjeté zakázce.', maxLvl: 5, baseCost: 300000, icon: '📦', bonus: 'Výdělky +3%/lvl'},
    {id: 'fuel_depot', n: '⛽ Nádrž', desc: 'Zvyšuje maximální kapacitu tvé firemní nádrže na naftu.', maxLvl: 5, baseCost: 120000, icon: '⛽', bonus: 'Kapacita +20k l/lvl'},
    {id: 'relax_zone', n: '🌴 Relax Zóna', desc: 'Zpomaluje únavu řidičů na cestách o 5% za level.', maxLvl: 5, baseCost: 200000, icon: '☕', bonus: 'Únava -5%/lvl'},
    // Nové HQ budovy V4.0
    {id: 'port_hub', n: '⚓ Přístavní překladiště', desc: 'Odemyká možnost vlastnit nákladní lodě a přijímat lodní kontejnery. Každý lvl = +1 loď.', maxLvl: 5, baseCost: 2000000, icon: '🚢', bonus: 'Kapacita lodí +1/lvl'},
    {id: 'airport_hangar', n: '✈️ Letištní hangár', desc: 'Odemyká možnost vlastnit nákladní letadla. Každý lvl = +1 letadlo.', maxLvl: 5, baseCost: 5000000, icon: '🛫', bonus: 'Kapacita letadel +1/lvl'},
    {id: 'bus_terminal', n: '🚌 Autobusový terminál', desc: 'Odemyká Osobní dopravu a nákup autobusů. Každý lvl = +2 autobusy.', maxLvl: 5, baseCost: 20000000, icon: '🚌', bonus: 'Kapacita autobusů +2/lvl'}
];

const COMPETITORS_DB = [
    {id: 'fastex', n: 'FASTEX TRANSPORT', color: '#ff2a55', skill: 'speed', desc: 'Bleskové dodávky. Vždy spěchají a nedbají na bezpečnost.', power: 1.2, baseVal: 5000000},
    {id: 'greenroad', n: 'GREENROAD ECO', color: '#00f260', skill: 'eco', desc: 'Ekologická přeprava. Mají pomalejší, ale úsporná auta.', power: 0.9, baseVal: 3000000},
    {id: 'atlas', n: 'ATLAS CARGO', color: '#00d4ff', skill: 'volume', desc: 'Velkokapacitní nadnárodní přeprava. Tvrdý oříšek.', power: 1.1, baseVal: 8000000},
    {id: 'premium', n: 'PREMIUM LINKS', color: '#ffc300', skill: 'luxury', desc: 'Prémiové zakázky, ceniny a těžké náklady.', power: 1.3, baseVal: 15000000},
    {id: 'jirstan', n: 'JIRSTAN CORP', color: '#b5179e', skill: 'monopoly', desc: 'Obří monopolní mega-korporace ovládající trh.', power: 5.0, baseVal: 500000000}
];

const CHALLENGE_DB = [
    {id: 'c1', n: '⚡ Rychlostní výzva', desc: 'Dokončit 5 zakázek celkem', reward: 80000, repReward: 5, target: 5, type: 'deliveries'},
    {id: 'c2', n: '💰 Zlatá trasa', desc: 'Vydělat 1 000 000 Kč celkově', reward: 150000, repReward: 10, target: 1000000, type: 'earned'},
    {id: 'c3', n: '🌍 Cestovatel týdne', desc: 'Ujet 5 000 km celkem', reward: 200000, repReward: 15, target: 5000, type: 'distance'},
    {id: 'c4', n: '🤝 Mistr smluv', desc: 'Dokonči 3 firemní smlouvy', reward: 500000, repReward: 20, target: 3, type: 'contracts'},
    {id: 'c5', n: '👑 Logistický Magnát', desc: 'Vydělat 50 000 000 Kč celkově', reward: 5000000, repReward: 50, target: 50000000, type: 'earned'}
];

const DEFAULT_SILHOUETTE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='200' viewBox='0 0 160 200' style='background:%23020c03;'><rect x='40' y='40' width='80' height='80' fill='%2300ff66' opacity='0.3'/><rect x='20' y='120' width='120' height='80' fill='%2300ff66' opacity='0.3'/><rect x='55' y='65' width='15' height='15' fill='%2300ff66'/><rect x='90' y='65' width='15' height='15' fill='%2300ff66'/><rect x='70' y='95' width='20' height='10' fill='%2300ff66'/></svg>";
const DEFAULT_CEO_SILHOUETTE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='200' viewBox='0 0 160 200' style='background:%23060a16;'><rect x='30' y='50' width='100' height='100' fill='%23e0a899'/><rect x='20' y='140' width='120' height='60' fill='%231c2438'/><rect x='50' y='140' width='60' height='20' fill='%23ffffff'/><rect x='70' y='140' width='20' height='60' fill='%23ff0055'/><rect x='45' y='80' width='20' height='15' fill='%23333333'/><rect x='95' y='80' width='20' height='15' fill='%23333333'/><rect x='40' y='30' width='80' height='30' fill='%23e59b12'/></svg>";
const DEFAULT_CTO_SILHOUETTE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='200' viewBox='0 0 160 200' style='background:%23060a16;'><rect x='30' y='50' width='100' height='100' fill='%23d09585'/><rect x='20' y='140' width='120' height='60' fill='%232b6cb0'/><rect x='45' y='80' width='18' height='12' fill='%2300ff66' opacity='0.8'/><rect x='97' y='80' width='18' height='12' fill='%2300ff66' opacity='0.8'/><rect x='30' y='25' width='100' height='35' fill='%23222222'/></svg>";

const STAFF_DEFS = {
    dispatcher: { id: 'dispatcher', n: 'DISPEČER', cost: 20000, img: 'staff_dispatcher.jpg', desc: 'Může vkládat zakázky autům přímo do fronty.', xpPerLevel: 200, skills: [{id: 'negotiator', n: 'Vyjednávač (+10% platba)', cost: 80000}, {id: 'routing', n: 'Efektivní trasy (+10% Rychlost)', cost: 80000}] },
    mechanic: { id: 'mechanic', n: 'HLAVNÍ MECHANIK', cost: 75000, img: 'staff_mechanic.jpg', desc: 'Zajišťuje zlevnění a prevenci oprav.', xpPerLevel: 200, skills: [{id: 'preventive', n: 'Prevence (-25% rozbití)', cost: 80000}, {id: 'quickfix', n: 'Rychloservis', cost: 100000}] },
    accountant: { id: 'accountant', n: 'KATEŘINA FUTEROVÁ', cost: 150000, img: 'katerina.jpg', desc: 'Tvá CFO. Stará se o finance a hledá skulinky v daních.', xpPerLevel: 150, skills: [{id: 'tax', n: 'Daňové ráje (-20% poplatky)', cost: 80000}, {id: 'audit', n: 'Auditní profík', cost: 100000}, {id: 'investment', n: 'Investiční guru', cost: 120000}, {id: 'costcutter', n: 'Šetřitel (-10% na nákupy)', cost: 150000}, {id: 'payroll', n: 'Mzdová (Slevy na školení)', cost: 100000}, {id: 'hedging', n: 'Palivový Hedging', cost: 80000}] }
};

const MARKET_DB = { 
    conservative: { n: '🛡️ Konzerv. fond', risk: 0.015, drift: 0.002, base: 100, color: '#00f260' }, 
    stock: { n: '📊 Akciový index', risk: 0.08, drift: 0.005, base: 500, color: '#00d4ff' }, 
    crypto: { n: '🪙 JirstanCoin', risk: 0.25, drift: 0.01, base: 50, color: '#ffc300' },
    realestate: { n: '🏢 Nemovitostní fond', risk: 0.03, drift: 0.003, base: 1000, color: '#f72585' }, 
    techstocks: { n: '💻 Tech Startupy', risk: 0.15, drift: 0.008, base: 200, color: '#00f5d4' }
};

// 3. KOMPLETNÍ SEZNAM VŠECH VOZIDEL (vč. LODÍ A LETADEL V4.0)
const CAR_DB = [
    {cat: 'van', model: "Fiat Ducato", price: 250000, spd: 1.4, img: 'van_fiat.jpg'},
    {cat: 'van', model: "Ford Transit Custom", price: 280000, spd: 1.3, img: 'van_ford.jpg'},
    {cat: 'van', model: "Renault Master", price: 290000, spd: 1.35, img: 'van_renault.jpg'},
    {cat: 'van', model: "VW Crafter 35", price: 320000, spd: 1.4, img: 'van_vw.jpg'},
    {cat: 'van', model: "MB Sprinter 319", price: 350000, spd: 1.5, img: 'van_mb.jpg'},
    {cat: 'solo', model: "Iveco Eurocargo", price: 850000, spd: 1.0, img: 'solo_iveco.jpg'},
    {cat: 'solo', model: "DAF LF 210", price: 890000, spd: 1.1, img: 'solo_daf.jpg'},
    {cat: 'solo', model: "MAN TGL 12.250", price: 950000, spd: 1.15, img: 'solo_man.jpg'},
    {cat: 'solo', model: "Volvo FL 250", price: 980000, spd: 1.15, img: 'solo_volvo.jpg'},
    {cat: 'solo', model: "Mercedes-Benz Atego", price: 1050000, spd: 1.2, img: 'solo_mb.jpg'},
    {cat: 'solo', model: "Tatra Phoenix (Agro)", price: 1150000, spd: 1.1, img: 'solo_tatra.jpg'},
    {cat: 'semi', model: "Scania R450 (Ojetá)", price: 1500000, spd: 1.2, img: 'semi_scania_old.jpg'},
    {cat: 'semi', model: "Iveco S-Way", price: 2100000, spd: 1.25, img: 'semi_iveco.jpg'},
    {cat: 'semi', model: "Volvo FH 460", price: 2200000, spd: 1.35, img: 'semi_volvo460.jpg'},
    {cat: 'semi', model: "Renault T-High", price: 2700000, spd: 1.3, img: 'semi_renault.jpg'},
    {cat: 'semi', model: "Mercedes Actros MP5", price: 2900000, spd: 1.3, img: 'semi_mb.jpg'},
    {cat: 'semi', model: "MAN TGX Individual", price: 3000000, spd: 1.4, img: 'semi_man.jpg'},
    {cat: 'semi', model: "DAF XG+", price: 3200000, spd: 1.45, img: 'semi_daf.jpg'},
    {cat: 'semi', model: "Volvo FH16 750", price: 3400000, spd: 1.6, img: 'semi_volvo.jpg'},
    {cat: 'semi', model: "Scania S770 V8", price: 3500000, spd: 1.6, img: 'semi_scania.jpg'},
    {cat: 'semi', model: "Kenworth W900", price: 3800000, spd: 1.3, img: 'semi_kenworth.jpg'},
    {cat: 'semi', model: "Tesla Semi (Elektro)", price: 4500000, spd: 1.7, img: 'semi_tesla.jpg'},
    {cat: 'semi', model: "Goliath TITAN 8x8", price: 8500000, spd: 2.0, img: 'semi_titan.jpg'}
];

const FLIP_CAR_DB = [
    {id:'hatch', n:'Hatchback', basePrice:150000, img:'car_hatch.jpg'},
    {id:'sedan', n:'Sedan', basePrice:400000, img:'car_sedan.jpg'},
    {id:'suv', n:'SUV', basePrice:800000, img:'car_suv.jpg'},
    {id:'sport', n:'Sport', basePrice:2000000, img:'car_sport.jpg'},
];

const BUS_DB = [    
    {cat: 'bus', model: "Městský autobus", price: 4000000, spd: 0.9, capacity: 50, luxury: 1, img: 'bus_city.jpg'},
    {cat: 'bus', model: "Expresní microbus", price: 5500000, spd: 1.1, capacity: 32, luxury: 2, img: 'bus_express.jpg'},
    {cat: 'bus', model: "Dálkový autobus", price: 7500000, spd: 1.2, capacity: 55, luxury: 3, img: 'bus_coach.jpg'},
    {cat: 'bus', model: "Kloubový autobus (Patrový)", price: 10000000, spd: 1.15, capacity: 70, luxury: 4, img: 'bus_double.jpg'},
    {cat: 'bus', model: "Luxusní zájezdový autobus", price: 12000000, spd: 1.3, capacity: 40, luxury: 5, img: 'bus_luxury.jpg'},
    {cat: 'bus', model: "Super Luxusní Autobus", price: 20000000, spd: 1.5, capacity: 35, luxury: 7, img: 'bus_superlux.jpg'}
];

const BUS_ROUTES = [
    {id:'city', name:'Městská linka', dailyIncome: 30000, fuelCost: 10, condLoss: 7, desc:'Krátké oběhy napříč městem, stabilní výnosy.'},
    {id:'intercity', name:'Meziměstská linka', dailyIncome: 80000, fuelCost: 25, condLoss: 12, desc:'Spojení hlavních měst, výnosnější ale náročnější na údržbu.'},
    {id:'tour', name:'Zájezdová linka', dailyIncome: 150000, fuelCost: 45, condLoss: 18, desc:'Luxusní turistické trasy s vysokou marží.'}
];

// NOVÉ DATABÁZE PRO V4.0 (Zámoří)
const SHIP_DB = [
    {cat: 'ship', model: "Pobřežní trajekt", price: 10000000, spd: 0.2, fuelReq: 5, img: 'ship_ferry.jpg'},
    {cat: 'ship', model: "Střední kontejnerová loď", price: 35000000, spd: 0.3, fuelReq: 10, img: 'ship_container.jpg'},
    {cat: 'ship', model: "Oceánský ropný tanker", price: 75000000, spd: 0.25, fuelReq: 15, img: 'ship_tanker.jpg'},
    {cat: 'ship', model: "Giga-Třída Jirstan Leviathan", price: 150000000, spd: 0.4, fuelReq: 25, img: 'ship_leviathan.jpg'}
];

const PLANE_DB = [
    {cat: 'plane', model: "Cessna 208 Caravan", price: 15000000, spd: 3.5, fuelReq: 8, img: 'plane_cessna.jpg'},
    {cat: 'plane', model: "Airbus A330F", price: 85000000, spd: 5.5, fuelReq: 30, img: 'plane_a330.jpg'},
    {cat: 'plane', model: "Boeing 747-8 Freighter", price: 150000000, spd: 6.5, fuelReq: 50, img: 'plane_747.jpg'},
    {cat: 'plane', model: "Antonov An-225 Mriya II", price: 300000000, spd: 7.0, fuelReq: 100, img: 'plane_antonov.jpg'}
];

// 4. KOMPLETNÍ SEZNAM VŠECH NÁVĚSŮ A STROJŮ
const TRAILERS_DB = [ 
    {id: 'plachta', n: 'STANDARD PLACHTA', price: 300000, bonus: 1.2, img: 'trailer_curtain.jpg'}, 
    {id: 'mega', n: 'MEGA NÁVĚS', price: 450000, bonus: 1.3, img: 'trailer_mega.jpg'}, 
    {id: 'klanicovy', n: 'KLANICOVÝ (Dřevo)', price: 500000, bonus: 1.35, img: 'trailer_wood.jpg'},
    {id: 'sklopka', n: 'SKLOPKA (Sypké)', price: 600000, bonus: 1.4, img: 'trailer_tipper.jpg'}, 
    {id: 'frigo', n: 'CHLADÍRNSKÝ (Frigo)', price: 800000, bonus: 1.6, img: 'trailer_reefer.jpg'}, 
    {id: 'autoprepravnik', n: 'AUTOPŘEPRAVNÍK', price: 900000, bonus: 1.7, img: 'trailer_cars.jpg'},
    {id: 'cisterna', n: 'CISTERNA (ADR)', price: 1000000, bonus: 1.8, img: 'trailer_tanker.jpg'}, 
    {id: 'podval', n: 'HLUBINNÝ PODVALNÍK', price: 1500000, bonus: 2.2, img: 'trailer_lowbed.jpg'},
    {id: 'nadrozmer_pro', n: 'NADROZMĚR PRO', price: 2500000, bonus: 2.8, img: 'trailer_heavypro.jpg'},
    {id: 'road_train', n: 'SILNIČNÍ VLAK (AU)', price: 4000000, bonus: 3.5, img: 'trailer_roadtrain.jpg'}
];

const MACHINES_DB = [ 
    {id: 'desta', n: 'Vysokozdvižný vozík', c: 150000, inc: 1500, img: 'mach_forklift.jpg'}, 
    {id: 'bagr', n: 'Bagr CAT 320', c: 850000, inc: 9000, img: 'mach_excavator.jpg'}, 
    {id: 'nakladac', n: 'Kolový nakladač', c: 1200000, inc: 14000, img: 'mach_loader.jpg'}, 
    {id: 'jerab', n: 'Autojeřáb Liebherr', c: 3500000, inc: 45000, img: 'mach_crane.jpg'},
    {id: 'drtic', n: 'Mobilní drtič kamene', c: 5000000, inc: 70000, img: 'mach_crusher.jpg'},
    {id: 'tezebni', n: 'Těžební rypadlo', c: 15000000, inc: 250000, img: 'mach_mining.jpg'},
    {id: 'server', n: 'Kryptoměnová farma (Server)', c: 2500000, inc: 0, incCrypto: 30, img: 'mach_server.jpg'}
];

const TOWER_FLOORS_DB = [
    {id: 1, icon: '💻', name: 'IT Centrum', desc: 'Pokročilé IT systémy pro optimalizaci flotily', bonus: '+5% rychlost flotily', price: 5000000, req: null},
    {id: 2, icon: '📊', name: 'Finanční Oddělení', desc: 'Profesionální finanční management', bonus: '+10% zisk z dodávek', price: 10000000, req: 1},
    {id: 3, icon: '🔧', name: 'Technické Centrum', desc: 'Vyspělé opravárenské zařízení', bonus: '-20% náklady na opravy', price: 15000000, req: 2},
    {id: 4, icon: '🚢', name: 'Logistické Centrum', desc: 'Koordinace mezinárodních tras', bonus: '+15% rychlost lodí a letadel', price: 25000000, req: 3},
    {id: 5, icon: '🏢', name: 'Exekutivní Suite', desc: 'Prémiové kanceláře pro vedení', bonus: '+20% reputace denně', price: 50000000, req: 4},
    {id: 6, icon: '🌐', name: 'Globální Hub', desc: 'Centrum pro světový obchod', bonus: '+25% zisk ze zámoří', price: 100000000, req: 5},
    {id: 7, icon: '🛡️', name: 'Bezpečnostní Centrum', desc: 'Pokročilé zabezpečení a pojištění', bonus: '80% krytí škod zdarma', price: 200000000, req: 6},
    {id: 8, icon: '🚀', name: 'Inovační Laboratoř', desc: 'Výzkum budoucích technologií', bonus: '+50% rychlost výzkumu', price: 500000000, req: 7}
];

const WEATHER_TYPES = [ {id: 'sun', n: '☀️ Slunečno', speed: 1.0}, {id: 'rain', n: '🌧️ Déšť', speed: .8}, {id: 'storm', n: '⛈️ Bouřka', speed: .6}, {id: 'snow', n: '❄️ Sníh', speed: .65} ];
const TRAINING_DB = [ {id: 'basic', n: 'Základní kurz', cost: 10000, xp: 300, icon: '📚'}, {id: 'specialist', n: 'Pokročilá jízda', cost: 40000, xp: 1500, icon: '🏎️'}, {id: 'premium', n: 'Premium Academia', cost: 80000, xp: 3000, icon: '🎓'} ];

const ACH_DB = [ 
    {id: 'first_mil', n: 'První milionář', desc: 'Měj 1 000 000 Kč na účtu', reward: 100000, icon: '💰', check: s => s.money >= 1000000}, 
    {id: 'multi_mil', n: 'Multimilionář', desc: 'Měj 10 000 000 Kč na účtu', reward: 1000000, icon: '💎', check: s => s.money >= 10000000},
    {id: 'veteran', n: 'Veterán silnic', desc: 'Dosáhni Dne 100', reward: 150000, icon: '🎖️', check: s => s.day >= 100}, 
    {id: 'buyout', n: 'Monopol', desc: 'Odkupej první konkurenci', reward: 2000000, icon: '📈', check: s => Object.values(s.competitors).some(c => c.boughtOut)},
    {id: 'fleet_boss', n: 'Boss flotily', desc: 'Měj alespoň 5 kamionů', reward: 300000, icon: '🚛', check: s => s.vehicles.length >= 5},
    {id: 'collector', n: 'Sběratel Aut', desc: 'Měj alespoň 15 kamionů', reward: 2000000, icon: '🚛', check: s => s.vehicles.length >= 15},
    {id: 'tech_guru', n: 'Tech Guru', desc: 'Vyzkoumej všechny dostupné technologie', reward: 1500000, icon: '🔬', check: s => s.tech.length >= TECH_DB.length},
    {id: 'global_empire', n: 'Globální Impérium', desc: 'Vlastni alespoň jednu loď a jedno letadlo', reward: 5000000, icon: '🌍', check: s => s.ships.length > 0 && s.planes.length > 0}
];

const SUPPLY_CHAINS = [
    {
        name: "Dřevařský průmysl Jirstan",
        stages: [
            { stage: 1, label: "Fáze 1: Těžba dřeva (Pila)", cargo: "Dřevo", from: "Brno", to: "Ostrava", basePay: 25000 },
            { stage: 2, label: "Fáze 2: Zpracování (Nábytkárna)", cargo: "Desky", from: "Ostrava", to: "Plzeň", basePay: 45000 },
            { stage: 3, label: "Fáze 3: Distribuce (Nábytek Jirstan)", cargo: "Nábytek", from: "Plzeň", to: "Praha", basePay: 95000 }
        ]
    },
    {
        name: "Automobilový koncern Jirstan",
        stages: [
            { stage: 1, label: "Fáze 1: Surová ocel (Slévárna)", cargo: "Ocel", from: "Ostrava", to: "Mladá Boleslav", basePay: 30000 },
            { stage: 2, label: "Fáze 2: Výroba karoserií (Škoda)", cargo: "Díly", from: "Mladá Boleslav", to: "Kolín", basePay: 55000 },
            { stage: 3, label: "Fáze 3: Distribuce vozů (Autosalon)", cargo: "Auta", from: "Kolín", to: "Praha", basePay: 120000 }
        ]
    },
    {
        name: "Potravinový řetězec Jirstan",
        stages: [
            { stage: 1, label: "Fáze 1: Sběr mléka (Mlékárna)", cargo: "Mléko", from: "České Budějovice", to: "Hradec Králové", basePay: 20000 },
            { stage: 2, label: "Fáze 2: Výroba sýrů (Balírna)", cargo: "Sýry", from: "Hradec Králové", to: "Ústí nad Labem", basePay: 38000 },
            { stage: 3, label: "Fáze 3: Zásobování supermarketu (Fresh)", cargo: "Delikatesy", from: "Ústí nad Labem", to: "Praha", basePay: 80000 }
        ]
    }
];

// Odvozené lookup objekty
const cargoToLicenseMap = {};
Object.keys(CARGO_TYPES).forEach(lic => {
    if (lic !== 'none' && lic !== 'sea' && lic !== 'air') {
        CARGO_TYPES[lic].forEach(car => cargoToLicenseMap[car] = lic);
    }
});

const allLandCargoes = Object.keys(CARGO_TYPES)
    .filter(k => k !== 'sea' && k !== 'air')
    .flatMap(k => CARGO_TYPES[k]);
