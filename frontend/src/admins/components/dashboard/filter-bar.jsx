import React, { useMemo } from "react";

const VIEW_MODES = [
  { key: "year", label: "Theo năm" },
  { key: "quarter", label: "Theo quý" },
  { key: "month", label: "Theo tháng" },
  { key: "week", label: "Theo tuần" },
  { key: "custom", label: "Khoảng ngày" },
];

const months = Array.from({ length: 12 }, (_, idx) => idx + 1);
const weeks = [1, 2, 3, 4, 5];

const FilterBar = ({ filters, onChange, onReset }) => {
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, idx) => current - 3 + idx);
  }, []);

  const handleModeChange = (mode) => {
    onChange({ mode });
  };

  return (
    <div className="dashboard-filter card shadow-sm border-0 mt-3">
      <div className="card-body">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <div className="filter-modes">
              {VIEW_MODES.map((view) => (
                <button
                  key={view.key}
                  type="button"
                  className={`mode-pill ${filters.mode === view.key ? "is-active" : ""}`}
                  onClick={() => handleModeChange(view.key)}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-grid">
          <div className="filter-field">
            <label className="form-label">Năm</label>
            <select
              className="form-select"
              value={filters.year}
              onChange={(e) => onChange({ year: Number(e.target.value) })}
              disabled={filters.mode === "custom"}
            >
              {yearOptions.map((y) => (
                <option value={y} key={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {filters.mode === "quarter" && (
            <div className="filter-field">
              <label className="form-label">Quý</label>
              <select
                className="form-select"
                value={filters.quarter}
                onChange={(e) => onChange({ quarter: Number(e.target.value) })}
              >
                {[1, 2, 3, 4].map((q) => (
                  <option value={q} key={q}>
                    Quý {q}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(filters.mode === "month" || filters.mode === "week") && (
            <div className="filter-field">
              <label className="form-label">Tháng</label>
              <select
                className="form-select"
                value={filters.month}
                onChange={(e) => onChange({ month: Number(e.target.value) })}
              >
                {months.map((m) => (
                  <option value={m} key={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filters.mode === "week" && (
            <div className="filter-field">
              <label className="form-label">Tuần</label>
              <select
                className="form-select"
                value={filters.week}
                onChange={(e) => onChange({ week: Number(e.target.value) })}
              >
                {weeks.map((w) => (
                  <option value={w} key={w}>
                    Tuần {w}
                  </option>
                ))}
              </select>
            </div>
          )}

          {filters.mode === "custom" && (
            <>
              <div className="filter-field">
                <label className="form-label">Từ ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.rangeStart || ""}
                  onChange={(e) => onChange({ rangeStart: e.target.value })}
                />
              </div>
              <div className="filter-field">
                <label className="form-label">Đến ngày</label>
                <input
                  type="date"
                  className="form-control"
                  value={filters.rangeEnd || ""}
                  onChange={(e) => onChange({ rangeEnd: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="filter-field align-self-end">
            <button type="button" className="btn btn-outline-secondary w-100" onClick={onReset}>
              Đặt lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
