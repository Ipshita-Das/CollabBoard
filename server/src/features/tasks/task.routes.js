import express from 'express';
import { protectRoute } from '../../middleware/auth.middleware.js';

// ONE single import that grabs all 5 functions from your controller
import { 
  createTask, 
  getTasksForBoard, 
  generateLocalSubtasks, 
  generateBoardDescription, 
  suggestTasksByList 
} from './task.controller.js';

const router = express.Router();

// --- Standard Board Routes ---
router.post('/', protectRoute, createTask);
router.get('/:boardId', protectRoute, getTasksForBoard);

// --- AI Microservice Routes ---
router.post('/ai-breakdown', protectRoute, generateLocalSubtasks);
router.post('/ai-description', protectRoute, generateBoardDescription);
router.post('/ai-suggest-tasks', protectRoute, suggestTasksByList);

export default router;