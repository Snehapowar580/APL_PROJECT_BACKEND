import express from 'express';
import {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  handleUpiPayment // UPI payment handler
} from '../controllers/userController.js';

import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

// ===================== Auth Routes ===================== //
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// ===================== Profile Routes ===================== //
userRouter.get('/get-profile', authUser, getProfile);
userRouter.post('/update-profile', authUser, upload.single('image'), updateProfile);

// ===================== Appointment Routes ===================== //
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointment);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);

// ===================== Payment Routes ===================== //
userRouter.post('/upi-payment', authUser, handleUpiPayment);

export default userRouter;
