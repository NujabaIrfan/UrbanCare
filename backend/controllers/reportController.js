import { MongooseError } from "mongoose"
import Report from "../models/ReportModel.js"

export const getReport = async (req, res, next) => {
    try {

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