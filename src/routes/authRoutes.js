import express from 'express';
import { signIn, signUp, verifyEmail,resendVerification, forgotPassword, resetPassword, refresh, logout, profile } from '../controllers/authControllers.js'
import verifyToken from '../middleware/verifyToken.js'; // Importing the verifyToken middleware to protect routes
import { registrationSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validator/authValidator.js'; // Importing the registration and login schemas for validation
import validate from '../middleware/validate.js'; // Importing the validate middleware to validate request body
const router = express.Router()

router.post("/register", validate(registrationSchema), signUp );
router.post("/login", validate(loginSchema), signIn);
router.get("/verify", verifyEmail); // This route will handle the email verification process when the user clicks on the verification link sent to their email.
router.get("/profile", verifyToken, profile); // This route is protected by the verifyToken middleware,
router.post('/resend-verification', resendVerification);
//  which means that only authenticated users can access it. The profile controller will handle the logic for retrieving and returning the user's profile information based on the decoded token data.
router.post('/forgot-password', validate(forgotPasswordSchema),  forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router  