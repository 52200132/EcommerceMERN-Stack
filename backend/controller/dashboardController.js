import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import e from "express";

// Lọc theo thời gian
const buildTimeFilter = ({ annual, quarterly, monthly, weekly, startDate, endDate }) => {
  const today = new Date();
  let query = {};
  let createdAtFilter = {};

  if (startDate && endDate) {
    createdAtFilter.$gte = new Date(startDate);
    createdAtFilter.$lt = new Date(endDate);
  } else {
    const year = Number(annual) || today.getFullYear();
    let startOfPeriod = new Date(year, 0, 1);
    let endOfPeriod = new Date(year + 1, 0, 1);

    if (quarterly) {
      const q = Number(quarterly); // 1..4
      const startMonth = (q - 1) * 3;
      startOfPeriod = new Date(year, startMonth, 1);
      endOfPeriod = new Date(year, startMonth + 3, 1);
    }

    if (monthly) {
      const month = Number(monthly) - 1; // 0..11
      startOfPeriod = new Date(year, month, 1);
      endOfPeriod = new Date(year, month + 1, 1);
    }

    if (weekly && monthly) {
      const month = Number(monthly) - 1;
      const week = Number(weekly); // 1..5
      const startOfMonth = new Date(year, month, 1);
      startOfPeriod = new Date(startOfMonth);
      startOfPeriod.setDate(1 + (week - 1) * 7);

      endOfPeriod = new Date(startOfPeriod);
      endOfPeriod.setDate(startOfPeriod.getDate() + 7);

      const endOfMonth = new Date(year, month + 1, 1);
      endOfPeriod = endOfPeriod < endOfMonth ? endOfPeriod : endOfMonth;
    }

    createdAtFilter.$gte = startOfPeriod;
    createdAtFilter.$lt = endOfPeriod;
  }

  if (Object.keys(createdAtFilter).length > 0) {
    query.createdAt = createdAtFilter;
  }
  return query;
};

// Nhóm timeline
function getTimelineGrouping({ annual, quarterly, monthly, weekly, startDate, endDate }) {
  if ((weekly && monthly) || (startDate && endDate)) return { _id: { day: { $dayOfMonth: "$createdAt" } }, sort: { day: 1 } };
  if (monthly) return { _id: { week: { $ceil: { $divide: [{ $dayOfMonth: "$createdAt" }, 7] } } }, sort: { week: 1 } };
  if (quarterly || annual) return { _id: { month: { $month: "$createdAt" } }, sort: { month: 1 } };
  return { _id: { month: { $month: "$createdAt" } }, sort: { month: 1 } };
}

// Skeleton timeline
function buildTimelineSkeleton({ annual, quarterly, monthly, weekly, startDate, endDate }, timelineRaw, year, month, week) {
  let timeline = [];

  if (weekly && monthly) {
    const startOfMonth = new Date(year, month - 1, 1);
    const startOfWeek = new Date(startOfMonth);
    startOfWeek.setDate(1 + (week - 1) * 7);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const lastDay = endOfWeek < new Date(year, month, 1) ? endOfWeek.getDate() : new Date(year, month, 0).getDate();

    for (let d = startOfWeek.getDate(); d < lastDay; d++) {
      const item = timelineRaw.find(t => t.day === d);
      timeline.push(item || { day: d, total_revenue: 0, total_profit: 0, total_products_sold: 0 });
    }
  } else if (monthly) {
    for (let w = 1; w <= 4; w++) {
      const item = timelineRaw.find(t => t.week === w);
      timeline.push(item || { week: w, total_revenue: 0, total_profit: 0, total_products_sold: 0 });
    }
  } else if (quarterly) {
    const startMonth = (Number(quarterly) - 1) * 3 + 1;
    for (let m = startMonth; m < startMonth + 3; m++) {
      const item = timelineRaw.find(t => t.month === m);
      timeline.push(item || { month: m, total_revenue: 0, total_profit: 0, total_products_sold: 0 });
    }
  } else if (annual) {
    for (let m = 1; m <= 12; m++) {
      const item = timelineRaw.find(t => t.month === m);
      timeline.push(item || { month: m, total_revenue: 0, total_profit: 0, total_products_sold: 0 });
    }
  } else if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = start.getDate(); d <= end.getDate(); d++) {
      const item = timelineRaw.find(t => t.day === d);
      timeline.push(item || { day: d, total_revenue: 0, total_profit: 0, total_products_sold: 0 });
    }
  }

  return timeline;
}

// Controller

