import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../mail.js";


const generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId, purpose: "reset" }, 
    process.env.RESET_PASSWORD_SECRET, 
    { expiresIn: "1d" } // 1 day for testing
  );
};

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    // console.log(email);
    // console.log("EMAIL_USER in route:", process.env.EMAIL_USER);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // Tìm user
    const user = await User.findOne({ email: email });
    // console.log(user);
    // console.log("Auth info trước khi gửi:", transporter.options.auth);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Tạo token reset
    const resetToken = generateResetToken(user._id);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // console.log("Token sinh ra:", resetToken);
    // Gửi email
    await transporter.sendMail({
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password",
      text: `You requested a password reset. Your reset link is valid for 2 minutes.
Click here to reset your password: ${resetLink}`,
      html: `
        <p>You requested a password reset.</p>
        <p>Your reset link is valid for 2 minutes.</p>
        <p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>
      `,
    });

    res.json({ message: "Reset email sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const handleResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }
    // console.log("Body nhận được:", req.body);
    // Verify the reset token
    // try {
    // const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    // } catch (err) {
    //   console.log(err);
    //   return res.status(400).json({ message: "Invalid or expired token" });
    // }

    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
    if (!decoded || decoded.purpose !== "reset") {
      return res.status(400).json({ message: "Invalid token" });
    }
    // console.log(token)
    // console.log(newPassword)

    // Find the user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const handleRegister = async (req, res) => {
    try {
      const { username, email, password, Addresses } = req.body;

      // Check if user exists
      // const userExists = await User.findOne({ email });
      // if (userExists) {
      //   return res.status(400).json({ message: "User already exists. Please try a different email." });
      // }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        Addresses
      });

      if (user) {
        res.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          isManager: user.isManager,
          token: generateToken(user._id), // trả về token khi đăng ký thành công
        });
      } else {
        res.status(400).json({ message: "Invalid user data" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

const handleLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      // Check for user
      const user = await User.findOne({ email : email });

      if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          isManager: user.isManager,
          token: generateToken(user._id), // trả về token khi đăng nhập thành công
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

export { handleRegister, handleLogin, handleResetPassword, resetPassword };