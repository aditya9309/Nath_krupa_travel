import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendOTP, sendAccountApprovalEmail, sendWelcomeEmail } from '../utils/emailService.js';
import { registerSchema, loginSchema, verifyOTPSchema, resendOTPSchema } from '../utils/validation.js';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user (Step 1: Send OTP)
export const register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { name, email, phone, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user with active status (no admin approval needed)
    const user = await User.create({
      name,
      email,
      phone,
      password,
      otp: {
        code: otp,
        expiresAt: otpExpiresAt
      },
      isApproved: true // Users are active immediately
    });

    // Send OTP email
    try {
      await sendOTP(email, otp);
    } catch (emailError) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      email: email
    });
  } catch (error) {
    next(error);
  }
};

// Verify OTP (Step 2: Verify and complete registration)
export const verifyOTP = async (req, res, next) => {
  try {
    const { error, value } = verifyOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, otp } = value;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP matches and is not expired
    if (!user.otp || String(user.otp.code).trim() !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Clear OTP and mark as verified and approved
    user.otp = undefined;
    user.isApproved = true; // Ensure user is active
    await user.save();

    // Send welcome email AFTER successful verification
    try {
      await sendWelcomeEmail(user.email, user.name);
      console.log(`✅ Welcome email sent successfully to ${user.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send welcome email:', emailError);
      // Don't fail the registration if welcome email fails, but log it
    }

    res.status(200).json({
      success: true,
      message: 'Registration successful! Your account is now active. You can login now.'
    });
  } catch (error) {
    next(error);
  }
};

// Resend OTP
export const resendOTP = async (req, res, next) => {
  try {
    const { error, value } = resendOTPSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email } = value;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code: otp,
      expiresAt: otpExpiresAt
    };
    await user.save();

    // Send OTP email
    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP resent to your email'
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, password } = value;

    // Check if this is an admin login attempt using .env credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword && 
        email.toLowerCase().trim() === adminEmail.toLowerCase().trim() && 
        password === adminPassword) {
      // Admin login with .env credentials
      // Find or ensure admin user exists in database
      let adminUser = await User.findOne({ email: adminEmail });
      
      if (!adminUser) {
        // Create admin user if it doesn't exist
        adminUser = await User.create({
          name: 'Admin',
          email: adminEmail,
          phone: '0000000000',
          password: adminPassword, // Will be hashed by pre-save hook
          role: 'admin',
          isApproved: true,
          isBlocked: false
        });
      } else {
        // Ensure admin user has correct role and status
        if (adminUser.role !== 'admin') {
          adminUser.role = 'admin';
        }
        adminUser.isApproved = true;
        adminUser.isBlocked = false;
        await adminUser.save();
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: adminUser._id, role: adminUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set HttpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          profilePhoto: adminUser.profilePhoto
        }
      });
    }

    // Regular user login
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Users are now auto-approved, but ensure legacy users are approved
    if (!user.isApproved) {
      user.isApproved = true;
      await user.save();
    }

    // Check if account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact admin.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.lastActivity = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HttpOnly cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: true,       // ALWAYS TRUE
  sameSite: 'none',   // ALWAYS NONE
  maxAge: 7 * 24 * 60 * 60 * 1000
});


    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res) => {
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

// Get current user
export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      profilePhoto: req.user.profilePhoto,
      isApproved: req.user.isApproved,
      isBlocked: req.user.isBlocked
    }
  });
};

// Request password change OTP
export const requestPasswordChangeOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked. Please contact admin.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = {
      code: otp,
      expiresAt: otpExpiresAt,
      purpose: 'password-reset'
    };
    await user.save();

    // Send OTP email
    try {
      await sendOTP(email, otp, 'password-change');
      console.log(`✅ Password change OTP sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password change OTP:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email for password change',
      email: email,
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    next(error);
  }
};

// Verify password change OTP
export const verifyPasswordChangeOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if OTP matches and is not expired
    if (!user.otp || String(user.otp.code).trim() !== String(otp).trim() || user.otp.purpose !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Mark OTP as verified (don't clear yet, will be cleared after password change)
    user.otp.verified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now change your password.',
      token: jwt.sign(
        { userId: user._id, otpVerified: true, purpose: 'password-change' },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } // 10 minutes to change password
      )
    });
  } catch (error) {
    next(error);
  }
};

// Change password with verified OTP
export const changePassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify OTP was verified for password change
    if (!user.otp || !user.otp.verified || user.otp.purpose !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'OTP verification required'
      });
    }

    // Update password and clear OTP
    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Resend password change OTP
export const resendPasswordChangeOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if there's an existing password change OTP
    if (!user.otp || user.otp.purpose !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'No password change request found. Please request OTP first.'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.otp = {
      code: otp,
      expiresAt: otpExpiresAt,
      purpose: 'password-reset'
    };
    await user.save();

    // Send OTP email
    try {
      await sendOTP(email, otp, 'password change');
      console.log(`✅ Password change OTP resent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to resend password change OTP:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP. Please try again.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP resent to your email',
      expiresIn: 300 // 5 minutes in seconds
    });
  } catch (error) {
    next(error);
  }
};

