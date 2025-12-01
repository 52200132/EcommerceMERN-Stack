import React from "react";

const toneMap = {
  primary: { bg: "linear-gradient(135deg, #0d6efd, #60a5fa)", iconBg: "rgba(13, 110, 253, 0.12)" },
  success: { bg: "linear-gradient(135deg, #22c55e, #86efac)", iconBg: "rgba(34, 197, 94, 0.15)" },
  warning: { bg: "linear-gradient(135deg, #f59e0b, #fcd34d)", iconBg: "rgba(245, 158, 11, 0.14)" },
  violet: { bg: "linear-gradient(135deg, #7c3aed, #a78bfa)", iconBg: "rgba(124, 58, 237, 0.18)" },
};

const StatCard = ({ title, value, icon = "bi-graph-up", tone = "primary", hint }) => {
  const palette = toneMap[tone] || toneMap.primary;

  return (
    <div className="stat-card" style={{ backgroundImage: palette.bg }}>
      <div className="stat-icon" style={{ backgroundColor: palette.iconBg }}>
        <i className={`bi ${icon}`} aria-hidden="true" />
      </div>
      <div className="stat-meta">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {hint ? <div className="stat-hint">{hint}</div> : null}
      </div>
    </div>
  );
};

export default StatCard;
