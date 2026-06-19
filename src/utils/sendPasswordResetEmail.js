import transport from '../config/mailer.js';

// Function to send password reset email
const sendPasswordResetEmail = async (email, token) => {
  // Construct the password reset URL
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  //Email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request a password reset, ignore this email.</p>
    `
  };

  // Send the email 
  await transport.sendMail(mailOptions);
}

export default sendPasswordResetEmail;