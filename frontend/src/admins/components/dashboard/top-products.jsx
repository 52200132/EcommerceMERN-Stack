import React from "react";

const TopProducts = ({ products = [], loading }) => {
  if (loading) {
    return (
      <div className="skeleton-list">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="skeleton-line" />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return <div className="chart-empty">Chưa có sản phẩm bán chạy</div>;
  }

  return (
    <ul className="top-products">
      {products.map((item, idx) => (
        <li key={item._id || idx}>
          <div className="rank">{idx + 1}</div>
          <div className="info">
            <div className="name">{item.product_name}</div>
            <div className="meta text-muted">Số lượng bán: {item.quantity_sold || 0}</div>
          </div>
          <div className="badge bg-primary-subtle text-primary fw-semibold">
            {item.quantity_sold || 0} sản phẩm
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TopProducts;
