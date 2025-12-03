import { useEffect, useMemo, useState } from "react";
import { Button, Form, Badge } from "react-bootstrap";
import { IoFilter, IoRefresh, IoSearch, IoCalendarClear, IoTime } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { PaginationControl } from "react-bootstrap-pagination-control";
import { toast } from "react-toastify";

import OrderTable, { STATUS_META } from "admins/components/manage-orders/order-table";
import OrderDetailModal from "admins/components/manage-orders/order-detail-modal";
import { formatDisplayDate } from "utils/format";
import { useGetOrdersOverviewQuery, useGetOrdersQuery } from "services/admin-services";
import { userModalDialogStore, useShallow } from "#custom-hooks";

import "./manage-orders-page.scss";

const PAGE_SIZES = [10, 20, 50];
const STATUS_COLORS = {
  pending: "#ffc107",
  processing: "#0dcaf0",
  shipped: "#0d6efd",
  delivered: "#198754",
  cancelled: "#6c757d",
};

const toDateInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const buildRecentRange = (days = 3) => {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const start = addDays(end, -(Math.max(days, 1) - 1));
  return { start: toDateInput(start), end: toDateInput(end) };
};

const buildPresetRange = (preset) => {
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (preset === "today") return { start: toDateInput(base), end: toDateInput(base) };
  if (preset === "yesterday") {
    const y = addDays(base, -1);
    return { start: toDateInput(y), end: toDateInput(y) };
  }
  if (preset === "this_week") {
    const first = base.getDate() - base.getDay();
    const start = new Date(base.getFullYear(), base.getMonth(), first);
    const end = addDays(start, 6);
    return { start: toDateInput(start), end: toDateInput(end) };
  }
  if (preset === "this_month") {
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { start: toDateInput(start), end: toDateInput(end) };
  }
  return buildRecentRange(3);
};

const diffDaysInclusive = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
};

const ManageOrdersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "20", 10), 1);
  const qParam = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";
  const datePreset = searchParams.get("date") || "";
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const daysParam = Math.max(parseInt(searchParams.get("days") || "3", 10), 1);

  const [searchText, setSearchText] = useState(qParam);
  const [daysRange, setDaysRange] = useState(daysParam || 3);
  const [customStart, setCustomStart] = useState(startParam || buildRecentRange(3).start);
  const [customEnd, setCustomEnd] = useState(endParam || buildRecentRange(3).end);

  const { setShow, setTitle, setBodyComponent, setBodyProps, setSize } = userModalDialogStore(
    useShallow((zs) => ({
      setShow: zs.setShow,
      setTitle: zs.setTitle,
      setBodyComponent: zs.setBodyComponent,
      setBodyProps: zs.setBodyProps,
      setSize: zs.setSize,
    }))
  );

  useEffect(() => setSearchText(qParam), [qParam]);

  const resolvedRange = useMemo(() => {
    if (startParam || endParam) {
      const endValue = endParam || buildRecentRange(daysParam).end;
      const startValue = startParam || buildRecentRange(daysParam).start;
      const dayCount = diffDaysInclusive(startValue, endValue);
      return { start: startValue, end: endValue, days: dayCount };
    }
    if (datePreset) {
      const presetRange = buildPresetRange(datePreset);
      const dayCount = diffDaysInclusive(presetRange.start, presetRange.end);
      return { ...presetRange, days: dayCount };
    }
    const fallbackRange = buildRecentRange(daysParam);
    return { ...fallbackRange, days: daysParam };
  }, [startParam, endParam, datePreset, daysParam]);

  useEffect(() => {
    setCustomStart(resolvedRange.start);
    setCustomEnd(resolvedRange.end);
    setDaysRange(resolvedRange.days || 3);
  }, [resolvedRange.start, resolvedRange.end, resolvedRange.days]);

  const updateParams = (entries, resetPage = false) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (resetPage) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  const queryArgs = useMemo(
    () => ({
      page,
      limit,
      q: qParam,
      status,
      start: resolvedRange.start,
      end: resolvedRange.end,
      date: datePreset || undefined,
    }),
    [datePreset, limit, page, qParam, resolvedRange.end, resolvedRange.start, status]
  );

  const overviewArgs = useMemo(
    () => ({
      start: resolvedRange.start,
      end: resolvedRange.end,
      days: resolvedRange.days,
    }),
    [resolvedRange.end, resolvedRange.start, resolvedRange.days]
  );

  const { data, isLoading, isFetching, refetch } = useGetOrdersQuery(queryArgs);
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useGetOrdersOverviewQuery(overviewArgs);

  const orders = data?.dt?.orders || [];
  const total = data?.dt?.total || 0;

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    if (page > totalPages) {
      updateParams({ page: totalPages }, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, total, limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: searchText.trim() || null }, true);
  };

  const handleResetFilters = () => {
    const defaultRange = buildRecentRange(3);
    setSearchText("");
    updateParams(
      {
        q: null,
        status: null,
        date: null,
        start: defaultRange.start,
        end: defaultRange.end,
        days: 3,
      },
      true
    );
  };

  const handleStatusChange = (value) => updateParams({ status: value || null }, true);
  const handleLimitChange = (value) => updateParams({ limit: value }, true);
  const handlePageChange = (nextPage) => updateParams({ page: nextPage }, false);

  const applyPresetRange = (preset) => {
    const presetRange = buildPresetRange(preset);
    updateParams(
      {
        date: preset,
        start: presetRange.start,
        end: presetRange.end,
        days: null,
      },
      true
    );
  };

  const applyDaysRange = () => {
    const safeDays = Math.max(parseInt(daysRange, 10) || 3, 1);
    const range = buildRecentRange(safeDays);
    updateParams(
      {
        date: null,
        start: range.start,
        end: range.end,
        days: safeDays,
      },
      true
    );
  };

  const applyCustomRange = () => {
    if (!customStart || !customEnd) {
      toast.error("Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc");
      return;
    }
    if (new Date(customStart) > new Date(customEnd)) {
      toast.error("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }
    updateParams(
      {
        date: null,
        start: customStart,
        end: customEnd,
        days: diffDaysInclusive(customStart, customEnd),
      },
      true
    );
  };

  const openOrderDetail = (orderId) => {
    setTitle("Chi tiết đơn hàng");
    setBodyComponent(OrderDetailModal);
    setBodyProps({
      orderId,
      onStatusUpdated: () => {
        refetch();
        refetchOverview();
      },
    });
    setSize("xl");
    setShow(true);
  };

  const rangeLabel = `${formatDisplayDate(resolvedRange.start)} - ${formatDisplayDate(resolvedRange.end)}`;
  const overview = overviewData?.dt;
  const overviewSeries = overview?.statusSeries || {};
  const overviewTotals = overview?.totals || {};
  const overviewLabels = overview?.labels || [];
  const allValues = Object.values(overviewSeries).reduce((acc, arr) => acc.concat(arr || []), []);
  const maxOverview = Math.max(1, ...allValues, 1);

  const isBusy = isLoading || isFetching;

  return (
    <div className="tps-manage-orders-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý đơn hàng</h1>
          <p className="page-subtitle">Theo dõi, lọc, xem chi tiết và cập nhật trạng thái đơn hàng</p>
          <div className="text-muted small d-flex align-items-center gap-2">
            <IoTime /> {rangeLabel}
          </div>
        </div>
        <Button title="Làm mới" variant="outline-secondary" onClick={() => { refetch(); refetchOverview(); }}>
          <IoRefresh size={16} />
        </Button>
      </div>

      <div className="overview-panel">
        <div className="panel-head d-flex align-items-center justify-content-between">
          <div>
            <div className="fw-semibold">Tổng quan trạng thái ({overviewLabels.length || resolvedRange.days} ngày)</div>
            <div className="text-muted small">Mặc định 3 ngày gần đây, có thể nhập số ngày hoặc chọn khoảng thời gian</div>
          </div>
          <Badge bg="light" text="dark">Tổng: {overview?.totalOrders ?? "—"}</Badge>
        </div>
        {isOverviewFetching || isOverviewLoading ? (
          <div className="d-flex justify-content-center py-4">
            <div className="spinner" />
          </div>
        ) : (
          <div className="overview-grid">
            {Object.entries(STATUS_META).map(([key, meta]) => {
              const bars = overviewSeries[key] || [];
              const total = overviewTotals[key] || 0;
              return (
                <div key={key} className="overview-card">
                  <div className="overview-card__head">
                    <div className="d-flex align-items-center gap-2">
                      <span className={`dot dot-${key}`} />
                      <span className="fw-semibold">{meta.label}</span>
                    </div>
                    <Badge bg={meta.variant}>{total}</Badge>
                  </div>
                  <div className="overview-card__count">{total} đơn</div>
                  <div className="overview-card__bars" aria-label={`Thống kê ${meta.label}`}>
                    {overviewLabels.map((label, idx) => {
                      const value = bars[idx] || 0;
                      const height = `${Math.round((value / maxOverview) * 100)}%`;
                      return (
                        <div
                          key={`${key}-${label}`}
                          className="bar"
                          style={{ height, backgroundColor: STATUS_COLORS[key] || "#0d6efd" }}
                          title={`${label}: ${value} đơn`}
                        />
                      );
                    })}
                    {!overviewLabels.length && <div className="text-muted small">Chưa có dữ liệu</div>}
                  </div>
                  <div className="overview-card__footer">{rangeLabel}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="filters-panel">
        <form className="filters-grid" onSubmit={handleSearchSubmit}>
          <div className="filter-item search-box">
            <label htmlFor="search-orders">Tìm kiếm mã đơn</label>
            <div className="search-input">
              <IoSearch size={16} />
              <input
                id="search-orders"
                type="text"
                placeholder="Nhập mã đơn hoặc mã giảm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button type="submit" size="sm" variant="primary">
                Tìm
              </Button>
            </div>
          </div>

          <div className="filter-item">
            <label htmlFor="status-filter">Trạng thái</label>
            <Form.Select
              id="status-filter"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đã ship</option>
              <option value="delivered">Đã giao</option>
              <option value="cancelled">Đã hủy</option>
            </Form.Select>
          </div>

          <div className="filter-item">
            <label htmlFor="days-range">Số ngày gần đây</label>
            <div className="days-control">
              <Form.Control
                id="days-range"
                type="number"
                min={1}
                value={daysRange}
                onChange={(e) => setDaysRange(e.target.value)}
              />
              <Button variant="outline-primary" onClick={applyDaysRange}>Áp dụng</Button>
            </div>
            <div className="text-muted small">Mặc định 3 ngày gần nhất</div>
          </div>

          <div className="filter-item quick-preset">
            <label>Chọn nhanh</label>
            <div className="quick-buttons">
              <Button
                size="sm"
                variant={datePreset === "today" ? "primary" : "outline-secondary"}
                onClick={() => applyPresetRange("today")}
                type="button"
              >
                Hôm nay
              </Button>
              <Button
                size="sm"
                variant={datePreset === "yesterday" ? "primary" : "outline-secondary"}
                onClick={() => applyPresetRange("yesterday")}
                type="button"
              >
                Hôm qua
              </Button>
              <Button
                size="sm"
                variant={datePreset === "this_week" ? "primary" : "outline-secondary"}
                onClick={() => applyPresetRange("this_week")}
                type="button"
              >
                Tuần này
              </Button>
              <Button
                size="sm"
                variant={datePreset === "this_month" ? "primary" : "outline-secondary"}
                onClick={() => applyPresetRange("this_month")}
                type="button"
              >
                Tháng này
              </Button>
            </div>
          </div>

          <div className="filter-item">
            <label>Khoảng ngày tuỳ chọn</label>
            <div className="date-range">
              <Form.Control
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <Form.Control
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <Button variant="outline-primary" type="button" onClick={applyCustomRange}>
                <IoCalendarClear /> Lọc
              </Button>
            </div>
          </div>

          <div className="filter-actions">
            <Button variant="outline-secondary" type="button" onClick={handleResetFilters}>
              <IoFilter size={16} /> Xóa lọc
            </Button>
          </div>
        </form>
      </div>

      <OrderTable
        orders={orders}
        isLoading={isBusy}
        onViewDetail={openOrderDetail}
      />

      <div className="pagination-bar">
        <div className="page-size-row">
          <Form.Select
            className="w-auto"
            size="sm"
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size} / trang</option>
            ))}
          </Form.Select>
        </div>

        <div className="pagination-row">
          <PaginationControl
            page={page}
            between={3}
            total={total}
            limit={limit}
            changePage={handlePageChange}
            next
            last
            ellipsis={1}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageOrdersPage;
