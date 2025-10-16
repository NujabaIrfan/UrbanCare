import mongoose from "mongoose"
import Report from "../models/ReportModel.js"
import PatientModel from "../models/PatientModel.js"
import User from "../models/userModel.js"

export const getReport = async (req, res, next) => {
    try {
        const { id } = req.params
        if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Bad Request" })
        const report = await Report.findById(id).exec()
        if (!report) return res.status(404).json({ message: "Not found" })
        const patient = await PatientModel.findOne({ email: report.patient }).exec()
        const doctor = await User.findOne({ email: report.doctor }).exec()
        if (!patient || !doctor) return res.status(404).json({ message: "Not found" })
        return res.status(200).json({ ...report.toObject(), doctor, patient })
    } catch (error) {
        console.error(error)
        next(error)
    }
}

export const getReports = async (req, res, next) => {
    try {
        const { email } = req.query
        if (!email) return res.status(401).json({ message: "Unauthorized" })
        const reports = await Report.find({ patient: email }).exec()
        if (!reports || reports.length === 0) return res.status(404).json({ message: "No reports" })
        return res.status(200).json(reports)
    } catch (error) {
        console.error(error)
        next(error)
    }
}

export const createReport = async (req, res, next) => {
    try {
        const report = await Report.create(req.body)
        if (report) return res.status(201).json({ message: "Created" })
    } catch (error) {
        if (error.name === "ValidationError") return res.status(400).json({ message: error.message })
        console.error(error)
        next(error)
    }
} 