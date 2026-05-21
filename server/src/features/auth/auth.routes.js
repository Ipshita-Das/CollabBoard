import express from 'express';
import { protectRoute, authorizeRoles } from '../../middleware/auth.middleware.js'; // <-- NEW
import { registerUser, loginUser } from './auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;
// A secure route: First checks login, then checks if they are an Admin
router.get('/admin-dashboard', protectRoute, authorizeRoles('Admin'), (req, res) => {
    res.status(200).json({ 
        message: 'Welcome to the secret admin vault.',
        user: req.user 
    });
});