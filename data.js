/* ============================================================
   JIRSTAN LOGISTICS — STATICKÁ DATA & KONFIGURACE (data.js)
   ============================================================ */

// 1. LOKACE A TYPY (GLOBAL EXPANSION)
const CITIES = {
    // EVROPA (isOverseas: false, region: 'Europe', continent: 'Europe')
    "Praha":      { x: .75, y: .55, isAirport: true,  isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 50.0755, lng: 14.4378 }, 
    "Zájezd":     { x: .74, y: .54, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 50.1550, lng: 14.1620 },
    "Brno":       { x: .85, y: .65, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 49.1951, lng: 16.6068 }, 
    "Plzeň":      { x: .68, y: .58, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 49.7384, lng: 13.3736 }, 
    "Ostrava":    { x: .90, y: .55, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 49.8209, lng: 18.2625 }, 
    "Mnichov":    { x: .60, y: .70, isAirport: true,  isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 48.1351, lng: 11.5820 }, 
    "Vídeň":      { x: .80, y: .75, isAirport: true,  isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 48.2082, lng: 16.3738 }, 
    "Berlín":     { x: .65, y: .35, isAirport: true,  isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 52.5200, lng: 13.4050 }, 
    "Varšava":    { x: .88, y: .35, isAirport: true,  isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 52.2297, lng: 21.0122 }, 
    "Hamburk":    { x: .62, y: .25, isAirport: false, isPort: true,  isOverseas: false, region: 'Europe', continent: 'Europe', lat: 53.5511, lng:  9.9937 }, 
    "Drážďany":   { x: .70, y: .45, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 51.0504, lng: 13.7373 }, 
    "Bratislava": { x: .82, y: .70, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 48.1486, lng: 17.1077 }, 
    "Budapešť":   { x: .88, y: .80, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 47.4979, lng: 19.0402 },
    "Paříž":      { x: .55, y: .50, isAirport: true,  isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 48.8566, lng:  2.3522 }, 
    "Řím":        { x: .70, y: .90, isAirport: true,  isPort: true,  isOverseas: false, region: 'Europe', continent: 'Europe', lat: 41.9028, lng: 12.4964 }, 
    "Londýn":     { x: .52, y: .35, isAirport: true,  isPort: true,  isOverseas: false, region: 'Europe', continent: 'Europe', lat: 51.5074, lng: -0.1278 },
    "Mladá Boleslav": { x: .77, y: .50, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 50.4114, lng: 14.9032 },
    "Kolín":          { x: .78, y: .56, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 50.0281, lng: 15.2006 },
    "České Budějovice": { x: .75, y: .68, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 48.9745, lng: 14.4743 },
    "Hradec Králové": { x: .81, y: .51, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 50.2092, lng: 15.8328 },
    "Ústí nad Labem": { x: .73, y: .48, isAirport: false, isPort: false, isOverseas: false, region: 'Europe', continent: 'Europe', lat: 50.6607, lng: 14.0323 },
    // SEVERNÍ AMERIKA (isOverseas: true, region: 'North America', continent: 'North America')
    "New York":   { x: .25, y: .40, isAirport: true,  isPort: true,  isOverseas: true,  region: 'North America', continent: 'North America', lat: 40.7128, lng: -74.0060 },
    "Los Angeles":{ x: .08, y: .55, isAirport: true,  isPort: true,  isOverseas: true,  region: 'North America', continent: 'North America', lat: 34.0522, lng: -118.2437 },
    "Miami":      { x: .22, y: .75, isAirport: true,  isPort: true,  isOverseas: true,  region: 'North America', continent: 'North America', lat: 25.7617, lng: -80.1918 },
    "Toronto":    { x: .20, y: .30, isAirport: true,  isPort: false, isOverseas: true,  region: 'North America', continent: 'North America', lat: 43.6532, lng: -79.3832 },
    "Chicago":    { x: .18, y: .42, isAirport: true,  isPort: false, isOverseas: true,  region: 'North America', continent: 'North America', lat: 41.8781, lng: -87.6298 }
};

