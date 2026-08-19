// Venue Location
const venueCoords = [-43.47813787786105, 172.61740700674628];

// Map Initialization
const map = L.map('map', {
    center: venueCoords,
    zoom: 17,
    zoomControl: false // Disable zoom control for cleaner dashboard look
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

// Add Bus Stops, Popups, and Walking Lines
for (const [key, stop] of Object.entries(stops)) {
    const marker = L.marker(stop.coords, { icon: stopIcon }).addTo(map);
    stopMarkers[key] = marker;
    
    // Create an empty popup with specific styling
    const popup = L.popup({
        autoClose: false,
        closeOnClick: false,
        className: 'custom-popup',
        maxWidth: 800
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
        opacity: 0, // Hidden initially
        className: 'walking-path'
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
    [-43.4680, 172.6179], [-43.4755, 172.617396], [-43.476456, 172.61732],
    [-43.47741, 172.617242], [-43.477471, 172.617237], [-43.477768, 172.617213],
    [-43.478174, 172.61718], [-43.478202, 172.617178], [-43.478287, 172.617171],
    [-43.478383, 172.617163], [-43.479117, 172.617104], [-43.479664, 172.617061],
    [-43.4844, 172.6167]
];

const route125Path = [
    [-43.4844, 172.6167], [-43.479664, 172.617061], [-43.479117, 172.617104], 
    [-43.478383, 172.617163], [-43.478287, 172.617171], [-43.478202, 172.617178],
    [-43.478199, 172.617178], [-43.478292, 172.617284], [-43.478292, 172.6173],
    [-43.478308, 172.617693], [-43.478316, 172.617885], [-43.478349, 172.618625],
    [-43.478352, 172.618694], [-43.478369, 172.619086], [-43.4785, 172.6243]
];

// Draw main routes
const mainNorthRouteReverse = [...mainNorthRoute].reverse();
const mainLine = L.polyline(mainNorthRoute, { color: '#3498db', weight: 6, opacity: 0.2 }).addTo(map); // Blue for Route 1
const mainLineRev = L.polyline(mainNorthRouteReverse, { color: '#3498db', weight: 6, opacity: 0.2 }).addTo(map);

const route95Path = mainNorthRoute.map(coord => [coord[0], coord[1] - 0.00005]);
const route95PathReverse = [...route95Path].reverse();
const route95Line = L.polyline(route95Path, { color: '#9b59b6', weight: 6, opacity: 0.2 }).addTo(map); // Purple for Route 95
const route95LineRev = L.polyline(route95PathReverse, { color: '#9b59b6', weight: 6, opacity: 0.2 }).addTo(map);

const route125PathReverse = [...route125Path].reverse();
const danielsLine = L.polyline(route125Path, { color: '#2ecc71', weight: 6, opacity: 0.2 }).addTo(map); // Green for Route 125
const danielsLineRev = L.polyline(route125PathReverse, { color: '#2ecc71', weight: 6, opacity: 0.2 }).addTo(map);

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
    
    // Hide all popups and walking lines
    for (const key of stopKeys) {
        map.closePopup(popups[key]);
        walkingPaths[key].setStyle({ opacity: 0 });
        walkingPaths[key].closeTooltip();
    }
    
    // Dim all routes and remove decorators
    [mainLine, mainLineRev, route95Line, route95LineRev, danielsLine, danielsLineRev].forEach(line => {
        line.setStyle({ opacity: 0.2 });
    });
    activeDecorators.forEach(d => map.removeLayer(d.deco));
    
    // Highlight Active Stop
    stopMarkers[activeKey].openPopup();
    walkingPaths[activeKey].setStyle({ opacity: 0.9 });
    walkingPaths[activeKey].openTooltip();
    
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
            
            popups[key].setContent(`<div class="eta-card" id="card-${key}">${html}</div>`);
        }
    } catch (err) {
        console.error('Error rendering arrivals:', err);
    }
}

// Render data immediately
setTimeout(fetchETAs, 1000);

// Anchor view so it doesn't jump around
const allBounds = L.latLngBounds([
    venueCoords, libraryCoords,
    ...Object.values(stops).map(s => s.coords)
]);
map.fitBounds(allBounds, {
    paddingTopLeft: [350, 50],
    paddingBottomRight: [50, 50]
});

// Start Carousel
setInterval(cyclePanels, 15000);
setTimeout(cyclePanels, 1500); // Trigger first cycle slightly after data load

// Clock Logic
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('clock').innerText = timeString;
}
setInterval(updateClock, 1000);
updateClock();
