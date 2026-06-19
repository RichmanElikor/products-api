import transporter from '../config/mailer.js';

// Function to send verification email
const sendVerificationEmail = async (email, token) => {
  // Construct the verification URL
  const verificationUrl = `${process.env.CLIENT_URL}/api/auth/verify?token=${token}`;
  // Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email, 
    subject: 'Email Verification',
    html: `
      <h2>Welcome!</h2>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
      <p>If you did not create an account, ignore this email.</p>
      `
  };

  // Send the email
  await transporter.sendMail(mailOptions);
}

export default sendVerificationEmail;