const LICENSES = [
    { id: 'express',   n: 'EXPRES',     color: '#ff9d00', minLvl: 1,  cost: 15000 }, 
    { id: 'stehovani', n: 'STĚHOVÁNÍ',  color: '#8d6e63', minLvl: 3,  cost: 20000 },
    { id: 'sypky',     n: 'SYPKÉ',      color: '#ffca28', minLvl: 5,  cost: 30000 }, 
    { id: 'wood',      n: 'DŘEVO',      color: '#795548', minLvl: 6,  cost: 35000 },
    { id: 'frigo',     n: 'FRIGO',      color: '#00e5ff', minLvl: 8,  cost: 40000 },
    { id: 'leky',      n: 'LÉKY',       color: '#ff4081', minLvl: 10, cost: 50000 }, 
    { id: 'cars',      n: 'AUTA',       color: '#ab47bc', minLvl: 12, cost: 60000 },
    { id: 'adr',       n: 'ADR',        color: '#ff1744', minLvl: 15, cost: 80000 },
    { id: 'heavy',     n: 'NADROZMĚR',  color: '#f57c00', minLvl: 15, cost: 80000 }, 
    { id: 'ceniny',    n: 'CENINY',     color: '#ffd700', minLvl: 20, cost: 120000 }
];

const CARGO_TYPES = {
    'express':   ['Důležité dokumenty', 'Náhradní díly do letadla', 'Krevní plazma'], 
    'stehovani': ['Vybavení kanceláří', 'Starožitný nábytek', 'Klavír'],
    'sypky':     ['Stavební písek', 'Drcený štěrk', 'Zemina z výkopu'], 
    'wood':      ['Smrkové klády', 'Dřevní štěpka', 'Nařezané desky'],
    'frigo':     ['Mražené ryby', 'Zmrzlina', 'Exotické ovoce'],
    'leky':      ['Vakcíny v chladu', 'Antibiotika', 'Chirurgické nástroje'], 
    'cars':      ['Nová auta Škoda', 'Luxusní vozy Porsche', 'Ojetiny z Německa'],
    'adr':       ['Sudy s chemikáliemi', 'Kyselina sírová', 'Propan-butan'],
    'heavy':     ['Ocelové nosníky', 'Turbína do elektrárny', 'Bagr Caterpillar'], 
    'ceniny':    ['Zlaté cihly', 'Hotovost pro bankomaty', 'Diamanty'],
    'none':      ['Palety papíru', 'Minerální voda', 'Elektronika', 'Díly pro Škoda Auto', 'Hračky'],
    'sea':       ['Tisíce kontejnerů s elektronikou z Asie', 'Nákladní automobily pro export', 'Ropa v barelech', 'Tuny exotických surovin'],
    'air':       ['High-tech servery', 'Záchranné zdravotní vybavení', 'Zásilky z E-shopů', 'Součástky pro letecký průmysl']
};

const BLACK_MARKET_CARGO = [
    { name: "Neoznačené zbraně",       mult: 4.5, reqLic: 'adr',    risk: 0.35 },
    { name: "Pašované kubánské doutníky", mult: 3.2, reqLic: 'express',risk: 0.20 },
    { name: "Padělaná luxusní elektronika", mult: 3.8, reqLic: 'express',risk: 0.25 },
    { name: "Nelegální drahokamy z Afriky", mult: 6.0, reqLic: 'ceniny', risk: 0.45 },
    { name: "Prototyp vojenského čipu",  mult: 5.5, reqLic: 'express',risk: 0.40 },
    { name: "Nelicencované farmaceutika", mult: 4.0, reqLic: 'leky',   risk: 0.30 }
];

