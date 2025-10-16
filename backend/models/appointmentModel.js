import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientModel", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  appointmentDate: { type: Date, required: true },
  mode: { type: String, enum: ["In-Person", "Teleconsultation"], default: "In-Person" },
  status: { type: String, enum: ["Confirmed", "Cancelled", "Completed"], default: "Confirmed" },
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
