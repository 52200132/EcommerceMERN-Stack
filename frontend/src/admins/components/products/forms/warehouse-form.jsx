import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";

const WarehouseForm = ({ defaultValues = { name: "", location: "" }, submitting = false, onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues,
  });

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Group className="mb-3">
        <Form.Label>Tên kho</Form.Label>
        <Form.Control
          {...register("name", { required: "Vui lòng nhập tên kho" })}
          isInvalid={!!errors.name}
          placeholder="VD: Kho chính"
        />
        <Form.Control.Feedback type="invalid">
          {errors.name?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Địa điểm</Form.Label>
        <Form.Control
          {...register("location")}
          placeholder="(Tùy chọn) Ví dụ: Hà Nội, Đà Nẵng..."
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button type="submit" variant="success" disabled={submitting}>
          {submitting ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </Form>
  );
};

export default WarehouseForm;
