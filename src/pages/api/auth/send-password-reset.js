import nodemailer from "nodemailer";
import { resetPassword } from "@/lib/auth-firebase";
import { auth } from "@/lib/firebase";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  try {
    const link = await resetPassword(auth, email);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Password Reset Request - IMMIZA',
      html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
  <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
    <h1 style="color: #b76e79; margin: 0;">IMMIZA</h1>
    <p style="margin: 0; color: #555;">VISA Immigration Service</p>
  </div>
  <div style="padding: 20px;">
    <h2 style="color: #333;">Password Reset Request</h2>
    <p>Hello ${email},</p>
    <p>We received a request to reset the password for your IMMIZA account. You can reset your password by clicking the button below:</p>
    <div style="text-align: center; margin: 20px 0;">
      <a href="${link}" style="background-color: #b76e79; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Your Password</a>
    </div>
    <p>If you did not request a password reset, please ignore this email or contact our support if you have any concerns.</p>
    <p>This password reset link is valid for a limited time.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #888;">If you're having trouble clicking the password reset button, copy and paste the URL below into your web browser:</p>
    <p style="font-size: 12px; color: #888; word-break: break-all;">${link}</p>
  </div>
  <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; color: #888;">
    <p>&copy; ${new Date().getFullYear()} IMMIZA. All rights reserved.</p>
  </div>
</div>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(200).json({ success: true, message: 'If your email is registered, you will receive a password reset link.' });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ success: false, message: 'The email address is not valid.' });
    } else if (error.code?.startsWith('auth/')) {
      return res.status(400).json({ success: false, message: 'Authentication error. Please try again later.' });
    }
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({ success: false, message: 'Unable to connect to email server. Please try again later.' });
    }
    res.status(500).json({ success: false, message: 'Error sending password reset email. Please try again later.' });
  }
} 