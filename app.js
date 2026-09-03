// Venue Location (Coasters Tavern)
const venueCoords = [-43.47813787786105, 172.61740700674628];

// Map Initialization - Dashboard Mode (No interactions, locked view)
const map = L.map('map', {
    center: [-43.477800, 172.617270], // perfect midpoint
    zoom: 19,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false
});

// Remove broken CartoDB tiles and use local static map instead
const imageBounds = [[-43.48281929474003, 172.606201171875], [-43.468867614829236, 172.628173828125]];
L.imageOverlay('noname.svg', imageBounds, { opacity: 0.9, zIndex: 0, className: 'dark-map' }).addTo(map);

// Venue Marker using Coasters Logo (Perfect Circle)
const venueIcon = L.divIcon({
    className: 'venue-logo',
    html: '<img src="c-logo.png" style="width: 100%; height: 100%; object-fit: contain;">',
    iconSize: [80, 80],
    iconAnchor: [40, 40]
});
L.marker(venueCoords, { icon: venueIcon, zIndexOffset: 1000 }).addTo(map);

// Library Location and Icon
const libraryCoords = [-43.4774150, 172.6164750];
const libraryIcon = L.divIcon({
    className: 'custom-venue-icon',
    html: `
        <div class="venue-icon-container"><i class="fa-solid fa-building-columns"></i></div>
        <div class="venue-label">LIBRARY</div>
    `,
    iconSize: [80, 100],
    iconAnchor: [40, 50]
});
const libraryMarker = L.marker(libraryCoords, { icon: libraryIcon }).addTo(map);


// Bus Stop Definitions
const stops = {
    north: { name: 'North (Main North Rd)', coords: [-43.477230, 172.616740], id: '13347' }, // West side
    south: { name: 'South (Main North Rd)', coords: [-43.477250, 172.617030], id: '15319' }, // East side
    east:  { name: 'East (Daniels Rd)', coords: [-43.478260, 172.617800], id: '29195' }, // North side
    west:  { name: 'West (Daniels Rd)', coords: [-43.478370, 172.617420], id: '29900' }  // South side
};



const islandCoords = [-43.477415, 172.616900];

// Footpaths follow actual roads:
// Daniels Rd is roughly at Lat -43.478260
// Main North Rd (East side) is roughly at Lng 172.617030
// Main North Rd (West side) is roughly at Lng 172.616740
const footpaths = {
    north: [
        venueCoords, 
        [-43.478260, 172.617407], // South to Daniels Rd
        [-43.478260, 172.617030], // West to Main North Rd corner
        [-43.477415, 172.617030], // North to pedestrian crossing
        islandCoords,             // Cross to island
        [-43.477415, 172.616740], // Finish crossing to West side
        stops.north.coords        // North to bus stop
    ],
    south: [
        venueCoords,
        [-43.478260, 172.617407], // South to Daniels Rd
        [-43.478260, 172.617030], // West to Main North Rd corner
        stops.south.coords        // North along East side to bus stop
    ],
    east: [
        venueCoords,
        [-43.478260, 172.617407], // South to Daniels Rd
        stops.east.coords         // East to bus stop
    ],
    west: [
        venueCoords,
        [-43.478260, 172.617407], // South to Daniels Rd
        [-43.478370, 172.617407], // Cross Daniels Rd
        stops.west.coords         // To bus stop
    ]
};

