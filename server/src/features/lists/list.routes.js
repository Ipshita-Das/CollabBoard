import express from 'express';
import { createList, getListsForBoard } from './list.controller.js';
import { protectRoute } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, createList);
router.get('/:boardId', protectRoute, getListsForBoard);

export default router;