const DRIVERS_MARKET = [
    { name: "Petr Rychlý",       level: 1, cost: 5000,  salary: 500,  trait: 'eco',       desc: "Úsporná jízda (-20% palivo)",            bio: "Bývalý taxikář, který zná každou zkratku." },
    { name: "Jana Hbitá",        level: 2, cost: 8000,  salary: 750,  trait: 'racer',     desc: "Rychlejší doručení (+15% rychlost)",     bio: "Miluje rychlost a espresso. Na dálnici nezná slitování." },
    { name: "Milan Těžký",       level: 3, cost: 15000, salary: 1200, trait: 'safe',      desc: "Minimální riziko nehod (-50% nehody)",   bio: "Klidný a rozvážný veterán s 20 lety bez škrábance." },
    { name: "Lukáš Neúnavný",    level: 4, cost: 25000, salary: 1800, trait: 'iron',      desc: "Ocelové nervy (únava roste o 30% pomaleji)", bio: "Vydrží za volantem celou noc, stačí mu energy drink." },
    { name: "Alena Noční",       level: 3, cost: 18000, salary: 1400, trait: 'nightowl',  desc: "Noční jezdec (+30% výdělek v noci)",      bio: "Ráda jezdí pod hvězdami, když jsou dálnice prázdné." },
    { name: "Viktor 'Cihla' M.", level: 5, cost: 45000, salary: 3000, trait: 'beast',     desc: "Mistr těžkého nákladu (+25% k výplatě)", bio: "Legenda dálkových tras, který odveze naprosto cokoliv." }
];

