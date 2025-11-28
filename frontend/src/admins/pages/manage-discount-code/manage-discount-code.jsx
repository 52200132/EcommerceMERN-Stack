import { useEffect, useMemo, useState } from "react";
import { Button, Form, Spinner, Badge } from "react-bootstrap";
import { PaginationControl } from "react-bootstrap-pagination-control";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { IoAdd, IoFilter, IoRefresh, IoSearch, IoEye, IoPencil, IoTrash } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";

import {
  useDeleteDiscountCodeMutation,
  useGetDiscountCodesQuery,
  useLazyGetOrdersByDiscountCodeQuery,
} from "services/admin-services";
import { formatCurrency, formatDateTime } from "utils/format";
import { userModalDialogStore, useShallow } from "#custom-hooks";
import DiscountCreateForm from "#a-components/manage-discount-code/discout-create-form";

import "./manage-discount-code.scss";

const PAGE_SIZES = [5, 10, 20];

const ManageDiscountCodePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);
  const qParam = searchParams.get("q") || "";

  const [searchText, setSearchText] = useState(qParam);

  const { setShow, setTitle, setBodyComponent, setBodyProps, setSize } = userModalDialogStore(
    useShallow((zs) => ({
      setShow: zs.setShow,
      setTitle: zs.setTitle,
      setBodyComponent: zs.setBodyComponent,
      setBodyProps: zs.setBodyProps,
      setSize: zs.setSize,
    }))
  );

  useEffect(() => {
    setSearchText(qParam);
  }, [qParam]);

  const queryArgs = useMemo(
    () => ({
      page,
      limit,
      q: qParam,
      includeOrders: false,
    }),
    [page, limit, qParam]
  );

  const { data, isLoading, isFetching, refetch } = useGetDiscountCodesQuery(queryArgs);
  const [deleteDiscountCode, { isLoading: isDeleting }] = useDeleteDiscountCodeMutation();

  const discounts = data?.dt?.codes || [];
  const total = data?.dt?.total || 0;
  const pages = data?.dt?.pages || 1;

  const updateParams = (entries, resetPage = false) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (resetPage) next.set("page", "1");
    setSearchParams(next);
  };

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    if (page > totalPages) updateParams({ page: totalPages }, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, total, limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: searchText.trim() || null }, true);
  };

  const handleLimitChange = (value) => updateParams({ limit: value }, true);
  const handlePageChange = (nextPage) => updateParams({ page: nextPage }, false);
  const handleResetFilters = () => {
    setSearchText("");
    setSearchParams({});
  };

  const isBusy = isLoading || isFetching;

  const openCreateModal = () => {
    setTitle("Tạo mã giảm giá");
    setBodyComponent(DiscountCreateForm);
    setBodyProps({ onSuccess: () => refetch() });
    setSize("md");
    setShow(true);
  };

  const openEditModal = (code) => {
    setTitle(`Chỉnh sửa: ${code.code}`);
    setBodyComponent(DiscountCreateForm);
    setBodyProps({
      mode: "edit",
      id: code._id,
      defaultValues: {
        code: code.code,
        valueType: code.valueType,
        value: code.value,
        maxUsage: code.maxUsage,
        minOrderValue: code.minOrderValue,
        isActive: code.isActive,
      },
      onSuccess: () => refetch(),
    });
    setSize("md");
    setShow(true);
  };

  const openDetailModal = (code) => {
    setTitle(`Mã giảm: ${code}`);
    setBodyComponent(DiscountDetailModal);
    setBodyProps({ code });
    setSize("lg");
    setShow(true);
  };

  const handleDelete = async (code) => {
    const confirmDelete = window.confirm(`Xóa mã ${code.code}?`);
    if (!confirmDelete) return;
    try {
      await deleteDiscountCode(code._id).unwrap();
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Mã giảm",
        accessorKey: "code",
        cell: ({ getValue }) => <span className="fw-semibold">{getValue()}</span>,
      },
      {
        header: "Ngày tạo",
        accessorKey: "createdAt",
        cell: ({ getValue }) => formatDateTime(getValue()),
      },
      {
        header: "Giá trị",
        accessorKey: "value",
        cell: ({ row }) =>
          row.original.valueType === "percent"
            ? `${row.original.value}%`
            : formatCurrency(row.original.value || 0),
      },
      {
        header: "Đã dùng / Tối đa",
        accessorKey: "usedCount",
        cell: ({ row }) => {
          const used = row.original.usageCount ?? row.original.usedCount ?? 0;
          const max = row.original.maxUsage ?? 0;
          const remain = Math.max(max - used, 0);
          return (
            <div className="d-flex gap-1 align-items-center">
              <Badge bg="light" text="dark">
                {used}/{max}
              </Badge>
              {remain <= 0 ? (
                <Badge bg="secondary">Hết</Badge>
              ) : (
                <Badge bg="success">Còn {remain}</Badge>
              )}
            </div>
          );
        },
      },
      {
        header: "Trạng thái",
        accessorKey: "isActive",
        cell: ({ getValue }) => (
          <Badge bg={getValue() ? "success" : "secondary"}>{getValue() ? "Đang hoạt động" : "Ngừng"}</Badge>
        ),
      },
      {
        id: "actions",
        header: "Thao tác",
        cell: ({ row }) => (
          <div className="d-flex gap-1">
            <Button
              size="sm"
              variant="outline-primary"
              title="Xem chi tiết"
              aria-label="Xem chi tiết"
              onClick={() => openDetailModal(row.original.code)}
            >
              <IoEye />
            </Button>
            <Button
              size="sm"
              variant="outline-secondary"
              title="Chỉnh sửa"
              aria-label="Chỉnh sửa"
              onClick={() => openEditModal(row.original)}
            >
              <IoPencil />
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              title="Xóa"
              aria-label="Xóa"
              disabled={isDeleting}
              onClick={() => handleDelete(row.original)}
            >
              <IoTrash />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDeleting]
  );

  const table = useReactTable({
    data: discounts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: pages,
    state: {
      pagination: { pageIndex: page - 1, pageSize: limit },
    },
  });

  return (
    <div className="tps-manage-discount-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý mã giảm giá</h1>
          <p className="page-subtitle">Tìm kiếm, tạo mới và xem chi tiết mã giảm giá</p>
        </div>
        <div className="header-actions">
          <Button title="Tải lại" variant="outline-secondary" onClick={() => refetch()} disabled={isBusy}>
            <IoRefresh size={16} />
          </Button>
          <Button title="Tạo mã giảm giá" onClick={openCreateModal}>
            <IoAdd className="me-1" /> Tạo mã
          </Button>
        </div>
      </div>

      <div className="filters-panel">
        <form className="filters-grid" onSubmit={handleSearchSubmit}>
          <div className="filter-item search-box">
            <label htmlFor="search-discounts">Tìm kiếm</label>
            <div className="search-input">
              <IoSearch size={16} />
              <input
                id="search-discounts"
                type="text"
                placeholder="Tìm theo mã giảm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button type="submit" size="sm" variant="primary">
                Tìm
              </Button>
            </div>
          </div>

          <div className="filter-actions">
            <Button type="button" variant="outline-secondary" onClick={handleResetFilters}>
              <IoFilter size={16} /> Xóa lọc
            </Button>
          </div>
        </form>
      </div>

      <div className="table-container">
        {isBusy ? (
          <div className="loading-state">
            <div className="spinner" />
            <h3>Đang tải mã giảm giá</h3>
            <p>Vui lòng đợi trong giây lát.</p>
          </div>
        ) : discounts.length ? (
          <div className="table-responsive discount-table">
            <table className="table align-middle">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>Chưa có mã giảm giá</h3>
            <p>Nhấn "Tạo mã" để thêm mã giảm giá đầu tiên.</p>
          </div>
        )}
      </div>

      <div className="pagination-bar">
        <div className="page-size-row">
          <Form.Select
            className="w-auto"
            size="sm"
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
          >
            {PAGE_SIZES.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / trang
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="pagination-row">
          <PaginationControl
            page={page}
            between={3}
            total={total}
            limit={limit}
            changePage={handlePageChange}
            next
            last
            ellipsis={1}
          />
        </div>
      </div>
    </div>
  );
};

const DiscountDetailModal = ({ code }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState("");
  const [trigger, { data, isFetching }] = useLazyGetOrdersByDiscountCodeQuery();

  useEffect(() => {
    if (!code) return;
    trigger({ code, page, limit, q: search });
  }, [code, page, limit, search, trigger]);

  const orders = data?.dt?.orders || [];
  const total = data?.dt?.total || 0;

  return (
    <div className="orders-list">
      <div className="d-flex align-items-center gap-2 mb-2">
        <IoSearch />
        <Form.Control
          placeholder="Tìm theo mã đơn"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {isFetching ? (
        <div className="d-flex justify-content-center py-3">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {orders.map((order) => (
            <div key={order._id} className="orders-list__item">
              <div>
                <div className="fw-semibold">Đơn: {order._id}</div>
                <div className="text-muted small">
                  User: {order.user_id?.username || "N/A"} {order.user_id?.email ? `(${order.user_id.email})` : ""}
                </div>
                <div className="text-muted small">Ngày: {formatDateTime(order.createdAt)}</div>
              </div>
              <div className="orders-list__meta">
                <Badge bg="info" pill>
                  {order.order_status}
                </Badge>
                <div className="fw-semibold">{formatCurrency(order.grand_total || 0)}</div>
                {order.discount ? <div className="text-success">- {formatCurrency(order.discount)}</div> : null}
              </div>
            </div>
          ))}
          {!orders.length && <div className="text-muted text-center py-2">Chưa có đơn hàng.</div>}
          <div className="d-flex justify-content-center mt-3">
            <PaginationControl
              page={page}
              between={3}
              total={total}
              limit={limit}
              changePage={(p) => setPage(p)}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ManageDiscountCodePage;
