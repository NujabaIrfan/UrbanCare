import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    specialty: { type: String, required: true },
    availableSlots: [
        {
        date: { type: String, required: true },
        time: { type: String, required: true },
        },
    ],
    contactNumber: String,
    location: String,
});