const VEHICLE_CATALOG = [
    // DODÁVKY
    { id: 'van_fiat',    type: 'van', model: 'Fiat Ducato',    price: 150000,  spd: 1.4, tank: 90,  wearPerKm: 0.05, img: 'van_fiat.jpg',    tier: 'van' },
    { id: 'van_ford',    type: 'van', model: 'Ford Transit',   price: 220000,  spd: 1.5, tank: 100, wearPerKm: 0.04, img: 'van_ford.jpg',    tier: 'van' },
    { id: 'van_renault', type: 'van', model: 'Renault Master', price: 260000,  spd: 1.5, tank: 105, wearPerKm: 0.04, img: 'van_renault.jpg', tier: 'van' },
    { id: 'van_vw',      type: 'van', model: 'VW Crafter',     price: 320000,  spd: 1.6, tank: 110, wearPerKm: 0.03, img: 'van_vw.jpg',      tier: 'van' },
    { id: 'van_mb',      type: 'van', model: 'Mercedes Sprinter', price: 420000, spd: 1.7, tank: 120, wearPerKm: 0.02, img: 'van_mb.jpg',    tier: 'van' },
    
    // SÓLO NÁKLADNÍ VOZY
    { id: 'solo_iveco',  type: 'solo', model: 'Iveco Eurocargo', price: 650000, spd: 1.1, tank: 200, wearPerKm: 0.06, img: 'solo_iveco.jpg',  tier: 'solo' },
    { id: 'solo_daf',    type: 'solo', model: 'DAF LF',          price: 750000, spd: 1.2, tank: 220, wearPerKm: 0.05, img: 'solo_daf.jpg',    tier: 'solo' },
    { id: 'solo_man',    type: 'solo', model: 'MAN TGM',         price: 850000, spd: 1.2, tank: 240, wearPerKm: 0.05, img: 'solo_man.jpg',    tier: 'solo' },
    { id: 'solo_volvo',  type: 'solo', model: 'Volvo FL',        price: 950000, spd: 1.3, tank: 250, wearPerKm: 0.04, img: 'solo_volvo.jpg',  tier: 'solo' },
    { id: 'solo_mb',     type: 'solo', model: 'Mercedes Atego',  price: 1100000,spd: 1.3, tank: 260, wearPerKm: 0.03, img: 'solo_mb.jpg',     tier: 'solo' },
    { id: 'solo_tatra',  type: 'solo', model: 'Tatra Phoenix 4x4', price: 1350000, spd: 1.2, tank: 300, wearPerKm: 0.02, img: 'solo_tatra.jpg', tier: 'solo' },
    
    // TAHAČE (SEMI)
    { id: 'semi_renault',type: 'semi', model: 'Renault T-Range', price: 1800000, spd: 0.9, tank: 600, wearPerKm: 0.08, img: 'semi_renault.jpg', tier: 'semi' },
    { id: 'semi_iveco',  type: 'semi', model: 'Iveco S-Way',     price: 2100000, spd: 1.0, tank: 650, wearPerKm: 0.07, img: 'semi_iveco.jpg',   tier: 'semi' },
    { id: 'semi_daf',    type: 'semi', model: 'DAF XG+',         price: 2400000, spd: 1.0, tank: 700, wearPerKm: 0.06, img: 'semi_daf.jpg',     tier: 'semi' },
    { id: 'semi_ford',   type: 'semi', model: 'Ford F-Max',      price: 2250000, spd: 1.0, tank: 680, wearPerKm: 0.07, img: 'semi_ford.jpg',    tier: 'semi' },
    { id: 'semi_man',    type: 'semi', model: 'MAN TGX Individual', price: 2700000, spd: 1.1, tank: 750, wearPerKm: 0.05, img: 'semi_man.jpg',  tier: 'semi' },
    { id: 'semi_mb',     type: 'semi', model: 'Mercedes Actros Gigaspace', price: 2900000, spd: 1.1, tank: 800, wearPerKm: 0.04, img: 'semi_mb.jpg', tier: 'semi' },
    { id: 'semi_volvo',  type: 'semi', model: 'Volvo FH16 750',  price: 3200000, spd: 1.2, tank: 850, wearPerKm: 0.04, img: 'semi_volvo.jpg',   tier: 'semi' },
    { id: 'semi_scania', type: 'semi', model: 'Scania 770S V8',  price: 3500000, spd: 1.2, tank: 900, wearPerKm: 0.03, img: 'semi_scania.jpg',  tier: 'semi' },
    { id: 'semi_tatra',  type: 'semi', model: 'Tatra Phoenix 8x8 King', price: 3800000, spd: 1.1, tank: 950, wearPerKm: 0.02, img: 'semi_tatra.jpg', tier: 'semi' },
    { id: 'semi_tesla',  type: 'semi', model: 'Tesla Semi Electric', price: 4500000, spd: 1.4, tank: 1000, wearPerKm: 0.01, img: 'semi_tesla.jpg', tier: 'semi' },
    { id: 'semi_kenworth', type: 'semi', model: 'Kenworth W900 USA', price: 5200000, spd: 1.1, tank: 1200, wearPerKm: 0.03, img: 'semi_kenworth.jpg', tier: 'semi' },
    
    // ZÁMOŘSKÉ LODĚ
    { id: 'ship_feeder',    type: 'ship', model: 'Kontejnerový Feeder',    price: 18000000, spd: 0.5, tank: 5000,  wearPerKm: 0.01, img: 'ship_container.jpg', tier: 'ship' },
    { id: 'ship_ferry',     type: 'ship', model: 'Nákladní Trajekt Ro-Ro', price: 25000000, spd: 0.6, tank: 6500,  wearPerKm: 0.01, img: 'ship_ferry.jpg',     tier: 'ship' },
    { id: 'ship_tanker',    type: 'ship', model: 'Ropný Tanker Aframax',   price: 45000000, spd: 0.4, tank: 12000, wearPerKm: 0.01, img: 'ship_tanker.jpg',    tier: 'ship' },
    { id: 'ship_panamax',   type: 'ship', model: 'Panamax Mega Express',   price: 75000000, spd: 0.5, tank: 20000, wearPerKm: 0.01, img: 'ship_leviathan.jpg', tier: 'ship' },
    
    // NÁKLADNÍ LETADLA
    { id: 'plane_cessna',   type: 'plane', model: 'Cessna Caravan Cargo',   price: 12000000, spd: 2.5, tank: 800,   wearPerKm: 0.03, img: 'plane_cessna.jpg',  tier: 'plane' },
    { id: 'plane_a330',     type: 'plane', model: 'Airbus A330-200F',       price: 60000000, spd: 4.0, tank: 8000,  wearPerKm: 0.02, img: 'plane_a330.jpg',    tier: 'plane' },
    { id: 'plane_747',      type: 'plane', model: 'Boeing 747-8 Freighter', price: 110000000,spd: 4.5, tank: 15000, wearPerKm: 0.02, img: 'plane_747.jpg',     tier: 'plane' },
    { id: 'plane_antonov',  type: 'plane', model: 'Antonov An-225 Mriya',   price: 250000000,spd: 4.2, tank: 30000, wearPerKm: 0.01, img: 'plane_antonov.jpg', tier: 'plane' }
];

