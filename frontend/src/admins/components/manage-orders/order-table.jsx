import { Fragment, useMemo } from "react";
import { Badge, Button } from "react-bootstrap";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { IoEye, IoBagOutline } from "react-icons/io5";

import { formatCurrency, formatDateTime } from "utils/format";
import { PAYMENT_STATUS_META } from "#utils";

const columnHelper = createColumnHelper();

export const STATUS_META = {
  pending: { label: "Chờ xác nhận", variant: "warning" },
  processing: { label: "Đang xử lý", variant: "info" },
  shipped: { label: "Đang giao", variant: "primary" },
  delivered: { label: "Đã giao", variant: "success" },
  cancelled: { label: "Đã hủy", variant: "secondary" },
};

export const getStatusBadge = (status) => STATUS_META[status] || { label: status || "Không rõ", variant: "light" };
export const getPaymentBadge = (status) => PAYMENT_STATUS_META[status] || { label: status || "Không rõ", variant: "light" };

const renderUserCell = (user) => {
  if (!user) return <div className="text-muted">Khách vãng lai</div>;
  return (
    <div className="user-cell">
      <div className="avatar">
        <IoBagOutline />
      </div>
      <div>
        <div className="user-name">{user.username || "Không rõ tên"}</div>
        <div className="user-email text-muted">{user.email || "Chưa có email"}</div>
      </div>
    </div>
  );
};

const OrderTable = ({ orders = [], isLoading = false, onViewDetail }) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("_id", {
        header: "Mã đơn",
        cell: ({ getValue }) => {
          const value = getValue();
          const shortId = value ? `#${String(value).slice(-8)}` : "—";
          return (
            <div className="order-id" title={value}>
              {shortId}
            </div>
          );
        },
        meta: { thStyle: { width: "120px" } },
      }),
      columnHelper.display({
        id: "buyer",
        header: "Người mua",
        cell: ({ row }) => renderUserCell(row.original.user_id),
      }),
      columnHelper.accessor("createdAt", {
        header: "Ngày đặt",
        cell: ({ getValue }) => formatDateTime(getValue()),
        meta: { thStyle: { width: "170px" } },
      }),
      columnHelper.accessor("order_status", {
        header: "Trạng thái",
        cell: ({ getValue }) => {
          const meta = getStatusBadge(getValue());
          return (
            <Badge bg={meta.variant} className="text-uppercase">
              {meta.label}
            </Badge>
          );
        },
        meta: { thStyle: { width: "130px" } },
      }),
      columnHelper.accessor("payment_status", {
        header: "Thanh toán",
        cell: ({ getValue }) => {
          const meta = getPaymentBadge(getValue());
          return <Badge bg={meta.variant}>{meta.label}</Badge>;
        },
        meta: { thStyle: { width: "140px" } },
      }),
      columnHelper.display({
        id: "itemsCount",
        header: "Số SP",
        cell: ({ row }) => row.original.Items?.length ?? 0,
        meta: { thStyle: { width: "80px" } },
      }),
      columnHelper.accessor("grand_total", {
        header: "Thành tiền",
        cell: ({ getValue, row }) => {
          const discount = row.original.discount || 0;
          const discountCode = row.original.discount_code;
          return (
            <div className="d-flex flex-column gap-1">
              <div className="fw-semibold">{formatCurrency(getValue() || 0)}</div>
              {discount > 0 && (
                <small className="text-success">- {formatCurrency(discount)} {discountCode ? `(${discountCode})` : ""}</small>
              )}
            </div>
          );
        },
        meta: { thStyle: { width: "160px" } },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="d-flex gap-1 justify-content-end">
            <Button
              size="sm"
              variant="outline-primary"
              onClick={() => onViewDetail?.(row.original._id)}
              title="Xem chi tiết"
              aria-label="Xem chi tiết đơn hàng"
            >
              <IoEye />
            </Button>
          </div>
        ),
        meta: { thStyle: { width: "90px" } },
      }),
    ],
    [onViewDetail]
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <IoBagOutline size={48} />
          <h3>Chưa có đơn hàng</h3>
          <p>Hãy điều chỉnh bộ lọc hoặc thử mã đơn khác.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container orders-table">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={header.column.columnDef.meta?.thStyle}
                  scope="col"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
