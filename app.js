// Venue Location
const venueCoords = [-43.47813787786105, 172.61740700674628];

// Map Initialization
const map = L.map('map', {
    center: venueCoords,
    zoom: 17,
    zoomControl: false // Disable zoom control for cleaner dashboard look
});

// Add Dark Theme Map Tiles (CartoDB Dark Matter)
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Venue Marker using Coasters Logo
const venueIcon = L.icon({
    iconUrl: 'logo.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'venue-logo'
});

L.marker(venueCoords, { icon: venueIcon, zIndexOffset: 1000 }).addTo(map)
    .bindPopup('<b>Coasters Tavern</b><br>1 Daniels Road');

// Bus Stop Definitions
const stops = {
    north: { name: 'North (Main North Rd)', coords: [-43.4746, 172.6171], id: '13347' }, // West side
    south: { name: 'South (Main North Rd)', coords: [-43.4743, 172.6174], id: '15319' }, // East side
    east:  { name: 'East (Daniels Rd)', coords: [-43.4781, 172.6183], id: '29195' }, // North side
    west:  { name: 'West (Daniels Rd)', coords: [-43.4782, 172.6177], id: '29900' }  // South side
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

// Add Bus Stops, Popups, and Walking Lines
for (const [key, stop] of Object.entries(stops)) {
    const marker = L.marker(stop.coords, { icon: stopIcon }).addTo(map);
    stopMarkers[key] = marker;
    
    // Create an empty popup with specific styling
    const popup = L.popup({
        autoClose: false,
        closeOnClick: false,
        className: 'custom-popup'
    })
    .setLatLng(stop.coords)
    .setContent(`<div class="eta-card" id="card-${key}"><h3>${stop.name}</h3><div style="text-align:center; padding:10px;">Loading ETAs...</div></div>`);
    
    marker.bindPopup(popup);
    popups[key] = popup;
    
    // Calculate Walking Distance and ETA
    const stopLatLng = L.latLng(stop.coords);
    const venueLatLng = L.latLng(venueCoords);
    const dist = Math.round(venueLatLng.distanceTo(stopLatLng));
    const walkingTime = Math.ceil(dist / 84); // ~1.4 m/s average walking speed
    
    // Draw Red Walking Line
    const walkLine = L.polyline([venueCoords, stop.coords], {
        color: '#ff4d4d',
        weight: 3,
        dashArray: '5, 10',
        opacity: 0 // Hidden initially
    }).addTo(map);
    
    walkLine.bindTooltip(`Walk: ${dist}m (${walkingTime} min)`, {
        permanent: true,
        className: 'walking-tooltip',
        direction: 'center'
    });
    
    walkingPaths[key] = walkLine;
}

// Draw Bus Routes with Directional Arrows
const mainNorthRoute = [
    [-43.4680, 172.6176], [-43.4755, 172.617096], [-43.476456, 172.61702],
    [-43.47741, 172.616942], [-43.477471, 172.616937], [-43.477768, 172.616913],
    [-43.478174, 172.61688], [-43.478202, 172.616878], [-43.478287, 172.616871],
    [-43.478383, 172.616863], [-43.479117, 172.616804], [-43.479664, 172.616761],
    [-43.4844, 172.6164]
];

const route125Path = [
    [-43.4844, 172.6164], [-43.479664, 172.616761], [-43.479117, 172.616804], 
    [-43.478383, 172.616863], [-43.478287, 172.616871], [-43.478202, 172.616878],
    [-43.478199, 172.616878], [-43.478292, 172.616984], [-43.478292, 172.617],
    [-43.478308, 172.617393], [-43.478316, 172.617585], [-43.478349, 172.618325],
    [-43.478352, 172.618394], [-43.478369, 172.618786], [-43.4785, 172.6240]
];

// Draw main routes
const mainNorthRouteReverse = [...mainNorthRoute].reverse();
const mainLine = L.polyline(mainNorthRoute, { color: '#3498db', weight: 5, opacity: 0.2 }).addTo(map); // Blue for Route 1
const mainLineRev = L.polyline(mainNorthRouteReverse, { opacity: 0 }).addTo(map);

const route95Path = mainNorthRoute.map(coord => [coord[0], coord[1] - 0.00005]);
const route95PathReverse = [...route95Path].reverse();
const route95Line = L.polyline(route95Path, { color: '#9b59b6', weight: 5, opacity: 0.2 }).addTo(map); // Purple for Route 95
const route95LineRev = L.polyline(route95PathReverse, { opacity: 0 }).addTo(map);

const route125PathReverse = [...route125Path].reverse();
const danielsLine = L.polyline(route125Path, { color: '#2ecc71', weight: 5, opacity: 0.2 }).addTo(map); // Green for Route 125
const danielsLineRev = L.polyline(route125PathReverse, { opacity: 0 }).addTo(map);

// Add animated arrows to the routes in BOTH directions
L.polylineDecorator(mainLine, { patterns: [{ offset: 0, repeat: 100, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0, color: '#3498db'}}) }] }).addTo(map);
L.polylineDecorator(mainLineRev, { patterns: [{ offset: 50, repeat: 100, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0, color: '#3498db'}}) }] }).addTo(map);

