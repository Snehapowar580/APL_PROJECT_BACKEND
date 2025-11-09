import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

// ===================== AUTH ===================== //

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Please enter a strong password" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== PROFILE ===================== //

const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, userData: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (name) user.name = name;
    if (email) {
      if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
      }
      user.email = email;
    }

    await user.save();
    res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== APPOINTMENTS ===================== //

const bookAppointment = async (req, res) => {
  try {
    const { docId, slotDate, slotTime, appointmentType, onlinePayment } = req.body;

    if (!docId || !slotDate || !slotTime || !appointmentType) {
      return res.status(400).json({ success: false, message: 'Missing appointment details' });
    }

    // Check if slot is already booked
    const existingAppointment = await appointmentModel.findOne({
      doctor: docId,
      slotDate,
      slotTime,
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This slot is already booked. Please choose another.',
      });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    // Set paymentStatus based on onlinePayment flag
    const paymentStatus = onlinePayment ? "PAID" : "PENDING";

    const appointment = await appointmentModel.create({
      doctor: docId,
      user: req.user.id,
      slotDate,
      slotTime,
      appointmentType,
      amount: doctor.fees,
      paymentStatus,
    });

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    console.error("Appointment Booking Error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    if (!appointmentId) return res.status(400).json({ success: false, message: "Appointment ID is required" });

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

    await appointmentModel.findByIdAndDelete(appointmentId);
    res.status(200).json({ success: true, message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listAppointment = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({ user: req.user.id })
      .populate("doctor")
      .sort({ createdAt: -1 });

    const formattedAppointments = appointments.map(app => ({
      ...app._doc,
      docData: app.doctor,
    }));

    res.status(200).json({ success: true, appointments: formattedAppointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== PAYMENT ===================== //

const handleUpiPayment = async (req, res) => {
  const { appointmentId, upiID } = req.body;
  if (!appointmentId || !upiID) return res.status(400).json({ success: false, message: "Appointment ID and UPI ID are required" });

  try {
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });
    if (appointment.paymentStatus === 'PAID') return res.status(400).json({ success: false, message: "Payment already completed" });

    appointment.payment = { method: 'UPI', upiID, paidAt: new Date() };
    appointment.paymentStatus = 'PAID';
    await appointment.save();

    res.json({ success: true, message: "Payment completed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ===================== EXPORTS ===================== //

export {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  bookAppointment,
  cancelAppointment,
  listAppointment,
  handleUpiPayment,
};
