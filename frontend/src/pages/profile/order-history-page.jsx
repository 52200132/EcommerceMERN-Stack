import { useMemo } from "react";
import { Alert, Badge, Button, Spinner } from "react-bootstrap";
import { BsArrowRepeat, BsBoxSeam, BsClockHistory } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

import { useGetMyOrdersQuery } from "#services/user-services";
import { formatCurrency, formatDateTime } from "#utils";
import {
  formatOrderCode,
  getOrderStatusMeta,
  getPaymentStatusMeta,
} from "#utils/order-helpers";

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const {
    data,
    isFetching,
    isLoading,
    error,
    refetch,
  } = useGetMyOrdersQuery();

  const orders = useMemo(() => data?.dt || [], [data?.dt]);
  const busy = isFetching || isLoading;
  const errorMessage = error?.data?.em || error?.em;

  const handleViewDetail = (orderId) => {
    if (!orderId) return;
    navigate(`/thong-tin-nguoi-dung/theo-doi-don-hang?orderId=${orderId}`);
  };

  const renderOrderItems = (items = []) => {
    if (!items.length) return <div className="text-muted">Chưa có sản phẩm</div>;
    return (
      <ul className="order-card__items">
        {items.map((item, idx) => {
          const variantText = item.variant?.attributes
            ?.map((attr) => `${attr.attribute}: ${attr.value}`)
            .join(", ");
          return (
            <li key={`${item.product_id}-${item.variant?.sku}-${idx}`}>
              <div>
                <div className="fw-semibold">{item.product_name}</div>
                <div className="text-muted small">{variantText || "Phân loại tiêu chuẩn"}</div>
              </div>
              <div className="order-card__qty">x{item.quantity}</div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="profile-panel order-history-panel">
      <div className="profile-panel__heading">
        <div>
          <h2>Lịch Sử Đơn Hàng</h2>
          <p>Xem lại các đơn đã mua, trạng thái và sản phẩm</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={() => refetch()}>
            <BsArrowRepeat className="me-2" />
            Tải lại
          </Button>
        </div>
      </div>

      {busy && !orders.length ? (
        <div className="d-flex align-items-center gap-2 text-muted">
          <Spinner animation="border" size="sm" /> Đang tải đơn hàng của bạn...
        </div>
      ) : null}

      {errorMessage && (
        <Alert variant="danger" className="mb-3">
          {errorMessage || "Không tải được danh sách đơn hàng."}
        </Alert>
      )}

      {!busy && !orders.length ? (
        <div className="order-history__empty">
          <BsBoxSeam size={48} />
          <h4>Chưa có đơn hàng</h4>
          <p className="text-muted mb-0">Bắt đầu mua sắm để thấy đơn của bạn tại đây.</p>
        </div>
      ) : (
        <div className="order-history__list">
          {orders.map((order) => {
            const statusMeta = getOrderStatusMeta(order.order_status);
            const paymentMeta = getPaymentStatusMeta(order.payment_status);
            const totalItems =
              order.Items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
            return (
              <article key={order._id} className="order-card">
                <header className="order-card__header">
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h5 className="mb-0">{formatOrderCode(order._id)}</h5>
                      <Badge bg={statusMeta.variant}>{statusMeta.label}</Badge>
                      <Badge bg={paymentMeta.variant}>{paymentMeta.label}</Badge>
                    </div>
                    <div className="text-muted small mt-1">
                      Đặt lúc: {formatDateTime(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-muted small">Tổng thanh toán</div>
                    <div className="fw-bold fs-5">{formatCurrency(order.grand_total || 0)}</div>
                    <div className="text-muted small">Sản phẩm: {totalItems}</div>
                  </div>
                </header>

                <div className="order-card__body">
                  {renderOrderItems(order.Items)}
                  <div className="order-card__meta">
                    {order.points_used ? (
                      <span className="badge bg-light text-success fw-semibold border border-success">
                        Đã dùng {order.points_used} điểm
                      </span>
                    ) : null}
                    {order.loyalty_points_earned ? (
                      <span className="badge bg-light text-primary fw-semibold border border-primary">
                        Nhận {order.loyalty_points_earned} điểm thưởng
                      </span>
                    ) : null}
                  </div>
                </div>

                <footer className="order-card__footer">
                  <div className="text-muted d-flex align-items-center gap-2">
                    <BsClockHistory />
                    Cập nhật trạng thái gần nhất: {statusMeta.label}
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleViewDetail(order._id)}
                    >
                      Theo dõi đơn
                    </Button>
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
