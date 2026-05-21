import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './features/auth/auth.routes.js';
import boardRoutes from './features/boards/board.routes.js'; 
import listRoutes from './features/lists/list.routes.js';
import taskRoutes from './features/tasks/task.routes.js';

// Load environment variables from the .env file
dotenv.config();

const app = express();

// --- 1. CORS Configuration (MUST BE FIRST) ---
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'https://collab-board-azure.vercel.app' // Your live Vercel frontend
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Explicitly handle preflight OPTIONS requests for all routes



// --- 2. Body Parsers (MUST BE AFTER CORS) ---
app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // Parses cookies (Vital for our JWT strategy)


// --- 3. Test Route ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'CollabBoard API is online and routing.' });
});

// --- 4. Application Routes ---
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/lists', listRoutes);
app.use('/boards', boardRoutes); 


// --- 5. Database & Server Initialization ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });