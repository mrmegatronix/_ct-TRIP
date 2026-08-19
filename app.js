// Venue Location
const venueCoords = [-43.47813787786105, 172.61740700674628];

// Map Initialization - Dashboard Mode (No interactions)
const map = L.map('map', {
    center: venueCoords,
    zoom: 17,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false
});

// Add Dark Theme Map Tiles (CartoDB Dark Matter without labels)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Add brightened labels as a separate layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd',
    maxZoom: 20,
    className: 'bright-labels'
}).addTo(map);

// Venue Marker using Coasters Logo
const venueIcon = L.icon({
    iconUrl: 'logo.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'venue-logo'
});

L.marker(venueCoords, { icon: venueIcon, zIndexOffset: 1000 })
    .bindTooltip("Coasters Tavern", { permanent: true, direction: "right", className: "venue-tooltip" })
    .addTo(map);

const libraryCoords = [-43.4774150, 172.6164750];
const libraryIcon = L.divIcon({
    className: 'venue-icon',
    html: '📚',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});
L.marker(libraryCoords, { icon: libraryIcon })
    .bindTooltip("Redwood Library", { permanent: true, direction: "top", className: "venue-tooltip" })
    .addTo(map);

// Bus Stop Definitions
const stops = {
    north: { name: 'North (Main North Rd)', coords: [-43.477230, 172.616740], id: '13347' }, // West side
    south: { name: 'South (Main North Rd)', coords: [-43.477250, 172.617030], id: '15319' }, // East side
    east:  { name: 'East (Daniels Rd)', coords: [-43.478260, 172.617800], id: '29195' }, // North side
    west:  { name: 'West (Daniels Rd)', coords: [-43.478370, 172.617420], id: '29900' }  // South side
};

