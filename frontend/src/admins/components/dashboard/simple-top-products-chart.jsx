import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend);

const SimpleTopProductsChart = ({ products = [] }) => {
  const chartData = useMemo(() => {
    const labels = products.map((item) => item.product_name || "Không rõ");
    const quantities = products.map((item) => item.quantity_sold || 0);

    return {
      labels,
      datasets: [
        {
          label: "Số lượng bán",
          data: quantities,
          backgroundColor: "rgba(13, 110, 253, 0.25)",
          borderColor: "rgba(13, 110, 253, 0.9)",
          borderWidth: 1,
          borderRadius: 8,
        },
      ],
    };
  }, [products]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.parsed.y || 0} sản phẩm`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { autoSkip: true, maxRotation: 45, minRotation: 0 },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(15, 23, 42, 0.06)" },
      },
    },
  };

  if (!products?.length) {
    return <div className="chart-empty">Chưa có dữ liệu sản phẩm bán chạy</div>;
  }

  return <Bar data={chartData} options={options} height={280} />;
};

export default SimpleTopProductsChart;
