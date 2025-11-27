import { useEffect, useMemo } from "react";
import { Button, Col, Form, Row, Spinner, Badge, Stack } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import { userDetailsSchema } from "#schemas";
import { formatDateTime } from "utils/format";
import { userModalDialogStore } from "#custom-hooks";
import { useGetUserByIdQuery, useUpdateUserByIdMutation } from "services/admin-services";
import { IoRefresh } from "react-icons/io5";

const defaultValues = {
  username: "",
  email: "",
  gender: "",
  points: 0,
  isActive: true,
  isManager: false,
  is_banned: false,
  banned_reason: "",
};

const UserDetailForm = ({ userId, onUpdated }) => {
  const { data, isFetching, refetch } = useGetUserByIdQuery(userId, { skip: !userId });
  const [updateUser, { isLoading }] = useUpdateUserByIdMutation();
  const user = data?.dt;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(userDetailsSchema),
    defaultValues,
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email || "",
        gender: user.gender || "",
        points: user.points ?? 0,
        isActive: user.isActive ?? true,
        isManager: user.isManager ?? false,
        is_banned: user.is_banned ?? false,
        banned_reason: user.banned_reason || "",
      });
    }
  }, [user, reset]);

  const isBanned = watch("is_banned");
  const isActive = watch("isActive");
  const isManager = watch("isManager");

  const statusBadge = useMemo(() => {
    if (isBanned) return { variant: "danger", label: "Đang bị cấm" };
    if (isActive === false) return { variant: "secondary", label: "Ngưng hoạt động" };
    return { variant: "success", label: "Đang hoạt động" };
  }, [isBanned, isActive]);

  const onSubmit = async (values) => {
    try {
      const payload = {
        username: values.username.trim(),
        email: values.email.trim(),
        gender: values.gender || undefined,
        points: Number(values.points) || 0,
        isActive: values.isActive ?? true,
        isManager: values.isManager ?? false,
        is_banned: values.is_banned ?? false,
        banned_reason: values.is_banned ? values.banned_reason || "Vi phạm chính sách" : null,
      };
      await updateUser({ userId, usersPayload: payload }).unwrap();
      toast.success("Cập nhật người dùng thành công");
      onUpdated?.();
      userModalDialogStore.getState().setShow(false);
    } catch (error) {
      toast.error(error?.em || "Cập nhật người dùng thất bại");
    }
  };

  if (!user && isFetching) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Đang tải dữ liệu người dùng...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-4">
        <p className="mb-3">Không tìm thấy dữ liệu người dùng.</p>
        <Button variant="outline-secondary" onClick={() => refetch()}>
          Thử tải lại
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="user-detail-form">
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-3">
        <div>
          <h5 className="mb-1">{user.username}</h5>
          <div className="text-muted">{user.email}</div>
        </div>
        <Stack direction="horizontal" gap={2}>
          <Badge bg={statusBadge.variant}>{statusBadge.label}</Badge>
          <Badge bg={isManager ? "primary" : "light"} text={isManager ? "light" : "dark"}>
            {isManager ? "Quản trị viên" : "Khách hàng"}
          </Badge>
        </Stack>
      </div>

      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="username">
            <Form.Label>Tên người dùng</Form.Label>
            <Form.Control
              placeholder="Nhập tên người dùng"
              isInvalid={!!errors.username}
              {...register("username")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Nhập email"
              isInvalid={!!errors.email}
              {...register("email")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="gender">
            <Form.Label>Giới tính</Form.Label>
            <Form.Select {...register("gender")}>
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="points">
            <Form.Label>Điểm tích lũy</Form.Label>
            <Form.Control
              type="number"
              min={0}
              step={1}
              isInvalid={!!errors.points}
              {...register("points")}
            />
            <Form.Control.Feedback type="invalid">
              {errors.points?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col xs={12}>
          <Row>
            <Col md={4}>
              <Form.Group controlId="isManager" className="d-flex align-items-center h-100">
                <Form.Check
                  type="switch"
                  id="manager-switch"
                  label="Cấp quyền quản trị"
                  {...register("isManager")}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="isActive" className="d-flex align-items-center h-100">
                <Form.Check
                  type="switch"
                  id="active-switch"
                  label="Cho phép hoạt động"
                  {...register("isActive")}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="is_banned" className="d-flex align-items-center h-100">
                <Form.Check
                  type="switch"
                  id="ban-switch"
                  label="Cấm tài khoản"
                  {...register("is_banned")}
                />
              </Form.Group>
            </Col>
          </Row>
        </Col>
        <Col md={8}>
          <Form.Group controlId="banned_reason">
            <Form.Label>Lý do cấm</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Nhập lý do nếu cấm tài khoản"
              disabled={!isBanned}
              {...register("banned_reason")}
            />
          </Form.Group>
        </Col>
      </Row>

      <div className="mt-4">
        <h6 className="text-muted">Meta data</h6>
        <div className="d-flex flex-wrap gap-3 small text-muted">
          <span>Đã tạo: {formatDateTime(user.createdAt)}</span>
          <span>Cập nhật: {formatDateTime(user.updatedAt)}</span>
          {user.token && <span>Token: {user.token}</span>}
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
        <Button title="làm mới" variant="outline-secondary" onClick={() => refetch()} disabled={isFetching}>
          <IoRefresh size={16} />
        </Button>
        <Button type="submit" disabled={isLoading || isFetching || !isDirty}>
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </Form>
  );
};

export default UserDetailForm;
