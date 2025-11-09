import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// ✅ Register Doctor
const registerDoctor = async (req, res) => {
  try {
    const { email, password, name, fees, address, speciality, degree } = req.body;

    const existingDoctor = await doctorModel.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = new doctorModel({
      name,
      email,
      password: hashedPassword,
      fees,
      address,
      speciality,
      degree,
    });

    await newDoctor.save();
    res.status(201).json({ success: true, message: "Doctor registered successfully!" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ Doctor Login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find the doctor by email
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password matches
    const isPasswordMatch = await bcrypt.compare(password, doctor.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables.");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { docId: doctor._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Respond with token and doctor info
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        speciality: doctor.speciality,
      },
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// ✅ Get Dashboard Data
const getDashboardData = async (req, res) => {
  console.log("getDashboardData");
  try {
    const docId = req.user.docId;
    if (!docId) {
      return res.status(400).json({ success: false, message: "Doctor ID not found" });
    }

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;
    let patients = new Set();

    appointments.forEach(item => {
      if (item.isCompleted || item.payment) earnings += item.amount || 0;
      patients.add(item.userId.toString());
    });

    res.json({
      success: true,
      dashData: {
        earnings,
        appointments: appointments.length,
        patients: patients.size,
        latestAppointments: appointments.reverse(),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get All Doctors
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find().select("-password");
    res.status(200).json({ success: true, doctors });
  } catch (error) {
    console.error("Doctor list error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get Doctor Appointments
const appointmentsDoctor = async (req, res) => {
  try {
    if (!req.user?.docId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const appointments = await appointmentModel.find({ docId: req.user.docId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error("Appointments fetch error:", error);
    res.status(500).json({ success: false, message: "Error fetching appointments" });
  }
};

// ✅ Cancel Appointment
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.user.docId;

    const appointment = await appointmentModel.findById(appointmentId);

    if (appointment && appointment.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
      return res.json({ success: true, message: "Appointment Cancelled" });
    }

    res.status(400).json({ success: false, message: "Invalid Request" });
  } catch (error) {
    console.error("Cancel error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Complete Appointment
const appointmentComplete = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const docId = req.user.docId;

    const appointment = await appointmentModel.findById(appointmentId);

    if (appointment && appointment.docId.toString() === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
      return res.json({ success: true, message: "Appointment Completed" });
    }

    res.status(400).json({ success: false, message: "Invalid Request" });
  } catch (error) {
    console.error("Complete error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Change Doctor Availability
const changeAvailability = async (req, res) => {
  try {
    const docId = req.user.docId;
    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    doctor.available = !doctor.available;
    await doctor.save();

    res.json({ success: true, message: "Availability Updated", available: doctor.available });
  } catch (error) {
    console.error("Availability error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get Doctor Profile
const doctorProfile = async (req, res) => {
  try {
    console.log("Fetching doctor profile...");
    const docId = req.user?.docId;

    if (!docId || !mongoose.Types.ObjectId.isValid(docId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Doctor ID",
      });
    }
    const profileData = await doctorModel.findById(docId).select("-password");
    if (!profileData) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }
    return res.json({
      success: true,
      profile: profileData,
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the doctor profile",
    });
  }
};

// ✅ Update Doctor Profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { fees, address, available, about } = req.body;
    const docId = req.user.docId;

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available, about });
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  registerDoctor,
  loginDoctor,
  doctorList,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  changeAvailability,
  getDashboardData,
  doctorProfile,
  updateDoctorProfile,
};
