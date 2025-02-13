const express = require('express'); 
const app = express();
const router = require('./router');
const connectDB = require('./DB/dbConnection');
const cors = require('cors');

// Connect to the database
connectDB();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to prevent caching
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Vary', 'Origin'); // Fix CORS cache issue
    next();
});

// Add the CORS middleware
app.use(cors({
    origin: 'https://udhaar-d2lz.vercel.app', // Explicit frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning', 'userid'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
}));

// Handle preflight requests for CORS (must be before other routes)
app.options('*', cors());

// Add routes
app.use('/api', router);

// Default route
app.get('/', (req, res) => {
    res.send('hello world!');
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
