import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

const WarehouseVariantForm = ({
  defaultValues = { sku: "", quantity: 0, waiting_for_delivery: 0 },
  disableSku = false,
  submitting = false,
  availableSkus = [],
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Label>SKU</Form.Label>
        {disableSku ? (
          <>
            <Form.Control
              {...register("sku")}
              disabled
            />
          </>
        ) : (
          <>
            <Form.Select
              {...register("sku", { required: "Vui lòng chọn SKU" })}
              isInvalid={!!errors.sku}
              disabled={disableSku || !availableSkus.length}
            >
              <option value="">Chọn SKU</option>
              {availableSkus.map((sku) => (
                <option key={sku} value={sku}>{sku}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.sku?.message}
            </Form.Control.Feedback>
            {!availableSkus.length && (
              <div className="text-muted small mt-1">
                Tất cả SKU đã có trong kho này.
              </div>
            )}
          </>
        )}
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Số lượng hiện có</Form.Label>
        <Form.Control
          type="number"
          min={0}
          {...register("quantity", {
            valueAsNumber: true,
            min: { value: 0, message: "Số lượng phải >= 0" }
          })}
          isInvalid={!!errors.quantity}
        />
        <Form.Control.Feedback type="invalid">
          {errors.quantity?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Đang chờ giao</Form.Label>
        <Form.Control
          type="number"
          min={0}
          {...register("waiting_for_delivery", {
            valueAsNumber: true,
            min: { value: 0, message: "Giá trị phải >= 0" }
          })}
          isInvalid={!!errors.waiting_for_delivery}
        />
        <Form.Control.Feedback type="invalid">
          {errors.waiting_for_delivery?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button type="submit" variant="success" disabled={submitting}>
          {submitting ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </Form>
  );
};

export default WarehouseVariantForm;
