const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static('.'));

// Mock Data for ETAs
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

app.get('/api/arrivals', (req, res) => {
    // Optionally randomize the times to simulate live updates
    res.json(mockArrivals);
});

app.listen(port, () => {
    console.log(`Mock server running at http://localhost:${port}`);
});
