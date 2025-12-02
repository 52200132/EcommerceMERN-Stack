import React, { useEffect, useMemo, useState } from "react";
import FilterBar from "admins/components/dashboard/filter-bar";
import StatCard from "admins/components/dashboard/stat-card";
import TimelineChart from "admins/components/dashboard/timeline-chart";
import CategoryChart from "admins/components/dashboard/category-chart";
import TopProducts from "admins/components/dashboard/top-products";
import SimpleTopProductsChart from "admins/components/dashboard/simple-top-products-chart";
import { useGetDashboardGeneralQuery, useLazyGetDashboardAdvancedQuery } from "services/admin-services";
import { formatCurrency, formatDisplayDate } from "utils/format";
import "./dashboard-page.scss";

const now = new Date();
const defaultFilters = {
  mode: "year",
  year: now.getFullYear(),
  quarter: Math.ceil((now.getMonth() + 1) / 3),
  month: now.getMonth() + 1,
  week: 1,
  rangeStart: "",
  rangeEnd: "",
};

const formatNumber = (value) => new Intl.NumberFormat("vi-VN").format(value || 0);

const DashboardPage = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const { data: generalData, isFetching: loadingGeneral } = useGetDashboardGeneralQuery();
  const [triggerAdvanced, { data: advancedData, isFetching: loadingAdvanced }] = useLazyGetDashboardAdvancedQuery();

  const queryParams = useMemo(() => {
    if (filters.mode === "custom") {
      if (!filters.rangeStart || !filters.rangeEnd) return null;
      return { start: filters.rangeStart, end: filters.rangeEnd };
    }
    if (filters.mode === "year") return { annual: filters.year };
    if (filters.mode === "quarter") return { annual: filters.year, quarterly: filters.quarter };
    if (filters.mode === "month") return { annual: filters.year, monthly: filters.month };
    if (filters.mode === "week") return { annual: filters.year, monthly: filters.month, weekly: filters.week };
    return { annual: filters.year };
  }, [filters]);

  useEffect(() => {
    if (!queryParams) return;
    triggerAdvanced(queryParams);
  }, [queryParams, triggerAdvanced]);

  const advancedGeneral = advancedData?.dt?.general || { total_orders: 0, total_revenue: 0, total_profit: 0 };
  const categoryData = advancedData?.dt?.category || [];
  const timelineData = advancedData?.dt?.timeline || [];
  const advancedBusy = loadingAdvanced || !advancedData;
  const totalProductsSold = useMemo(
    () => timelineData.reduce((sum, curr) => sum + (curr.total_products_sold || 0), 0),
    [timelineData]
  );
  console.log("advancedData", totalProductsSold);

  const topProducts = generalData?.dt?.top_selling_products || [];
  const filterLabel = useMemo(() => {
    switch (filters.mode) {
      case "quarter":
        return `Quý ${filters.quarter} - Năm ${filters.year}`;
      case "month":
        return `Tháng ${filters.month}/${filters.year}`;
      case "week":
        return `Tuần ${filters.week}, tháng ${filters.month}/${filters.year}`;
      case "custom":
        if (!filters.rangeStart || !filters.rangeEnd) return "Chọn đủ ngày bắt đầu/kết thúc";
        return `Từ ${formatDisplayDate(filters.rangeStart)} đến ${formatDisplayDate(filters.rangeEnd)}`;
      default:
        return `Năm ${filters.year}`;
    }
  }, [filters]);

  const handleFilterChange = (patch) => {
    setFilters((prev) => {
      const merged = { ...prev, ...patch };
      if (patch.mode && patch.mode !== "custom") {
        merged.rangeStart = "";
        merged.rangeEnd = "";
      }
      if (patch.mode === "year" && !patch.year) merged.year = defaultFilters.year;
      return merged;
    });
  };

  const handleReset = () => setFilters(defaultFilters);

  const quickStats = [
    {
      title: "Tổng người dùng",
      value: loadingGeneral ? "..." : formatNumber(generalData?.dt?.total_users),
      icon: "bi-people-fill",
      tone: "violet",
      hint: "Số tài khoản đã đăng ký",
    },
    {
      title: "Người dùng mới (tháng)",
      value: loadingGeneral ? "..." : formatNumber(generalData?.dt?.new_users_this_month),
      icon: "bi-person-plus",
      tone: "success",
      hint: "Từ đầu tháng tới nay",
    },
    {
      title: "Tổng đơn hàng",
      value: loadingGeneral ? "..." : formatNumber(generalData?.dt?.total_orders),
      icon: "bi-bag-check-fill",
      tone: "warning",
      hint: "Bao gồm tất cả trạng thái",
    },
    {
      title: "Doanh thu",
      value: loadingGeneral ? "..." : formatCurrency(generalData?.dt?.total_revenue || 0),
      icon: "bi-cash-stack",
      tone: "primary",
      hint: "Đơn đã thanh toán",
    },
  ];

  const advancedStats = [
    {
      title: "Đơn hàng trong kỳ",
      value: advancedBusy ? "..." : formatNumber(advancedGeneral.total_orders),
      icon: "bi-kanban",
      tone: "primary",
      hint: filterLabel,
    },
    {
      title: "Doanh thu",
      value: advancedBusy ? "..." : formatCurrency(advancedGeneral.total_revenue || 0),
      icon: "bi-graph-up-arrow",
      tone: "success",
      hint: "Đơn đã thanh toán",
    },
    {
      title: "Lợi nhuận",
      value: advancedBusy ? "..." : formatCurrency(advancedGeneral.total_profit || 0),
      icon: "bi-coin",
      tone: "warning",
      hint: "Sau khi trừ giá vốn",
    },
    {
      title: "Sản phẩm bán ra",
      value: advancedBusy ? "..." : formatNumber(totalProductsSold),
      icon: "bi-box-seam",
      tone: "violet",
      hint: "Tổng số lượng theo bộ lọc",
    },
  ];

  return (
    <div className="tps-dashboard-page">
      <div className="page-header mb-3">
        <div>
          <h1 className="page-title">Tổng quan</h1>
          <p className="page-subtitle">
            Theo dõi nhanh doanh thu, lợi nhuận, đơn hàng và cơ cấu sản phẩm theo thời gian.
          </p>
        </div>
        <div className="tag">
          <span className="dot live" />
          Cập nhật {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date())}
        </div>
      </div>

      {/* <div className="section-head">
        <div>
          <div className="card-eyebrow text-muted">Simple dashboard</div>
          <h4 className="section-title">Ảnh chụp nhanh</h4>
          <div className="text-muted small">Số liệu tổng quan và top sản phẩm bán chạy.</div>
        </div>
        {loadingGeneral && <div className="spinner-border spinner-border-sm text-primary" role="status" />}
      </div> */}

      <div className="stat-grid">
        {quickStats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="card shadow-sm border-0 mt-3 simple-chart-card">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">Top 10 sản phẩm bán chạy</h5>
          </div>
        </div>
        <div className="card-body">
          <SimpleTopProductsChart products={topProducts} />
        </div>
      </div>

      <div className="section-head mt-4">
        <div>
          {/* <div className="card-eyebrow text-muted">Advanced dashboard</div> */}
          <h2>Phân tích nâng cao</h2>
          {/* <div className="text-muted small">Thay đổi khung thời gian để phân tích sâu.</div> */}
        </div>
      </div>

      <FilterBar filters={filters} onChange={handleFilterChange} onReset={handleReset} />

      <div className="stat-grid secondary">
        {advancedStats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="chart-grid">
        <div className="card shadow-sm border-0 chart-card">
          <div className="card-header border-0 bg-white d-flex justify-content-between align-items-center">
            <div>
              <h5 className="card-title mb-0">Doanh thu - Lợi nhuận - Sản phẩm</h5>
              <div className="text-muted small">{filterLabel}</div>
            </div>
            {loadingAdvanced && <div className="spinner-border spinner-border-sm text-primary" role="status" />}
          </div>
          <div className="card-body">
            <TimelineChart timeline={timelineData} mode={filters.mode} />
          </div>
        </div>

        <div className="card shadow-sm border-0 chart-card side">
          <div className="card-header border-0 bg-white">
            <h5 className="card-title mb-0">Loại sản phẩm đã bán</h5>
          </div>
          <div className="card-body">
            <CategoryChart data={categoryData} />
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mt-3">
        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">10 Sản phẩm bán chạy nhất</h5>
          </div>
          <span className="badge bg-primary-subtle text-primary">Dữ liệu tổng hợp</span>
        </div>
        <div className="card-body">
          <TopProducts products={topProducts} loading={loadingGeneral} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
