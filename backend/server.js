import express from "express";
import mongoose, { set } from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import "./passport.js";
// Import route files
import {
  authRoutes,
  brandRoutes,
  productRoutes,
  orderRoutes,
  userRoutes,
  discountCodeRoutes,
  commentRoutes,
  addressRoutes,
  ratingRoutes,
  uploadRoutes,
  dashboardRoutes
} from "#tps-routes";
import { setUpConsoleLogging, setUpWriteStream, uploadConfig } from "#utils";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
// app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Setup logging for each route
setUpConsoleLogging(app);
setUpWriteStream(app, 'access');

// Cho phép frontend truy cập API
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // để preflight cũng có cùng header

// Passport middleware
app.use(passport.initialize());

// Serve optimized uploads as static assets
app.use("/uploads", express.static(uploadConfig.directories.root));

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/discount_codes", discountCodeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.log('có lỗi')
  res.status(statusCode).json({
    ec: statusCode,
    em: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});


// Default route
app.get("/", (req, res) => {
  res.json({ message: "Ecommerce API is running!" });
});

// Connect to database and start server
const PORT = process.env.PORT;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});