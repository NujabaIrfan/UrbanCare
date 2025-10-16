import mongoose from "mongoose";
const Schema = mongoose.Schema;

const medicalRecordSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: "PatientModel",
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  doctor: {
    type: String,
    required: true,
  },
  diagnoses: {
    type: String,
  },
  comments: {
    type: String,
  },
});

export default mongoose.model("MedicalRecordModel", medicalRecordSchema);