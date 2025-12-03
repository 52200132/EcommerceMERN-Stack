import { useEffect, useMemo, useState } from "react";
import { PaginationControl } from "react-bootstrap-pagination-control";
import { Button, Form } from "react-bootstrap";
import { IoFilter, IoRefresh, IoSearch } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import TableUsers from "admins/components/manage-users/table-users";
import UserDetailForm from "admins/components/manage-users/user-detail-form";
import {
  useGetAllUsersQuery,
  useToggleBanUserMutation,
  useUpdateUserByIdMutation
} from "services/admin-services";

import "./manage-users-page.scss";
import { userModalDialogStore, useShallow } from "#custom-hooks";

const ManageUsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const limit = Math.max(parseInt(searchParams.get("limit") || "10", 10), 1);
  const status = searchParams.get("status") || "all";
  const role = searchParams.get("role") || "all";
  const qParam = searchParams.get("q") || "";
  const pageSizes = [5, 10, 20, 50];

  const [searchText, setSearchText] = useState(qParam);
  const { setShow, setTitle, setBodyComponent, setBodyProps } = userModalDialogStore(useShallow((zs) => ({
    setShow: zs.setShow,
    setTitle: zs.setTitle,
    setBodyComponent: zs.setBodyComponent,
    setBodyProps: zs.setBodyProps,
  })));

  useEffect(() => {
    setSearchText(qParam);
  }, [qParam]);

  const queryArgs = useMemo(() => ({
    page,
    limit,
    status,
    role,
    q: qParam
  }), [page, limit, status, role, qParam]);

  const { data, isLoading, isFetching, refetch } = useGetAllUsersQuery(queryArgs);
  const [toggleBanUser, { isLoading: isTogglingBan }] = useToggleBanUserMutation();
  const [updateUserById, { isLoading: isUpdatingUser }] = useUpdateUserByIdMutation();

  const users = data?.dt?.users || [];
  const total = data?.dt?.total || 0;

  useEffect(() => {
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    if (page > totalPages) {
      updateParams({ page: totalPages }, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, total, limit]);

  const updateParams = (nextEntries, resetPage = false) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(nextEntries).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === "all") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    if (resetPage) {
      next.set("page", "1");
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: searchText.trim() || null }, true);
  };

  const handleStatusChange = (value) => updateParams({ status: value || null }, true);
  const handleRoleChange = (value) => updateParams({ role: value || null }, true);
  const handleLimitChange = (value) => updateParams({ limit: value }, true);
  const handlePageChange = (nextPage) => updateParams({ page: nextPage }, false);
  const handleResetFilters = () => {
    setSearchText("");
    setSearchParams({});
  };

  const handleToggleBan = async (user, nextState, reason) => {
    try {
      await toggleBanUser({
        userId: user._id,
        is_banned: nextState,
        banned_reason: nextState ? reason : null,
      }).unwrap();
      toast.success(nextState ? "Đã cấm tài khoản" : "Đã gỡ cấm");
    } catch (error) {
      toast.error(error?.em || "Không thể cập nhật trạng thái cấm");
    }
  };

  const handleToggleActive = async (user, nextState) => {
    try {
      await updateUserById({
        userId: user._id,
        usersPayload: {
          isActive: nextState,
          is_banned: nextState ? false : user.is_banned,
          banned_reason: nextState ? null : user.banned_reason,
        }
      }).unwrap();
      toast.success(nextState ? "Đã kích hoạt tài khoản" : "Đã tạm ngưng tài khoản");
    } catch (error) {
      toast.error(error?.em || "Không thể cập nhật người dùng");
    }
  };

  const handleToggleManager = async (user, nextState) => {
    try {
      await updateUserById({
        userId: user._id,
        usersPayload: { isManager: nextState }
      }).unwrap();
      toast.success(nextState ? "Đã cấp quyền quản trị" : "Đã thu hồi quyền quản trị");
    } catch (error) {
      toast.error(error?.em || "Không thể cập nhật vai trò");
    }
  };

  const handleViewDetails = (userId) => {
    setTitle("Chi tiết người dùng");
    setBodyComponent(UserDetailForm);
    setBodyProps({
      userId,
      onUpdated: () => refetch(),
    });
    setShow(true);
  };

  const isBusy = isLoading || isFetching || isTogglingBan || isUpdatingUser;

  return (
    <div className="tps-manage-users-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý người dùng</h1>
          <p className="page-subtitle">Tìm kiếm, lọc, xem chi tiết và chỉnh sửa thông tin người dùng</p>
        </div>
        <Button title="Làm mới" variant="outline-secondary" onClick={() => refetch()}>
          <IoRefresh size={16} />
        </Button>
      </div>

      <div className="filters-panel">
        <form className="filters-grid" onSubmit={handleSearchSubmit}>
          <div className="filter-item search-box">
            <label htmlFor="search-users">Tìm kiếm</label>
            <div className="search-input">
              <IoSearch size={16} />
              <input
                id="search-users"
                type="text"
                placeholder="Tên hoặc email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button type="submit" size="sm" variant="primary">
                Tìm
              </Button>
            </div>
          </div>

          <div className="filter-item">
            <label htmlFor="status-filter">Trạng thái</label>
            <Form.Select
              id="status-filter"
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngưng hoạt động</option>
              <option value="banned">Đang bị cấm</option>
            </Form.Select>
          </div>

          <div className="filter-item">
            <label htmlFor="role-filter">Vai trò</label>
            <Form.Select
              id="role-filter"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="manager">Quản trị</option>
              <option value="user">Khách hàng</option>
            </Form.Select>
          </div>

          <div className="filter-actions">
            <Button variant="outline-secondary" onClick={handleResetFilters}>
              <IoFilter size={16} /> Xóa lọc</Button>
          </div>
        </form>
      </div>

      <TableUsers
        users={users}
        isLoading={isBusy}
        onToggleBan={handleToggleBan}
        onToggleActive={handleToggleActive}
        onToggleManager={handleToggleManager}
        onViewDetails={handleViewDetails}
      />

      <div className="pagination-bar">
        <div className="page-size-row">
          <Form.Select
            className="w-auto"
            size="sm"
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>{size} / trang</option>
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

export default ManageUsersPage;
