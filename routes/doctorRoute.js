import express from "express";
import authDoctor from "../middleware/authDoctor.js";
import {
  registerDoctor,
  loginDoctor,
  doctorList,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  changeAvailability,
  getDashboardData,
  doctorProfile,
  updateDoctorProfile
} from "../controllers/doctorController.js";

const doctorRouter = express.Router();

// Doctor registration and login routes
doctorRouter.post("/register", registerDoctor);
doctorRouter.post("/login", loginDoctor);

// Public routes
doctorRouter.get("/list", doctorList);

// Protected doctor routes
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/change-availability", authDoctor, changeAvailability);
doctorRouter.get("/dashboard", authDoctor, getDashboardData);

// ✅ FIXED: Match this with frontend call
doctorRouter.get("/profile", authDoctor, doctorProfile);

doctorRouter.put("/profile/update", authDoctor, updateDoctorProfile);

export default doctorRouter;
