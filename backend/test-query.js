import "dotenv/config.js";
import Order from "./models/Order.js";
import mongoose from "mongoose";

console.log(process.env.MONGODB_URI);
try {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const result = await Order.aggregate([
    {
      $match: {
        // user_id: "690bbb86e51e05d6e4a2c61f",
        payment_status: { $in: ['paid', 'pending'] }
      }
    },
    {
      $group: {
        _id: "$payment_status",
        points_used: { $sum: "$points_used" },
        loyalty_points_earned: {
          $sum: {
            $cond: {
              if: { $eq: ["$payment_status", "paid"] }, // Điều kiện: Nếu status = 'paid'
              then: "$loyalty_points_earned",                        // THÌ: cộng giá trị của trường amount
              else: 0                                 // NGƯỢC LẠI: cộng 0
            }
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: -1,
        user_id: 1,
        payment_status: "$_id",
        points_used: 1,
        loyalty_points_earned: 1,
        count: 1
      }
    }
  ]);
  console.log(result);
  await conn.disconnect();
} catch (error) {
  console.error("Database connection error:", error.message);
}