window.onerror = function(message, source, lineno, colno, error) {
    alert("JIRSTAN OS CHYBA PŘI STARTU:\n" + message + "\nŘádek: " + lineno + "\nZdroj: " + source);
    console.error("Závažná chyba hry:", error);
    return false;
};

// ============================================================
// SYSTEM TELEMETRY & LOGGING (DEV CONSOLE F12)
// ============================================================
function SysLog(tag, msg, extra = null) {
    const colors = {
        'DISPEČINK': '#00d4ff',
        'EKONOMIKA': '#00ff88',
        'SKLAD': '#ff9d00',
        'VĚŽ': '#b5179e',
        'FLOTILA': '#ffc300',
        'BANKA': '#38bdf8',
        'AUTOBAZAR': '#00f5d4',
        'MYČKA': '#06b6d4',
        'HR': '#ec4899',
        'ZÁMOŘÍ': '#3b82f6',
        'TICK': '#94a3b8',
        'SYSTÉM': '#a855f7'
    };
    const color = colors[tag] || '#00ff88';
    const timeStr = (typeof state !== 'undefined' && state.day !== undefined) ? `[D${state.day} ${String(state.hour||0).padStart(2,'0')}:${String(state.minute||0).padStart(2,'0')}]` : '[INIT]';
    if (extra !== null && extra !== undefined) {
        console.log(`%c[${tag}]%c ${timeStr} ${msg}`, `color:${color}; font-weight:bold; background:#0b1329; padding:2px 6px; border-radius:3px; border:1px solid ${color}44`, `color:#e2e8f0;`, extra);
    } else {
        console.log(`%c[${tag}]%c ${timeStr} ${msg}`, `color:${color}; font-weight:bold; background:#0b1329; padding:2px 6px; border-radius:3px; border:1px solid ${color}44`, `color:#e2e8f0;`);
    }
}
window.SysLog = SysLog;

/* ============================================================
   JIRSTAN LOGISTICS — V4.0 (GLOBAL EXPANSION)
   PŘIDÁNO: Lodě, Letadla, Nový kontinent, Přístavy, Letiště
   ============================================================ */

// 1. LOKACE A TYPY (UPRAVENO PRO GLOBAL V4.0)




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

const BUS_DB = [    {cat: 'bus', model: "Městský autobus", price: 4000000, spd: 0.9, capacity: 50, luxury: 1, img: 'bus_city.jpg'},
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

const cargoToLicenseMap = {};
Object.keys(CARGO_TYPES).forEach(lic => {
    if (lic !== 'none' && lic !== 'sea' && lic !== 'air') {
        CARGO_TYPES[lic].forEach(car => cargoToLicenseMap[car] = lic);
    }
});

const allLandCargoes = Object.keys(CARGO_TYPES)
    .filter(k => k !== 'sea' && k !== 'air')
    .flatMap(k => CARGO_TYPES[k]);

const mapBgImage = new Image();
mapBgImage.src = 'mapa_pozadi.jpg';
mapBgImage.onload = () => {
    if (document.getElementById('tab-dispatch').classList.contains('active')) {
        renderMap();
    }
};

let fuelHistory = [35.5, 35.8, 36.1, 35.9, 36.0, 35.5];

let mgTimer = 0, mgInterval = null, mgSpawnInterval = null, mgScore = 0;

function closeMinigame() {
    const m = document.getElementById('minigame-container');
    if (m) m.style.display = 'none';
    const field = document.getElementById('minigame-playfield');
    if (field) field.innerHTML = '';
    if (mgInterval) clearInterval(mgInterval);
    if (mgSpawnInterval) clearInterval(mgSpawnInterval);
    mgInterval = null;
    mgSpawnInterval = null;
}

function spawnBox() {
    const field = document.getElementById('minigame-playfield');
    if (!field) return;
    const box = document.createElement('div');
    const colors = ['red', 'blue', 'green'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const size = 40 + Math.floor(Math.random() * 30);
    const maxTop = field.clientHeight - size;
    const maxLeft = field.clientWidth - size;
    box.className = 'minigame-item';
    box.style.top = `${Math.max(0, Math.floor(Math.random() * maxTop))}px`;
    box.style.left = `${Math.max(0, Math.floor(Math.random() * maxLeft))}px`;
    box.style.width = `${size}px`;
    box.style.height = `${size}px`;
    box.style.background = col;
    box.style.borderRadius = '8px';
    box.style.cursor = 'pointer';
    box.style.boxShadow = `0 0 16px 2px ${col}`;
    box.onclick = function () { boxClicked(this, col); };
    field.appendChild(box);

    setTimeout(() => { if (box.parentNode) box.parentNode.removeChild(box); }, 2000);
}

function boxClicked(element, color) {
    if (!element || !element.parentElement) return;
    mgScore++;
    const scoreEl = document.getElementById('mg-score');
    if (scoreEl) scoreEl.innerText = mgScore;

    if (color === 'red') { addMoney(1000); } else if (color === 'blue') { addMoney(500); } else if (color === 'green') { addMoney(200); }

    element.classList.add('box-pop');
    setTimeout(() => { if (element.parentNode) element.parentNode.removeChild(element); }, 180);
}

function mgTick() {
    mgTimer -= 1;
    const timeEl = document.getElementById('mg-time');
    if (timeEl) timeEl.innerText = mgTimer;
    if (mgTimer <= 0) {
        endMinigame();
    }
}

function startMinigame() {
    if (state.minigamePlayedToday) {
        return notify('MINIGAME', 'Minigame již dnes byl hraný. Vrať se zítra.', 'warning');
    }
    if (mgInterval || mgSpawnInterval) closeMinigame();

    mgTimer = 15;
    mgScore = 0;
    const m = document.getElementById('minigame-container');
    if (!m) return;
    m.style.display = 'flex';
    const scoreEl = document.getElementById('mg-score'); if (scoreEl) scoreEl.innerText = mgScore;
    const timeEl = document.getElementById('mg-time'); if (timeEl) timeEl.innerText = mgTimer;

    mgInterval = setInterval(mgTick, 1000);
    mgSpawnInterval = setInterval(spawnBox, 800);
}

function endMinigame(skip) {
    if (skip === true) {
        mgTimer = 0;
        mgTick();
        return;
    }
    if (mgInterval) clearInterval(mgInterval);
    if (mgSpawnInterval) clearInterval(mgSpawnInterval);
    mgInterval = null;
    mgSpawnInterval = null;

    if (mgScore >= 15) {
        state.economyBuff = 24;
        state.minigamePlayedToday = true;
        notify('VÝHRA!', 'Firma má +20% boost na 24h!', 'success');
    } else {
        notify('PROHRA', `Minigame skončila s ${mgScore} body. Potřebuješ 15+ pro buff.`, 'warning');
    }
    closeMinigame();
    saveGame();
    renderAll();
}

const defaultState = {
    version: "V4.0", money: 250000, debt: 0, day: 1, hour: 8, minute: 0, reputation: 100, bankDeposit: 0,
    fuelPrice: 35.50, fuelTank: 0, fuelHedge: null, weather: 'sun', auctionFilter: 'all',
    contracts: [], availableContracts: [], termDeposits: [],
    factions: { nexus: 0, stavba: 0, fresh: 0 },
    staff: { dispatcher: {active: false, days: 0, level: 1, xp: 0, skills: {}}, mechanic: {active: false, days: 0, level: 1, xp: 0, skills: {}}, accountant: {active: false, days: 0, level: 1, xp: 0, skills: {}, lastAudit: 0} },
    vehicles: [ {id: 1, type: 'van', model: 'Fiat Ducato', driverId: 1, loc: 'Zájezd', job: null, queue: [], progress: 0, cond: 60, fuel: 100, spd: 1.4, upgrades: [], trailer: null, cleanliness: 80, wear: 50} ],
    drivers: [ 
        {id: 1, name: "Stanislav Starosta", level: 1, xp: 0, req: 100, skills: {spd: 0}, energy: 100, tacho: 0, restUntil: 0, lic: [], bio: "Zakladatel", trait: 'iron', deliveries: 0, morale: 90},
        {id: 2, name: "Jiří Čečák", level: 50, xp: 0, req: 9999, skills: {spd: 5}, energy: 100, tacho: 0, restUntil: 0, lic: ['adr','frigo','heavy','express','leky','ceniny','stehovani','sypky','wood','cars'], bio: "Spoluzakladatel, CTO", trait: 'racer', deliveries: 0, morale: 90},
        {id: 3, name: "Karel N.", level: 10, xp: 0, req: 1000, skills: {spd: 1}, energy: 100, tacho: 0, restUntil: 0, lic: ['stehovani','sypky','wood'], bio: "Zkušený mazák", trait: 'normal', deliveries: 0, morale: 80},
        {id: 4, name: "Čenda", level: 5, xp: 0, req: 500, skills: {spd: 0}, energy: 100, tacho: 0, restUntil: 0, lic: [], bio: "Mladé ucho", trait: 'eco', deliveries: 0, morale: 75}
    ],
    // NOVÉ POLE PRO V4.0
    ships: [], planes: [],
    // NOVÉ POLE PRO AUTOBUSY A IPO
    buses: [], busRoutes: [], vipTours: [],
    ipo: { active: false, sharesOwned: 100 },
    // NOVÁ AUTOMYČKA
    carwash: { level: 1, autoWashStaff: false, incomeMultiplier: 1.0, waxActivated: false, waxUntil: 0, publicAccess: false, recycleWater: false },
    trailers: [], machines: [], offers: [], tempOfferIdx: null, garageCapacity: 5, hq: {garage: 0, office: 0, workshop: 0, logistics_center: 0, fuel_depot: 0, relax_zone: 0, port_hub: 0, airport_hangar: 0, bus_terminal: 0},
    competitors: { fastex: {power: 1.2, reputation: 80, boughtOut: false}, greenroad: {power: .9, reputation: 60, boughtOut: false}, atlas: {power: 1.1, reputation: 90, boughtOut: false}, premium: {power: 1.3, reputation: 120, boughtOut: false}, jirstan: {power: 5.0, reputation: 150, boughtOut: false} },
    activeChallenges: [], 
    stats: {totalEarned: 0, totalSpent: 0, deliveries: 0, distance: 0, fuelUsed: 0, loansTaken: 0, routes: {}, events: 0, trainings: 0, contractsDone: 0, maxMoney: 0, nightDeliveries: 0, challengesWon: 0}, 
    tech: [], researching: null, achievements: [], currentSaveSlot: 1,
    market: { conservative: {price: 100, history: [100]}, stock: {price: 500, history: [500]}, crypto: {price: 50, history: [50]}, realestate: {price: 1000, history: [1000]}, techstocks: {price: 200, history: [200]} },
    investments: { conservative: 0, stock: 0, crypto: 0, realestate: 0, techstocks: 0 },
    usedCars: [],
    bazaarMarket: [],
    bazaarInventory: [],
    warehouse: { level: 1, capacity: 500, stock: { electronics: 0, food: 0, parts: 0, fresh_food: 0 }, cold_storage: 0, b2bContracts: [] },
    marketPrices: { electronics: 1000, food: 200, parts: 500, fresh_food: 300 },
    marketHistory: { electronics: [1000], food: [200], parts: [500], fresh_food: [300] },
    economyBuff: 0,
    minigamePlayedToday: false,
    insurance: { active: false, days: 0 },
    gasNetwork: { level: 0, hasDiner: false, hasShop: false, hasBistro: false },
    tower: { floors: [] },
    synergyBonus: { active: false, endDay: 0, multiplier: 1.0 },
    planeBonus: { active: false, endDay: 0, multiplier: 1.0 },
    fuelDiscount: { active: false, endDay: 0, discount: 0.0 },
    shipPenalty: { active: false, endDay: 0, multiplier: 1.0 },
    weatherPenalty: { active: false, endDay: 0, multiplier: 1.0 },
    insurancePenalty: { active: false, endDay: 0, multiplier: 1.0 },
    jirstanPressure: { eventType: null, daysLeft: 0, targetCity: null, originalFuelPrice: null },
    jirstanJointVenture: false,
    loans: { overdraft: 0, dev: [], shark: null },
    marketingCampaigns: { paper: 0, radio: 0, tv: 0 }
};
let state = JSON.parse(JSON.stringify(defaultState));

// --- INICIALIZACE ---
function init() {
    try {
        console.log("JIRSTAN: Inicializace hry spuštěna...");
        loadGame();
        console.log("JIRSTAN: Načtení z localStorage úspěšné. Stav:", state);
        
        if (state.offers.length < 5) genOffers(true);
        if (state.availableContracts.length === 0) genContracts();
        
        state.vehicles.forEach(v => { if(!v.queue) v.queue = []; });
        if (!state.usedCars || state.usedCars.length === 0) genUsedCars(); 
        if (!state.bazaarMarket || state.bazaarMarket.length === 0) generateBazaarMarket();
        
        // Zajištění kompatibility pro V4.0 při načtení starého savu
        if(!state.ships) state.ships = [];
        if(!state.planes) state.planes = [];
        if(state.hq.port_hub === undefined) state.hq.port_hub = 0;
        if(state.hq.airport_hangar === undefined) state.hq.airport_hangar = 0;
        if(state.garageCapacity === undefined) state.garageCapacity = 5 + (state.hq.garage || 0) * 2;

        renderAll();
        if (window.gameInterval) clearInterval(window.gameInterval);
        window.gameInterval = setInterval(tick, 3000);
        setTimeout(fixMapSize, 500);
        window.addEventListener('resize', fixMapSize);
        
        try {
            initMegaHqVisualizer();
        } catch(vErr) {
            console.error("JIRSTAN: Chyba při startu Mega-Centrály:", vErr);
        }
        console.log("JIRSTAN: Inicializace úspěšně dokončena!");
    } catch(err) {
        console.error("JIRSTAN: ZÁVAŽNÁ CHYBA PŘI INICIALIZACI HRY:", err);
        alert("Chyba při startu hry: " + err.message + "\nViz detaily v konzoli vývojáře (F12).");
    }
}


function deepMerge(target, source) {
    for (const key in source) {
        if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            deepMerge(target[key], source[key]);
        } else {
            if (source[key] !== undefined && source[key] !== null) {
                target[key] = source[key];
            }
        }
    }
    return target;
}

function loadGame() {
    let s = localStorage.getItem("jirstan_beta_v1_slot1") || localStorage.getItem("jirstan_save");
    if (!s) {
        if (!state.financeHistory) {
            state.financeHistory = {
                money: [state.money],
                crypto: [state.investments.crypto || 0],
                day: [state.day]
            };
        }
        if (!state.warehouseHistory) {
            let totalStock = (state.warehouse.stock.electronics || 0) + (state.warehouse.stock.food || 0) + (state.warehouse.stock.parts || 0) + (state.warehouse.stock.fresh_food || 0);
            state.warehouseHistory = {
                capacity: [state.warehouse.capacity],
                stock: [totalStock],
                day: [state.day]
            };
        }
        return;
    }
    let ld;
    try {
        // Sanitize mojibake patterns from old browser saves using pure ASCII escape sequences
        s = s.replace(/K\u00C4\u0164|K\u00C4\u010D|K\u010D/g, "K\u010D")
             .replace(/\u0102\u013A\u017Asp\u00C4\u00E2\u20AC\u015Bch|\u00C4\u0103\u0161sp\u00C4\u203Ach|\u00FAsp\u011Bch/g, "\u00FAsp\u011Bch")
             .replace(/\u0102\u013A\u017Arove\u00C4\u0105\u00CB\u02C6|\u00FArove\u0148/g, "\u00FArove\u0148")
             .replace(/\u00C4\u0105\u00E2\u201E\u00A2idi\u00C4\u0164|\u0159idi\u010D/g, "\u0159idi\u010D")
             .replace(/V\u0102\u013A\u0161STAVBA|V\u00C3\u0165STAVBA|V\u00DDSTAVBA/g, "V\u00DDSTAVBA")
             .replace(/v\u0102\u00CB\u0165stavba|v\u00C3\u00BDstavba|v\u00FDstavba/g, "v\u00FDstavba")
             .replace(/CENTR\u0102 LA|CENTR\u00C3 LA|CENTR\u00C1LA/g, "CENTR\u00C1LA")
             .replace(/\u00C4\u0105\u00C2\u00A0KOLEN\u0102\u013A\u0164|\u0160KOLEN\u00CD/g, "\u0160KOLEN\u00CD")
             .replace(/ZAM\u00C4\u013A\u0161ENO|ZAM\u00C4\u015AENO|ZAM\u010CENO/g, "ZAM\u010CENO")
             .replace(/ODEM\u00C4\u013A\u0161ENO|ODEM\u00C4\u015AENO|ODEM\u010CENO/g, "ODEM\u010CENO");
        ld = JSON.parse(s);
        if (!ld || !ld.version) { localStorage.clear(); state = JSON.parse(JSON.stringify(defaultState)); return; }
        
        if(ld.investments && typeof ld.investments.conservative === 'number' && !ld.market) {
            ld.market = JSON.parse(JSON.stringify(defaultState.market));
            ld.investments.conservative = ld.investments.conservative / 100;
            ld.investments.stock = ld.investments.stock / 500;
            ld.investments.crypto = ld.investments.crypto / 50;
        }
        
        state = JSON.parse(JSON.stringify(defaultState));
        deepMerge(state, ld);
        state.version = "V4.0";
    } catch(e) {
        console.error("Chyba načítání:", e);
        return;
    }
    state.trailers = state.trailers || []; state.machines = state.machines || [];
    
    if (state.bankDeposit === undefined) state.bankDeposit = 0;
    if (!state.market.realestate) state.market.realestate = JSON.parse(JSON.stringify(defaultState.market.realestate));
    if (!state.market.techstocks) state.market.techstocks = JSON.parse(JSON.stringify(defaultState.market.techstocks));
    if (state.investments.realestate === undefined) state.investments.realestate = 0;
    if (state.investments.techstocks === undefined) state.investments.techstocks = 0;
    if (!state.competitors) {
        state.competitors = JSON.parse(JSON.stringify(defaultState.competitors));
    } else {
        // Vyčistit neexistující konkurenty z uložení a doplnit chybějící
        for (let key in state.competitors) {
            if (!COMPETITORS_DB.some(x => x.id === key)) {
                delete state.competitors[key];
            }
        }
        COMPETITORS_DB.forEach(dbComp => {
            if (!state.competitors[dbComp.id]) {
                state.competitors[dbComp.id] = { power: dbComp.power, reputation: 100, boughtOut: false };
            }
        });
    }
    if (state.hq.relax_zone === undefined) state.hq.relax_zone = 0;
    if (!state.factions) state.factions = { nexus: 0, stavba: 0, fresh: 0 };
    
    if (!state.usedCars) state.usedCars = [];
    if (!state.bazaarMarket) state.bazaarMarket = [];
    if (!state.bazaarInventory) state.bazaarInventory = [];
    if (!state.warehouse) state.warehouse = { level: 1, capacity: 500, stock: { electronics: 0, food: 0, parts: 0, fresh_food: 0 }, cold_storage: 0, b2bContracts: [] };
    if (!state.warehouse.stock) state.warehouse.stock = { electronics: 0, food: 0, parts: 0, fresh_food: 0 };
    if (state.warehouse.stock.fresh_food === undefined) state.warehouse.stock.fresh_food = 0;
    if (state.warehouse.cold_storage === undefined) state.warehouse.cold_storage = 0;
    if (!state.warehouse.b2bContracts) state.warehouse.b2bContracts = [];
    if (!state.marketPrices) state.marketPrices = { electronics: 1000, food: 200, parts: 500, fresh_food: 300 };
    if (state.marketPrices.fresh_food === undefined) state.marketPrices.fresh_food = 300;
    if (!state.marketHistory) state.marketHistory = { electronics: [state.marketPrices?.electronics || 1000], food: [state.marketPrices?.food || 200], parts: [state.marketPrices?.parts || 500], fresh_food: [state.marketPrices?.fresh_food || 300] };
    if (!state.marketHistory.electronics) state.marketHistory.electronics = [state.marketPrices?.electronics || 1000];
    if (!state.marketHistory.food) state.marketHistory.food = [state.marketPrices?.food || 200];
    if (!state.marketHistory.parts) state.marketHistory.parts = [state.marketPrices?.parts || 500];
    if (!state.marketHistory.fresh_food) state.marketHistory.fresh_food = [state.marketPrices?.fresh_food || 300];
    if (state.carwash === undefined) state.carwash = { level: 1, autoWashStaff: false, incomeMultiplier: 1.0, waxActivated: false, waxUntil: 0, publicAccess: false, recycleWater: false };
    if (state.carwash.publicAccess === undefined) state.carwash.publicAccess = false;
    if (state.carwash.recycleWater === undefined) state.carwash.recycleWater = false;
    if (state.economyBuff === undefined || state.economyBuff === null) state.economyBuff = 0;
    if (state.minigamePlayedToday === undefined || state.minigamePlayedToday === null) state.minigamePlayedToday = false;
    if (!state.insurance) state.insurance = { active: false, days: 0 };

    // Add backward compatibility for Gas Network (NEW)
    state.gasNetwork = ld.gasNetwork || JSON.parse(JSON.stringify(defaultState.gasNetwork));
    if (state.gasNetwork.hasBistro === undefined) state.gasNetwork.hasBistro = false;

    // Backward compatibility for Bus & IPO features
    state.buses = ld.buses || [];
    // Ensure all buses have new properties for management depth
    state.buses.forEach(bus => {
        if (bus.cleanliness === undefined) bus.cleanliness = 100;
        if (bus.upgrades === undefined) bus.upgrades = {};
    });
    state.busRoutes = ld.busRoutes || [];
    state.vipTours = ld.vipTours || [];
    state.ipo = ld.ipo || { active: false, sharesOwned: 100 };
    if (state.hq.bus_terminal === undefined) state.hq.bus_terminal = 0;

    if (!state.ships) state.ships = [];
    if (!state.planes) state.planes = [];
    if (!state.termDeposits) state.termDeposits = [];
    if (state.hq.port_hub === undefined) state.hq.port_hub = 0;
    if (state.hq.airport_hangar === undefined) state.hq.airport_hangar = 0;
    
    // FIX: Sanitize machines array to prevent errors from old/corrupt saves
    if (state.machines) {
        state.machines = state.machines.filter(m => m && m.id && m.n);
    }

    // Migration for V4.0 ships/planes missing the 'type' property from 'cat'
    if (state.ships) state.ships.forEach(s => { if (!s.type && s.cat) s.type = s.cat; });
    if (state.planes) state.planes.forEach(p => { if (!p.type && p.cat) p.type = p.cat; });
    
    // NOVÁ V4.0 AUTOMYČKA — Bezpečná inicializace
    if (!state.carwash) {
        state.carwash = { level: 1, autoWashStaff: false, incomeMultiplier: 1.0, waxActivated: false, waxUntil: 0 };
    } else {
        // Ověření, že všechny properties existují
        if (state.carwash.level === undefined) state.carwash.level = 1;
        if (state.carwash.autoWashStaff === undefined) state.carwash.autoWashStaff = false;
        if (state.carwash.incomeMultiplier === undefined) state.carwash.incomeMultiplier = 1.0;
        if (state.carwash.waxActivated === undefined) state.carwash.waxActivated = false;
        if (state.carwash.waxUntil === undefined) state.carwash.waxUntil = 0;
    }

    // Zajistění, aby všechna vozidla měla cleanliness
    state.vehicles.forEach(v => {
        if (v.cleanliness === undefined) v.cleanliness = 100;
        if (v.wear === undefined) v.wear = 0;
        if (v.isBroken === undefined) v.isBroken = false;
    });
    state.ships.forEach(s => {
        if (s.cleanliness === undefined) s.cleanliness = 100;
        if (s.wear === undefined) s.wear = 0;
        if (s.isBroken === undefined) s.isBroken = false;
    });
    state.planes.forEach(p => {
        if (p.cleanliness === undefined) p.cleanliness = 100;
        if (p.wear === undefined) p.wear = 0;
        if (p.isBroken === undefined) p.isBroken = false;
    });
    
    // Zamezení NaN chyb u investic z historických verzí uložení
    ['conservative', 'stock', 'crypto', 'realestate', 'techstocks'].forEach(k => {
        if (isNaN(state.investments[k]) || state.investments[k] === undefined) {
            state.investments[k] = 0;
        }
    });

    // INTERMODALNÍ SYNERGIE: Inicializace synergického bonusu
    if (!state.synergyBonus) state.synergyBonus = { active: false, endDay: 0, multiplier: 1.0 };
    if (!state.warehouse.shipCargo) state.warehouse.shipCargo = [];
    if (!state.tower) state.tower = { floors: [] };
    if (!state.tower.floors) state.tower.floors = [];
    if (!state.tower.levels) state.tower.levels = {};
    if (state.tower.happiness === undefined) state.tower.happiness = 80;
    if (state.tower.energy === undefined) state.tower.energy = 80;

    // DENNÍ UDÁLOSTI: Inicializace efektů
    if (!state.planeBonus) state.planeBonus = { active: false, endDay: 0, multiplier: 1.0 };
    if (!state.fuelDiscount) state.fuelDiscount = { active: false, endDay: 0, discount: 0.0 };
    if (!state.shipPenalty) state.shipPenalty = { active: false, endDay: 0, multiplier: 1.0 };
    if (!state.roadPenalty) state.roadPenalty = { active: false, endDay: 0, costIncrease: 0.0 };
    if (!state.weatherPenalty) state.weatherPenalty = { active: false, endDay: 0, multiplier: 1.0 };
    if (!state.insurancePenalty) state.insurancePenalty = { active: false, endDay: 0, multiplier: 1.0 };
    
    // Initialize history arrays if missing
    if (!state.financeHistory) {
        state.financeHistory = {
            money: [state.money],
            crypto: [state.investments.crypto || 0],
            day: [state.day]
        };
    }
    if (!state.warehouseHistory) {
        let totalStock = (state.warehouse.stock.electronics || 0) + (state.warehouse.stock.food || 0) + (state.warehouse.stock.parts || 0) + (state.warehouse.stock.fresh_food || 0);
        state.warehouseHistory = {
            capacity: [state.warehouse.capacity],
            stock: [totalStock],
            day: [state.day]
        };
    }
    state.jirstanPressure = state.jirstanPressure || { eventType: null, daysLeft: 0, targetCity: null, originalFuelPrice: null };
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    state.marketingCampaigns = state.marketingCampaigns || { paper: 0, radio: 0, tv: 0 };
}
function saveGame() { 
    localStorage.setItem(`jirstan_beta_v1_slot${state.currentSaveSlot}`, JSON.stringify(state)); 
    
    let sb = window.supabaseClient || window.supabase;
    if (sb && typeof sb.from === 'function') {
        try {
            sb.from('jirstan_saves')
                .upsert({ 
                    slot: state.currentSaveSlot, 
                    money: state.money, 
                    debt: state.debt, 
                    day: state.day, 
                    state_json: state 
                }, { onConflict: 'slot' })
                .then(res => {
                    if (res && res.error) console.warn("Supabase Save Warn:", res.error);
                });
        } catch (e) {
            console.warn("Supabase exception:", e);
        }
    }
}

function renderAll() {
    updateUI(); renderStats(); renderOverview(); renderDispatch(); renderFleet(); renderTrailers(); 
    renderMachines(); renderAuction(); renderContracts(); renderWorkshop(); renderDealer(); renderHQ();
    renderTech(); renderAchievements(); renderHR(); renderStaffHire(); renderCompetition();
    renderBuses(); renderCarwash(); renderChallenges(); renderBank(); renderInvestments(); updateFuelUI(); drawFuelChart(); drawMarketChart();
    renderFactions(); renderInsurance(); renderOverseas(); renderGasNetwork(); renderBazaar(); renderTower(); renderWarehouse(); renderMultiplayer();
}
function renderBank() { renderInsurance(); }

function renderInsurance() {
    const el = document.getElementById('insurance-status');
    if(!el) return;
    if(state.insurance.active) {
        el.innerHTML = `<div style="background:rgba(0,212,255,0.1); border-left:4px solid var(--blue); padding:10px; border-radius:6px; color:white; font-size:13px"><b style="color:var(--blue)">✅ POJIŠTĚNÍ AKTIVNÍ</b><br>Kryje 80% všech pokut a oprav na cestách.<br><span style="color:var(--orange); font-size:12px; margin-top:4px; display:inline-block">Platnost zbývá: ${state.insurance.days} dní</span></div>`;
    } else {
        el.innerHTML = `<div style="background:rgba(255,42,85,0.1); border-left:4px solid var(--red); padding:10px; border-radius:6px; color:white; font-size:13px"><b style="color:var(--red)">❌ FLOTILA NENÍ POJIŠTĚNA</b><br>Veškeré defekty a pokuty platíš v plné výši.</div>`;
    }
}
function buyInsurance() {
    if (state.money >= 150000) {
        addMoney(-150000);
        state.insurance.active = true;
        state.insurance.days += 7;
        notify("POJIŠŤOVNA", "Flotila pojištěna na 7 dní!", "info");
        renderInsurance();
        saveGame();
    } else notify("CHYBA", "Nemáš peníze na zaplacení pojištění.", "warning");
}

function updateBankThreatVisuals() {
    let bankTabEl = document.getElementById('tab-bank');
    if (bankTabEl) {
        if (state.loans && state.loans.shark) {
            bankTabEl.classList.add('usurer-threat-active');
        } else {
            bankTabEl.classList.remove('usurer-threat-active');
        }
    }
}

function updateUI() {
    document.getElementById('ui-money').innerText = Math.floor(state.money || 0).toLocaleString();
    if(document.getElementById('bank-debt')) document.getElementById('bank-debt').innerText = (state.debt || 0).toLocaleString();
    if(document.getElementById('bank-deposit-val')) document.getElementById('bank-deposit-val').innerText = Math.floor(state.bankDeposit || 0).toLocaleString();
    document.getElementById('ui-rep').innerText = state.reputation || 100;
    
    let repVal = state.reputation || 100;
    if(document.getElementById('ui-rep2')) document.getElementById('ui-rep2').innerText = repVal;
    if(document.getElementById('ui-rep-bar')) {
        let pct = (repVal / 150) * 100;
        document.getElementById('ui-rep-bar').style.width = `${pct}%`;
        let barColor = repVal >= 100 ? 'linear-gradient(90deg, #b5179e, #ff0055)' : 'linear-gradient(90deg, #7209b7, #b5179e)';
        document.getElementById('ui-rep-bar').style.background = barColor;
    }
    
    if(document.getElementById('pr-active-campaigns')) {
        let activeHTML = '';
        let campaignKeys = { paper: { n: 'Lokální tisk', color: 'var(--green)' }, radio: { n: 'Rádio kampaň', color: 'var(--blue)' }, tv: { n: 'TV kampaň', color: 'var(--purple)' } };
        
        Object.keys(campaignKeys).forEach(k => {
            let days = state.marketingCampaigns && state.marketingCampaigns[k] ? state.marketingCampaigns[k] : 0;
            if (days > 0) {
                activeHTML += `
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; background:rgba(255,255,255,0.05); padding:4px 8px; border-radius:4px; border-left:3px solid ${campaignKeys[k].color}; font-size:11px;">
                        <span>${campaignKeys[k].n}</span>
                        <b style="color:${campaignKeys[k].color}">Aktivní (${days} dní)</b>
                    </div>
                `;
            }
        });
        
        if (!activeHTML) {
            activeHTML = '<div style="text-align:center; font-style:italic; font-size:11px; color:#555;">Žádné aktivní kampaně (Decay zvýšený)</div>';
        }
        document.getElementById('pr-active-campaigns').innerHTML = activeHTML;
    }
    
    updateBankThreatVisuals();
    
    document.getElementById('ui-fuel-price').innerText = Number(state.fuelPrice || 35.5).toFixed(2);
    
    const s = state.staff;
    if(document.getElementById('st-disp')) document.getElementById('st-disp').innerHTML = s.dispatcher.active ? `<span style="color:var(--green)">L${s.dispatcher.level} (${s.dispatcher.days}d)</span>` : '<span style="color:var(--red)">NEAKTIVNÍ</span>';
    if(document.getElementById('st-mech')) document.getElementById('st-mech').innerHTML = s.mechanic.active ? `<span style="color:var(--green)">L${s.mechanic.level} (${s.mechanic.days}d)</span>` : '<span style="color:var(--red)">NEAKTIVNÍ</span>';
    if(document.getElementById('st-kat')) document.getElementById('st-kat').innerHTML = s.accountant.active ? `<span style="color:var(--pink)">L${s.accountant.level} (${s.accountant.days}d)</span>` : '<span style="color:var(--red)">NEAKTIVNÍ</span>';

    const bmBtn = document.getElementById('filter-bm-btn');
    if(bmBtn) {
        if(state.tech.includes('darkweb')) bmBtn.style.display = 'block';
        else bmBtn.style.display = 'none';
    }
    
    if (typeof renderTermDeposits === 'function') renderTermDeposits();
    
    // Update credit limit values in Bank Tab
    if (typeof getCompanyValue === 'function') {
        let compVal = getCompanyValue();
        let maxLimit = compVal * 0.5;
        let availLimit = Math.max(0, maxLimit - (state.debt || 0));
        
        if (document.getElementById('bank-company-value')) document.getElementById('bank-company-value').innerText = Math.floor(compVal).toLocaleString();
        if (document.getElementById('bank-max-credit')) document.getElementById('bank-max-credit').innerText = Math.floor(maxLimit).toLocaleString();
        if (document.getElementById('bank-avail-credit')) document.getElementById('bank-avail-credit').innerText = Math.floor(availLimit).toLocaleString();
    }
    
    // Manage Jirstan Economic Pressure Alert Banner
    const prBanner = document.getElementById('jirstan-pressure-banner');
    if (prBanner) {
        if (state.jirstanPressure && state.jirstanPressure.daysLeft > 0) {
            prBanner.style.display = 'flex';
            let desc = '';
            if (state.jirstanPressure.eventType === 'dumping') {
                desc = `Jirstan nasadil dumpingové ceny v oblasti: <b>${state.jirstanPressure.targetCity}</b>. Odměny za zakázky z/do této oblasti jsou sníženy o 40%!`;
            } else if (state.jirstanPressure.eventType === 'fuel_monopoly') {
                desc = `Jirstan skoupil palivové rezervy! Globální cena nafty je uměle navýšena a zmrazena na <b>45.00 Kč/l</b>!`;
            } else if (state.jirstanPressure.eventType === 'pr_sabotage') {
                desc = `Jirstan spustil diskreditační kampaň! Naše denní ztráta reputace (PR Decay) je dvojnásobná!`;
            }
            document.getElementById('jirstan-pressure-desc').innerHTML = desc;
            document.getElementById('jirstan-pressure-timer').innerText = `ZBYVÁ: ${state.jirstanPressure.daysLeft} D${state.jirstanPressure.daysLeft === 1 ? 'EN' : state.jirstanPressure.daysLeft < 5 ? 'NY' : 'NÍ'}`;
        } else {
            prBanner.style.display = 'none';
        }
    }
}

function gainDispatcherXP(amount) {
    if(!state.staff.dispatcher.active) return;
    state.staff.dispatcher.xp += amount;
    
    let reqXp = state.staff.dispatcher.level * 100;
    if(state.staff.dispatcher.xp >= reqXp) {
        state.staff.dispatcher.xp -= reqXp;
        state.staff.dispatcher.level++;
        pushToTicker(`<b>PERSONÁL:</b> Dispečer Jirka postoupil na Level ${state.staff.dispatcher.level}! Bude nacházet lepší zakázky častěji.`, "success");
        updateUI();
    }
}

function createTermDeposit() {
    let amount = parseInt(document.getElementById('term-amount').value);
    let days = parseInt(document.getElementById('term-days').value);
    
    if(isNaN(amount) || amount <= 0 || amount > state.money) {
        notify("CHYBA", "Neplatná částka nebo nedostatek hotovosti pro vklad.", "danger");
        return;
    }
    
    let rate = days === 3 ? 1.015 : (days === 7 ? 1.04 : 1.10);
    addMoney(-amount);
    
    state.termDeposits.push({ 
        id: Math.random().toString(36).substr(2, 5),
        amount: amount, 
        daysLeft: days, 
        rate: rate, 
        initialAmount: amount 
    });
    
    pushToTicker(`<b>BANKA:</b> Hotovost ${amount.toLocaleString()} Kč uzamčena na ${days} dní.`, "success");
    renderTermDeposits();
    saveGame();
}

function renderTermDeposits() {
    const list = document.getElementById('term-list');
    if(!list) return;
    if(!state.termDeposits || state.termDeposits.length === 0) {
        list.innerHTML = `<div style="color:#555; font-size:12px; font-style:italic">Nemáš žádné aktivní vklady.</div>`;
        return;
    }
    list.innerHTML = state.termDeposits.map(d => {
        let expected = Math.floor(d.initialAmount * d.rate);
        return `<div style="background:rgba(0,255,136,0.1); border:1px solid var(--teal); padding:10px; margin-top:10px; border-radius:6px; font-size:13px;">
            <div style="display:flex; justify-content:space-between">
                <b>Vklad: ${d.initialAmount.toLocaleString()} Kč</b>
                <span style="color:var(--green)">Výnos: ${expected.toLocaleString()} Kč</span>
            </div>
            <div style="color:var(--text-muted); margin-top:5px;">Zbývá: <b style="color:white">${d.daysLeft} dní</b></div>
        </div>`;
    }).join('');
}

function renderStats() {
    if(!document.getElementById('stat-total-earned')) return;
    document.getElementById('stat-total-earned').innerText = Math.floor(state.stats.totalEarned).toLocaleString() + ' Kč';
    document.getElementById('stat-deliveries').innerText = state.stats.deliveries;
    document.getElementById('stat-distance').innerText = Math.floor(state.stats.distance) + ' km';
    document.getElementById('stat-fuel-used').innerText = Math.floor(state.stats.fuelUsed) + ' l';
    document.getElementById('stat-events').innerText = state.stats.events;
    document.getElementById('stat-trainings').innerText = state.stats.trainings;
    document.getElementById('stat-contracts-done').innerText = state.stats.contractsDone;
    document.getElementById('stat-max-money').innerText = Math.floor(state.stats.maxMoney).toLocaleString() + ' Kč';
    drawFinanceChart();
}

function renderStaffHire() {
    const el = document.getElementById('staff-hire-grid');
    if(!el) return;
    el.innerHTML = Object.keys(STAFF_DEFS).map(k => {
        const s = STAFF_DEFS[k]; const st = state.staff[k];
        if(st.active) {
            const skHtml = s.skills.map(sk => {
                const has = st.skills[sk.id];
                return `<div class="skill-btn ${has?'sk-owned':''}" ${has?'':`onclick="learnStaffSkill('${k}', '${sk.id}', ${sk.cost})"`}>
                    <span class="sk-name">${sk.n}</span><span class="sk-cost">${has ? '✅ AKTIVNÍ' : sk.cost.toLocaleString() + ' Kč'}</span>
                </div>`;
            }).join('');
            
            const extCost = s.cost / 2;
            const extHtml = `<div style="display:flex; justify-content:space-between; align-items:center; margin: 12px 0; padding: 12px; background: rgba(0,0,0,0.5); border: 1px solid var(--border-light); border-radius: 8px;">
                <div><div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; letter-spacing:1px">Smlouva zbývá</div><b style="color:${st.days < 3 ? 'var(--red)' : 'var(--green)'}; font-size:16px">${st.days} dní</b></div>
                <button class="btn btn-sm btn-orange" style="margin:0" onclick="extendStaff('${k}', 7, ${extCost})">PRODLOUŽIT (+7D / ${extCost.toLocaleString()})</button>
            </div>`;

            return `<div class="card staff-card" style="border-left:4px solid var(--orange)"><img src="${s.img}" class="staff-img" onerror="this.src=DEFAULT_SILHOUETTE">
                <div class="staff-content"><h3 style="margin:0; color:var(--orange)">${s.n} <span style="color:var(--green); float:right; font-size:14px; background:rgba(0,242,96,0.1); padding:4px 10px; border-radius:12px">Level ${st.level}</span></h3>
                    ${extHtml}
                    ${k === 'accountant' ? `<div style="display:flex;gap:8px; margin-bottom:8px"><button class="btn btn-pink btn-sm" onclick="runAudit()">🔎 PROVÉST AUDIT</button><button class="btn btn-orange btn-sm" onclick="buyChocolate()">🍫 KOUPIT ČOKOLÁDU (5k)</button></div>` : ''}
                    <div style="margin-top:auto"><div style="font-size:11px; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:1px">Speciální dovednosti:</div><div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">${skHtml}</div></div>
                </div></div>`;
        } else {
            return `<div class="card staff-card" style="opacity:0.85; border:1px dashed var(--border-light)"><img src="${s.img}" class="staff-img" style="filter:grayscale(1)" onerror="this.src=DEFAULT_SILHOUETTE">
                <div class="staff-content" style="justify-content:center; text-align:center"><h3 style="margin:0; color:var(--text-muted)">${s.n}</h3><p style="font-size:13px; color:#888">${s.desc}</p>
                    <div style="background:rgba(0,0,0,0.5); border:1px solid var(--border-light); border-radius:8px; padding:15px; margin:15px 0"><div style="font-size:11px; color:#aaa; margin-bottom:6px">Nástupní bonus a smlouva na 7 dní</div><b style="color:var(--orange); font-size:24px; font-family:'Rajdhani'">${s.cost.toLocaleString()} Kč</b></div>
                    <button class="btn btn-green" onclick="hireStaff('${k}')">PODEPSAT SMLOUVU</button>
                </div></div>`;
        }
    }).join('');
}
function hireStaff(role) { const sDef = STAFF_DEFS[role]; if (state.money >= sDef.cost) { addMoney(-sDef.cost); state.staff[role].active = true; state.staff[role].days = 7; notify("HR", `${sDef.n} najat na 7 dní.`, "success"); renderStaffHire(); saveGame(); } else notify("CHYBA", "Nedostatek peněz", "warning"); }
function extendStaff(role, days, cost) { if (state.money >= cost) { addMoney(-cost); state.staff[role].days += days; notify("HR", `Smlouva prodloužena o ${days} dní.`, "success"); renderStaffHire(); saveGame(); } else notify("CHYBA", "Nemáš peníze na prodloužení!", "warning"); }
function learnStaffSkill(role, skillId, cost) { if (state.money >= cost) { addMoney(-cost); state.stats.totalSpent += cost; state.staff[role].skills[skillId] = true; notify("HR", `Dovednost naučena!`, "pink"); renderStaffHire(); saveGame(); } else notify("CHYBA", "Nemáš dost peněz!", "warning"); }
function runAudit() { if (!state.staff.accountant.active) return; const now = state.day * 1440 + state.hour * 60 + state.minute; if (now - (state.staff.accountant.lastAudit || 0) < 1440) { notify("AUDIT", "Audit lze provést 1x denně.", "warning"); return; } let pct = 0.03 + (state.staff.accountant.level * 0.005); if (state.staff.accountant.skills.audit) pct *= 2; let bonus = Math.floor(state.money * pct); addMoney(bonus); state.stats.totalEarned += bonus; state.staff.accountant.lastAudit = now; notify("AUDIT", `Nalezeno ${bonus.toLocaleString()} Kč!`, "gold"); state.staff.accountant.xp += 50; renderStaffHire(); }
function buyChocolate() { if (state.money >= 5000) { addMoney(-5000); notify("KATEŘINA", "Účetní je potěšena.", "pink"); } }

let leafletMap = null;
let vehicleMarkers = new Map();
let vehiclePolylines = new Map();
let vehicleLightCones = new Map();
let vipOfferMarkers = new Map();

function initMap() {
    if (leafletMap) return;
    const container = document.getElementById('gameMap');
    if (!container) return;
    
    const baseMaps = {
        "Satelitní mapa": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 18,
            attribution: 'Tiles &copy; Esri'
        }),
        "Standardní mapa": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 18,
            attribution: '&copy; CartoDB'
        })
    };
    
    leafletMap = L.map('gameMap', { zoomControl: true, layers: [baseMaps["Satelitní mapa"]] }).setView([50, 10], 4);
    L.control.layers(baseMaps).addTo(leafletMap);
    
    // Center to Europe Control
    L.Control.Europe = L.Control.extend({
        onAdd: function(map) {
            const btn = L.DomUtil.create('button', 'map-reset-btn');
            btn.innerHTML = '🌍 EVROPA';
            btn.style.marginRight = '5px';
            btn.onclick = () => map.setView([50, 10], 4);
            return btn;
        }
    });
    leafletMap.addControl(new L.Control.Europe({ position: 'topleft' }));
    
    // Center to America Control
    L.Control.America = L.Control.extend({
        onAdd: function(map) {
            const btn = L.DomUtil.create('button', 'map-reset-btn');
            btn.innerHTML = '🇺🇸 AMERIKA';
            btn.onclick = () => map.setView([38, -97], 4);
            return btn;
        }
    });
    leafletMap.addControl(new L.Control.America({ position: 'topleft' }));
    
    // Draw city markers once
    for (let cityName in CITIES) {
        const city = CITIES[cityName];
        if (!city.lat || !city.lng) continue;
        const badgeClass = city.isPort ? 'port' : (city.isAirport ? 'air' : '');
        const iconHtml = `<div class="city-node-badge ${badgeClass}">
                            <span class="city-dot"></span>
                            <span class="city-label">${cityName}</span>
                          </div>`;
        const icon = L.divIcon({ html: iconHtml, className: 'city-marker-icon', iconSize: [120, 30], iconAnchor: [60, 15] });
        L.marker([city.lat, city.lng], { icon }).addTo(leafletMap);
    }
    
    // Draw Autodílna Zájezd checkpoint on the map
    const zajezdIconHtml = `<div class="city-node-badge" style="border: 2px solid var(--purple); background:rgba(128,0,128,0.2)">
                              <span class="city-dot" style="background:var(--purple)"></span>
                              <span class="city-label" style="color:var(--purple); font-weight:bold">🔧 DÍLNA ZÁJEZD</span>
                            </div>`;
    const zajezdIcon = L.divIcon({ html: zajezdIconHtml, className: 'city-marker-icon', iconSize: [140, 30], iconAnchor: [70, 15] });
    L.marker([50.155, 14.162], { icon: zajezdIcon }).addTo(leafletMap).bindPopup("<b>Autodílna Zájezd</b><br>Zde se odtahují a servisují porouchané stroje.");
    
    // Initialize Weather Overlay Canvas
    setTimeout(initWeatherOverlay, 100);
}

let weatherParticles = [];
function initWeatherOverlay() {
    const canvas = document.getElementById('weatherCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -canvas.height;
            this.speed = 4 + Math.random() * 5;
            this.len = 5 + Math.random() * 10;
            this.size = 1 + Math.random() * 2;
            this.wind = -1 + Math.random() * 2;
        }
        update() {
            const w = state.weather || 'sun';
            if (w === 'rain') {
                this.y += this.speed * 1.5;
                this.x += this.wind + 1.2;
            } else if (w === 'snow') {
                this.y += this.speed * 0.45;
                this.x += Math.sin(this.y * 0.05) * 0.4 + this.wind;
            }
            if (this.y > canvas.height || this.x < 0 || this.x > canvas.width) {
                this.reset();
            }
        }
        draw() {
            const w = state.weather || 'sun';
            if (w === 'rain') {
                ctx.strokeStyle = 'rgba(174, 194, 224, 0.35)';
                ctx.lineWidth = this.size;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + 1.2, this.y + this.len);
                ctx.stroke();
            } else if (w === 'snow') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Generate particles
    weatherParticles = [];
    for (let i = 0; i < 150; i++) {
        weatherParticles.push(new Particle());
    }
    
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const w = state.weather || 'sun';
        if (w === 'sun' || w === 'storm') return;
        
        if (canvas.width === 0) resizeCanvas();
        
        weatherParticles.forEach(p => {
            p.update();
            p.draw();
        });
    }
    animate();
}

function fixMapSize() { 
    if (!leafletMap) {
        initMap();
    }
    if (leafletMap) {
        leafletMap.invalidateSize(); 
    }
}

function renderMap() { 
    if (!leafletMap) return;
    
    // Day/Night Map Toggle
    let isNight = state.hour >= 20 || state.hour < 6;
    let mapContainer = leafletMap.getContainer();
    if (mapContainer) {
        if (isNight) mapContainer.classList.add('map-night');
        else mapContainer.classList.remove('map-night');
    }
    
    let activeIds = new Set();
    let allActive = [];
    
    state.vehicles.forEach(v => { if(v.job) allActive.push({...v, vCat: 'truck'}) });
    if (state.ships) state.ships.forEach(s => { if(s.job) allActive.push({...s, vCat: 'ship'}) });
    if (state.planes) state.planes.forEach(p => { if(p.job) allActive.push({...p, vCat: 'plane'}) });

    allActive.forEach(v => {
        activeIds.add(v.id);
        let start = CITIES[v.loc] || CITIES['Praha'];
        let end = CITIES[v.job.dest];
        
        if (start && end && start.lat && end.lat) {
            let p = v.progress / 100;
            let lat = start.lat + (end.lat - start.lat) * p;
            let lng = start.lng + (end.lng - start.lng) * p;
            let emoji = v.vCat === 'plane' ? '✈️' : (v.vCat === 'ship' ? '🚢' : '🚛');
            let color = v.vCat === 'plane' ? '#00e5ff' : (v.vCat === 'ship' ? '#0072ff' : (v.job.isBlackMarket ? '#ff2a55' : (v.job.isVIP ? '#ffc300' : '#ff9d00')));

            if (vehicleMarkers.has(v.id)) {
                let marker = vehicleMarkers.get(v.id);
                marker.setLatLng([lat, lng]);
                marker.getPopup().setContent(`<b>${v.model}</b><br>Trasa: ${v.loc} → ${v.job.dest}<br>Pokrok: ${Math.floor(v.progress)}%`);
            } else {
                let iconHtml = `<div class="vehicle-marker">${emoji}</div>`;
                let icon = L.divIcon({ html: iconHtml, className: 'vehicle-icon-wrapper', iconSize: [24, 24], iconAnchor: [12, 12] });
                let marker = L.marker([lat, lng], { icon }).addTo(leafletMap);
                marker.bindPopup(`<b>${v.model}</b><br>Trasa: ${v.loc} → ${v.job.dest}<br>Pokrok: ${Math.floor(v.progress)}%`);
                vehicleMarkers.set(v.id, marker);

                let polyline = L.polyline([[start.lat, start.lng], [end.lat, end.lng]], {
                    color: color,
                    dashArray: v.vCat === 'plane' ? '2, 8' : '5, 5',
                    weight: v.job.isVIP ? 4 : (v.vCat === 'plane' ? 1.5 : 2)
                }).addTo(leafletMap);
                vehiclePolylines.set(v.id, polyline);
            }

            // NIGHT LIGHT CONES (HEADLIGHTS)
            if (isNight) {
                let dy = end.lat - start.lat;
                let dx = end.lng - start.lng;
                let angle = Math.atan2(dy, dx);
                let dist = v.vCat === 'plane' ? 0.9 : (v.vCat === 'ship' ? 0.6 : 0.3);
                let p1_lat = lat + dist * Math.sin(angle - 0.25);
                let p1_lng = lng + dist * Math.cos(angle - 0.25);
                let p2_lat = lat + dist * Math.sin(angle + 0.25);
                let p2_lng = lng + dist * Math.cos(angle + 0.25);

                if (vehicleLightCones.has(v.id)) {
                    let cone = vehicleLightCones.get(v.id);
                    cone.setLatLngs([[lat, lng], [p1_lat, p1_lng], [p2_lat, p2_lng]]);
                } else {
                    let cone = L.polygon([[lat, lng], [p1_lat, p1_lng], [p2_lat, p2_lng]], {
                        color: 'rgba(255, 235, 59, 0.3)',
                        fillColor: 'rgba(255, 235, 59, 0.25)',
                        fillOpacity: 0.25,
                        stroke: false
                    }).addTo(leafletMap);
                    vehicleLightCones.set(v.id, cone);
                }
            } else {
                if (vehicleLightCones.has(v.id)) {
                    leafletMap.removeLayer(vehicleLightCones.get(v.id));
                    vehicleLightCones.delete(v.id);
                }
            }
        }
    });

    // Remove inactive layers
    for (let id of vehicleMarkers.keys()) {
        if (!activeIds.has(id)) {
            leafletMap.removeLayer(vehicleMarkers.get(id));
            vehicleMarkers.delete(id);
            if (vehiclePolylines.has(id)) {
                leafletMap.removeLayer(vehiclePolylines.get(id));
                vehiclePolylines.delete(id);
            }
            if (vehicleLightCones.has(id)) {
                leafletMap.removeLayer(vehicleLightCones.get(id));
                vehicleLightCones.delete(id);
            }
        }
    }

    // DRAW AVAILABLE VIP OFFERS ON MAP (GOLD STAR ICON)
    let activeVipIds = new Set();
    state.offers.filter(o => o.isVIP).forEach(o => {
        let city = CITIES[o.dest];
        if (city && city.lat && city.lng) {
            activeVipIds.add(o.id);
            if (vipOfferMarkers.has(o.id)) {
                vipOfferMarkers.get(o.id).setLatLng([city.lat + 0.05, city.lng - 0.05]);
            } else {
                let iconHtml = `<div class="vip-map-marker" style="font-size:22px; filter:drop-shadow(0 0 5px gold); cursor:pointer; animation: pulse-glow-red 2s infinite;">⭐</div>`;
                let icon = L.divIcon({ html: iconHtml, className: 'vip-offer-wrapper', iconSize: [24, 24], iconAnchor: [12, 12] });
                let marker = L.marker([city.lat + 0.05, city.lng - 0.05], { icon }).addTo(leafletMap);
                marker.bindPopup(`
                    <div style="background:#0c0f1d; color:white; border:1px solid var(--gold); padding:8px; border-radius:6px; font-family:'Rajdhani';">
                        <b style="color:var(--gold); font-size:14px;">⭐ VIP NABÍDKA</b><br>
                        Kam: <b>${o.dest}</b><br>
                        Náklad: <b>${o.cargo}</b><br>
                        Odměna: <b style="color:var(--gold)">${o.pay.toLocaleString()} Kč</b><br>
                        Typ: ${o.type.toUpperCase()}<br>
                        <button class="btn btn-teal btn-sm" style="margin-top:8px; font-size:11px;" onclick="takeJobModal(${o.id})">PŘIJMOUT</button>
                    </div>
                `);
                vipOfferMarkers.set(o.id, marker);
            }
        }
    });

    // Remove inactive VIP markers
    for (let id of vipOfferMarkers.keys()) {
        if (!activeVipIds.has(id)) {
            leafletMap.removeLayer(vipOfferMarkers.get(id));
            vipOfferMarkers.delete(id);
        }
    }
}

let hqVisualizer = null;

class HQVisualizer {
    constructor() {
        this.canvas = document.getElementById('hqPixelCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        // Low resolution for blocky retro feel
        this.canvas.width = 400;
        this.canvas.height = 120;
        
        this.frame = 0;
        this.floatingTexts = [];
        this.lastMoney = state.money;
        
        // Character states
        this.kateSmile = 0;
        this.jirkaDrink = 0;
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        // Scale click coordinates to internal 400x120 space
        const x = (e.clientX - rect.left) / rect.width * this.canvas.width;
        const y = (e.clientY - rect.top) / rect.height * this.canvas.height;
        
        // Kateřina's desk is roughly at x: 35-75, y: 40-90
        if (x >= 35 && x <= 75 && y >= 40 && y <= 90) {
            this.kateSmile = 60; // Smile for 60 frames (1 second)
            if (state.money >= 5000) {
                addMoney(-5000);
                this.addFloatingText("+💖 Kateřina", x, y - 10, "#f72585");
                notify("KATEŘINA", "Účetní Kateřina má radost z čokolády!", "pink");
            } else {
                this.addFloatingText("Chybí peníze!", x, y - 10, "var(--red)");
            }
        }
        // Jirka's desk is at x: 90-130, y: 40-90
        else if (x >= 90 && x <= 130 && y >= 40 && y <= 90) {
            this.jirkaDrink = 60; // Drink animation
            if (state.money >= 5000) {
                addMoney(-5000);
                this.addFloatingText("☕ Káva", x, y - 10, "var(--blue)");
                if (state.staff.dispatcher.active) {
                    gainDispatcherXP(20);
                    notify("JIRKA", "Dispečer Jirka dostal čerstvou kávu! (+20 XP)", "success");
                } else {
                    notify("JIRKA", "Jirka dostal kávu, ale momentálně pro tebe nepracuje.", "warning");
                }
            } else {
                this.addFloatingText("Chybí peníze!", x, y - 10, "var(--red)");
            }
        }
    }
    
    addFloatingText(text, x, y, color) {
        this.floatingTexts.push({ text, x, y, color, life: 1.0 });
    }
    
    update() {
        this.frame++;
        
        // Check if money changed to spawn floating text
        if (Math.abs(state.money - this.lastMoney) > 1) {
            const diff = state.money - this.lastMoney;
            const text = (diff > 0 ? "+" : "") + Math.floor(diff).toLocaleString() + " Kč";
            const color = diff > 0 ? "var(--green)" : "var(--red)";
            this.addFloatingText(text, 150 + Math.random() * 40, 50, color);
            this.lastMoney = state.money;
        }
        
        // Update floating texts
        this.floatingTexts.forEach(t => {
            t.y -= 0.4;
            t.life -= 0.015;
        });
        this.floatingTexts = this.floatingTexts.filter(t => t.life > 0);
        
        if (this.kateSmile > 0) this.kateSmile--;
        if (this.jirkaDrink > 0) this.jirkaDrink--;
        
        this.draw();
    }
    
    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.fillStyle = '#060913';
        ctx.fillRect(0, 0, w, h);
        
        const floorY = 95;
        
        // Draw sky / cityscape outside building windows
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, w, floorY);
        
        // Cyberpunk city background (simple pixel skyline)
        ctx.fillStyle = '#0e1424';
        const skyline = [25, 45, 20, 35, 55, 30, 40, 15, 50, 20];
        for (let i = 0; i < skyline.length; i++) {
            ctx.fillRect(i * 45, floorY - skyline[i], 32, skyline[i]);
        }
        
        // Blinking windows on background buildings
        ctx.fillStyle = 'rgba(0, 212, 255, 0.4)';
        for (let i = 0; i < skyline.length; i++) {
            if (this.frame % 40 < 20 && i % 2 === 0) {
                ctx.fillRect(i * 45 + 6, floorY - skyline[i] + 6, 3, 3);
                ctx.fillRect(i * 45 + 16, floorY - skyline[i] + 16, 3, 3);
            }
        }
        
        // --- DRAW OFFICE ROOM (x: 10 to 160) ---
        const officeL = 10;
        const officeR = 160;
        const officeW = officeR - officeL;
        const ceilingY = 20;
        
        // Floor and walls
        ctx.fillStyle = '#1c2438'; // Office walls
        ctx.fillRect(officeL, ceilingY, officeW, floorY - ceilingY);
        ctx.fillStyle = '#2c3e50'; // Office carpet
        ctx.fillRect(officeL, floorY, officeW, 10);
        
        // Windows
        ctx.fillStyle = '#060913';
        ctx.fillRect(officeL + 15, ceilingY + 15, 35, 25);
        ctx.fillRect(officeL + 85, ceilingY + 15, 35, 25);
        
        // Posters / Decorations
        ctx.fillStyle = 'var(--orange)';
        ctx.fillRect(officeL + 65, ceilingY + 12, 10, 12);
        ctx.fillStyle = 'white'; ctx.font = '700 5px Inter';
        ctx.fillText("CEO", officeL + 67, ceilingY + 20);
        
        // CFO Desk (Kateřina, x: 45)
        ctx.fillStyle = '#8e44ad'; // Chair back
        ctx.fillRect(officeL + 35, floorY - 24, 6, 12);
        
        // Kateřina character (Pink hair blocky head)
        ctx.fillStyle = '#e0a899'; // Skin
        ctx.fillRect(officeL + 36, floorY - 30, 8, 8); // Head
        ctx.fillStyle = this.kateSmile > 0 ? '#ff2a55' : '#f72585'; // Hair becomes pinker when smiling
        ctx.fillRect(officeL + 34, floorY - 32, 12, 4); // Hair top
        ctx.fillRect(officeL + 34, floorY - 28, 3, 6); // Hair left side
        ctx.fillRect(officeL + 43, floorY - 28, 3, 6); // Hair right side
        
        // Body (Kateřina)
        ctx.fillStyle = this.kateSmile > 0 ? '#ff5e97' : '#2b6cb0'; // Pink dress when smiling, else blue
        ctx.fillRect(officeL + 37, floorY - 22, 7, 10);
        
        // Table
        ctx.fillStyle = '#653815'; // Table legs
        ctx.fillRect(officeL + 30, floorY - 14, 2, 14);
        ctx.fillRect(officeL + 63, floorY - 14, 2, 14);
        ctx.fillStyle = '#8c5225'; // Tabletop
        ctx.fillRect(officeL + 28, floorY - 16, 40, 4);
        
        // Computer on desk
        ctx.fillStyle = '#bdc3c7'; // Base
        ctx.fillRect(officeL + 48, floorY - 24, 10, 8);
        ctx.fillStyle = '#34495e'; // Screen
        ctx.fillRect(officeL + 49, floorY - 23, 8, 6);
        ctx.fillStyle = 'var(--pink)'; // Blinking screen light
        if (this.frame % 30 < 15) ctx.fillRect(officeL + 51, floorY - 21, 4, 3);
        
        // CFO Details (Folder)
        ctx.fillStyle = 'var(--gold)';
        ctx.fillRect(officeL + 31, floorY - 20, 4, 4);
        
        // Dispatcher Desk (Jirka, x: 105)
        ctx.fillStyle = '#2c3e50'; // Chair
        ctx.fillRect(officeL + 95, floorY - 24, 6, 12);
        
        // Jirka character
        ctx.fillStyle = '#e0a899'; // Skin
        ctx.fillRect(officeL + 96, floorY - 30, 8, 8);
        ctx.fillStyle = '#4e3629'; // Hair
        ctx.fillRect(officeL + 96, floorY - 32, 8, 3);
        ctx.fillStyle = this.jirkaDrink > 0 ? '#ff9d00' : '#00f260'; // Orange shirt when drinking
        ctx.fillRect(officeL + 97, floorY - 22, 7, 10);
        
        // Headset on Jirka
        ctx.fillStyle = 'white';
        ctx.fillRect(officeL + 95, floorY - 28, 1, 3); // Mic
        ctx.fillStyle = 'black';
        ctx.fillRect(officeL + 99, floorY - 31, 3, 1); // Headband
        
        // Jirka's Table
        ctx.fillStyle = '#653815';
        ctx.fillRect(officeL + 90, floorY - 14, 2, 14);
        ctx.fillRect(officeL + 123, floorY - 14, 2, 14);
        ctx.fillStyle = '#8c5225';
        ctx.fillRect(officeL + 88, floorY - 16, 40, 4);
        
        // Multi-monitor setup for dispatcher
        ctx.fillStyle = '#222';
        ctx.fillRect(officeL + 104, floorY - 25, 20, 9); // Monitor housing
        ctx.fillStyle = '#111';
        ctx.fillRect(officeL + 105, floorY - 24, 18, 7);
        ctx.fillStyle = 'rgba(0, 242, 96, 0.8)';
        ctx.fillRect(officeL + 107, floorY - 22, 6, 4);
        ctx.fillStyle = 'rgba(255, 42, 87, 0.8)';
        ctx.fillRect(officeL + 115, floorY - 21, 5, 2);
        
        // Coffee Cup Steam animation
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        const steamY = floorY - 18 - (this.frame % 10) * 0.5;
        ctx.fillRect(officeL + 120, steamY, 1, 2);
        ctx.fillStyle = '#fff';
        ctx.fillRect(officeL + 119, floorY - 18, 3, 2); // Mug
        
        // --- DRAW GARAGE ROOM (x: 170 to 390) ---
        const garL = 170;
        const garR = 390;
        const garW = garR - garL;
        
        ctx.fillStyle = '#222630';
        ctx.fillRect(garL, ceilingY, garW, floorY - ceilingY);
        ctx.fillStyle = '#171a21'; // Darker gaps
        ctx.fillRect(garL + 8, ceilingY + 5, garW - 16, floorY - ceilingY - 10);
        
        ctx.fillStyle = '#3a4150'; // Columns
        ctx.fillRect(garL, ceilingY, 8, floorY - ceilingY);
        ctx.fillRect(garR - 8, ceilingY, 8, floorY - ceilingY);
        
        // Stripe pattern on floor
        ctx.fillStyle = '#111';
        ctx.fillRect(garL, floorY, garW, 12);
        ctx.fillStyle = 'var(--orange)';
        for (let x = garL + 10; x < garR; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, floorY);
            ctx.lineTo(x + 5, floorY + 12);
            ctx.lineTo(x + 10, floorY + 12);
            ctx.lineTo(x + 5, floorY);
            ctx.closePath();
            ctx.fill();
        }
        
        // Dynamic Garages based on HQ Garage Upgrade
        const garageLvl = state.hq.garage || 1;
        const maxBays = Math.min(4, 1 + garageLvl);
        
        const bayW = 45;
        const startX = garL + 12;
        const gap = 6;
        
        for (let i = 0; i < maxBays; i++) {
            const bx = startX + i * (bayW + gap);
            
            // Draw garage bay frame
            ctx.fillStyle = '#444';
            ctx.fillRect(bx, ceilingY + 15, bayW, floorY - ceilingY - 15);
            ctx.fillStyle = '#0c0e14'; // Inside bay
            ctx.fillRect(bx + 2, ceilingY + 17, bayW - 4, floorY - ceilingY - 17);
            
            // Find an idle truck to render inside
            const idleTrucks = state.vehicles.filter(v => !v.job);
            const truck = idleTrucks[i];
            
            if (truck) {
const tx = bx + 5;
                const ty = floorY - 2;
                
                // Wheels
                ctx.fillStyle = '#111';
                ctx.beginPath(); ctx.arc(tx + 8, ty, 5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(tx + 24, ty, 5, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#7f8c8d'; // Hubcaps
                ctx.beginPath(); ctx.arc(tx + 8, ty, 2, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(tx + 24, ty, 2, 0, Math.PI*2); ctx.fill();
                
                // Cabin Color
                let cabColor = 'var(--blue)';
                if (truck.model.includes('Scania')) cabColor = 'var(--red)';
                else if (truck.model.includes('Volvo')) cabColor = 'var(--teal)';
                else if (truck.model.includes('MAN')) cabColor = 'var(--orange)';
                
                ctx.fillStyle = cabColor;
                ctx.fillRect(tx + 2, ty - 22, 10, 16); // Cabin top
                ctx.fillRect(tx, ty - 14, 18, 12);    // Cabin body
                
                // Windshield
                ctx.fillStyle = '#111';
                ctx.fillRect(tx + 11, ty - 20, 6, 5);
                ctx.fillStyle = 'rgba(255,255,255,0.4)'; // Glare
                ctx.fillRect(tx + 14, ty - 20, 2, 5);
                
                // Truck Body / Chassis back
                ctx.fillStyle = '#333';
                ctx.fillRect(tx + 18, ty - 10, 14, 6);
                
                // Trailer box
                if (truck.trailer) {
                    ctx.fillStyle = 'var(--gold)';
                    ctx.fillRect(tx + 18, ty - 24, 14, 18);
                    ctx.strokeStyle = '#95a5a6'; ctx.lineWidth = 1;
                    ctx.strokeRect(tx + 18, ty - 24, 14, 18);
                }
            } else {
                // Shutter door rolled up
                ctx.fillStyle = '#222';
                ctx.fillRect(bx + 2, ceilingY + 17, bayW - 4, 8);
                ctx.fillStyle = '#333';
                for (let y = ceilingY + 17; y < ceilingY + 25; y += 2) {
                    ctx.fillRect(bx + 2, y, bayW - 4, 1);
                }
            }
        }
        
        // Ceiling ambient occlusion shadow
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, 0, w, 10);
        
        // Render Floating texts
        ctx.font = '700 7px Rajdhani';
        ctx.textAlign = 'center';
        this.floatingTexts.forEach(t => {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillText(t.text, t.x + 0.5, t.y + 0.5);
            ctx.fillStyle = t.color;
            ctx.fillText(t.text, t.x, t.y);
        });
        ctx.textAlign = 'left';
    }
}


let towerVisualizer = null;
class TowerVisualizer {
    constructor() {}
    update() {}
    draw() {}
}
function initTowerVisualizer() {}

let megaHqVisualizer = null;

class MegaHqVisualizer {
    constructor() {
        this.canvas = document.getElementById('megaHqCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 240;
        this.canvas.height = 480;
        
        this.frame = 0;
        this.sparks = [];
        this.elevatorY = 430;
        this.elevatorTargetY = 430;
        
        this.kateSmile = 0;
        this.jirkaDrink = 0;
        
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }
    
    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * this.canvas.width;
        const y = (e.clientY - rect.top) / rect.height * this.canvas.height;
        
        if (y >= 410) {
            state.selectedHqFloor = 'garage_workshop';
        } else if (y >= 340 && y < 410) {
            state.selectedHqFloor = 'office';
            if (x >= 40 && x <= 70) {
                this.kateSmile = 60;
                if (state.money >= 5000) {
                    addMoney(-5000);
                    notify("KATEŘINA", "Účetní Kateřina dostala čokoládu!", "pink");
                }
            } else if (x >= 90 && x <= 120) {
                this.jirkaDrink = 60;
                buyCoffeeJirkaSilent();
            }
        } else if (y >= 60 && y < 340) {
            let idx = Math.floor((340 - y) / 35);
            if (idx >= 0 && idx < TOWER_FLOORS_DB.length) {
                let floor = TOWER_FLOORS_DB[idx];
                state.selectedHqFloor = 'tower_' + floor.id;
            }
        }
        
        renderHqFloorDetails();
        this.draw();
    }
    
    update() {
        if (!this.canvas || !this.ctx) return;
        this.frame++;
        this.draw();
    }
    
    draw() {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);
        
        let skyGrad = ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#010510');
        skyGrad.addColorStop(0.5, '#030c24');
        skyGrad.addColorStop(1, '#0a1738');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h);
        
        for (let i = 0; i < 20; i++) {
            let sx = (Math.sin(i * 432.12) * 0.5 + 0.5) * w;
            let sy = (Math.cos(i * 123.45) * 0.5 + 0.5) * (h - 40);
            let alpha = Math.abs(Math.sin((this.frame + i * 20) * 0.04));
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(sx, sy, 1.5, 1.5);
        }
        
        // 3. City Horizon Silhouettes
        ctx.fillStyle = '#060f24';
        for (let i = 0; i < 7; i++) {
            let bh = 30 + (Math.sin(i * 90) * 0.5 + 0.5) * 50;
            let bw = 35;
            let bx = i * 35 - 5;
            ctx.fillRect(bx, h - bh, bw, bh);
            // Draw window dots in buildings
            ctx.fillStyle = 'rgba(255, 255, 0, 0.15)';
            for (let wy = h - bh + 5; wy < h - 5; wy += 8) {
                for (let wx = bx + 4; wx < bx + bw - 4; wx += 6) {
                    if ((wx + wy + this.frame) % 18 < 15) {
                        ctx.fillRect(wx, wy, 2, 2);
                    }
                }
            }
            ctx.fillStyle = '#060f24';
        }
        
        // Ground line
        ctx.fillStyle = '#0a1a36';
        ctx.fillRect(0, h - 15, w, 15);
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(0, h - 15, w, 2);
        
        // 4. Jirstan Tower
        const towerX = w / 2 - 20; // Width of tower is 40
        const baseFloorY = h - 25; // Starts here
        const floorHeight = 35;
        
        // Base / Foundation
        ctx.fillStyle = '#09152b';
        ctx.fillRect(towerX - 10, baseFloorY, 60, 10);
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(towerX - 10, baseFloorY, 60, 10);
        ctx.fillStyle = '#00ff66';
        ctx.font = '700 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText("BASE HUB", w / 2, baseFloorY + 8);
        
        // Draw Unlocked Floors (ordered bottom-to-top)
        let currentHeightY = baseFloorY;
        TOWER_FLOORS_DB.forEach(floor => {
            if (state.tower.floors.includes(floor.id)) {
                currentHeightY -= floorHeight;
                this.drawFloorBlock(towerX, currentHeightY, floor, false);
            }
        });
        
        // Draw Construction floor (if active)
        let constructY = null;
        if (state.tower.underConstruction) {
            constructY = currentHeightY - floorHeight;
            let buildFloor = TOWER_FLOORS_DB.find(f => f.id === state.tower.underConstruction.floorId);
            if (buildFloor) {
                this.drawFloorBlock(towerX, constructY, buildFloor, true);
                currentHeightY = constructY; // Increase height
            }
        }
        
        // 5. Elevator Cab and shaft
        let maxTowerY = currentHeightY;
        if (constructY !== null) maxTowerY = constructY;
        
        if (this.frame % 300 === 0) {
            let possibleFloors = [baseFloorY];
            let tempY = baseFloorY;
            TOWER_FLOORS_DB.forEach(floor => {
                if (state.tower.floors.includes(floor.id)) {
                    tempY -= floorHeight;
                    possibleFloors.push(tempY);
                }
            });
            this.elevatorTargetY = possibleFloors[Math.floor(Math.random() * possibleFloors.length)] + 10;
        }
        
        let diff = this.elevatorTargetY - this.elevatorY;
        if (Math.abs(diff) > 1) {
            this.elevatorY += Math.sign(diff) * 1.5;
        } else {
            this.elevatorY = this.elevatorTargetY;
        }
        
        this.elevatorY = Math.max(maxTowerY + 10, Math.min(baseFloorY - 12, this.elevatorY));
        
        // Shaft lines
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(towerX + 45, baseFloorY);
        ctx.lineTo(towerX + 45, maxTowerY);
        ctx.stroke();
        
        // Elevator Cab
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(towerX + 43, this.elevatorY, 5, 8);
        ctx.fillStyle = 'rgba(0, 255, 102, 0.4)';
        ctx.fillRect(towerX + 44, this.elevatorY + 2, 3, 3);
        
        // 6. Construction Crane on top
        let craneY = currentHeightY - 20;
        ctx.strokeStyle = '#ff9d00';
        ctx.lineWidth = 2;
        
        // Crane Vertical Mast
        ctx.beginPath();
        ctx.moveTo(w / 2, currentHeightY);
        ctx.lineTo(w / 2, craneY);
        ctx.stroke();
        
        // Crane Arm Rotation swing
        let armLength = 40;
        let rotationAngle = Math.sin(this.frame * 0.02) * 0.4;
        let jibEndX = w / 2 + Math.cos(rotationAngle) * armLength;
        let jibEndY = craneY + Math.sin(rotationAngle) * armLength;
        
        ctx.strokeStyle = state.tower.underConstruction ? '#ff9d00' : '#888';
        ctx.beginPath();
        ctx.moveTo(w / 2 - 15, craneY - 3);
        ctx.lineTo(jibEndX, jibEndY);
        ctx.stroke();
        
        // Crane Counterweight
        ctx.beginPath();
        ctx.moveTo(w / 2, craneY);
        ctx.lineTo(w / 2 - 15, craneY - 3);
        ctx.stroke();
        
        // Crane Cable
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(jibEndX, jibEndY);
        ctx.lineTo(jibEndX, jibEndY + 15);
        ctx.stroke();
        
        // Hook / Cargo box
        ctx.fillStyle = state.tower.underConstruction ? '#ff9d00' : '#555';
        ctx.fillRect(jibEndX - 2, jibEndY + 15, 4, 4);
    }
    
    drawFloorBlock(x, y, floor, isBuilding) {
        const ctx = this.ctx;
        const w = 40;
        const h = 30;
        
        if (isBuilding) {
            // Scaffold frame
            ctx.fillStyle = 'rgba(255, 157, 0, 0.1)';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#ff9d00';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
            
            // Scaffolding diagonals
            ctx.strokeStyle = 'rgba(255, 157, 0, 0.3)';
            ctx.beginPath();
            ctx.moveTo(x, y); ctx.lineTo(x + w, y + h);
            ctx.moveTo(x + w, y); ctx.lineTo(x, y + h);
            ctx.stroke();
            
            ctx.fillStyle = '#ff9d00';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.floor(state.tower.underConstruction.progress)}%`, x + w / 2, y + h / 2 + 3);
            
            // Spark emission
            if (this.frame % 3 === 0) {
                let sx = x + Math.random() * w;
                let sy = y + Math.random() * h;
                for (let i = 0; i < 4; i++) {
                    this.sparks.push({
                        x: sx,
                        y: sy,
                        vx: (Math.random() - 0.5) * 3,
                        vy: (Math.random() - 1.2) * 2,
                        life: 12 + Math.random() * 8
                    });
                }
            }
            
            // Draw sparks
            this.sparks = this.sparks.filter(s => {
                s.x += s.vx;
                s.y += s.vy;
                s.vy += 0.08; // gravity
                s.life--;
                ctx.fillStyle = `rgba(255, 180, 0, ${s.life / 20})`;
                ctx.fillRect(s.x, s.y, 1.5, 1.5);
                return s.life > 0;
            });
            
        } else {
            // Unlocked floor
            ctx.fillStyle = '#06132b';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = '#00ff66';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, w, h);
            
            // Middle deck line
            ctx.strokeStyle = 'rgba(0, 255, 102, 0.3)';
            ctx.beginPath();
            ctx.moveTo(x, y + h / 2);
            ctx.lineTo(x + w, y + h / 2);
            ctx.stroke();
            
            // Glowing window animations
            ctx.fillStyle = '#00ff66';
            if (this.frame % 100 < 50) {
                ctx.fillRect(x + 5, y + 4, 4, 6);
                ctx.fillRect(x + 15, y + 4, 4, 6);
            } else {
                ctx.fillRect(x + 5, y + 4, 4, 6);
                ctx.fillRect(x + 31, y + 4, 4, 6);
            }
            if (this.frame % 80 < 40) {
                ctx.fillRect(x + 21, y + 18, 4, 6);
                ctx.fillRect(x + 31, y + 18, 4, 6);
            } else {
                ctx.fillRect(x + 5, y + 18, 4, 6);
                ctx.fillRect(x + 21, y + 18, 4, 6);
            }
            
            // Badge icon
            ctx.fillStyle = 'rgba(0, 255, 102, 0.15)';
            ctx.fillRect(x + w - 14, y + 2, 12, 10);
            ctx.fillStyle = '#00ff66';
            ctx.font = '7px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(floor.icon, x + w - 8, y + 9);
        }
    }
}

function initMegaHqVisualizer() {
    if (!megaHqVisualizer) {
        megaHqVisualizer = new MegaHqVisualizer();
    }
    
    function animLoop() {
        if (megaHqVisualizer && megaHqVisualizer.canvas && document.getElementById('tab-dispatch').classList.contains('active')) {
            megaHqVisualizer.update();
        }
        requestAnimationFrame(animLoop);
    }
    requestAnimationFrame(animLoop);
}

function buyCoffeeJirkaSilent() {
    if (state.money >= 5000) {
        addMoney(-5000);
        if (state.staff.dispatcher && state.staff.dispatcher.active) {
            state.staff.dispatcher.xp = (state.staff.dispatcher.xp || 0) + 20;
            notify("JIRKA", "Dispečer Jirka dostal čerstvou kávu! (+20 XP)", "success");
        } else {
            notify("JIRKA", "Jirka není najatý, ale káva provoněla prázdnou kancelář.", "info");
        }
        saveGame();
        renderStaffHire();
    } else {
        notify("CHYBA", "Nedostatek peněz na kávu!", "warning");
    }
}

function buyCoffeeJirka() {
    buyCoffeeJirkaSilent();
    if (megaHqVisualizer) {
        megaHqVisualizer.jirkaDrink = 60;
        megaHqVisualizer.draw();
    }
}

function buyHqUpgrade(id, cost) {
    upgradeHQ(id, cost);
    renderHqFloorDetails();
    if (megaHqVisualizer) megaHqVisualizer.draw();
}

function renderHqFloorDetails() {
    const el = document.getElementById('hq-floor-details');
    if (!el) return;
    
    let key = state.selectedHqFloor || 'office';
    
    if (key === 'garage_workshop') {
        let garageLvl = state.hq.garage || 1;
        let maxCars = state.garageCapacity || 5;
        let garageCost = Math.floor(50000 * Math.pow(1.5, maxCars - 5));
        
        let workshopLvl = state.hq.workshop || 0;
        let workshopUpgrade = HQ_DB.find(x => x.id === 'workshop');
        let workshopCost = workshopUpgrade.baseCost * (workshopLvl + 1);
        
        let fuelLvl = state.hq.fuel_depot || 0;
        let fuelUpgrade = HQ_DB.find(x => x.id === 'fuel_depot');
        let fuelCost = fuelUpgrade.baseCost * (fuelLvl + 1);
        let fuelCap = (fuelLvl + 1) * 20000;

        let portLvl = state.hq.port_hub || 0;
        let portUpgrade = HQ_DB.find(x => x.id === 'port_hub');
        let portCost = portUpgrade.baseCost * (portLvl + 1);

        let planeLvl = state.hq.airport_hangar || 0;
        let planeUpgrade = HQ_DB.find(x => x.id === 'airport_hangar');
        let planeCost = planeUpgrade.baseCost * (planeLvl + 1);

        let busLvl = state.hq.bus_terminal || 0;
        let busUpgrade = HQ_DB.find(x => x.id === 'bus_terminal');
        let busCost = busUpgrade.baseCost * (busLvl + 1);
        
        el.innerHTML = `
            <h3 style="color:var(--green); margin-top:0; font-size:16px;">🚛 GARÁŽ & DÍLNA</h3>
            <p style="font-size:11px; color:#aaa; margin-bottom:12px;">Spravuj garáže, servis a zámořské terminály.</p>
            
            <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; margin-bottom:12px; font-size:12px;">
                <div>Kapacita garáže: <b>${state.vehicles.length} / ${maxCars}</b> vozidel</div>
                <div>Kapacita nádrže: <b>${fuelCap.toLocaleString()} l</b></div>
                <div>Sleva na opravy: <b>${workshopLvl * 10}%</b></div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:8px;">
                <button class="btn btn-xs btn-green" onclick="buyGarageSlot()">
                    ➕ KOUPIT PARKOVACÍ MÍSTO (Stojí: ${garageCost.toLocaleString()} Kč)
                </button>
                <button class="btn btn-xs btn-purple" onclick="buyHqUpgrade('workshop', ${workshopCost})" ${workshopLvl >= 5 ? 'disabled' : ''}>
                    ⚙️ UPGRADE DÍLNA (Lvl ${workshopLvl+1}: ${workshopCost.toLocaleString()} Kč)
                </button>
                <button class="btn btn-xs btn-orange" onclick="buyHqUpgrade('fuel_depot', ${fuelCost})" ${fuelLvl >= 5 ? 'disabled' : ''}>
                    ⛽ UPGRADE NÁDRŽ (Lvl ${fuelLvl+1}: ${fuelCost.toLocaleString()} Kč)
                </button>
                <button class="btn btn-xs btn-blue" onclick="buyHqUpgrade('port_hub', ${portCost})" ${portLvl >= 5 ? 'disabled' : ''}>
                    🚢 DOKY (Lvl ${portLvl+1}: ${portCost.toLocaleString()} Kč)
                </button>
                <button class="btn btn-xs btn-teal" onclick="buyHqUpgrade('airport_hangar', ${planeCost})" ${planeLvl >= 5 ? 'disabled' : ''}>
                    🛫 HANGÁR (Lvl ${planeLvl+1}: ${planeCost.toLocaleString()} Kč)
                </button>
                <button class="btn btn-xs btn-dark" onclick="buyHqUpgrade('bus_terminal', ${busCost})" ${busLvl >= 5 ? 'disabled' : ''}>
                    🚌 BUS TERMINÁL (Lvl ${busLvl+1}: ${busCost.toLocaleString()} Kč)
                </button>
            </div>
        `;
    } 
    else if (key === 'office') {
        let officeLvl = state.hq.office || 0;
        let officeUpgrade = HQ_DB.find(x => x.id === 'office');
        let officeCost = officeUpgrade.baseCost * (officeLvl + 1);
        
        let logLvl = state.hq.logistics_center || 0;
        let logUpgrade = HQ_DB.find(x => x.id === 'logistics_center');
        let logCost = logUpgrade.baseCost * (logLvl + 1);
        
        let relaxLvl = state.hq.relax_zone || 0;
        let relaxUpgrade = HQ_DB.find(x => x.id === 'relax_zone');
        let relaxCost = relaxUpgrade.baseCost * (relaxLvl + 1);
        
        el.innerHTML = `
            <h3 style="color:var(--orange); margin-top:0; font-size:16px;">💼 KANCELÁŘ VEDENÍ</h3>
            <p style="font-size:11px; color:#aaa; margin-bottom:12px;">Zde pracují CEO Stanislav, Jiří a Kateřina.</p>
            
            <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; margin-bottom:12px; font-size:12px;">
                <div>Bonus k odměnám: <b>+${logLvl * 3}%</b></div>
                <div>Únava řidičů: <b>-${relaxLvl * 5}%</b></div>
                <div>Generování reputace: <b>${officeLvl >= 3 ? 'Aktivní' : 'Neaktivní'}</b></div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:8px;">
                <button class="btn btn-xs btn-orange" onclick="buyHqUpgrade('office', ${officeCost})" ${officeLvl >= 5 ? 'disabled' : ''}>
                    📋 UPGRADE KANCELÁŘ (Lvl ${officeLvl+1}: ${officeCost.toLocaleString()} Kč)
                </button>
                <button class="btn btn-xs btn-green" onclick="buyHqUpgrade('logistics_center', ${logCost})" ${logLvl >= 5 ? 'disabled' : ''}>
                    📦 LOGISTICKÉ CENTRUM (Lvl ${logLvl+1}: ${logCost.toLocaleString()} Kč)
                </button>
                <button class="btn btn-xs btn-blue" onclick="buyHqUpgrade('relax_zone', ${relaxCost})" ${relaxLvl >= 5 ? 'disabled' : ''}>
                    🌴 RELAX ZÓNA (Lvl ${relaxLvl+1}: ${relaxCost.toLocaleString()} Kč)
                </button>
                
                <h4 style="margin:10px 0 5px 0; font-size:11px; color:var(--pink)">MANAŽERSKÉ AKCE</h4>
                <button class="btn btn-xs btn-pink" onclick="buyChocolate()">🍫 ČOKOLÁDA PRO KATEŘINU (5k Kč)</button>
                <button class="btn btn-xs btn-pink" onclick="buyCoffeeJirka()">☕ KÁVA PRO JIŘÍHO (5k Kč)</button>
                <button class="btn btn-xs btn-green" onclick="runAudit()" ${state.staff.accountant.active ? '' : 'disabled'}>🔎 PROVÉST FINANČNÍ AUDIT</button>
            </div>
        `;
    }
    else if (key.startsWith('tower_')) {
        let floorId = parseInt(key.replace('tower_', ''));
        const floor = TOWER_FLOORS_DB.find(f => f.id === floorId);
        if (!floor) return;
        
        state.tower = state.tower || { floors: [], levels: {}, happiness: 80, energy: 80, underConstruction: null };
        state.tower.floors = state.tower.floors || [];
        state.tower.levels = state.tower.levels || {};
        
        const isUnlocked = state.tower.floors.includes(floor.id);
        const isLocked = floor.req && !state.tower.floors.includes(floor.req);
        const lvl = state.tower.levels[floor.id] || 1;
        const isBuilding = state.tower.underConstruction && state.tower.underConstruction.floorId === floor.id;
        const upgradeCost = floor.price * (lvl + 1) * 0.5;
        const canBuy = !isUnlocked && !isLocked && !state.tower.underConstruction && state.money >= floor.price;
        
        let actionBtn = '';
        if (isUnlocked) {
            if (state.tower.energy >= 10) {
                switch(floor.id) {
                    case 1: actionBtn = `<button class="btn btn-xs btn-green" onclick="useTowerFloor(${floor.id})">📡 Sledovat trasy (+${10 * lvl} XP)</button>`; break;
                    case 2: actionBtn = `<button class="btn btn-xs btn-green" onclick="useTowerFloor(${floor.id})">💰 Optimalizace (+${(2500 * lvl).toLocaleString()} Kč)</button>`; break;
                    case 3: actionBtn = `<button class="btn btn-xs btn-green" onclick="useTowerFloor(${floor.id})">🛠️ Servis motoru (+${1 * lvl}% kondice)</button>`; break;
                    case 4: actionBtn = `<button class="btn btn-xs btn-green" onclick="useTowerFloor(${floor.id})">☕ Uvařit kávu (+${5 * lvl} E řidičům)</button>`; break;
                    case 5: actionBtn = `<button class="btn btn-xs btn-green" onclick="useTowerFloor(${floor.id})">🍖 Catering (+${5 * lvl} morálka řidičů)</button>`; break;
                    case 6: actionBtn = `<button class="btn btn-xs btn-green" onclick="useTowerFloor(${floor.id})">💪 Posilovna (+${20 * lvl} XP řidiči)</button>`; break;
                    case 7: actionBtn = `<button class="btn btn-xs btn-green" onclick="useTowerFloor(${floor.id})">🛰️ Test sítí (+${1 * lvl} Reputace)</button>`; break;
                    case 8: actionBtn = `<button class="btn btn-xs btn-green" onclick="useTowerFloor(${floor.id})">💻 Simulátor (+${250 * lvl} výzkum)</button>`; break;
                }
            } else {
                actionBtn = `<span style="color:var(--red); font-size:11px;">Zaměstnanci jsou příliš unavení! Kup jim kávu v Kanceláři.</span>`;
            }
        }
        
        el.innerHTML = `
            <h3 style="color:var(--gold); margin-top:0; font-size:16px;">${floor.icon} ${floor.name.toUpperCase()}</h3>
            <p style="font-size:11px; color:#aaa; margin-bottom:12px;">Bonus: <b>${floor.desc}</b></p>
            
            ${isUnlocked ? `
                <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; margin-bottom:12px; font-size:12px;">
                    <div>Úroveň patra: <b>Level ${lvl}</b></div>
                    <div>Stat bonusu: <b>x${lvl} účinnost</b></div>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:8px;">
                    ${actionBtn}
                    ${lvl < 5 ? `<button class="btn btn-xs btn-orange" onclick="upgradeTowerFloor(${floor.id}, ${upgradeCost})">⚡ VYLEPŠIT PATRO (${upgradeCost.toLocaleString()} Kč)</button>` : '<span style="color:var(--gold); font-size:11px; font-weight:bold; text-align:center;">MAXIMÁLNÍ ÚROVEŇ (5)</span>'}
                </div>
            ` : isBuilding ? `
                <div style="background:rgba(255, 157, 0, 0.1); padding:10px; border-radius:6px; margin-bottom:12px; border:1px dashed #ff9d00; text-align:center;">
                    <span style="color:var(--gold); font-size:11px; font-weight:bold; animation:blink 1.5s infinite">🏗️ AKTIVNÍ VÝSTAVBA (${Math.floor(state.tower.underConstruction.progress)}%)</span>
                </div>
            ` : `
                <p style="font-size:12px; color:var(--red); margin:10px 0;">Patro je uzamčené.</p>
                <button class="btn btn-xs btn-gold" onclick="buyTowerFloor(${floor.id})" ${canBuy ? '' : 'disabled'}>
                    🏗️ KOUPIT PATRO (${floor.price.toLocaleString()} Kč)
                </button>
            `}
        `;
    }
}

function renderInvestments() {
    const list = document.getElementById('invest-list');
    if(!list) return;
    list.innerHTML = Object.keys(MARKET_DB).map(id => {
        const db = MARKET_DB[id]; const m = state.market[id]; const shares = state.investments[id] || 0;
        const val = shares * m.price;
        return `<div class="invest-card"><div><b style="color:${db.color}; font-size:15px">${db.n}</b><br><span style="font-size:12px; color:var(--text-muted)">Kurz: ${m.price.toFixed(2)} Kč / ks</span><br><span style="font-size:10px; color:#777;">Poplatek 2 % | Vliv poptávky aktivní</span></div>
            <div style="text-align:right"><div style="color:var(--text-main); font-weight:bold; font-size:16px">Hodnota: ${Math.floor(val || 0).toLocaleString()} Kč</div>
                <div style="font-size:11px; color:#888; margin-bottom:8px">Vlastníš: ${shares.toFixed(2)} ks</div>
                <div class="invest-actions">${id !== 'crypto' ? `<button class="btn btn-sm btn-dark" onclick="buyFund('${id}', 10000)">+10k</button><button class="btn btn-sm btn-dark" onclick="buyFund('${id}', 100000)">+100k</button>` : `<span style="font-size:10px; color:var(--gold); display:flex; align-items:center; margin-right:5px">Těží serverovna</span>`}<button class="btn btn-sm btn-red" onclick="sellFund('${id}')">PRODAT</button></div>
            </div></div>`;
    }).join('');
}
function buyFund(id, amount) { 
    if(id==='crypto')return; 
    if(state.money >= amount) { 
        let fee = Math.floor(amount * 0.02);
        let investAmount = amount - fee;
        
        addMoney(-amount); 
        
        let priceImpact = 1 + (amount / 10000000); 
        state.market[id].price *= priceImpact;
        
        state.investments[id] = (state.investments[id] || 0) + (investAmount / state.market[id].price); 
        notify("BURZA", `Nakoupeny podíly za ${amount.toLocaleString()} Kč. Poplatek 2 % (${fee.toLocaleString()} Kč) stržen. Poptávka zvýšila kurz o +${((priceImpact - 1) * 100).toFixed(2)} %.`, "success"); 
        renderInvestments(); saveGame(); 
    } else notify("CHYBA", "Nemáš dost peněz na investici!", "warning"); 
}
function sellFund(id) { 
    const shares = state.investments[id] || 0; 
    if(shares > 0) { 
        let rawVal = shares * state.market[id].price; 
        
        let priceImpact = 1 - (rawVal / 10000000);
        if (priceImpact < 0.5) priceImpact = 0.5; // Max propad 50% na jednu transakci
        state.market[id].price *= priceImpact;
        
        let finalVal = rawVal * priceImpact;
        let fee = Math.floor(finalVal * 0.02);
        let netVal = finalVal - fee;
        
        state.investments[id] = 0; 
        addMoney(netVal); 
        notify("PRODEJ", `Prodáno. Hrubá hodnota: ${Math.floor(rawVal).toLocaleString()} Kč. Zvýšená nabídka snížila kurz o -${((1 - priceImpact) * 100).toFixed(2)} %. Poplatek 2 % (${fee.toLocaleString()} Kč). Čistý příjem: +${Math.floor(netVal).toLocaleString()} Kč.`, "success"); 
        renderInvestments(); saveGame(); 
    } 
}
let chartFinance = null;
let chartFuel = null;
let chartWarehouse = null;
let chartMarket = null;

function initCharts() {
    // 1. Finance Chart (Stats tab)
    const financeCanvas = document.getElementById('finance-chart');
    if (financeCanvas && !chartFinance) {
        state.financeHistory = state.financeHistory || { money: [state.money], crypto: [state.investments.crypto || 0], day: [state.day] };
        chartFinance = new Chart(financeCanvas, {
            type: 'line',
            data: {
                labels: state.financeHistory.day.map(d => `Den ${d}`),
                datasets: [
                    {
                        label: 'Hotovost (Kč)',
                        data: state.financeHistory.money,
                        borderColor: '#00f260', // Neon green
                        backgroundColor: 'rgba(0, 242, 96, 0.05)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Kryptoměna (JirstanCoin)',
                        data: state.financeHistory.crypto,
                        borderColor: '#ffc300', // Neon gold
                        backgroundColor: 'rgba(255, 195, 0, 0.05)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#94a3b8', font: { family: 'Rajdhani', size: 12 } } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    y: {
                        position: 'left',
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#00f260' }
                    },
                    y1: {
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#ffc300' }
                    }
                }
            }
        });
    }

    // 2. Fuel Chart (Bank/Finance tab)
    const fuelCanvas = document.getElementById('fuel-chart');
    if (fuelCanvas && !chartFuel) {
        chartFuel = new Chart(fuelCanvas, {
            type: 'line',
            data: {
                labels: fuelHistory.map((_, i) => `${i + 1}`),
                datasets: [{
                    label: 'Cena nafty (Kč/l)',
                    data: fuelHistory,
                    borderColor: '#ff2a55', // Cyberpunk red/pink
                    backgroundColor: 'rgba(255, 42, 85, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { display: false } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#ff2a55' } }
                }
            }
        });
    }

    // 3. Warehouse Chart (Warehouse tab)
    const warehouseCanvas = document.getElementById('warehouse-chart');
    if (warehouseCanvas && !chartWarehouse) {
        state.warehouseHistory = state.warehouseHistory || { capacity: [state.warehouse.capacity], stock: [0], day: [state.day] };
        chartWarehouse = new Chart(warehouseCanvas, {
            type: 'line',
            data: {
                labels: state.warehouseHistory.day.map(d => `Den ${d}`),
                datasets: [
                    {
                        label: 'Celkové zásoby (ks)',
                        data: state.warehouseHistory.stock,
                        borderColor: '#ff9d00', // Neon orange
                        backgroundColor: 'rgba(255, 157, 0, 0.05)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Celková kapacita (ks)',
                        data: state.warehouseHistory.capacity,
                        borderColor: '#00d4ff', // Cyan
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#94a3b8', font: { family: 'Rajdhani', size: 12 } } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }

    // 4. Market Chart (Stock / IPO tab)
    const marketCanvas = document.getElementById('market-chart');
    if (marketCanvas && !chartMarket) {
        const datasets = Object.keys(MARKET_DB).map(id => {
            const m = state.market[id];
            const color = MARKET_DB[id].color;
            return {
                label: MARKET_DB[id].n || id.toUpperCase(),
                data: m.history,
                borderColor: color,
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4
            };
        });

        chartMarket = new Chart(marketCanvas, {
            type: 'line',
            data: {
                labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#94a3b8', font: { family: 'Rajdhani', size: 12 } } }
                },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } }
                }
            }
        });
    }
}

function drawMarketChart() {
    if (!chartMarket) {
        initCharts();
    } else {
        Object.keys(MARKET_DB).forEach((id, index) => {
            if (chartMarket.data.datasets[index]) {
                chartMarket.data.datasets[index].data = state.market[id].history;
            }
        });
        chartMarket.update();
    }
}

function drawFuelChart() {
    if (!chartFuel) {
        initCharts();
    } else {
        chartFuel.data.labels = fuelHistory.map((_, i) => `${i + 1}`);
        chartFuel.data.datasets[0].data = fuelHistory;
        chartFuel.update();
    }
}

function drawWarehouseChart() {
    if (!chartWarehouse) {
        initCharts();
    } else {
        state.warehouseHistory = state.warehouseHistory || { capacity: [state.warehouse.capacity], stock: [0], day: [state.day] };
        chartWarehouse.data.labels = state.warehouseHistory.day.map(d => `Den ${d}`);
        chartWarehouse.data.datasets[0].data = state.warehouseHistory.stock;
        chartWarehouse.data.datasets[1].data = state.warehouseHistory.capacity;
        chartWarehouse.update();
    }
}

function drawFinanceChart() {
    if (!chartFinance) {
        initCharts();
    } else {
        state.financeHistory = state.financeHistory || { money: [state.money], crypto: [state.investments.crypto || 0], day: [state.day] };
        chartFinance.data.labels = state.financeHistory.day.map(d => `Den ${d}`);
        chartFinance.data.datasets[0].data = state.financeHistory.money;
        chartFinance.data.datasets[1].data = state.financeHistory.crypto;
        chartFinance.update();
    }
}

function updateDebtSum() {
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    let devSum = 0;
    if (state.loans.dev) {
        state.loans.dev.forEach(l => devSum += l.amount);
    }
    let sharkSum = state.loans.shark ? state.loans.shark.amount : 0;
    state.debt = Math.floor(state.loans.overdraft + devSum + sharkSum);
}

function payLoan(amount) {
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    let totalPaid = 0;
    
    // Repay overdraft first
    if (state.loans.overdraft > 0) {
        let repayAmt = amount === 'all' ? state.loans.overdraft : Math.min(amount, state.loans.overdraft);
        if (state.money >= repayAmt) {
            state.loans.overdraft -= repayAmt;
            addMoney(-repayAmt);
            totalPaid += repayAmt;
            if (amount !== 'all') amount -= repayAmt;
        }
    }
    
    // Repay Usurer second
    if (state.loans.shark && (amount === 'all' || amount > 0)) {
        let repayAmt = amount === 'all' ? state.loans.shark.amount : Math.min(amount, state.loans.shark.amount);
        if (state.money >= repayAmt) {
            state.loans.shark.amount -= repayAmt;
            addMoney(-repayAmt);
            totalPaid += repayAmt;
            if (state.loans.shark.amount <= 0) state.loans.shark = null;
            if (amount !== 'all') amount -= repayAmt;
        }
    }
    
    // Repay Dev loans last
    if (state.loans.dev && state.loans.dev.length > 0 && (amount === 'all' || amount > 0)) {
        for (let i = state.loans.dev.length - 1; i >= 0; i--) {
            let loan = state.loans.dev[i];
            let repayAmt = amount === 'all' ? loan.amount : Math.min(amount, loan.amount);
            if (state.money >= repayAmt) {
                loan.amount -= repayAmt;
                addMoney(-repayAmt);
                totalPaid += repayAmt;
                if (loan.amount <= 0) {
                    state.loans.dev.splice(i, 1);
                }
                if (amount !== 'all') amount -= repayAmt;
                if (amount !== 'all' && amount <= 0) break;
            }
        }
    }
    
    updateDebtSum();
    updateUI();
    if (totalPaid > 0) {
        notify("SPLÁTKA", `Splatil jsi ${totalPaid.toLocaleString()} Kč ze svých úvěrů.`, "success");
        pushToTicker(`<b>BANKA:</b> Splaceno ${totalPaid.toLocaleString()} Kč ze zřízených úvěrů.`, "success");
    } else {
        notify("BANKA", "Nemáš žádné dluhy nebo nedostatek peněz k zaplacení.", "warning");
    }
}

// === KONTOKORENT MODAL & LOGIC ===
function openOverdraftModal() {
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    let compVal = getCompanyValue();
    let maxLimit = Math.floor(compVal * 0.20);
    let currentDrawn = state.loans.overdraft;
    let avail = Math.max(0, maxLimit - currentDrawn);
    
    showModal(`
        <h2>💳 KONTOKORENTNÍ REZERVA</h2>
        <p style="color:var(--text-muted)">Kontokorent je okamžitý finanční polštář s denním úročením 0.5%. Nemá fixní splátkový kalendář a lze jej čerpat i splácet kdykoliv.</p>
        <div style="background:rgba(0,0,0,0.4); padding:15px; border-radius:8px; border:1px solid var(--border-light); margin-bottom:20px">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px"><span>Maximální limit (20% firmy):</span><b style="color:white">${maxLimit.toLocaleString()} Kč</b></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px"><span>Aktuálně vyčerpáno:</span><b style="color:var(--red)">${currentDrawn.toLocaleString()} Kč</b></div>
            <div style="display:flex; justify-content:space-between"><span>Dostupná rezerva k čerpání:</span><b style="color:var(--green)">${avail.toLocaleString()} Kč</b></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px">
            <div>
                <label style="font-size:12px; color:var(--text-muted)">ČERPAT HOTOVOST (Kč):</label>
                <div style="display:flex; gap:8px; margin-top:5px">
                    <input type="number" id="od-draw-amt" class="form-input" style="background:rgba(0,0,0,0.5); border:1px solid var(--border-light); color:white; padding:8px; border-radius:4px; flex:1" placeholder="Částka...">
                    <button class="btn btn-orange btn-sm" style="margin:0; width:auto" onclick="drawOverdraft()">ČERPAT</button>
                </div>
            </div>
            <div>
                <label style="font-size:12px; color:var(--text-muted)">SPLATIT HOTOVOST (Kč):</label>
                <div style="display:flex; gap:8px; margin-top:5px">
                    <input type="number" id="od-repay-amt" class="form-input" style="background:rgba(0,0,0,0.5); border:1px solid var(--border-light); color:white; padding:8px; border-radius:4px; flex:1" placeholder="Částka...">
                    <button class="btn btn-green btn-sm" style="margin:0; width:auto" onclick="repayOverdraft()">SPLATIT</button>
                </div>
            </div>
        </div>
        <button class="btn btn-dark" style="margin-top:15px" onclick="closeModal()">ZAVŘÍT</button>
    `);
}

function drawOverdraft() {
    let amt = parseInt(document.getElementById('od-draw-amt').value);
    if (isNaN(amt) || amt <= 0) return notify("CHYBA", "Zadej platnou částku.", "warning");
    
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    let compVal = getCompanyValue();
    let maxLimit = Math.floor(compVal * 0.20);
    let currentDrawn = state.loans.overdraft;
    
    if (currentDrawn + amt > maxLimit) {
        return notify("LIMIT PŘEKROČEN", "Částka překračuje tvůj maximální limit kontokorentu.", "danger");
    }
    
    state.loans.overdraft += amt;
    addMoney(amt);
    updateDebtSum();
    updateUI();
    closeModal();
    notify("KONTOKORENT", `Vyčerpáno +${amt.toLocaleString()} Kč z rezervy.`, "success");
    pushToTicker(`<b>KONTOKORENT:</b> Čerpáno ${amt.toLocaleString()} Kč z rezervy.`, "info");
}

function repayOverdraft() {
    let amt = parseInt(document.getElementById('od-repay-amt').value);
    if (isNaN(amt) || amt <= 0) return notify("CHYBA", "Zadej platnou částku.", "warning");
    
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    let currentDrawn = state.loans.overdraft;
    
    let payAmt = Math.min(amt, currentDrawn);
    if (state.money < payAmt) return notify("NEDOSTATEK FINANCÍ", "Nemáš dostatek hotovosti na splacení této částky.", "danger");
    
    state.loans.overdraft -= payAmt;
    addMoney(-payAmt);
    updateDebtSum();
    updateUI();
    closeModal();
    notify("KONTOKORENT", `Splatil jsi ${payAmt.toLocaleString()} Kč z kontokorentu.`, "success");
    pushToTicker(`<b>KONTOKORENT:</b> Splaceno ${payAmt.toLocaleString()} Kč.`, "success");
}

// === ROZVOJOVÝ ÚVĚR MODAL & LOGIC ===
function openDevLoanModal() {
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    let compVal = getCompanyValue();
    let maxLimit = compVal * 0.5;
    let availLimit = Math.max(0, maxLimit - state.debt);
    
    // Get list of eligible vehicles (not already collateralized)
    let collateralizedIds = state.loans.dev.map(l => l.collateralVehicleId);
    let eligibleVehicles = state.vehicles.filter(v => !collateralizedIds.includes(v.id) && !v.job);
    
    let activeLoansHtml = '';
    if (state.loans.dev && state.loans.dev.length > 0) {
        activeLoansHtml = '<h3>AKTIVNÍ ROZVOJOVÉ ÚVĚRY</h3>';
        state.loans.dev.forEach(l => {
            activeLoansHtml += `
                <div style="background:rgba(0,212,255,0.05); border:1px solid var(--border-light); padding:12px; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center">
                    <div>
                        <div style="font-weight:bold; color:white">Zůstatek: ${Math.floor(l.amount).toLocaleString()} Kč</div>
                        <div style="font-size:11px; color:var(--text-muted)">Ručení: <b>${l.collateralVehicleModel}</b> | Splátka: ${l.dailyRepayment.toLocaleString()} Kč/den</div>
                    </div>
                    <div style="font-size:12px; background:var(--blue); color:black; padding:2px 8px; border-radius:4px; font-weight:bold">
                        Zbývá: ${l.daysRemaining} dní
                    </div>
                </div>
            `;
        });
    } else {
        activeLoansHtml = '<p style="color:var(--text-muted); font-size:13px">Nemáš žádné aktivní rozvojové úvěry.</p>';
    }
    
    let vehicleSelectHtml = eligibleVehicles.map(v => `<option value="${v.id}">${v.model} (${v.loc})</option>`).join('');
    if (!vehicleSelectHtml) {
        vehicleSelectHtml = '<option value="" disabled>Žádné dostupné volné vozidlo v dílně k ručení</option>';
    }
    
    showModal(`
        <h2>🏗️ ROZVOJOVÉ ÚVĚRY</h2>
        <p style="color:var(--text-muted)">Úvěry pro rozvoj flotily s nízkým úrokem. Vyžadují ručení konkrétním vozidlem. Splatnost je 10 dní, splátky se strhávají automaticky každý den. Při nedostatku peněz je ručené vozidlo okamžitě exekuováno!</p>
        
        <div class="grid" style="grid-template-columns:1.2fr 1fr; gap:20px; margin-bottom:15px">
            <div>
                ${activeLoansHtml}
            </div>
            <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid var(--border-light)">
                <h3 style="margin-top:0; color:var(--blue)">ZŘÍDIT NOVÝ ÚVĚR</h3>
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px">Volná bonita úvěrů: <b style="color:var(--green)">${availLimit.toLocaleString()} Kč</b></div>
                
                <div style="margin-bottom:10px">
                    <label style="font-size:11px; color:var(--text-muted)">ČÁSTKA ÚVĚRU (Kč):</label>
                    <input type="number" id="dev-loan-amt" class="form-input" style="background:rgba(0,0,0,0.5); border:1px solid var(--border-light); color:white; padding:8px; border-radius:4px; width:100%; margin-top:4px" placeholder="Zadej částku...">
                </div>
                
                <div style="margin-bottom:15px">
                    <label style="font-size:11px; color:var(--text-muted)">VYBRAT VOZIDLO JAKO RUČENÍ:</label>
                    <select id="dev-loan-vehicle" style="background:rgba(6,12,24,0.9); border:1px solid var(--border-light); color:white; padding:8px; border-radius:4px; width:100%; margin-top:4px">
                        ${vehicleSelectHtml}
                    </select>
                </div>
                
                <button class="btn btn-blue" onclick="createDevLoan()">ZŘÍDIT ÚVĚR</button>
            </div>
        </div>
        <button class="btn btn-dark" onclick="closeModal()">ZAVŘÍT</button>
    `);
}

function createDevLoan() {
    let amt = parseInt(document.getElementById('dev-loan-amt').value);
    let vid = document.getElementById('dev-loan-vehicle').value;
    
    if (isNaN(amt) || amt <= 0) return notify("CHYBA", "Zadej platnou částku.", "warning");
    if (!vid) return notify("CHYBA", "Musíš vybrat vozidlo k ručení.", "warning");
    
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    let compVal = getCompanyValue();
    let maxLimit = compVal * 0.5;
    let availLimit = Math.max(0, maxLimit - state.debt);
    
    if (amt > availLimit) return notify("BONITA ZAMÍTNUTA", "Částka překračuje tvůj volný úvěrový limit.", "danger");
    
    let v = state.vehicles.find(x => x.id === vid);
    if (!v) return notify("CHYBA", "Vozidlo nebylo nalezeno.", "danger");
    
    // Add loan
    state.loans.dev.push({
        id: Date.now(),
        amount: amt * 1.05, // 5% flat interest added
        initialAmount: amt * 1.05,
        collateralVehicleId: v.id,
        collateralVehicleModel: `${v.model} (${v.loc})`,
        daysRemaining: 10,
        dailyRepayment: Math.floor((amt * 1.05) / 10)
    });
    
    addMoney(amt);
    updateDebtSum();
    updateUI();
    closeModal();
    notify("ÚVĚR ZŘÍZEN", `Zřízen rozvojový úvěr s ručením ${v.model}. Získáno +${amt.toLocaleString()} Kč.`, "success");
    pushToTicker(`<b>BANKA:</b> Zřízen rozvojový úvěr s ručením ${v.model}.`, "success");
}

// === LICHVÁŘ MODAL & LOGIC ===
function openUsurerModal() {
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    let active = state.loans.shark;
    
    let innerHtml = '';
    if (active) {
        innerHtml = `
            <div style="background:rgba(255,42,85,0.05); border:1px solid var(--red); padding:20px; border-radius:8px; margin-bottom:20px">
                <h3 style="margin-top:0; color:var(--red)">AKTIVNÍ DLUH U LICHVÁŘE</h3>
                <div style="font-size:28px; font-weight:bold; color:white; margin-bottom:10px">${Math.floor(active.amount).toLocaleString()} Kč</div>
                <p>Do splacení zbývá: <b style="color:var(--orange)">${active.daysRemaining} dní</b></p>
                <div style="font-size:11px; color:var(--text-muted); margin-bottom:15px">Pokud neodevzdáš celou částku do vypršení lhůty, lichváři si naúčtují 50% tvé flotily!</div>
                
                <div style="display:flex; gap:8px">
                    <button class="btn btn-green" onclick="repayShark()">SPLACENÍ LICHVÁŘI (${Math.floor(active.amount).toLocaleString()} Kč)</button>
                </div>
            </div>
        `;
    } else {
        innerHtml = `
            <p style="color:var(--text-muted); font-size:13px">Lichvář ti půjčí okamžitě peníze bez ověřování bonity, ale s likvidačními podmínkami.</p>
            <div class="grid" style="grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px">
                <div style="background:rgba(255,42,85,0.03); border:1px solid rgba(255,42,85,0.1); padding:15px; border-radius:6px; text-align:center">
                    <h3 style="color:white; margin-top:0">PŮJČKA BRATŘÍ</h3>
                    <div style="font-size:24px; font-weight:bold; color:var(--red); margin-bottom:8px">1 000 000 Kč</div>
                    <div style="font-size:11px; color:var(--text-muted); margin-bottom:15px">Splatnost: 5 dní | Vrátit: 1.1M Kč + 2% denní úrok</div>
                    <button class="btn btn-red btn-sm" onclick="drawShark(1000000)">ČERPAT 1M</button>
                </div>
                <div style="background:rgba(255,42,85,0.03); border:1px solid rgba(255,42,85,0.1); padding:15px; border-radius:6px; text-align:center">
                    <h3 style="color:white; margin-top:0">LICHVA MAX</h3>
                    <div style="font-size:24px; font-weight:bold; color:var(--red); margin-bottom:8px">2 000 000 Kč</div>
                    <div style="font-size:11px; color:var(--text-muted); margin-bottom:15px">Splatnost: 5 dní | Vrátit: 2.2M Kč + 2% denní úrok</div>
                    <button class="btn btn-red btn-sm" onclick="drawShark(2000000)">ČERPAT 2M</button>
                </div>
            </div>
        `;
    }
    
    showModal(`
        <h2>☠️ LICHVÁŘ ("Temná ulička")</h2>
        ${innerHtml}
        <button class="btn btn-dark" onclick="closeModal()">ZAVŘÍT</button>
    `);
}

function drawShark(amount) {
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    if (state.loans.shark) return notify("CHYBA", "Už máš aktivní půjčku u lichváře.", "warning");
    
    state.loans.shark = {
        amount: amount * 1.10, // 10% flat fee added immediately
        daysRemaining: 5
    };
    
    addMoney(amount);
    updateDebtSum();
    updateUI();
    closeModal();
    notify("LICHVÁŘ", "Půjčil sis peníze od lichváře. Radši je včas vrať!", "danger");
    pushToTicker(`<b>LICHVÁŘ:</b> Načerpána krizová půjčka ${amount.toLocaleString()} Kč z temné uličky.`, "danger");
}

function repayShark() {
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    let active = state.loans.shark;
    if (!active) return;
    
    if (state.money >= active.amount) {
        addMoney(-active.amount);
        state.loans.shark = null;
        updateDebtSum();
        updateUI();
        closeModal();
        notify("DLUH SPLACEN", "Lichvářský dluh byl plně splacen!", "success");
        pushToTicker(`<b>LICHVÁŘ:</b> Dluh byl plně splacen a zlikvidován.`, "success");
    } else {
        notify("NEDOSTATEK FINANCÍ", "Nemáš dostatek hotovosti na splacení dluhu u lichváře.", "danger");
    }
}


function getCompanyValue() {
    let assets = 0;
    
    // 1. Vehicles
    if (state.vehicles) {
        state.vehicles.forEach(v => {
            let db = CAR_DB.find(x => x.model === v.model);
            assets += db ? db.price : 500000;
        });
    }
    if (state.ships) {
        state.ships.forEach(s => {
            let db = SHIP_DB.find(x => x.model === s.model);
            assets += db ? db.price : 25000000;
        });
    }
    if (state.planes) {
        state.planes.forEach(p => {
            let db = PLANE_DB.find(x => x.model === p.model);
            assets += db ? db.price : 75000000;
        });
    }
    if (state.buses) {
        state.buses.forEach(b => {
            let db = BUS_DB.find(x => x.model === b.model);
            assets += db ? db.price : 4000000;
        });
    }
    
    // 2. Trailers
    if (state.trailers) {
        state.trailers.forEach(t => {
            let db = TRAILERS_DB.find(x => x.id === t.id);
            assets += db ? db.price : 300000;
        });
    }
    
    // 3. HQ Buildings
    if (state.hq) {
        Object.keys(state.hq).forEach(k => {
            assets += (state.hq[k] || 0) * 1500000;
        });
    }
    
    // 4. Tower Floors
    if (state.tower && state.tower.floors) {
        state.tower.floors.forEach(fid => {
            let db = TOWER_FLOORS_DB.find(x => x.id === fid);
            assets += db ? db.price : 1000000;
        });
    }
    
    return assets;
}

function autoDispatch(absTime) {
    state.staff = state.staff || {};
    state.staff.dispatcher = state.staff.dispatcher || { active: false, level: 1, days: 0, skills: { negotiator: false, routing: false } };
    
    const dispatcherActive = state.staff.dispatcher.active;
    const dispatcherLevel = dispatcherActive ? (state.staff.dispatcher.level || 1) : 0;
    
    if (dispatcherLevel < 1) {
        return;
    }

    SysLog('DISPEČINK', `🔍 Automatický dispečink zahájen. Lvl: ${dispatcherLevel}, Čas: ${absTime} min.`);

    // 1. Ensure there are offers to choose from
    if (!state.offers || state.offers.length === 0) {
        genOffers(true);
        pushToTicker(`<b>DISPEČER:</b> Žádné nabídky, právě hledám nové zakázky...`, "info");
        SysLog('DISPEČINK', `Burza byla prázdná, vygenerováno ${state.offers.length} nových nabídek.`);
    } else if (state.offers.length < 5) {
        genOffers(true);
        SysLog('DISPEČINK', `Nízký počet nabídek, doplněno na ${state.offers.length}.`);
    }

    // 2. Find all vehicles that can accept more jobs
    const availableVehicles = state.vehicles.filter(v => {
        if (!v.driverId) {
            SysLog('DISPEČINK', `Vozidlo ${v.model} (${v.type}) nemá přiřazeného řidiče.`);
            return false;
        }
        const d = state.drivers.find(x => x.id == v.driverId);
        if (!d) {
            SysLog('DISPEČINK', `Vozidlo ${v.model}: řidič ID ${v.driverId} nenalezen.`);
            return false;
        }
        if (d.restUntil && d.restUntil > absTime) {
            const leftMin = d.restUntil - absTime;
            SysLog('DISPEČINK', `Vozidlo ${v.model}: řidič ${d.name} odpočívá (zbývá ${leftMin} min).`);
            return false;
        }
        if (d.energy < 20) {
            SysLog('DISPEČINK', `Vozidlo ${v.model}: řidič ${d.name} je vyčerpaný (${Math.floor(d.energy)}% energie < 20%).`);
            return false;
        }
        if (v.isBroken) {
            SysLog('DISPEČINK', `Vozidlo ${v.model} je porouchané.`);
            return false;
        }

        v.queue = v.queue || [];
        const maxJobs = 2 + Math.floor(dispatcherLevel / 2);
        const currentJobs = (v.job ? 1 : 0) + v.queue.length;
        if (currentJobs >= maxJobs) {
            SysLog('DISPEČINK', `Vozidlo ${v.model}: plná fronta (${currentJobs}/${maxJobs}).`);
            return false;
        }
        return true;
    });

    SysLog('DISPEČINK', `Dostupná vozidla pro dispečink: ${availableVehicles.length} / ${state.vehicles.length}.`);
    if (availableVehicles.length === 0) return;

    let assignedCount = 0;
    const sortedOffers = [...state.offers].sort((a, b) => (b.pay || 0) - (a.pay || 0));
    let offersToRemove = [];

    const filters = state.staff.dispatcher.filters || { minPay: 0, minPayPerKm: 0, allowBlackMarket: false };

    // 3. Iterate through offers and assign them
    for (const offer of sortedOffers) {
        if (offer.isBlackMarket && !filters.allowBlackMarket) continue;
        if (offer.pay < filters.minPay) continue;
        
        let dist = offer.dist || 100;
        let payPerKm = offer.pay / dist;
        if (payPerKm < filters.minPayPerKm) continue;

        const vehicle = availableVehicles.find(v => {
            if (v.newlyAssigned) return false;
            if (v.type !== offer.type) return false;
            const elig = getEligibility(v, offer);
            return elig.eligible;
        });

        if (vehicle) {
            vehicle.queue = vehicle.queue || [];
            if (!vehicle.job) {
                vehicle.job = offer;
                vehicle.progress = 0;
                notify("CHYTRÝ DISPEČINK", `${vehicle.model} automaticky vyslán do ${offer.dest}.`, "info");
                SysLog('DISPEČINK', `🚀 ${vehicle.model} [${vehicle.type}] vyslán do ${offer.dest} (Odměna: ${(offer.pay||0).toLocaleString()} Kč).`);
            } else {
                vehicle.queue.push(offer);
                notify("CHYTRÝ DISPEČINK", `Zakázka do ${offer.dest} přidána do fronty vozu ${vehicle.model}.`, "info");
                SysLog('DISPEČINK', `📑 Zakázka do ${offer.dest} přidána do fronty vozu ${vehicle.model}.`);
            }
            
            vehicle.newlyAssigned = true;
            offersToRemove.push(offer.id);
            assignedCount++;
        }
    }

    // 4. Clean up state
    state.vehicles.forEach(v => delete v.newlyAssigned);
    if (offersToRemove.length > 0) {
        state.offers = state.offers.filter(o => !offersToRemove.includes(o.id));
    }

    if (assignedCount > 0) {
        SysLog('DISPEČINK', `✅ Celkem úspěšně přiřazeno ${assignedCount} zakázek.`);
        if (document.getElementById('tab-overview').classList.contains('active')) renderOverview();
        if (document.getElementById('tab-dispatch').classList.contains('active')) renderDispatch();
        if (document.getElementById('tab-auction').classList.contains('active')) renderAuction();
        saveGame();
    }
}

// --- TICK & ČAS ---
function processMovement(v, type, w, absTime) {
    if (!v.job) return false;
    if (v.isBroken) return false;
    
    let speedBonus = 1;
    let fuelRate = 0;
    let condRate = 0.01;
    let wearRate = 0.05;

    if (type === 'truck') {
        const d = state.drivers.find(x => x.id == v.driverId);
        if (!d || (d.restUntil && d.restUntil > absTime)) return false;
        
        speedBonus += (d.skills.spd || 0) * 0.05;
        if (v.upgrades && v.upgrades.includes('chip')) speedBonus += 0.25;
        if (v.upgrades && v.upgrades.includes('gps')) speedBonus += 0.10;
        if (state.tech.includes('logistics')) speedBonus += 0.05;
        if (state.tech.includes('gps_fleet')) speedBonus += 0.15;
        if (state.tech.includes('drone_delivery')) speedBonus += 0.10;
        if (state.staff.dispatcher.active && state.staff.dispatcher.skills.routing) speedBonus += 0.1;
        if (state.factions.nexus >= 250) speedBonus += 0.05;
        if (state.factions.nexus >= 1000) speedBonus += 0.10;
        if (state.tower.floors.includes(1)) speedBonus += 0.05;
        
        const traitObj = TRAITS.find(t => t.id === d.trait) || TRAITS[0];
        speedBonus *= traitObj.speed;
        
        fuelRate = 0.03 * traitObj.cons; 
        if (state.tech.includes('eco_trucks')) fuelRate *= 0.85; 
        if (v.upgrades && v.upgrades.includes('bigtank')) fuelRate *= 0.5;
        if (state.factions.nexus >= 500) fuelRate *= 0.90;
        if (state.factions.nexus >= 1000) fuelRate *= 0.90;
        
        if (state.gasNetwork && state.gasNetwork.level > 0) {
            fuelRate *= (1 - (state.gasNetwork.level * 0.02));
        }
        
        if (v.upgrades && v.upgrades.includes('frame')) condRate *= 0.5;
        if (state.factions.stavba >= 500) condRate *= 0.8; 
        if (state.tech.includes('aero_design')) condRate *= 0.70;
        
        const cleanliness = v.cleanliness !== undefined ? v.cleanliness : 100;
        if (cleanliness < 50) {
            fuelRate *= 1.15;
            d.morale = Math.max(0, (d.morale || 100) - 0.05);
        }
        
        if (v.partQuality === 'cheap') {
            fuelRate *= 1.25;
            condRate *= 1.5;
            wearRate = 0.10;
            d.morale = Math.max(0, (d.morale || 100) - 0.05);
        } else if (v.partQuality === 'premium') {
            fuelRate *= 0.90;
            condRate *= 0.70;
            wearRate = 0.035;
            d.morale = Math.min(100, (d.morale || 100) + 0.02);
        }

        let _eLoss = (0.015 * traitObj.fatigue);
        if (v.upgrades && v.upgrades.includes('seats')) _eLoss *= 0.9;
        if (v.upgrades && v.upgrades.includes('bed')) _eLoss *= 0.9;
        if (v.upgrades && v.upgrades.includes('ac')) _eLoss *= 0.85;
        if (v.upgrades && v.upgrades.includes('coffee')) _eLoss *= 0.95;
        if (v.upgrades && v.upgrades.includes('fridge')) _eLoss *= 0.97;
        if (state.hq.relax_zone > 0) _eLoss *= (1 - (state.hq.relax_zone * 0.05));
        if (state.factions.fresh >= 250) _eLoss *= 0.9;
        
        d.energy = Math.max(0, d.energy - _eLoss);
        
        if (d.energy <= 0) {
            d.energy = 0;
            d.restUntil = absTime + 480;
            d.energy = 100;
            notify("ŘIDIČ VYČERPÁN", `${d.name} zastavil na odpočívadle a spí 8 hodin.`, "warning");
            SysLog('HR', `💤 Řidič ${d.name} vyčerpal energii na 0%. Automaticky spí na 8h.`);
            return false;
        }

    } else if (type === 'ship') {
        fuelRate = 0.20;
        condRate = 0.02;
        wearRate = 0.08;
        if (state.tech.includes('quantum_gps')) speedBonus += 0.20;
    } else if (type === 'plane') {
        fuelRate = 0.50;
        condRate = 0.03;
        wearRate = 0.12;
        if (state.tech.includes('quantum_gps')) speedBonus += 0.20;
    }

    let speed = ((v.spd || 1.0) * speedBonus * w.speedMod) * 0.35;
    if (v.trailer && type === 'truck') speed *= 0.92;

    v.progress += speed; 
    v.fuel = Math.max(0, v.fuel - fuelRate); 
    v.cond = Math.max(0, v.cond - condRate); 
    v.wear = Math.min(100, (v.wear || 0) + wearRate);
    state.stats.fuelUsed += fuelRate;
    
    if (v.wear > 80 && Math.random() < 0.0005 * (v.wear - 75)) {
        v.isBroken = true;
        notify("PORUCHA STROJE", `Vozidlo ${v.model} se porouchalo na trase! Odtáhni jej do Autodílny Zájezd.`, "danger");
        pushToTicker(`<b>PORUCHA:</b> Vozidlo ${v.model} se porouchalo na trase! Vyžaduje odtah.`, "danger");
        SysLog('FLOTILA', `⚠️ Porucha vozidla ${v.model} na trase!`);
    }

    if (v.fuel <= 0) {
        v.fuel = 0; 
        let pCost = state.fuelHedge ? state.fuelHedge : state.fuelPrice;
        if (state.tech.includes('bulk_buy')) pCost *= 0.9;
        
        let refillAmt = 100;
        if(type === 'ship') refillAmt = 1000;
        if(type === 'plane') refillAmt = 500;

        if (state.fuelTank >= refillAmt) { 
            state.fuelTank -= refillAmt; 
            v.fuel = 100; 
            updateFuelUI(); 
            SysLog('EKONOMIKA', `⛽ ${v.model} dotankoval ${refillAmt} l z firemní nádrže.`);
        } else if (state.money >= refillAmt * pCost) { 
            addMoney(-(refillAmt*pCost)); 
            v.fuel = 100; 
            SysLog('EKONOMIKA', `⛽ ${v.model} dotankoval ${refillAmt} l z trhu za -${(refillAmt*pCost).toLocaleString()} Kč.`);
        } else { 
            v.progress -= speed;
        }
    }

    return true;
}

function completeJob(v, type) {
    let pay = v.job.pay || 0;
    
    if (v.job.isCustomCommodity) {
        state.cityPrices = state.cityPrices || {};
        let destPrices = state.cityPrices[v.job.dest] || { food: 150, parts: 400, electronics: 1200 };
        let localPrice = destPrices[v.job.commodityType] || 150;
        pay = localPrice * v.job.qty;
    }
    
    let cargoLower = (v.job.cargo || "").toLowerCase();
    let deliveredType = null;
    if (v.job.isCustomCommodity) {
        deliveredType = v.job.commodityType;
    } else if (cargoLower.includes("obilí") || cargoLower.includes("food") || cargoLower.includes("mléko") || cargoLower.includes("sýry") || cargoLower.includes("potravin")) {
        deliveredType = 'food';
    } else if (cargoLower.includes("ocel") || cargoLower.includes("parts") || cargoLower.includes("železo") || cargoLower.includes("desky") || cargoLower.includes("díl")) {
        deliveredType = 'parts';
    } else if (cargoLower.includes("elektronika") || cargoLower.includes("electronics") || cargoLower.includes("čipy")) {
        deliveredType = 'electronics';
    }
    
    if (deliveredType && state.cityPrices && state.cityPrices[v.job.dest]) {
        let oldP = state.cityPrices[v.job.dest][deliveredType];
        let pctDrop = v.job.isCustomCommodity ? Math.max(0.70, 1 - (v.job.qty * 0.01)) : 0.95;
        state.cityPrices[v.job.dest][deliveredType] = Math.max(10, Math.floor(oldP * pctDrop));
        pushToTicker(`<b>LOKÁLNÍ TRH:</b> Dodávka ${v.job.cargo} do ${v.job.dest} snížila lokální cenu na ${state.cityPrices[v.job.dest][deliveredType]} Kč.`, "info");
    }
    
    if (state.jirstanPressure && state.jirstanPressure.eventType === 'dumping' && (v.job.dest === state.jirstanPressure.targetCity || v.loc === state.jirstanPressure.targetCity)) {
        pay = Math.floor(pay * 0.6);
    }
    
    if (v.trailer && type === 'truck') {
        let tb = v.trailer.bonus;
        if (state.tech.includes('mega_trailers')) tb += 0.20;
        pay = Math.floor(pay * tb);
    }
    if (state.hq.logistics_center > 0) pay += Math.floor(pay * (state.hq.logistics_center * 0.03));
    if (state.staff.dispatcher.active && state.staff.dispatcher.skills.negotiator) pay += Math.floor(pay * 0.1);
    
    if(type === 'truck') {
        const d = state.drivers.find(x => x.id == v.driverId);
        if (d && d.level >= 10) pay += Math.floor(pay * 0.05); 
        if (d && d.level >= 20) pay += Math.floor(pay * 0.10); 
        if (state.factions.stavba >= 250 && (v.job.reqLic === 'adr' || v.job.reqLic === 'sypky')) pay = Math.floor(pay * 1.1);
        if (state.factions.stavba >= 1000 && (v.job.reqLic === 'heavy' || v.job.reqLic === 'cars')) pay = Math.floor(pay * 1.3);
        if (state.factions.fresh >= 500 && (v.job.reqLic === 'frigo' || v.job.reqLic === 'express')) pay = Math.floor(pay * 1.2);
        if (state.economyBuff > 0) pay = Math.floor(pay * 1.2);
        if (state.tower.floors.includes(2)) pay = Math.floor(pay * 1.1);
    }

    if (state.tech.includes('global_lic')) pay = Math.floor(pay * 1.1);
    if (state.tech.includes('ai_disp')) pay = Math.floor(pay * 1.2);
    if ((type === 'ship' || type === 'plane') && state.tower.floors.includes(6)) pay = Math.floor(pay * 1.25);
    if (state.tech.includes('nightshift') && (state.hour >= 20 || state.hour < 6)) {
        pay = Math.floor(pay * 1.4);
        state.stats.nightDeliveries = (state.stats.nightDeliveries || 0) + 1;
    }

    state.reputation = Math.min(200, state.reputation + ((type === 'plane' || type === 'ship') ? 0.5 : 0.2));

    if (v.cleanliness && v.cleanliness < 50) {
        let cleanDiff = 50 - v.cleanliness;
        let penaltyPercent = Math.floor(cleanDiff / 10) * 10;
        pay = Math.floor(pay * (1 - (penaltyPercent / 100)));
        if (penaltyPercent > 0) {
            pushToTicker(`<b>REPUTACE:</b> ${v.model} doručeno na cestě špinavé (-${penaltyPercent}% zisk, -1 reputace).`, "warning");
            state.reputation = Math.max(0, state.reputation - 1);
        }
    }
    
    if (v.shinyUntil && v.shinyUntil > state.day) {
        pay = Math.floor(pay * 1.05);
    }

    if (type === 'plane' && state.planeBonus && state.planeBonus.active && state.day <= state.planeBonus.endDay) {
        pay = Math.floor(pay * state.planeBonus.multiplier);
    }
    if (state.roadPenalty && state.roadPenalty.active && state.day <= state.roadPenalty.endDay && type === 'truck') {
        pay = Math.floor(pay * (1 - state.roadPenalty.costIncrease));
    }
    if (state.synergyBonus && state.synergyBonus.active && state.day <= state.synergyBonus.endDay) {
        pay = Math.floor(pay * state.synergyBonus.multiplier);
    }

    let icon = type === 'ship' ? '🚢' : (type === 'plane' ? '✈️' : '🚛');

    if (type === 'ship') {
        const cargoType = v.job.cargoType || 'sea';
        const cargoItems = (typeof CARGO_TYPES !== 'undefined' && CARGO_TYPES[cargoType]) ? CARGO_TYPES[cargoType] : ['Neznámý kontejnerový náklad'];
        const cargoName = cargoItems[Math.floor(Math.random() * cargoItems.length)];
        
        SysLog('ZÁMOŘÍ', `🚢 Loď ${v.model} dorazila do přístavu ${v.job.dest}. Hodnota nákladu: ${pay.toLocaleString()} Kč.`);

        showModal(`
            <h2>🚢 Loď ${v.model} dorazila do přístavu</h2>
            <p>Cílový přístav: <b>${v.job.dest}</b></p>
            <p>Náklad: <b>${cargoName}</b></p>
            <p>Odměna za okamžitý prodej: <b style="color:var(--green)">${pay.toLocaleString()} Kč</b></p>
            <p><i>Pokud uložíte do skladu, můžete ho později rozvést do sítě motorestů a čerpaček pro synergický bonus.</i></p>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="btn btn-green" onclick="sellShipCargo('${v.id}', ${pay})">💰 PRODAT IHNED</button>
                <button class="btn btn-blue" onclick="storeShipCargo('${v.id}', '${cargoType}', '${cargoName}', ${pay})">📦 ULOŽIT DO SKLADU</button>
            </div>
        `);
        return;
    }

    // Standard Completion for Trucks & Planes
    addMoney(pay);
    state.stats.totalEarned += pay;
    state.stats.deliveries++;
    state.stats.distance += v.job.dist || 0;
    v.loc = v.job.dest; 
    
    notify("DORUČENO", `${icon} ${v.model} → ${v.job.dest}. +${pay.toLocaleString()} Kč`, "success");
    SysLog('DISPEČINK', `📦 ${icon} ${v.model} doručil zakázku do ${v.job.dest}. Výdělek: +${pay.toLocaleString()} Kč.`);

    if (v.job.factionId && !v.job.isBlackMarket) {
        state.factions[v.job.factionId] = (state.factions[v.job.factionId] || 0) + Math.floor(Math.random() * 5) + 5;
        if(state.factions[v.job.factionId] > 1000) state.factions[v.job.factionId] = 1000;
        renderFactions();
    }

    if (type === 'truck') {
        const d = state.drivers.find(x => x.id == v.driverId);
        if (d) {
            let xpGain = state.tech.includes('sim') ? 200 : 100; 
            d.xp += xpGain; 
            if(d.xp >= d.req) { 
                d.level++; 
                d.xp = 0; 
                d.req = Math.floor(d.req * 1.5); 
                d.skills.spd = (d.skills.spd || 0) + 1; 
                notify("LEVEL UP", `${d.name} dosáhl levelu ${d.level}!`, "gold"); 
                SysLog('HR', `⭐ Řidič ${d.name} dosáhl Levelu ${d.level}!`);
                renderHR(); 
            }
        }
    }
    
    gainDispatcherXP(15);
    progressContracts(v.loc);
    
    if (v.queue && v.queue.length > 0) {
        v.job = v.queue.shift();
        v.progress = 0;
        notify("PLÁNOVAČ TRAS", `${v.model} ihned pokračuje další zakázkou → ${v.job.dest}.`, "info");
        SysLog('DISPEČINK', `🔄 ${v.model} zahájil další zakázku z fronty → ${v.job.dest}.`);
    } else {
        v.job = null;
        v.progress = 0;
    }
}

function sellShipCargo(vid, pay) {
    const v = state.ships.find(s => s.id == vid);
    if (!v) return;
    
    addMoney(pay);
    state.stats.totalEarned += pay;
    state.stats.deliveries++;
    state.stats.distance += v.job.dist || 0;
    
    // Pokračovat v dokončení jobu
    finishShipJob(v);
    closeModal();
    notify("PRODEJ NÁKLADU", `Náklad z lodi ${v.model} prodán za ${pay.toLocaleString()} Kč.`, "success");
}

function storeShipCargo(vid, cargoType, cargoName, pay) {
    const v = state.ships.find(s => s.id == vid);
    if (!v) return;
    
    // Uložit do skladu
    if (!state.warehouse.shipCargo) state.warehouse.shipCargo = [];
    state.warehouse.shipCargo.push({
        type: cargoType,
        name: cargoName,
        value: pay,
        storedDay: state.day
    });
    
    // Pokračovat v dokončení jobu bez peněz
    finishShipJob(v);
    closeModal();
    notify("ULOŽENÍ NÁKLADU", `Náklad z lodi ${v.model} uložen do skladu.`, "info");
    renderWarehouse(); // Aktualizovat zobrazení skladu
}

function finishShipJob(v) {
    v.loc = v.job.dest;
    
    if (v.job.factionId && !v.job.isBlackMarket) {
        state.factions[v.job.factionId] += Math.floor(Math.random() * 5) + 5;
        if(state.factions[v.job.factionId] > 1000) state.factions[v.job.factionId] = 1000;
        renderFactions();
    }
    
    gainDispatcherXP(15);
    
    // Progress active contracts
    progressContracts(v.loc);
    
    if (v.queue && v.queue.length > 0) {
        v.job = v.queue.shift();
        v.progress = 0;
        notify("PLÁNOVAČ TRAS", `${v.model} ihned pokračuje další zakázkou → ${v.job.dest}.`, "info");
    } else {
        v.job = null;
        v.progress = 0;
    }
}

function tick() {
    // INTERMODALNÍ SYNERGIE: Kontrola expirace synergického bonusu
    if (state.synergyBonus && state.synergyBonus.active && state.day > state.synergyBonus.endDay) {
        state.synergyBonus.active = false;
        notify('SYNERGIE VYPRŠELA', 'Synergický bonus z rozvodu nákladu skončil.', 'info');
    }

    // DENNÍ UDÁLOSTI: Kontrola expirace efektů
    if (state.planeBonus && state.planeBonus.active && state.day > state.planeBonus.endDay) {
        state.planeBonus.active = false;
    }
    if (state.fuelDiscount && state.fuelDiscount.active && state.day > state.fuelDiscount.endDay) {
        state.fuelDiscount.active = false;
    }
    if (state.shipPenalty && state.shipPenalty.active && state.day > state.shipPenalty.endDay) {
        state.shipPenalty.active = false;
    }
    if (state.roadPenalty && state.roadPenalty.active && state.day > state.roadPenalty.endDay) {
        state.roadPenalty.active = false;
    }
    if (state.weatherPenalty && state.weatherPenalty.active && state.day > state.weatherPenalty.endDay) {
        state.weatherPenalty.active = false;
    }
    if (state.insurancePenalty && state.insurancePenalty.active && state.day > state.insurancePenalty.endDay) {
        state.insurancePenalty.active = false;
    }

    state.minute++;
    if (state.minute >= 60) { state.minute = 0; state.hour++; hourly(); }
    if (state.hour >= 24) { state.hour = 0; state.day++; daily(); }

    const absTime = state.day * 1440 + state.hour * 60 + state.minute;
    const w = WEATHER_TYPES.find(x => x.id === state.weather) || WEATHER_TYPES[0];
    let mapUpdate = false;

    if (state.money > state.stats.maxMoney) { state.stats.maxMoney = state.money; renderStats(); }
    
    if (state.researching) {
        state.researching.progress += state.tower.floors.includes(8) ? 1.5 : 1;
        if (state.researching.progress >= state.researching.duration) { 
            state.researching.progress = state.researching.duration; // cap it 
            state.tech.push(state.researching.id); 
            notify("VÝZKUM DOKONČEN", `Výzkum technologie dokončen!`, "success"); 
            state.researching = null; 
            renderTech(); updateUI();
            saveGame(); 
        } else if (state.minute % 10 === 0 && document.getElementById('tab-tech').classList.contains('active')) {
            renderTech();
        }
    }

    // Progresivní stavba patra Jirstan Tower
    if (state.tower && state.tower.underConstruction) {
        state.tower.underConstruction.progress += 2.0; // 50 sekund stavby
        if (state.tower.underConstruction.progress >= 100) {
            let buildId = state.tower.underConstruction.floorId;
            state.tower.floors.push(buildId);
            state.tower.levels[buildId] = 1;
            state.tower.underConstruction = null;
            const floorObj = TOWER_FLOORS_DB.find(f => f.id === buildId);
            notify("TOWER DOKONČENA", `Výstavba patra ${floorObj.name} byla úspěšně dokončena!`, "success");
            pushToTicker(`<b>JIRSTAN TOWER:</b> Patro ${floorObj.name} bylo dokončeno a zprovozněno!`, "success");
            saveGame();
        }
        if (document.getElementById('tab-tower').classList.contains('active')) renderTower();
    }

    if (state.staff.dispatcher.active && state.minute % 15 === 0) autoDispatch(absTime);

    // Kamiony
    state.vehicles.forEach(v => {
        if(!v.job) return;
        // Black Market
        if (v.job.isBlackMarket && Math.random() < 0.005) { 
            let fine = v.job.pay * 1.5;
            if (state.insurance.active || state.tower.floors.includes(7)) {
                fine = Math.floor(fine * 0.2);
                notify("POLICIE ZASAHUJE!", `Auto ${v.model} chyceno! Pojištění nebo Bezpečnostní oddělení uhradilo většinu pokuty. Stálo tě to jen ${fine.toLocaleString()} Kč!`, "warning");
            } else {
                notify("POLICIE ZASAHUJE!", `Vozidlo ${v.model} chyceno! Pokuta ${fine.toLocaleString()} Kč a obří pokles reputace!`, "danger");
                state.reputation -= 15;
            }
            addMoney(-fine);
            v.job = null; v.progress = 0;
            if(v.queue && v.queue.length > 0) { v.job = v.queue.shift(); }
            updateUI(); return; 
        }

        if(processMovement(v, 'truck', w, absTime)) {
            mapUpdate = true;
            if(v.progress >= 100) completeJob(v, 'truck');
        }
    });

    // Lodě
    state.ships.forEach(s => {
        if(!s.job) return;
        if(processMovement(s, 'ship', w, absTime)) {
            mapUpdate = true;
            if(s.progress >= 100) completeJob(s, 'ship');
        }
    });

    // Letadla
    state.planes.forEach(p => {
        if(!p.job) return;
        if(processMovement(p, 'plane', w, absTime)) {
            mapUpdate = true;
            if(p.progress >= 100) completeJob(p, 'plane');
        }
    });

    document.getElementById('ui-time').innerText = `${pad(state.hour)}:${pad(state.minute)}`; document.getElementById('ui-day').innerText = state.day;
    updateUI();
    if (mapUpdate && document.getElementById('tab-dispatch').classList.contains('active')) renderMap();
    if (state.minute % 5 === 0 && document.getElementById('tab-dispatch').classList.contains('active')) renderDispatch();
}

function pushToTicker(msg, type) {
    const timeStr = `DEN ${state.day} | ${pad(state.hour)}:${pad(state.minute)}`;
    
    // 1. Spodní běžící lišta
    const track = document.getElementById('ticker-track');
    if (track) {
        const span = document.createElement('span');
        span.className = `ticker-item ${type}`;
        span.innerHTML = `<span style="color:#aaa; font-family:'Orbitron'; font-size:11px; margin-right:8px">[${timeStr}]</span> <span>${msg}</span>`;
        track.appendChild(span);
        if(track.children.length > 20) track.removeChild(track.firstChild);
    }

    // 2. Dispečerský Terminál
    const term = document.getElementById('dispatch-terminal');
    if (term) {
        if(term.innerHTML.includes("Čekám na události")) term.innerHTML = "";
        let color = "var(--text-main)";
        if(type === 'success') color = "var(--green)";
        if(type === 'warning') color = "var(--gold)";
        if(type === 'danger') color = "var(--red)";
        if(type === 'info') color = "var(--blue)";
        
        const log = document.createElement('div');
        log.style.cssText = `border-left: 3px solid ${color}; padding-left: 12px; background: rgba(255,255,255,0.04); padding-top: 8px; padding-bottom: 8px; border-radius: 0 6px 6px 0; animation: fadeInScale 0.3s ease-out forwards;`;
        log.innerHTML = `<span style="color:#888; font-family:'Orbitron'; font-size:11px; margin-right:8px; display:block; margin-bottom:4px">[${timeStr}]</span> <span style="color:${color}; font-weight:600">${msg}</span>`;
        term.prepend(log);
        if(term.children.length > 50) term.removeChild(term.lastChild);
    }
}

function triggerInteractiveEvent() {
    if (state.vehicles.filter(v => v.job).length === 0) return; 
    
    const scenarios = [
        {
            title: "🛑 PODEZŘELÝ STOPAŘ",
            desc: "Jeden z tvých řidičů hlásí, že u cesty stojí chlap v obleku s kufříkem a nabízí 50 000 Kč v hotovosti za okamžitý odvoz. Vypadá ale dost nervózně...",
            choices: [
                { text: "VZÍT HO (Šance na 50k, ale riziko)", action: () => {
                    if(Math.random() > 0.4) {
                        addMoney(50000); notify("STOPAŘ", "Chlápek zaplatil a zmizel. +50 000 Kč!", "success"); pushToTicker("<b>BOKOVKA:</b> Řidič vzal stopaře a získal tučnou odměnu v hotovosti.", "success");
                    } else {
                        addMoney(-20000); state.reputation -= 10; notify("POLICIE!", "Chlápek byl hledaný zločinec! Pokuta a vyšetřování.", "danger"); pushToTicker("<b>SKANDÁL:</b> Jirstan Logistics vyšetřován za napomáhání zločinci. Reputace klesá.", "danger");
                    }
                }},
                { text: "IGNOROVAT (Bezpečí)", action: () => {
                    notify("BEZPEČÍ", "Řidič projel kolem. Jistota je jistota.", "info"); pushToTicker("<b>DISPEČINK:</b> Podezřelý stopař nahlášen policii, jedeme dál bez zdržení.", "info");
                }}
            ]
        },
        {
            title: "⛈️ ZKRATKA PŘES HORY",
            desc: "Kamion s důležitým nákladem uvízl ve strašlivé koloně kvůli nehodě. Dispečer navrhuje riskantní zkratku přes neudržovaný horský průsmyk. Ušetříme čas?",
            choices: [
                { text: "RISKNOUT TO (Zrychlení zakázky)", action: () => {
                    if(Math.random() > 0.4) {
                        state.vehicles.filter(v=>v.job).forEach(v => v.progress = Math.min(99, v.progress + 15));
                        notify("ZKRATKA", "Vyšlo to! Kamiony se výrazně posunuly k cíli.", "success"); pushToTicker("<b>LOGISTIKA:</b> Riskantní zkratka ušetřila několik hodin cesty.", "success");
                    } else {
                        state.vehicles.filter(v=>v.job).forEach(v => v.cond = Math.max(0, v.cond - 25));
                        notify("NEHODA", "Špatný nápad. Extrémní poškození podvozků na kamenité cestě (-25% stav).", "warning"); pushToTicker("<b>NEHODA:</b> Pokus o zkratku skončil poškozením flotily.", "warning");
                    }
                }},
                { text: "POČKAT V KOLONĚ", action: () => {
                    notify("KOLONA", "Čekáme. Zdržíme se, ale auta jsou celá.", "info"); pushToTicker("<b>DOPRAVA:</b> Kamiony stojí v obrovské koloně, nabírají zpoždění.", "warning");
                }}
            ]
        },
        {
            title: "🤑 KORUPCE NA CELNICI",
            desc: "Celník na hranicích zdržuje náš kamion a zjevně očekává 'všimné'. Pokud nezaplatíme 20 000 Kč, prý vozidlo zdrží o půl dne.",
            choices: [
                { text: "ZAPLATIT ÚPLATEK (Rychlý průjezd)", action: () => {
                    addMoney(-20000);
                    notify("CELNICE", "Zaplaceno. Kamion okamžitě projel.", "success"); pushToTicker("<b>HRANICE:</b> Kamion prošel celnicí nečekaně rychle díky 'všimnému'.", "success");
                }},
                { text: "ODMÍTNOUT (Ztráta času)", action: () => {
                    state.vehicles.filter(v=>v.job).forEach(v => v.progress = Math.max(0, v.progress - 15));
                    notify("CELNICE", "Celník se naštval a kamion rozebral do šroubku. Obří zdržení.", "danger"); pushToTicker("<b>HRANICE:</b> Dlouhá a nepříjemná celní kontrola masivně zdržuje dodávku.", "danger");
                }}
            ]
        }
    ];
    
    let s = scenarios[Math.floor(Math.random() * scenarios.length)];
    let h = `<h2 style="color:var(--orange)">${s.title}</h2>
             <p style="font-size:15px; margin-bottom:25px; line-height:1.5; color:var(--text-main)">${s.desc}</p>
             <div style="display:flex; gap:15px; flex-wrap:wrap">`;
    
    s.choices.forEach((c, idx) => {
        window[`tempAction${idx}`] = () => { c.action(); closeModal(); updateUI(); saveGame(); };
        let btnClass = idx === 0 ? 'btn-orange' : 'btn-dark';
        h += `<button class="btn ${btnClass}" style="flex:1; padding:15px; font-size:13px" onclick="window.tempAction${idx}()"><b>${c.text}</b></button>`;
    });
    h += `</div>`;
    
    document.getElementById('modal-content').innerHTML = h;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function triggerRandomEvent() {
    if (state.vehicles.filter(v => v.job).length === 0 && state.ships.filter(s=>s.job).length === 0 && state.planes.filter(p=>p.job).length === 0) return; 
    const events = [
        { msg: "Jeden z řidičů dostal pokutu za rychlost!", cost: -15000, rep: -1, type: "bad" },
        { msg: "Obrovská zácpa na dálnici zdržela dopravu. Řidiči jsou naštvaní.", energy: -10, morale: -15, type: "bad" },
        { msg: "Pomoc uvízlému vozidlu! Skvělé PR pro Jirstan.", rep: 3, reward: 5000, type: "good" },
        { msg: "Zákazník ocenil bleskové doručení extrémním dýškem.", reward: 25000, type: "good" },
        { msg: "Běžná silniční a celní kontrola proběhla bez problému.", type: "neutral" },
        { msg: "Prasklá pneumatika si vyžádala rychlý a drahý servis na cestě.", cost: -8000, type: "bad" },
        { msg: "Řidiči našli skvělou zkratku, ušetřili trochu paliva a energie.", energy: 15, type: "good" }
    ];
    let ev = JSON.parse(JSON.stringify(events[Math.floor(Math.random() * events.length)]));
    state.stats.events++;

    if (ev.cost && ev.cost < 0 && (state.insurance.active || state.tower.floors.includes(7))) {
        ev.cost = Math.floor(ev.cost * 0.2); 
        ev.msg += " (Pojištění/Bezpečnostní oddělení uhradilo 80% škody!)";
    }

    if (ev.cost) addMoney(ev.cost);
    if (ev.reward) addMoney(ev.reward);
    if (ev.rep) state.reputation += ev.rep;
    if (ev.energy || ev.morale) {
        state.drivers.forEach(d => {
            if (ev.energy) d.energy = Math.min(100, Math.max(0, d.energy + ev.energy));
            if (ev.morale) d.morale = Math.min(100, Math.max(0, d.morale + ev.morale));
        });
    }

    let color = ev.type === "good" ? "success" : (ev.type === "bad" ? "warning" : "info");
    notify("UDÁLOST", ev.msg, color);
    pushToTicker(`<b>DISPEČINK HLÁSÍ:</b> ${ev.msg}`, color);
    updateUI();
}

function genUsedCars() {
    state.usedCars = [];
    let numCars = Math.floor(Math.random() * 3) + 2; 
    for(let i=0; i<numCars; i++) {
        let baseCar = CAR_DB[Math.floor(Math.random() * CAR_DB.length)];
        let cond = 25 + Math.floor(Math.random() * 60); 
        
        let superDiscount = Math.random() < 0.20;
        let discountMultiplier = superDiscount ? 0.35 : 0.60;
        let price = Math.floor(baseCar.price * (discountMultiplier + Math.random() * 0.15));
        
        let deviation = superDiscount ? 25 : 15;
        let estimatedCond = Math.max(5, Math.min(95, cond + Math.floor((Math.random() - 0.5) * deviation * 2)));
        
        state.usedCars.push({
            id: Date.now() + i,
            baseId: baseCar.model,
            model: baseCar.model + " (Ojetina)",
            cat: baseCar.cat,
            price: price,
            spd: baseCar.spd * (0.85 + (Math.random()*0.1)), 
            cond: cond,
            estimatedCond: estimatedCond,
            deviation: deviation,
            superDiscount: superDiscount,
            img: baseCar.img
        });
    }
}

function generateBazaarMarket() {
    let count = 3 + Math.floor(Math.random() * 2);
    state.bazaarMarket = [];
    for (let i = 0; i < count; i++) {
        let isVeteran = Math.random() < 0.05;
        let base = FLIP_CAR_DB[Math.floor(Math.random() * FLIP_CAR_DB.length)];
        let condition = isVeteran ? 5 : (20 + Math.floor(Math.random() * 61)); // 5 pro veterán
        let cleanliness = isVeteran ? 10 : (10 + Math.floor(Math.random() * 51));
        let discount = isVeteran ? 0.10 : (0.45 + Math.random() * 0.25); // veterán extra levný
        let modelName = isVeteran ? `Zrezivělý Veterán ${base.n}` : base.n;
        
        let superDiscount = Math.random() < 0.20;
        let discountMultiplier = superDiscount ? 0.40 : 0.65;
        let discountVal = isVeteran ? 0.10 : (discountMultiplier + Math.random() * 0.15);
        
        let buyPrice = Math.max(5000, Math.floor(base.basePrice * discountVal));
        
        let deviation = superDiscount ? 25 : 15;
        let estimateDelta = Math.floor((Math.random() - 0.5) * deviation * 2);
        let estimatedCondition = Math.max(5, Math.min(95, condition + estimateDelta));
        
        state.bazaarMarket.push({
            id: `${Date.now()}_${i}_${Math.floor(Math.random()*10000)}`,
            baseId: base.id,
            model: modelName,
            cat: 'car',
            img: base.img,
            basePrice: base.basePrice,
            condition: condition,
            estimatedCondition: estimatedCondition,
            cleanliness: cleanliness,
            buyPrice: buyPrice,
            mods: [],
            isListed: false,
            offers: [],
            isVeteran: isVeteran,
            superDiscount: superDiscount,
            deviation: deviation
        });
    }
    saveGame();
    renderBazaar();
}

function buyBazaarCar(idx) {
    let car = state.bazaarMarket[idx];
    if (!car) { notify('CHYBA', 'Neplatné auto k zakoupení.', 'danger'); return; }
    if (state.money < car.buyPrice) { notify('CHYBA', 'Nemáš dost peněz na koupi auta.', 'danger'); return; }

    addMoney(-car.buyPrice);
    
    let est = car.estimatedCondition !== undefined ? car.estimatedCondition : car.condition;
    let actual = car.condition;
    let difference = actual - est;
    let diffText = difference > 0 
        ? `v lepším stavu (+${difference}%) než se zdálo!` 
        : (difference < 0 ? `v horším stavu (${difference}%) kvůli skryté vadě!` : `přesně v očekávaném stavu (${actual}%).`);

    state.bazaarInventory.push({ ...car, mods: [], isListed: false, offers: [] });
    state.bazaarMarket.splice(idx, 1);

    notify('KOUPI OJETINY', `Koupili jste ${car.model}. Po důkladné prohlídce na zvedáku je auto ${diffText}`, difference >= 0 ? 'success' : 'warning');
    pushToTicker(`<b>AUTOBAZAR:</b> Zakoupen ${car.model} za ${car.buyPrice.toLocaleString()} Kč. Skutečný stav: ${actual}% (odhad byl ${est}%).`, difference >= 0 ? 'success' : 'warning');
    saveGame();
    renderBazaar();
    updateUI();
}

function tuneBazaarCar(idx, type) {
    let car = state.bazaarInventory[idx];
    if (!car) { notify('CHYBA', 'Auto nenalezeno v garáži.', 'warning'); return; }

    let cost = 0;
    if (type === 'repair') {
        cost = Math.max(10000, Math.floor((100 - car.condition) * 2000));
        if (state.money < cost) return notify('CHYBA', 'Nemáš dost peněz na opravu.', 'danger');
        addMoney(-cost); car.condition = 100;
        notify('DÍLNA', `Auto opraveno za ${cost.toLocaleString()} Kč.`, 'success');
    } else if (type === 'wash') {
        cost = 5000;
        if (state.money < cost) return notify('CHYBA', 'Nemáš dost peněz na mytí.', 'danger');
        addMoney(-cost); car.cleanliness = 100;
        notify('DÍLNA', `Auto vyleštěno za ${cost.toLocaleString()} Kč.`, 'success');
    } else if (type === 'chip') {
        cost = 80000;
        if (state.money < cost) return notify('CHYBA', 'Nemáš dost peněz na CHIPTUNING.', 'danger');
        addMoney(-cost);
        if (!car.mods.includes('CHIPTUNING')) car.mods.push('CHIPTUNING');
        car.condition = Math.max(0, car.condition - 15);
        notify('DÍLNA', 'CHIPTUNING aplikován. Výkon roste, stav mírně klesá.', 'info');
    } else if (type === 'paint') {
        cost = 120000;
        if (state.money < cost) return notify('CHYBA', 'Nemáš dost peněz na lakování.', 'danger');
        addMoney(-cost);
        if (!car.mods.includes('PRÉMIOVÝ LAK')) car.mods.push('PRÉMIOVÝ LAK');
        notify('DÍLNA', 'Prémiový lak byl aplikován. Auta vypadá jako nové.', 'success');
    } else if (type === 'alu') {
        cost = 95000;
        if (state.money < cost) return notify('CHYBA', 'Nemáš dost peněz na Alu kola.', 'danger');
        addMoney(-cost);
        if (!car.mods.includes('ALU KOLA')) car.mods.push('ALU KOLA');
        notify('DÍLNA', 'Alu kola instalována. Auto má vyšší přitažlivost.', 'success');
    } else {
        notify('CHYBA', 'Neznámý typ servisu.', 'danger');
        return;
    }

    saveGame();
    renderBazaar();
}

function repairBazaarCar(idx) {
    let car = state.bazaarInventory[idx];
    if (!car) { notify('CHYBA', 'Auto nenalezeno v inventáři.', 'warning'); return; }
    
    let baseCost = Math.max(8000, Math.floor((100 - car.condition) * 1500));
    let cheapCost = Math.floor(baseCost * 0.5);
    let premiumCost = Math.floor(baseCost * 1.5);
    
    let html = `
        <h2 style="color:var(--purple); margin-top:0; font-family:'Orbitron'">🛠️ VOLBA NÁHRADNÍCH DÍLŮ</h2>
        <p style="color:var(--text-muted)">Vyber kvalitu náhradních dílů pro opravu vozu <b>${car.model}</b> (stávající stav: ${car.condition}%).</p>
        
        <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:20px;">
            <div style="background:rgba(255, 42, 85, 0.05); border:1px solid rgba(255, 42, 85, 0.2); padding:12px; border-radius:6px; cursor:pointer;" onclick="executeBazaarRepair(${idx}, 'cheap', ${cheapCost})">
                <div style="display:flex; justify-content:space-between; font-weight:bold; color:var(--red);">
                    <span>🔴 LEVNÉ DÍLY (DRUHOVÝROBA)</span>
                    <span>${cheapCost.toLocaleString()} Kč</span>
                </div>
                <div style="font-size:11px; color:#aaa; margin-top:4px;">+25 % spotřeba paliva, o 50 % rychlejší opotřebení, snižuje morálku řidiče. <b>Riziko poruchy 25 % při prodeji (PR katastrofa)!</b></div>
            </div>
            
            <div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-light); padding:12px; border-radius:6px; cursor:pointer;" onclick="executeBazaarRepair(${idx}, 'standard', ${baseCost})">
                <div style="display:flex; justify-content:space-between; font-weight:bold; color:white;">
                    <span>⚪ STANDARDNÍ (OEM KVALITA)</span>
                    <span>${baseCost.toLocaleString()} Kč</span>
                </div>
                <div style="font-size:11px; color:#aaa; margin-top:4px;">Standardní vlastnosti a spolehlivost. Bez rizik a bonusů.</div>
            </div>
            
            <div style="background:rgba(0, 255, 102, 0.05); border:1px solid rgba(0, 255, 102, 0.2); padding:12px; border-radius:6px; cursor:pointer;" onclick="executeBazaarRepair(${idx}, 'premium', ${premiumCost})">
                <div style="display:flex; justify-content:space-between; font-weight:bold; color:var(--green);">
                    <span>🟢 PRÉMIOVÉ DÍLY</span>
                    <span>${premiumCost.toLocaleString()} Kč</span>
                </div>
                <div style="font-size:11px; color:#aaa; margin-top:4px;">-10 % spotřeba, o 30 % pomalejší opotřebení, zvyšuje morálku řidiče. <b>+5 reputace při prodeji (Spokojený zákazník)!</b></div>
            </div>
        </div>
        
        <button class="btn btn-dark" style="width:100%" onclick="closeModal()">ZRUŠIT</button>
    `;
    showModal(html);
}

function executeBazaarRepair(idx, quality, cost) {
    let car = state.bazaarInventory[idx];
    if (!car) return;
    if (state.money < cost) { notify('FINANCE', 'Nemáš dost peněz na tuto opravu!', 'danger'); return; }
    
    addMoney(-cost);
    car.condition = 100;
    car.partQuality = quality;
    notify('DÍLNA', `Vůz ${car.model} byl opraven s kvalitou ${quality === 'cheap' ? 'Levná' : (quality === 'premium' ? 'Prémiová' : 'Standardní')}.`, 'success');
    closeModal();
    saveGame();
    renderBazaar();
    updateUI();
}

function transferBazaarCarToFleet(idx) {
    let car = state.bazaarInventory[idx];
    if (!car) { notify('CHYBA', 'Auto nenalezeno v inventáři.', 'danger'); return; }
    if (car.condition < 90) { notify('DÍLNA', 'Auto musí být opraveno aspoň na 90 % stavu před převodem do flotily!', 'warning'); return; }
    if (state.vehicles.length >= (state.garageCapacity || 5)) { notify('GARÁŽ', 'Tvá garáž je plná! Přikup nová stání.', 'warning'); return; }
    
    let base = CAR_DB.find(x => x.model === car.model.replace(" (Ojetina)", "")) || CAR_DB[0];
    
    state.vehicles.push({
        id: Date.now(),
        type: car.cat || 'car',
        model: car.model.replace(" (Ojetina)", ""),
        driverId: null,
        loc: 'Praha',
        job: null,
        queue: [],
        progress: 0,
        cond: car.condition,
        fuel: 100,
        spd: car.spd || base.spd || 1.0,
        upgrades: car.mods || [],
        trailer: null,
        cleanliness: car.cleanliness || 100,
        partQuality: car.partQuality || 'standard'
    });
    
    state.bazaarInventory.splice(idx, 1);
    notify('FLOTILA', `${car.model} byl úspěšně zařazen do aktivní flotily.`, 'success');
    pushToTicker(`<b>FLOTILA:</b> Zařazeno auto ${car.model} z vlastního autobazaru.`, 'success');
    closeModal();
    saveGame();
    renderBazaar();
    renderFleet();
    updateUI();
}

function checkBazaarSalePR(car) {
    if (car.partQuality === 'cheap' && Math.random() < 0.25) {
        state.reputation = Math.max(0, (state.reputation || 0) - 15);
        notify('PR KATASTROFA!', `Zákazník reklamoval vůz ${car.model}! Levné druhovýrobové díly selhaly hned druhý den. Ztráta 15 reputace!`, 'danger');
        pushToTicker(`<b>REKLAMACE BAZARU:</b> Vůz ${car.model} s levnými díly se rozbil. Zákazník požaduje penále. Ztráta 15 reputace.`, 'danger');
    } else if (car.partQuality === 'premium') {
        state.reputation = (state.reputation || 0) + 5;
        notify('SPOKOJENÝ ZÁKAZNÍK', `Zákazník oceňuje prémiové náhradní díly a doporučuje tvůj bazar dále. +5 reputace!`, 'success');
        pushToTicker(`<b>BOP BONUS:</b> Vynikající pověst bazaru díky prémiové opravě vozu ${car.model}. +5 reputace.`, 'success');
    }
}

function washBazaarCar(idx) {
    let car = state.bazaarInventory[idx];
    if (!car) { notify('CHYBA', 'Auto nenalezeno v inventáři.', 'warning'); return; }
    let cost = 4000;
    if (state.money < cost) return notify('CHYBA', 'Nemáš dost peněz na mytí.', 'danger');
    addMoney(-cost);
    car.cleanliness = 100;
    notify('AUTOBÁZAR', `${car.model} umyté za ${cost.toLocaleString()} Kč.`, 'success');
    saveGame();
    renderBazaar();
    updateUI();
}

function sellBazaarCar(idx) {
    let car = state.bazaarInventory[idx];
    if (!car) { notify('CHYBA', 'Auto nenalezeno v inventáři.', 'warning'); return; }
    if (car.isVeteran && car.condition >= 100) {
        let sellPrice = Math.floor(car.basePrice * 5);
        addMoney(sellPrice);
        checkBazaarSalePR(car);
        state.bazaarInventory.splice(idx, 1);
        notify('PRODEJ', `${car.model} (Veterán) prodáno za ${sellPrice.toLocaleString()} Kč!`, 'success');
        pushToTicker(`<b>AUTOBAZAR:</b> Prodán veterán ${car.model} za ${sellPrice.toLocaleString()} Kč.`, 'success');
        saveGame(); renderBazaar(); updateUI(); return;
    }
    let base = car.basePrice || car.buyPrice || 10000;
    let multiplier = 1.2 + (car.condition / 200) + (car.cleanliness / 400);
    if (car.mods && car.mods.includes('PRÉMIOVÝ LAK')) multiplier *= 1.15;
    if (car.mods && car.mods.includes('ALU KOLA')) multiplier *= 1.10;
    let sellPrice = Math.floor(base * multiplier);
    addMoney(sellPrice);
    checkBazaarSalePR(car);
    state.bazaarInventory.splice(idx, 1);
    notify('PRODEJ', `${car.model} prodáno za ${sellPrice.toLocaleString()} Kč.`, 'success');
    pushToTicker(`<b>AUTOBAZAR:</b> Prodáno ${car.model} za ${sellPrice.toLocaleString()} Kč.`, 'success');
    saveGame();
    renderBazaar();
    updateUI();
}

function listBazaarCar(idx) {
    let car = state.bazaarInventory[idx];
    if (!car) { notify('CHYBA', 'Auto nenalezeno v garáži.', 'warning'); return; }
    if (car.isListed) { notify('INFO', 'Auto již je v showroomu.', 'info'); return; }
    car.isListed = true;
    car.offers = [];
    car.testDriveUsed = false;
    notify('AUTOBÁZAR', `${car.model} je nyní vystaven k prodeji.`, 'success');
    saveGame();
    renderBazaar();
}

function testDriveBazaarCar(idx) {
    let car = state.bazaarInventory[idx];
    if (!car) { notify('CHYBA', 'Auto nenalezeno.', 'warning'); return; }
    if (!car.isListed) return notify('AUTOBAZAR', 'Auto musí být vystavené.', 'warning');
    if (car.testDriveUsed) return notify('AUTOBAZAR', 'Testovací jízda již byla použita.', 'info');

    car.testDriveUsed = true;
    if (Math.random() < 0.8) {
        let bestOffer = (car.offers || []).reduce((acc, o) => o.amount > (acc?.amount||0) ? o : acc, null);
        let offerPrice = bestOffer ? bestOffer.amount : Math.floor((car.basePrice || car.buyPrice || 10000) * 1.1);
        let finalPrice = Math.floor(offerPrice * 1.2);
        addMoney(finalPrice);
        state.bazaarInventory.splice(idx, 1);
        notify('TESTOVACÍ JÍZDA', `${car.model} byl prodán po testovací jízdě za ${finalPrice.toLocaleString()} Kč!`, 'success');
        pushToTicker(`<b>AUTOBAZAR:</b> Testovací jízda měla úspěch. ${car.model} prodán.`, 'success');
    } else {
        car.offers = [];
        car.condition = Math.max(0, (car.condition || 100) - 15);
        notify('TESTOVACÍ JÍZDA', `Zákazník odřel auto. Kondice -15%, nabídky odstraněny.`, 'warning');
    }
    saveGame();
    renderBazaar();
    updateUI();
}

function generateBazaarOffers() {
    if (!state.bazaarInventory || state.bazaarInventory.length === 0) return;
    state.bazaarInventory.forEach(car => {
        if (!car.isListed) { car.offers = []; return; }
        let offerCount = Math.floor(Math.random() * 3); // 0-2
        car.offers = [];
        for (let i = 0; i < offerCount; i++) {
            let modifier = 0.8 + Math.random() * 0.5; // 0.8-1.3
            let effort = 1 + (car.mods.length * 0.05) + (car.condition / 500) + (car.cleanliness / 1000);
            let amount = Math.floor((car.basePrice * (0.75 + (car.condition / 500) + (car.cleanliness / 900))) * modifier * effort);
            car.offers.push({ id: `${car.id}_${i}_${Math.floor(Math.random()*10000)}`, name: `Zákazník ${NAMES_F[Math.floor(Math.random()*NAMES_F.length)]}`, amount: amount });
        }
    });
    saveGame();
    renderBazaar();
}

function acceptBazaarOffer(carIdx, offerId) {
    let car = state.bazaarInventory[carIdx];
    if (!car) return notify('CHYBA', 'Auto nenalezeno.', 'danger');
    let offerIndex = car.offers.findIndex(o => o.id === offerId);
    if (offerIndex === -1) return notify('CHYBA', 'Nabídka neexistuje.', 'danger');
    let offer = car.offers[offerIndex];

    addMoney(offer.amount);
    checkBazaarSalePR(car);
    state.bazaarInventory.splice(carIdx, 1);
    pushToTicker(`<b>AUTOBAZAR:</b> Auto ${car.model} prodáno za ${offer.amount.toLocaleString()} Kč.`, 'success');
    notify('PRODEJ', `Auto prodáno za ${offer.amount.toLocaleString()} Kč!`, 'success');
    saveGame();
    renderBazaar();
}

function hourly() {
    SysLog('TICK', `⏱️ Nová herní hodina: ${String(state.hour).padStart(2,'0')}:00 (Den ${state.day})`);

    // 1. Idle & resting driver passive energy regeneration
    const absTime = state.day * 1440 + state.hour * 60 + state.minute;
    (state.drivers || []).forEach(d => {
        const assignedVehicle = (state.vehicles || []).find(v => v.driverId == d.id && v.job);
        if (!assignedVehicle) {
            if (d.restUntil && d.restUntil <= absTime) {
                d.restUntil = 0;
                d.energy = 100;
                SysLog('HR', `💤 Řidič ${d.name} se probudil z odpočinku. Energie: 100%.`);
            } else if (!d.restUntil || d.restUntil <= absTime) {
                if (d.energy < 100) {
                    d.energy = Math.min(100, d.energy + 8);
                    SysLog('HR', `⚡ Řidič ${d.name} v depu regeneroval energii (+8% -> ${Math.floor(d.energy)}%).`);
                }
            }
        }
    });

    // 2. Fuel price market shift
    if (state.jirstanPressure && state.jirstanPressure.eventType === 'fuel_monopoly') {
        state.fuelPrice = 45.00;
    } else {
        state.fuelPrice = Math.max(29.5, Math.min(45, Number(state.fuelPrice || 35.5) + (Math.random() - 0.5) * 1.5));
    }
    fuelHistory.push(state.fuelPrice); if (fuelHistory.length > 24) fuelHistory.shift();
    updateFuelUI();
    if (document.getElementById('tab-bank') && document.getElementById('tab-bank').classList.contains('active')) drawFuelChart();
    
    // 3. Jirstan Tower Hourly Simulation
    state.tower = state.tower || { floors: [], levels: {}, happiness: 80, energy: 80 };
    state.tower.energy = Math.max(0, state.tower.energy - 1);
    if (state.tower.energy < 20) {
        state.tower.happiness = Math.max(0, state.tower.happiness - 1);
    } else if (state.tower.energy > 80) {
        state.tower.happiness = Math.min(100, state.tower.happiness + 0.5);
    }
    SysLog('VĚŽ', `Tower vitals: Energie ${state.tower.energy}%, Spokojenost ${Math.floor(state.tower.happiness)}%`);
    if (document.getElementById('tab-tower') && document.getElementById('tab-tower').classList.contains('active')) renderTower();
    
    // 4. Dispečer aktualizuje burzu zakázek
    if (state.staff && state.staff.dispatcher && state.staff.dispatcher.active) {
        let refreshRate = Math.max(1, 6 - Math.floor((state.staff.dispatcher.level || 1) / 2));
        if (state.hour % refreshRate === 0) {
            genOffers(true);
            pushToTicker(`<b>DISPEČER:</b> Jirka právě prohledal trh a aktualizoval Burzu zakázek.`, "info");
            SysLog('DISPEČINK', `Jirka prohledal trh (Lvl ${state.staff.dispatcher.level||1}) - burza obnovena.`);
        }
    }
    
    let rand = Math.random();
    if (rand < 0.08) {
        triggerInteractiveEvent();
    } else if (rand < 0.18) {
        triggerRandomEvent();
    }
}

function daily() {
    SysLog('TICK', `🌅 ================== ZAČÁTEK DNE ${state.day} ==================`);

    // --- VELKOSKLAD / EKONOMIKA ---
    state.marketPrices = state.marketPrices || { electronics: 1200, food: 150, parts: 400, fresh_food: 350 };
    Object.keys(state.marketPrices).forEach(key => {
        state.marketHistory = state.marketHistory || { electronics: [], food: [], parts: [] };
        state.marketHistory[key] = state.marketHistory[key] || [];
        state.marketHistory[key].push(state.marketPrices[key]);
        if (state.marketHistory[key].length > 30) state.marketHistory[key].shift();

        let change = (Math.random() * 0.3) - 0.15; // -15% až +15%
        state.marketPrices[key] = Math.max(10, Math.floor(state.marketPrices[key] * (1 + change)));
    });
    SysLog('SKLAD', `Aktualizovány globální tržní ceny komodit. Obilí: ${state.marketPrices.food} Kč, Ocel: ${state.marketPrices.parts} Kč, El: ${state.marketPrices.electronics} Kč.`);

    // --- LOKÁLNÍ TRHY VE MĚSTECH (FÁZE 6) ---
    state.cityPrices = state.cityPrices || {};
    for (let cityName in CITIES) {
        if (!state.cityPrices[cityName]) {
            state.cityPrices[cityName] = {
                food: 120 + Math.floor(Math.random() * 100),
                parts: 300 + Math.floor(Math.random() * 250),
                electronics: 900 + Math.floor(Math.random() * 600)
            };
        }
        
        let prices = state.cityPrices[cityName];
        let basePrices = { food: 150, parts: 400, electronics: 1200 };
        
        for (let commodity in basePrices) {
            let base = basePrices[commodity];
            let current = prices[commodity] || base;
            
            // Drift k ekvilibriu (10% denně)
            let diff = base - current;
            current += diff * 0.10;
            
            // Náhodný šum (+/- 3%)
            let noise = (Math.random() * 0.06) - 0.03;
            current *= (1 + noise);
            
            prices[commodity] = Math.max(10, Math.floor(current));
        }
    }

    // Simulace Jirstan dodávek do 2 náhodných měst
    let cityKeys = Object.keys(CITIES);
    if (cityKeys.length > 0) {
        for (let i = 0; i < 2; i++) {
            let randCity = cityKeys[Math.floor(Math.random() * cityKeys.length)];
            let commodities = ['food', 'parts', 'electronics'];
            let randComm = commodities[Math.floor(Math.random() * commodities.length)];
            if (state.cityPrices[randCity]) {
                let oldPrice = state.cityPrices[randCity][randComm];
                state.cityPrices[randCity][randComm] = Math.max(10, Math.floor(oldPrice * 0.85));
                pushToTicker(`<b>LOKÁLNÍ TRH JIRSTANU:</b> JIRSTAN CORP navozil komoditu do města ${randCity}, cena tam klesla o 15%.`, "info");
            }
        }
    }

    if (Math.random() < 0.05) {
        let event = Math.random();
        if (event < 0.5) {
            state.marketPrices.electronics = Math.floor(state.marketPrices.electronics * 4);
            notify('EKONOMIKA', 'Krize: Nedostatek čipů! Elektronika +300%.', 'warning');
            pushToTicker('<b>EKONOMICKÁ UDÁLOST:</b> Nedostatek čipů! Ceny elektroniky vyletěly.', 'danger');
            SysLog('EKONOMIKA', '⚡ Globální krize čipů: ceny elektroniky vyletěly na 4x.');
        } else {
            state.marketPrices.food = Math.floor(state.marketPrices.food * 0.7);
            notify('EKONOMIKA', 'Nadbytek potravin! Cena jídla -30%.', 'success');
            pushToTicker('<b>EKONOMICKÁ UDÁLOST:</b> Přebytek potravin, ceny klesají.', 'info');
            SysLog('EKONOMIKA', '🌾 Přebytek úrody: ceny potravin klesly o 30%.');
        }
    }
    if (state.economyBuff > 0) {
        state.economyBuff = Math.max(0, state.economyBuff - 1);
    }

    if (state.carwash && state.carwash.publicAccess) {
        addMoney(25000);
        pushToTicker('<b>AUTOMYČKA:</b> Veřejný provoz přinesl +25 000 Kč.', 'success');
        SysLog('MYČKA', '💰 Veřejný provoz myčky vygeneroval +25 000 Kč.');
    }

    if (state.jirstanJointVenture) {
        addMoney(150000);
        pushToTicker('<b>SPOLEČNÝ PODNIK:</b> Podíl z tras s Jirstanem přinesl +150 000 Kč.', 'success');
        SysLog('EKONOMIKA', '🤝 Společný podnik s Jirstanem: výnos +150 000 Kč.');
    }

    // Spoilage pro čerstvé potraviny
    state.warehouse = state.warehouse || { stock: {}, capacity: 1000, level: 1, cold_storage: 0 };
    let spoilRate = 0.30 - (0.10 * (state.warehouse.cold_storage || 0));
    spoilRate = Math.max(0, spoilRate);
    if ((state.warehouse.stock.fresh_food || 0) > 0 && spoilRate > 0) {
        let lost = Math.floor(state.warehouse.stock.fresh_food * spoilRate);
        lost = Math.min(lost, state.warehouse.stock.fresh_food);
        state.warehouse.stock.fresh_food -= lost;
        if (lost > 0) {
            pushToTicker(`<b>VELKOSKLAD:</b> Zkažené čerstvé potraviny -${lost} ks (${Math.round(spoilRate*100)}%).`, 'warning');
            SysLog('SKLAD', `⚠️ Zkažené potraviny ve skladu: -${lost} ks.`);
        }
    }

    // B2B korporátní požadavky každé 3 dny
    state.warehouse.b2bContracts = (state.warehouse.b2bContracts || []).filter(c => c.expiresDay >= state.day);
    if (state.day % 3 === 0) {
        const corpNames = ['NEXUS', 'FRESHFLOW', 'GLOBEX', 'META-LOG', 'ECO-TRANS'];
        const types = ['electronics', 'food', 'parts', 'fresh_food'];
        let itemType = types[Math.floor(Math.random() * types.length)];
        let qty = 200 + Math.floor(Math.random() * 301);
        let multiplier = 1.5;
        let id = `b2b_${Date.now()}_${Math.floor(Math.random()*10000)}`;
        state.warehouse.b2bContracts = state.warehouse.b2bContracts || [];
        state.warehouse.b2bContracts.push({ id, company: corpNames[Math.floor(Math.random() * corpNames.length)], itemType, qty, multiplier, expiresDay: state.day + 7 });
        notify('KORPORÁTNÍ POPTÁVKA', `Nový B2B kontrakt: ${itemType.toUpperCase()} × ${qty}, odměna x${multiplier}.`, 'info');
        SysLog('SKLAD', `🏢 Generován nový B2B kontrakt pro ${itemType} (${qty} ks).`);
    }

    // Reset minigame availability
    state.minigamePlayedToday = false;

    // Daily Maintenance Costs
    let cost = 2000 + ((state.vehicles||[]).length * 500) + ((state.ships||[]).length * 50000) + ((state.planes||[]).length * 100000); 
    addMoney(-cost);
    SysLog('EKONOMIKA', `📉 Denní fixní provozní náklady flotily: -${cost.toLocaleString()} Kč.`);
    
    if (state.bankDeposit > 0) {
        let interest = Math.floor(state.bankDeposit * 0.015);
        state.bankDeposit += interest;
        SysLog('BANKA', `🏦 Spořicí účet: připsán denní úrok 1.5% (+${interest.toLocaleString()} Kč).`);
    }
    
    // --- STRATEGICKÉ BANKOVNÍ DLUHY ---
    state.loans = state.loans || { overdraft: 0, dev: [], shark: null };
    
    // 1. Kontokorent: 0.5% denní úrok
    if (state.loans.overdraft > 0) {
        let interest = Math.floor(state.loans.overdraft * 0.005);
        state.loans.overdraft += interest;
        pushToTicker(`<b>KONTOKORENT:</b> Připočten denní úrok 0.5% (+${interest.toLocaleString()} Kč) k čerpané částce.`, "warning");
        SysLog('BANKA', `⚠️ Kontokorent: úrok +${interest.toLocaleString()} Kč.`);
    }
    
    // 2. Rozvojový úvěr
    if (state.loans.dev && state.loans.dev.length > 0) {
        for (let i = state.loans.dev.length - 1; i >= 0; i--) {
            let loan = state.loans.dev[i];
            if (state.money >= loan.dailyRepayment) {
                addMoney(-loan.dailyRepayment);
                loan.amount = Math.max(0, loan.amount - (loan.initialAmount / 10));
                loan.daysRemaining--;
                pushToTicker(`<b>BANKA:</b> Splátka rozvojového úvěru -${loan.dailyRepayment.toLocaleString()} Kč. Zbývá ${loan.daysRemaining} dní.`, "info");
                SysLog('BANKA', `Splacena anuitní splátka úvěru -${loan.dailyRepayment.toLocaleString()} Kč.`);
                if (loan.daysRemaining <= 0) {
                    state.loans.dev.splice(i, 1);
                    pushToTicker(`<b>BANKA:</b> Rozvojový úvěr s ručením ${loan.collateralVehicleModel} byl plně splacen! Uvolněno ručení.`, "success");
                    SysLog('BANKA', `✅ Úvěr s ručením ${loan.collateralVehicleModel} kompletně splacen!`);
                }
            } else {
                let vIndex = (state.vehicles||[]).findIndex(x => x.id === loan.collateralVehicleId);
                if (vIndex !== -1) {
                    let model = state.vehicles[vIndex].model;
                    state.vehicles.splice(vIndex, 1);
                    notify("BANKOVNÍ EXEKUCE", `Z důvodu nesplácení rozvojového úvěru banka zabavila ručené vozidlo ${model}!`, "danger");
                    pushToTicker(`<b>EXEKUCE MAJETKU:</b> Zabaveno ručené vozidlo ${model} pro nesplácení rozvojového úvěru.`, "danger");
                    SysLog('BANKA', `🚨 EXEKUCE: Banka zabavila vozidlo ${model}.`);
                } else {
                    notify("BANKOVNÍ EXEKUCE", `Z důvodu nesplácení rozvojového úvěru byla uvalena pokuta na reputaci a hotovost!`, "danger");
                    addMoney(-loan.amount);
                    state.reputation = Math.max(0, state.reputation - 20);
                }
                state.loans.dev.splice(i, 1);
            }
        }
    }
    
    // 3. Lichvář
    if (state.loans.shark) {
        let s = state.loans.shark;
        let interest = Math.floor(s.amount * 0.02);
        s.amount += interest;
        s.daysRemaining--;
        pushToTicker(`<b>LICHVÁŘ:</b> Připočten denní úrok 2% (+${interest.toLocaleString()} Kč). Do splacení zbývá ${s.daysRemaining} dní.`, "danger");
        SysLog('BANKA', `💀 Lichvář: denní úrok 2% (+${interest.toLocaleString()} Kč). Zbývá ${s.daysRemaining} dní.`);
        
        if (s.daysRemaining <= 0 && s.amount > 0) {
            let count = Math.ceil((state.vehicles||[]).length / 2);
            if (count > 0) {
                for (let i = 0; i < count; i++) {
                    state.vehicles.pop();
                }
                notify("LICHOŽROUTI", `Nesplatil jsi včas lichváři! Sebrali ti ${count} vozidel z flotily!`, "danger");
                pushToTicker(`<b>VÝSTRAHA LICHVÁŘŮ:</b> Flotila zredukována o ${count} aut za nesplacený dluh.`, "danger");
                SysLog('BANKA', `🚨 LICHVÁŘI ZABAVILI ${count} VOZIDEL!`);
            } else {
                state.reputation = Math.max(0, state.reputation - 50);
                notify("LICHOŽROUTI", `Nemáš žádná auta k zabavení! Zmlátili tvé lidi, reputace klesla o 50 bodů.`, "danger");
            }
            state.loans.shark = null;
        }
    }
    
    updateDebtSum();
    
    // BANKROT A EXEKUCE
    if (state.money < 0) {
        state.bankruptDays = (state.bankruptDays || 0) + 1;
        let daysRemaining = 3 - state.bankruptDays;
        if (daysRemaining > 0) {
            notify("BANKROT VÝSTRAHA", `Firma je v záporném zůstatku! Máš ${daysRemaining} dny na vyrovnání financí, jinak banka zahájí exekuci majetku!`, "danger");
            pushToTicker(`<b>VÝSTRAHA BANKROTU:</b> Firma je v mínusu. Zbývá ${daysRemaining} dní do exekuce.`, "danger");
            SysLog('EKONOMIKA', `🚨 VÝSTRAHA BANKROTU: ${daysRemaining} dní do nucené exekuce!`);
        } else {
            let allOwned = [];
            if (state.vehicles) state.vehicles.forEach(v => allOwned.push({ref: v, type: 'truck', db: CAR_DB}));
            if (state.ships) state.ships.forEach(s => allOwned.push({ref: s, type: 'ship', db: SHIP_DB}));
            if (state.planes) state.planes.forEach(p => allOwned.push({ref: p, type: 'plane', db: PLANE_DB}));
            if (state.buses) state.buses.forEach(b => allOwned.push({ref: b, type: 'bus', db: BUS_DB}));
            
            if (allOwned.length > 0) {
                let target = allOwned[Math.floor(Math.random() * allOwned.length)];
                let dbRef = target.db.find(x => x.model === target.ref.model);
                let price = dbRef ? dbRef.price : 500000;
                let debtReduction = Math.floor(price * 0.75);
                
                if (target.type === 'truck') {
                    state.vehicles = state.vehicles.filter(x => x.id !== target.ref.id);
                } else if (target.type === 'ship') {
                    state.ships = state.ships.filter(x => x.id !== target.ref.id);
                } else if (target.type === 'plane') {
                    state.planes = state.planes.filter(x => x.id !== target.ref.id);
                } else if (target.type === 'bus') {
                    state.buses = state.buses.filter(x => x.id !== target.ref.id);
                }
                
                state.debt = Math.max(0, state.debt - debtReduction);
                state.bankruptDays = 0;
                notify("BANKOVNÍ EXEKUCE", `Banka exekuovala vozidlo ${target.ref.model}! Tvůj dluh byl snížen o ${debtReduction.toLocaleString()} Kč.`, "danger");
                pushToTicker(`<b>EXEKUCE MAJETKU:</b> Zabaveno vozidlo ${target.ref.model} pro splacení dluhu.`, "danger");
                SysLog('BANKA', `🚨 EXEKUCE BANKROTU: Zabaveno ${target.ref.model}.`);
            } else if (state.machines && state.machines.length > 0) {
                let m = state.machines.pop();
                state.bankruptDays = 0;
                notify("BANKOVNÍ EXEKUCE", `Banka exekuovala tvůj stroj ${m.n}!`, "danger");
                pushToTicker(`<b>EXEKUCE MAJETKU:</b> Zabaven stroj ${m.n}.`, "danger");
            } else {
                state.reputation = Math.max(0, state.reputation - 50);
                state.bankruptDays = 0;
                notify("BANKOVNÍ EXEKUCE", `Banka nenašla žádný majetek! Reputace firmy klesla o 50 bodů.`, "danger");
                pushToTicker(`<b>EXEKUCE:</b> Nenašlo se žádné zabavitelné aktivum. Reputace snížena o 50 bodů.`, "danger");
            }
        }
    } else {
        state.bankruptDays = 0;
    }
    
    // Vyplácení termínovaných vkladů
    if (state.termDeposits && state.termDeposits.length > 0) {
        for(let i = state.termDeposits.length - 1; i >= 0; i--) {
            let d = state.termDeposits[i];
            d.daysLeft--;
            if(d.daysLeft <= 0) {
                let payout = Math.floor(d.initialAmount * d.rate);
                addMoney(payout);
                pushToTicker(`<b>BANKA:</b> Termínovaný vklad vypršel. Na účet připsáno +${payout.toLocaleString()} Kč!`, "success");
                SysLog('BANKA', `💰 Termínovaný vklad vyplacen: +${payout.toLocaleString()} Kč.`);
                state.termDeposits.splice(i, 1);
            }
        }
    }
    
    // Automatické vklady - Účetní Kateřina
    if (state.staff && state.staff.accountant && state.staff.accountant.active) {
        let lvl = state.staff.accountant.level || 1;
        let threshold = 1000000;
        let percent = 0.10;
        let depositDays = 3;
        
        if (lvl >= 5) {
            threshold = 500000;
            percent = 0.35;
            depositDays = 14;
        } else if (lvl >= 3) {
            threshold = 800000;
            percent = 0.20;
            depositDays = 7;
        }
        
        if (state.money > threshold) {
            let surplus = state.money - threshold;
            let investAmount = Math.floor(surplus * percent);
            if (investAmount >= 50000) {
                let rate = depositDays === 3 ? 1.015 : (depositDays === 7 ? 1.04 : 1.10);
                addMoney(-investAmount);
                state.termDeposits = state.termDeposits || [];
                state.termDeposits.push({
                    id: Math.random().toString(36).substr(2, 5),
                    amount: investAmount,
                    daysLeft: depositDays,
                    rate: rate,
                    initialAmount: investAmount
                });
                pushToTicker(`<b>ÚČETNÍ KATEŘINA:</b> Automaticky uložila nadbytečnou hotovost ${investAmount.toLocaleString()} Kč na ${depositDays} dní s úrokem ${(rate * 100 - 100).toFixed(0)}%.`, "success");
                SysLog('BANKA', `Kateřina reinvestovala ${investAmount.toLocaleString()} Kč do termínovaného vkladu.`);
                if (typeof renderTermDeposits === 'function') renderTermDeposits();
            }
        }
    }
    
    // Stroje & Dividendy
    let machInc = 0; let cryptoInc = 0;
    (state.machines || []).forEach(m => { 
        const mdb = (typeof MACHINES_DB !== 'undefined') ? MACHINES_DB.find(x=>x.id===m.id) : null; 
        if(mdb) {
            machInc += mdb.inc || 0; 
            if(mdb.incCrypto) cryptoInc += mdb.incCrypto;
        } else {
            machInc += m.inc || 0;
        }
    });
    if(machInc > 0) { 
        addMoney(machInc); 
        state.stats.totalEarned += machInc; 
        notify("TĚŽBA & DIVIDENDY", `Pasivní příjmy přes noc vydělaly +${machInc.toLocaleString()} Kč!`, "success"); 
        SysLog('EKONOMIKA', `⚙️ Pasivní dividendy ze strojů a podílů: +${machInc.toLocaleString()} Kč.`);
    }
    if(cryptoInc > 0) { 
        state.investments.crypto = (state.investments.crypto || 0) + cryptoInc; 
        notify("SERVERY", `Kryptofarma přes noc vytěžila +${cryptoInc} JirstanCoinů!`, "gold"); 
        SysLog('EKONOMIKA', `🪙 Vytěženo +${cryptoInc} JirstanCoinů.`);
        renderInvestments(); 
    }

    // Akciový a kryptoměnový trh
    state.market = state.market || {};
    Object.keys(state.market).forEach(id => {
        const db = MARKET_DB[id]; const m = state.market[id];
        if (!db || !m) return;
        let change = 1 + (Math.random() * db.risk * 2 - db.risk) + db.drift;
        
        if(id === 'crypto') {
            change += 0.01;
            if (Math.random() < 0.1) {
                change += Math.random() * 0.4;
            }
        }

        m.price *= change; 
        
        if(id === 'crypto' && m.price < 15) {
            m.price = 15;
        } else if (m.price < 1) {
            m.price = 1;
        }

        m.history = m.history || [];
        m.history.push(m.price); if(m.history.length > 30) m.history.shift();
    });

    // Personál contracts countdown
    state.staff = state.staff || {};
    Object.keys(state.staff).forEach(k => {
        if(state.staff[k] && state.staff[k].active) {
            state.staff[k].days--;
            if(state.staff[k].days <= 0) { 
                state.staff[k].active = false; 
                notify("HR ODDĚLENÍ", `${STAFF_DEFS[k]?.n || k} nemá smlouvu a přestal pracovat!`, "warning"); 
                SysLog('HR', `⚠️ Vypršela pracovní smlouva personálu: ${STAFF_DEFS[k]?.n || k}.`);
            }
        }
    });
    
    if (state.insurance && state.insurance.active) {
        state.insurance.days--;
        if (state.insurance.days <= 0) {
            state.insurance.active = false;
            notify("POJIŠŤOVNA", "Vypršela ti platnost firemního pojištění!", "warning");
        }
        renderInsurance();
    }
    
    // Gas Network Income
    if (state.gasNetwork && state.gasNetwork.level > 0) {
        let gasIncome = state.gasNetwork.level * 15000;
        if (state.gasNetwork.hasShop) gasIncome *= 1.2;
        if (state.gasNetwork.hasDiner) gasIncome += 35000;
        if (state.gasNetwork.hasBistro) gasIncome += 25000;
        
        if (gasIncome > 0) {
            gasIncome = Math.floor(gasIncome);
            addMoney(gasIncome);
            state.stats.totalEarned += gasIncome;
            pushToTicker(`<b>SÍŤ BENZÍNEK:</b> Denní příjem z tvých benzínek činí +${gasIncome.toLocaleString()} Kč.`, "success");
            SysLog('EKONOMIKA', `⛽ Denní příjem ze sítě benzínek: +${gasIncome.toLocaleString()} Kč.`);
        }
    }

    // Autobusová divize
    state.buses = state.buses || [];
    state.buses.forEach(bus => {
        if(!bus.routeId) return;
        const route = (typeof BUS_ROUTES !== 'undefined') ? BUS_ROUTES.find(r => r.id === bus.routeId) : null;
        if(!route) return;

        bus.cleanliness = Math.max(0, (bus.cleanliness || 100) - 5);

        let economyMultiplier = state.economyBuff > 0 ? 1.2 : 1.0;
        let incomeMultiplier = (1 + ((state.hq.logistics_center||0) * 0.03)) * economyMultiplier;
        
        if (bus.cleanliness < 50) {
            incomeMultiplier *= 0.8;
        }
        
        if (bus.upgrades && bus.upgrades.engine) incomeMultiplier *= 1.1;
        if (bus.upgrades && bus.upgrades.interior) incomeMultiplier *= 1.05;
        
        const revenue = Math.floor(route.dailyIncome * incomeMultiplier);
        addMoney(revenue);
        state.stats.totalEarned += revenue;

        bus.fuel = Math.max(0, (bus.fuel || 100) - route.fuelCost);
        bus.cond = Math.max(0, (bus.cond || 100) - route.condLoss);

        SysLog('FLOTILA', `🚌 Autobus ${bus.model} na lince ${route.name}: tržba +${revenue.toLocaleString()} Kč, palivo ${bus.fuel}%.`);

        if(bus.fuel <= 5 || bus.cond <= 10 || bus.cleanliness <= 20) {
            notify("AUTOBUSY", `Autobus ${bus.model} potřebuje doplnit palivo, servis nebo úklid na trase ${route.name}.`, "warning");
            if(bus.fuel <= 5) bus.routeId = null;
            if(bus.cond <= 10) bus.routeId = null;
            if(bus.cleanliness <= 20) bus.routeId = null;
        }
    });

    // Autobazar – obnovení nabídky každé 3 dny
    if (state.day % 3 === 0 || !state.bazaarMarket || state.bazaarMarket.length === 0 || !state.usedCars || state.usedCars.length === 0) {
        generateBazaarMarket();
        genUsedCars();
        notify("BAZAR OJETIN", "Trh ojetých vozidel byl obměněn novou nabídkou!", "info");
        SysLog('AUTOBAZAR', '🚗 Trh ojetin a autobazaru kompletně obměněn.');
    }
    generateBazaarOffers();

    if(document.getElementById('tab-dealer') && document.getElementById('tab-dealer').classList.contains('active')) renderDealer();

    const beforeCount = (state.contracts || []).length;
    state.contracts = (state.contracts || []).filter(c => c.deadlineDay > state.day);
    if(state.contracts.length < beforeCount) notify("PENÁLE", "Některé firemní smlouvy expirovaly!", "warning");

    // Cleanliness decay for active jobs
    (state.vehicles || []).forEach(v => {
        if(v.job) v.cleanliness = Math.max(0, (v.cleanliness || 100) - 5);
    });
    
    (state.ships || []).forEach(s => {
        if(s.job) s.cleanliness = Math.max(0, (s.cleanliness || 100) - 8);
    });
    
    // Auto wash staff
    state.carwash = state.carwash || { level: 1, autoWashStaff: false, waxActivated: false, waxUntil: 0 };
    if (state.carwash.autoWashStaff) {
        let autoWashCost = 0;
        (state.vehicles || []).forEach(v => {
            if ((v.cleanliness || 100) < 40) {
                let washCost = state.carwash.recycleWater ? 0 : Math.max(100000, 200000 - ((state.carwash.level || 1) * 20000));
                if (state.money >= washCost) {
                    if (washCost > 0) addMoney(-washCost);
                    v.cleanliness = 100;
                    autoWashCost += washCost;
                    if (state.carwash.waxActivated && state.carwash.waxUntil > state.day) {
                        v.shinyUntil = state.day + 3;
                    }
                }
            }
        });
        
        (state.ships || []).forEach(s => {
            if ((s.cleanliness || 100) < 40) {
                let washCost = state.carwash.recycleWater ? 0 : Math.max(100000, 200000 - ((state.carwash.level || 1) * 20000));
                if (state.money >= washCost) {
                    if (washCost > 0) addMoney(-washCost);
                    s.cleanliness = 100;
                    autoWashCost += washCost;
                }
            }
        });
        
        if (autoWashCost > 0) {
            pushToTicker(`<b>AUTOMYČKA:</b> Automatický personál umyl vozidla. Výdaje: -${autoWashCost.toLocaleString()} Kč`, "info");
            SysLog('MYČKA', `🚿 AutoWash personál umyl znečištěná vozidla (-${autoWashCost.toLocaleString()} Kč).`);
        }
    }

    if (state.carwash.waxActivated && state.carwash.waxUntil <= state.day) {
        state.carwash.waxActivated = false;
        pushToTicker(`<b>AUTOMYČKA:</b> Voskování PREMIUM vypršelo.`, "warning");
    }

    // Denní náhodné události (10% šance)
    if (Math.random() < 0.1) {
        const dailyEvents = [
            { msg: "Aviation Strike! Letecké zakázky mají 50% bonus na příští 3 dny.", type: "good", effect: () => { state.planeBonus = { active: true, endDay: state.day + 3, multiplier: 1.5 }; } },
            { msg: "Fuel Discount! Cena nafty klesla o 20% na příští 2 dny.", type: "good", effect: () => { state.fuelDiscount = { active: true, endDay: state.day + 2, discount: 0.2 }; } },
            { msg: "Port Congestion! Lodní zakázky trvají o 50% déle.", type: "bad", effect: () => { state.shipPenalty = { active: true, endDay: state.day + 2, multiplier: 1.5 }; } },
            { msg: "Highway Toll Increase! Pozemní doprava stojí o 15% více.", type: "bad", effect: () => { state.roadPenalty = { active: true, endDay: state.day + 3, costIncrease: 0.15 }; } },
            { msg: "Economic Boom! Všechny zakázky mají 25% bonus na příští den.", type: "good", effect: () => { state.economyBuff = 1; } },
            { msg: "Weather Delay! Všechny trasy trvají o 20% déle.", type: "bad", effect: () => { state.weatherPenalty = { active: true, endDay: state.day + 1, multiplier: 1.2 }; } },
            { msg: "Driver Bonus Program! Řidiči mají +20 energie.", type: "good", effect: () => { state.drivers.forEach(d => d.energy = Math.min(100, d.energy + 20)); } },
            { msg: "Insurance Premium Rise! Pojištění stojí o 50% více.", type: "bad", effect: () => { state.insurancePenalty = { active: true, endDay: state.day + 5, multiplier: 1.5 }; } },
            { msg: "Market Surplus! Ceny komodit klesly o 15%.", type: "good", effect: () => { Object.keys(state.marketPrices).forEach(k => state.marketPrices[k] = Math.floor(state.marketPrices[k] * 0.85)); } },
            { msg: "Supply Chain Disruption! Skladovací kapacita snížena o 20%.", type: "bad", effect: () => { state.warehouse.capacity = Math.floor(state.warehouse.capacity * 0.8); } }
        ];
        
        const event = dailyEvents[Math.floor(Math.random() * dailyEvents.length)];
        event.effect();
        
        const color = event.type === "good" ? "success" : "warning";
        notify("NEWS FLASH", event.msg, color);
        pushToTicker(`<b>NEWS FLASH:</b> ${event.msg}`, color);
        SysLog('SYSTÉM', `📰 Náhodná událost: ${event.msg}`);
    }

    // Update finance and warehouse history
    state.financeHistory = state.financeHistory || { money: [state.money], crypto: [state.investments.crypto || 0], day: [state.day] };
    state.financeHistory.money.push(state.money);
    state.financeHistory.crypto.push(state.investments.crypto || 0);
    state.financeHistory.day.push(state.day);
    if (state.financeHistory.money.length > 30) {
        state.financeHistory.money.shift();
        state.financeHistory.crypto.shift();
        state.financeHistory.day.shift();
    }

    state.warehouseHistory = state.warehouseHistory || { capacity: [state.warehouse.capacity], stock: [0], day: [state.day] };
    let totalStock = (state.warehouse.stock.electronics || 0) + (state.warehouse.stock.food || 0) + (state.warehouse.stock.parts || 0) + (state.warehouse.stock.fresh_food || 0);
    state.warehouseHistory.capacity.push(state.warehouse.capacity);
    state.warehouseHistory.stock.push(totalStock);
    state.warehouseHistory.day.push(state.day);
    if (state.warehouseHistory.capacity.length > 30) {
        state.warehouseHistory.capacity.shift();
        state.warehouseHistory.stock.shift();
        state.warehouseHistory.day.shift();
    }

    // Tower Floor 5: +20% reputation bonus
    if (state.tower.floors.includes(5)) {
        state.reputation = Math.min(150, state.reputation + 2);
        pushToTicker(`<b>JIRSTAN TOWER:</b> Exekutivní Suite zvýšil reputaci firmy o +2.`, "success");
        SysLog('VĚŽ', '🏢 Exekutivní Suite vygeneroval +2 reputace.');
    }

    // PR Decay & marketing campaigns
    state.marketingCampaigns = state.marketingCampaigns || { paper: 0, radio: 0, tv: 0 };
    let decayReduction = 0;
    if (state.marketingCampaigns.paper > 0) { state.marketingCampaigns.paper--; decayReduction += 0.5; }
    if (state.marketingCampaigns.radio > 0) { state.marketingCampaigns.radio--; decayReduction += 1.0; }
    if (state.marketingCampaigns.tv > 0) { state.marketingCampaigns.tv--; decayReduction += 2.0; }
    if (state.billboardUntil && state.billboardUntil > state.day) decayReduction += 1.5;
    
    let baseDecay = 3.0;
    let prDecay = Math.max(0.5, baseDecay - decayReduction);
    if (state.jirstanPressure && state.jirstanPressure.eventType === 'pr_sabotage') prDecay *= 2;
    
    state.reputation = Math.max(0, state.reputation - prDecay);
    pushToTicker(`<b>PR AGENTURA:</b> Přirozený denní úpadek PR: -${prDecay} reputace. (Kampaně utlumily decay o -${decayReduction})`, "warning");

    // Ekonomický tlak Jirstan Corp
    state.jirstanPressure = state.jirstanPressure || { eventType: null, daysLeft: 0, targetCity: null, originalFuelPrice: null };
    if (state.jirstanPressure.daysLeft > 0) {
        state.jirstanPressure.daysLeft--;
        if (state.jirstanPressure.daysLeft === 0) {
            if (state.jirstanPressure.eventType === 'fuel_monopoly') {
                if (state.jirstanPressure.originalFuelPrice !== null) {
                    state.fuelPrice = state.jirstanPressure.originalFuelPrice;
                }
            }
            pushToTicker(`<b>JIRSTAN CORP:</b> Ekonomický tlak v oblasti skončil.`, "success");
            notify("JIRSTAN CORP", "Ekonomický nátlak konkurence pominul.", "success");
            state.jirstanPressure.eventType = null;
            state.jirstanPressure.targetCity = null;
        }
    }
    
    // Spuštění nového eventu pokud žádný neběží a máme šanci (15% šance každý den, nebo 7% pokud máme Joint Venture)
    let pressureChance = state.jirstanJointVenture ? 0.07 : 0.15;
    if ((!state.jirstanPressure || !state.jirstanPressure.eventType) && Math.random() < pressureChance) {
        const events = ['dumping', 'fuel_monopoly', 'pr_sabotage'];
        const chosen = events[Math.floor(Math.random() * events.length)];
        
        state.jirstanPressure = state.jirstanPressure || {};
        state.jirstanPressure.eventType = chosen;
        
        if (chosen === 'dumping') {
            // Dumpingové ceny: vybereme město, kde má hráč aktuálně nejvíce aut, nebo náhodné město z CITIES
            let citiesWithTrucks = state.vehicles.map(v => v.loc).filter(loc => CITIES[loc]);
            let target = 'Praha';
            if (citiesWithTrucks.length > 0) {
                target = citiesWithTrucks[Math.floor(Math.random() * citiesWithTrucks.length)];
            } else {
                let keys = Object.keys(CITIES);
                target = keys[Math.floor(Math.random() * keys.length)];
            }
            state.jirstanPressure.daysLeft = 3;
            state.jirstanPressure.targetCity = target;
            notify("JIRSTAN CORP - DUMPING", `Jirstan nasadil dumpingové ceny v oblasti ${target}! Výnosy klesly o 40%.`, "danger");
            pushToTicker(`<b>JIRSTAN CORP:</b> Dumpingové ceny v oblasti ${target}! Trh nasycen konkurencí na 3 dny.`, "danger");
        } else if (chosen === 'fuel_monopoly') {
            state.jirstanPressure.daysLeft = 2;
            state.jirstanPressure.originalFuelPrice = state.fuelPrice;
            state.fuelPrice = 45.00;
            notify("JIRSTAN CORP - MONOPOL", `Jirstan skoupil palivové rezervy! Globální cena nafty zvýšena na 45.00 Kč/l!`, "danger");
            pushToTicker(`<b>JIRSTAN CORP:</b> Monopolní nákup nafty! Cena zmrazena na 45.00 Kč/l na 2 dny.`, "danger");
        } else if (chosen === 'pr_sabotage') {
            state.jirstanPressure.daysLeft = 2;
            state.reputation = Math.max(0, state.reputation - 15);
            notify("JIRSTAN CORP - ANTIKAMPAŇ", `Jirstan spustil diskreditační kampaň! Naše reputace okamžitě klesla o 15 a úpadek PR je dvojnásobný!`, "danger");
            pushToTicker(`<b>JIRSTAN CORP:</b> Diskreditační kampaň. Reputace -15 a dvojnásobný PR Decay.`, "danger");
        }
    }

    checkAchievements(); renderInvestments(); renderStaffHire(); drawMarketChart(); drawWarehouseChart(); renderStats(); renderContracts(); saveGame();
}

// --- VYKRESLOVACÍ FUNKCE A AKCE ---

function renderOverview() { 
    const tbody = document.getElementById('overview-body'); 
    const tbodyOv = document.getElementById('overview-overseas-body');
    if(!tbody || !tbodyOv) return; 
    
    tbody.innerHTML = state.vehicles.map(v => { 
        const d = state.drivers.find(x => x.id == v.driverId); 
        
        let status = '';
        if (v.job) {
            status = `<span style="color:${v.job.isBlackMarket ? 'var(--red)' : 'var(--orange)'}; font-weight:600">${v.job.isBlackMarket ? '☠️ ILLEGÁLNÍ TRASA' : 'Trasa'} → ${v.job.dest} (${Math.floor(v.progress)}%)</span>`;
            if (v.queue && v.queue.length > 0) {
                status += `<br><span style="font-size:11px; color:var(--gold); display:inline-block; margin-top:4px">+ ${v.queue.length} čeká ve frontě</span>`;
            }
        } else {
            status = '<span style="color:var(--green)">Čeká v garáži</span>';
        }

        let acts = ''; 
        if (d && !v.job) acts = `<button class="btn btn-dark btn-sm" onclick="forceRest(${d.id})">POSLAT SPÁT</button>`; 
        if (v.queue && v.queue.length > 0) acts += `<button class="btn btn-red btn-sm" onclick="clearQueue(${v.id}, 'truck')">ZRUŠIT FRONTU</button>`;
        if (d && !v.job && d.energy < 100) acts += `<button class="btn btn-dark btn-sm" onclick="giveCoffee(${d.id})">☕ KÁVA (5k)</button>`;

        let dTitle = "";
        if(d) {
            if(d.level >= 20) dTitle = '<span style="color:var(--gold); font-size:10px; border:1px solid var(--gold); padding:2px; border-radius:3px">MISTR</span>';
            else if (d.level >= 10) dTitle = '<span style="color:var(--purple); font-size:10px; border:1px solid var(--purple); padding:2px; border-radius:3px">ELITA</span>';
        }

        return `<tr>
          <td><b style="color:var(--blue); font-size:15px">${v.model}</b> <span style="font-size:11px; color:var(--text-muted)">(${v.type})</span>${v.trailer ? `<br><span style="font-size:11px; color:var(--gold)">+ Návěs</span>`:''}</td>
          <td>${d ? `<b style="color:white">${d.name}</b> ${dTitle}` : '<span style="color:var(--red)">Bez řidiče</span>'}</td>
          <td>${status}</td>
          <td style="width: 15%">
            <div class="xp-bar-bg" style="margin:0"><div class="xp-bar-fill" style="width:${Math.floor(v.fuel)}%; background:var(--red)"></div></div>
          </td>
          <td><b style="color:${d && d.energy>50?'var(--green)':'var(--red)'}">${d ? Math.floor(d.energy)+'%' : '-'}</b></td>
          <td><b style="color:white">${d ? Math.floor(d.morale)+'%' : '-'}</b></td>
          <td>${acts}</td>
        </tr>`; 
    }).join(''); 
    
    // ZÁMOŘÍ V OVERVIEW
    let ovHtml = '';
    const renderOvRow = (v, isShip) => {
        let status = '';
        if (v.job) {
            status = `<span style="color:var(--cyan); font-weight:600">Trasa → ${v.job.dest} (${Math.floor(v.progress)}%)</span>`;
            if (v.queue && v.queue.length > 0) status += `<br><span style="font-size:11px; color:var(--gold); display:inline-block; margin-top:4px">+ ${v.queue.length} čeká ve frontě</span>`;
        } else {
            status = `<span style="color:var(--green)">V ${isShip?'přístavu':'hangáru'}</span>`;
        }
        let acts = (v.queue && v.queue.length > 0) ? `<button class="btn btn-red btn-sm" onclick="clearQueue(${v.id}, '${isShip?'ship':'plane'}')">ZRUŠIT FRONTU</button>` : '';
        return `<tr>
          <td><b style="color:${isShip?'#0072ff':'#ffffff'}; font-size:15px">${isShip?'🚢':'✈️'} ${v.model}</b></td>
          <td><span style="color:var(--text-muted)">Automatická Posádka</span></td>
          <td>${status}</td>
          <td style="width: 15%"><div class="xp-bar-bg" style="margin:0"><div class="xp-bar-fill" style="width:${Math.floor(v.fuel)}%; background:var(--orange)"></div></div></td>
          <td><b style="color:${v.cond < 50 ? 'var(--red)' : 'var(--green)'}">${Math.floor(v.cond)}%</b></td>
          <td>-</td>
          <td>${acts}</td>
        </tr>`;
    };
    state.ships.forEach(s => ovHtml += renderOvRow(s, true));
    state.planes.forEach(p => ovHtml += renderOvRow(p, false));
    tbodyOv.innerHTML = ovHtml || '<tr><td colspan="7" style="text-align:center; color:var(--text-muted)">Zámořská divize zatím nevlastní žádné stroje.</td></tr>';
}

function clearQueue(vid, type) {
    let arr = state.vehicles;
    if(type === 'ship') arr = state.ships;
    if(type === 'plane') arr = state.planes;
    
    const v = arr.find(x => x.id == vid);
    if (v && v.queue && v.queue.length > 0) {
        state.offers.push(...v.queue);
        v.queue = [];
        notify("PLÁNOVAČ", `Fronta pro ${v.model} byla zrušena. Zakázky jsou zpět na burze.`, "info");
        renderOverview(); renderDispatch(); renderAuction(); saveGame();
    }
}

function forceRest(did) { const d = state.drivers.find(x=>x.id==did); if(d) { const absTime = state.day * 1440 + state.hour * 60 + state.minute; let hours = 8; if(state.factions.fresh >= 1000) hours = 6; d.restUntil = absTime + (hours * 60); d.energy = 100; notify("ODPOČINEK", `${d.name} poslán spát na ${hours} hodin.`, "info"); renderOverview(); renderHR(); saveGame(); } }

function giveCoffee(did) {
    if(state.money >= 5000) {
        addMoney(-5000);
        let d = state.drivers.find(x=>x.id==did);
        if(d) {
            d.energy = Math.min(100, d.energy + 30);
            notify("KÁVA", `${d.name} doplnil energii energetickým drinkem!`, "info");
            renderOverview(); renderHR(); saveGame();
        }
    } else {
        notify("CHYBA", "Na kávu chybí peníze.", "warning");
    }
}

function renderDispatch() { 
    const el = document.getElementById('dispatch-grid'); if (!el) return; 
    let active = [];
    state.vehicles.forEach(v => { if(v.job) active.push({...v, vCat: 'truck'}) });
    state.ships.forEach(s => { if(s.job) active.push({...s, vCat: 'ship'}) });
    state.planes.forEach(p => { if(p.job) active.push({...p, vCat: 'plane'}) });
    
    el.innerHTML = active.length ? active.map(v => {
        let qText = (v.queue && v.queue.length > 0) ? `<span style="color:var(--gold); font-size:12px; margin-left:10px;">(Další: ${v.queue[0].dest} + ${v.queue.length - 1})</span>` : '';
        let bColor = v.job.isBlackMarket ? 'var(--red)' : 'var(--blue)';
        let driverName = state.drivers.find(x=>x.id==v.driverId)?.name || 'Neznámý';
        if(v.vCat === 'ship') { bColor = '#0072ff'; driverName = 'Lodní posádka'; }
        if(v.vCat === 'plane') { bColor = '#ffffff'; driverName = 'Piloti a obsluha'; }
        
        return `<div class="card" style="border-left:4px solid ${bColor}; ${v.job.isBlackMarket ? 'animation: pulseGlow 2s infinite;' : ''}">
            <div class="card-body">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px">
                    <b style="font-size:16px; color:${bColor}">${v.vCat==='ship'?'🚢':v.vCat==='plane'?'✈️':''} ${v.model}</b>
                    <b style="color:white; font-size:15px">→ ${v.job.dest} ${qText}</b>
                </div>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:12px">
                    Náklad: <span style="color:${v.job.isBlackMarket ? 'var(--red)' : 'var(--orange)'}; font-weight:bold">${v.job.cargo || 'Zboží'} ${v.job.isBlackMarket ? '☠️' : ''}</span><br>
                    Posádka: <span style="color:white">${driverName}</span>
                </div>
                <div class="xp-bar-bg"><div class="xp-bar-fill" style="width:${v.progress}%; background:${bColor}; transition:width 1s linear"></div></div>
            </div>
        </div>`;
    }).join('') : '<div style="color:var(--text-muted); font-style:italic">Nikdo není momentálně na cestě.</div>'; 
}

function renderFleet() {
    const el = document.getElementById('fleet-grid');
    if (!el) return;
    el.innerHTML = state.vehicles.map(v => {
        const drOpts = state.drivers.map(dr => `<option value="${dr.id}" ${dr.id == v.driverId ? 'selected' : ''}>${dr.name}</option>`).join('');
        
        let wearColor = v.wear > 80 ? 'var(--red)' : (v.wear > 50 ? 'var(--orange)' : 'var(--green)');
        let wearText = `Opotřebení: <b style="color:${wearColor}">${Math.floor(v.wear)}%</b>`;
        
        let cleanliness = v.cleanliness !== undefined ? v.cleanliness : 100;
        let cleanlinessColor = cleanliness > 65 ? 'var(--green)' : (cleanliness > 35 ? 'var(--orange)' : 'var(--red)');
        let cleanlinessText = `Čistota: <b style="color:${cleanlinessColor}">${Math.floor(cleanliness)}%</b>`;
        
        let partsText = v.partQuality === 'cheap' ? '<span style="color:var(--red)">Levné (Druhovýroba)</span>' : (v.partQuality === 'premium' ? '<span style="color:var(--green)">Prémiové</span>' : 'Standardní');
        
        let statusHtml = '';
        if (v.isBroken) {
            statusHtml = `<div style="color:var(--red); font-weight:bold; margin-bottom:10px; animation:blink 1.5s infinite">🔴 NEPOJÍZDNÉ (PORUCHA NA TRASE)</div>
                          <button class="btn btn-red btn-sm" onclick="towToZajezd(${v.id})" style="width:100%; margin-bottom:10px; font-family:'Orbitron'">ODTAHNOUT DO ZÁJEZDU (15k Kč)</button>`;
        }
        
        let washCost = state.carwash.recycleWater ? 500 : Math.max(1000, 5000 - (state.carwash.level * 800));
        let washBtn = `<button class="btn btn-sm btn-teal" style="margin-top:10px; width:100%;" onclick="washActiveVehicle(${v.id})" ${(v.job || v.isBroken) ? 'disabled' : ''}>🧽 MÝT V MYČCE (${washCost.toLocaleString()} Kč)</button>`;
        
        const dbCar = CAR_DB.find(x => x.model === v.model) || { img: '' };
        const imgHtml = dbCar.img ? `<img src="${dbCar.img}" class="card-img" onerror="this.src='https://via.placeholder.com/400x240/111/ff9d00?text=${v.model.replace(/\\s/g,'+')}'">` : `<div class="card-img" style="background:#111; display:flex; align-items:center; justify-content:center; color:#555;">🚗 Bez obrázku</div>`;
        
        return `<div class="card" style="${v.isBroken ? 'border: 2px solid var(--red);' : ''}">
                    ${imgHtml}
                    <div class="card-body">
                        <h3 style="margin:0; color:var(--blue)">${v.model}</h3>
                        <div style="font-size:12px; color:var(--text-muted); margin-bottom:6px; margin-top:5px">Typ podvozku: ${v.type.toUpperCase()}</div>
                        <div style="font-size:12px; margin-bottom:6px">${cleanlinessText} | Díly: <b>${partsText}</b></div>
                        <div style="font-size:12px; margin-bottom:10px">${wearText}</div>
                        ${statusHtml}
                        <select style="width:100%; padding:10px; background:rgba(0,0,0,0.5); color:white; border:1px solid var(--border-light); border-radius:6px; font-family:'Inter'; margin-bottom:10px;" onchange="assignDriver(${v.id}, this.value)" ${v.isBroken ? 'disabled' : ''}>
                            <option value="">- Vyber řidiče -</option>
                            ${drOpts}
                        </select>
                        ${washBtn}
                        <button class="btn btn-red" style="margin-top:10px; width:100%;" onclick="sellCar(${v.id})" ${v.job || v.isBroken ? 'disabled' : ''}>PRODAT DO BAZARU</button>
                    </div>
                </div>`;
    }).join('');
}
function assignDriver(vid, did) { const v = state.vehicles.find(x => x.id == vid); if(v) v.driverId = did ? parseInt(did) : null; saveGame(); renderOverview(); renderFleet(); }
function sellCar(vid) { const v = state.vehicles.find(x => x.id == vid); if(v && !v.job) { state.vehicles = state.vehicles.filter(x => x.id != vid); addMoney(150000); renderAll(); saveGame(); } else notify("CHYBA", "Auto je na cestě!", "warning"); }

function washActiveVehicle(vid) {
    let v = state.vehicles.find(x => x.id == vid);
    if (!v) return;
    if (v.job || v.isBroken) { notify("CHYBA", "Vozidlo je na cestě a nelze ho umýt!", "warning"); return; }
    
    let washCost = state.carwash.recycleWater ? 500 : Math.max(1000, 5000 - (state.carwash.level * 800));
    if (state.money < washCost) { notify("FINANCE", "Nemáš dost peněz na mytí!", "warning"); return; }
    
    addMoney(-washCost);
    v.cleanliness = 100;
    
    if (state.carwash.waxActivated && state.carwash.waxUntil > state.day) {
        v.shinyUntil = state.day + 3;
    }
    
    notify("MYČKA", `Vozidlo ${v.model} bylo úspěšně umyto.`, "success");
    pushToTicker(`<b>MYČKA:</b> Vozidlo ${v.model} bylo umyto za ${washCost.toLocaleString()} Kč.`, "success");
    renderFleet();
    saveGame();
}

function towToZajezd(vid) {
    let v = state.vehicles.find(x => x.id == vid);
    if (!v) return;
    
    const cost = 15000;
    if (state.money >= cost) {
        addMoney(-cost);
        state.reputation = Math.max(0, state.reputation - 5); // Nedoručená zakázka kvůli poruše
        v.isBroken = false;
        v.wear = 0;
        v.cond = 30; // low cond, must be repaired in Workshop
        v.loc = 'Praha';
        v.job = null;
        v.progress = 0;
        notify("ODTAHOVKA", `Vozidlo ${v.model} odtaženo do Autodílny Zájezd. Opotřebení resetováno. Proveď opravu stavu!`, "success");
        pushToTicker(`<b>ODTAHOVKA:</b> ${v.model} odtaženo do Zájezdu (-15 000 Kč).`, "success");
        renderFleet();
        renderWorkshop();
        saveGame();
    } else {
        notify("FINANCE", "Nemáš 15 000 Kč na odtahovou službu!", "warning");
    }
}

// --- ZÁMOŘÍ RENDERING (V4.0) ---
function renderOverseas() {
    const elMy = document.getElementById('overseas-my-grid');
    const elShop = document.getElementById('overseas-shop-grid');
    if (!elMy || !elShop) return;

    elMy.innerHTML = [
        ...state.ships.map(s => `<div class="card" style="border-top:3px solid #0072ff"><div class="card-body"><h3 style="color:#0072ff;margin-top:0">🚢 ${s.model}</h3><div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Stav: ${Math.floor(s.cond)}% | Palivo: ${Math.floor(s.fuel)}%</div><div class="xp-bar-bg" style="margin-bottom:10px"><div class="xp-bar-fill" style="width:${s.cond}%;background:${s.cond<50?'red':'green'}"></div></div></div></div>`),
        ...state.planes.map(p => `<div class="card" style="border-top:3px solid #ffffff"><div class="card-body"><h3 style="color:white;margin-top:0">✈️ ${p.model}</h3><div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Stav: ${Math.floor(p.cond)}% | Palivo: ${Math.floor(p.fuel)}%</div><div class="xp-bar-bg" style="margin-bottom:10px"><div class="xp-bar-fill" style="width:${p.cond}%;background:${p.cond<50?'red':'green'}"></div></div></div></div>`)
    ].join('') || '<div style="color:var(--text-muted); grid-column: span 3;">Zatím nevlastníš žádné zámořské stroje. Vylepši HQ a zakup je v sekci níže.</div>';

    elShop.innerHTML = [
        ...SHIP_DB.map((s,i) => `<div class="card"><img src="${s.img}" class="card-img" onerror="this.src='https://via.placeholder.com/400x240/111/0072ff?text=${s.model.replace(/\s/g,'+')}'"><div class="card-body"><h3 style="margin-top:0">🚢 ${s.model}</h3><div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Rychlost: ${s.spd} | Spotřeba: ${s.fuelReq}</div><b style="color:var(--orange);font-size:18px">${s.price.toLocaleString()} Kč</b><button class="btn btn-blue" onclick="buyOverseas('ship', ${i})">KOUPIT</button></div></div>`),
        ...PLANE_DB.map((p,i) => `<div class="card"><img src="${p.img}" class="card-img" onerror="this.src='https://via.placeholder.com/400x240/111/fff?text=${p.model.replace(/\s/g,'+')}'"><div class="card-body"><h3 style="margin-top:0">✈️ ${p.model}</h3><div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Rychlost: ${p.spd} | Spotřeba: ${p.fuelReq}</div><b style="color:var(--orange);font-size:18px">${p.price.toLocaleString()} Kč</b><button class="btn btn-dark" onclick="buyOverseas('plane', ${i})">KOUPIT</button></div></div>`)
    ].join('');
}

function buyOverseas(type, idx) {
    let db = type === 'ship' ? SHIP_DB : PLANE_DB;
    let item = db[idx];
    let reqLvl = type === 'ship' ? state.hq.port_hub : state.hq.airport_hangar;
    let amt = type === 'ship' ? state.ships.length : state.planes.length;

    if (reqLvl <= amt) return notify("KAPACITA", `Vylepši v HQ ${type==='ship'?'Přístav':'Hangár'}!`, "warning");
    if (state.money < item.price) return notify("FINANCE", "Nemáš dostatek peněz!", "warning");

    addMoney(-item.price);
    let newItem = {...item, type: item.cat, id: Date.now(), progress: 0, fuel: 100, cond: 100, job: null, queue: []};
    if(type === 'ship') state.ships.push(newItem); else state.planes.push(newItem);
    notify("NÁKUP", `Zakoupen ${item.model}`, "success");
    renderOverseas(); saveGame();
}

function renderTrailers() {
    const my = document.getElementById('trailers-my');
    const shop = document.getElementById('trailers-shop');
    if(!my || !shop) return;
    my.innerHTML = state.trailers.map((t,i) => {
        let opts = state.vehicles.filter(v=>v.type!=='van').map(v=>`<option value="${v.id}" ${v.trailer&&v.trailer.id===t.id?'selected':''}>${v.model}</option>`).join('');
        return `<div class="card"><div class="card-body"><h3>🔗 ${t.n}</h3><div style="color:var(--green); margin-bottom:15px">Bonus k výdělku: +${Math.round((t.bonus-1)*100)}%</div><select class="btn-dark" style="width:100%;padding:8px" onchange="assignTrailer(${i}, this.value)"><option value="">-- Bez tahače --</option>${opts}</select></div></div>`;
    }).join('') || '<div style="color:#555">Nemáš žádné návěsy.</div>';
    
    shop.innerHTML = TRAILERS_DB.map((t,i) => `<div class="card"><img src="${t.img}" class="card-img" onerror="this.style.display='none'"><div class="card-body"><h3>${t.n}</h3><div style="font-size:12px;margin-bottom:10px">+${Math.round((t.bonus-1)*100)}% k výdělku</div><b style="color:var(--orange)">${t.price.toLocaleString()} Kč</b><button class="btn btn-teal" onclick="buyTrailer(${i})">KOUPIT</button></div></div>`).join('');
}

function buyTrailer(idx) {
    let t = TRAILERS_DB[idx];
    if(state.money >= t.price) { addMoney(-t.price); state.trailers.push({...t, id: Date.now()}); notify("NÁKUP", `Zakoupen návěs ${t.n}`, "success"); renderTrailers(); saveGame(); }
    else notify("FINANCE", "Nemáš dost peněz!", "warning");
}

function assignTrailer(tIdx, vId) {
    let t = state.trailers[tIdx];
    state.vehicles.forEach(v => { if(v.trailer && v.trailer.id===t.id) v.trailer = null; });
    if(vId) { let v = state.vehicles.find(x=>x.id==vId); if(v) v.trailer = t; }
    notify("LOGISTIKA", "Návěs přiřazen.", "info"); renderTrailers(); renderOverview(); saveGame();
}

// BURZA A SMLOUVY
function filterAuction(type, btn) {
    state.auctionFilter = type;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderAuction();
}

const getEligibility = (vehicle, offer) => {
    // Rule 1: Strict vehicle types
    if (offer.type === 'van' && vehicle.type !== 'van') return { eligible: false, reason: 'Tuto zakázku může vzít jen dodávka.' };
    if (offer.type === 'solo' && vehicle.type !== 'solo') return { eligible: false, reason: 'Tuto zakázku může vzít jen solo náklaďák.' };
    if (offer.type === 'semi' && vehicle.type !== 'semi') return { eligible: false, reason: 'Tuto zakázku může vzít jen kamion (tahač).' };

    // Ships and planes are already filtered by type, so we just check for land vehicles
    if (vehicle.type !== 'ship' && vehicle.type !== 'plane') {
        const startCity = CITIES[vehicle.loc];
        const destCity = CITIES[offer.dest];
        if (startCity && destCity) {
            const isOverseas = (startCity.x < 0.4 && destCity.x > 0.4) || (startCity.x > 0.4 && destCity.x < 0.4);
            if (isOverseas) {
                return { eligible: false, reason: 'Pozemní vozidla nemohou přes oceán.' };
            }
        }
        const driver = state.drivers.find(d => d.id === vehicle.driverId);
        if (!driver) return { eligible: false, reason: 'Vozidlo nemá přiřazeného řidiče.' };

        // Rule 2: License check
        if (offer.reqLic && !driver.lic.includes(offer.reqLic)) {
            const licenseName = LICENSES.find(l => l.id === offer.reqLic)?.n || offer.reqLic.toUpperCase();
            return { eligible: false, reason: `Řidič nemá licenci: ${licenseName}.` };
        }

        // Rule 3: Trailer check for semi
        if (vehicle.type === 'semi' && offer.type === 'semi') {
            if (!vehicle.trailer) {
                return { eligible: false, reason: 'Kamion musí mít připojený návěs.' };
            }
        }
    }

    return { eligible: true, reason: '' };
};

function genOffers(force = false) {
    if (!force && state.money >= 500) addMoney(-500);
    state.offers = [];
    let num = 15 + Math.floor(state.reputation / 10) + (state.hq.office * 2);
    const dests = Object.keys(CITIES);

    for (let i = 0; i < num; i++) {
        let type;
        const wantsShip = Math.random() < 0.3 && state.hq.port_hub > 0;
        const wantsPlane = Math.random() < 0.3 && state.hq.airport_hangar > 0;

        if (wantsShip && wantsPlane) {
            type = Math.random() < 0.5 ? 'ship' : 'plane';
        } else if (wantsShip) {
            type = 'ship';
        } else if (wantsPlane) {
            type = 'plane';
        } else {
            type = (Math.random() < 0.5 ? 'semi' : (Math.random() < 0.5 ? 'solo' : 'van'));
        }

        let dList = [...dests];
        if (type === 'ship') {
            dList = dests.filter(k => CITIES[k].isPort);
        } else if (type === 'plane') {
            dList = dests.filter(k => CITIES[k].isAirport);
        }

        if (dList.length === 0) continue;
        let dest = dList[Math.floor(Math.random() * dList.length)];
        
        let pay = Math.floor(Math.random() * 50000) + 10000;
        if(type === 'semi') pay *= 3; if(type === 'ship') pay *= 15; if(type === 'plane') pay *= 25;

        let reqLic = null;
        let cargo;
        let isBM = false;

        if (type === 'ship' || type === 'plane') {
            const cargoKey = type === 'ship' ? 'sea' : 'air';
            const cList = CARGO_TYPES[cargoKey];
            cargo = cList[Math.floor(Math.random() * cList.length)];
        } else {
            // Land vehicles can be black market
            isBM = state.tech.includes('darkweb') && Math.random() < 0.1; // Increased chance for BM to be noticeable
            if (isBM) {
                cargo = BLACK_MARKET_CARGO[Math.floor(Math.random() * BLACK_MARKET_CARGO.length)];
                pay *= 4;
            } else {
                cargo = allLandCargoes[Math.floor(Math.random() * allLandCargoes.length)];
                reqLic = cargoToLicenseMap[cargo] || null;
                if (reqLic) pay *= 1.5;
            }
        }
        
        // Apply Jirstan dumping price pressure immediately to offer listing
        if (state.jirstanPressure && state.jirstanPressure.eventType === 'dumping' && dest === state.jirstanPressure.targetCity) {
            pay = Math.floor(pay * 0.6);
        }
        
        let isVIP = false;
        if (state.reputation >= 100 && Math.random() < 0.20) {
            isVIP = true;
            pay *= 2;
            cargo = `⭐ VIP ${cargo}`;
        }
        
        state.offers.push({ id: Date.now() + i, type, dest, pay, cargo, reqLic, isBlackMarket: isBM, isVIP, dist: Math.floor(Math.random() * 1500) + 100 });
    }

    state.auctionFilter = 'all';
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('.filter-btn[onclick*="\'all\'"]');
    if (allBtn) allBtn.classList.add('active');

    renderAuction();
    saveGame();
}

function renderAuction() {
    const el = document.getElementById('auction-list'); if(!el) return;
    let offers = state.offers.filter(o => state.auctionFilter === 'all' || o.type === state.auctionFilter || (state.auctionFilter==='blackmarket' && o.isBlackMarket));
    
    if (offers.length === 0) {
        let msg = '<div style="color:var(--text-muted); text-align:center; padding: 40px 0;">Žádné dostupné zakázky pro tento filtr. Zkuste obnovit nabídku.</div>';
        if (state.auctionFilter === 'ship') {
            if (state.hq.port_hub === 0) {
                msg = '<div style="color:var(--text-muted); text-align:center; padding: 40px 0;">Pro odemčení lodních zakázek musíš vylepšit <b>Přístavní překladiště</b> v sekci Sídlo firmy (HQ).</div>';
            } else {
                msg = '<div style="color:var(--text-muted); text-align:center; padding: 40px 0;">Momentálně žádné lodní zakázky. Zkus obnovit nabídku.</div>';
            }
        }
        if (state.auctionFilter === 'plane') {
             if (state.hq.airport_hangar === 0) {
                msg = '<div style="color:var(--text-muted); text-align:center; padding: 40px 0;">Pro odemčení leteckých zakázek musíš vylepšit <b>Letištní hangár</b> v sekci Sídlo firmy (HQ).</div>';
            } else {
                msg = '<div style="color:var(--text-muted); text-align:center; padding: 40px 0;">Momentálně žádné letecké zakázky. Zkus obnovit nabídku.</div>';
            }
        }
        el.innerHTML = msg;
    } else {
        el.innerHTML = offers.map(o => {
            let cardClass = o.isBlackMarket ? 'bm-card' : (o.isVIP ? 'vip-card' : '');
            let titleColor = o.isBlackMarket ? 'var(--red)' : (o.isVIP ? 'var(--gold)' : 'var(--orange)');
            let badgeHtml = o.isVIP ? '<span class="lic-badge" style="background:var(--gold);color:black">⭐ VIP ZAKÁZKA</span>' : (o.reqLic ? '<span class="lic-badge">'+LICENSES.find(l=>l.id===o.reqLic).n+'</span>' : 'Běžný náklad');
            let borderStyle = o.isVIP ? 'border-top: 4px solid var(--gold); background: rgba(255, 195, 0, 0.03);' : '';
            return `<div class="card ${cardClass}" style="${borderStyle}"><div class="card-body"><div style="display:flex;justify-content:space-between"><h3 style="margin:0;color:${titleColor}">${o.dest}</h3><b style="font-size:16px">${o.pay.toLocaleString()} Kč</b></div><div style="font-size:12px;color:var(--text-muted);margin:10px 0">${o.cargo}</div><div style="font-size:11px;margin-bottom:10px">${badgeHtml} | ${o.type.toUpperCase()}</div><button class="btn btn-blue" onclick="takeJobModal(${o.id})">PŘIJMOUT</button></div></div>`;
        }).join('');
    }
}

function takeJobModal(offerId) {
    const o = state.offers.find(x => x.id === offerId);
    if (!o) return;

    let availableVehicles = [];
    if (o.type === 'ship') {
        availableVehicles = state.ships;
    } else if (o.type === 'plane') {
        availableVehicles = state.planes;
    } else {
        availableVehicles = state.vehicles;
    }

    let html = `<h2 style="color:var(--orange)">VYBER STROJ PRO ZAKÁZKU</h2>
                <p style="font-size:14px;color:var(--text-muted)">Cíl: <b>${o.dest}</b> | Odměna: <b>${o.pay.toLocaleString()} Kč</b> | Náklad: <b>${o.cargo}</b></p>
                <div style="display:flex;flex-direction:column;gap:10px; max-height: 60vh; overflow-y: auto; padding-right: 10px;">`;

    let suitableVehicles = availableVehicles.filter(v => {
        if (o.type === 'van') return v.type === 'van';
        if (o.type === 'solo') return v.type === 'solo';
        if (o.type === 'semi') return v.type === 'semi';
        if (o.type === 'ship') return v.type === 'ship';
        if (o.type === 'plane') return v.type === 'plane';
        return false;
    });

    if (suitableVehicles.length === 0) {
        html += `<div style="color:var(--red); text-align: center; padding: 20px 0;">Pro tento typ zakázky (${o.type.toUpperCase()}) nevlastníš žádné vozidlo.</div>`;
    } else {
        suitableVehicles.forEach(v => {
            const eligibility = getEligibility(v, o);
            let dName = 'Automatická posádka';
            if (v.driverId) {
                const driver = state.drivers.find(d => d.id === v.driverId);
                if (driver) dName = driver.name;
            }

            if (eligibility.eligible) {
                html += `<button class="btn btn-dark" style="text-align:left; justify-content:space-between" onclick="assignJobToVehicle(${v.id}, ${o.id}, '${v.type}')">
                            <span>
                                <b>${v.model}</b> 
                                <span style="font-size:11px;color:#888">(${dName})</span>
                                ${v.trailer ? `<span style="font-size:11px; color:var(--gold)"> + ${v.trailer.n}</span>` : ''}
                            </span>
                            <span style="color:var(--blue)">${v.job ? 'Fronta: ' + (v.queue?.length || 0) : 'Připraven'}</span>
                         </button>`;
            } else {
                html += `<div class="btn btn-dark" style="text-align:left; justify-content:space-between; opacity:0.5; cursor:not-allowed;">
                            <span>
                                <b>${v.model}</b>
                                <span style="font-size:11px;color:#888">(${dName})</span>
                                ${v.trailer ? `<span style="font-size:11px; color:var(--gold)"> + ${v.trailer.n}</span>` : ''}
                            </span>
                            <span style="color:var(--red); font-size:11px;">${eligibility.reason}</span>
                         </div>`;
            }
        });
    }

    html += `</div><button class="btn btn-dark" style="margin-top:20px" onclick="closeModal()">ZAVŘÍT</button>`;
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function assignJobToVehicle(vid, offerId, type) {
    const o = state.offers.find(x => x.id === offerId);
    if (!o) return;

    let v;
    if (type === 'ship') v = state.ships.find(x => x.id === vid);
    else if (type === 'plane') v = state.planes.find(x => x.id === vid);
    else v = state.vehicles.find(x => x.id === vid);

    if (!v) return;

    const eligibility = getEligibility(v, o);
    if (!eligibility.eligible) {
        notify("CHYBA PŘIŘAZENÍ", eligibility.reason, "danger");
        return;
    }
    
    if(!v.job) v.job = o; else v.queue.push(o);
    state.offers = state.offers.filter(x=>x.id!==offerId);
    closeModal(); renderAuction(); renderOverview(); renderDispatch(); saveGame();
}

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

function genContracts() {
    state.availableContracts = [];
    const dests = Object.keys(CITIES);
    
    // 1 standardní kontrakt
    let dest = dests[Math.floor(Math.random() * dests.length)];
    let count = Math.floor(Math.random() * 8) + 4;
    let reward = count * 60000;
    let isVip1 = Math.random() < (state.reputation / 150);
    if (isVip1) {
        let vipMult = 1 + (state.reputation * 0.015);
        reward = Math.floor(reward * vipMult);
    }
    let time = state.day + Math.floor(count * 1.5) + 5;
    state.availableContracts.push({id: Date.now(), dest, count, progress: 0, reward, deadlineDay: time, isVip: isVip1});
    
    // 2 kontrakty z výrobních řetězců (Fáze 1)
    for (let i = 1; i <= 2; i++) {
        let chain = SUPPLY_CHAINS[Math.floor(Math.random() * SUPPLY_CHAINS.length)];
        let stage = chain.stages[0];
        let cCount = Math.floor(Math.random() * 5) + 4;
        let cReward = cCount * stage.basePay;
        let isVip2 = Math.random() < (state.reputation / 150);
        if (isVip2) {
            let vipMult = 1 + (state.reputation * 0.015);
            cReward = Math.floor(cReward * vipMult);
        }
        let cTime = state.day + Math.floor(cCount * 1.5) + 8;
        
        state.availableContracts.push({
            id: Date.now() + i,
            dest: stage.to,
            from: stage.from,
            count: cCount,
            progress: 0,
            reward: cReward,
            deadlineDay: cTime,
            chainName: chain.name,
            stageNum: stage.stage,
            cargo: stage.cargo,
            label: stage.label,
            basePay: stage.basePay,
            isVip: isVip2
        });
    }
    
    renderContracts();
}

function renderContracts() {
    const elAct = document.getElementById('active-contracts');
    const elAv = document.getElementById('available-contracts');
    if (!elAct || !elAv) return;

    elAct.innerHTML = state.contracts.map(c => {
        let borderStyle = c.isVip ? 'border-left:4px solid var(--purple)' : 'border-left:4px solid var(--gold)';
        let vipLabel = c.isVip ? `<span style="color:var(--purple); font-weight:bold; letter-spacing:0.5px">👑 VIP PARTNER (Zvýšený zisk)</span><br>` : '';
        let title = c.chainName ? `<b style="color:var(--gold)">[ŘETĚZEC] ${c.chainName}</b><br><span style="color:var(--orange)">${c.label} (${c.cargo})</span>` : `Cíl: ${c.dest}`;
        let route = c.from ? `Trasa: ${c.from} → ${c.dest}` : `Cíl: ${c.dest}`;
        return `<div class="card" style="margin-bottom:10px; ${borderStyle}">
                    <div class="card-body">
                        ${vipLabel}
                        <h4 style="margin:0; color:var(--gold)">${title}</h4>
                        <div style="font-size:12px; margin:5px 0">${route}<br>Pokrok: ${c.progress}/${c.count} zásilek | Limit do Dne: ${c.deadlineDay}</div>
                        <div class="xp-bar-bg"><div class="xp-bar-fill" style="width:${(c.progress/c.count)*100}%; background:var(--gold)"></div></div>
                        <b style="color:white; display:block; margin-top:5px">Celková odměna: ${c.reward.toLocaleString()} Kč</b>
                    </div>
                </div>`;
    }).join('') || '<div style="color:#555">Nemáš aktivní smlouvy.</div>';

    elAv.innerHTML = state.availableContracts.map((c, i) => {
        let cardStyle = c.isVip ? 'margin-bottom:10px; border-left:4px solid var(--purple); background:rgba(128,0,128,0.03)' : 'margin-bottom:10px';
        let vipLabel = c.isVip ? `<span style="color:var(--purple); font-weight:bold; letter-spacing:0.5px">👑 VIP ZAKÁZKA</span><br>` : '';
        let title = c.chainName ? `<span style="color:var(--gold)">[ŘETĚZEC] ${c.chainName}</span><br><b style="color:var(--orange)">${c.label}</b>` : `<b style="color:var(--orange)">Trasa do ${c.dest}</b>`;
        let desc = c.from ? `Trasa: ${c.from} → ${c.dest} (${c.cargo}) | ${c.count}x zásilka` : `${c.dest} (${c.count}x)`;
        return `<div class="card" style="${cardStyle}">
                    <div class="card-body">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start">
                            <div>
                                ${vipLabel}
                                ${title}
                                <div style="font-size:12px; margin-top:5px; color:var(--text-muted)">${desc}</div>
                            </div>
                            <button class="btn btn-sm btn-gold" onclick="signContract(${i})">PODEPSAT</button>
                        </div>
                        <div style="font-size:12px; margin-top:5px">Odměna: ${c.reward.toLocaleString()} Kč | Limit do Dne: ${c.deadlineDay}</div>
                    </div>
                </div>`;
    }).join('');
}

function signContract(idx) {
    state.contracts.push(state.availableContracts[idx]);
    state.availableContracts.splice(idx, 1);
    notify("SMLOUVA", "Smlouva podepsána!", "success"); renderContracts(); saveGame();
}

function progressContracts(dest) {
    state.contracts.forEach(c => {
        if (c.dest === dest && c.progress < c.count) {
            c.progress++;
            if (c.progress >= c.count) {
                addMoney(c.reward);
                state.stats.totalEarned += c.reward;
                state.stats.contractsDone = (state.stats.contractsDone || 0) + 1;
                notify("SMLOUVA SPLNĚNA", `Doručen poslední náklad pro ${c.dest}. Odměna: ${c.reward.toLocaleString()} Kč!`, "gold");
                pushToTicker(`<b>SMLOUVA SPLNĚNA:</b> Trasa do ${c.dest} byla dokončena.`, "gold");
                
                // Odemčení další fáze logistického řetězce
                if (c.chainName && c.stageNum < 3) {
                    const chain = SUPPLY_CHAINS.find(ch => ch.name === c.chainName);
                    if (chain) {
                        const nextStage = chain.stages.find(st => st.stage === c.stageNum + 1);
                        if (nextStage) {
                            let newCount = c.count + 2;
                            let reward = newCount * nextStage.basePay;
                            let deadline = state.day + Math.floor(newCount * 1.5) + 5;
                            
                            let newContract = {
                                id: Date.now() + Math.floor(Math.random() * 1000),
                                dest: nextStage.to,
                                from: nextStage.from,
                                count: newCount,
                                progress: 0,
                                reward: reward,
                                deadlineDay: deadline,
                                chainName: chain.name,
                                stageNum: nextStage.stage,
                                cargo: nextStage.cargo,
                                label: nextStage.label,
                                basePay: nextStage.basePay
                            };
                            
                            state.contracts.push(newContract);
                            notify("NOVÁ FÁZE ŘETĚZCE", `Odemčena ${nextStage.label}! Smlouva byla automaticky podepsána.`, "gold");
                            pushToTicker(`<b>VÝROBNÍ ŘETĚZEC:</b> Odemčena a spuštěna ${nextStage.label}.`, "gold");
                        }
                    }
                }
            }
        }
    });
    state.contracts = state.contracts.filter(c => c.progress < c.count);
    renderContracts();
}

// FACTIONS
function renderFactions() {
    const el = document.getElementById('factions-grid'); if(!el) return;
    el.innerHTML = Object.keys(FACTIONS_DB).map(k => {
        const f = FACTIONS_DB[k]; const rep = state.factions[k];
        const pks = f.perks.map(p => `<div class="faction-perk ${rep>=p.req?'unlocked':''}">${p.desc}<span>${rep>=p.req?'✅':'🔒'}</span></div>`).join('');
        return `<div class="faction-card"><div class="faction-header"><img src="${f.img}" class="faction-img" onerror="this.style.display='none'"><div class="faction-logo">${f.icon}</div></div><div class="faction-body"><h2 style="color:${f.color};margin:0">${f.n}</h2><p style="font-size:12px;color:var(--text-muted)">${f.desc}</p><div class="faction-rep-bar"><div class="faction-rep-fill" style="width:${(rep/1000)*100}%;background:${f.color}"></div></div><div style="font-size:12px;margin-bottom:15px">Reputace: <b>${rep} / 1000</b></div>${pks}</div></div>`;
    }).join('');
}

// MACHINES
function renderMachines() {
    const my = document.getElementById('mach-grid'); const shop = document.getElementById('mach-shop');
    if(!my || !shop) return;
    my.innerHTML = (state.machines || []).map(m => {
        const sellPrice = m.c ? Math.floor(m.c / 2) : 0;
        const income = m.inc > 0 ? `${m.inc.toLocaleString()} Kč/den` : (m.incCrypto ? `${m.incCrypto} JC/den` : 'z akvizice');
        return `<div class="card"><div class="card-body"><h3>${m.n}</h3><div style="color:var(--green); margin-bottom:15px">Výnos: +${income}</div>` + 
        (sellPrice > 0 ? `<button class="btn btn-red btn-sm" onclick="sellMachine('${m.id}', ${sellPrice})">PRODAT STROJ (${sellPrice.toLocaleString()} Kč)</button>` : '') +
        `</div></div>`
    }).join('') || '<div style="color:#555">Zatím žádné stroje.</div>';
    shop.innerHTML = MACHINES_DB.map((m,i) => `<div class="card"><img src="${m.img}" class="card-img" onerror="this.style.display='none'"><div class="card-body"><h3>${m.n}</h3><div style="font-size:12px;margin-bottom:10px">Pasivní příjem: ${m.inc>0 ? m.inc.toLocaleString() + ' Kč/den' : m.incCrypto + ' JC/den'}</div><b style="color:var(--orange)">${m.c.toLocaleString()} Kč</b><button class="btn btn-orange" onclick="buyMachine(${i})">KOUPIT</button></div></div>`).join('');
}

function buyMachine(idx) {
    let m = MACHINES_DB[idx];
    if(state.money >= m.c) { addMoney(-m.c); state.machines.push({...m, id: Date.now()}); notify("NÁKUP", `Zakoupen stroj ${m.n}`, "success"); renderMachines(); saveGame(); }
    else notify("FINANCE", "Nemáš peníze!", "warning");
}

function sellMachine(id, sellPrice) {
    if (confirm(`Opravdu chcete prodat tuto položku za ${sellPrice.toLocaleString()} Kč?`)) {
        const machineIndex = state.machines.findIndex(m => m.id == id);
        if (machineIndex > -1) {
            state.machines.splice(machineIndex, 1);
            addMoney(sellPrice);
            notify("PRODEJ", `Položka prodána za ${sellPrice.toLocaleString()} Kč.`, "success");
            renderMachines();
            saveGame();
        }
    }
}

// WORKSHOP & TUNING
function renderWorkshop() {
    const el = document.getElementById('workshop-grid'); if(!el) return;
    let html = '';
    const renderItem = (v, type) => {
        if(v.cond >= 100 && type !== 'truck') return ''; // Auta ukazujeme vždy kvůli tuningu
        let cost = Math.floor((100 - v.cond) * (type==='ship'?10000:type==='plane'?25000:1000));
        if(state.hq.workshop > 0) cost = Math.floor(cost * (1 - (state.hq.workshop * 0.1)));
        if(state.staff.mechanic.active) cost = Math.floor(cost * 0.7);
        if(state.tower.floors.includes(3)) cost = Math.floor(cost * 0.8);
        let icon = type==='ship'?'🚢':type==='plane'?'✈️':'🚛';
        
        return `<div class="card"><div class="card-body"><div style="display:flex;justify-content:space-between"><h3>${icon} ${v.model}</h3><b style="color:${v.cond<50?'var(--red)':'var(--green)'}">Stav: ${Math.floor(v.cond)}%</b></div>${v.cond<100 ? `<div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center"><span>Oprava: <b>${cost.toLocaleString()} Kč</b></span><button class="btn btn-sm btn-green" onclick="repairVehicle(${v.id}, '${type}', ${cost})">OPRAVIT</button></div>` : '<div style="margin-top:10px;color:var(--text-muted);font-size:12px">V perfektním stavu</div>'} ${type==='truck' ? renderUpgrades(v) : ''}</div></div>`;
    };
    state.vehicles.forEach(v => html += renderItem(v, 'truck'));
    state.ships.forEach(v => html += renderItem(v, 'ship'));
    state.planes.forEach(v => html += renderItem(v, 'plane'));
    el.innerHTML = html || '<div style="color:#555">Flotila je plně opravena.</div>';
}

function renderUpgrades(v) {
    if(!v.upgrades) v.upgrades = [];
    return `<div style="margin-top:15px;padding-top:10px;border-top:1px solid var(--border-light)"><div style="font-size:11px;color:#888;margin-bottom:5px">TUNING:</div><div style="display:flex;flex-wrap:wrap;gap:5px">` + UPGRADES_DB.map(u => {
        let has = v.upgrades.includes(u.id);
        return `<button class="btn btn-sm ${has?'btn-dark':'btn-purple'}" ${has?'disabled':''} onclick="upgradeVehicle(${v.id}, '${u.id}', ${u.cost})" title="${u.desc}">${u.n} ${has?'(Koupeno)':'('+u.cost.toLocaleString()+')'}</button>`;
    }).join('') + `</div></div>`;
}

function repairVehicle(vid, type, cost) {
    if(state.money >= cost) {
        addMoney(-cost);
        let v = type==='ship' ? state.ships.find(x=>x.id===vid) : (type==='plane' ? state.planes.find(x=>x.id===vid) : state.vehicles.find(x=>x.id===vid));
        if(v) { v.cond = 100; notify("OPRAVA", "Stroj kompletně opraven!", "success"); renderWorkshop(); saveGame(); }
    } else notify("FINANCE", "Nemáš dost peněz!", "warning");
}

function repairAll() {
    let totalCost = 0;
    const calcCost = (v, t) => { if(v.cond>=100)return 0; let c=Math.floor((100-v.cond)*(t==='ship'?10000:t==='plane'?25000:1000)); if(state.hq.workshop>0)c*=1-(state.hq.workshop*0.1); if(state.staff.mechanic.active)c*=0.7; if(state.tower.floors.includes(3))c*=0.8; return Math.floor(c); };
    state.vehicles.forEach(v => totalCost += calcCost(v, 'truck'));
    state.ships.forEach(v => totalCost += calcCost(v, 'ship'));
    state.planes.forEach(v => totalCost += calcCost(v, 'plane'));
    
    if(totalCost === 0) return notify("DÍLNA", "Všechny stroje jsou již opravené.", "info");
    
    if(state.money >= totalCost) {
        addMoney(-totalCost);
        state.vehicles.forEach(v => v.cond = 100); state.ships.forEach(v => v.cond = 100); state.planes.forEach(v => v.cond = 100);
        notify("DÍLNA", `Celá flotila hromadně opravena za ${totalCost.toLocaleString()} Kč.`, "success"); renderWorkshop(); saveGame();
    } else notify("FINANCE", "Nemáš dost peněz na kompletní servis!", "warning");
}

function upgradeVehicle(vid, upId, cost) {
    if(state.money >= cost) {
        let v = state.vehicles.find(x=>x.id===vid);
        if(v && !v.upgrades.includes(upId)) {
            addMoney(-cost); v.upgrades.push(upId); notify("TUNING", "Díl úspěšně nainstalován!", "success"); renderWorkshop(); saveGame();
        }
    } else notify("FINANCE", "Nemáš peníze!", "warning");
}

// DEALER
function renderDealer() {
    const el = document.getElementById('dealer-grid'); const elU = document.getElementById('used-dealer-grid');
    if(!el || !elU) return;
    el.innerHTML = CAR_DB.map((c,i) => `<div class="card"><img src="${c.img}" class="card-img" onerror="this.style.display='none'"><div class="card-body"><h3>${c.model}</h3><div style="font-size:12px;margin-bottom:10px">Typ: ${c.cat.toUpperCase()} | Rychlostní index: ${c.spd}</div><b style="color:var(--orange)">${c.price.toLocaleString()} Kč</b><button class="btn btn-blue" onclick="buyCar(${i})">KOUPIT NOVÉ</button></div></div>`).join('');
    elU.innerHTML = state.usedCars.map(c => {
        if (c.estimatedCond === undefined) c.estimatedCond = c.cond;
        if (c.deviation === undefined) c.deviation = 15;
        const estProgress = Math.max(0, Math.min(100, c.estimatedCond));
        const progressColor = estProgress > 65 ? 'var(--green)' : estProgress > 35 ? 'var(--orange)' : 'var(--red)';
        
        let conditionText = estProgress > 70 ? 'Excelentní' : (estProgress > 45 ? 'Průměrný' : 'Skryté vady');
        
        let badgeHtml = c.superDiscount ? `<span class="badge-discount" style="background:var(--red); animation:blink 1.5s infinite">🔥 VÝPRODEJ</span>` : '';
        
        return `
        <div class="card" style="margin-bottom:10px; border-left:4px solid var(--purple); position:relative;">
            ${badgeHtml}
            <img src="${c.img}" class="card-img" onerror="this.style.display='none'">
            <div class="card-body">
                <h3>${c.model}</h3>
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">Typ: ${c.cat.toUpperCase()} | Risk odhadu: ±${c.deviation}%</div>
                <div class="progress-track" style="height:12px; margin-bottom:6px; border-radius:6px; background:rgba(255,255,255,0.08);">
                    <div style="width:${estProgress}%; height:100%; border-radius:6px; background:${progressColor}; transition: width .25s ease;"></div>
                </div>
                <div style="font-size:12px; margin-bottom:12px; color:${progressColor};">Odhadovaný stav: <b>${estProgress}%</b> (${conditionText})</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                    <b style="color:var(--orange); font-size:18px;">${c.price.toLocaleString()} Kč</b>
                    <button class="btn btn-dark" onclick="buyUsedCar(${c.id})">Koupit</button>
                </div>
            </div>
        </div>`;
    }).join('') || '<div style="color:#555">Bazar je momentálně prázdný. Změna nabídky každé 3 dny.</div>';
}

function buyCar(idx) {
    let c = CAR_DB[idx];
    if(state.vehicles.length >= (state.garageCapacity || 5)) return notify("GARÁŽ", "Tvá garáž je plná! Přikup nová stání.", "warning");
    if(state.money >= c.price) { addMoney(-c.price); state.vehicles.push({id: Date.now(), type: c.cat, model: c.model, driverId: null, loc: 'Praha', job: null, queue: [], progress: 0, cond: 100, fuel: 100, spd: c.spd, upgrades: [], trailer: null}); notify("NÁKUP", "Auto úspěšně zakoupeno!", "success"); checkAchievements(); renderDealer(); renderFleet(); saveGame(); }
    else notify("FINANCE", "Nemáš peníze!", "warning");
}

function buyUsedCar(id) {
    let c = state.usedCars.find(x=>x.id===id); if(!c) return;
    if(state.vehicles.length >= (state.garageCapacity || 5)) return notify("GARÁŽ", "Tvá garáž je plná! Přikup nová stání.", "warning");
    
    if(state.money >= c.price) { 
        addMoney(-c.price); 
        
        let est = c.estimatedCond !== undefined ? c.estimatedCond : c.cond;
        let actual = c.cond;
        let difference = actual - est;
        let diffText = difference > 0 
            ? `v lepším stavu (+${difference}%) než ukazoval odhad!` 
            : (difference < 0 ? `v horším stavu (${difference}%) kvůli skrytým vadám!` : `přesně v očekávaném stavu (${actual}%).`);
            
        state.vehicles.push({
            id: Date.now(), 
            type: c.cat, 
            model: c.model.replace(" (Ojetina)", ""), 
            driverId: null, 
            loc: 'Praha', 
            job: null, 
            queue: [], 
            progress: 0, 
            cond: actual, 
            fuel: 100, 
            spd: c.spd, 
            upgrades: [], 
            trailer: null
        }); 
        
        state.usedCars = state.usedCars.filter(x=>x.id!==id); 
        notify("NÁKUP OJETINY", `Zakoupeno! Po prohlídce v Dílně je auto ${diffText}`, difference >= 0 ? 'success' : 'warning'); 
        checkAchievements(); 
        renderDealer(); 
        renderFleet(); 
        saveGame(); 
    }
    else notify("FINANCE", "Nemáš peníze!", "warning");
}

function buyGarageSlot() {
    state.garageCapacity = state.garageCapacity || 5;
    let cost = Math.floor(50000 * Math.pow(1.5, state.garageCapacity - 5));
    if (state.money >= cost) {
        addMoney(-cost);
        state.garageCapacity++;
        notify("GARÁŽ", `Kapacita garáže úspěšně navýšena na ${state.garageCapacity} míst!`, "success");
        updateUI();
        if (typeof renderHQ === 'function') renderHQ();
        if (document.getElementById('hq-floor-details') && document.getElementById('hq-floor-details').style.display !== 'none') {
            showHqFloorDetails('garage_workshop');
        }
        saveGame();
    } else {
        notify("CHYBA", `Nedostatek peněz na nákup garážového stání. Potřebuješ ${cost.toLocaleString()} Kč.`, "warning");
    }
}

function renderBazaar() {
    const elMarket = document.getElementById('baz-market');
    const elInventory = document.getElementById('baz-inventory');
    if (!elMarket || !elInventory) return;

    elMarket.innerHTML = state.bazaarMarket.length === 0 ? '<div style="color:#555; font-size:13px">Bazar je momentálně prázdný. Změna nabídky každé 3 dny.</div>' : state.bazaarMarket.map((c, idx) => {
        if (c.estimatedCondition === undefined) c.estimatedCondition = c.condition;
        if (c.deviation === undefined) c.deviation = 15;
        
        const estProgress = Math.max(0, Math.min(100, c.estimatedCondition));
        const progressColor = estProgress > 65 ? 'var(--green)' : estProgress > 35 ? 'var(--orange)' : 'var(--red)';
        
        let conditionText = estProgress > 70 ? 'Excelentní (Bez zjevných vad)' : (estProgress > 45 ? 'Průměrný (Běžné opotřebení)' : 'Špatný (Podezření na skryté vady)');
        
        let badgeHtml = '';
        if (c.isVeteran) {
            badgeHtml = `<span class="badge-discount" style="background:var(--gold); color:black; font-weight:800; right:auto; left:10px;">⚡ VETERÁN</span>`;
        } else if (c.superDiscount) {
            badgeHtml = `<span class="badge-discount" style="background:var(--red); animation:blink 1.5s infinite">🔥 RYCHLÝ KUP (Risk)</span>`;
        }
        
        const imgHtml = c.img ? `<img src="${c.img}" class="bazaar-card-img" onerror="this.style.display='none'; this.parentElement.classList.add('no-img');">` : `<div class="bazaar-card-img no-img"><span>🚗</span></div>`;
        
        return `
        <div class="card" style="margin-bottom:10px; border-left:4px solid var(--blue); animation: slideIn .35s ease-out; position:relative;">
            ${badgeHtml}
            <div class="card-img bazaar-card-img-wrapper">${imgHtml}</div>
            <div class="card-body">
                <h3 style="margin-top:0">${c.model}</h3>
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:8px;">Čistota: ${c.cleanliness}% | Risk odhadu: ±${c.deviation}%</div>
                <div class="progress-track" style="height:12px; margin-bottom:6px; border-radius:6px; background:rgba(255,255,255,0.08);">
                    <div style="width:${estProgress}%; height:100%; border-radius:6px; background:${progressColor}; transition: width .25s ease;"></div>
                </div>
                <div style="font-size:12px; margin-bottom:12px; color:${progressColor};">Odhadovaný stav: <b>${estProgress}%</b> (${conditionText})</div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                    <b style="color:var(--orange); font-size:18px;">${c.buyPrice.toLocaleString()} Kč</b>
                    <button class="btn btn-blue btn-sm" onclick="buyBazaarCar(${idx})">Koupit</button>
                </div>
            </div>
        </div>`;
    }).join('');

    elInventory.innerHTML = state.bazaarInventory.length === 0 ? '<div style="color:#555; font-size:13px">Inventář je prázdný. Kup auto z trhu.</div>' : state.bazaarInventory.map((car, index) => {
        const progress = Math.max(0, Math.min(100, car.condition));
        const color = progress > 65 ? 'var(--green)' : progress > 35 ? 'var(--orange)' : 'var(--red)';
        
        let qualityText = car.partQuality === 'cheap' ? '<span style="color:var(--red)">Levné (Druhovýroba)</span>' : (car.partQuality === 'premium' ? '<span style="color:var(--green)">Prémiové</span>' : 'Standardní');
        
        return `
        <div class="card" style="margin-bottom:10px; border-left:4px solid var(--purple); animation: slideIn .35s ease-out;">
            <div class="card-img bazaar-card-img-wrapper">${car.img ? `<img src="${car.img}" class="bazaar-card-img" onerror="this.style.display='none'; this.parentElement.classList.add('no-img');">` : `<div class="bazaar-card-img no-img"><span>🚗</span></div>`}</div>
            <div class="card-body">
                <h3 style="margin-top:0">${car.model}</h3>
                <div style="margin-bottom:6px; font-size:12px;">Stav: <b style="color:${color}">${progress}%</b> | Čistota: <b>${car.cleanliness}%</b></div>
                <div style="margin-bottom:8px; font-size:12px;">Kvalita dílů: <b>${qualityText}</b></div>
                <div class="progress-track" style="height:10px; margin-bottom:10px; border-radius:5px; background:rgba(255,255,255,0.1)"> <div style="width:${progress}%; height:100%; background:${color}; border-radius:5px;"></div></div>
                <div style="font-size:12px; margin-bottom:10px; color:${car.isListed ? 'var(--green)' : 'var(--text-muted)'}">${car.isListed ? '✅ Vystaveno k prodeji' : '⛔ V garáži'}</div>
                <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:8px;">
                   <button class="btn btn-dark btn-sm" onclick="repairBazaarCar(${index})">🔧 OPRAVIT</button>
                   <button class="btn btn-dark btn-sm" onclick="washBazaarCar(${index})">🧽 UMÝT</button>
                   <button class="btn btn-green btn-sm" onclick="sellBazaarCar(${index})">💰 PRODAT</button>
                   ${car.isListed ? `<button class="btn btn-cyan btn-sm" onclick="testDriveBazaarCar(${index})" ${car.testDriveUsed ? 'disabled' : ''}>🧪 Testovací jízda</button>` : `<button class="btn btn-blue btn-sm" onclick="listBazaarCar(${index})">🏷️ Vystavit</button>`}
                   ${progress >= 90 ? `<button class="btn btn-orange btn-sm" onclick="transferBazaarCarToFleet(${index})">🚛 FLOTILA</button>` : ''}
                </div>
                ${car.mods && car.mods.length > 0 ? `<div style="font-size:12px; color:var(--gold);">Pokročilé tune: ${car.mods.join(', ')}</div>` : ''}
            </div>
        </div>`;
    }).join('');
}

function buyCommodity(type, amount) {
    if (!state.warehouse) return;
    state.cityPrices = state.cityPrices || {};
    if (!state.cityPrices["Zájezd"]) {
        state.cityPrices["Zájezd"] = { food: 150, parts: 400, electronics: 1200 };
    }
    let localPrice = state.cityPrices["Zájezd"][type] || state.marketPrices[type] || 200;
    let total = localPrice * amount;
    if (state.money < total) return notify('Sklad', 'Nemáš dost peněz na nákup.', 'danger');
    let space = state.warehouse.capacity - ((state.warehouse.stock.electronics || 0) + (state.warehouse.stock.food || 0) + (state.warehouse.stock.parts || 0) + (state.warehouse.stock.fresh_food || 0));
    if (space < amount) return notify('Sklad', 'Není dost místa ve skladu.', 'warning');
    addMoney(-total);
    state.warehouse.stock[type] = (state.warehouse.stock[type] || 0) + amount;
    state.stats.totalSpent += total;
    notify('Sklad', `Nakoupeno ${amount} ks za ${total.toLocaleString()} Kč (místní cena Zájezd).`, 'success');
    SysLog('SKLAD', `🛒 Nakoupeno ${amount} ks komodity ${type} za -${total.toLocaleString()} Kč.`);
    renderWarehouse(); renderAll(); saveGame();
}

function sellCommodity(type, amount) {
    if (!state.warehouse) return;
    state.warehouse.stock[type] = state.warehouse.stock[type] || 0;
    if (amount === 'all') amount = state.warehouse.stock[type];
    if (state.warehouse.stock[type] < amount || amount <= 0) return notify('Sklad', 'Není dost zásob k prodeji.', 'warning');
    state.cityPrices = state.cityPrices || {};
    if (!state.cityPrices["Zájezd"]) {
        state.cityPrices["Zájezd"] = { food: 150, parts: 400, electronics: 1200 };
    }
    let localPrice = state.cityPrices["Zájezd"][type] || state.marketPrices[type] || 200;
    let total = localPrice * amount;
    state.warehouse.stock[type] -= amount;
    addMoney(total);
    state.stats.totalEarned += total;
    notify('Sklad', `Prodáno ${amount} ks za ${total.toLocaleString()} Kč (místní cena Zájezd).`, 'success');
    SysLog('SKLAD', `💰 Prodáno ${amount} ks komodity ${type} za +${total.toLocaleString()} Kč.`);
    renderWarehouse(); renderAll(); saveGame();
}

function upgradeWarehouse() {
    state.warehouse = state.warehouse || { stock: {}, capacity: 1000, level: 1, cold_storage: 0 };
    const cost = 500000 * (state.warehouse.level || 1);
    if (state.money < cost) return notify('Sklad', 'Nemáš peníze na rozšíření skladu.', 'danger');
    addMoney(-cost);
    state.warehouse.level = (state.warehouse.level || 1) + 1;
    state.warehouse.capacity += 500;
    notify('Sklad', `Velkosklad zvýšen na úroveň ${state.warehouse.level}. Kapacita: ${state.warehouse.capacity}.`, 'success');
    SysLog('SKLAD', `🏗️ Rozšíření skladu na Level ${state.warehouse.level} (Kapacita: ${state.warehouse.capacity}).`);
    renderWarehouse(); renderAll(); saveGame();
}

function upgradeColdStorage() {
    state.warehouse = state.warehouse || { stock: {}, capacity: 1000, level: 1, cold_storage: 0 };
    if (state.warehouse.cold_storage >= 3) return notify('Sklad', 'Chladicí systém je na maximu.', 'info');
    const cost = 2000000;
    if (state.money < cost) return notify('Sklad', `Potřebuješ ${cost.toLocaleString()} Kč na upgrade chladicího boxu.`, 'warning');
    addMoney(-cost);
    state.warehouse.cold_storage = (state.warehouse.cold_storage || 0) + 1;
    notify('Sklad', `Chladicí úroveň zvýšena na ${state.warehouse.cold_storage}. Zkažení čerstvého jídla klesá.`, 'success');
    SysLog('SKLAD', `❄️ Upgrade chladicího boxu na úroveň ${state.warehouse.cold_storage}.`);
    renderWarehouse(); renderAll(); saveGame();
}

function renderWarehouse() {
    const m = document.getElementById('warehouse-market');
    const s = document.getElementById('warehouse-storage');
    if (!m || !s) return;

    state.cityPrices = state.cityPrices || {};
    if (!state.cityPrices["Zájezd"]) {
        state.cityPrices["Zájezd"] = { food: 150, parts: 400, electronics: 1200 };
    }

    // 1. City prices table rows
    let cityRowsHtml = Object.keys(CITIES).map(cityName => {
        let prices = state.cityPrices[cityName] || { food: 150, parts: 400, electronics: 1200 };
        return `
        <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
            <td style="padding:6px; font-weight:bold; color:white">${cityName}</td>
            <td style="padding:6px; text-align:right; color:var(--orange)">${(prices.food || 0).toLocaleString()}</td>
            <td style="padding:6px; text-align:right; color:var(--blue)">${(prices.parts || 0).toLocaleString()}</td>
            <td style="padding:6px; text-align:right; color:var(--gold)">${(prices.electronics || 0).toLocaleString()}</td>
        </tr>`;
    }).join('');

    let localPr = state.cityPrices["Zájezd"];
    m.innerHTML = `
        <h3 style="margin-top:0; color:var(--gold)">Místní nákupní & prodejní ceny (Zájezd)</h3>
        <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; margin-bottom:15px; border:1px solid rgba(255,255,255,0.05)">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px"><span>🌾 Obilí:</span><b style="color:var(--orange)">${localPr.food} Kč</b></div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px"><span>🔩 Ocel:</span><b style="color:var(--blue)">${localPr.parts} Kč</b></div>
            <div style="display:flex; justify-content:space-between"><span>💻 Elektronika:</span><b style="color:var(--gold)">${localPr.electronics} Kč</b></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:15px">
            <button class="btn btn-sm btn-green" onclick="buyCommodity('food', 10)">+10 Obilí</button>
            <button class="btn btn-sm btn-dark" onclick="sellCommodity('food', 10)">-10 Obilí</button>
            <button class="btn btn-sm btn-blue" onclick="buyCommodity('parts', 10)">+10 Ocel</button>
            <button class="btn btn-sm btn-dark" onclick="sellCommodity('parts', 10)">-10 Ocel</button>
            <button class="btn btn-sm btn-orange" onclick="buyCommodity('electronics', 10)">+10 Elektronika</button>
            <button class="btn btn-sm btn-dark" onclick="sellCommodity('electronics', 10)">-10 Elektronika</button>
        </div>
        
        <h3 style="margin-top:15px; color:var(--cyan)">🔍 PROSPEKTOR LOKÁLNÍCH CEN</h3>
        <div style="max-height:160px; overflow-y:auto; border:1px solid var(--border-light); border-radius:6px; background:rgba(0,0,0,0.5)">
            <table style="width:100%; border-collapse:collapse; font-size:12px">
                <thead>
                    <tr style="background:rgba(255,255,255,0.05); color:var(--text-muted)">
                        <th style="padding:6px; text-align:left">Město</th>
                        <th style="padding:6px; text-align:right">🌾 Obilí</th>
                        <th style="padding:6px; text-align:right">🔩 Ocel</th>
                        <th style="padding:6px; text-align:right">💻 El.</th>
                    </tr>
                </thead>
                <tbody>
                    ${cityRowsHtml}
                </tbody>
            </table>
        </div>
    `;

    // 2. Storage information
    let totalStock = (state.warehouse.stock.electronics || 0) + (state.warehouse.stock.food || 0) + (state.warehouse.stock.parts || 0) + (state.warehouse.stock.fresh_food || 0);
    let pct = Math.min(100, Math.round(totalStock / state.warehouse.capacity * 100));

    let freeVehicles = state.vehicles.filter(v => !v.job);
    let vehicleSelectOptions = freeVehicles.map(v => {
        let cap = v.type === 'van' ? 30 : v.type === 'solo' ? 80 : 200;
        return `<option value="${v.id}">${v.model} (${v.type.toUpperCase()}, Max ${cap} ks)</option>`;
    }).join('');
    if (!vehicleSelectOptions) {
        vehicleSelectOptions = `<option value="" disabled>Žádné volné vozidlo v garáži</option>`;
    }

    let citySelectOptions = Object.keys(CITIES).filter(c => c !== "Zájezd").map(c => `<option value="${c}">${c}</option>`).join('');

    s.innerHTML = `
        <h3 style="margin-top:0">Tvůj sklad (${totalStock}/${state.warehouse.capacity})</h3>
        <div style="height:14px; background: rgba(255,255,255,0.08); border-radius:7px; overflow:hidden; margin-bottom:12px; border: 1px solid var(--border-light)">
           <div style="height:100%; width:${pct}%; background: linear-gradient(90deg, var(--blue), var(--orange)); transition: width 0.3s ease;"></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:13px; margin-bottom:10px">
            <div>🌾 Obilí: <b>${state.warehouse.stock.food || 0}</b></div>
            <div>🔩 Ocel: <b>${state.warehouse.stock.parts || 0}</b></div>
            <div>💻 Elektronika: <b>${state.warehouse.stock.electronics || 0}</b></div>
            <div>🍎 Čerstvé jídlo: <b>${state.warehouse.stock.fresh_food || 0}</b></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:15px">
            <button class="btn btn-sm btn-teal" onclick="upgradeColdStorage()" ${state.warehouse.cold_storage >= 3 ? 'disabled' : ''}>Upgradovat chladění (2M)</button>
            <button class="btn btn-sm btn-orange" onclick="upgradeWarehouse()">Zvětšit sklad (+500) za ${(500000 * state.warehouse.level).toLocaleString()} Kč</button>
        </div>
        
        <h3 style="margin-top:15px; color:var(--orange)">🚚 VLASTNÍ EXPEDICE ZBOŽÍ</h3>
        <div style="background:rgba(0,0,0,0.3); padding:12px; border-radius:6px; border:1px solid rgba(255,255,255,0.05); font-size:12px">
            <div style="margin-bottom:8px">
                <label>Zvolit komoditu:</label>
                <select id="exp-comm" style="width:100%; background:rgba(6,12,24,0.9); border:1px solid var(--border-light); color:white; padding:4px; border-radius:4px; margin-top:2px">
                    <option value="food">Obilí (Máš: ${state.warehouse.stock.food || 0})</option>
                    <option value="parts">Ocel (Máš: ${state.warehouse.stock.parts || 0})</option>
                    <option value="electronics">Elektronika (Máš: ${state.warehouse.stock.electronics || 0})</option>
                </select>
            </div>
            <div style="margin-bottom:8px">
                <label>Cílové město prodejce:</label>
                <select id="exp-dest" style="width:100%; background:rgba(6,12,24,0.9); border:1px solid var(--border-light); color:white; padding:4px; border-radius:4px; margin-top:2px">
                    ${citySelectOptions}
                </select>
            </div>
            <div style="margin-bottom:8px">
                <label>Vybrat tahač / dodávku:</label>
                <select id="exp-vehicle" style="width:100%; background:rgba(6,12,24,0.9); border:1px solid var(--border-light); color:white; padding:4px; border-radius:4px; margin-top:2px">
                    ${vehicleSelectOptions}
                </select>
            </div>
            <div style="margin-bottom:12px">
                <label>Množství k naložení (ks):</label>
                <input type="number" id="exp-qty" class="form-input" style="background:rgba(0,0,0,0.5); border:1px solid var(--border-light); color:white; padding:4px; border-radius:4px; width:100%; margin-top:2px" placeholder="Počet kusů...">
            </div>
            <button class="btn btn-orange" onclick="dispatchCustomCommodity()">EXPEDOVAT A PRODAT</button>
        </div>
        
        <h3 style="margin-top:20px; color:var(--blue);">🚢 ZÁSOBOVÁNÍ SÍTĚ</h3>
        <div id="warehouse-supply-network"></div>
        
        <h3 style="margin-top:20px; color:var(--gold)">🏢 KORPORÁTNÍ POPTÁVKA</h3>
        <div id="warehouse-b2b-list"></div>
    `;

    // 3. Render supply network and B2B list
    const supplyEl = document.getElementById('warehouse-supply-network');
    if (supplyEl) {
        const shipCargo = state.warehouse.shipCargo || [];
        if (shipCargo.length === 0) {
            supplyEl.innerHTML = '<div style="color:#555; font-size:13px">Žádný náklad z lodí. Lodě mohou ukládat náklad do skladu pro synergické rozvody.</div>';
        } else {
            supplyEl.innerHTML = shipCargo.map((cargo, idx) => {
                const daysStored = state.day - cargo.storedDay;
                const isExpired = daysStored > 7;
                const canDistribute = !isExpired && (state.warehouse.stock.motorest || 0) > 0 && (state.warehouse.stock.gas || 0) > 0;
                return `
                <div class="card" style="margin-bottom:10px; border-left:4px solid ${isExpired ? 'var(--red)' : 'var(--blue)'}">
                    <div class="card-body">
                        <h4 style="margin:0;color:${isExpired ? 'var(--red)' : 'var(--blue)'}">📦 ${cargo.name}</h4>
                        <p style="font-size:12px; color:var(--text-muted); margin:8px 0">Hodnota: ${cargo.value.toLocaleString()} Kč | Uloženo: ${daysStored} dní</p>
                        <p style="font-size:12px; color:${canDistribute ? 'var(--green)' : 'var(--red)'}">
                            Motorest: ${state.warehouse.stock.motorest || 0} | Čerpačky: ${state.warehouse.stock.gas || 0}
                        </p>
                        <button class="btn ${canDistribute ? 'btn-blue' : 'btn-disabled'} btn-sm" ${canDistribute ? `onclick="distributeCargo(${idx})"` : 'disabled'}>
                            ${isExpired ? 'ZKAŽENO' : canDistribute ? 'ROZVÉST DO SÍTĚ (+30% příjem 48h)' : 'Potřeba motorest/čerpačky'}
                        </button>
                    </div>
                </div>`;
            }).join('');
        }
    }

    const b2bEl = document.getElementById('warehouse-b2b-list');
    if (b2bEl) {
        const contracts = (state.warehouse.b2bContracts || []).filter(c => c.expiresDay >= state.day);
        if (contracts.length === 0) {
            b2bEl.innerHTML = '<div style="color:#555; font-size:13px">Žádné B2B požadavky. Vrací se každé 3 dny.</div>';
        } else {
            b2bEl.innerHTML = contracts.map((c, idx) => {
                let stock = state.warehouse.stock[c.itemType] || 0;
                let label = c.itemType === 'fresh_food' ? 'Čerstvé jídlo' : c.itemType.charAt(0).toUpperCase()+c.itemType.slice(1);
                let canDo = stock >= c.qty;
                let reward = Math.floor(c.qty * (state.marketPrices[c.itemType] || 0) * c.multiplier);
                return `<div class="card" style="margin-bottom:10px; border-left:4px solid var(--cyan)"><div class="card-body"><h4 style="margin:0;color:var(--cyan)">${c.company} potřebuje ${c.qty} ${label}</h4><p style="font-size:12px; color:var(--text-muted); margin:8px 0">Odměna: <b>${reward.toLocaleString()} Kč</b> (x${c.multiplier}) | Platí do dne: ${c.expiresDay}</p><p style="font-size:12px; color:${canDo ? 'var(--green)' : 'var(--red)'}">Sklad: ${stock} / ${c.qty}</p><button class="btn ${canDo ? 'btn-green' : 'btn-disabled'} btn-sm" ${canDo ? `onclick="fulfillB2BContract(${idx})"` : 'disabled'}>${canDo ? 'SPLNIT KONTRAKT' : 'Nedostatek zásob'}</button></div></div>`;
            }).join('');
        }
    }
    drawWarehouseChart();
}

function dispatchCustomCommodity() {
    let vid = parseInt(document.getElementById('exp-vehicle').value);
    let dest = document.getElementById('exp-dest').value;
    let comm = document.getElementById('exp-comm').value;
    let qty = parseInt(document.getElementById('exp-qty').value);
    
    if (isNaN(vid)) return notify("EXPEDICE", "Vyber platné vozidlo.", "warning");
    if (!dest) return notify("EXPEDICE", "Vyber cílové město.", "warning");
    if (!comm) return notify("EXPEDICE", "Vyber komoditu.", "warning");
    if (isNaN(qty) || qty <= 0) return notify("EXPEDICE", "Zadej platné množství.", "warning");
    
    let v = state.vehicles.find(x => x.id === vid);
    if (!v) return notify("EXPEDICE", "Vozidlo nenalezeno.", "danger");
    if (v.job) return notify("EXPEDICE", "Vozidlo je již na cestě.", "warning");
    
    let stock = state.warehouse.stock[comm] || 0;
    if (stock < qty) return notify("EXPEDICE", "Nedostatek zásob ve skladu.", "danger");
    
    let capacity = v.type === 'van' ? 30 : v.type === 'solo' ? 80 : 200;
    if (qty > capacity) return notify("EXPEDICE", `Množství překračuje kapacitu vozidla (${capacity} ks).`, "warning");
    
    // Deduct stock from warehouse
    state.warehouse.stock[comm] -= qty;
    
    // Create custom job
    let label = comm === 'food' ? 'Obilí' : comm === 'parts' ? 'Ocel' : 'Elektronika';
    v.job = {
        id: Date.now(),
        dest: dest,
        pay: 0,
        cargo: `EXPEDICE: ${label} (${qty} ks)`,
        type: v.type,
        isCustomCommodity: true,
        commodityType: comm,
        qty: qty,
        dist: Math.floor(Math.random() * 800) + 200
    };
    
    notify("EXPEDICE SPUŠTĚNA", `Vozidlo ${v.model} vyrazilo směr ${dest} s ${qty} ks ${label}.`, "success");
    pushToTicker(`<b>EXPEDICE:</b> Odeslána dodávka ${label} do ${dest} vozem ${v.model}.`, "info");
    SysLog('SKLAD', `🚚 Vlastní expedice: ${v.model} veze ${qty} ks ${label} do ${dest}.`);
    
    renderWarehouse();
    renderAll();
    saveGame();
}

function fulfillB2BContract(idx) {
    const contracts = (state.warehouse.b2bContracts || []).filter(c => c.expiresDay >= state.day);
    const contract = contracts[idx];
    if (!contract) return notify('B2B', 'Kontrakt nenalezen.', 'warning');
    let stock = state.warehouse.stock[contract.itemType] || 0;
    if (stock < contract.qty) return notify('B2B', 'Nemáš dostatečné zásoby.', 'warning');
    state.warehouse.stock[contract.itemType] -= contract.qty;
    let reward = Math.floor(contract.qty * (state.marketPrices[contract.itemType] || 0) * contract.multiplier);
    addMoney(reward);
    pushToTicker(`<b>B2B:</b> Splněno ${contract.company} - +${reward.toLocaleString()} Kč`, 'success');
    SysLog('SKLAD', `🏢 B2B kontrakt pro ${contract.company} splněn (+${reward.toLocaleString()} Kč).`);
    state.warehouse.b2bContracts = (state.warehouse.b2bContracts || []).filter(c => c.id !== contract.id);
    notify('B2B', `Kontrakt ${contract.company} úspěšně splněn!`, 'success');
    saveGame();
    renderWarehouse();
    renderAll();
}

// INTERMODALNÍ SYNERGIE: Rozvody nákladu z lodí do sítě motorest/čerpaček
function distributeCargo(idx) {
    const shipCargo = state.warehouse.shipCargo || [];
    if (!shipCargo[idx]) return;
    
    const cargo = shipCargo[idx];
    const daysStored = state.day - cargo.storedDay;
    if (daysStored > 7) return notify('ZÁSOBOVÁNÍ', 'Náklad se zkazil.', 'danger');
    
    // Spotřebovat 1 motorest a 1 čerpačku
    if ((state.warehouse.stock.motorest || 0) < 1 || (state.warehouse.stock.gas || 0) < 1) {
        return notify('ZÁSOBOVÁNÍ', 'Potřebuješ motorest a čerpačku pro rozvody.', 'warning');
    }
    
    state.warehouse.stock.motorest -= 1;
    state.warehouse.stock.gas -= 1;
    
    // Přidat synergický bonus na 48 hodin
    state.synergyBonus = {
        active: true,
        endDay: state.day + 2, // 48 hodin = 2 dny
        multiplier: 1.3 // 30% bonus
    };
    
    // Odstranit náklad ze skladu
    state.warehouse.shipCargo.splice(idx, 1);
    
    notify('SYNERGIE AKTIVNÍ', `Náklad ${cargo.name} rozvezen do sítě! +30% příjem na 48 hodin.`, 'gold');
    renderWarehouse();
    renderAll();
    saveGame();
}

// HQ
function renderHQ() {
    const el = document.getElementById('hq-grid'); if(!el) return;
    el.innerHTML = HQ_DB.map(h => {
        let lvl = state.hq[h.id] || 0; let cost = h.baseCost * (lvl + 1); let isMax = lvl >= h.maxLvl;
        return `<div class="hq-building ${isMax?'hq-maxed':''}" onclick="${isMax?'':`upgradeHQ('${h.id}', ${cost})`}"><div style="font-size:32px;margin-bottom:10px">${h.icon}</div><h3 style="margin:0">${h.n}</h3><div style="font-size:12px;color:var(--text-muted);margin:5px 0">${h.desc}</div><div style="font-size:11px;color:var(--teal);margin-bottom:10px">${h.bonus}</div><div style="display:flex;justify-content:space-between;align-items:center"><b>Level ${lvl}/${h.maxLvl}</b> ${isMax?'<span style="color:var(--green)">MAX</span>':`<span style="color:var(--orange)">${cost.toLocaleString()} Kč</span>`}</div><div class="hq-lvl-bar"><div class="hq-lvl-fill" style="width:${(lvl/h.maxLvl)*100}%"></div></div></div>`;
    }).join('');
}

function upgradeHQ(id, cost) {
    if(state.money >= cost) { addMoney(-cost); state.hq[id]++; notify("HQ", "Infrastruktura vylepšena!", "success"); renderHQ(); saveGame(); }
    else notify("FINANCE", "Nemáš peníze na vylepšení HQ!", "warning");
}

// ============================================================
// JIRSTAN TOWER — TYCOON 8-BIT CUTAWAY & CENTRAL COMMAND
// ============================================================

let tycoonCanvasEngine = null;

function renderTower() {
    const container = document.getElementById('shelter-tower-container');
    if (!container) return;

    state.tower = state.tower || { floors: [], levels: {}, happiness: 80, energy: 80, underConstruction: null };
    state.tower.floors = state.tower.floors || [2, 3];
    state.tower.levels = state.tower.levels || {};
    if (state.tower.happiness === undefined) state.tower.happiness = 85;
    if (state.tower.energy === undefined) state.tower.energy = 90;

    const totalVehicles = state.vehicles.length + (state.ships || []).length + (state.planes || []).length + (state.buses || []).length;
    const activeTrucks = state.vehicles.filter(v => v.job).length;
    const netWorth = typeof calculateNetWorth === 'function' ? calculateNetWorth() : (state.money + 5000000);
    const activeRoutes = Math.max(12, Object.keys(CITIES).length * 8);

    // Calculate Tycoon Level & Exp
    const tycoonLevel = Math.max(1, Math.min(100, Math.floor(Math.sqrt(Math.max(10000, state.totalEarned || state.money) / 50000)) + (state.tower.floors.length * 3)));
    const expPercent = Math.min(99, Math.floor((state.totalEarned % 500000) / 5000) || 84);
    const rankTitle = tycoonLevel > 50 ? 'LOGISTICS TYCOON SUPREME' : (tycoonLevel > 30 ? 'LOGISTICS KING' : (tycoonLevel > 15 ? 'REGIONAL MAGNATE' : 'RISING OPERATOR'));

    // Active vehicle feed snippet for Left HUD
    let sampleVehicles = [];
    if (state.vehicles && state.vehicles.length > 0) {
        state.vehicles.slice(0, 2).forEach((v, i) => {
            sampleVehicles.push({
                type: '🚛',
                name: `Truck #${v.id || ('A' + (314 + i))}`,
                route: v.job ? `PRG > ${v.job.dest}` : 'PRG > BER',
                status: v.job ? 'Na cestě' : 'Připraven'
            });
        });
    } else {
        sampleVehicles.push({ type: '🚛', name: 'Truck #A314', route: 'PRG > BER', status: 'Na cestě' });
    }
    if (state.ships && state.ships.length > 0) {
        const s = state.ships[0];
        sampleVehicles.push({ type: '🚢', name: `Ship #${s.id || 'S002'}`, route: s.job ? `ROT > ${s.job.dest}` : 'ROT > NY', status: 'Atlantik' });
    } else {
        sampleVehicles.push({ type: '🚢', name: 'Ship #S002', route: 'ROT > NY', status: 'Atlantik' });
    }
    if (state.planes && state.planes.length > 0) {
        const p = state.planes[0];
        sampleVehicles.push({ type: '✈️', name: `Plane #${p.id || 'C901'}`, route: p.job ? `LHR > ${p.job.dest}` : 'LHR > PAR', status: 'Letová hladina' });
    } else {
        sampleVehicles.push({ type: '✈️', name: 'Plane #C901', route: 'LHR > PAR', status: 'Letová hladina' });
    }

    const activeVehiclesHtml = sampleVehicles.map(item => `
        <div class="concept-vehicle-row" onclick="switchTab('dispatch')" style="cursor:pointer" title="Zobrazit v dispečinku">
            <div style="display:flex; align-items:center; gap:8px">
                <span style="font-size:16px">${item.type}</span>
                <div>
                    <div style="font-weight:700; color:#fff; font-size:12px">${item.name}</div>
                    <div style="font-size:10px; color:var(--cyan); font-family:monospace">ROUTE: ${item.route}</div>
                </div>
            </div>
            <div style="text-align:right">
                <span style="font-size:10px; background:rgba(0,255,136,0.15); color:#00ff88; border:1px solid rgba(0,255,136,0.3); padding:2px 6px; border-radius:4px">
                    ${item.status}
                </span>
            </div>
        </div>
    `).join('');

    const layoutHtml = `
    <!-- Top Tycoon Bar (Concept Match) -->
    <div class="tycoon-top-hud">
        <div class="tycoon-rank-badge">
            <div class="tycoon-rank-title">
                <span>LEVEL ${tycoonLevel}</span>
                <span style="color:var(--text-muted)">|</span>
                <span>EXP: ${expPercent}%</span>
                <span style="color:var(--gold); font-size:10px">(Next: ${rankTitle})</span>
            </div>
            <div class="tycoon-exp-track">
                <div class="tycoon-exp-fill" style="width:${expPercent}%"></div>
            </div>
        </div>

        <div class="tycoon-currency-group">
            <div class="tycoon-currency-item">
                <span style="font-size:13px; color:var(--text-muted)">CASH:</span>
                <span class="tycoon-currency-cash">${state.money.toLocaleString()} Kč</span>
            </div>
            <div class="tycoon-currency-item">
                <span style="font-size:13px; color:var(--text-muted)">GEMS:</span>
                <span class="tycoon-currency-gems">💎 ${state.jirmanCoins || 750}</span>
            </div>
        </div>

        <div class="tycoon-profile-badge">
            <div class="tycoon-profile-avatar">👨‍💼</div>
            <div>
                <div style="font-weight:800; font-size:13px; color:#fff; font-family:'Orbitron'">Stanislav Starosta</div>
                <div style="font-size:10px; color:var(--cyan); letter-spacing:1px">CEO & TYCOON OWNER</div>
            </div>
        </div>
    </div>

    <!-- Vitals Status Bar -->
    <div class="vault-hud-bar" style="margin-bottom:16px">
        <div>
            <span style="color:var(--cyan); font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:700">🏢 JIRSTAN TOWER & HQ</span>
            <div style="font-size:22px; font-weight:900; color:white; font-family:'Orbitron'">${(state.tower.floors.length + 4) * 12} m <span style="font-size:12px; color:var(--text-muted); font-weight:normal">(${state.tower.floors.length + 4} pater celkem)</span></div>
        </div>
        <div class="vault-meter-box">
            <div class="vault-meter-label">
                <span style="color:var(--cyan)">⚡ ENERGIE SYSTÉMŮ</span>
                <span style="color:white">${Math.floor(state.tower.energy)}%</span>
            </div>
            <div class="vault-meter-track">
                <div class="vault-meter-fill-energy" style="width:${state.tower.energy}%;"></div>
            </div>
        </div>
        <div class="vault-meter-box">
            <div class="vault-meter-label">
                <span style="color:var(--gold)">😊 MORÁLKA TÝMU</span>
                <span style="color:white">${Math.floor(state.tower.happiness)}%</span>
            </div>
            <div class="vault-meter-track">
                <div class="vault-meter-fill-morale" style="width:${state.tower.happiness}%;"></div>
            </div>
        </div>
        <div style="display:flex; gap:8px;">
            <button class="btn btn-sm btn-orange" style="margin:0; font-family:'Rajdhani'; font-weight:700; letter-spacing:1px" onclick="interactTowerStat('coffee', 10000); renderTower();">☕ KÁVA (10k)</button>
            <button class="btn btn-sm btn-blue" style="margin:0; font-family:'Rajdhani'; font-weight:700; letter-spacing:1px" onclick="interactTowerStat('relax', 15000); renderTower();">🏖️ RELAX (15k)</button>
        </div>
    </div>

    <!-- 3-Column Tycoon Symmetrical Layout -->
    <div class="concept-tower-layout">
        
        <!-- 1. LEFT PANEL: FLEET COMMAND -->
        <div class="concept-side-panel">
            <div class="concept-hud-title">
                <span>FLEET COMMAND</span>
                <span style="color:#00ff88">🚛</span>
            </div>
            <div class="concept-stat-box">
                <span class="concept-stat-label">TOTAL FLEET:</span>
                <span class="concept-stat-value" style="color:#00d4ff">${totalVehicles.toLocaleString()}</span>
            </div>
            <div class="concept-stat-box">
                <span class="concept-stat-label">ACTIVE TRUCKS:</span>
                <span class="concept-stat-value" style="color:#00ff88">${activeTrucks.toLocaleString()}</span>
            </div>
            <div class="concept-stat-box">
                <span class="concept-stat-label">GLOBAL REACH:</span>
                <span class="concept-stat-value" style="color:var(--gold)">${activeRoutes} Routes</span>
            </div>
            <div class="concept-stat-box">
                <span class="concept-stat-label">NET WORTH:</span>
                <span class="concept-stat-value" style="color:#00ff88; display:flex; align-items:center; justify-content:space-between">
                    <span>${netWorth.toLocaleString()} Kč</span>
                    <span style="font-size:14px; color:#00ff88">📈</span>
                </span>
            </div>
            <div style="margin-top:4px">
                <span class="concept-stat-label" style="display:block; margin-bottom:8px">ACTIVE VEHICLES</span>
                <div style="display:flex; flex-direction:column; gap:8px">
                    ${activeVehiclesHtml}
                </div>
            </div>
        </div>

        <!-- 2. CENTER CUTAWAY CANVAS (PIXEL-ART TYCOON BUILDING) -->
        <div style="display:flex; flex-direction:column;">
            <div class="tycoon-canvas-wrapper">
                <canvas id="tycoonTowerCanvas" class="tycoon-canvas-screen"></canvas>
            </div>

            <!-- Bottom Dock Navigation (Concept Match) -->
            <div class="tycoon-dock-bar">
                <button class="tycoon-dock-btn active" onclick="switchTab('overview')">
                    <span class="tycoon-dock-icon">🏠</span>
                    <span>HOME</span>
                </button>
                <button class="tycoon-dock-btn" onclick="switchTab('dispatch')">
                    <span class="tycoon-dock-icon">🗺️</span>
                    <span>MAP</span>
                </button>
                <button class="tycoon-dock-btn" onclick="switchTab('fleet')">
                    <span class="tycoon-dock-icon">🚛</span>
                    <span>FLEET</span>
                </button>
                <button class="tycoon-dock-btn" onclick="switchTab('tech')">
                    <span class="tycoon-dock-icon">🧪</span>
                    <span>RESEARCH</span>
                </button>
                <button class="tycoon-dock-btn" onclick="switchTab('bank')">
                    <span class="tycoon-dock-icon">⚙️</span>
                    <span>SETTINGS</span>
                </button>
            </div>
        </div>

        <!-- 3. RIGHT PANEL: GLOBAL OPERATIONS -->
        <div class="concept-side-panel">
            <div class="concept-hud-title">
                <span>GLOBAL OPERATIONS</span>
                <span style="color:#00d4ff">🌍</span>
            </div>
            
            <div class="concept-stat-box">
                <span class="concept-stat-label">ACTIVE HUB:</span>
                <span class="concept-stat-value" style="color:#00ff88; font-size:16px">PRAGUE HQ (Level 5)</span>
                <span style="font-size:11px; color:#94a3b8">• Status: Optimal</span>
            </div>

            <div style="background:rgba(4,8,16,0.6); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:12px; font-size:12px">
                <span class="concept-stat-label" style="display:block; margin-bottom:10px">COMMODITY PERFORMANCE</span>
                
                <div class="tycoon-commodity-row">
                    <div class="tycoon-commodity-info">
                        <span>🎁 Food & Agriculture</span>
                        <b style="color:var(--orange)">11.2% • +15% marže</b>
                    </div>
                    <div class="tycoon-commodity-track">
                        <div class="tycoon-commodity-bar" style="width:11.2%; background:var(--orange)"></div>
                    </div>
                </div>

                <div class="tycoon-commodity-row">
                    <div class="tycoon-commodity-info">
                        <span>💻 Tech & Microchips</span>
                        <b style="color:var(--cyan)">91.0% • +30% poptávka</b>
                    </div>
                    <div class="tycoon-commodity-track">
                        <div class="tycoon-commodity-bar" style="width:91%; background:var(--cyan)"></div>
                    </div>
                </div>

                <div class="tycoon-commodity-row">
                    <div class="tycoon-commodity-info">
                        <span>🚗 Automotive</span>
                        <b style="color:#a855f7">53.0% • Expresní</b>
                    </div>
                    <div class="tycoon-commodity-track">
                        <div class="tycoon-commodity-bar" style="width:53%; background:#a855f7"></div>
                    </div>
                </div>

                <div class="tycoon-commodity-row">
                    <div class="tycoon-commodity-info">
                        <span>🌐 Maritime & Air</span>
                        <b style="color:#38bdf8">78.4% • Vytížení</b>
                    </div>
                    <div class="tycoon-commodity-track">
                        <div class="tycoon-commodity-bar" style="width:78.4%; background:#38bdf8"></div>
                    </div>
                </div>

                <div class="tycoon-commodity-row">
                    <div class="tycoon-commodity-info">
                        <span>⛏️ Mining & Raw Ore</span>
                        <b style="color:var(--gold)">36.0% • Aktivní</b>
                    </div>
                    <div class="tycoon-commodity-track">
                        <div class="tycoon-commodity-bar" style="width:36%; background:var(--gold)"></div>
                    </div>
                </div>
            </div>

            <div class="concept-stat-box">
                <span class="concept-stat-label">REVENUE BREAKDOWN</span>
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:4px">
                    <span style="color:#94a3b8">🎁 Food:</span>
                    <b style="color:#fff">$16,898</b>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:2px">
                    <span style="color:#94a3b8">💻 Tech:</span>
                    <b style="color:#00ff88">$1,832,560</b>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:12px; margin-top:2px">
                    <span style="color:#94a3b8">🚗 Auto:</span>
                    <b style="color:#38bdf8">$719,645</b>
                </div>
            </div>

            <button class="btn btn-sm btn-green" style="width:100%; margin-top:4px" onclick="switchTab('hq')">
                🏗️ SPRÁVA INFRASTRUKTURY HQ
            </button>
        </div>

    </div>`;

    container.innerHTML = layoutHtml;

    // Start Canvas Cutaway Engine
    setTimeout(() => {
        initTycoonTowerCanvas();
    }, 50);
}

// ============================================================
// TYCOON PIXEL-ART CUTAWAY CANVAS ENGINE
// ============================================================
class TycoonCanvasEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animationId = null;
        this.tick = 0;
        this.hoveredRoom = null;
        this.mousePos = { x: -1, y: -1 };
        
        // Stars
        this.stars = [];
        for (let i = 0; i < 45; i++) {
            this.stars.push({
                x: Math.random(),
                y: Math.random() * 0.45,
                size: Math.random() > 0.8 ? 2 : 1,
                twinkleSpeed: 0.02 + Math.random() * 0.05,
                phase: Math.random() * Math.PI * 2
            });
        }

        // Animated particles (dust in quarry, cold vapor in server room, lightning)
        this.particles = [];
        for (let i = 0; i < 30; i++) {
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                vx: (Math.random() - 0.5) * 0.001,
                vy: (Math.random() - 0.5) * 0.001,
                alpha: Math.random(),
                type: i % 3 === 0 ? 'server' : (i % 3 === 1 ? 'quarry' : 'spark')
            });
        }

        this.setupEvents();
        this.resize();
    }

    setupEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.mousePos.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mousePos.x = -1;
            this.mousePos.y = -1;
            this.hoveredRoom = null;
        });

        this.canvas.addEventListener('click', () => {
            if (this.hoveredRoom) {
                this.handleRoomClick(this.hoveredRoom);
            }
        });

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = Math.max(600, rect.width || 750);
        this.height = 640;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    start() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        const loop = () => {
            this.tick++;
            this.render();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        ctx.clearRect(0, 0, w, h);

        // 1. Draw Sky, Stars & Prague Night Skyline
        this.drawSkyAndPragueSkyline(ctx, w, h);

        // 2. Draw Cobblestone Ground & Victorian Street Lamps
        this.drawGroundAndStreet(ctx, w, h);

        // 3. Draw Cutaway Tycoon Building (Floors & Underground)
        this.drawBuildingCutaway(ctx, w, h);

        // 4. Draw Central Core & Lightning Conduit & Elevator
        this.drawElevatorAndCore(ctx, w, h);

        // 5. Draw Hover Highlights & Tooltip
        this.drawHoverAndTooltip(ctx, w, h);
    }

    drawSkyAndPragueSkyline(ctx, w, h) {
        // Night Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
        skyGrad.addColorStop(0, '#060a14');
        skyGrad.addColorStop(0.6, '#0c1629');
        skyGrad.addColorStop(1, '#152540');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.55);

        // Soft Moon
        ctx.save();
        ctx.fillStyle = '#fffae6';
        ctx.shadowColor = 'rgba(255, 250, 230, 0.4)';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(w - 70, 45, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Stars
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            const alpha = 0.3 + 0.7 * Math.abs(Math.sin(this.tick * star.twinkleSpeed + star.phase));
            ctx.globalAlpha = alpha;
            ctx.fillRect(star.x * w, star.y * h, star.size, star.size);
        });
        ctx.globalAlpha = 1.0;

        // Distant Prague Skyline Silhouettes (Gothic Spires & Old Town Rooftops)
        ctx.fillStyle = '#08101e';
        const groundY = h * 0.44;

        // Left Skyline
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(0, groundY - 50);
        ctx.lineTo(25, groundY - 55);
        ctx.lineTo(35, groundY - 80); // Spire 1
        ctx.lineTo(45, groundY - 55);
        ctx.lineTo(70, groundY - 60);
        ctx.lineTo(85, groundY - 100); // Church Tower
        ctx.lineTo(95, groundY - 100);
        ctx.lineTo(100, groundY - 120); // Cross tip
        ctx.lineTo(105, groundY - 100);
        ctx.lineTo(120, groundY - 65);
        ctx.lineTo(150, groundY - 70);
        ctx.lineTo(170, groundY);
        ctx.closePath();
        ctx.fill();

        // Right Skyline
        ctx.beginPath();
        ctx.moveTo(w, groundY);
        ctx.lineTo(w, groundY - 45);
        ctx.lineTo(w - 30, groundY - 50);
        ctx.lineTo(w - 45, groundY - 90); // Right spire
        ctx.lineTo(w - 60, groundY - 50);
        ctx.lineTo(w - 90, groundY - 60);
        ctx.lineTo(w - 110, groundY - 110); // Cathedral peak
        ctx.lineTo(w - 120, groundY - 60);
        ctx.lineTo(w - 160, groundY - 70);
        ctx.lineTo(w - 180, groundY);
        ctx.closePath();
        ctx.fill();

        // Tiny illuminated warm windows on background houses
        ctx.fillStyle = 'rgba(255, 195, 0, 0.7)';
        ctx.fillRect(15, groundY - 35, 4, 6);
        ctx.fillRect(55, groundY - 40, 4, 6);
        ctx.fillRect(88, groundY - 75, 5, 8);
        ctx.fillRect(w - 40, groundY - 35, 4, 6);
        ctx.fillRect(w - 80, groundY - 45, 4, 6);
        ctx.fillRect(w - 105, groundY - 80, 5, 8);
    }

    drawGroundAndStreet(ctx, w, h) {
        const groundY = h * 0.44;
        const streetH = 18;

        // Cobblestone ground pavement
        ctx.fillStyle = '#1c2430';
        ctx.fillRect(0, groundY, w, streetH);

        // Cobblestone lines
        ctx.strokeStyle = '#0f1520';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 12) {
            ctx.beginPath();
            ctx.moveTo(x, groundY);
            ctx.lineTo(x, groundY + streetH);
            ctx.stroke();
        }

        // 2 Victorian Street Lamps (Left & Right of Building)
        this.drawStreetLamp(ctx, 40, groundY);
        this.drawStreetLamp(ctx, w - 45, groundY);
    }

    drawStreetLamp(ctx, x, y) {
        // Lamp Post
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(x - 2, y - 40, 4, 40);
        ctx.fillRect(x - 6, y - 2, 12, 3);
        ctx.fillRect(x - 4, y - 44, 8, 4);

        // Warm glowing lantern
        ctx.save();
        ctx.fillStyle = '#ffc300';
        ctx.shadowColor = '#ffc300';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y - 42, 5, 0, Math.PI * 2);
        ctx.fill();

        // Light cone on ground
        ctx.fillStyle = 'rgba(255, 195, 0, 0.12)';
        ctx.beginPath();
        ctx.moveTo(x, y - 40);
        ctx.lineTo(x - 30, y + 16);
        ctx.lineTo(x + 30, y + 16);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawBuildingCutaway(ctx, w, h) {
        const bX = Math.floor(w * 0.12);
        const bW = Math.floor(w * 0.76);
        const groundY = Math.floor(h * 0.44);

        // Building Dimensions
        const aboveFloors = [
            { id: 'roof', name: 'Střešní Helipad & Satelitní Radar', h: 42, icon: '🚁', y: groundY - 210, w: bW * 0.68, x: bX + bW * 0.16 },
            { id: 'floor_4', name: 'Prezidentský Penthouse (Boardroom)', h: 54, icon: '👔', y: groundY - 168, w: bW * 0.82, x: bX + bW * 0.09 },
            { id: 'floor_3', name: 'Centrála Dispečinku (Control Room)', h: 56, icon: '🖥️', y: groundY - 114, w: bW * 0.94, x: bX + bW * 0.03 },
            { id: 'floor_2', name: 'Logistika & Odpočinková zóna', h: 56, icon: '☕', y: groundY - 58, w: bW, x: bX },
            { id: 'floor_1', name: 'Vstupní Recepce & Bezpečnost', h: 58, icon: '🏢', y: groundY - 2, w: bW, x: bX }
        ];

        const underFloors = [
            { id: 'u1', name: 'U1: Podzemní Garáž Tahačů (Fleet Bay)', h: 68, icon: '🚛', y: groundY + 56, w: bW, x: bX },
            { id: 'u2', name: 'U2: Těžká Technika & Kamenolom (Quarry)', h: 68, icon: '🚜', y: groundY + 124, w: bW, x: bX },
            { id: 'u3', name: 'U3: Kvantová AI Serverovna & Krypto Trezor', h: 68, icon: '💾', y: groundY + 192, w: bW, x: bX }
        ];

        this.roomBounds = [];

        // --- DRAW ABOVE GROUND FLOORS ---
        aboveFloors.forEach(f => {
            this.drawAboveFloor(ctx, f, w, h);
            this.roomBounds.push(f);
        });

        // --- DRAW SUBTERRANEAN ROCK BEDROCK CASING ---
        const uTop = groundY + 56;
        const uH = 204;
        
        // Bedrock Background (Layered rock strata)
        ctx.fillStyle = '#140c06';
        ctx.fillRect(bX - 8, uTop, bW + 16, uH);

        // Bedrock Outer Jagged Borders
        ctx.fillStyle = '#261408';
        ctx.fillRect(bX - 14, uTop, 6, uH);
        ctx.fillRect(bX + bW + 8, uTop, 6, uH);

        // --- DRAW UNDERGROUND FLOORS (U1, U2, U3) ---
        underFloors.forEach(f => {
            this.drawUndergroundFloor(ctx, f, w, h);
            this.roomBounds.push(f);
        });

        // Bedrock Foundation Base
        ctx.fillStyle = '#0a0502';
        ctx.fillRect(bX - 14, uTop + uH, bW + 28, 20);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.strokeRect(bX - 14, uTop + uH, bW + 28, 20);
    }

    drawAboveFloor(ctx, f, w, h) {
        const { x, y, w: fw, h: fh, id } = f;

        // Outer Structural Wall & Bevel
        ctx.fillStyle = '#090e18';
        ctx.fillRect(x, y, fw, fh);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, fw, fh);

        // Split in two wings (Left / Right of Central Elevator)
        const midX = w / 2;
        const coreW = 44;
        const leftW = (midX - coreW / 2) - x;
        const rightX = midX + coreW / 2;
        const rightW = (x + fw) - rightX;

        // Inside Backgrounds
        if (id === 'roof') {
            // Helipad & Radar
            ctx.fillStyle = '#0c1424';
            ctx.fillRect(x, y, fw, fh);
            
            // Painted Helipad 'H'
            const heliX = x + fw * 0.72;
            const heliY = y + fh * 0.55;
            ctx.strokeStyle = '#ffc300';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(heliX, heliY, 14, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#ffc300';
            ctx.font = '900 13px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('H', heliX, heliY);

            // Rotating Radar Mast on Left
            const radarX = x + fw * 0.22;
            const radarY = y + fh * 0.45;
            ctx.fillStyle = '#64748b';
            ctx.fillRect(radarX - 2, radarY, 4, 18);

            // Radar Dish (Animated Rotation)
            const angle = this.tick * 0.05;
            const dishW = Math.cos(angle) * 12;
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(radarX, radarY, Math.abs(dishW) + 2, 6, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Blinking Beacon
            const beaconOn = (this.tick % 40) < 20;
            ctx.fillStyle = beaconOn ? '#ef4444' : '#7f1d1d';
            ctx.beginPath();
            ctx.arc(radarX, radarY - 4, 3, 0, Math.PI * 2);
            ctx.fill();

            // VIP Helicopter hovering / landed
            this.drawPixelHelicopter(ctx, heliX, heliY - 2);

        } else if (id === 'floor_4') {
            // Executive Penthouse (Stanislav & Jiří)
            const bgGrad = ctx.createLinearGradient(x, y, x + fw, y + fh);
            bgGrad.addColorStop(0, '#1a0b2e');
            bgGrad.addColorStop(1, '#0c0517');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(x, y, fw, fh);

            // Panoramic Windows
            ctx.fillStyle = 'rgba(0, 212, 255, 0.08)';
            ctx.fillRect(x + 10, y + 8, leftW - 20, fh - 16);
            ctx.fillRect(rightX + 10, y + 8, rightW - 20, fh - 16);

            // Holographic World Map Screen on Left Wall
            ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
            ctx.fillRect(x + 16, y + 12, 60, 24);
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 16, y + 12, 60, 24);

            // Blinking Trade Routes on Map
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(x + 28, y + 20, 4, 4);
            ctx.fillRect(x + 52, y + 18, 4, 4);
            ctx.fillRect(x + 64, y + 26, 4, 4);

            // CEO Stanislav Starosta (Pixel Figure)
            this.drawPixelPerson(ctx, x + leftW - 35, y + fh - 8, 'suit', 'Stanislav');

            // Executive Boardroom Table on Right
            ctx.fillStyle = '#451a03';
            ctx.fillRect(rightX + 25, y + fh - 18, 55, 10);
            // Laptop on table
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(rightX + 45, y + fh - 24, 12, 6);

            // CTO Jiří Češík
            this.drawPixelPerson(ctx, rightX + rightW - 30, y + fh - 8, 'tech', 'Jiří');

        } else if (id === 'floor_3') {
            // Central Dispatch Control Room
            ctx.fillStyle = '#091829';
            ctx.fillRect(x, y, fw, fh);

            // 4 Multi-Monitor Workstations
            const wsLeft1 = x + 15;
            const wsLeft2 = x + leftW - 45;
            const wsRight1 = rightX + 15;
            const wsRight2 = rightX + rightW - 45;

            [wsLeft1, wsLeft2, wsRight1, wsRight2].forEach((wsX, idx) => {
                // Desk
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(wsX - 6, y + fh - 16, 28, 8);
                
                // Monitor (Glow screen)
                const screenColor = (idx % 2 === 0) ? '#00d4ff' : '#00ff88';
                ctx.fillStyle = screenColor;
                ctx.fillRect(wsX - 4, y + fh - 28, 14, 10);
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(wsX + 2, y + fh - 18, 4, 3); // Stand

                // Dispatcher Person
                this.drawPixelPerson(ctx, wsX + 12, y + fh - 8, 'dispatcher', `Disp ${idx+1}`);
            });

            // Wall Telemetry Graphs
            ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
            ctx.fillRect(x + leftW * 0.45, y + 8, 35, 15);
            ctx.fillRect(rightX + rightW * 0.35, y + 8, 35, 15);

        } else if (id === 'floor_2') {
            // Logistics & Lounge Floor
            ctx.fillStyle = '#111d33';
            ctx.fillRect(x, y, fw, fh);

            // Left: Logistics Whiteboard & Desk
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(x + 20, y + 10, 40, 22);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(x + 25, y + 16, 12, 2);
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(x + 25, y + 22, 18, 2);

            this.drawPixelPerson(ctx, x + leftW - 40, y + fh - 8, 'casual', 'Logistik');

            // Right: Lounge Couch & Coffee Machine
            ctx.fillStyle = '#7c2d12';
            ctx.fillRect(rightX + 20, y + fh - 18, 35, 10); // Sofa
            ctx.fillStyle = '#ea580c';
            ctx.fillRect(rightX + rightW - 25, y + fh - 24, 10, 16); // Coffee Machine

            // Walking Employee (Animated back & forth)
            const walkOffset = (Math.sin(this.tick * 0.03) * 0.5 + 0.5) * 40;
            this.drawPixelPerson(ctx, rightX + 65 + walkOffset, y + fh - 8, 'casual', 'Pauza');

        } else if (id === 'floor_1') {
            // Reception Lobby
            ctx.fillStyle = '#0d2229';
            ctx.fillRect(x, y, fw, fh);

            // Automatic Glass Doors
            ctx.fillStyle = 'rgba(0, 212, 255, 0.25)';
            ctx.fillRect(x + 15, y + 8, 30, fh - 16);
            ctx.fillRect(rightX + rightW - 45, y + 8, 30, fh - 16);

            // Reception Desk & Receptionist
            ctx.fillStyle = '#0f766e';
            ctx.fillRect(x + leftW - 55, y + fh - 20, 35, 12);
            this.drawPixelPerson(ctx, x + leftW - 40, y + fh - 10, 'reception', 'Recepce');

            // Corporate JIRSTAN Wall Logo
            ctx.fillStyle = '#00ff88';
            ctx.font = '700 9px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('JIRSTAN HQ', rightX + rightW * 0.45, y + 20);

            // Security Turnstiles
            ctx.fillStyle = '#475569';
            ctx.fillRect(rightX + 25, y + fh - 18, 6, 10);
            ctx.fillRect(rightX + 38, y + fh - 18, 6, 10);
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(rightX + 27, y + fh - 14, 2, 2);
            ctx.fillRect(rightX + 40, y + fh - 14, 2, 2);
        }

        // Room Level / Label Tag
        ctx.fillStyle = '#64748b';
        ctx.font = '700 9px Orbitron, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(f.name.split(' (')[0].toUpperCase(), x + 8, y + 4);
    }

    drawUndergroundFloor(ctx, f, w, h) {
        const { x, y, w: fw, h: fh, id } = f;

        // Subterranean Concrete Chamber
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(x, y, fw, fh);
        ctx.strokeStyle = '#2d1808';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, fw, fh);

        const midX = w / 2;
        const coreW = 44;
        const leftW = (midX - coreW / 2) - x;
        const rightX = midX + coreW / 2;
        const rightW = (x + fw) - rightX;

        if (id === 'u1') {
            // U1: Fleet Bay / Garage with 4 Detailed Pixel Trucks
            ctx.fillStyle = '#181e28';
            ctx.fillRect(x, y, fw, fh);

            // Yellow Hazard Stripes on Floor
            ctx.fillStyle = '#eab308';
            for (let hx = x; hx < x + fw; hx += 16) {
                ctx.fillRect(hx, y + fh - 4, 8, 4);
            }

            // Truck 1 (Left Bay 1: Scania Semi Hauler - Blue/Cyan)
            this.drawPixelTruck(ctx, x + 25, y + fh - 10, '#00d4ff', '#1e293b', 'Scania');

            // Truck 2 (Left Bay 2: Volvo Hauler - Gold/Orange)
            this.drawPixelTruck(ctx, x + leftW - 65, y + fh - 10, '#f59e0b', '#78350f', 'Volvo');

            // Truck 3 (Right Bay 1: Heavy Tipper - Green)
            this.drawPixelTruck(ctx, rightX + 25, y + fh - 10, '#10b981', '#064e3b', 'Tipper');

            // Truck 4 (Right Bay 2: Chrome Fuel Tanker)
            this.drawPixelTruck(ctx, rightX + rightW - 65, y + fh - 10, '#94a3b8', '#334155', 'Tanker');

            // Mechanic with Wrench
            this.drawPixelPerson(ctx, rightX + rightW * 0.45, y + fh - 8, 'mechanic', 'Mechanik');

        } else if (id === 'u2') {
            // U2: Heavy Machinery & Quarry Cavern
            ctx.fillStyle = '#1c130b';
            ctx.fillRect(x, y, fw, fh);

            // Rock Strata & Jagged Cavern Wall Texture
            ctx.fillStyle = '#2d1e11';
            ctx.fillRect(x + 10, y + 6, 80, 18);
            ctx.fillRect(x + leftW - 70, y + 10, 60, 16);
            ctx.fillRect(rightX + 20, y + 8, 70, 18);
            ctx.fillRect(rightX + rightW - 80, y + 6, 70, 20);

            // Heavy CAT Excavator on Left
            this.drawPixelExcavator(ctx, x + 35, y + fh - 10);

            // Heavy Mining Bulldozer
            this.drawPixelDozer(ctx, x + leftW - 55, y + fh - 10);

            // Heavy Spider Mining Rover on Right
            this.drawPixelSpiderBot(ctx, rightX + 35, y + fh - 10);

            // Heavy Articulated Dumper on Far Right
            this.drawPixelExcavator(ctx, rightX + rightW - 55, y + fh - 10, true);

            // Dust Particles floating
            ctx.fillStyle = 'rgba(217, 119, 6, 0.4)';
            this.particles.forEach(p => {
                if (p.type === 'quarry') {
                    ctx.fillRect(x + p.x * fw, y + p.y * fh, 2, 2);
                }
            });

        } else if (id === 'u3') {
            // U3: Quantum AI Server Farm & Krypto Vault
            ctx.fillStyle = '#031412';
            ctx.fillRect(x, y, fw, fh);

            // Cybernetic Floor Grid Lines
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
            ctx.lineWidth = 1;
            for (let gx = x; gx < x + fw; gx += 20) {
                ctx.beginPath();
                ctx.moveTo(gx, y);
                ctx.lineTo(gx, y + fh);
                ctx.stroke();
            }

            // 6 High-Density Server Racks with Pulsing LEDs
            const rackXs = [x + 20, x + 65, x + leftW - 50, rightX + 20, rightX + 65, rightX + rightW - 85];
            rackXs.forEach((rx, idx) => {
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(rx, y + 10, 32, fh - 20);
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(rx, y + 10, 32, fh - 20);

                // LED Matrix Array
                for (let row = 0; row < 5; row++) {
                    for (let col = 0; col < 3; col++) {
                        const ledBlink = ((this.tick + idx * 7 + row * 3 + col * 5) % 30) < 18;
                        ctx.fillStyle = ledBlink ? '#00ff88' : '#00d4ff';
                        ctx.fillRect(rx + 5 + col * 8, y + 16 + row * 8, 4, 3);
                    }
                }
            });

            // Titanium Vault Door on Far Right
            const vaultX = rightX + rightW - 32;
            const vaultY = y + fh * 0.5;
            ctx.fillStyle = '#334155';
            ctx.beginPath();
            ctx.arc(vaultX, vaultY, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // Vault Wheel
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(vaultX, vaultY, 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Underground Floor Badge Tag (U1, U2, U3)
        ctx.fillStyle = '#00ff88';
        ctx.font = '900 11px Orbitron, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(f.name.split(':')[0], x + 8, y + 6);
    }

    drawElevatorAndCore(ctx, w, h) {
        const midX = w / 2;
        const coreW = 40;
        const groundY = Math.floor(h * 0.44);
        const topY = groundY - 210;
        const botY = groundY + 260;

        // Central Vertical Shaft Column
        ctx.fillStyle = '#03060d';
        ctx.fillRect(midX - coreW / 2, topY, coreW, botY - topY);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(midX - coreW / 2, topY, coreW, botY - topY);

        // Crackling High-Voltage Electric Beam (Center Line)
        const beamGlow = ctx.createLinearGradient(0, topY, 0, botY);
        beamGlow.addColorStop(0, '#00d4ff');
        beamGlow.addColorStop(0.5, '#00ff88');
        beamGlow.addColorStop(1, '#00d4ff');

        ctx.strokeStyle = beamGlow;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(midX, topY);
        // Small lightning jitter
        for (let ly = topY; ly < botY; ly += 25) {
            const jitter = (Math.random() - 0.5) * 3;
            ctx.lineTo(midX + jitter, ly);
        }
        ctx.lineTo(midX, botY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Animated Glass Elevator Cabin Travelling
        const shaftH = (botY - topY) - 50;
        const elevProgress = (Math.sin(this.tick * 0.02) * 0.5 + 0.5);
        const elevY = topY + 15 + elevProgress * shaftH;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(midX - 16, elevY, 32, 36);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.strokeRect(midX - 16, elevY, 32, 36);

        // Warm internal light & Passenger
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(midX - 12, elevY + 4, 24, 20);
        this.drawPixelPerson(ctx, midX, elevY + 30, 'suit', '');

        // Central "VS / JIRSTAN" Glowing Badge at Ground Level
        ctx.save();
        const badgeY = groundY - 2;
        ctx.fillStyle = '#020617';
        ctx.beginPath();
        ctx.arc(midX, badgeY, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 14;
        ctx.stroke();

        ctx.fillStyle = '#00ff88';
        ctx.font = '900 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('VS', midX, badgeY);
        ctx.restore();
    }

    drawPixelPerson(ctx, x, y, style, label) {
        ctx.save();
        // Head
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(x - 3, y - 18, 6, 6);

        // Hair
        ctx.fillStyle = style === 'suit' ? '#1e293b' : (style === 'tech' ? '#b45309' : '#0f172a');
        ctx.fillRect(x - 3, y - 20, 6, 3);

        // Body / Suit / Uniform
        if (style === 'suit') {
            ctx.fillStyle = '#1e293b'; // Navy Suit
            ctx.fillRect(x - 4, y - 12, 8, 8);
            ctx.fillStyle = '#ef4444'; // Red Tie
            ctx.fillRect(x - 1, y - 11, 2, 4);
        } else if (style === 'tech') {
            ctx.fillStyle = '#0284c7'; // Blue polo
            ctx.fillRect(x - 4, y - 12, 8, 8);
        } else if (style === 'mechanic') {
            ctx.fillStyle = '#ea580c'; // Orange Overalls
            ctx.fillRect(x - 4, y - 12, 8, 8);
        } else {
            ctx.fillStyle = '#0d9488'; // Teal Dispatcher
            ctx.fillRect(x - 4, y - 12, 8, 8);
        }

        // Legs
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x - 3, y - 4, 3, 4);
        ctx.fillRect(x + 1, y - 4, 3, 4);

        ctx.restore();
    }

    drawPixelTruck(ctx, x, y, cabColor, trailerColor, label) {
        ctx.save();
        // Trailer Body
        ctx.fillStyle = trailerColor;
        ctx.fillRect(x, y - 24, 42, 18);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y - 24, 42, 18);

        // Tractor Cab
        ctx.fillStyle = cabColor;
        ctx.fillRect(x + 42, y - 22, 18, 16);
        // Windshield
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 50, y - 20, 8, 7);

        // Wheels
        ctx.fillStyle = '#0f172a';
        [x + 6, x + 20, x + 34, x + 52].forEach(wx => {
            ctx.beginPath();
            ctx.arc(wx, y - 3, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(wx - 1, y - 4, 2, 2);
            ctx.fillStyle = '#0f172a';
        });

        // Headlight Beams (Glowing on asphalt)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(x + 60, y - 12);
        ctx.lineTo(x + 78, y - 16);
        ctx.lineTo(x + 78, y - 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawPixelExcavator(ctx, x, y, isDumper = false) {
        ctx.save();
        if (isDumper) {
            // Articulated Dumper
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(x, y - 20, 36, 14);
            ctx.fillStyle = '#eab308';
            ctx.fillRect(x + 36, y - 18, 14, 12);
            // Wheels
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x + 4, y - 6, 8, 6);
            ctx.fillRect(x + 22, y - 6, 8, 6);
            ctx.fillRect(x + 40, y - 6, 8, 6);
        } else {
            // Excavator Tracks
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x, y - 8, 38, 8);
            ctx.fillStyle = '#64748b';
            ctx.fillRect(x + 2, y - 6, 34, 4);

            // Cab
            ctx.fillStyle = '#eab308';
            ctx.fillRect(x + 8, y - 24, 20, 16);
            ctx.fillStyle = '#38bdf8';
            ctx.fillRect(x + 20, y - 22, 6, 8);

            // Boom & Bucket
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.moveTo(x + 22, y - 20);
            ctx.lineTo(x + 40, y - 32);
            ctx.lineTo(x + 50, y - 14);
            ctx.stroke();

            // Bucket
            ctx.fillStyle = '#475569';
            ctx.fillRect(x + 46, y - 14, 8, 8);
        }
        ctx.restore();
    }

    drawPixelDozer(ctx, x, y) {
        ctx.save();
        // Tracks
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y - 8, 34, 8);

        // Cab
        ctx.fillStyle = '#eab308';
        ctx.fillRect(x + 6, y - 22, 18, 14);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 16, y - 20, 6, 6);

        // Blade
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 34, y - 18, 4, 16);
        ctx.restore();
    }

    drawPixelSpiderBot(ctx, x, y) {
        ctx.save();
        // Spider Mech Body
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 10, y - 20, 18, 12);
        ctx.strokeStyle = '#eab308';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 10, y - 20, 18, 12);

        // Glowing Eye
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x + 17, y - 16, 4, 3);

        // 4 Articulated Legs
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        // Leg 1
        ctx.beginPath(); ctx.moveTo(x + 10, y - 14); ctx.lineTo(x + 2, y - 22); ctx.lineTo(x, y - 2); ctx.stroke();
        // Leg 2
        ctx.beginPath(); ctx.moveTo(x + 28, y - 14); ctx.lineTo(x + 36, y - 22); ctx.lineTo(x + 38, y - 2); ctx.stroke();
        ctx.restore();
    }

    drawPixelHelicopter(ctx, x, y) {
        ctx.save();
        // Cabin
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(x - 14, y - 12, 28, 12);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 4, y - 10, 8, 6);

        // Tail Boom
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(x - 26, y - 8, 14, 4);
        ctx.fillRect(x - 28, y - 14, 3, 10);

        // Landing Skids
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x - 12, y + 2, 24, 2);
        ctx.fillRect(x - 8, y, 2, 2);
        ctx.fillRect(x + 6, y, 2, 2);

        // Spinning Rotor Blade
        const rotorSpan = Math.sin(this.tick * 0.4) * 26;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - rotorSpan, y - 15);
        ctx.lineTo(x + rotorSpan, y - 15);
        ctx.stroke();

        ctx.restore();
    }

    drawHoverAndTooltip(ctx, w, h) {
        const mx = this.mousePos.x;
        const my = this.mousePos.y;
        if (mx < 0 || my < 0) {
            this.hoveredRoom = null;
            this.canvas.style.cursor = 'default';
            return;
        }

        let found = null;
        for (const r of this.roomBounds) {
            if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
                found = r;
                break;
            }
        }

        this.hoveredRoom = found;
        if (found) {
            this.canvas.style.cursor = 'pointer';

            // Glowing neon hover border
            ctx.save();
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;
            ctx.strokeRect(found.x - 2, found.y - 2, found.w + 4, found.h + 4);
            ctx.restore();

            // Draw HUD Tooltip Card near cursor
            const cardW = 220;
            const cardH = 65;
            let cardX = mx + 15;
            let cardY = my - 30;
            if (cardX + cardW > w - 10) cardX = mx - cardW - 15;
            if (cardY + cardH > h - 10) cardY = h - cardH - 10;
            if (cardY < 10) cardY = 10;

            ctx.save();
            ctx.fillStyle = 'rgba(10, 15, 28, 0.95)';
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 1.5;
            ctx.shadowColor = 'rgba(0, 212, 255, 0.4)';
            ctx.shadowBlur = 10;
            ctx.fillRect(cardX, cardY, cardW, cardH);
            ctx.strokeRect(cardX, cardY, cardW, cardH);

            ctx.fillStyle = '#00ff88';
            ctx.font = '800 12px Orbitron, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(`${found.icon} ${found.name.split(' (')[0]}`, cardX + 10, cardY + 10);

            ctx.fillStyle = '#94a3b8';
            ctx.font = '500 11px Rajdhani, sans-serif';
            ctx.fillText('Stav: Plně v provozu • Klikni pro správu', cardX + 10, cardY + 28);

            ctx.fillStyle = '#00d4ff';
            ctx.font = '700 11px Orbitron, sans-serif';
            ctx.fillText('⚡ KLIKNI PRO OVLÁDÁNÍ', cardX + 10, cardY + 44);

            ctx.restore();
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    handleRoomClick(room) {
        if (!room) return;
        switch(room.id) {
            case 'roof':
                showTowerFloorModal(8);
                break;
            case 'floor_4':
                showTowerFloorModal(8);
                break;
            case 'floor_3':
                showTowerFloorModal(2);
                break;
            case 'floor_2':
                showTowerFloorModal(3);
                break;
            case 'floor_1':
                showOfficeModal();
                break;
            case 'u1':
                showGarageModal();
                break;
            case 'u2':
                switchTab('machines');
                break;
            case 'u3':
                showCryptoModal();
                break;
            default:
                showOfficeModal();
                break;
        }
    }
}

function initTycoonTowerCanvas() {
    const canvas = document.getElementById('tycoonTowerCanvas');
    if (!canvas) return;

    if (tycoonCanvasEngine) {
        tycoonCanvasEngine.stop();
        tycoonCanvasEngine = null;
    }

    tycoonCanvasEngine = new TycoonCanvasEngine(canvas);
    tycoonCanvasEngine.start();
}

function showTowerFloorModal(floorId) {
    const floor = TOWER_FLOORS_DB.find(f => f.id === floorId);
    if (!floor) return;
    
    state.tower = state.tower || { floors: [], levels: {}, happiness: 80, energy: 80, underConstruction: null };
    state.tower.floors = state.tower.floors || [];
    state.tower.levels = state.tower.levels || {};
    
    const isUnlocked = state.tower.floors.includes(floor.id);
    const lvl = state.tower.levels[floor.id] || 1;
    const isBuilding = state.tower.underConstruction && state.tower.underConstruction.floorId === floor.id;
    const upgradeCost = Math.floor(floor.cost * lvl * 0.5);
    const canBuy = !isUnlocked && !state.tower.underConstruction && state.money >= floor.cost;
    
    let actionBtn = '';
    if (isUnlocked) {
        if (state.tower.energy >= 10) {
            switch(floor.id) {
                case 2: actionBtn = `<button class="btn btn-green" onclick="useTowerFloor(${floor.id}); setTimeout(() => showTowerFloorModal(${floorId}), 100);">⚡ AI OPTIMALIZACE (+${(50000 * lvl).toLocaleString()} Kč | 10 E)</button>`; break;
                case 3: actionBtn = `<button class="btn btn-green" onclick="useTowerFloor(${floor.id}); setTimeout(() => showTowerFloorModal(${floorId}), 100);">🎓 INTENZIVNÍ ŠKOLENÍ (+${50 * lvl} XP řidičům | 10 E)</button>`; break;
                case 4: actionBtn = `<button class="btn btn-green" onclick="useTowerFloor(${floor.id}); setTimeout(() => showTowerFloorModal(${floorId}), 100);">📢 PR KAMPAŇ (+${2 * lvl} Reputace | 10 E)</button>`; break;
                case 5: actionBtn = `<button class="btn btn-green" onclick="useTowerFloor(${floor.id}); setTimeout(() => showTowerFloorModal(${floorId}), 100);">🛡️ SATELITNÍ PATROLA (-50% riziko škod | 10 E)</button>`; break;
                case 6: actionBtn = `<button class="btn btn-green" onclick="useTowerFloor(${floor.id}); setTimeout(() => showTowerFloorModal(${floorId}), 100);">🍸 VIP RECEPCE (+${10 * lvl} Morálka týmu | 10 E)</button>`; break;
                case 7: actionBtn = `<button class="btn btn-green" onclick="useTowerFloor(${floor.id}); setTimeout(() => showTowerFloorModal(${floorId}), 100);">🔬 R&D VÝZKUM (+${100 * lvl} Body výzkumu | 10 E)</button>`; break;
                case 8: actionBtn = `<button class="btn btn-green" onclick="useTowerFloor(${floor.id}); setTimeout(() => showTowerFloorModal(${floorId}), 100);">🚁 PREZIDENTSKÝ LET (+${(200000 * lvl).toLocaleString()} Kč VIP zisk | 10 E)</button>`; break;
                default: actionBtn = `<button class="btn btn-green" onclick="useTowerFloor(${floor.id}); setTimeout(() => showTowerFloorModal(${floorId}), 100);">⚡ AKTIVOVAT FUNKCI PATRA (10 E)</button>`; break;
            }
        } else {
            actionBtn = `<span style="color:var(--red); font-weight:bold; font-size:12px;">Zaměstnanci jsou vyčerpaní! Kup jim kávu nebo relax v záhlaví věže.</span>`;
        }
    }
    
    let html = `
        <h2 style="color:var(--gold); margin-top:0; font-family:'Orbitron'">${floor.icon} ${floor.id}. PATRO: ${floor.name.toUpperCase()}</h2>
        <p style="color:var(--text-muted)">Speciální sekce mrakodrapu. Poskytuje permanentní bonusy pro firmu.</p>
        
        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid var(--border-light); margin-bottom:20px; font-size:13px; line-height:1.6">
            <div>Status: <b style="color:${isUnlocked ? 'var(--green)' : (isBuilding ? 'var(--gold)' : 'var(--red)')}">${isUnlocked ? 'Odemčeno a Aktivní' : (isBuilding ? 'Probíhá výstavba' : 'Uzamčeno')}</b></div>
            <div>Permanentní bonus: <b style="color:var(--cyan)">${floor.bonus}</b></div>
            <div>Aktuální úroveň: <b>Level ${lvl} / 5</b></div>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px">
            ${isUnlocked ? `
                ${actionBtn}
                ${lvl < 5 ? `<button class="btn btn-orange" onclick="upgradeTowerFloor(${floor.id}, ${upgradeCost}); setTimeout(() => showTowerFloorModal(${floorId}), 100);">⭐ VYLEPŠIT ÚROVEŇ PATRA (${upgradeCost.toLocaleString()} Kč)</button>` : '<span style="color:var(--gold); font-weight:bold; font-size:12px; text-align:center;">PATRO JE NA MAXIMÁLNÍ ÚROVNI (5)</span>'}
            ` : isBuilding ? `
                <div style="background:rgba(255, 157, 0, 0.1); border:1px dashed #ff9d00; padding:15px; border-radius:6px; text-align:center;">
                    <span style="color:var(--gold); font-weight:bold;">🏗️ PROBÍHÁ VÝSTAVBA (${Math.floor(state.tower.underConstruction.progress)}%)</span>
                </div>
            ` : `
                <button class="btn btn-green" ${canBuy ? '' : 'disabled'} onclick="buyTowerFloor(${floor.id}); closeModal(); renderTower();">
                    🔓 POSTAVIT PATRO (${floor.cost.toLocaleString()} Kč)
                </button>
            `}
        </div>
        <button class="btn btn-dark" onclick="closeModal()">ZAVŘÍT</button>
    `;
    
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function buyTowerFloor(floorId) {
    const floor = TOWER_FLOORS_DB.find(f => f.id === floorId);
    if (!floor) return;
    if (state.money >= floor.cost) {
        addMoney(-floor.cost);
        state.tower.floors.push(floorId);
        state.tower.levels[floorId] = 1;
        notify("VÝSTAVBA PATRA", `Patro ${floorId} (${floor.name}) bylo úspěšně postaveno!`, "success");
        pushToTicker(`<b>JIRSTAN TOWER:</b> Dokončena výstavba: ${floor.name}.`, "success");
        SysLog('VĚŽ', `🏗️ Dokončena výstavba patra ${floorId}: ${floor.name} (-${floor.cost.toLocaleString()} Kč).`);
        saveGame();
        renderTower();
    } else {
        notify("FINANCE", "Nemáš dostatek financí na stavbu tohoto patra!", "warning");
    }
}

function upgradeTowerFloor(floorId, cost) {
    if (state.money >= cost) {
        addMoney(-cost);
        state.tower.levels[floorId] = (state.tower.levels[floorId] || 1) + 1;
        notify("UPGRADE PATRA", `Patro ${floorId} povýšeno na Level ${state.tower.levels[floorId]}!`, "gold");
        SysLog('VĚŽ', `⬆️ Upgrade patra ${floorId} na Level ${state.tower.levels[floorId]} (-${cost.toLocaleString()} Kč).`);
        saveGame();
        renderTower();
    } else {
        notify("FINANCE", "Nemáš peníze na vylepšení patra!", "warning");
    }
}

function useTowerFloor(floorId) {
    state.tower = state.tower || { floors: [], levels: {}, happiness: 80, energy: 80 };
    if (state.tower.energy < 10) {
        notify("ENERGIE", "Zaměstnanci potřebují kávu nebo odpočinek!", "warning");
        return;
    }
    state.tower.energy -= 10;
    const lvl = state.tower.levels[floorId] || 1;
    switch(floorId) {
        case 2: addMoney(50000 * lvl); notify("AI OPTIMALIZACE", `Získáno +${(50000*lvl).toLocaleString()} Kč!`, "success"); break;
        case 3: state.drivers.forEach(d => d.xp += 50 * lvl); notify("ŠKOLENÍ", `Řidiči získali +${50*lvl} XP!`, "success"); break;
        case 4: state.reputation += 2 * lvl; notify("PR KAMPAŇ", `Reputace zvýšena o +${2*lvl}!`, "success"); break;
        case 5: notify("BEZPEČNOST", "Flotila je pod satelitní ochranou!", "info"); break;
        case 6: state.tower.happiness = Math.min(100, state.tower.happiness + 10 * lvl); notify("VIP LOUNGE", "Morálka týmu stoupla!", "pink"); break;
        case 7: notify("R&D LAB", "Výzkumné laboratoře pracují na plný výkon!", "cyan"); break;
        case 8: addMoney(200000 * lvl); notify("PREZIDENTSKÝ PENTHOUSE", `Získáno +${(200000*lvl).toLocaleString()} Kč!`, "gold"); break;
    }
    SysLog('VĚŽ', `⚡ Použita schopnost patra ${floorId} (Spotřebováno 10% energie týmu).`);
    saveGame();
    renderTower();
}

function interactTowerStat(type, cost) {
    state.tower = state.tower || { floors: [], levels: {}, happiness: 80, energy: 80 };
    if (state.money >= cost) {
        addMoney(-cost);
        if (type === 'coffee') {
            state.tower.energy = Math.min(100, state.tower.energy + 30);
            notify("KÁVA PRO TÝM", "Čerstvé espresso dodalo týmu +30% energie!", "success");
            SysLog('VĚŽ', `☕ Nákup espressa pro tým (+30% energie, -${cost.toLocaleString()} Kč).`);
        } else if (type === 'relax') {
            state.tower.happiness = Math.min(100, state.tower.happiness + 30);
            notify("WELLNESS", "Wellness víkend zvýšil morálku týmu o +30%!", "pink");
            SysLog('VĚŽ', `💆 Wellness program pro zaměstnance (+30% spokojenost, -${cost.toLocaleString()} Kč).`);
        }
        saveGame();
        renderTower();
    } else {
        notify("FINANCE", "Nemáš dostatek financí na tuto akci!", "warning");
    }
}

function showOfficeModal() {
    let h = `
        <h2 style="color:var(--green); margin-top:0; font-family:'Orbitron'">🏢 HLAVNÍ KANCELÁŘ VEDENÍ (1. PATRO)</h2>
        <p style="color:var(--text-muted)">Centrála vedení společnosti JIRSTAN LOGISTICS.</p>
        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid var(--border-light); margin-bottom:20px; font-size:13px; line-height:1.6">
            <div>👨‍💼 <b>Stanislav Starosta</b> (CEO & Zakladatel) — Strategické řízení a finance</div>
            <div>☕ <b>Jiří Češík</b> (CTO & Spoluzakladatel) — Technický dohled a automatizace</div>
            <div>👩‍💼 <b>Kateřina</b> (Finanční ředitelka) — Účetnictví, daně a pojištění</div>
        </div>
        <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap">
            <button class="btn btn-orange" onclick="buyCoffeeJirka(); closeModal();">☕ Koupit kávu pro Jirku (5 000 Kč / +20 XP)</button>
            <button class="btn btn-pink" onclick="if(state.money>=5000){addMoney(-5000); notify('KATEŘINA', 'Kateřina dostala čokoládu a má radost!', 'pink'); saveGame();}else{notify('FINANCE','Nemáš peníze!','warning');}">🍫 Čokoláda pro Kateřinu (5 000 Kč)</button>
        </div>
        <button class="btn btn-dark" onclick="closeModal()">ZAVŘÍT</button>
    `;
    document.getElementById('modal-content').innerHTML = h;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function showGarageModal() {
    let h = `
        <h2 style="color:var(--orange); margin-top:0; font-family:'Orbitron'">🚛 SERVISNÍ DÍLNA & DEPO FLOTILY (PŘÍZEMÍ)</h2>
        <p style="color:var(--text-muted)">Správa servisních stání, heverů a kapacity garáže.</p>
        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid var(--border-light); margin-bottom:20px; font-size:13px; line-height:1.6">
            <div>Aktuální kapacita garáže: <b style="color:white">${state.vehicles.length} / ${state.garageCapacity || 5} vozidel</b></div>
            <div>Úroveň dílny: <b style="color:var(--gold)">Level ${state.hq.workshop || 0} (Sleva ${(state.hq.workshop || 0) * 10}%)</b></div>
        </div>
        <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap">
            <button class="btn btn-green" onclick="buyGarageSlot(); setTimeout(showGarageModal, 100);">➕ Rozšířit garáž (+2 místa / 200 000 Kč)</button>
            <button class="btn btn-blue" onclick="closeModal(); switchTab('workshop');">🔧 Přejít do Dílny</button>
        </div>
        <button class="btn btn-dark" onclick="closeModal()">ZAVŘÍT</button>
    `;
    document.getElementById('modal-content').innerHTML = h;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function showCryptoModal() {
    let h = `
        <h2 style="color:var(--purple); margin-top:0; font-family:'Orbitron'">🪙 KRYPTO-SERVEROVNA & HLAVNÍ TREZOR (SUTERÉN -1)</h2>
        <p style="color:var(--text-muted)">Podzemní serverová farma a bezpečný trezor.</p>
        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid var(--border-light); margin-bottom:20px; font-size:13px; line-height:1.6">
            <div>Aktuální cena Bitcoinu: <b style="color:var(--gold)">${(state.market.crypto.price || 50).toLocaleString()} Kč</b></div>
            <div>Vlastněné krypto: <b style="color:var(--cyan)">${(state.investments.crypto || 0).toLocaleString()} BTC</b></div>
        </div>
        <div style="display:flex; gap:10px; margin-bottom:20px; flex-wrap:wrap">
            <button class="btn btn-purple" onclick="closeModal(); switchTab('bank');">🏦 Přejít na Burzu & Investice</button>
        </div>
        <button class="btn btn-dark" onclick="closeModal()">ZAVŘÍT</button>
    `;
    document.getElementById('modal-content').innerHTML = h;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function renderGasNetwork() {
    const el = document.getElementById('tab-gas');
    if (!el) return;
    const gn = state.gasNetwork;

    const levelUpCost = 300000 * (gn.level + 1) * (gn.level > 0 ? (gn.level * 1.5) : 1);
    const dinerCost = 500000;
    const shopCost = 250000;
    const bistroCost = 400000;

    let income = gn.level * 15000;
    if (gn.hasShop) income *= 1.2;
    if (gn.hasDiner) income += 35000;
    if (gn.hasBistro) income += 25000;

    let html = `
        <div class="banner">
            <img src="JIRSTAN BENZINKA.jpg" alt="Benzínka" style="width:100%; height:200px; object-fit:cover; border-radius:8px;" onerror="this.src='https://via.placeholder.com/1000x200/111/ff9d00?text=JIRSTAN+GAS'">
             <div class="banner-overlay"><h2>⛽ SÍŤ ČERPACÍCH STANIC JIRSTAN</h2></div>
        </div>
        <p style="color:var(--text-muted); margin-bottom:30px; font-size:15px">Buduj vlastní impérium čerpacích stanic. Generují pasivní příjem a poskytují slevy a bonusy pro tvou flotilu.</p>
        
        <div class="grid" style="grid-template-columns: repeat(4, 1fr); gap: 25px;">
            <!-- Upgrade 1: Network Level -->
            <div class="card hq-building ${gn.level >= 5 ? 'hq-maxed' : ''}" ${gn.level < 5 ? `onclick="buyGasUpgrade('level', ${levelUpCost})"` : ''}>
                <div class="card-body">
                    <div style="font-size:32px;margin-bottom:10px">⛽</div>
                    <h3>ROZŠÍŘENÍ SÍTĚ</h3>
                    <p style="font-size:12px; color:var(--text-muted);min-height:40px;">Zvyšuje denní zisk a slevu na palivo pro tvou flotilu.</p>
                    <div style="font-size:12px;color:var(--teal);margin-bottom:10px">Příjem: +15,000 Kč/den | Sleva na palivo: +2%</div>
                    <div style="display:flex;justify-content:space-between;align-items:center; margin-top: auto;">
                        <b>Level ${gn.level}/5</b> 
                        ${gn.level >= 5 ? '<span style="color:var(--green)">MAX</span>' : `<span style="color:var(--orange)">${Math.floor(levelUpCost).toLocaleString()} Kč</span>`}
                    </div>
                    <div class="hq-lvl-bar"><div class="hq-lvl-fill" style="width:${(gn.level/5)*100}%"></div></div>
                </div>
            </div>

            <!-- Upgrade 2: Diner -->
            <div class="card hq-building ${gn.hasDiner ? 'hq-maxed' : ''}" ${!gn.hasDiner ? `onclick="buyGasUpgrade('diner', ${dinerCost})"` : ''}>
                <div class="card-body">
                    <div style="font-size:32px;margin-bottom:10px">🍔</div>
                    <h3>MOTOREST U BRATRŮ</h3>
                    <p style="font-size:12px; color:var(--text-muted);min-height:40px;">Řidiči se mají kde najíst. Zpomaluje jejich únavu a generuje extra zisk.</p>
                    <div style="font-size:12px;color:var(--teal);margin-bottom:10px">Zisk: +35,000 Kč/den | Únava řidičů: -10%</div>
                    <div style="display:flex;justify-content:space-between;align-items:center; margin-top: auto;">
                        <b>Jednorázový nákup</b>
                        ${gn.hasDiner ? '<span style="color:var(--green)">VLASTNĚNO</span>' : `<span style="color:var(--orange)">${dinerCost.toLocaleString()} Kč</span>`}
                    </div>
                </div>
            </div>

            <!-- Upgrade 3: Shop -->
            <div class="card hq-building ${gn.hasShop ? 'hq-maxed' : ''}" ${!gn.hasShop ? `onclick="buyGasUpgrade('shop', ${shopCost})"` : ''}>
                <div class="card-body">
                    <div style="font-size:32px;margin-bottom:10px">🛒</div>
                    <h3>OBCHOD (SHOP)</h3>
                    <p style="font-size:12px; color:var(--text-muted);min-height:40px;">Zvyšuje základní pasivní příjem ze sítě čerpacích stanic.</p>
                    <div style="font-size:12px;color:var(--teal);margin-bottom:10px">Bonus k příjmu ze sítě: +20%</div>
                    <div style="display:flex;justify-content:space-between;align-items:center; margin-top: auto;">
                        <b>Jednorázový nákup</b> 
                        ${gn.hasShop ? '<span style="color:var(--green)">VLASTNĚNO</span>' : `<span style="color:var(--orange)">${shopCost.toLocaleString()} Kč</span>`}
                    </div>
                </div>
            </div>

            <!-- Upgrade 4: Bistro -->
            <div class="card hq-building ${gn.hasBistro ? 'hq-maxed' : ''}" ${!gn.hasBistro ? `onclick="buyGasUpgrade('bistro', ${bistroCost})"` : ''}>
                <div class="card-body">
                    <div style="font-size:32px;margin-bottom:10px">☕</div>
                    <h3>BISTRO</h3>
                    <p style="font-size:12px; color:var(--text-muted);min-height:40px;">Kavárna s občerstvením pro řidiče a cestující. Generuje pasivní příjem.</p>
                    <div style="font-size:12px;color:var(--teal);margin-bottom:10px">Zisk: +25,000 Kč/den</div>
                    <div style="display:flex;justify-content:space-between;align-items:center; margin-top: auto;">
                        <b>Jednorázový nákup</b>
                        ${gn.hasBistro ? '<span style="color:var(--green)">VLASTNĚNO</span>' : `<span style="color:var(--orange)">${bistroCost.toLocaleString()} Kč</span>`}
                    </div>
                </div>
            </div>
        </div>

        <div class="stat-card" style="margin-top: 30px; text-align:left; padding: 25px; border-left: 4px solid var(--orange);">
            <h3 style="margin-top:0; color:var(--orange)">SOUHRNNÉ STATISTIKY SÍTĚ</h3>
            <p style="margin:0; font-size:14px; color:var(--text-main)">Celkový denní příjem: <b style="color:var(--green); font-size: 18px;">+${Math.floor(income).toLocaleString()} Kč</b></p>
            <p style="margin:5px 0 0 0; font-size:14px; color:var(--text-main)">Globální sleva na palivo pro flotilu: <b style="color:var(--teal); font-size: 18px;">-${gn.level * 2}%</b></p>
        </div>
    `;
    el.innerHTML = html;
}

function buyGasUpgrade(type, cost) {
    if (state.money < cost) {
        return notify("FINANCE", "Nemáš dostatek peněz na toto vylepšení!", "warning");
    }

    addMoney(-cost);
    const gn = state.gasNetwork;

    if (type === 'level') {
        if (gn.level < 5) {
            gn.level++;
            notify("SÍŤ BENZÍNEK", `Síť rozšířena na Level ${gn.level}!`, "success");
        }
    } else if (type === 'diner') {
        if (!gn.hasDiner) {
            gn.hasDiner = true;
            notify("SÍŤ BENZÍNEK", "Motorest 'U Bratrů' byl úspěšně zakoupen a otevřen!", "success");
        }
    } else if (type === 'shop') {
        if (!gn.hasShop) {
            gn.hasShop = true;
            notify("SÍŤ BENZÍNEK", "Obchod na benzínce byl otevřen, zisky porostou!", "success");
        }
    } else if (type === 'bistro') {
        if (!gn.hasBistro) {
            gn.hasBistro = true;
            notify("SÍŤ BENZÍNEK", "Bistro bylo otevřeno, hosté si užívají kávu a zákusky!", "success");
        }
    }

    renderGasNetwork();
    saveGame();
}

// BUS & IPO (NEW)
function renderIPO() {
    const el = document.getElementById('ipo-section'); if (!el) return;
    const ipo = state.ipo;
    let html = '';
    if (!ipo.active) {
        html = `<p style="font-size:13px;color:var(--text-muted)">Vstup na globální burzu přinese firmě obrovský kapitál, ale zavazuje tě k vyplácení dividend akcionářům.</p>
                <button class="btn btn-gold" style="margin-top:15px" onclick="goPublic()">VSTOUPIT NA BURZU (50M Kč)</button>`;
    } else {
        html = `<p style="font-size:13px;color:var(--text-muted)">Tvá firma je nyní veřejně obchodovaná. Vlastníš <b>${ipo.sharesOwned.toFixed(2)}%</b> akcií.</p>
                <p style="font-size:12px;color:var(--red)">Denně musíš vyplácet 5% ze zisku jako dividendy.</p>
                <button class="btn btn-dark" style="margin-top:15px" onclick="buyBackShares()">Odkoupit 1% akcií zpět (25M Kč)</button>`;
    }
    el.innerHTML = html;
}

function goPublic() {
    if (state.money < 50000000) return notify("FINANCE", "Nemáš dostatek hotovosti (50M) pro vstup na burzu.", "warning");
    if (confirm("Opravdu chceš vstoupit na burzu? Získáš 250M Kč, ale budeš muset vyplácet dividendy!")) {
        addMoney(-50000000);
        addMoney(250000000);
        state.ipo.active = true;
        state.ipo.sharesOwned = 40; // Player sells 60% of the company
        notify("IPO", "Vstup na burzu byl úspěšný! Na účet přiteklo 250,000,000 Kč kapitálu.", "gold");
        pushToTicker(`<b>JIRSTAN, a.s.</b> je nyní na burze! Cena akcií raketově roste!`, "gold");
        renderIPO();
        saveGame();
    }
}

function buyBackShares() {
    if (state.money < 25000000) return notify("FINANCE", "Nemáš dostatek hotovosti (25M) na odkup akcií.", "warning");
    if (state.ipo.sharesOwned >= 100) return notify("AKCIE", "Již vlastníš 100% firmy.", "info");
    
    addMoney(-25000000);
    state.ipo.sharesOwned = Math.min(100, state.ipo.sharesOwned + 1);
    notify("AKCIE", `Úspěšně jsi odkoupil 1% akcií. Nyní vlastníš ${state.ipo.sharesOwned.toFixed(2)}%.`, "success");
    renderIPO();
    saveGame();
}

function renderBuses() {
    const el = document.getElementById('tab-buses'); if(!el) return;

    if (state.hq.bus_terminal === 0) {
        el.innerHTML = `<div style="text-align:center; padding: 50px 20px; background: var(--surface-1); border-radius:12px;">
            <h2 style="color:var(--green)">🚌 DIVIZE OSOBNÍ DOPRAVY JE ZAMČENÁ</h2>
            <p style="color:var(--text-muted)">Pro odemčení této funkce musíš nejprve postavit "Autobusový terminál" v sekci Sídlo firmy (HQ).</p>
            <button class="btn btn-green" onclick="switchTab('hq', document.querySelector('[onclick*=\\'hq\\']'))">Přejít do HQ</button>
        </div>`;
        return;
    }
    
    el.innerHTML = `
        <h2 style="color:var(--green)">🚌 OSOBNÍ DOPRAVA</h2>
        <p style="color:var(--text-muted); margin-bottom:30px; font-size:15px">Spravuj flotilu autobusů, obsluhuj pravidelné linky a voz turisty na lukrativní zájezdy.</p>
        
        <h3 style="margin-top:40px;">TVOJE AUTOBUSY</h3>
        <div class="grid" id="bus-fleet-grid"></div>

        <h3 style="margin-top:40px; border-bottom:1px solid var(--border-light); padding-bottom:10px;">PRODEJNA AUTOBUSŮ</h3>
        <div class="grid" id="bus-shop-grid"></div>
    `;

    const fleetEl = document.getElementById('bus-fleet-grid');
    const shopEl = document.getElementById('bus-shop-grid');

    if (fleetEl) {
        fleetEl.innerHTML = state.buses.map(b => {
            const route = BUS_ROUTES.find(r => r.id === b.routeId);
            return `
            <div class="card">
                <div class="card-body">
                    <h3 style="color:var(--green);margin:0">${b.model}</h3>
                    <div style="font-size:12px;color:var(--text-muted);margin:5px 0">Stav: ${Math.floor(b.cond)}% | Palivo: ${Math.floor(b.fuel)}%</div>
                    <div style="font-size:12px;color:var(--text-muted);margin:5px 0">Čistota: ${Math.floor(b.cleanliness)}%</div>
                    <div class="progress-bar" style="width:100%; height:6px; background:var(--surface-2); border-radius:3px; margin:5px 0;">
                        <div style="width:${b.cleanliness}%; height:100%; background:linear-gradient(90deg, #ff6b6b, #4ecdc4); border-radius:3px;"></div>
                    </div>
                    <div style="font-size:12px;color:var(--text-muted);margin:5px 0">Linka: ${route ? route.name : '<span style=\"color:#bbb\">žádná</span>'}</div>
                    <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
                        <select id="bus-route-${b.id}" style="flex:1;min-width:150px;">${BUS_ROUTES.map(rt => `<option value='${rt.id}' ${b.routeId===rt.id?'selected':''}>${rt.name}</option>`).join('')}</select>
                        <button class="btn btn-sm btn-blue" onclick="assignBusRoute(${b.id}, document.getElementById('bus-route-${b.id}').value)">Přiřadit linku</button>
                    </div>
                    <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="btn btn-sm btn-green" onclick="repairBus(${b.id})">Opravit (+20% stav)</button>
                        <button class="btn btn-sm btn-orange" onclick="refuelBus(${b.id})">Doplnit palivo (100)</button>
                        <button class="btn btn-sm btn-blue" onclick="washBus(${b.id})">Umyť (100% čistota)</button>
                    </div>
                    <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="btn btn-sm ${b.upgrades.engine ? 'btn-disabled' : 'btn-purple'}" onclick="upgradeBus(${b.id}, 'engine')" ${b.upgrades.engine ? 'disabled' : ''}>Motor +10%</button>
                        <button class="btn btn-sm ${b.upgrades.interior ? 'btn-disabled' : 'btn-purple'}" onclick="upgradeBus(${b.id}, 'interior')" ${b.upgrades.interior ? 'disabled' : ''}>Interiér +5%</button>
                    </div>
                </div>
            </div>
            `;
        }).join('') || '<div style="color:var(--text-muted); grid-column: span 3;">Zatím nevlastníš žádné autobusy.</div>';
    }

    if (shopEl) {
        shopEl.innerHTML = BUS_DB.map(b => `
            <div class="card">
                <img src="${b.img}" class="card-img" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(45deg, #333, #555)'; this.parentElement.innerHTML+='<span style=&quot;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);padding:10px 15px;border-radius:6px;font-size:12px;color:#999&quot;>Foto chybí</span>'">
                <div class="card-body">
                    <h3>${b.model}</h3>
                    <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px">Kapacita: ${b.capacity} | Luxus: ${'⭐'.repeat(b.luxury)}</div>
                    <b style="color:var(--orange);font-size:18px">${b.price.toLocaleString()} Kč</b>
                    <button class="btn btn-green" onclick="buyBus('${b.model}')">KOUPIT</button>
                </div>
            </div>
        `).join('');
    }
}

function buyBus(model) {
    const busData = BUS_DB.find(b => b.model === model);
    if (!busData) return;

    const maxBuses = state.hq.bus_terminal * 2;
    if (state.buses.length >= maxBuses) {
        return notify("KAPACITA", `Autobusový terminál je plný! Vylepši ho v HQ pro více míst.`, "warning");
    }

    if (state.money >= busData.price) {
        addMoney(-busData.price);
        state.buses.push({
            id: Date.now(),
            ...busData,
            cond: 100,
            fuel: 100,
            cleanliness: 100,
            upgrades: {},
            driverId: null,
            routeId: null,
            tourId: null 
        });
        notify("NÁKUP", `Zakoupen nový autobus: ${model}!`, "success");
        renderBuses();
        saveGame();
    } else {
        notify("FINANCE", "Nemáš dost peněz na nákup tohoto autobusu.", "warning");
    }
}

function assignBusRoute(busId, routeId) {
    const bus = state.buses.find(b => b.id === busId);
    const route = BUS_ROUTES.find(r => r.id === routeId);
    if (!bus || !route) {
        return notify("AUTOBUSY", "Chybná linka nebo autobus nebyl nalezen.", "warning");
    }

    bus.routeId = route.id;
    notify("AUTOBUSY", `Linka ${route.name} byla přiřazena k ${bus.model}.`, "success");
    renderBuses();
    saveGame();
}

function repairBus(busId) {
    const bus = state.buses.find(b => b.id === busId);
    if (!bus) return;
    if (state.money < 250000) return notify("AUTOBUSY", "Potřebuješ 250 000 Kč na servis.", "warning");
    addMoney(-250000);
    bus.cond = Math.min(100, bus.cond + 20);
    notify("SERVIS", `${bus.model} opraven na ${Math.floor(bus.cond)}%.`, "success");
    renderBuses(); saveGame();
}

function refuelBus(busId) {
    const bus = state.buses.find(b => b.id === busId);
    if (!bus) return;
    const cost = Math.floor(state.fuelPrice * 50);
    if (state.money < cost) return notify("AUTOBUSY", "Nemáš peníze na natankování autobusu.", "warning");
    addMoney(-cost);
    bus.fuel = Math.min(100, bus.fuel + 50);
    notify("PALIVO", `${bus.model} natankován o 50%.`, "success");
    renderBuses(); saveGame();
}

function washBus(busId) {
    const bus = state.buses.find(b => b.id === busId);
    if (!bus) return;
    if (state.money < 50000) return notify("AUTOBUSY", "Potřebuješ 50 000 Kč na umytí autobusu.", "warning");
    addMoney(-50000);
    bus.cleanliness = 100;
    notify("ÚKLID", `${bus.model} kompletně umyt a vyleštěn!`, "success");
    renderBuses(); saveGame();
}

function upgradeBus(busId, type) {
    const bus = state.buses.find(b => b.id === busId);
    if (!bus) return;
    if (bus.upgrades[type]) return notify("UPGRADES", "Tento upgrade už máš!", "warning");
    
    const costs = { engine: 1000000, interior: 750000 };
    const cost = costs[type];
    if (state.money < cost) return notify("AUTOBUSY", `Potřebuješ ${cost.toLocaleString()} Kč na upgrade.`, "warning");
    
    addMoney(-cost);
    bus.upgrades[type] = true;
    const names = { engine: "Motor", interior: "Interiér" };
    notify("UPGRADE", `${bus.model} vylepšen: ${names[type]}!`, "success");
    renderBuses(); saveGame();
}

// ====== NEW: AUTOMYČKA JIRSTAN ======
function renderCarwash() {
    const el = document.getElementById('tab-carwash');
    if (!el || !el.classList.contains('active')) return;

    // Compute average cleanliness
    let totalClean = 0;
    let activeVehicles = state.vehicles.length + state.ships.length + state.buses.length;
    state.vehicles.forEach(v => { totalClean += v.cleanliness || 100; });
    state.ships.forEach(s => { totalClean += s.cleanliness || 100; });
    state.buses.forEach(b => { totalClean += b.cleanliness || 100; });
    let avgClean = activeVehicles > 0 ? Math.floor(totalClean / activeVehicles) : 100;

    // Update status section
    document.getElementById('cw-level').innerText = state.carwash.level;
    document.getElementById('cw-avg-cleanliness').innerText = avgClean;
    document.getElementById('cw-wax-status').innerText = state.carwash.waxActivated ? ('✅ AKTIVNÍ (' + (state.carwash.waxUntil - state.day) + ' dní)') : '❌ NE';
    document.getElementById('cw-auto-staff-status').innerText = state.carwash.autoWashStaff ? '✅ AKTIVNÍ' : '❌ NENÍ';

    const baseCost = 200000 - (state.carwash.level * 20000); // Zlevňuje se s úrovní
    document.getElementById('cw-wash-cost').innerText = (baseCost / 1000).toFixed(0);

    // Upgradable buttons
    document.getElementById('cw-upgrade-level-btn').innerText = state.carwash.level >= 5 ? '✅ MAX ÚROVEŇ' : `Koupit upgrade (+1 level) (${500000 * state.carwash.level} Kč)`;
    document.getElementById('cw-upgrade-level-btn').disabled = state.carwash.level >= 5;
    
    document.getElementById('cw-wax-btn').innerText = state.carwash.waxActivated ? '✅ JIŽ KOUPEN' : 'Koupit voskování (2,5M)';
    document.getElementById('cw-wax-btn').disabled = state.carwash.waxActivated;
    
    document.getElementById('cw-auto-staff-btn').innerText = state.carwash.autoWashStaff ? '✅ JIŽ KOUPEN' : 'Koupit tým (100M)';
    document.getElementById('cw-auto-staff-btn').disabled = state.carwash.autoWashStaff;

    document.getElementById('cw-public-access-btn').innerText = state.carwash.publicAccess ? '✅ AKTIVNÍ' : 'Koupit veřejný provoz (10M)';
    document.getElementById('cw-public-access-btn').disabled = state.carwash.publicAccess;

    document.getElementById('cw-recycle-water-btn').innerText = state.carwash.recycleWater ? '✅ AKTIVNÍ' : 'Koupit recyklaci vody (5M)';
    document.getElementById('cw-recycle-water-btn').disabled = state.carwash.recycleWater;

    // Manual wash list (sorted by dirtiness)
    const allVehicles = [];
    state.vehicles.forEach(v => { allVehicles.push({...v, vType: 'truck', driverId: v.driverId || null}); });
    state.ships.forEach(s => { allVehicles.push({...s, vType: 'ship'}); });
    state.buses.forEach(b => { allVehicles.push({...b, vType: 'bus'}); });
    
    allVehicles.sort((a, b) => (a.cleanliness || 100) - (b.cleanliness || 100)); // Nejšpinavěji nahoře

    const manualList = document.getElementById('carwash-manual-list');
    manualList.innerHTML = allVehicles.map(v => {
        const washCost = state.carwash.recycleWater ? 0 : Math.max(100000, baseCost);
        let icon = v.vType === 'truck' ? '🚛' : (v.vType === 'ship' ? '🚢' : '🚌');
        return `
            <div style="background:var(--surface-1); border:1px solid var(--border-light); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center">
                <div style="flex:1">
                    <h4 style="margin:0; color:${(v.cleanliness || 100) < 50 ? 'var(--red)' : 'white'}">${icon} ${v.model}</h4>
                    <div style="font-size:12px; color:var(--text-muted); margin:5px 0">Čistota: <b style="color:${(v.cleanliness || 100) < 50 ? 'var(--red)' : 'var(--green)'}">${Math.floor(v.cleanliness || 100)}%</b></div>
                </div>
                <button class="btn btn-sm btn-blue" onclick="manualWashVehicle(${v.id}, '${v.vType}', ${washCost})">UMYŤ (${(washCost/1000).toFixed(0)}k)</button>
            </div>
        `;
    }).join('') || '<div style="color:var(--text-muted); text-align:center; padding:20px">Žádná vozidla nejsou dostupná.</div>';
}

function manualWashVehicle(vehicleId, vType, cost) {
    if (state.money < cost) {
        return notify("AUTOMYČKA", `Nemáš dost peněz! Potřebuješ ${cost.toLocaleString()} Kč.`, "warning");
    }

    addMoney(-cost);
    
    if (vType === 'truck') {
        const v = state.vehicles.find(x => x.id === vehicleId);
        if (v) {
            v.cleanliness = 100;
            if (state.carwash.waxActivated && state.carwash.waxUntil > state.day) {
                v.shinyUntil = state.day + 3; // +5% bonus
            }
        }
    } else if (vType === 'ship') {
        const s = state.ships.find(x => x.id === vehicleId);
        if (s) {
            s.cleanliness = 100;
            if (state.carwash.waxActivated && state.carwash.waxUntil > state.day) {
                s.shinyUntil = state.day + 3;
            }
        }
    } else if (vType === 'bus') {
        const b = state.buses.find(x => x.id === vehicleId);
        if (b) {
            b.cleanliness = 100;
            if (state.carwash.waxActivated && state.carwash.waxUntil > state.day) {
                b.shinyUntil = state.day + 3;
            }
        }
    }

    notify("AUTOMYČKA", "Vozidlo bylo umyto na 100% čistotu!", "success");
    renderCarwash();
    updateUI();
    saveGame();
}

function upgradeCarwashLevel() {
    if (state.carwash.level >= 5) {
        return notify("AUTOMYČKA", "Myčka už je na maximální úrovni!", "info");
    }

    const cost = 500000 * state.carwash.level;
    if (state.money < cost) {
        return notify("AUTOMYČKA", `Nemáš dost peněz! Potřebuješ ${cost.toLocaleString()} Kč.`, "warning");
    }

    addMoney(-cost);
    state.carwash.level++;
    notify("AUTOMYČKA", `Úroveň myčky zvýšena na ${state.carwash.level}!`, "success");
    renderCarwash();
    updateUI();
    saveGame();
}

function buyCarwashWax() {
    if (state.carwash.waxActivated) {
        return notify("AUTOMYČKA", "Voskování je již aktivní!", "info");
    }

    const cost = 2500000;
    if (state.money < cost) {
        return notify("AUTOMYČKA", `Nemáš dost peněz! Potřebuješ ${cost.toLocaleString()} Kč.`, "warning");
    }

    addMoney(-cost);
    state.carwash.waxActivated = true;
    state.carwash.waxUntil = state.day + 3;
    notify("AUTOMYČKA", "Voskování PREMIUM bylo zakoupeno! Nove umytá vozidla budou mít +5% bonus k zisku na 3 dny.", "success");
    renderCarwash();
    updateUI();
    saveGame();
}

function buyAutoWashStaff() {
    if (state.carwash.autoWashStaff) {
        return notify("AUTOMYČKA", "Automatický personál je již koupen!", "info");
    }

    const cost = 100000000; // 100M
    if (state.money < cost) {
        return notify("AUTOMYČKA", `Nemáš dost peněz! Potřebuješ ${cost.toLocaleString()} Kč.`, "warning");
    }

    addMoney(-cost);
    state.carwash.autoWashStaff = true;
    notify("AUTOMYČKA", "Automatický personál koupen! Myčka nyní automaticky umyje všechna vozidla vrátivší se pod 40% čistotu.", "success");
    renderCarwash();
    updateUI();
    saveGame();
}

function buyPublicAccessCarwash() {
    if (state.carwash.publicAccess) {
        return notify('AUTOMYČKA', 'Veřejný provoz je již aktivní.', 'info');
    }
    const cost = 10000000;
    if (state.money < cost) return notify('AUTOMYČKA', `Nemáš ${cost.toLocaleString()} Kč na veřejný provoz.`, 'warning');
    addMoney(-cost);
    state.carwash.publicAccess = true;
    notify('AUTOMYČKA', 'Automyčka nyní přijímá veřejnost a generuje +25 000 Kč/den.', 'success');
    renderCarwash();
    updateUI();
    saveGame();
}

function buyRecycleWaterUpgrade() {
    if (state.carwash.recycleWater) {
        return notify('AUTOMYČKA', 'Recyklace vody je již aktivní.', 'info');
    }
    const cost = 5000000;
    if (state.money < cost) return notify('AUTOMYČKA', `Nemáš ${cost.toLocaleString()} Kč na recyklaci vody.`, 'warning');
    addMoney(-cost);
    state.carwash.recycleWater = true;
    notify('AUTOMYČKA', 'Recyklace vody aktivována! Nyní je mytí zdarma.', 'success');
    renderCarwash();
    updateUI();
    saveGame();
}

// TECH
function renderTech() {
    const status = document.getElementById('tech-status'); const el = document.getElementById('tech-grid'); if(!status || !el) return;
    if(state.researching) status.innerHTML = `<div style="background:rgba(255,215,0,0.1);border-left:4px solid var(--gold);padding:15px;border-radius:6px"><b>Probíhá výzkum: ${state.researching.n}</b><div class="xp-bar-bg"><div class="xp-bar-fill" style="width:${(state.researching.progress/state.researching.duration)*100}%;background:var(--gold)"></div></div></div>`;
    else status.innerHTML = `<div style="color:#555">Aktuálně nic nevyzkoumáváš. Zvol projekt níže.</div>`;

    el.innerHTML = TECH_DB.map(t => {
        let has = state.tech.includes(t.id); let reqMet = !t.req || state.tech.includes(t.req); let repMet = state.reputation >= t.minRep;
        let cls = has ? 'owned' : ((!reqMet || !repMet || state.researching) ? 'locked' : '');
        let stTxt = has ? 'VYZKOUMÁNO' : (!reqMet ? `Chybí predrekvizita: ${TECH_DB.find(x=>x.id===t.req)?.n}` : (!repMet ? `Potřeba Reputace: ${t.minRep}` : `${t.cost.toLocaleString()} Kč | ${t.time} min`));
        return `<div class="tech-node ${cls}" ${cls==='' ? `onclick="startResearch('${t.id}', ${t.cost}, ${t.time}, '${t.n}')"` : ''}><h3 style="margin:0;font-size:15px">${t.n}</h3><div style="font-size:11px;color:var(--text-muted);margin:8px 0">${t.desc}</div><b style="font-size:12px;color:${has?'var(--green)':'var(--gold)'}">${stTxt}</b></div>`;
    }).join('');
}

function startResearch(id, cost, time, n) {
    if(state.money >= cost) { addMoney(-cost); state.researching = {id, n, duration: time, progress: 0}; notify("VÝZKUM", "Technologický výzkum zahájen!", "info"); renderTech(); saveGame(); }
    else notify("FINANCE", "Nemáš dost peněz na tento výzkum!", "warning");
}

// ACHIEVEMENTS
function checkAchievements() {
    ACH_DB.forEach(a => {
        if(!state.achievements.includes(a.id) && a.check(state)) {
            state.achievements.push(a.id);
            addMoney(a.reward);
            notify("🏆 ÚSPĚCH ODBLOKOVÁN", `${a.n}! Získáváš ${a.reward.toLocaleString()} Kč.`, "gold");
        }
    });
}

function getAchievementProgress(id) {
    switch (id) {
        case 'first_mil': return Math.min(100, Math.floor((state.money / 1000000) * 100));
        case 'multi_mil': return Math.min(100, Math.floor((state.money / 10000000) * 100));
        case 'veteran': return Math.min(100, Math.floor((state.day / 100) * 100));
        case 'buyout': return Object.values(state.competitors).some(c => c.boughtOut) ? 100 : 0;
        case 'fleet_boss': return Math.min(100, Math.floor((state.vehicles.length / 5) * 100));
        case 'collector': return Math.min(100, Math.floor((state.vehicles.length / 15) * 100));
        case 'tech_guru': return Math.min(100, Math.floor((state.tech.length / TECH_DB.length) * 100));
        case 'global_empire': return ((state.ships.length > 0 ? 50 : 0) + (state.planes.length > 0 ? 50 : 0));
        default: return 0;
    }
}

function renderAchievements() {
    const el = document.getElementById('achievements-list'); if(!el) return;
    let c = 0;
    el.innerHTML = ACH_DB.map(a => {
        let has = state.achievements.includes(a.id); if(has) c++;
        let progress = getAchievementProgress(a.id);
        let statusText = has ? '🔓 ODEMČENO' : '🔒 ZAMČENO';
        let statusColor = has ? 'var(--green)' : 'var(--text-muted)';
        let cardBorder = has ? 'border: 1px solid var(--gold); box-shadow: 0 0 10px rgba(255,195,0,0.15)' : 'border: 1px solid var(--border-light)';
        
        return `<div class="card" style="padding: 15px; display: flex; flex-direction: column; justify-content: space-between; min-height: 160px; ${cardBorder}">
                    <div style="display:flex; gap:12px; align-items:flex-start">
                        <div style="font-size:32px; filter: drop-shadow(0 0 5px rgba(255,255,255,0.1))">${a.icon}</div>
                        <div style="flex:1">
                            <h3 style="margin:0; font-size:15px; color:${has ? 'var(--gold)' : 'white'}; font-family:'Rajdhani'; font-weight:700">${a.n}</h3>
                            <p style="font-size:12px; color:var(--text-muted); margin:4px 0">${a.desc}</p>
                        </div>
                    </div>
                    <div style="margin-top:12px">
                        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px">
                            <span style="color:${statusColor}">${statusText}</span>
                            <span style="color:var(--text-muted)">${progress}%</span>
                        </div>
                        <div class="xp-bar-bg" style="height:6px; margin:0">
                            <div class="xp-bar-fill" style="width:${progress}%; background:${has ? 'var(--gold)' : 'var(--blue)'}"></div>
                        </div>
                        <div style="font-size:10px; color:var(--green); text-align:right; margin-top:5px">Odměna: ${a.reward.toLocaleString()} Kč</div>
                    </div>
                </div>`;
    }).join('');
    document.getElementById('ach-count').innerText = c; document.getElementById('ach-total').innerText = ACH_DB.length;
}

// HR & DRIVERS
function renderHR() {
    const el = document.getElementById('hr-grid'); if(!el) return;
    el.innerHTML = state.drivers.map(d => `<div class="card" style="border-left:4px solid ${d.energy<30?'var(--red)':'var(--green)'}"><div class="card-body"><div style="display:flex;justify-content:space-between"><h3>${d.name}</h3><b style="color:var(--green)">Lvl ${d.level}</b></div><div style="font-size:11px;color:var(--text-muted);margin-bottom:10px"><i>"${d.bio}"</i> | Vlastnost: <b>${TRAITS.find(t=>t.id===d.trait).n}</b></div><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px"><span>Energie: ${Math.floor(d.energy)}%</span><span>Morálka: ${Math.floor(d.morale||100)}%</span></div><div class="xp-bar-bg"><div class="xp-bar-fill" style="width:${d.energy}%;background:var(--blue)"></div></div><div style="margin-top:10px;font-size:11px">Licence: ${d.lic.map(l=>'<span class="lic-badge">'+LICENSES.find(x=>x.id===l).n+'</span>').join('')}</div><div style="margin-top:10px;display:flex;gap:5px"><button class="btn btn-sm btn-dark" onclick="fireDriver(${d.id})">PROPUSTIT</button></div></div></div>`).join('');
}

function hireNewDriver() {
    let cost = 50000; if(state.tech.includes('recruit')) cost = 25000;
    if(state.money >= cost) {
        addMoney(-cost);
        let n = NAMES_F[Math.floor(Math.random()*NAMES_F.length)] + " " + NAMES_L[Math.floor(Math.random()*NAMES_L.length)];
        let b = BIOS[Math.floor(Math.random()*BIOS.length)];
        let t = TRAITS[Math.floor(Math.random()*TRAITS.length)].id;
        state.drivers.push({id: Date.now(), name: n, level: 1, xp: 0, req: 100, skills: {spd:0}, energy: 100, morale: 100, tacho: 0, restUntil: 0, lic: [], bio: b, trait: t, deliveries: 0});
        notify("HR", `Najat nový řidič: ${n}!`, "success"); renderHR(); saveGame();
    } else notify("FINANCE", "Nemáš peníze na nábor!", "warning");
}

function fireDriver(id) { 
    if(confirm("Opravdu chceš propustit tohoto řidiče?")) { 
        state.drivers = state.drivers.filter(d=>d.id!==id); 
        state.vehicles.forEach(v=>{if(v.driverId===id)v.driverId=null;}); 
        renderHR(); renderFleet(); saveGame(); 
    } 
}

function openTrainingCenter() {
    let h = `<h2 style="color:var(--teal)">🎓 TRÉNINKOVÉ CENTRUM</h2><p>Vyber řidiče a zaplať mu odborný kurz.</p><div style="display:flex;flex-direction:column;gap:10px;max-height:60vh;overflow-y:auto">`;
    state.drivers.forEach(d => {
        h += `<div style="background:rgba(0,0,0,0.4);padding:10px;border-radius:6px;border:1px solid var(--border-light)"><b>${d.name}</b> (Lvl ${d.level})<div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap">` + TRAINING_DB.map(t => `<button class="btn btn-sm btn-dark" onclick="trainDriver(${d.id}, '${t.id}', ${t.cost}, ${t.xp})">${t.icon} ${t.n} (${t.cost.toLocaleString()} Kč)</button>`).join('') + `</div><div style="margin-top:5px;display:flex;gap:5px;flex-wrap:wrap">` + LICENSES.map(l => `<button class="btn btn-sm ${d.lic.includes(l.id)?'btn-green':'btn-dark'}" ${d.lic.includes(l.id)||d.level<l.minLvl?'disabled':''} onclick="assignLicence(${d.id}, '${l.id}', ${l.cost})">${l.n} (L${l.minLvl} / ${l.cost/1000}k)</button>`).join('') + `</div></div>`;
    });
    h += `</div>`; document.getElementById('modal-content').innerHTML = h; document.getElementById('modal-overlay').style.display = 'flex';
}

function trainDriver(did, tid, cost, xp) {
    if(state.money >= cost) { 
        addMoney(-cost); 
        let d = state.drivers.find(x=>x.id===did); 
        if(d) { 
            d.xp += xp; state.stats.trainings++; 
            if(d.xp >= d.req) { 
                d.level++; d.xp=0; d.req*=1.5; d.skills.spd++; 
                notify("LEVEL UP", `${d.name} postoupil na Level ${d.level}!`, "gold"); 
            } else notify("TRÉNINK", "Školení úspěšně proběhlo.", "success"); 
            openTrainingCenter(); renderHR(); saveGame(); 
        } 
    } else notify("FINANCE", "Nemáš peníze!", "warning");
}

function assignLicence(did, lid, cost) {
    if(state.money >= cost) { 
        addMoney(-cost); 
        let d = state.drivers.find(x=>x.id===did); 
        if(d && !d.lic.includes(lid)) { 
            d.lic.push(lid); notify("LICENCE", "Rozšiřující licence získána!", "success"); 
            openTrainingCenter(); renderHR(); saveGame(); 
        } 
    } else notify("FINANCE", "Nemáš peníze na certifikát!", "warning");
}

function openMoraleCenter() {
    let h = `<h2 style="color:var(--cyan)">😊 CENTRUM POHODY</h2><p>Doplň morálku a motivaci celému svému týmu řidičů.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-dark" onclick="boostMorale(20000, 20)">Pivo a Gril (20k / +20%)</button><button class="btn btn-cyan" onclick="boostMorale(50000, 50)">Firemní večírek (50k / +50%)</button><button class="btn btn-gold" onclick="boostMorale(150000, 100)">Wellness Víkend (150k / MAX)</button></div>`;
    document.getElementById('modal-content').innerHTML = h; 
    document.getElementById('modal-overlay').style.display = 'flex';
}

function boostMorale(cost, amount) {
    if (state.money >= cost) {
        addMoney(-cost);
        state.drivers.forEach(d => {
            d.morale = Math.min(100, (d.morale || 100) + amount);
        });
        notify("CENTRUM POHODY", `Morálka řidičů byla zvýšena o ${amount}%.`, "success");
        closeModal();
        renderHR();
        saveGame();
    } else {
        notify("FINANCE", "Nemáš dost peněz na tuto akci!", "warning");
    }
}

// ==========================================
// MARKETING A PR AGENTURA
// ==========================================
function buyMarketing(type) {
    let cost = 0; let repBonus = 0;
    state.marketingCampaigns = state.marketingCampaigns || { paper: 0, radio: 0, tv: 0 };
    
    if (type === 'paper') { 
        cost = 15000; repBonus = 2; 
        state.marketingCampaigns.paper = 3; 
    }
    if (type === 'radio') { 
        cost = 45000; repBonus = 5; 
        state.marketingCampaigns.radio = 5; 
    }
    if (type === 'social') { cost = 100000; repBonus = 8; }
    if (type === 'tv') { 
        cost = 180000; repBonus = 15; 
        state.marketingCampaigns.tv = 7; 
    }
    if (type === 'esport') { cost = 500000; repBonus = 30; }
    if (type === 'viral') { cost = 1500000; repBonus = 60; }
    
    if (type === 'crisis') {
        if (state.money >= 250000) {
            addMoney(-250000);
            state.reputation = 100;
            notify("PR AGENTURA", "Krizový management úspěšně obnovil reputaci firmy na 100%.", "success");
            updateUI(); saveGame();
            return;
        } else return notify("FINANCE", "Na krizový management nemáš prostředky.", "warning");
    }

    if (state.money >= cost) {
        addMoney(-cost);
        state.reputation = Math.min(150, state.reputation + repBonus);
        
        if (type === 'paper') {
            notify("MARKETING", `Spuštěna kampaň v lokálním tisku! Reputace +${repBonus}% a na 3 dny je denní úpadek PR snížen o 0.5.`, "success");
        } else if (type === 'radio') {
            notify("MARKETING", `Spuštěna kampaň v rádiu! Reputace +${repBonus}% a na 5 dní je denní úpadek PR snížen o 1.0.`, "success");
        } else if (type === 'tv') {
            notify("MARKETING", `Spuštěna televizní kampaň! Reputace +${repBonus}% a na 7 dní je denní úpadek PR snížen o 2.0.`, "success");
        } else {
            notify("MARKETING", `Reklamní kampaň spuštěna! Reputace vzrostla o ${repBonus}%.`, "success");
        }
        
        updateUI(); saveGame();
    } else {
        notify("FINANCE", "Na tuto marketingovou kampaň nemáš dost peněz.", "warning");
    }
}

// ==========================================
// PALIVO A NÁDRŽ
// ==========================================
function buyFuelToTank(amt) {
    let maxCanBuy = (state.hq.fuel_depot * 20000) - state.fuelTank;
    if (amt > maxCanBuy) amt = maxCanBuy;
    if (amt <= 0) return notify("NÁDRŽ", "Tvoje firemní nádrž je plná! (Vylepši HQ pro větší kapacitu)", "warning");

    let pCost = state.fuelHedge ? state.fuelHedge : state.fuelPrice;
    if (state.tech.includes('bulk_buy')) pCost *= 0.9;
    if (state.fuelDiscount && state.fuelDiscount.active && state.day <= state.fuelDiscount.endDay) {
        pCost *= (1 - state.fuelDiscount.discount);
    }
    
    let cost = amt * pCost;
    if (state.money >= cost) {
        addMoney(-cost);
        state.fuelTank += amt;
        notify("PALIVO", `Nakoupeno ${amt.toLocaleString()} l nafty do firemní zásoby.`, "success");
        updateFuelUI(); saveGame();
    } else {
        notify("FINANCE", "Na nákup paliva do zásoby nemáš peníze.", "warning");
    }
}

function hedgeFuel() {
    if (state.fuelHedge) return notify("BURZA", "Už máš zafixovanou cenu nafty!", "info");
    if (state.money >= 50000) {
        addMoney(-50000);
        state.fuelHedge = state.fuelPrice;
        notify("ZAJIŠTĚNÍ", `Cena nafty byla zafixována na ${state.fuelHedge.toFixed(2)} Kč/l.`, "success");
        updateFuelUI(); saveGame();
    } else {
        notify("FINANCE", "Nemáš peníze na fixaci ceny nafty na burze.", "warning");
    }
}

function updateFuelUI() {
    if (!document.getElementById('fuel-tank-lvl')) return;
    let maxTank = state.hq.fuel_depot * 20000;
    document.getElementById('fuel-tank-lvl').innerText = Math.floor(state.fuelTank).toLocaleString();
    document.getElementById('fuel-tank-max').innerText = maxTank.toLocaleString();
    let pct = maxTank > 0 ? (state.fuelTank / maxTank) * 100 : 0;
    document.getElementById('fuel-tank-bar').style.width = `${pct}%`;

    let hb = document.getElementById('hedge-btn');
    if (hb) {
        if (state.fuelHedge) {
            hb.innerText = `CENA FIXOVÁNA (${state.fuelHedge.toFixed(2)} Kč/l)`;
            hb.classList.replace('btn-orange', 'btn-green');
            hb.onclick = null;
        } else {
            hb.innerText = "⚡ ZAJISTIT CENU (50k)";
            hb.classList.replace('btn-green', 'btn-orange');
            hb.onclick = hedgeFuel;
        }
    }
}

// ==========================================
// KONKURENCE A ODKUPY
// ==========================================
function renderCompetition() {
    const el = document.getElementById('competitor-list'); if (!el) return;
    
    // Render Jirstan separate dashboard
    renderJirstanDashboard();
    
    // Calculate total rep including competitors
    let totalRep = state.reputation;
    Object.keys(state.competitors).forEach(id => {
        let comp = state.competitors[id];
        if (!comp.boughtOut) {
            totalRep += comp.reputation;
        }
    });

    // Render regular competitors (excluding Jirstan)
    el.innerHTML = Object.keys(state.competitors).filter(id => id !== 'jirstan').map(id => {
        let c = state.competitors[id]; let db = COMPETITORS_DB.find(x => x.id === id);
        let share = Math.max(1, Math.floor((c.reputation / (totalRep + 1)) * 100));
        if (c.boughtOut) share = 0;
        return `<div class="competitor-card ${c.boughtOut ? 'comp-bought' : ''}" style="border-top:4px solid ${db.color}">
            <h3 style="color:${db.color}; margin-top:0">${db.n}</h3>
            <p style="font-size:12px; color:var(--text-muted)">${db.desc}</p>
            <div style="display:flex; justify-content:space-between; margin:10px 0; font-size:13px">
                <span>Tržní podíl: <b>${share}%</b></span>
                <span>Síla firmy: <b>${c.power}x</b></span>
            </div>
            ${c.boughtOut ? `<div style="color:var(--gold); font-weight:bold; margin-top:10px">✅ ODKOUPENO A INTEGROVÁNO</div>` : `
            <div style="display:flex; gap:10px; margin-top:15px">
                <button class="btn btn-sm btn-dark" onclick="sabotageCompetitor('${id}')">SABOTÁŽ (1M Kč)</button>
                <button class="btn btn-sm btn-gold" onclick="buyOutCompetitor('${id}', ${db.baseVal})">ODKOUPIT (${(db.baseVal * c.power).toLocaleString()})</button>
            </div>`}
        </div>`;
    }).join('');
}

function renderJirstanDashboard() {
    const el = document.getElementById('jirstan-corp-dashboard');
    if (!el) return;
    
    let jComp = state.competitors.jirstan;
    let jDb = COMPETITORS_DB.find(x => x.id === 'jirstan');
    
    let totalRep = state.reputation;
    Object.keys(state.competitors).forEach(id => {
        let c = state.competitors[id];
        if (!c.boughtOut) {
            totalRep += c.reputation;
        }
    });
    
    let share = jComp.boughtOut ? 0 : Math.max(1, Math.floor((jComp.reputation / (totalRep + 1)) * 100));
    let buyoutPrice = jDb.baseVal * jComp.power;
    
    let pressureInfo = '';
    if (state.jirstanPressure && state.jirstanPressure.eventType) {
        let label = '';
        let desc = '';
        if (state.jirstanPressure.eventType === 'dumping') {
            label = 'DUMPINGOVÉ CENY';
            desc = `Útočí na oblast <b>${state.jirstanPressure.targetCity}</b>. Snížení odměn o 40%!`;
        } else if (state.jirstanPressure.eventType === 'fuel_monopoly') {
            label = 'MONOPOL NA NAFTU';
            desc = 'Cena paliva zmrazena na 45 Kč/l!';
        } else if (state.jirstanPressure.eventType === 'pr_sabotage') {
            label = 'DISKREDITAČNÍ KAMPAŇ';
            desc = 'Útok na reputaci hráče, dvojnásobný úpadek PR!';
        }
        pressureInfo = `
            <div style="background:rgba(255,42,85,0.1); border:1px solid var(--red); padding:12px; border-radius:6px; margin-top:15px; animation:blink 2s infinite; display:flex; align-items:center; gap:12px;">
                <span style="font-size:24px;">🚨</span>
                <div style="text-align:left;">
                    <div style="color:var(--red); font-weight:bold; font-size:12px;">AKTIVNÍ EKONOMICKÝ TLAK: ${label}</div>
                    <div style="font-size:11px; color:#aaa;">${desc} (Zbývá dnů: ${state.jirstanPressure.daysLeft})</div>
                </div>
            </div>
        `;
    } else {
        pressureInfo = `
            <div style="background:rgba(0,255,102,0.05); border:1px dashed var(--green); padding:10px; border-radius:6px; margin-top:15px; text-align:center; font-size:11px; color:var(--green);">
                🟢 ŽÁDNÝ AKTIVNÍ TLAK (Aktuálně panuje klid na trhu)
            </div>
        `;
    }
    
    let jointVentureBtn = '';
    if (state.jirstanJointVenture) {
        jointVentureBtn = `
            <div style="background:rgba(0,242,96,0.1); border:1px solid var(--green); padding:10px; border-radius:6px; color:var(--green); font-size:12px; text-align:center; font-weight:bold; width:100%;">
                🤝 SPOLEČNÝ PODNIK AKTIVNÍ (+150,000 Kč/den, -50% šance na nátlak)
            </div>
        `;
    } else if (!jComp.boughtOut) {
        let canJV = state.reputation >= 60 && state.money >= 15000000;
        jointVentureBtn = `
            <button class="btn btn-sm btn-blue" onclick="establishJointVenture()" ${canJV ? '' : 'disabled'} style="width:100%;">
                🤝 SPOLEČNÝ PODNIK (Stojí: 15,000,000 Kč | Vyžaduje: 60% Rep)
            </button>
        `;
    }
    
    let actionArea = '';
    if (jComp.boughtOut) {
        actionArea = `
            <div style="color:var(--gold); font-size:20px; font-weight:800; text-align:center; padding:20px; border:2px dashed var(--gold); border-radius:8px; background:rgba(212,175,55,0.05); animation:glow 2s infinite;">
                🏆 MONOPOL DOSAŽEN: NEPŘÁTELSKÉ PŘEVZETÍ DOKONČENO!
                <div style="font-size:12px; font-weight:normal; color:#aaa; margin-top:5px;">JIRSTAN CORP byl plně integrován do vašeho logistického impéria.</div>
            </div>
        `;
    } else {
        let canBuy = state.money >= buyoutPrice;
        actionArea = `
            <div style="display:flex; flex-direction:column; gap:10px; align-items:center;">
                <div style="font-size:11px; color:var(--text-muted);">Cena nepřátelského převzetí (Hostile Takeover):</div>
                <div style="font-size:22px; color:var(--gold); font-weight:800; font-family:'Orbitron'; text-shadow:0 0 10px rgba(255,195,0,0.4);">${buyoutPrice.toLocaleString()} Kč</div>
                <button class="btn btn-gold" onclick="buyOutCompetitor('jirstan', ${jDb.baseVal})" ${canBuy ? '' : 'disabled'} style="padding:12px 30px; font-size:14px; font-weight:800; letter-spacing:1px; animation: glow 1.5s infinite;">
                    ☠️ NEPŘÁTELSKÉ PŘEVZETÍ (HOSTILE TAKEOVER)
                </button>
            </div>
        `;
    }
    
    el.innerHTML = `
        <div class="competitor-card" style="border:2px solid var(--pink); background:rgba(181, 23, 158, 0.05); box-shadow: 0 0 20px rgba(181, 23, 158, 0.15); padding:20px; border-radius:8px; position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px;">
                <div style="flex:1; min-width:300px; text-align:left;">
                    <span style="background:var(--pink); color:white; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; font-family:'Orbitron'; letter-spacing:1px;">AI PROTIVNÍK / MONOPOL</span>
                    <h2 style="color:var(--pink); margin:5px 0 10px 0; font-family:'Orbitron'; font-size:24px; text-shadow: 0 0 10px rgba(181, 23, 158, 0.4);">${jDb.n}</h2>
                    <p style="font-size:13px; color:#ccc; margin-bottom:15px; line-height:1.5;">${jDb.desc}</p>
                    
                    <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:5px; color:#eee;">
                        <span>Tržní podíl Jirstanu:</span>
                        <b>${share}%</b>
                    </div>
                    <div class="progress-track" style="height:14px; border-radius:7px; background:rgba(255,255,255,0.05); margin-bottom:15px; border:1px solid rgba(181, 23, 158, 0.2)">
                        <div style="width:${share}%; height:100%; border-radius:7px; background:linear-gradient(90deg, #7209b7, #b5179e); transition: width .35s ease;"></div>
                    </div>
                    
                    <div style="display:flex; gap:20px; font-size:13px;">
                        <div>Koeficient síly: <b style="color:var(--pink);">${jComp.power.toFixed(1)}x</b></div>
                        <div>Hodnota firmy: <b style="color:var(--gold);">${(jDb.baseVal * jComp.power).toLocaleString()} Kč</b></div>
                    </div>
                </div>
                
                <div style="flex:1; min-width:300px; display:flex; flex-direction:column; justify-content:space-between; height:100%; gap:15px;">
                    ${actionArea}
                    <div style="display:flex; gap:10px; margin-top:auto;">
                        ${jointVentureBtn}
                    </div>
                </div>
            </div>
            ${pressureInfo}
        </div>
    `;
}

function establishJointVenture() {
    if (state.money >= 15000000 && state.reputation >= 60) {
        addMoney(-15000000);
        state.jirstanJointVenture = true;
        notify("SPOLEČNÝ PODNIK", "Byla uzavřena aliance s Jirstan Corp! Získáváš pasivní příjem +150k Kč/den a sabotáže budou méně časté.", "success");
        pushToTicker("<b>SYSTÉM:</b> Uzavřen Společný Podnik (Joint Venture) s Jirstan Corp.", "success");
        saveGame();
        renderCompetition();
    } else {
        notify("CHYBA", "Nedostatečné prostředky nebo nízká reputace!", "danger");
    }
}

function sabotageCompetitor(id) {
    if (state.money >= 1000000) {
        addMoney(-1000000);
        if (Math.random() > 0.3) {
            state.competitors[id].reputation = Math.max(10, state.competitors[id].reputation - 30);
            state.competitors[id].power = Math.max(0.5, state.competitors[id].power - 0.2);
            notify("SABOTÁŽ", "Úspěch! Konkurence utrpěla masivní ztráty a jejich tržní hodnota klesla.", "success");
            pushToTicker(`<b>PR ODDĚLENÍ:</b> Konkurent ${COMPETITORS_DB.find(x=>x.id===id).n} utrpěl mediální skandál.`, "success");
        } else {
            state.reputation -= 20;
            notify("KATASTROFA", "Sabotáž byla odhalena! Ztrácíš obrovské množství reputace a klienti odchází.", "danger");
            pushToTicker(`<b>POLICIE:</b> Jirstan Logistics vyšetřován za nekalé praktiky!`, "danger");
        }
        renderCompetition(); saveGame();
    } else {
        notify("FINANCE", "Na takovou špinavou operaci nemáš prostředky.", "warning");
    }
}

function buyOutCompetitor(id, baseVal) {
    let cost = Math.floor(baseVal * state.competitors[id].power);
    if (state.money >= cost) {
        addMoney(-cost);
        state.competitors[id].boughtOut = true;
        state.machines.push({id: 'comp_'+id, n: 'Podíl z ' + COMPETITORS_DB.find(x=>x.id===id).n, c: cost, inc: Math.floor(cost * 0.005), img: ''});
        notify("ODKUP DOKONČEN", `Gratulujeme! Koupil jsi konkurenční firmu a integroval ji. Získáváš z ní trvalý pasivní příjem!`, "gold");
        pushToTicker(`<b>BURZA:</b> Jirstan Logistics provedl gigantickou akvizici a pohltil konkurenci.`, "gold");
        renderCompetition(); renderMachines(); checkAchievements(); saveGame();
    } else {
        notify("FINANCE", `Na odkup ti chybí peníze. Potřebuješ ${cost.toLocaleString()} Kč.`, "warning");
    }
}

// ==========================================
// TÝDENNÍ VÝZVY
// ==========================================
function renderChallenges() {
    const el = document.getElementById('challenge-list'); if (!el) return;
    el.innerHTML = CHALLENGE_DB.map(c => {
        let active = state.activeChallenges.includes(c.id);
        let progress = 0;
        if (c.type === 'deliveries') progress = state.stats.deliveries;
        if (c.type === 'earned') progress = state.stats.totalEarned;
        if (c.type === 'distance') progress = state.stats.distance;
        if (c.type === 'contracts') progress = state.stats.contractsDone;
        
        let pct = Math.min(100, (progress / c.target) * 100);
        
        return `<div class="card" style="border-left:4px solid var(--gold); ${active ? 'opacity:0.5' : ''}">
            <div class="card-body">
                <div style="display:flex; justify-content:space-between">
                    <h3 style="color:var(--gold); margin:0">${c.n}</h3>
                    ${active ? '<span style="color:var(--green); font-weight:bold">HOTOVO</span>' : ''}
                </div>
                <p style="font-size:12px; color:var(--text-muted); margin:10px 0">${c.desc}</p>
                <div class="xp-bar-bg" style="margin-bottom:10px">
                    <div class="xp-bar-fill" style="width:${pct}%; background:var(--gold)"></div>
                </div>
                <div style="font-size:11px; margin-bottom:10px">Pokrok: ${Math.floor(progress).toLocaleString()} / ${c.target.toLocaleString()}</div>
                ${!active && progress >= c.target ? `<button class="btn btn-gold" onclick="claimChallenge('${c.id}', ${c.reward}, ${c.repReward})">VYZVEDNOUT ODMĚNU (${c.reward.toLocaleString()} Kč)</button>` : ''}
            </div>
        </div>`;
    }).join('');
}
function claimChallenge(id, reward, repReward) {
    if (state.activeChallenges.includes(id)) return;
    state.activeChallenges.push(id);
    addMoney(reward);
    state.reputation += repReward;
    notify("VÝZVA SPLNĚNA", `Gratulujeme! Získáváš ${reward.toLocaleString()} Kč a +${repReward}% reputace!`, "gold");
    renderChallenges(); updateUI(); saveGame();
}

function showModal(html) {
    document.getElementById('modal-content').innerHTML = html;
    document.getElementById('modal-overlay').style.display = 'flex';
}

// ==========================================
// SYSTÉM (TABS, UTILS, SAVING)
// ==========================================
function switchTab(tabId, btn) {
    if (tabId === 'hq') {
        tabId = 'tower';
        btn = document.querySelector('.nav-btn[onclick*="tower"]');
    }
    if (tabId === 'factions') {
        tabId = 'competition';
        btn = document.querySelector('.nav-btn[onclick*="competition"]');
    }

    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    if (tabId === 'dispatch') { 
        setTimeout(fixMapSize, 50); 
        if (!megaHqVisualizer) {
            megaHqVisualizer = new MegaHqVisualizer();
        }
        renderHqFloorDetails();
        if (megaHqVisualizer) megaHqVisualizer.draw();
    }
    else if (tabId === 'auction') { renderAuction(); }
    else if (tabId === 'bazaar') { renderBazaar(); }
    else if (tabId === 'warehouse') { renderWarehouse(); }
    else if (tabId === 'stats') { renderStats(); }
    else if (tabId === 'hr') { renderHR(); }
    else if (tabId === 'gas') { renderGasNetwork(); }
    else if (tabId === 'competition') { renderCompetition(); renderChallenges(); renderFactions(); }
    else if (tabId === 'bank') { drawMarketChart(); drawFuelChart(); renderTermDeposits(); renderInsurance(); }
    else if (tabId === 'overseas') { renderOverseas(); }
    else if (tabId === 'achievements') { renderAchievements(); }
    else if (tabId === 'multiplayer') { renderMultiplayer(); }
    else if (tabId === 'tech') { renderTech(); }
    else if (tabId === 'tower') { renderTower(); }
    
    document.querySelector('.content').scrollTo(0,0);
}

function old_switchTab(tabId, btn) {} /*
    document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        
        if (tabId === 'dispatch') { setTimeout(fixMapSize, 50); } else if (tabId === 'auction') { renderAuction(); } else if (tabId === 'bazaar') { renderBazaar(); } else if (tabId === 'warehouse') { renderWarehouse(); }        if (tabId === 'stats') renderStats();
        if (tabId === 'hr') renderHR();
        if (tabId === 'hq') renderHQ();
        if (tabId === 'gas') renderGasNetwork();
        if (tabId === 'competition') { renderCompetition(); renderChallenges(); }    if (tabId === 'bank') { drawMarketChart(); drawFuelChart(); renderTermDeposits(); renderInsurance(); }
    if (tabId === 'overseas') renderOverseas();
    if (tabId === 'achievements') renderAchievements();
    if (tabId === 'multiplayer') renderMultiplayer();
    
    document.querySelector('.content').scrollTo(0,0);
*/

function addMoney(amt) { 
    state.money += amt; 
    if (amt < 0) state.stats.totalSpent += Math.abs(amt); 
    updateUI(); 
}

function pad(num) { 
    return num.toString().padStart(2, '0'); 
}

function openSaveManager() {
    let slotsHtml = '';
    for(let i=1; i<=3; i++) {
        let sData = localStorage.getItem(`jirstan_beta_v1_slot${i}`);
        let info = "Prázdný slot";
        if (sData) {
            try {
                let d = JSON.parse(sData);
                info = `Den ${d.day} | ${Math.floor(d.money).toLocaleString()} Kč | Auta: ${d.vehicles?.length || 0}`;
            } catch(e) {}
        }
        slotsHtml += `<div style="background:rgba(0,0,0,0.5); padding:15px; border:1px solid var(--border-light); border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center">
            <div><h3 style="margin:0; color:var(--orange)">💾 SLOT ${i}</h3><div style="font-size:12px; color:var(--text-muted); margin-top:5px">${info}</div></div>
            <div style="display:flex; gap:10px">
                <button class="btn btn-sm btn-green" onclick="saveToSlot(${i})">ULOŽIT ZDE</button>
                ${sData ? `<button class="btn btn-sm btn-blue" onclick="loadFromSlot(${i})">NAČÍST</button> <button class="btn btn-sm btn-red" onclick="deleteSlot(${i})">SMAZAT</button>` : ''}
            </div>
        </div>`;
    }
    let h = `<h2 style="color:var(--orange)">SPRÁVCE ULOŽENÍ</h2><p>Hra se ukládá automaticky do aktuálního slotu. Zde můžeš spravovat více pozic.</p>${slotsHtml}<button class="btn btn-dark" style="margin-top:20px" onclick="closeModal()">ZAVŘÍT</button>`;
    document.getElementById('modal-content').innerHTML = h;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function saveToSlot(slot) { state.currentSaveSlot = slot; saveGame(); notify("ULOŽENO", `Hra byla manuálně uložena do slotu ${slot}.`, "success"); openSaveManager(); }
function loadFromSlot(slot) { state.currentSaveSlot = slot; loadGame(); notify("NAČTENO", `Hra načtena ze slotu ${slot}.`, "success"); closeModal(); renderAll(); }
function deleteSlot(slot) { if(confirm(`Smazat slot ${slot}?`)) { localStorage.removeItem(`jirstan_beta_v1_slot${slot}`); openSaveManager(); notify("SMAZÁNO", `Slot ${slot} byl smazán.`, "info"); } }

function resetGame() {
    if(confirm('OPRAVDU RESETOVAT CELOU HRU? Přijdeš o všechen postup!')) {
        localStorage.removeItem(`jirstan_beta_v1_slot${state.currentSaveSlot}`);
        localStorage.removeItem('jirstan_save');
        state = JSON.parse(JSON.stringify(defaultState));
        saveGame();
        window.location.reload();
    }
}

function manualRefresh() { 
    renderAll(); 
    notify("SYSTÉM", "UI bylo manuálně obnoveno.", "info"); 
}

function skipTime(hours) {
    notify("SYSTÉM", `Simulace zrychlena o ${hours} hodin.`, "info");
    for(let i=0; i<hours*60; i++) tick();
}

function closeModal() { 
    document.getElementById('modal-overlay').style.display = 'none'; 
}

function notify(title, msg, type = 'info') {
    const box = document.getElementById('toast-box');
    if(!box) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    const bColor = type === 'success' ? 'var(--green)' : (type === 'warning' ? 'var(--gold)' : (type === 'danger' ? 'var(--red)' : (type === 'pink' ? 'var(--pink)' : 'var(--blue)')));
    toast.style.borderLeftColor = bColor;
    toast.innerHTML = `<div style="flex:1"><b style="color:${bColor}; font-size:11px; letter-spacing:1px; text-transform:uppercase">${title}</b><div style="margin-top:4px">${msg}</div></div>`;
    box.appendChild(toast);
    setTimeout(() => { 
        if (toast.parentElement) { 
            toast.style.animation = 'slideInRight 0.4s reverse forwards'; 
            setTimeout(() => toast.remove(), 400); 
        }
    }, 4000);
}

// ==========================================
// INICIALIZACE HRY
// ==========================================
let leaderboardData = [
    { rank: 1, ceo: "Stanislav Starosta", name: "Starosta Global Express", day: 140, deliveries: 1250, money: 850000000 },
    { rank: 2, ceo: "Jiří Čečák", name: "Čečák Trans s.r.o.", day: 120, deliveries: 980, money: 540000000 },
    { rank: 3, ceo: "Karel N.", name: "Karlos Heavy Cargo", day: 95, deliveries: 640, money: 120000000 },
    { rank: 4, ceo: "Fastex Logistika", name: "Fastex Logistika", day: 80, deliveries: 510, money: 85000000 },
    { rank: 5, ceo: "Greenroad Cargo", name: "Greenroad EKO Cargo", day: 75, deliveries: 430, money: 45000000 }
];

function renderMultiplayer() {
    const tbody = document.getElementById('multiplayer-leaderboard-body');
    if (!tbody) return;
    
    // Sort and rank leaderboard
    leaderboardData.sort((a, b) => b.money - a.money);
    
    // Append player's current firm dynamically
    let playerCeo = state.drivers.find(d => d.id === 1)?.name || 'CEO';
    let playerMoney = state.money;
    let playerDeliveries = state.stats.deliveries || 0;
    let playerDay = state.day;
    
    let entries = leaderboardData.map(e => ({ ...e }));
    
    // Find if player already exists in leaderboardData (by CEO name)
    let exists = entries.find(e => e.ceo === playerCeo);
    if (exists) {
        exists.money = Math.max(exists.money, playerMoney);
        exists.deliveries = Math.max(exists.deliveries, playerDeliveries);
        exists.day = Math.max(exists.day, playerDay);
    } else {
        entries.push({ rank: 0, ceo: playerCeo, name: "Tvoje Jirstan Firma", day: playerDay, deliveries: playerDeliveries, money: playerMoney });
    }
    
    // Recalculate ranks
    entries.sort((a, b) => b.money - a.money);
    entries.forEach((e, idx) => e.rank = idx + 1);
    
    tbody.innerHTML = entries.map(e => {
        const isPlayer = e.ceo === playerCeo;
        const rowStyle = isPlayer ? 'background: rgba(0, 242, 96, 0.1); font-weight: bold; border-left: 3px solid var(--green);' : '';
        return `<tr style="${rowStyle}">
                    <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.03); color:${e.rank === 1 ? 'var(--gold)' : 'white'}">#${e.rank}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.03);">
                        <div style="font-size:13px">${e.name}</div>
                        <div style="font-size:10px; color:var(--text-muted)">CEO: ${e.ceo} (Den ${e.day})</div>
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.03);">${e.deliveries}</td>
                    <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.03); color:var(--green)">${e.money.toLocaleString()} Kč</td>
                </tr>`;
    }).join('');
}

function exportCompanyProfile() {
    const profile = {
        ceo: state.drivers.find(d => d.id === 1)?.name || 'CEO',
        money: state.money,
        day: state.day,
        reputation: state.reputation,
        achCount: state.achievements.length,
        vehiclesCount: state.vehicles.length
    };
    const jsonStr = JSON.stringify(profile);
    const base64Code = btoa(unescape(encodeURIComponent(jsonStr)));
    const area = document.getElementById('multiplayer-code-area');
    if (area) {
        area.value = base64Code;
        area.select();
        notify("MULTIPLAYER", "Unikátní kód firmy byl vykopírován do schránky!", "success");
        navigator.clipboard.writeText(base64Code).catch(err => console.error("Nelze kopírovat:", err));
    }
}

function importCompanyProfile() {
    const input = document.getElementById('import-company-code');
    if (!input || !input.value.trim()) return notify("CHYBA", "Zadej platný kód firmy!", "warning");
    try {
        const base64Code = input.value.trim();
        const jsonStr = decodeURIComponent(escape(atob(base64Code)));
        const profile = JSON.parse(jsonStr);
        if (!profile.ceo || profile.money === undefined || profile.day === undefined) {
            throw new Error("Invalid format");
        }
        notify("POROVNÁNÍ", `Načten profil firmy hráče ${profile.ceo}. Kapitál: ${profile.money.toLocaleString()} Kč, Den ${profile.day}, Úspěchy: ${profile.achCount}.`, "info");
        addSimulatedLeaderboardEntry(profile);
    } catch (e) {
        notify("CHYBA", "Neplatný kód firmy nebo poškozená data!", "danger");
    }
}

function addSimulatedLeaderboardEntry(profile) {
    let exists = leaderboardData.find(e => e.ceo === profile.ceo);
    if (exists) {
        exists.money = profile.money;
        exists.day = profile.day;
        exists.deliveries = profile.achCount * 25 + profile.vehiclesCount * 12;
    } else {
        leaderboardData.push({
            rank: 0,
            ceo: profile.ceo,
            name: `${profile.ceo} Logistics`,
            day: profile.day,
            deliveries: profile.achCount * 25 + profile.vehiclesCount * 12,
            money: profile.money
        });
    }
    renderMultiplayer();
}

function compareCompanyStats() {
    let playerMoney = state.money;
    let playerDeliveries = state.stats.deliveries || 0;
    
    let topCompetitor = leaderboardData[0];
    if (topCompetitor.ceo === (state.drivers.find(d => d.id === 1)?.name)) {
        topCompetitor = leaderboardData[1];
    }
    
    let moneyDiff = playerMoney - topCompetitor.money;
    let deliveryDiff = playerDeliveries - topCompetitor.deliveries;
    
    let comparisonText = `Srovnání s lídrem žebříčku (${topCompetitor.name}):\n\n`;
    comparisonText += `Kapitál: ${playerMoney.toLocaleString()} Kč vs ${topCompetitor.money.toLocaleString()} Kč `;
    comparisonText += `(${moneyDiff >= 0 ? '+' : ''}${moneyDiff.toLocaleString()} Kč)\n`;
    
    comparisonText += `Doručeno zakázek: ${playerDeliveries} vs ${topCompetitor.deliveries} `;
    comparisonText += `(${deliveryDiff >= 0 ? '+' : ''}${deliveryDiff})\n\n`;
    
    if (moneyDiff > 0 && deliveryDiff > 0) {
        comparisonText += "🏆 Jsi absolutní jednička na trhu! Gratulujeme!";
    } else {
        comparisonText += "💪 Ještě ti kousek chybí k dosažení vrcholu. Pokračuj v expanzi!";
    }
    
    alert(comparisonText);
}

function refreshLeaderboard() {
    notify("MULTIPLAYER", "Připojování k API serveru JIRSTAN...", "info");
    setTimeout(() => {
        notify("MULTIPLAYER", "Leaderboard úspěšně aktualizován!", "success");
        renderMultiplayer();
    }, 800);
}

window.onload = init;
