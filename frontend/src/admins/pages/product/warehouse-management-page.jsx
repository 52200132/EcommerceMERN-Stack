import { useCallback, useMemo } from "react";
import { Badge, Button, Card, Spinner, Table } from "react-bootstrap";
import { IoAdd, IoArrowBack, IoPencil, IoRefresh, IoStorefront, IoTrash } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import ConfirmDialog from "admins/components/common/confirm-dialog";
import WarehouseForm from "admins/components/products/forms/warehouse-form";
import WarehouseVariantForm from "admins/components/products/forms/warehouse-variant-form";
import { userModalDialogStore, useShallow } from "#custom-hooks";
import {
  useCreateWarehouseAdminMutation,
  useCreateWarehouseVariantAdminMutation,
  useDeleteWarehouseAdminMutation,
  useDeleteWarehouseVariantAdminMutation,
  useGetProductByIdAdminQuery,
  useGetWarehousesByProductQuery,
  useUpdateWarehouseAdminMutation,
  useUpdateWarehouseVariantAdminMutation,
} from "services/admin-services";

import "./warehouse-page.scss";

const ProductWarehousePage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const { data: productData, isLoading: isLoadingProduct } = useGetProductByIdAdminQuery(productId, {
    skip: !productId,
  });
  const product = productData?.dt;

  const {
    data: warehousesData,
    isFetching: isFetchingWarehouses,
    refetch: refetchWarehouses,
  } = useGetWarehousesByProductQuery(productId, { skip: !productId });
  const warehouses = warehousesData?.dt || [];

  const { push, reset: resetModal } = userModalDialogStore(useShallow((zs) => ({
    push: zs.push,
    reset: zs.reset,
  })));

  const openConfirmDialog = useCallback(({ title, message, confirmText = "Xác nhận", variant = "danger", onConfirm }) => {
    push({
      title,
      bodyComponent: ConfirmDialog,
      bodyProps: { message },
      size: "sm",
      buttons: [
        <Button key="cancel" variant="secondary" onClick={resetModal}>Hủy</Button>,
        <Button
          key="confirm"
          variant={variant}
          onClick={async () => {
            await onConfirm?.();
            resetModal();
          }}
        >
          {confirmText}
        </Button>,
      ],
    });
  }, [push, resetModal]);

  const [createWarehouse, { isLoading: isCreatingWarehouse }] = useCreateWarehouseAdminMutation();
  const [updateWarehouse] = useUpdateWarehouseAdminMutation();
  const [removeWarehouse] = useDeleteWarehouseAdminMutation();
  const [createWarehouseVariant, { isLoading: isCreatingVariant }] = useCreateWarehouseVariantAdminMutation();
  const [updateWarehouseVariant, { isLoading: isUpdatingVariant }] = useUpdateWarehouseVariantAdminMutation();
  const [deleteWarehouseVariant] = useDeleteWarehouseVariantAdminMutation();

  const stats = useMemo(() => {
    const totalWarehouses = warehouses.length;
    const { totalSku, totalAvailable } = warehouses.reduce((acc, wh) => {
      const variants = wh.warehouse_variants || [];
      acc.totalSku += variants.length;
      variants.forEach((variant) => {
        const available = (variant.quantity || 0) - (variant.waiting_for_delivery || 0);
        acc.totalAvailable += Math.max(available, 0);
      });
      return acc;
    }, { totalSku: 0, totalAvailable: 0 });
    return { totalWarehouses, totalSku, totalAvailable };
  }, [warehouses]);
  const categoryLabel = product?.category_name || product?.category_id?.category_name;

  const handleAddWarehouse = () => {
    push({
      title: "Thêm kho hàng",
      bodyComponent: WarehouseForm,
      bodyProps: {
        submitting: isCreatingWarehouse,
        onSubmit: async (values) => {
          try {
            await createWarehouse({
              productId,
              payload: { ...values, warehouse_variants: [] },
            }).unwrap();
            toast.success("Đã thêm kho");
            resetModal();
            refetchWarehouses();
          } catch (error) {
            toast.error(error?.em || "Không thể tạo kho mới");
          }
        }
      }
    });
  };

  const handleEditWarehouse = (warehouse) => {
    push({
      title: `Cập nhật kho ${warehouse.name}`,
      bodyComponent: WarehouseForm,
      bodyProps: {
        defaultValues: { name: warehouse.name, location: warehouse.location },
        onSubmit: async (values) => {
          try {
            await updateWarehouse({ productId, warehouseId: warehouse._id, payload: values }).unwrap();
            toast.success("Đã cập nhật kho");
            resetModal();
            refetchWarehouses();
          } catch (error) {
            toast.error(error?.em || "Không thể cập nhật kho");
          }
        }
      }
    });
  };

  const handleDeleteWarehouse = (warehouse) => {
    openConfirmDialog({
      title: "Xóa kho hàng",
      message: `Xóa kho "${warehouse.name}" khỏi sản phẩm này?`,
      confirmText: "Xóa kho",
      onConfirm: async () => {
        try {
          await removeWarehouse({ productId, warehouseId: warehouse._id }).unwrap();
          toast.success("Đã xóa kho");
          refetchWarehouses();
        } catch (error) {
          toast.error(error?.em || "Không thể xóa kho");
        }
      }
    });
  };

  const productVariants = useMemo(() => product?.Variants || [], [product]);

  const handleVariantForm = (warehouse, variant) => {
    const existingSkus = new Set((warehouse.warehouse_variants || []).map((v) => v.sku));
    const availableSkus = productVariants
      .map((v) => v.sku)
      .filter((sku) => !existingSkus.has(sku));

    if (!variant && availableSkus.length === 0) {
      toast.info("Kho đã có đủ tất cả SKU của sản phẩm.");
      return;
    }

    push({
      title: variant ? `Cập nhật SKU ${variant.sku}` : `Thêm SKU cho ${warehouse.name}`,
      bodyComponent: WarehouseVariantForm,
      bodyProps: {
        defaultValues: variant ? {
          sku: variant.sku,
          quantity: variant.quantity || 0,
          waiting_for_delivery: variant.waiting_for_delivery || 0,
        } : undefined,
        disableSku: !!variant,
        submitting: isCreatingVariant || isUpdatingVariant,
        availableSkus,
        onSubmit: async (values) => {
          try {
            if (variant) {
              await updateWarehouseVariant({
                productId,
                warehouseId: warehouse._id,
                sku: variant.sku,
                payload: values,
              }).unwrap();
              toast.success("Đã cập nhật SKU");
            } else {
              await createWarehouseVariant({
                productId,
                warehouseId: warehouse._id,
                payload: values,
              }).unwrap();
              toast.success("Đã thêm SKU mới");
            }
            resetModal();
            refetchWarehouses();
          } catch (error) {
            toast.error(error?.em || "Không thể lưu SKU");
          }
        }
      }
    });
  };

  const handleDeleteVariant = (warehouse, variant) => {
    openConfirmDialog({
      title: "Xóa SKU",
      message: `Xóa SKU ${variant.sku} khỏi kho ${warehouse.name}?`,
      confirmText: "Xóa SKU",
      onConfirm: async () => {
        try {
          await deleteWarehouseVariant({
            productId,
            warehouseId: warehouse._id,
            sku: variant.sku
          }).unwrap();
          toast.success("Đã xóa SKU");
          refetchWarehouses();
        } catch (error) {
          toast.error(error?.em || "Không thể xóa SKU");
        }
      }
    });
  };

  const renderWarehouseVariants = (warehouse) => {
    const variants = warehouse.warehouse_variants || [];
    if (!variants.length) {
      return (
        <div className="text-muted small py-2">
          Chưa có SKU nào trong kho này.
        </div>
      );
    }

    return (
      <Table responsive bordered hover size="sm" className="mb-0">
        <thead>
          <tr>
            <th>SKU</th>
            <th className="text-end">Tồn kho</th>
            <th className="text-end">Đang chờ giao</th>
            <th className="text-end">Khả dụng</th>
            <th className="text-end">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => {
            const available = Math.max((variant.quantity || 0) - (variant.waiting_for_delivery || 0), 0);
            return (
              <tr key={variant.sku}>
                <td><Badge bg="light" text="dark">{variant.sku}</Badge></td>
                <td className="text-end">{variant.quantity ?? 0}</td>
                <td className="text-end">{variant.waiting_for_delivery ?? 0}</td>
                <td className="text-end fw-semibold text-success">{available}</td>
                <td className="text-end">
                  <div className="d-inline-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => handleVariantForm(warehouse, variant)}>
                      <IoPencil /> Sửa
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleDeleteVariant(warehouse, variant)}>
                      <IoTrash /> Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    );
  };

  if (!isLoadingProduct && !product) {
    return (
      <div className="product-warehouse-page">
        <Card className="empty-card">
          <Card.Body className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">Không tìm thấy sản phẩm</h5>
              <p className="text-muted mb-0">Vui lòng quay lại danh sách sản phẩm.</p>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate('/admin/manage-products')}>
              <IoArrowBack /> Quay lại
            </Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <div className="product-warehouse-page">
      <div className="page-header">
        <div>
          <p className="page-subtitle d-flex align-items-center gap-2 mb-1">
            <IoStorefront /> Kho hàng sản phẩm
          </p>
          <h1 className="page-title mb-1">{product?.product_name || "Đang tải sản phẩm..."}</h1>
          {categoryLabel && <div className="text-muted">Danh mục: {categoryLabel}</div>}
        </div>
        <div className="header-actions">
          <Button variant="outline-secondary" onClick={() => navigate(-1)}>
            <IoArrowBack /> Quay lại
          </Button>
          <Button variant="outline-primary" onClick={refetchWarehouses}>
            <IoRefresh /> Tải lại
          </Button>
        </div>
      </div>

      <div className="summary-grid">
        <Card>
          <Card.Body>
            <div className="summary-label">Kho hàng</div>
            <div className="summary-value">{stats.totalWarehouses}</div>
            <div className="summary-note text-muted">Số kho đang quản lý</div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="summary-label">Tổng SKU</div>
            <div className="summary-value">{stats.totalSku}</div>
            <div className="summary-note text-muted">SKU theo toàn bộ kho</div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="summary-label">Tồn khả dụng</div>
            <div className="summary-value text-success">{stats.totalAvailable}</div>
            <div className="summary-note text-muted">Sau khi trừ đang chờ giao</div>
          </Card.Body>
        </Card>
      </div>

      <div className="toolbar mb-3">
        <div className="toolbar-left">
          <Button variant="primary" onClick={handleAddWarehouse} disabled={isLoadingProduct}>
            <IoAdd size={16} /> Thêm kho
          </Button>
        </div>
        <div className="toolbar-right">
          {isLoadingProduct && <Spinner animation="border" size="sm" />}
        </div>
      </div>

      {isFetchingWarehouses ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Đang tải kho hàng...</p>
        </div>
      ) : !warehouses.length ? (
        <Card className="empty-card">
          <Card.Body className="text-center">
            <div className="empty-icon">
              <IoStorefront size={32} />
            </div>
            <h5 className="mb-2">Chưa có kho</h5>
            <p className="text-muted mb-3">Tạo kho đầu tiên để quản lý tồn kho cho sản phẩm.</p>
            <Button variant="primary" onClick={handleAddWarehouse}>
              <IoAdd /> Thêm kho
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <div className="warehouse-grid">
          {warehouses.map((warehouse) => {
            const variants = warehouse.warehouse_variants || [];
            const existingSkus = new Set(variants.map((v) => v.sku));
            const availableSkus = productVariants
              .map((v) => v.sku)
              .filter((sku) => !existingSkus.has(sku));
            const available = variants.reduce((sum, variant) => {
              const remain = (variant.quantity || 0) - (variant.waiting_for_delivery || 0);
              return sum + Math.max(remain, 0);
            }, 0);

            return (
              <Card key={warehouse._id} className="warehouse-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{warehouse.name}</div>
                    {warehouse.location && <div className="text-muted small">{warehouse.location}</div>}
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Badge bg="light" text="dark">{variants.length} SKU</Badge>
                    <Badge bg="success">{available} tồn</Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-muted small">Quản lý SKU trong kho</div>
                    <div className="d-flex gap-2">
                      <Button size="sm" variant="outline-secondary" onClick={() => handleEditWarehouse(warehouse)}>
                        <IoPencil /> Sửa kho
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteWarehouse(warehouse)}>
                        <IoTrash /> Xóa kho
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleVariantForm(warehouse, null)}
                        disabled={availableSkus.length === 0}
                      >
                        <IoAdd /> Thêm SKU
                      </Button>
                    </div>
                  </div>
                  {availableSkus.length === 0 && (
                    <div className="text-muted small mb-2">
                      Tất cả SKU của sản phẩm đã có trong kho này.
                    </div>
                  )}
                  {renderWarehouseVariants(warehouse)}
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductWarehousePage;