const BUS_CATALOG = [
    { id: 'bus_micro',  model: 'Mercedes-Benz Sprinter City (Mikrobus)', price: 650000,  seats: 18, speed: 1.5, costPerKm: 8,  img: 'bus_micro.jpg' },
    { id: 'bus_city',   model: 'SOR NS 12 Electric (Městský bus)',       price: 1800000, seats: 45, speed: 1.2, costPerKm: 12, img: 'bus_city.jpg' },
    { id: 'bus_coach',  model: 'Setra S 517 HD (Dálkový autokar)',       price: 3500000, seats: 58, speed: 1.4, costPerKm: 16, img: 'bus_coach.jpg' },
    { id: 'bus_double', model: 'Neoplan Skyliner (Patrový VIP Express)', price: 6200000, seats: 82, speed: 1.4, costPerKm: 22, img: 'bus_double.jpg' }
];

const SEMI_TRAILER_CATALOG = [
    { id: 'curtain',   name: 'Plachtový Návěs (Standard)', cost: 350000,  lic: 'none',      cap: 24, wear: 0.02, icon: '🚛', img: 'trailer_curtain.jpg' },
    { id: 'mega',      name: 'Mega Návěs (100 m³)',        cost: 450000,  lic: 'express',   cap: 28, wear: 0.02, icon: '📦', img: 'trailer_mega.jpg' },
    { id: 'reefer',    name: 'Chladírenský Návěs (Frigo)', cost: 650000,  lic: 'frigo',     cap: 22, wear: 0.03, icon: '❄️', img: 'trailer_reefer.jpg' },
    { id: 'tanker',    name: 'Cisternový Návěs (ADR)',     cost: 850000,  lic: 'adr',       cap: 26, wear: 0.03, icon: '🛢️', img: 'trailer_tanker.jpg' },
    { id: 'tipper',    name: 'Sklápěcí Návěs (Sypké)',     cost: 550000,  lic: 'sypky',     cap: 30, wear: 0.04, icon: '⛰️', img: 'trailer_tipper.jpg' },
    { id: 'lowbed',    name: 'Hlubinný Podvalník (Těžký)', cost: 1200000, lic: 'heavy',     cap: 45, wear: 0.05, icon: '🚜', img: 'trailer_lowbed.jpg' },
    { id: 'cars',      name: 'Přepravník Automobilů',       cost: 950000,  lic: 'cars',      cap: 20, wear: 0.03, icon: '🚗', img: 'trailer_cars.jpg' },
    { id: 'wood',      name: 'Oplatový Návěs na Dřevo',    cost: 500000,  lic: 'wood',      cap: 32, wear: 0.04, icon: '🌲', img: 'trailer_wood.jpg' },
    { id: 'roadtrain', name: 'Road Train Double Linka',    cost: 2500000, lic: 'heavy',     cap: 70, wear: 0.06, icon: '🚂', img: 'trailer_roadtrain.jpg' }
];

const MACHINES_CATALOG = [
    { id: 'forklift',  name: 'Vysokozdvižný Vozík Linde', cost: 120000,  dailyYield: 2500,  type: 'logistics', icon: '🚜', desc: '+15% rychlost nakládky ve skladu', img: 'mach_forklift.jpg' },
    { id: 'crane',     name: 'Přístavní Jeřáb Liebherr',   cost: 4500000, dailyYield: 65000, type: 'port',      icon: '🏗️', desc: 'Generuje pasivní příjem z manipulace kontejnerů', img: 'mach_crane.jpg' },
    { id: 'excavator', name: 'Důlní Rypadlo CAT 390F',     cost: 2800000, dailyYield: 42000, type: 'mining',    icon: '⛏️', desc: 'Těží stavební suroviny a prodává je na trhu', img: 'mach_excavator.jpg' },
    { id: 'loader',    name: 'Kloubový Nakladač Volvo',    cost: 1600000, dailyYield: 24000, type: 'mining',    icon: '🚜', desc: 'Pasivní zisk z těžby štěrku a písku', img: 'mach_loader.jpg' },
    { id: 'crusher',   name: 'Mobilní Drtič Kamene Metso', cost: 3200000, dailyYield: 50000, type: 'mining',    icon: '⚙️', desc: 'Zpracování kamene na štěrk vysoké kvality', img: 'mach_crusher.jpg' },
    { id: 'server',    name: 'Firemní AI Server Cluster',  cost: 2000000, dailyYield: 35000, type: 'tech',      icon: '🖥️', desc: 'AI optimalizace logistických tras a krypto staking', img: 'mach_server.jpg' }
];

