import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    appointmentType: {
      type: String,
      enum: ["On-Site Test", "Phone Call"],
      required: true
    },
    amount: { type: Number, default: 0 },
    cancelled: { type: Boolean, default: false },
    payment: {
      method: { type: String },  // e.g. UPI
      upiID: { type: String },
      paidAt: { type: Date },
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "REQUESTED", "PAID"],
      default: "PENDING"
    }, // ✅ Added paymentStatus
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
