import jwt from 'jsonwebtoken';
import User from '../features/auth/User.model.js';

// --- The Bouncer: Checks if you are logged in at all ---
export const protectRoute = async (req, res, next) => {
    try {
        // 1. Grab the token directly from the incoming cookie
        let token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message: 'Not authorized: No token provided' });
        }

        // 2. Decode the token to get the user's ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find the user in the database, but EXCLUDE their password from the result
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized: User not found' });
        }

        // 4. Everything looks good, let them pass to the next function
        next(); 
        
    } catch (error) {
        console.error("Token verification failed:", error.message);
        res.status(401).json({ message: 'Not authorized: Token failed or expired' });
    }
};

// --- The Manager: Checks if your role has permission ---
// This takes a list of allowed roles (e.g., 'Admin', 'Member')
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // req.user was attached by the 'protectRoute' function above!
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Role '${req.user.role}' is not authorized to perform this action.` 
            });
        }
        next();
    };
};