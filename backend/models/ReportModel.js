import mongoose from "mongoose"

const reportSchema = new mongoose.Schema({
  results: [
    {
      name: { type: String, required: true },
      result: { type: Number, required: true },
      unit: { type: String, required: true },
      severity: {
        type: String,
        enum: ["normal", "high", "low", "critical"],
        required: true,
      },
      recommendedRange: { type: String, required: true },
      remarks: { type: String, required: true },
    },
  ],
  overallRemarks: { type: String, required: true },
  nextAppointment: { type: Date, required: true },
  recommendations: [
    {
      recommendation: { type: String, required: true },
      type: {
        type: String,
        enum: ["medication", "follow-up", "lifestyle"],
        required: true,
      },
      priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        required: true,
      },
      dueDate: { type: Date, required: true },
    },
  ],
  patient: { type: String, required: true },
  doctor: { type: String, required: true },
})

const Report = mongoose.model("Report", reportSchema)

export default Report
