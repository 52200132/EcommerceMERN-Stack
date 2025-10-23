import express from "express";
import { handleRegister, handleLogin, resetPassword, handleResetPassword} from "../controller/authController.js";
import { protect } from "../middleware/auth.js";
import passport from "passport";
const router = express.Router();

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
router.get("/google", protect, passport.authenticate("google-link", { scope: ["profile", "email"] }));
router.get("/google/callback",
    protect,
    passport.authenticate("google-link", { session: false }),
    (req, res) => res.json({ message: "Google linked successfully", user: req.user })
);

// Facebook link
router.get("/facebook", protect, passport.authenticate("facebook-link", { scope: ["email"] }));
router.get("/facebook/callback",
    protect,
    passport.authenticate("facebook-link", { session: false }),
    (req, res) => res.json({ message: "Facebook linked successfully", user: req.user })
);

// Google login
router.get("/google", passport.authenticate("google-login", { scope: ["profile", "email"] }));
router.get("/google/callback",
    passport.authenticate("google-login", { session: false }),
    (req, res) => {
        if (!req.user)
            return res.status(401).json({ message: "Login failed" });
        const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ message: "Google login success", token, user: req.user });
    }
);

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