import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendOTP, sendWelcomeEmail } from '../utils/emailService.js';
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema
} from '../utils/validation.js';

/* ================= OTP GENERATOR ================= */
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =====================================================
   🧾 REGISTER
   ===================================================== */
export const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    let { name, email, phone, password } = value;
    email = email.toLowerCase().trim();

    let existingUser = await User.findOne({ email });

    // OTP expired → clear
    if (existingUser?.otp && new Date() > existingUser.otp.expiresAt) {
      existingUser.otp = undefined;
      await existingUser.save();
      existingUser = null;
    }

    // OTP pending → resend
    if (existingUser?.otp) {
      const otp = generateOTP();
      existingUser.otp = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      };
      await existingUser.save();
      await sendOTP(email, otp);

      return res.json({
        success: true,
        message: 'OTP resent to your email'
      });
    }

    // Already verified
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login.'
      });
    }

    // Create new user
    const otp = generateOTP();

    await User.create({
      name,
      email,
      phone,
      password,
      otp: {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      isApproved: true
    });

    await sendOTP(email, otp);

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email',
      email
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   ✅ VERIFY OTP
   ===================================================== */
export const verifyOTP = async (req, res, next) => {
  try {
    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const email = value.email.toLowerCase().trim();
    const otp = String(value.otp).trim();

    const user = await User.findOne({ email });

    if (
      !user ||
      !user.otp ||
      user.otp.code !== otp ||
      new Date() > user.otp.expiresAt
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.otp = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Registration successful. Please login.'
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   🔁 RESEND OTP
   ===================================================== */
export const resendOTP = async (req, res, next) => {
  try {
    const { error, value } = resendOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const email = value.email.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        message: 'No pending OTP found'
      });
    }

    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };

    await user.save();
    await sendOTP(email, otp);

    res.json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   🔐 LOGIN  ✅ COOKIE FIXED
   ===================================================== */
export const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const email = value.email.toLowerCase().trim();
    const { password } = value;

    const user = await User.findOne({ email });
    if (!user || user.otp || user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or account blocked'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ DO NOT SET domain
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   🚪 LOGOUT
   ===================================================== */
export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
    path: '/'
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};
