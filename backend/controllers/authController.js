import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendOTP, sendWelcomeEmail } from '../utils/emailService.js';
import {
  registerSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema
} from '../utils/validation.js';

// 🔐 OTP generator
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =====================================================
   🧾 REGISTER (SMART & SAFE)
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

    const existingUser = await User.findOne({ email });

    // 🟡 User exists but OTP not verified → resend OTP
    if (existingUser && existingUser.otp) {
      const otp = generateOTP();
      existingUser.otp = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      };
      await existingUser.save();
      await sendOTP(email, otp);

      return res.status(200).json({
        success: true,
        message: 'OTP resent to your email'
      });
    }

    // 🔴 Fully registered user
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists. Please login.'
      });
    }

    // ✅ Create new user
    const otp = generateOTP();
    const user = await User.create({
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
    const { otp } = value;

    const user = await User.findOne({ email });
    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    if (
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

    res.status(200).json({
      success: true,
      message: 'Registration successful. Please login.'
    });
  } catch (err) {
    next(err);
  }
};

/* =====================================================
   🔐 LOGIN
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
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Account is blocked'
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

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
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
    sameSite: 'none'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
