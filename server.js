import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Import configurations and routes
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import appointmentRouter from "./routes/appointmentRoute.js";
import paymentRouter from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
})();

// Connect Cloudinary
try {
  connectCloudinary();
  console.log("✅ Cloudinary Connected");
} catch (error) {
  console.error("❌ Cloudinary Connection Error:", error);
  process.exit(1);
}

// Middlewares
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));


// Mount routers
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/payment", paymentRouter);

app.post('/paymentRoutes', (req, res) => {
  // Handle success payment here
  res.send('Payment success handled');
});


// Health check route
app.get("/", (req, res) => {
  res.send("🚀 API Working");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server started on PORT: ${PORT}`);
});
