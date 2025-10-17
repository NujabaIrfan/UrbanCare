import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const authMiddleware = (roles = []) => {
    return async (req, res, next) => {
        try {
            // Get token from header
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({ message: "Access Denied. No token provided." });
            }
            
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from database
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            // Set user in request
            req.user = user;
            
            next(); 
            
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Session expired" });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: "Invalid token" });
            }
            
            return res.status(500).json({ message: "Authentication failed" });
        }
    };
};

export default authMiddleware;