const stopIcon = L.divIcon({
    className: 'stop-icon',
    html: '🚌',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const popups = {};
const stopMarkers = {};
const walkingPaths = {};
const allStopCoords = [venueCoords]; // Keep track of coordinates to fit map

// Add Bus Stops, Popups, and Walking Lines
for (const [key, stop] of Object.entries(stops)) {
    const marker = L.marker(stop.coords, { icon: stopIcon }).addTo(map);
    stopMarkers[key] = marker;
    allStopCoords.push(stop.coords);
    
    // Calculate Walking Distance and ETA
    const stopLatLng = L.latLng(stop.coords);
    const venueLatLng = L.latLng(venueCoords);
    const dist = Math.round(venueLatLng.distanceTo(stopLatLng));
    const walkingTime = Math.ceil(dist / 84); // ~1.4 m/s average walking speed
    
    // Store HTML for the sidebar with walking time included
    popups[key] = `<div class="eta-card" id="card-${key}">
        <h3>${stop.name}</h3>
        <p style="color: #ff4d4d; font-size: 1.2rem; font-weight: bold; text-align: center; margin: 5px 0 15px 0; letter-spacing: 1px;">Walk: ${dist}m (${walkingTime} min)</p>
        <div style="text-align:center; padding:10px;">Loading ETAs...</div>
    </div>`;
    
    // Draw Red Walking Line (no tooltip to prevent clipping)
    const walkLine = L.polyline([venueCoords, stop.coords], {
        color: '#ff4d4d',
        weight: 3,
        dashArray: '5, 10',
        opacity: 0, // Hidden initially
        className: 'walking-path'
    }).addTo(map);
    
    walkingPaths[key] = walkLine;
}

// Automatically zoom and crop the map to fit exactly all 4 stops and the tavern
map.fitBounds(L.latLngBounds(allStopCoords), { padding: [30, 30] });

// ============================================================
// REAL OSM ROAD GEOMETRY — No offsets, actual carriageway coords
// Main North Road is a divided highway with separate one-way roads.
// Source: OpenStreetMap Overpass API (ways 337126427, 805581241,
// 114648691, 337126432, 337126430, 114648692, 337126429)
// ============================================================

// SOUTHBOUND carriageway (East side, heading toward City Centre)
// Drawn North-to-South so arrows point south
const mainNorthRoute_Southbound = [
    [-43.4739075, 172.6172178],
    [-43.4742337, 172.6171929],
    [-43.4753392, 172.6171087],
    [-43.4764564, 172.6170198],
    [-43.4774101, 172.6169421],
    [-43.4774706, 172.6169372],
    [-43.4777678, 172.6169130],
    [-43.4781738, 172.6168799],
    [-43.4782024, 172.6168776],
    [-43.4782869, 172.6168707],
    [-43.4783829, 172.6168628],
    [-43.4791171, 172.6168043],
    [-43.4796639, 172.6167608],
    [-43.4798515, 172.6167479],
    [-43.4812098, 172.6166362],
    [-43.4815305, 172.6166134],
    [-43.4819221, 172.6165798],
    [-43.4826265, 172.6165208],
    [-43.4835056, 172.6164571]
];

// NORTHBOUND carriageway (West side, heading toward Belfast)
// Drawn South-to-North so arrows point north
const mainNorthRoute_Northbound = [
    [-43.4809881, 172.6165197],
    [-43.4798471, 172.6166076],
    [-43.4792518, 172.6166571],
    [-43.4786799, 172.6167027],
    [-43.4784261, 172.6167214],
    [-43.4783772, 172.6167250],
    [-43.4782811, 172.6167334],
    [-43.4778047, 172.6167723],
    [-43.4775827, 172.6167872],
    [-43.4775247, 172.6167911],
    [-43.4774283, 172.6167990],
    [-43.4772048, 172.6168172],
    [-43.4768553, 172.6168484],
    [-43.4762007, 172.6168999],
    [-43.4753338, 172.6169680]
];

// Route 125 / Daniels Road (unchanged — user confirmed these are correct)
function offsetRoute(routePoints, latOffset, lngOffset) {
    return routePoints.map(point => [point[0] + latOffset, point[1] + lngOffset]);
}

const route125Path = [
    [-43.4835056, 172.6164571], [-43.4798471, 172.6166076], [-43.4792518, 172.6166571],
    [-43.478383, 172.617163], [-43.478287, 172.617171], [-43.478202, 172.617178],
    [-43.478199, 172.617178], [-43.478292, 172.617284], [-43.478292, 172.6173],
    [-43.478308, 172.617693], [-43.478316, 172.617885], [-43.478349, 172.618625],
    [-43.478352, 172.618694], [-43.478369, 172.619086], [-43.4785, 172.6243]
];
const route125PathRev = [...route125Path].reverse();

const route125Path_Eastbound = offsetRoute(route125Path, 0.00006, -0.00006);
const route125Path_Westbound = offsetRoute(route125PathRev, -0.00006, 0.00006);

const mainLine = L.polyline(mainNorthRoute_Southbound, { color: '#3498db', weight: 6, opacity: 0 }).addTo(map); 
const mainLineRev = L.polyline(mainNorthRoute_Northbound, { color: '#3498db', weight: 6, opacity: 0 }).addTo(map);

// Use dashArray so Route 95 naturally blends with Route 1 on the exact same road
const route95Line = L.polyline(mainNorthRoute_Southbound, { color: '#9b59b6', weight: 6, opacity: 0, dashArray: '15, 15' }).addTo(map);
const route95LineRev = L.polyline(mainNorthRoute_Northbound, { color: '#9b59b6', weight: 6, opacity: 0, dashArray: '15, 15' }).addTo(map);

const danielsLine = L.polyline(route125Path_Eastbound, { color: '#2ecc71', weight: 6, opacity: 0 }).addTo(map);
const danielsLineRev = L.polyline(route125Path_Westbound, { color: '#2ecc71', weight: 6, opacity: 0 }).addTo(map);



// Decorators setup
function createDeco(line, color, offset) {
    return {
        deco: L.polylineDecorator(line, { patterns: [] }),
        color: color,
        offset: offset
    };
}

const decoMain = createDeco(mainLine, '#3498db', 0);
const decoMainRev = createDeco(mainLineRev, '#3498db', 50);
const deco95 = createDeco(route95Line, '#9b59b6', 25);
const deco95Rev = createDeco(route95LineRev, '#9b59b6', 75);
const decoDaniels = createDeco(danielsLine, '#2ecc71', 10);
const decoDanielsRev = createDeco(danielsLineRev, '#2ecc71', 60);

const groupNorth = [mainLine, mainLineRev, route95Line, route95LineRev];
const decosNorth = [decoMain, decoMainRev, deco95, deco95Rev];

const groupDaniels = [danielsLine, danielsLineRev];
const decosDaniels = [decoDaniels, decoDanielsRev];

let activeDecorators = [];
let arrowOffset = 0;

setInterval(() => {
    arrowOffset = (arrowOffset + 2) % 100;
    activeDecorators.forEach(d => {
        if (map.hasLayer(d.deco)) {
            d.deco.setPatterns([{ 
                offset: ((arrowOffset + d.offset) % 100) + 'px', 
                repeat: '100px', 
                symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0, color: d.color}}) 
            }]);
        }
    });
}, 50); // 20 frames per second smooth animation