const TECH_TREE = [
    { id: 'gps_adv',   name: 'Satelitní Navigace GPS 2.0', cost: 25000,  desc: 'Zvýší rychlost všech vozidel o 10%.', icon: '🛰️' },
    { id: 'eco_fleet', name: 'Ekologický Management Motorů',cost: 45000,  desc: 'Sníží spotřebu paliva o 15%.',       icon: '🌱' },
    { id: 'auto_disp', name: 'Automatizovaný Dispečink',   cost: 80000,  desc: 'Automatické přijímání zakázek v pozadí.', icon: '🤖' },
    { id: 'corp_net',  name: 'Korporátní Aliance B2B',     cost: 150000, desc: 'Odemkne exkluzivní VIP korporátní kontrakty.', icon: '🏙️' },
    { id: 'port_hub',  name: 'Globální Námořní Logistika', cost: 350000, desc: 'Odemkne přístavy a možnost nákupu lodí.', icon: '⚓' },
    { id: 'air_hub',   name: 'Letecká Expresní Divize',    cost: 750000, desc: 'Odemkne mezinárodní letiště a nákladní letadla.', icon: '✈️' },
    { id: 'ai_core',   name: 'JIRSTAN Kvantové AI Jádro',  cost: 2000000,desc: '+30% bonus ke všem výdělkům v impériu.', icon: '🧠' }
];

const ACHIEVEMENTS = [
    { id: 'first_job',  name: 'První Kilometr',        desc: 'Dokonči svou první zakázku.', reward: 10000,   icon: '🎯' },
    { id: 'fleet_5',    name: 'Rostoucí Flotila',      desc: 'Vlastni alespoň 5 vozidel.',   reward: 50000,   icon: '🚛' },
    { id: 'millionaire',name: 'První Milionář',        desc: 'Dosáhni zůstatku 1 000 000 Kč.', reward: 100000, icon: '💰' },
    { id: 'overseas',   name: 'Vládce Oceánů a Nebe',  desc: 'Kup svou první loď nebo letadlo.', reward: 500000, icon: '🌍' },
    { id: 'tycoon',     name: 'Logistický Magnát',     desc: 'Dosáhni čistého jmění přes 100M Kč.', reward: 5000000, icon: '👑' }
];

const COMPETITORS = {
    fastex:    { name: 'Fastex Express',    power: 1.2, reputation: 80,  color: '#ff2a55', img: 'staff_dispatcher.jpg' },
    greenroad: { name: 'GreenRoad Eko',     power: 0.9, reputation: 60,  color: '#00f260', img: 'staff_dispatcher.jpg' },
    atlas:     { name: 'Atlas Global Trans',power: 1.1, reputation: 90,  color: '#00d4ff', img: 'staff_dispatcher.jpg' },
    premium:   { name: 'Premium Logistics', power: 1.3, reputation: 120, color: '#ffc300', img: 'staff_dispatcher.jpg' },
    jirstan:   { name: 'JIRSTAN CORP GIGANT',power: 5.0, reputation: 150, color: '#b5179e', img: 'stanislav1.jpg' }
};

