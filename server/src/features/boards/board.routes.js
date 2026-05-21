import express from 'express';
import { createBoard, getUserBoards, getBoardById } from './board.controller.js';
import { protectRoute } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Create a new board (You already tested this!)
router.post('/', protectRoute, createBoard);

// Get all boards for the logged-in user <-- MAKE SURE THIS LINE EXISTS
router.get('/', protectRoute, getUserBoards);

// Get a specific board by its ID <-- MAKE SURE THIS LINE EXISTS
router.get('/:id', protectRoute, getBoardById);

export default router;