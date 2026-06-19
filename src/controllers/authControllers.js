import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendVerificationEmail from '../utils/sendVerificationEmail.js';
import sendPasswordResetEmail from '../utils/sendPasswordResetEmail.js';
import crypto from 'crypto';

const signUp = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, verificationToken, tokenExpiry },
    });

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      return res.status(201).json({
        message: 'Account created but verification email failed. Please use the resend verification option.',
        id: newUser.id,
        email: newUser.email,
      });
    }

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      id: newUser.id,
      email: newUser.email,
    });

  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is missing' });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification link. Please request a new one.' });
    }

    if (user.tokenExpiry < new Date()) {
      const newToken = crypto.randomBytes(32).toString('hex');
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken: newToken, tokenExpiry: newExpiry }
      });

      await sendVerificationEmail(user.email, newToken);

      return res.status(400).json({
        message: 'Verification link expired. A new one has been sent to your email.'
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        tokenExpiry: null,
      }
    });

    res.status(200).json({ message: 'Email verified successfully. You can now login.' });

  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken, tokenExpiry }
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      message: 'Verification email sent. Please check your inbox.'
    });

  } catch (error) {
    next(error);
  }
};

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Email not verified. Please check your inbox for the verification link.'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Controller will generate two tokens: access token and refresh token. The access token will be used to access protected routes and the refresh token will be used to generate a new access token when the current one expires. Both tokens will be sent back to the client in the response.

    // Generate access token - expires in 15 minutes
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )
    // Generate refresh token - expires in 7 days
    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    // Send both tokens back to the client  

    res.status(200).json({ accessToken, refreshToken });

  } catch (error) {
    next(error);
  }
};

// Refresh token - issue new access token 
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    // Check if refresh token is provided
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is missing' });
    }
    // verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    // find the user and check their stored refresh token matches 
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // generate a new access token 
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

// Logout - Invalidate refresh token 
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    // Check if refresh token is provided
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is missing' });
    }
    // Find the user with the provided refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken }
    });

    if (!user) {    
      return res.status(400).json({ message: 'Invalid refresh token' });  
    }

    // Clear the refresh token from database 
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null }
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const profile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, isVerified: true, createdAt: true },
    });

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

// Forgot Password 
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    // Check if the user exists 
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' });
    }

    // Generate a password reset token - expires in 1 hour
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    // update the user with the reset token and expiry
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken, resetTokenExpiry }
    })

    // Send the password reset email
    await sendPasswordResetEmail(email, resetPasswordToken);
    // Send a response back to the client
    res.status(200).json({
      message: 'Password reset email sent. Please check your inbox.'
    })
  } 
  catch (error) {
    next(error);
  }
};

// Password Reset
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { newPassword, confirmNewPassword } = req.body;
    
    // check if the token is provided 
    if (!token) {
      return res.status(400).json({ message: 'Password reset token is missing' });
    }

    // Check password match 
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // find the user with the token 
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    if (user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: 'Password reset token has expired. Please request a new one.' });
    }

    // Hash the new password 
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetTokenExpiry: null
      }
    });
    // send response back to the client
    res.status(200).json({ message: 'Password reset successful. You can now login with your new password.' });
  } 
  catch (error) {
    next(error);
  } 
}

export { signUp, signIn, verifyEmail, forgotPassword, resetPassword, resendVerification, profile, logout, refresh };