import express from 'express';
import {
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  addDoctor,
  allDoctors,
  adminDashboard
} from '../controllers/adminController.js';

import { changeAvailability } from '../controllers/doctorController.js'; // Corrected import
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();

// 🌐 Admin Authentication
adminRouter.post('/login', loginAdmin);

// 📊 Admin Dashboard (Protected)
adminRouter.get('/dashboard', authAdmin, adminDashboard);

// 👨‍⚕️ Doctor Management (Protected)
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);
adminRouter.get('/doctors', authAdmin, allDoctors);

// ✅ Correct the typo here: changeAvailablity -> changeAvailability
adminRouter.patch('/change-availability/:id', authAdmin, changeAvailability); // Fixed here

// 📅 Appointment Management (Protected)
adminRouter.get('/appointments', authAdmin, appointmentsAdmin);
adminRouter.patch('/cancel-appointment/:id', authAdmin, appointmentCancel);

export default adminRouter;
