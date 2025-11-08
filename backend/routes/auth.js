import passport from "passport";
import express from "express";

import { handleRegister, handleLogin, resetPassword, handleResetPassword, getBasicProfile, handleLinkGoogleAccount, handleLinkGoogleAccountCallback, handleGoogleLogin, handleGoogleLoginCallback } from "../controller/authController.js";
import { cacheRoute } from "#middleware/cache.js";
import { protect } from "../middleware/auth.js";



const router = express.Router();

router.get('/me', protect, cacheRoute('30 minutes', 'userProfile'), getBasicProfile);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", handleRegister); // đã check ok

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post("/login", handleLogin); // đã check ok

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post("/reset-password", resetPassword); // đã check ok

// @desc    Reset password
// @route   POST /api/auth/reset-password/confirm
// @access  Public
router.post("/reset-password/confirm", handleResetPassword); // đã check ok

// Google link
router.get("/google-link-account", protect, handleLinkGoogleAccount);
router.get("/google-link-account/callback", handleLinkGoogleAccountCallback);

// Facebook link
router.get("/facebook", protect, passport.authenticate("facebook-link", { scope: ["email"] }));
router.get("/facebook/callback",
  protect,
  passport.authenticate("facebook-link", { session: false }),
  (req, res) => res.json({ message: "Facebook linked successfully", user: req.user })
);

// Google login
router.get("/google-login", handleGoogleLogin);
router.get("/google-login/callback", handleGoogleLoginCallback);

// Facebook login
router.get("/facebook", passport.authenticate("facebook-login", { scope: ["email"] }));
router.get("/facebook/callback",
  passport.authenticate("facebook-login", { session: false }),
  (req, res) => {
    if (!req.user) return res.status(401).json({ message: "Login failed" });
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Facebook login success", token, user: req.user });
  }
);

export default router;