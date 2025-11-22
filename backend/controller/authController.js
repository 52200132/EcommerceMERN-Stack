import { google } from "googleapis";

import CryptoJS from "crypto-js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import transporter from "../mail.js";
import User from "../models/User.js";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.BASE_URL + "/auth/google-link-account/callback"
);

const oauth2ClientLogin = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.BASE_URL + "/auth/google-login/callback"
);

const getGoogleUserInfo = async (tokens) => {
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });
  const { data } = await oauth2.userinfo.get();
  return data;
};

const generateResetToken = (userId) => {
  return jwt.sign(
    { id: userId, purpose: "reset" },
    process.env.RESET_PASSWORD_SECRET,
    { expiresIn: "1d" } // 1 day for testing
  );
};

const generateToken = (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
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

const handleRegister = async (req, res) => {
  try {
    const { username, email, password, Addresses } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ ec: 400, em: "Email đã được sử dụng" });
    }

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
        ec: 0,
        em: 'Đăng ký thành công',
        dt: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isManager: user.isManager,
          token: generateToken(user._id), // trả về token khi đăng ký thành công
        }
      });
    } else {
      res.status(400).json({ ec: 400, em: "Dữ liệu đăng ký không hợp lệ" });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email: email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        ec: 0,
        em: 'Đăng nhập thành công',
        dt: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isManager: user.isManager,
          token: generateToken(user._id), // trả về token khi đăng nhập thành công
        }
      });
    } else {
      res.status(401).json({ ec: 401, em: "Email hoặc mật khẩu không đúng" });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const getBasicProfile = async (req, res) => {
  try {
    if (req.user) {
      const { username, email, isManager, _id, token } = req.user;
      const basicInfo = { username, email, isManager, _id, token };
      res.status(200).json({
        ec: 0,
        em: 'Lấy thông tin thành công',
        dt: basicInfo
      });
    } else {
      res.status(404).json({ ec: 404, em: "Không tìm thấy người dùng" });
    }
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

// Function to handle Google account 
export const handleLinkGoogleAccount = async (req, res) => {
  const { origin, feRedirectUri } = req.query;
  try {
    // mã hóa state
    const payload = { token: req.user.token, feRedirectUri, origin };
    const encryptedState = CryptoJS.AES.encrypt(JSON.stringify(payload), process.env.JWT_SECRET).toString();
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // để có refresh token
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      state: encryptedState,
      prompt: 'consent',
    });
    res.status(200).json({
      ec: 0,
      em: 'Lấy URL liên kết thành công',
      dt: { urlRedirect: url }
    });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
};

export const handleLinkGoogleAccountCallback = async (req, res) => {
  /**
   * @param {string} code - Mã code trả về từ Google
   * @param {string} state - Mã hóa JWT token của user
   * @param {string} feRedirectUri - URL FE để redirect sau khi liên kết thành công
   * @param {string} origin - Origin của FE để postMessage về
   */
  const { code, state } = req.query;

  try {
    const decryptedState = CryptoJS.AES.decrypt(state, process.env.JWT_SECRET).toString(CryptoJS.enc.Utf8);
    const payload = JSON.parse(decryptedState);
    const { token, feRedirectUri, origin } = payload;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken._id);
    if (!user) {
      return res.status(404).send({ ec: 404, em: 'Người dùng không tồn tại' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });
    const { data } = await oauth2.userinfo.get();

    const exists = user.Linked_accounts.find(
      (acc) => acc.provider === 'google' && acc.provider_id === data.id
    );
    if (!exists) {
      user.Linked_accounts.push({
        provider: 'google',
        provider_id: data.id,
        linked_at: new Date(),
        last_login: new Date(),
      });
      await user.save();
    }
    // data chứa info như name, email, picture
    // console.log("User info:", data);
    // res.send(`Welcome ${data.name}!`);
    res.status(200).send(`
      <h2>
        Liên kết tài khoản Google thành công, lần sau bạn có thể đăng nhập bằng tài khoản Google.<br>
        Hãy trải nghiệm và tiếp tục mua sắm bạn nhé.
      </h2>
      <script>
        window.opener.postMessage(
          ${JSON.stringify({ ec: 0, em: 'Liên kết tài khoản Google thành công', dt: { feRedirectUri } })},
          "${origin}"
        );
      </script>
    `)
  } catch (err) {
    console.error("Error in Google link callback:", err);
    res.status(500).send(`
      <h2>Có lỗi xảy ra khi liên kết tài khoản Google. Vui lòng thử lại sau!</h2>
      <script>
        window.opener.postMessage(
          ${JSON.stringify({ ec: 500, em: err.message })},
          "${origin}"
        );
      </script>
    `);
  }
}

export const handleGoogleLogin = async (req, res) => {
  const { origin } = req.query;
  try {
    const state = CryptoJS.AES.encrypt(origin, process.env.JWT_SECRET).toString();
    const url = oauth2ClientLogin.generateAuthUrl({
      prompt: 'consent',
      scope: ['profile'],
      state
    });
    res.status(200).json({
      ec: 0,
      em: 'Lấy URL liên kết thành công',
      dt: { urlRedirect: url }
    });
  } catch (error) {
    res.status(500).json({ ec: 500, em: error.message });
  }
}

export const handleGoogleLoginCallback = async (req, res) => {
  const { code, state } = req.query;

  try {
    const origin = CryptoJS.AES.decrypt(state, process.env.JWT_SECRET).toString(CryptoJS.enc.Utf8);
    const { tokens } = await oauth2ClientLogin.getToken(code);

    const data = await getGoogleUserInfo(tokens);

    // Tìm user có linked account với Google ID này
    let user = await User.findOne({
      Linked_accounts: {
        $elemMatch: {
          provider: 'google',
          provider_id: data.id
        }
      }
    });

    if (!user) {
      return res.status(404).send(`
        <script>
          window.opener.postMessage(
            ${JSON.stringify({ ec: 404, em: "Tài khoản Google chưa được liên kết", event_type: "GOOGLE_LOGIN" })},
            "${origin}"
          );
        </script>
      `);
    }

    // Cập nhật last_login
    const acc = user.Linked_accounts.find(acc => acc.provider === 'google');
    if (acc) {
      acc.last_login = new Date();
      await user.save();
    }
    const basicInfo = {
      _id: user._id,
      username: user.username,
      email: user.email,
      isManager: user.isManager,
      token: generateToken(user._id),
    };

    res.status(200).send(`
      <script>
        window.opener.postMessage(${JSON.stringify({ ec: 0, em: "Đăng nhập thành công", dt: basicInfo, event_type: "GOOGLE_LOGIN" })},
        "${origin}"
        );
      </script>
    `);
  } catch (err) {
    console.error("Error in Google login callback:", err);
    res.status(500).send(`
      <script>
        window.opener.postMessage(${JSON.stringify({ ec: 500, em: err.message, event_type: "GOOGLE_LOGIN" })},
        "${origin}"
        );
      </script>
    `);
  }
}
// TODO: Sau khi liên kết tài khoản GG, lấy thêm thông tin profile từ GG để cập nhật vào user (ảnh đại diện)

export { handleRegister, handleLogin, handleResetPassword, resetPassword };