// Carousel Logic (Rotate active panel every 15 seconds)
const stopKeys = Object.keys(stops);
let currentStopIndex = 0;

function cyclePanels() {
    const activeKey = stopKeys[currentStopIndex];
    
    // Hide all walking lines
    for (const key of stopKeys) {
        walkingPaths[key].setStyle({ opacity: 0 });
    }
    
    // Hide all routes completely when inactive
    [mainLine, mainLineRev, route95Line, route95LineRev, danielsLine, danielsLineRev].forEach(line => {
        line.setStyle({ opacity: 0 });
    });
    activeDecorators.forEach(d => map.removeLayer(d.deco));
    
    // Update Fixed Arrivals Board
    const board = document.getElementById('arrivals-board');
    board.style.display = 'block';
    board.innerHTML = popups[activeKey];
    walkingPaths[activeKey].setStyle({ opacity: 0.9 });
    
    // Show only active routes at 100% opacity and add their decorators
    if (activeKey === 'north') {
        // Bus heading North, so use the Reversed lines (which are drawn South-to-North)
        mainLineRev.setStyle({ opacity: 1 });
        route95LineRev.setStyle({ opacity: 1 });
        activeDecorators = [decoMainRev, deco95Rev];
    } else if (activeKey === 'south') {
        // Bus heading South, use the original lines (drawn North-to-South)
        mainLine.setStyle({ opacity: 1 });
        route95Line.setStyle({ opacity: 1 });
        activeDecorators = [decoMain, deco95];
    } else if (activeKey === 'east') {
        danielsLine.setStyle({ opacity: 1 });
        activeDecorators = [decoDaniels];
    } else if (activeKey === 'west') {
        danielsLineRev.setStyle({ opacity: 1 });
        activeDecorators = [decoDanielsRev];
    }
    
    activeDecorators.forEach(d => map.addLayer(d.deco));
    
    currentStopIndex = (currentStopIndex + 1) % stopKeys.length;
}

// Static Mock Data for GitHub Pages
const mockArrivals = {
    north: [
        { route: '1', destination: 'Rangiora', time: 'Due' },
        { route: '95', destination: 'Pegasus', time: '5 min' },
        { route: '1', destination: 'Rangiora', time: '15 min' }
    ],
    south: [
        { route: '1', destination: 'Cashmere', time: '2 min' },
        { route: '95', destination: 'City', time: '10 min' }
    ],
    east: [
        { route: '125', destination: 'Redwood', time: '7 min' }
    ],
    west: [
        { route: '125', destination: 'Westlake', time: '12 min' }
    ]
};

// Anchor map permanently to Coasters Tavern
map.setView(venueCoords, 16);

// Data Fetching Logic (Static)
function fetchETAs() {
    try {
        const data = mockArrivals;
        
        for (const [key, stop] of Object.entries(stops)) {
            const stopData = data[key];
            let html = `<h3>${stop.name}</h3>`;
            
            if (stopData && stopData.length > 0) {
                stopData.forEach(eta => {
                    const routeClass = `route-${eta.route}`;
                    html += `
                    <div class="eta-row">
                        <span class="eta-route ${routeClass}">${eta.route}</span>
                        <span class="eta-dest">${eta.destination}</span>
                        <span class="eta-time">${eta.time}</span>
                    </div>`;
                });
            } else {
                html += `<div style="text-align:center; padding:10px; font-style:italic;">No upcoming buses found</div>`;
            }
            
            popups[key] = `<div class="eta-card" id="card-${key}">${html}</div>`;
        }
    } catch (err) {
        console.error('Error rendering arrivals:', err);
    }
}

// Render data immediately
setTimeout(fetchETAs, 1000);

// Start Carousel
setInterval(cyclePanels, 15000);
setTimeout(cyclePanels, 1500); // Trigger first cycle slightly after data load

// Clock Logic
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours.toString().padStart(2, '0');
    
    // Blinking colon based on seconds
    const showColon = now.getSeconds() % 2 === 0;
    const colon = showColon ? ':' : '<span style="visibility: hidden;">:</span>';
    
    const timeString = `${hours}${colon}${minutes} <span style="font-size: 0.6em">${ampm}</span>`;
    document.getElementById('clock').innerHTML = timeString;
}
setInterval(updateClock, 1000);
updateClock(); // run once immediately
