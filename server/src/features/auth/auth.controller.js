import User from './User.model.js';
import jwt from 'jsonwebtoken';

// --- Helper function to generate a JWT ---
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d', // Token lasts for 7 days
    });
};

// --- @route POST /api/auth/register ---
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // 2. Create the new user (The pre-save hook handles the hashing!)
        const user = await User.create({
            name,
            email,
            password
        });

        // 3. Generate Token & Set Cookie
        const token = generateToken(user._id, user.role);
        
        res.cookie('jwt', token, {
            httpOnly: true, // Prevents XSS attacks
            secure: process.env.NODE_ENV !== 'development', // Must be true in production (HTTPS)
            sameSite: 'strict', // Prevents CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// --- @route POST /api/auth/login ---
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. Check if user exists AND password matches
        if (user && (await user.comparePassword(password))) {
            
            // 3. Generate Token & Set Cookie
            const token = generateToken(user._id, user.role);
            
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 
            });

            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};