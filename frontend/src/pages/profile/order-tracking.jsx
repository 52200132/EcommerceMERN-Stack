import { useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Form, Spinner, Table } from "react-bootstrap";
import {
  BsArrowRepeat,
  BsBoxSeam,
  BsPinMap,
  BsSearch,
  BsTruck,
} from "react-icons/bs";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

import {
  useCancelMyOrderMutation,
  useGetOrderByIdQuery,
  useGetOrderStatusHistoryQuery,
} from "#services/user-services";
import { formatCurrency, formatDateTime } from "#utils";
import {
  formatOrderCode,
  getOrderStatusMeta,
  getPaymentStatusMeta,
} from "#utils/order-helpers";

const PAYMENT_METHOD_LABELS = {
  COD: "Thanh toán khi nhận hàng",
  banking: "Chuyển khoản",
  credit_card: "Thẻ tín dụng / ghi nợ",
};

const OrderTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [orderId, setOrderId] = useState(initialOrderId);

  const {
    data: orderResp,
    isFetching: isLoadingOrder,
    error: orderError,
    refetch: refetchOrder,
  } = useGetOrderByIdQuery(orderId, { skip: !orderId });
  const order = orderResp?.dt;

  const {
    data: historyResp,
    isFetching: isLoadingHistory,
    error: historyError,
  } = useGetOrderStatusHistoryQuery(orderId, { skip: !orderId });

  const [cancelOrder, { isLoading: isCancelling }] = useCancelMyOrderMutation();

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      setOrderIdInput(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = orderIdInput.trim();
    setOrderId(trimmed);
    if (trimmed) {
      setSearchParams({ orderId: trimmed });
    } else {
      setSearchParams({});
    }
  };

  const statusMeta = getOrderStatusMeta(order?.order_status);
  const paymentMeta = getPaymentStatusMeta(order?.payment_status);
  const history = useMemo(() => {
    const list = historyResp?.dt || order?.StatusHistory || [];
    return [...list].sort((a, b) => new Date(b.change_at) - new Date(a.change_at));
  }, [historyResp?.dt, order?.StatusHistory]);

  const handleCancelOrder = async () => {
    if (!order?._id) return;
    try {
      await cancelOrder({ orderId: order._id }).unwrap();
      toast.success("Đã gửi yêu cầu hủy đơn hàng");
      refetchOrder();
    } catch (err) {
      toast.error(err?.data?.em || err?.em || "Không thể hủy đơn. Vui lòng thử lại.");
    }
  };

  const orderErrorMsg = orderError?.data?.em || orderError?.em;
  const historyErrorMsg = historyError?.data?.em || historyError?.em;
  const totalItems =
    order?.Items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <div className="profile-panel order-tracking-panel">
      <div className="profile-panel__heading">
        <div>
          <h2>Theo Dõi Đơn Hàng</h2>
          <p>Nhập mã đơn để xem trạng thái hiện tại và lịch sử cập nhật</p>
        </div>
      </div>

      <Form className="order-tracking__search" onSubmit={handleSubmit}>
        <Form.Control
          placeholder="Dán mã đơn hàng (ví dụ: 656e9b8e4f...)"
          value={orderIdInput}
          onChange={(e) => setOrderIdInput(e.target.value)}
        />
        <div className="d-flex gap-2">
          <Button type="submit" variant="primary">
            <BsSearch className="me-2" />
            Tra cứu
          </Button>
          {orderId ? (
            <Button
              variant="outline-secondary"
              type="button"
              onClick={() => {
                refetchOrder();
              }}
            >
              <BsArrowRepeat className="me-2" />
              Làm mới
            </Button>
          ) : null}
        </div>
      </Form>

      {!orderId ? (
        <div className="order-tracking__empty">
          <BsBoxSeam size={48} />
          <h4>Nhập mã đơn hàng để bắt đầu</h4>
          <p className="text-muted mb-0">
            Bạn có thể lấy mã trong chi tiết đơn hoặc email xác nhận.
          </p>
        </div>
      ) : null}

      {orderErrorMsg && (
        <Alert variant="danger" className="mt-3">
          {orderErrorMsg}
        </Alert>
      )}

      {orderId && isLoadingOrder && !order ? (
        <div className="d-flex align-items-center gap-2 mt-3 text-muted">
          <Spinner size="sm" animation="border" /> Đang tải thông tin đơn hàng...
        </div>
      ) : null}

      {order ? (
        <div className="order-tracking__content">
          <section className="order-summary">
            <div className="order-summary__row">
              <div>
                <div className="text-muted small">Mã đơn hàng</div>
                <div className="fw-bold">{formatOrderCode(order._id)}</div>
                <div className="text-muted small">{order._id}</div>
              </div>
              <div className="d-flex gap-2 align-items-start flex-wrap">
                <Badge bg={statusMeta.variant}>{statusMeta.label}</Badge>
                <Badge bg={paymentMeta.variant}>{paymentMeta.label}</Badge>
                {order.order_status === "pending" ? (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                  >
                    {isCancelling ? "Đang hủy..." : "Hủy đơn"}
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="order-summary__grid">
              <div>
                <div className="text-muted small">Ngày đặt</div>
                <div className="fw-semibold">{formatDateTime(order.createdAt)}</div>
              </div>
              <div>
                <div className="text-muted small">Số sản phẩm</div>
                <div className="fw-semibold">{totalItems}</div>
              </div>
              <div>
                <div className="text-muted small">Tổng thanh toán</div>
                <div className="fw-bold fs-5">{formatCurrency(order.grand_total || 0)}</div>
              </div>
              <div>
                <div className="text-muted small">Phương thức thanh toán</div>
                <div className="fw-semibold">
                  {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
                </div>
              </div>
            </div>
          </section>

          <section className="order-block">
            <header className="order-block__header">
              <div className="d-flex align-items-center gap-2">
                <BsPinMap />
                <h5 className="mb-0">Địa chỉ giao hàng</h5>
              </div>
            </header>
            <div className="order-block__body">
              <div className="fw-semibold">{order.shipping_address?.receiver}</div>
              <div className="text-muted">{order.shipping_address?.phone}</div>
              <div className="text-muted">
                {[order.shipping_address?.street, order.shipping_address?.ward, order.shipping_address?.district, order.shipping_address?.province]
                  .filter(Boolean)
                  .join(", ")}
              </div>
              {order.notes ? <div className="mt-2 text-muted">Ghi chú: {order.notes}</div> : null}
            </div>
          </section>

          <section className="order-block">
            <header className="order-block__header">
              <div className="d-flex align-items-center gap-2">
                <BsTruck />
                <h5 className="mb-0">Sản phẩm trong đơn</h5>
              </div>
            </header>
            <div className="order-block__body">
              <div className="table-responsive">
                <Table hover size="sm" className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Phân loại</th>
                      <th className="text-end">SL</th>
                      <th className="text-end">Đơn giá</th>
                      <th className="text-end">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.Items?.map((item, idx) => {
                      const variantText = item.variant?.attributes
                        ?.map((attr) => `${attr.attribute}: ${attr.value}`)
                        .join(", ");
                      const lineTotal = (item.variant?.price || 0) * (item.quantity || 0);
                      return (
                        <tr key={`${item.product_id}-${item.variant?.sku}-${idx}`}>
                          <td className="fw-semibold">{item.product_name}</td>
                          <td className="text-muted small">{variantText || "Phân loại tiêu chuẩn"}</td>
                          <td className="text-end">{item.quantity}</td>
                          <td className="text-end">{formatCurrency(item.variant?.price || 0)}</td>
                          <td className="text-end fw-semibold">{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
              <div className="order-total mt-3">
                <div>
                  <span className="text-muted">Tạm tính</span>
                  <span>{formatCurrency(order.total_amount || 0)}</span>
                </div>
                <div>
                  <span className="text-muted">Phí vận chuyển</span>
                  <span>{formatCurrency(order.shipment?.fee || 0)}</span>
                </div>
                {order.discount ? (
                  <div className="text-success">
                    <span>Giảm giá</span>
                    <span>- {formatCurrency(order.discount || 0)}</span>
                  </div>
                ) : null}
                {order.points_used ? (
                  <div className="text-success">
                    <span>Điểm đã dùng</span>
                    <span>- {formatCurrency((order.points_used || 0) * 1000)}</span>
                  </div>
                ) : null}
                <div className="fw-bold fs-5">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(order.grand_total || 0)}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="order-block">
            <header className="order-block__header">
              <div className="d-flex align-items-center gap-2">
                <BsArrowRepeat />
                <h5 className="mb-0">Lịch sử trạng thái</h5>
              </div>
            </header>
            <div className="order-block__body">
              {historyErrorMsg && (
                <Alert variant="warning" className="mb-3">
                  {historyErrorMsg}
                </Alert>
              )}
              {isLoadingHistory ? (
                <div className="d-flex align-items-center gap-2 text-muted">
                  <Spinner size="sm" animation="border" /> Đang tải lịch sử...
                </div>
              ) : history.length ? (
                <div className="status-history">
                  {history.map((entry, idx) => {
                    const meta = getOrderStatusMeta(entry.status);
                    return (
                      <div key={`${entry.change_at}-${idx}`} className="status-history__row">
                        <Badge bg={meta.variant}>{meta.label}</Badge>
                        <div className="text-muted small">{formatDateTime(entry.change_at)}</div>
                        <div className="text-muted small">
                          Bởi: {entry.change_by?.username || "Hệ thống"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted">Chưa có lịch sử trạng thái.</div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default OrderTrackingPage;