const HQ_UPGRADES = [
    { id: 'garage',           name: 'Rozšíření Garáže',       cost: 200000, maxLvl: 10, desc: '+2 parkovací místa pro vozidla.' },
    { id: 'office',           name: 'Modernizace Kanceláře',   cost: 150000, maxLvl: 5,  desc: '+5% reputace firmy a lepší řidiči na trhu.' },
    { id: 'workshop',         name: 'Vlastní Servisní Stání', cost: 300000, maxLvl: 5,  desc: '-10% náklady na opravy a servis vozidel.' },
    { id: 'logistics_center', name: 'Logistické Centrum',     cost: 500000, maxLvl: 5,  desc: '+3% hodnota všech zakázek.' },
    { id: 'fuel_depot',       name: 'Vlastní Zásobník Paliva', cost: 400000, maxLvl: 5,  desc: 'Možnost nakupovat naftu do zásoby za velkoobchodní cenu.' },
    { id: 'relax_zone',       name: 'Wellness a Relax Zóna',  cost: 250000, maxLvl: 5,  desc: 'Řidiči odpočívají o 25% rychleji a mají vyšší morálku.' }
];

const CHALLENGES = [
    { id: 'ch_del_10',  title: 'Bleskový Týden',       desc: 'Dokonči 10 expresních zakázek.', target: 10,  reward: 150000, repReward: 5 },
    { id: 'ch_km_5000', title: 'Dobyvatel Evropy',     desc: 'Ujeď se svou flotilou 5 000 km.', target: 5000,reward: 250000, repReward: 10 },
    { id: 'ch_earn_2m', title: 'Zlatý Obchod',         desc: 'Vydělej 2 000 000 Kč ze zakázek.', target: 2000000, reward: 500000, repReward: 15 }
];

// JIRSTAN TOWER & FALLOUT SHELTER PATRA
const TOWER_FLOORS_DB = [
    { id: 2, name: "Datové centrum & Satelity",  cost: 500000,   bonus: "+10% rychlost informací a AI dispečinku", icon: "🖥️", bg: "#061324" },
    { id: 3, name: "Školící akademie řidičů",     cost: 1000000,  bonus: "+15% rychlejší získávání zkušeností řidičů", icon: "🎓", bg: "#1a1205" },
    { id: 4, name: "Marketingové a PR studio",    cost: 2000000,  bonus: "+20% hodnota prémiových kontraktů", icon: "📢", bg: "#200615" },
    { id: 5, name: "Bezpečnost & Satelitní radar",cost: 4000000,  bonus: "-50% škody při nehodách a krádežích", icon: "🛡️", bg: "#061a14" },
    { id: 6, name: "VIP Lounge & Zasedací sál",   cost: 8000000,  bonus: "+25% reputace u mezinárodních korporací", icon: "🍸", bg: "#1f1704" },
    { id: 7, name: "Vývojové R&D Laboratoře",     cost: 15000000, bonus: "-20% spotřeba paliva celé flotily", icon: "🔬", bg: "#041b1f" },
    { id: 8, name: "Prezidentský Penthouse & Helipad", cost: 30000000, bonus: "+50% celkový zisk impéria JIRSTAN", icon: "🚁", bg: "#1b0524" }
];

const BAZAAR_CAR_DB = [
    { id: 'hatch', model: 'Hatchback', basePrice: 150000, img: 'car_hatch.jpg' },
    { id: 'sedan', model: 'Sedan',     basePrice: 400000, img: 'car_sedan.jpg' },
    { id: 'suv',   model: 'SUV 4x4',   basePrice: 800000, img: 'car_suv.jpg' },
    { id: 'sport', model: 'Sport GT',  basePrice: 2000000,img: 'car_sport.jpg' }
];

const WAREHOUSE_COMMODITIES = [
    { id: 'electronics', name: 'Elektronika & Mikročipy', basePrice: 1000, vol: 0.15, icon: '📱' },
    { id: 'food',        name: 'Trvanlivé Potraviny',    basePrice: 200,  vol: 0.05, icon: '🥫' },
    { id: 'parts',       name: 'Automobilové Součástky', basePrice: 500,  vol: 0.08, icon: '⚙️' },
    { id: 'fresh_food',  name: 'Čerstvé Zboží (Chlazené)', basePrice: 300, vol: 0.20, icon: '🥩' }
];
