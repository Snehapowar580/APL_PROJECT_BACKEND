import express from 'express'
import Appointment from '../models/appointmentModel.js'
import Doctor from '../models/doctorModel.js'
import { protect } from '../middleware/authMiddleware.js'
 // assuming you have auth middleware

const router = express.Router()

// POST: Book an appointment
router.post('/book', protect, async (req, res) => {
  try {
    const { docId, slotDate, slotTime, appointmentType } = req.body

    // Find doctor to get the fee
    const doctor = await Doctor.findById(docId)
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' })

    // Create appointment
    const appointment = await Appointment.create({
      doctor: docId,
      user: req.user.id,
      slotDate,
      slotTime,
      appointmentType, // save the type
      amount: doctor.fees,
    })

    res.status(201).json({ message: 'Appointment booked successfully', appointment })
  } catch (error) {
    console.error('Error booking appointment:', error)
    res.status(500).json({ message: 'Booking failed' })
  }
})

export default router
