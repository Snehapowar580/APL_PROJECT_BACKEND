// backend/models/doctor.model.js

import mongoose from "mongoose";

// Define the doctor schema
const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fees: { type: Number, required: true },
    slots_booked: { type: Map, of: [String], default: {} },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    },
    date: { type: Number, required: false }, // Made optional if not used in seeding
  },
  {
    minimize: false,
    timestamps: true,
  }
);

// Check if the model already exists to prevent overwriting
const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

// Export the Doctor model
export default Doctor;
