import jwt from 'jsonwebtoken'; 
import express from 'express';
import {
    getAllDoctors,
    getDoctorById,
    bookAppointment,
    updateAppointmentStatus
} from '../controllers/doctorController.js';
import auth from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Protected routes (require authentication)
router.put('/appointments/:appointmentId', auth, updateAppointmentStatus);

router.post('/:id/appointments', 
    (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({ message: "No token provided" });
            }

            // Verify token and get user ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Set user with just the ID (no database lookup needed)
            req.user = { id: decoded.id };
            next();
            
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Session expired. Please login again." });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: "Invalid token" });
            }
            return res.status(401).json({ message: "Authentication failed" });
        }
    },
    
    // Proceed to booking
    bookAppointment
);

export default router;