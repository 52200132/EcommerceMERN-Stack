import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

// Hàm tạo query lọc theo thời gian cho dashboard
const buildTimeFilter = ({ annual, quarterly, monthly, weekly, startDate, endDate }) => {
    const today = new Date();
    let query = {};
    let createdAtFilter = {};

    // Nếu có startDate & endDate thì ưu tiên
    if (startDate && endDate) {
        createdAtFilter.$gte = new Date(startDate);
        createdAtFilter.$lt = new Date(endDate);
    } else {
        // Lọc theo năm
        const year = Number(annual) || today.getFullYear();
        let startOfPeriod = new Date(year, 0, 1); // 1 Jan
        let endOfPeriod = new Date(year + 1, 0, 1); // 1 Jan next year

        // Lọc theo quý
        if (quarterly) {
            const quarter = Number(quarterly); // 1..4
            const startMonth = (quarter - 1) * 3;
            startOfPeriod = new Date(year, startMonth, 1);
            endOfPeriod = new Date(year, startMonth + 3, 1);
        }

        // Lọc theo tháng
        if (monthly) {
            const month = Number(monthly) - 1; // 0..11
            startOfPeriod = new Date(year, month, 1);
            endOfPeriod = new Date(year, month + 1, 1);
        }

        // Lọc theo tuần trong tháng
        if (weekly && monthly) {
            const month = Number(monthly) - 1;
            const startOfMonth = new Date(year, month, 1);
            const endOfMonth = new Date(year, month + 1, 1);

            const week = Number(weekly); // 1..5 (tuần trong tháng)
            const startOfWeek = new Date(startOfMonth);
            startOfWeek.setDate(1 + (week - 1) * 7);

            let endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);

            endOfWeek = endOfWeek < endOfMonth ? endOfWeek : endOfMonth;

            startOfPeriod = startOfWeek;
            endOfPeriod = endOfWeek;
        }

        createdAtFilter.$gte = startOfPeriod;
        createdAtFilter.$lt = endOfPeriod;
    }

    // Gán filter
    if (Object.keys(createdAtFilter).length > 0) {
        query.createdAt = createdAtFilter;
    }

    return query;
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

const getDashboardAdvanced = async (req, res) => {
  try {
    const { annual, quarterly, monthly, weekly, startDate, endDate } = req.query;
    const query = buildTimeFilter({ annual, quarterly, monthly, weekly, startDate, endDate });

    
    
  } catch (error) {
    res.status(500).json({ ec: 500, me: error.message });
  }
};

// TODO: Bảng điều khiển Nâng cao: Hiển thị số liệu thống kê và biểu đồ liên quan cho thông tin chính theo các khoảng thời gian cụ thể. Theo mặc định, dữ
// liệu được hiển thị hàng năm, nhưng người dùng có thể linh hoạt điều chỉnh chế độ xem theo quý, hàng tháng, hàng tuần hoặc dựa trên ngày bắt đầu
// và kết thúc đã xác định. Đối với mỗi khung thời gian này, việc theo dõi số lượng đơn hàng đã bán, tổng doanh thu và lợi nhuận chung là rất quan
// trọng. Ngoài ra, cần có các biểu đồ so sánh thể hiện doanh thu, lợi nhuận, số lượng sản phẩm và loại sản phẩm đã bán, được phân chia theo năm,
// tháng, quý và tuần.