// Bảng điều khiển Nâng cao: Hiển thị số liệu thống kê và biểu đồ liên quan cho thông tin chính theo các khoảng thời gian cụ thể. Theo mặc định, dữ
// liệu được hiển thị hàng năm, nhưng người dùng có thể linh hoạt điều chỉnh chế độ xem theo quý, hàng tháng, hàng tuần hoặc dựa trên ngày bắt đầu
// và kết thúc đã xác định. Đối với mỗi khung thời gian này, việc theo dõi số lượng đơn hàng đã bán, tổng doanh thu và lợi nhuận chung là rất quan
// trọng. Ngoài ra, cần có các biểu đồ so sánh thể hiện doanh thu, lợi nhuận, số lượng sản phẩm và loại sản phẩm đã bán, được phân chia theo năm,
// tháng, quý và tuần.
export const getDashboardAdvanced = async (req, res) => {
  try {
    const { annual, quarterly, monthly, weekly, start, end } = req.query;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    const query = buildTimeFilter({ annual, quarterly, monthly, weekly, startDate, endDate });

    const stats = await Order.aggregate([
      { $match: { ...query, payment_status: "paid" } },
      {
        $facet: {
          general: [
            {
              $project: {
                grand_total: 1,
                profit: {
                  $sum: {
                    $map: {
                      input: "$Items",
                      as: "i",
                      in: { $multiply: [{ $subtract: ["$$i.variant.price", { $ifNull: ["$$i.variant.cost_price", 0] }] }, "$$i.quantity"] }
                    }
                  }
                }
              }
            },
            {
              $group: {
                _id: null,
                total_orders: { $sum: 1 },
                total_revenue: { $sum: "$grand_total" },
                total_profit: { $sum: "$profit" }
              }
            },
            { $project: { _id: 0 } }
          ],
          category: [
            { $unwind: "$Items" },
            { $group: { _id: "$Items.category_name", total_quantity: { $sum: "$Items.quantity" } } },
            { $project: { category_name: "$_id", total_quantity: 1, _id: 0 } }
          ],
          timeline: [
            { $unwind: "$Items" },
            {
              $group: {
                _id: getTimelineGrouping({ annual, quarterly, monthly, weekly, startDate, endDate })._id,
                total_revenue: { $sum: "$grand_total" },
                total_profit: {
                  $sum: {
                    $multiply: [
                      { $subtract: ["$Items.variant.price", { $ifNull: ["$Items.variant.cost_price", 0] }] },
                      "$Items.quantity"
                    ]
                  }
                },
                total_products_sold: { $sum: "$Items.quantity" }
              }
            },
            {
              $project: {
                _id: 0,
                month: "$_id.month",
                week: "$_id.week",
                day: "$_id.day",
                total_revenue: 1,
                total_profit: 1,
                total_products_sold: 1
              }
            },
            { $sort: getTimelineGrouping({ annual, quarterly, monthly, weekly, startDate, endDate }).sort }
          ]
        }
      }
    ]);

    const dt = stats[0];
    res.json({
      ec: 200,
      me: "Lấy dữ liệu dashboard nâng cao thành công",
      dt: {
        general: dt.general[0] || { total_orders: 0, total_revenue: 0, total_profit: 0 },
        category: dt.category,
        timeline: buildTimelineSkeleton(
          { annual, quarterly, monthly, weekly, startDate, endDate },
          dt.timeline,
          Number(annual || new Date().getFullYear()),
          Number(monthly),
          Number(weekly)
        )
      }
    });
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

// Bảng điều khiển đơn giản: tổng quan chi tiết về hiệu suất của cửa hàng, các số liệu chính và thông tin chi tiết hữu ích. Bao gồm: Tổng số người
// dùng, số lượng người dùng mới, số lượng đơn hàng, doanh thu, các sản phẩm bán chạy nhất được thể hiện qua biểu đồ.
export const getDashboardGeneral = async (req, res) => {
  try {
    // Lấy tổng số người dùng và đơn hàng
    const totalUsers = await User.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    // Tính tổng doanh thu
    const totalRevenue = await Order.aggregate([
      { $match: { payment_status: "paid" } },
      { $group: { _id: null, total: { $sum: "$grand_total" } } }
    ]);
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    // Lấy 10 sản phẩm bán chạy nhất
    const productSales = await Product.find({}).sort({ quantity_sold: -1 }).limit(10).select('product_name quantity_sold');

    // Lọc người dùng mới trong tháng
    const today = new Date();
    let query = {};
    let createdAtFilter = {};
    createdAtFilter.$gte = new Date(today.getFullYear(), today.getMonth(), 1);
    createdAtFilter.$lt = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    query.createdAt = createdAtFilter;
    const newUsersThisMonth = await User.countDocuments(query);

    res.json({
      ec: 200,
      me: "Lấy dữ liệu bảng điều khiển tổng quan thành công",
      dt: {
        "total_users": totalUsers,
        "total_orders": totalOrders,
        "total_revenue": revenue,
        "new_users_this_month": newUsersThisMonth,
        "top_selling_products": productSales
      }
    });
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};