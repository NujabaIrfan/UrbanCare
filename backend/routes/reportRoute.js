import express from 'express'
import { getReport, createReport } from '../controllers/reportController.js'

const router = express.Router()

router.get("/:id", getReport)
router.post("/", createReport)

export default router