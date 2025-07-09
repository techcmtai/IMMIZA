import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import nodemailer from "nodemailer";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  try {
    // Check if we have the service account key
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Parse the service account key JSON
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      
      initializeApp({
        credential: cert(serviceAccount)
      });
      console.log('Firebase Admin SDK initialized successfully with service account');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      // Initialize with individual credentials
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle the private key correctly - it might be stored with escaped newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin SDK initialized successfully with individual credentials');
    } else {
      console.error('Missing Firebase Admin SDK credentials in environment variables');
      // Initialize with application default credentials or config from env
      initializeApp();
      console.log('Firebase Admin SDK initialized with application default credentials');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const user = await getAuth().getUserByEmail(email);
    const link = await getAuth().generatePasswordResetLink(email);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true', // Convert string to boolean
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
    <p>Hello ${user.displayName || ''},</p>
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
    console.error('Error sending password reset email:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/user-not-found') {
      // We don't want to reveal that the user doesn't exist for security reasons
      return res.status(200).json({ 
        success: true, 
        message: 'If your email is registered, you will receive a password reset link.' 
      });
    } else if (error.code === 'auth/invalid-email') {
      return res.status(400).json({ 
        success: false, 
        message: 'The email address is not valid.' 
      });
    } else if (error.code?.startsWith('auth/')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Authentication error. Please try again later.' 
      });
    }
    
    // Handle SMTP/email sending errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return res.status(500).json({ 
        success: false, 
        message: 'Unable to connect to email server. Please try again later.' 
      });
    }
    
    // Generic error
    res.status(500).json({ 
      success: false, 
      message: 'Error sending password reset email. Please try again later.' 
    });
  }
} 