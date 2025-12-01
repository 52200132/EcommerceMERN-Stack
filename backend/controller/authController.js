import { google } from "googleapis";

import CryptoJS from "crypto-js";
import crypto from "crypto";
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
      from: `${process.env.APP_NAME} <${process.env.EMAIL_USER}>`,
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
    const { username, email, Addresses } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      await transporter.sendMail({
        from: `${process.env.APP_NAME} <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Email đã tạo tài khoản",
        text: `Xin chào ${userExists.email},
          Hệ thống ghi nhận rằng email của bạn đã được sử dụng để tạo tài khoản nhằm hỗ trợ lưu trữ và quản lý đơn hàng.
          Dưới đây là thông tin tài khoản của bạn:

          - Username: ${userExists.username}
          - Email: ${userExists.email}
          - Password mặc định: ${process.env.USER_PASSWORD_DEFAULT}

          Vui lòng đăng nhập và đổi mật khẩu ngay sau khi truy cập để đảm bảo an toàn bảo mật.

          Nếu bạn không phải là người thực hiện hành động này, vui lòng liên hệ ngay với đội ngũ hỗ trợ để được kiểm tra và xử lý.

          Trân trọng,
          ${process.env.APP_NAME} Team
          `,
        html: `<div style="width:100%; background:#f5f5f5; padding:20px 0; font-family:Arial, sans-serif;">
          <div style="max-width:600px; background:#ffffff; margin:auto; padding:25px; border-radius:8px; box-shadow:0 0 8px rgba(0,0,0,0.05);">

            <h2 style="text-align:center; color:#333; margin-bottom:5px;">Thông báo tạo tài khoản tự động</h2>
            <p style="text-align:center; margin:0; color:#666;">Email của bạn đã được sử dụng để tạo tài khoản.</p>

            <p style="margin-top:25px;">
              Xin chào <strong>${userExists.username || userExists.email}</strong>,
            </p>

            <p>
              Hệ thống đã tự động tạo tài khoản cho bạn nhằm lưu trữ thông tin đơn hàng và hỗ trợ quá trình mua sắm.
              Dưới đây là thông tin tài khoản:
            </p>

            <h3 style="margin-top:25px; color:#333;">👤 Thông tin tài khoản</h3>

            <table width="100%" style="border-collapse:collapse; margin-top:10px;">
              <tr>
                <td style="padding:8px 0; color:#555;">Email:</td>
                <td style="padding:8px 0; text-align:right; font-weight:bold;">${userExists.email}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#555;">Mật khẩu mặc định:</td>
                <td style="padding:8px 0; text-align:right; font-weight:bold; color:#d9534f;">
                  ${process.env.USER_PASSWORD_DEFAULT}
                </td>
              </tr>
            </table>

            <p style="margin-top:20px;">
              Vui lòng đăng nhập và <strong>đổi mật khẩu ngay</strong> để đảm bảo an toàn thông tin.
            </p>

            <p style="margin-top:15px;">
              Nếu bạn không phải là người thực hiện hành động này, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi để được kiểm tra và xử lý ngay.
            </p>

            <p style="margin-top:30px; text-align:center;">
              <b>Trân trọng,<br>${process.env.APP_NAME} Team</b>
            </p>

          </div>
        </div>
        `,
      });
      return res.status(400).json({ ec: 400, em: "Email đã tạo tài khoản, xin hãy đăng nhập. Hoặc nếu bạn chưa tạo, hãy check email của chúng tôi." });
    }
    else {
      // Create ramdom password
      const randomPassword = crypto.randomBytes(4).toString("hex");
      console.log(randomPassword);
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);
      // Create user temp (no set password)
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        Addresses
      });

      // Gửi email thông báo thông tin đăng ký tài khoản
      await transporter.sendMail({
        from: `${process.env.APP_NAME} <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Đăng ký tài khoản thành công",
        text: `Xin chào ${user.username},
          Chúc mừng bạn đã đăng ký tài khoản thành công tại hệ thống của chúng tôi!
          Thông tin tài khoản:
          - Email: ${user.email}
          - Mật khẩu tạm thời: ${randomPassword}
          Vui lòng đăng nhập và đổi mật khẩu ngay để đảm bảo an toàn bảo mật.
          Nếu bạn không thực hiện đăng ký này, vui lòng liên hệ ngay với chúng tôi để được hỗ trợ.
          Trân trọng,
          ${process.env.APP_NAME} Team
          `,
        html: `<div style="width:100%; background:#f5f5f5; padding:20px 0; font-family:Arial, sans-serif;">
          <div style="max-width:600px; background:#ffffff; margin:auto; padding:25px; border-radius:8px; box-shadow:0 0 8px rgba(0,0,0,0.05);">

            <h2 style="text-align:center; color:#333; margin-bottom:5px;">Đăng ký tài khoản thành công</h2>
            <p style="text-align:center; margin:0; color:#666;">Chào mừng bạn đến với hệ thống của chúng tôi!</p>

            <p style="margin-top:25px;">
              Xin chào <strong>${user.username}</strong>,
            </p>

            <p>Cảm ơn bạn đã tạo tài khoản tại hệ thống của chúng tôi. Dưới đây là thông tin tài khoản của bạn:</p>

            <!-- User Info -->
            <h3 style="margin-top:25px; color:#333;">👤 Thông tin người dùng</h3>
            <table width="100%" style="border-collapse:collapse; margin-top:10px;">
              <tr>
                <td style="padding:8px 0; color:#555;">Email:</td>
                <td style="padding:8px 0; text-align:right; font-weight:bold;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding:8px 0; color:#555;">Mật khẩu tạm thời:</td>
                <td style="padding:8px 0; text-align:right; font-weight:bold; color:#d9534f;">
                  ${randomPassword}
                </td>
              </tr>
            </table>

            <p style="margin-top:20px;">
              Vui lòng đăng nhập và <strong>đổi mật khẩu ngay</strong> để đảm bảo an toàn tài khoản.
            </p>

            <p style="margin-top:20px;">
              Nếu bạn không thực hiện đăng ký này, vui lòng liên hệ ngay với đội ngũ hỗ trợ của chúng tôi.
            </p>

            <p style="margin-top:30px; text-align:center;">
              <b>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ!</b>
            </p>

          </div>
        </div>
        `,
      });
      return res.status(201).json({
        ec: 0,
        em: 'Đăng ký user thành công (no set password)',
        dt: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isManager: user.isManager,
          token: generateToken(user._id), // trả về token khi đăng ký thành công
        }
      });
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
          resetPasswordFirstTime: user.resetPasswordFirstTime,
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
      const { username, email, isManager, _id, token, image, resetPasswordFirstTime } = req.user;
      const basicInfo = { username, email, isManager, _id, token, image };
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

export { handleRegister, handleLogin, handleResetPassword, resetPassword };