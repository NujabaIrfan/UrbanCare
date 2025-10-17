import express from 'express';
import jwt from 'jsonwebtoken';
import { 
    getUserAppointments, 
    updateAppointment, 
    cancelAppointment,
    getAllAppointments,
    deleteAppointment,
    updateAppointmentStatus
} from '../controllers/channelingController.js';

const router = express.Router();

// Manual authentication middleware
const manualAuth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Set user with just the ID
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
};

router.get('/my-appointments', manualAuth, getUserAppointments);
router.put('/appointments/:id', manualAuth, updateAppointment);
router.delete('/appointments/:id', manualAuth, cancelAppointment);
router.get('/admin/appointments', manualAuth, getAllAppointments);
router.delete('/admin/appointments/:id', manualAuth, deleteAppointment);
router.put('/admin/appointments/:id/status', manualAuth, updateAppointmentStatus);

export default router;