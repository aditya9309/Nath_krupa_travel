import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

export const sendOTP = async (email, otp, purpose = 'registration') => {
  const subjectMap = {
    'registration': 'Verification Code - Nath Krupa Tours & Travels',
    'password-reset': 'Password Reset Code - Nath Krupa Tours & Travels',
    'password-change': 'Password Change Code - Nath Krupa Tours & Travels'
  };

  const messageMap = {
    'registration': 'Your verification code for completing registration is:',
    'password-reset': 'Your verification code for password reset is:',
    'password-change': 'Your verification code for password change is:'
  };

  const expiryMap = {
    'registration': '10 minutes',
    'password-reset': '5 minutes',
    'password-change': '5 minutes'
  };

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subjectMap[purpose] || subjectMap['registration'],
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Nath Krupa Tours & Travels</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">${purpose === 'registration' ? 'Email Verification' : 'Security Code'}</h2>
                    <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                      ${messageMap[purpose] || messageMap['registration']}
                    </p>
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0;">
                      ${otp}
                    </div>
                    <p style="color: #6b7280; margin: 20px 0 0 0; font-size: 14px; line-height: 1.6;">
                      This verification code will expire in ${expiryMap[purpose] || expiryMap['registration']}. If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                      © ${new Date().getFullYear()} Nath Krupa Tours & Travels. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send OTP email');
  }
};

export const sendAccountApprovalEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Account Approved - Nath Krupa Travels',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Nath Krupa Travels!</h2>
        <p>Dear ${name},</p>
        <p>Your account has been approved by the administrator. You can now login and start booking your travel packages.</p>
        <p>Thank you for choosing Nath Krupa Travels!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send approval email');
  }
};

export const sendBookingConfirmation = async (email, name, bookingDetails) => {
  const bookingDate = new Date(bookingDetails.journeyDate);
  const bookingTime = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Booking Confirmation - Nath Krupa Tours & Travels',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Booking Confirmed! ✅</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Dear ${name},</h2>
                    <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                      Your booking has been successfully confirmed. We're excited to be part of your travel journey!
                    </p>
                    
                    <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #2563eb;">
                      <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Booking Details</h3>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Booking ID:</strong></td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${bookingDetails.bookingId || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Package Name:</strong></td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${bookingDetails.packageName || 'Custom Trip'}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Source:</strong></td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${bookingDetails.source}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Destination:</strong></td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${bookingDetails.destination}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Journey Date:</strong></td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${bookingDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Booking Date & Time:</strong></td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${bookingTime}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Number of Passengers:</strong></td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${bookingDetails.passengers.length}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Total Amount:</strong></td>
                          <td style="padding: 8px 0; color: #2563eb; font-size: 18px; font-weight: 700;">₹${bookingDetails.totalAmount.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px;"><strong>Contact:</strong></td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px;">${bookingDetails.contactInfo || 'N/A'}</td>
                        </tr>
                      </table>
                    </div>

                    <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 30px 0;">
                      <p style="color: #1e40af; margin: 0; font-size: 16px; font-weight: 600;">
                        📞 Need Help? Contact our support team anytime!
                      </p>
                    </div>

                    <p style="color: #4b5563; margin: 30px 0 0 0; font-size: 16px; line-height: 1.6;">
                      Thank you for choosing Nath Krupa Tours & Travels. We look forward to making your journey memorable!
                    </p>
                    <p style="color: #4b5563; margin: 20px 0 0 0; font-size: 16px; line-height: 1.6;">
                      Happy Travels!<br>
                      <strong>The Nath Krupa Tours & Travels Team</strong>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                      © ${new Date().getFullYear()} Nath Krupa Tours & Travels. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    throw new Error('Failed to send booking confirmation email');
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Nath Krupa Tours & Travels 🎒',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600;">Welcome to Nath Krupa Tours & Travels 🎒</h1>
                  </td>
                </tr>
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Dear ${name},</h2>
                    <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                      Your account has been successfully created!
                    </p>
                    <p style="color: #4b5563; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                      We're excited to be part of your travel journey! You can now explore our amazing tour packages, book your dream trips, and create unforgettable memories with us.
                    </p>
                    <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 30px 0;">
                      <p style="color: #1e40af; margin: 0; font-size: 16px; font-weight: 600;">
                        🎉 Start exploring our destinations and book your next adventure today!
                      </p>
                    </div>
                    <p style="color: #4b5563; margin: 30px 0 0 0; font-size: 16px; line-height: 1.6;">
                      If you have any questions or need assistance, feel free to contact our support team. We're here to help!
                    </p>
                    <p style="color: #4b5563; margin: 20px 0 0 0; font-size: 16px; line-height: 1.6;">
                      Happy Travels!<br>
                      <strong>The Nath Krupa Tours & Travels Team</strong>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                      © ${new Date().getFullYear()} Nath Krupa Tours & Travels. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send welcome email');
  }
};

export const sendTripRequestUpdate = async (email, name, status, adminNotes = '') => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Custom Trip Request ${status.charAt(0).toUpperCase() + status.slice(1)} - Nath Krupa Travels`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Trip Request Update</h2>
        <p>Dear ${name},</p>
        <p>Your custom trip request has been <strong>${status}</strong>.</p>
        ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
        <p>Thank you for choosing Nath Krupa Travels!</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send trip request update email');
  }
};