L.polylineDecorator(route95Line, { patterns: [{ offset: 25, repeat: 100, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0, color: '#9b59b6'}}) }] }).addTo(map);
L.polylineDecorator(route95LineRev, { patterns: [{ offset: 75, repeat: 100, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0, color: '#9b59b6'}}) }] }).addTo(map);

L.polylineDecorator(danielsLine, { patterns: [{ offset: 10, repeat: 100, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0, color: '#2ecc71'}}) }] }).addTo(map);
L.polylineDecorator(danielsLineRev, { patterns: [{ offset: 60, repeat: 100, symbol: L.Symbol.arrowHead({pixelSize: 15, pathOptions: {fillOpacity: 1, weight: 0, color: '#2ecc71'}}) }] }).addTo(map);

// Carousel Logic (Rotate active panel every 15 seconds)
const stopKeys = Object.keys(stops);
let currentStopIndex = 0;

function cyclePanels() {
    const activeKey = stopKeys[currentStopIndex];
    
    // Hide all popups and walking lines, dim routes
    for (const key of stopKeys) {
        map.closePopup(popups[key]);
        walkingPaths[key].setStyle({ opacity: 0 });
        walkingPaths[key].closeTooltip();
    }
    
    mainLine.setStyle({ opacity: 0.2, weight: 4 });
    mainLineRev.setStyle({ opacity: 0.2, weight: 4 });
    route95Line.setStyle({ opacity: 0.2, weight: 4 });
    route95LineRev.setStyle({ opacity: 0.2, weight: 4 });
    danielsLine.setStyle({ opacity: 0.2, weight: 4 });
    danielsLineRev.setStyle({ opacity: 0.2, weight: 4 });
    
    // Highlight Active Stop
    stopMarkers[activeKey].openPopup();
    walkingPaths[activeKey].setStyle({ opacity: 0.9 });
    walkingPaths[activeKey].openTooltip();
    
    // Highlight Active Route(s)
    if (activeKey === 'north' || activeKey === 'south') {
        mainLine.setStyle({ opacity: 1, weight: 6 });
        mainLineRev.setStyle({ opacity: 1, weight: 6 });
        route95Line.setStyle({ opacity: 1, weight: 6 });
        route95LineRev.setStyle({ opacity: 1, weight: 6 });
    } else {
        danielsLine.setStyle({ opacity: 1, weight: 6 });
        danielsLineRev.setStyle({ opacity: 1, weight: 6 });
    }
    
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
            
            const cardEl = document.getElementById(`card-${key}`);
            if (cardEl) {
                cardEl.innerHTML = html;
            }
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
