import { Fragment, useMemo, useState } from "react";
import { Dropdown, Badge, Button } from "react-bootstrap";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  IoEllipsisVertical,
  IoBan,
  IoCheckmarkCircle,
  IoPerson,
  IoShieldCheckmark,
  IoEye,
} from "react-icons/io5";

import { formatDateTime } from "utils/format";
import { confirmation } from "#utils/confirmation";

const columnHelper = createColumnHelper();

const getStatusBadge = (user) => {
  if (user.is_banned) return { label: "Đang bị cấm", variant: "danger" };
  if (user.isActive === false) return { label: "Ngưng hoạt động", variant: "secondary" };
  return { label: "Đang hoạt động", variant: "success" };
};

const TableUsers = ({
  users = [],
  isLoading = false,
  onToggleBan,
  onToggleActive,
  onToggleManager,
  onViewDetails,
}) => {
  const [rowSelection, setRowSelection] = useState({});
  const columns = useMemo(() => {
    const handleToggleBan = async (user) => {
      if (!onToggleBan) return;
      if (user.is_banned) {
        onToggleBan(user, false, null);
        return;
      }
      let reason = "";
      const confirm = await confirmation({
        message: <input onChange={(e) => reason = e.target.value} defaultValue={user.banned_reason || "Vi phạm chính sách"} className="w-100" type="text"></input>,
        title: "Nhập lý do cấm",
      })
      // const reason = window.prompt("Nhập lý do cấm", user.banned_reason || "Vi phạm chính sách");
      if (confirm) {
        onToggleBan(user, true, reason);
      }
    }
    return [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="form-check-input"
            ref={el => {
              if (el && typeof el.indeterminate === "boolean") {
                el.indeterminate = !el.checked && table.getIsSomeRowsSelected();
              }
            }}
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="form-check-input"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        meta: { thStyle: { width: "40px" } }
      }),
      columnHelper.accessor("username", {
        header: "Người dùng",
        cell: ({ row, getValue }) => {
          const user = row.original;
          const avatarFallback = (user.username || "?").charAt(0).toUpperCase();
          return (
            <div className="user-cell">
              <div className="avatar">
                {user.image ? (
                  <img src={user.image} alt={user.username || "user avatar"} />
                ) : (
                  avatarFallback
                )}
              </div>
              <div>
                <div className="user-name">{getValue()}</div>
                <div className="user-email text-muted">{user.email}</div>
              </div>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "role",
        header: "Vai trò",
        accessorFn: (row) => row.isManager,
        cell: ({ getValue }) => (
          <Badge bg={getValue() ? "primary" : "light"} text={getValue() ? "light" : "dark"}>
            {getValue() ? "Quản trị" : "Khách hàng"}
          </Badge>
        ),
        meta: { thStyle: { width: "120px" } }
      }),
      columnHelper.display({
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => {
          const status = getStatusBadge(row.original);
          return (
            <Badge bg={status.variant}>{status.label}</Badge>
          );
        },
        meta: { thStyle: { width: "120px" } }
      }),
      columnHelper.accessor("points", {
        header: "Điểm",
        cell: ({ getValue }) => getValue() ?? 0,
        meta: { thStyle: { width: "100px" } }
      }),
      columnHelper.accessor("createdAt", {
        header: "Tạo lúc",
        cell: ({ getValue }) => formatDateTime(getValue()),
        meta: { thStyle: { width: "160px" } }
      }),
      columnHelper.display({
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="d-flex align-items-center gap-2">
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() => onViewDetails?.(user._id)}
                title="Xem chi tiết"
              >
                <IoEye size={14} />
              </Button>
              <Dropdown align="end">
                <Dropdown.Toggle
                  bsPrefix="tps-dropdown-toggle"
                  as="button"
                  className="btn btn-sm btn-link text-muted p-0"
                  id={`dropdown-${user._id}`}
                >
                  <IoEllipsisVertical size={16} />
                </Dropdown.Toggle>
                <Dropdown.Menu as="ul">
                  <Dropdown.Item as="li" onClick={() => onToggleActive?.(user, !user.isActive)}>
                    <IoCheckmarkCircle size={14} className="me-2" />
                    {user.isActive ? "Tạm ngưng" : "Kích hoạt"}
                  </Dropdown.Item>
                  <Dropdown.Item as="li" onClick={() => onToggleManager?.(user, !user.isManager)}>
                    <IoShieldCheckmark size={14} className="me-2" />
                    {user.isManager ? "Thu hồi quản trị" : "Cấp quản trị"}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    as="li"
                    className="text-danger"
                    onClick={() => handleToggleBan(user)}
                  >
                    <IoBan size={14} className="me-2" />
                    {user.is_banned ? "Gỡ cấm" : "Cấm tài khoản"}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          );
        },
        meta: { thStyle: { width: "220px" } }
      }),
    ]
  }, [onToggleActive, onToggleManager, onToggleBan, onViewDetails]);

  const table = useReactTable({
    data: users,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getRowId: (row) => row._id || row.id,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <IoPerson size={48} />
          <h3>Chưa có người dùng</h3>
          <p>Hãy thay đổi bộ lọc hoặc nhập từ khóa khác.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table table-hover">
        <thead className="table-light">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={header.column.columnDef.meta?.thStyle}
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

export default TableUsers;
