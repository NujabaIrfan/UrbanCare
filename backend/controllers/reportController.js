import mongoose from "mongoose"
import Report from "../models/ReportModel.js"
import PatientModel from "../models/PatientModel.js"
import User from "../models/userModel.js"
import { StatusCodes } from "http-status-codes"

export const getReport = async (req, res, next) => {
    try {
        const { id } = req.params
        if (!mongoose.isValidObjectId(id))
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Bad Request" })

        const report = await Report.findById(id).exec()
        if (!report)
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" })

        const patient = await PatientModel.findOne({ email: report.patient }).exec()
        const doctor = await User.findOne({ email: report.doctor }).exec()
        if (!doctor) return res.status(StatusCodes.NOT_FOUND).json({ message: "Not found" })

        return res.status(StatusCodes.OK).json({ ...report.toObject(), doctor, patient })
    } catch (error) {
        console.error(error)
        next(error)
    }
}

export const getReports = async (req, res, next) => {
    try {
        const { email } = req.query
        if (!email)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" })

        const reports = await Report.find({ patient: email }).exec()
        if (!reports || reports.length === 0)
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No reports" })

        return res.status(StatusCodes.OK).json(reports)
    } catch (error) {
        console.error(error)
        next(error)
    }
}

export const createReport = async (req, res, next) => {
    try {
        const report = await Report.create(req.body)
        if (report)
            return res.status(StatusCodes.CREATED).json({ message: "Created", id: report._id })
    } catch (error) {
        if (error.name === "ValidationError")
            return res.status(StatusCodes.BAD_REQUEST).json({ message: error.message })
        console.error(error)
        next(error)
    }
} 