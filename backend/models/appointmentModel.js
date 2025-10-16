import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  date: String,
  time: String,
  mode: { type: String, enum: ["In-Person", "Teleconsultation"], default: "In-Person" },
  status: { type: String, default: "Confirmed" },
});

export default mongoose.model("Appointment", appointmentSchema);