const stopIcon = L.divIcon({
    className: 'custom-stop-icon',
    html: '<div class="bus-icon-container"><i class="fa-solid fa-bus"></i></div>',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const popups = {};
const stopMarkers = {};
const walkingPaths = {};
let globalEtaData = {};

// Add Bus Stops and Walking Lines
for (const [key, stop] of Object.entries(stops)) {
    const marker = L.marker(stop.coords, { icon: stopIcon }).addTo(map);
    stops[key].marker = marker; // Save marker reference for animation
    
    // Calculate Walking Distance and ETA
    const stopLatLng = L.latLng(stop.coords);
    const venueLatLng = L.latLng(venueCoords);
    const dist = Math.round(venueLatLng.distanceTo(stopLatLng));
    const walkingTime = Math.ceil(dist / 84);
    
    const formattedName = stop.name.replace(' (', '<br>(').toUpperCase();
    
    // Store HTML — walking info is inside the panel
    popups[key] = `<div class="eta-card" id="card-${key}">
        <h3>${formattedName}</h3>
        <p class="walk-info">🚶 ${dist} meters (${walkingTime} min walk)</p>
        <div class="eta-loading">Loading ETAs...</div>
    </div>`;
    
    // Draw Red Walking Line (no tooltip)
    const walkLine = L.polyline(footpaths[key], {
        color: '#ff4d4d',
        weight: 3,
        dashArray: '5, 10',
        opacity: 0,
        className: 'walking-path'
    }).addTo(map);
    
    walkingPaths[key] = walkLine;
}

// ============================================================
// REAL OSM ROAD GEOMETRY — actual carriageway coordinates
// Main North Road is a divided highway with separate one-way roads.
// Source: OpenStreetMap Overpass API
// ============================================================

// SOUTHBOUND carriageway (East side, heading toward City Centre)
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

// Route 125 / Daniels Road (Actual OSM Geometry)
function offsetRoute(routePoints, latOffset, lngOffset) {
    return routePoints.map(point => [point[0] + latOffset, point[1] + lngOffset]);
}

const danielsRoadCenter = [
    [-43.4782869, 172.6168707],
    [-43.4782915, 172.6169838],
    [-43.4782921, 172.6169997],
    [-43.4783078, 172.6173932],
    [-43.4783163, 172.6175854],
    [-43.4783489, 172.6183247],
    [-43.4783522, 172.6183944],
    [-43.4783809, 172.6190762],
    [-43.4784096, 172.6197204],
    [-43.4784500, 172.6220000],
    [-43.4785500, 172.6280000]
];

const route125Path_Eastbound = [
    [-43.4835056, 172.6163300], [-43.4826265, 172.6163900], [-43.4809881, 172.6165197],
    [-43.4798471, 172.6166076], [-43.4792518, 172.6166571], [-43.4786799, 172.6167027],
    [-43.4783829, 172.6167265], [-43.4782811, 172.6167334],
    ...offsetRoute(danielsRoadCenter, 0.000015, -0.000015)
];

const route125Path_Westbound = [
    ...offsetRoute([...danielsRoadCenter].reverse(), -0.000015, 0.000015),
    [-43.4782869, 172.6168707], [-43.4783829, 172.6168628], [-43.4791171, 172.6168043],
    [-43.4796639, 172.6167608], [-43.4798515, 172.6167479], [-43.4812098, 172.6166362],
    [-43.4815305, 172.6166134], [-43.4819221, 172.6165798], [-43.4826265, 172.6165208],
    [-43.4835056, 172.6164571]
];

const mainLine = L.polyline(mainNorthRoute_Southbound, { color: '#3498db', weight: 6, opacity: 0 }).addTo(map); 
const mainLineRev = L.polyline(mainNorthRoute_Northbound, { color: '#3498db', weight: 6, opacity: 0 }).addTo(map);

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
}, 50);

// Carousel Logic (Rotate active panel every 15 seconds)
const stopKeys = Object.keys(stops);
let currentStopIndex = 0;
let activeKey = null;

