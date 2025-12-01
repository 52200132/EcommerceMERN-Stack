import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { formatCurrency } from "utils/format";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const TimelineChart = ({ timeline = [], mode }) => {
  const { labels, datasets } = useMemo(() => {
    const labelFormatter = (item) => {
      if (mode === "week") return `Ngày ${item.day}`;
      if (mode === "month") return `Tuần ${item.week}`;
      if (mode === "quarter") return `Tháng ${item.month}`;
      return `Tháng ${item.month}`;
    };

    const labels = timeline.map(labelFormatter);
    const revenueData = timeline.map((item) => Math.round(item.total_revenue || 0));
    const profitData = timeline.map((item) => Math.round(item.total_profit || 0));
    const productData = timeline.map((item) => Math.round(item.total_products_sold || 0));

    return {
      labels,
      datasets: [
        {
          type: "bar",
          label: "Sản phẩm bán",
          data: productData,
          backgroundColor: "rgba(213, 31, 140, 0.2)",
          borderColor: "rgba(133, 25, 120, 0.6)",
          borderWidth: 1,
          borderRadius: 8,
          yAxisID: "yProducts",
        },
        {
          type: "line",
          label: "Doanh thu",
          data: revenueData,
          borderColor: "#0d6efd",
          backgroundColor: "rgba(13, 110, 253, 0.12)",
          tension: 0.35,
          fill: true,
          yAxisID: "yMoney",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          type: "line",
          label: "Lợi nhuận",
          data: profitData,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.14)",
          tension: 0.35,
          fill: true,
          yAxisID: "yMoney",
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [mode, timeline]);

  if (!timeline?.length) {
    return <div className="chart-empty">Không có dữ liệu để hiển thị</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, boxWidth: 10 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            const value = context.parsed.y || 0;
            if (label === "Sản phẩm bán") return `${label}: ${value} sản phẩm`;
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
      },
      yMoney: {
        type: "linear",
        position: "left",
        ticks: {
          callback: (val) =>
            new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(val),
        },
        grid: { color: "rgba(15, 23, 42, 0.06)" },
      },
      yProducts: {
        type: "linear",
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: {
          callback: (val) => `${val}`,
        },
      },
    },
  };

  return <Chart type="bar" data={{ labels, datasets }} options={options} height={360} />;
};

export default TimelineChart;
