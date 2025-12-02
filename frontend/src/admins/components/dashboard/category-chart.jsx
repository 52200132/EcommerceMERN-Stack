import React, { useMemo } from "react";
import { Chart as ChartJS, ArcElement, DoughnutController, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, DoughnutController, Tooltip, Legend);

const palette = ["#0d6efd", "#22c55e", "#f59e0b", "#7c3aed", "#06b6d4", "#ec4899", "#94a3b8"];

const CategoryChart = ({ data = [] }) => {
  const chartData = useMemo(() => {
    const labels = data.map((item) => item.category_name || "Khác");
    const quantities = data.map((item) => item.total_quantity || 0);
    const colors = data.map((_, idx) => palette[idx % palette.length]);

    return {
      labels,
      datasets: [
        {
          data: quantities,
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, curr) => sum + (curr.total_quantity || 0), 0),
    [data]
  );

  if (!data?.length || total === 0) {
    return <div className="chart-empty">Chưa có số liệu theo loại sản phẩm</div>;
  }

  const options = {
    cutout: "62%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = chartData.labels[ctx.dataIndex] || "";
            const value = ctx.parsed;
            const percent = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} sản phẩm (${percent}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="category-chart">
      <Doughnut data={chartData} options={options} />
      <ul className="category-legend">
        {data.map((item, idx) => {
          const percent = total ? ((item.total_quantity || 0) / total) * 100 : 0;
          return (
            <li key={item.category_name || idx}>
              <span className="dot" style={{ backgroundColor: palette[idx % palette.length] }} />
              <span className="label">{item.category_name || "Khác"}</span>
              <span className="value">
                {item.total_quantity || 0} sp - {percent.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoryChart;