let qrcode = null;
function updateQRCode(stopId) {
    const fullStopId = `Metro Canterbury:${stopId}`;
    const url = `https://go.metroinfo.co.nz/mtbp/en-gb/arrivals/stop/${encodeURIComponent(fullStopId)}`;
    if (!qrcode) {
        qrcode = new QRCode(document.getElementById("qrcode"), {
            text: url,
            width: 160,
            height: 160,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    } else {
        qrcode.clear();
        qrcode.makeCode(url);
    }
}

function positionPanel(key) {
    const board = document.getElementById('arrivals-board');
    const stopPixel = map.latLngToContainerPoint(stops[key].coords);
    
    const width = 480;
    const height = board.offsetHeight || 300;
    const mapW = window.innerWidth;
    const mapH = window.innerHeight;
    
    let left, top;
    
    if (key === 'north') {
        left = stopPixel.x - width - 80;
        top = stopPixel.y - height / 2;
    } else if (key === 'south') {
        left = stopPixel.x + 80;
        top = stopPixel.y - height / 2;
    } else if (key === 'east') {
        left = stopPixel.x + 60;
        top = Math.min(stopPixel.y - height - 60, mapH - height - 20);
    } else if (key === 'west') {
        left = stopPixel.x + 60;
        top = stopPixel.y + 60;
    }
    
    // Safety clamps
    if (left < 20) left = 20;
    if (top < 100) top = 100;
    if (left + width > mapW - 20) left = mapW - width - 20;
    if (top + height > mapH - 20) top = mapH - height - 20;
    
    board.style.left = left + 'px';
    board.style.top  = top + 'px';
}

function cyclePanels() {
    activeKey = stopKeys[currentStopIndex];
    const board = document.getElementById('arrivals-board');
    
    // Fade out board
    board.style.opacity = '0';
    
    // Highlight active stop marker, dim others
    stopKeys.forEach(key => {
        if (stops[key].marker) {
            const el = stops[key].marker.getElement();
            if (el) {
                L.DomUtil.removeClass(el, 'active-stop-marker');
                if (key === activeKey) {
                    L.DomUtil.removeClass(el, 'dimmed');
                } else {
                    L.DomUtil.addClass(el, 'dimmed');
                }
            }
        }
    });

    // Keep library dimmed
    if (libraryMarker) {
        const el = libraryMarker.getElement();
        if (el) L.DomUtil.addClass(el, 'dimmed');
    }
    
    // Hide all walking lines
    for (const key of stopKeys) {
        walkingPaths[key].setStyle({ opacity: 0 });
    }
    
    // Hide all routes
    [mainLine, mainLineRev, route95Line, route95LineRev, danielsLine, danielsLineRev].forEach(line => {
        line.setStyle({ opacity: 0 });
    });
    activeDecorators.forEach(d => map.removeLayer(d.deco));
    
    // Calculate midpoint between Venue and Stop to perfectly frame both
    const stopLatLng = L.latLng(stops[activeKey].coords);
    const venueLatLng = L.latLng(venueCoords);
    const midLat = (stopLatLng.lat + venueLatLng.lat) / 2;
    const midLng = (stopLatLng.lng + venueLatLng.lng) / 2;
    
    // Smoothly fly camera to the midpoint
    map.flyTo([midLat, midLng], 19, { animate: true, duration: 1.5 });
    
    // When the camera arrives, show the UI
    map.once('moveend', () => {
        board.style.display = 'block';
        board.innerHTML = popups[activeKey];
        positionPanel(activeKey);
        updateQRCode(stops[activeKey].id);
        
        walkingPaths[activeKey].setStyle({ opacity: 0.9 });
        
        // Determine which routes to show based on ETAs
        let hasRoute1 = false;
        let hasRoute95 = false;
        if (globalEtaData[activeKey] && globalEtaData[activeKey].length > 0) {
            hasRoute1 = globalEtaData[activeKey].some(e => e.route === '1');
            hasRoute95 = globalEtaData[activeKey].some(e => e.route === '95');
        } else {
            hasRoute1 = true;
            hasRoute95 = true;
        }
        
        // Show only active routes
        if (activeKey === 'north') {
            if (hasRoute1) mainLineRev.setStyle({ opacity: 1 });
            if (hasRoute95) route95LineRev.setStyle({ opacity: 1 });
            activeDecorators = [];
            if (hasRoute1) activeDecorators.push(decoMainRev);
            if (hasRoute95) activeDecorators.push(deco95Rev);
        } else if (activeKey === 'south') {
            if (hasRoute1) mainLine.setStyle({ opacity: 1 });
            if (hasRoute95) route95Line.setStyle({ opacity: 1 });
            activeDecorators = [];
            if (hasRoute1) activeDecorators.push(decoMain);
            if (hasRoute95) activeDecorators.push(deco95);
        } else if (activeKey === 'east') {
            danielsLine.setStyle({ opacity: 1 });
            activeDecorators = [decoDaniels];
        } else if (activeKey === 'west') {
            danielsLineRev.setStyle({ opacity: 1 });
            activeDecorators = [decoDanielsRev];
        }
        
        activeDecorators.forEach(d => map.addLayer(d.deco));
        
        // Make the active marker blink
        if (stops[activeKey].marker) {
            const el = stops[activeKey].marker.getElement();
            if (el) L.DomUtil.addClass(el, 'active-stop-marker');
        }
        
        // Fade in board
        board.style.opacity = '1';
    });
    
    currentStopIndex = (currentStopIndex + 1) % stopKeys.length;
}

// Data Fetching Logic
async function fetchETAs() {
    let data = {};
    const timestamp = Math.floor(Date.now() / 1000);
    try {
        for (const [key, stop] of Object.entries(stops)) {
            const url = `https://go.metroinfo.co.nz/mtbp/service/ui/eta/stop/Metro%20Canterbury%3A${stop.id}/${timestamp}/200?locale=en-gb`;
            const res = await fetch(url, {
                headers: {
                    'authorization': 'ApiKey 5vgJIJQTkmeJXN7h2n9drK0UuqrSoWOW'
                }
            });
            if (res.ok) {
                const json = await res.json();
                let etas = [];
                for (const routeTrips of Object.values(json)) {
                    for (const trip of routeTrips) {
                        const arrivalTime = new Date(trip.realtimeArrival || trip.scheduledArrival);
                        const diffMins = Math.round((arrivalTime - Date.now()) / 60000);
                        if (diffMins >= 0) {
                            const routeNum = trip.routeId.split(':')[1].split('_')[0];
                            
                            let destName = trip.headSign;
                            if (!destName) {
                                // Only fallback if the API doesn't provide a destination
                                if (routeNum === '1') {
                                    destName = (key === 'north') ? 'Rangiora' : 'City';
                                } else if (routeNum === '95') {
                                    destName = (key === 'north') ? 'Pegasus' : 'City';
                                } else if (routeNum === '125') {
                                    destName = (key === 'east') ? 'Redwood' : 'Westlake';
                                } else {
                                    destName = 'Bus';
                                }
                            }

                            etas.push({
                                route: routeNum,
                                destination: destName.toUpperCase(),
                                time: diffMins === 0 ? 'Due' : `${diffMins} min`,
                                diffMins: diffMins,
                                timestamp: arrivalTime.getTime()
                            });
                        }
                    }
                }
                etas.sort((a, b) => a.timestamp - b.timestamp);
                data[key] = etas.slice(0, 3).map(e => ({ route: e.route, destination: e.destination, time: e.time, diffMins: e.diffMins }));
            }
        }
    } catch (e) {
        console.error('Failed to fetch ETAs', e);
    }
    
    try {
        
        for (const [key, stop] of Object.entries(stops)) {
            const stopData = data[key];
            const stopLatLng = L.latLng(stop.coords);
            const venueLatLng = L.latLng(venueCoords);
            const dist = Math.round(venueLatLng.distanceTo(stopLatLng));
            const walkingTime = Math.ceil(dist / 84);
            
            const nameParts = stop.name.toUpperCase().split(' ');
            const formattedName = nameParts.length > 1 
                ? `${nameParts[0]}<br>${nameParts.slice(1).join(' ')}` 
                : nameParts[0];
            
            let html = `<h3>${formattedName}</h3>`;
            html += `<p class="walk-info">🚶 ${dist} meters · ${walkingTime} min walk</p>`;
            
            if (stopData && stopData.length > 0) {
                stopData.forEach(eta => {
                    const routeClass = `route-${eta.route}`;
                    
                    // If destination name is long, use marquee to scroll it
                    let destHtml = eta.destination;
                    if (eta.destination.length > 15) {
                        destHtml = `<marquee scrollamount="4" style="width: 100%;">${eta.destination}</marquee>`;
                    }

                    // Dynamic color for time
                    let r = 255, g = 255, b = 255;
                    if (eta.diffMins >= 15) {
                        r = 255; g = 255; b = 255; // White
                    } else if (eta.diffMins >= 10) {
                        b = Math.floor(((eta.diffMins - 10) / 5) * 255); // White to Yellow
                    } else if (eta.diffMins >= 5) {
                        b = 0;
                        g = 165 + Math.floor(((eta.diffMins - 5) / 5) * 90); // Yellow to Orange
                    } else if (eta.diffMins > 0) {
                        b = 0;
                        g = Math.floor((eta.diffMins / 5) * 165); // Orange to Red
                    } else {
                        g = 0; b = 0; // Red
                    }
                    const timeColor = `rgb(${r}, ${g}, ${b})`;
                    const flashingClass = eta.diffMins === 0 ? 'flashing-text' : '';

                    html += `
                    <div class="eta-row">
                        <span class="eta-route ${routeClass}">${eta.route}</span>
                        <span class="eta-dest">${destHtml}</span>
                        <span class="eta-time ${flashingClass}" style="color: ${timeColor};">${eta.time}</span>
                    </div>`;
                });
            } else {
                html += `<div class="eta-loading">No upcoming buses</div>`;
            }
            
            popups[key] = `<div class="eta-card" id="card-${key}">${html}</div>`;
        }
        
        // Save to global variable for cyclePanels to read
        globalEtaData = data;
        
        // Update sync status text
        updateSyncStatus();
    } catch (err) {
        console.error('Error rendering arrivals:', err);
    }
}

// Function to update the sync status
function updateSyncStatus() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const syncStatusEl = document.getElementById('sync-status');
    if (syncStatusEl) {
        syncStatusEl.textContent = `DATA LAST SYNCED: ${hours}:${minutes}:${seconds}`;
    }
}

// Title Animation
const titles = [
    "CATCH THE NEXT BUS<br>THE WHEELS ON THE BUS GO.... 'TAKE ME HOME!'",
    "DON'T DRINK & DRIVE....",
    "DRINK, DON'T DRIVE<br>& SURVIVE!"
];
let currentTitleIndex = 0;
setInterval(() => {
    currentTitleIndex = (currentTitleIndex + 1) % titles.length;
    const titleEl = document.getElementById('main-title');
    if (titleEl) {
        titleEl.style.opacity = '0';
        setTimeout(() => {
            titleEl.textContent = titles[currentTitleIndex];
            titleEl.style.opacity = '1';
        }, 1000);
    }
}, 15000);

// Initialize
fetchETAs(); 
setInterval(fetchETAs, 30000); 

// Start Carousel
setInterval(cyclePanels, 15000);
setTimeout(cyclePanels, 1500);

// Clock Logic
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    // Blinking colon based on seconds
    const showColon = now.getSeconds() % 2 === 0;
    const colon = showColon ? ':' : '<span style="visibility: hidden;">:</span>';
    
    const timeString = `${hours.toString().padStart(2, '0')}${colon}${minutes} <span style="font-size: 0.6em">${ampm}</span>`;
    document.getElementById('clock').innerHTML = timeString;
}
setInterval(updateClock, 1000);
updateClock();
