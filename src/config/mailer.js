import nodemailer from 'nodemailer';

// Create a transpoter using your email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other email services like 'yahoo', 'outlook', etc.
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

export default transporter;