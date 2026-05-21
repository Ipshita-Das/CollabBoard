import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './features/auth/auth.routes.js';
import boardRoutes from './features/boards/board.routes.js'; // <-- NEW
import listRoutes from './features/lists/list.routes.js';
import taskRoutes from './features/tasks/task.routes.js';
// Load environment variables from the .env file
dotenv.config();

const app = express();

// --- Middleware ---
app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // Parses cookies (Vital for our JWT strategy)

// Configure CORS to allow our future React frontend to securely communicate
app.use(cors({
   origin: [
    'http://localhost:5173', 
    'https://collab-board-azure.vercel.app' // Your live Vercel frontend
  ], 
    credentials: true 
}));

// --- Test Route ---
app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'CollabBoard API is online and routing.' });
});
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/boards', boardRoutes); // <-- NEW
// --- Database & Server Initialization ---
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