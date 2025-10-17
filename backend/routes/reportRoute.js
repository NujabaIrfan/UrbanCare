import express from 'express'
import { getReport, createReport, getReports } from '../controllers/reportController.js'

const router = express.Router()

router.get("/:id", getReport)
router.post("/", createReport)
router.get("/", getReports)

export default router