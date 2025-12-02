import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Form, Spinner, Table } from "react-bootstrap";
import { IoRefresh } from "react-icons/io5";
import { toast } from "react-toastify";

import {
  useGetOrderDetailQuery,
  useUpdateOrderStatusAdminMutation,
} from "services/admin-services";
import { formatCurrency, formatDateTime } from "utils/format";

const STATUS_MAP = {
  pending: { label: "Chờ xác nhận", variant: "warning" },
  processing: { label: "Đang xử lý", variant: "primary" },
  shipped: { label: "Đang giao", variant: "info" },
  delivered: { label: "Đã giao", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "danger" },
};

const PAYMENT_METHOD_LABELS = {
  COD: "Thanh toán khi nhận hàng",
  banking: "Chuyển khoản",
  credit_card: "Thẻ tín dụng / ghi nợ",
};

const getStatusMeta = (status) => STATUS_MAP[status] || { label: status || "Không rõ", variant: "secondary" };

const OrderDetailModal = ({ orderId, onStatusUpdated }) => {
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusAdminMutation();
  const { data, isFetching, refetch } = useGetOrderDetailQuery(orderId, { skip: !orderId });
  const order = data?.dt;

  const [nextStatus, setNextStatus] = useState(order?.order_status || "pending");

  useEffect(() => {
    setNextStatus(order?.order_status || "pending");
  }, [order?.order_status]);

  const statusOptions = useMemo(
    () => [
      { value: "pending", label: "Chờ xác nhận" },
      { value: "processing", label: "Đang xử lý" },
      { value: "shipped", label: "Đang giao" },
      { value: "delivered", label: "Đã giao" },
      { value: "cancelled", label: "Đã hủy" },
    ],
    []
  );

  const handleUpdateStatus = async () => {
    if (!orderId || !nextStatus) return;
    if (nextStatus === order?.order_status) {
      toast.info("Trạng thái không thay đổi");
      return;
    }
    try {
      await updateStatus({ orderId, order_status: nextStatus }).unwrap();
      toast.success("Cập nhật trạng thái đơn hàng thành công");
      await refetch();
      onStatusUpdated?.();
    } catch (error) {
      toast.error(error?.data?.em || "Không thể cập nhật trạng thái");
    }
  };

  if (isFetching) {
    return (
      <div className="d-flex justify-content-center py-4">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!order) {
    return <div>Không tìm thấy thông tin đơn hàng.</div>;
  }

  const statusMeta = getStatusMeta(order.order_status);
  const totalItems = order.Items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const shortId = `#${String(order._id).slice(-10)}`;
  const history = [...(order.StatusHistory || [])].sort(
    (a, b) => new Date(b.change_at) - new Date(a.change_at)
  );

  const addressLine = [
    order.shipping_address?.street,
    order.shipping_address?.ward,
    order.shipping_address?.district,
    order.shipping_address?.province,
  ]
    .filter(Boolean)
    .join(", ");

  const paymentStatus = order.payment_status || "pending";

  return (
    <div className="order-detail-modal">
      {/* Header summary */}
      <section className="card mb-3">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-7">
              <h5 className="mb-2">Chi tiết đơn hàng</h5>
              <div className="fw-bold fs-4 mb-2">{shortId}</div>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <Badge bg={statusMeta.variant}>{statusMeta.label}</Badge>
                <Badge bg="secondary">Thanh toán: {paymentStatus}</Badge>
                <span className="text-muted small">{formatDateTime(order.createdAt)}</span>
              </div>
            </div>
            <div className="col-md-5 text-md-end">
              <div className="text-muted small">Tổng thanh toán</div>
              <div className="fw-bold fs-4">{formatCurrency(order.grand_total || 0)}</div>
              <div className="text-muted">Số sản phẩm: {totalItems}</div>
              <Button
                size="sm"
                variant="outline-secondary"
                className="mt-2"
                onClick={() => refetch()}
              >
                <IoRefresh /> Tải lại
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="row g-3">
        {/* Left column */}
        <div className="col-md-4 d-flex flex-column gap-3">
          <div className="card">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Thông tin khách hàng</h6>
              <div className="fw-semibold">{order.user_id?.username || "Khách vãng lai"}</div>
              <div className="text-muted">{order.user_id?.email || "Chưa có email"}</div>
              {order.user_id?.phone && <div className="text-muted">{order.user_id.phone}</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Địa chỉ giao hàng</h6>
              <div className="fw-semibold">{order.shipping_address?.receiver}</div>
              {order.shipping_address?.phone && <div className="text-muted">{order.shipping_address.phone}</div>}
              <div className="text-muted">{addressLine || "Không rõ địa chỉ"}</div>
              {order.notes && <div className="mt-2 text-muted">Ghi chú: {order.notes}</div>}
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h6 className="fw-bold mb-2">Thanh toán & vận chuyển</h6>
              <div className="fw-semibold">
                {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method}
              </div>
              <div className="text-muted">
                Hình thức giao: {order.shipment?.method || "Không rõ"} - Phí {formatCurrency(order.shipment?.fee || 0)}
              </div>
              {order.discount_code ? (
                <div className="text-success mt-1">
                  Mã giảm: {order.discount_code} (-{formatCurrency(order.discount || 0)})
                </div>
              ) : (
                <div className="text-muted mt-1">Không áp dụng mã giảm</div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-md-8">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Sản phẩm ({totalItems} món)</h6>
              <div className="table-responsive">
                <Table hover size="sm" className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 56 }}>SP</th>
                      <th>Tên sản phẩm</th>
                      <th>Phân loại</th>
                      <th className="text-end">SL</th>
                      <th className="text-end">Đơn giá</th>
                      <th className="text-end">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.Items?.map((item, idx) => {
                      const lineTotal = (item.variant?.price || 0) * (item.quantity || 0);
                      const variantText = item.variant?.attributes
                        ?.map((attr) => `${attr.attribute}: ${attr.value}`)
                        .join(", ");
                      const fallbackAvatar = (item.product_name || "?").slice(0, 2).toUpperCase();
                      return (
                        <tr key={`${item.product_id}-${item.variant?.sku}-${idx}`}>
                          <td>
                            <div
                              className="bg-light rounded-circle text-center fw-bold"
                              style={{ width: 40, height: 40, lineHeight: "40px" }}
                            >
                              {fallbackAvatar}
                            </div>
                          </td>
                          <td className="fw-semibold">
                            <div>{item.product_name}</div>
                            <div className="text-muted small">SKU: {item.variant?.sku}</div>
                          </td>
                          <td className="text-muted small">{variantText || "—"}</td>
                          <td className="text-end">{item.quantity}</td>
                          <td className="text-end">{formatCurrency(item.variant?.price || 0)}</td>
                          <td className="text-end fw-semibold">{formatCurrency(lineTotal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              <div className="mt-3 d-flex flex-column align-items-end gap-1">
                <div className="d-flex justify-content-between w-100 w-md-75">
                  <span className="text-muted">Tạm tính</span>
                  <span>{formatCurrency(order.total_amount || 0)}</span>
                </div>
                <div className="d-flex justify-content-between w-100 w-md-75">
                  <span className="text-muted">Phí vận chuyển</span>
                  <span>{formatCurrency(order.shipment?.fee || 0)}</span>
                </div>
                <div className="d-flex justify-content-between w-100 w-md-75 text-success">
                  <span>Giảm giá</span>
                  <span>- {formatCurrency(order.discount || 0)}</span>
                </div>
                {order.points_used ? (
                  <div className="d-flex justify-content-between w-100 w-md-75 text-success">
                    <span>Điểm đã dùng</span>
                    <span>- {formatCurrency((order.points_used || 0) * 1000)}</span>
                  </div>
                ) : null}
                <div className="d-flex justify-content-between w-100 w-md-75 fw-bold fs-5">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(order.grand_total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status & history */}
      <section className="row g-3 mt-2">
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Cập nhật trạng thái</h6>
              <div className="d-flex flex-column flex-sm-row gap-2 align-items-start align-items-sm-center">
                <Form.Select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value)}
                  className="w-auto"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Form.Select>
                <Button
                  onClick={handleUpdateStatus}
                  disabled={isUpdating || !nextStatus || nextStatus === order.order_status}
                >
                  {isUpdating ? "Đang cập nhật..." : "Lưu"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Lịch sử trạng thái</h6>
              {history.length ? (
                <div className="list-group list-group-flush">
                  {history.map((entry, idx) => {
                    const meta = getStatusMeta(entry.status);
                    return (
                      <div key={`${entry.change_at}-${idx}`} className="list-group-item px-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <Badge bg={meta.variant}>{meta.label}</Badge>
                          <span className="text-muted small">{formatDateTime(entry.change_at)}</span>
                        </div>
                        <div className="text-muted small">by {entry.change_by?.username || "Hệ thống"}</div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-muted">Chưa có lịch sử trạng thái.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderDetailModal;
