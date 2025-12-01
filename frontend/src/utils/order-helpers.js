export const ORDER_STATUS_META = {
  pending: { label: "Chờ xác nhận", variant: "warning" },
  processing: { label: "Đang xử lý", variant: "info" },
  confirmed: { label: "Đã xác nhận", variant: "info" },
  shipped: { label: "Đang giao", variant: "primary" },
  shipping: { label: "Đang giao", variant: "primary" },
  delivered: { label: "Đã giao", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "secondary" },
};

export const PAYMENT_STATUS_META = {
  pending: { label: "Chờ thanh toán", variant: "warning" },
  paid: { label: "Đã thanh toán", variant: "success" },
  failed: { label: "Thanh toán lỗi", variant: "danger" },
  refunded: { label: "Hoàn tiền", variant: "secondary" },
};

export const getOrderStatusMeta = (status) =>
  ORDER_STATUS_META[status] || { label: status || "Không rõ", variant: "light" };

export const getPaymentStatusMeta = (status) =>
  PAYMENT_STATUS_META[status] || { label: status || "Không rõ", variant: "light" };

export const formatOrderCode = (orderId) =>
  orderId ? `#${String(orderId).slice(-8)}` : "—";
