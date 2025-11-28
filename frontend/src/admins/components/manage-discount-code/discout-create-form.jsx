import { userModalDialogStore, useShallow } from "#custom-hooks";
import { discountCodeSchema } from "#schemas";
import { useCreateDiscountCodeMutation, useUpdateDiscountCodeMutation } from "#services/admin-services";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

const DiscountCreateForm = ({ onSuccess, defaultValues, mode = "create", id }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(discountCodeSchema),
    mode: "all",
    defaultValues: {
      code: "",
      valueType: "fixed",
      value: 50000,
      maxUsage: 10,
      minOrderValue: 0,
      isActive: true,
      ...defaultValues,
    },
  });

  const [createDiscountCode, { isLoading }] = useCreateDiscountCodeMutation();
  const [updateDiscountCode, { isLoading: isUpdating }] = useUpdateDiscountCodeMutation();
  const { reset, setShow } = userModalDialogStore(useShallow((zs) => ({ reset: zs.reset, setShow: zs.setShow })));

  const generateCode = () =>
    Array.from({ length: 5 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");

  const onSubmit = handleSubmit(async (formValues) => {
    const payload = {
      ...formValues,
      code: (formValues.code || "").trim().toUpperCase(),
      value: Number(formValues.value) || 0,
      maxUsage: Number(formValues.maxUsage) || 0,
      minOrderValue: Number(formValues.minOrderValue) || 0,
    };

    try {
      if (mode === "edit" && id) {
        await updateDiscountCode({ id, payload }).unwrap();
        toast.success("Đã cập nhật mã");
      } else {
        await createDiscountCode(payload).unwrap();
        toast.success("Đã tạo mã");
      }
      if (typeof onSuccess === "function") onSuccess();
      reset();
      setShow(false);
    } catch (error) {
      toast.error(error?.em || "Thất bại");
    }
  });

  const valueType = watch("valueType");

  return (
    <Form onSubmit={onSubmit} className="discount-form">
      <Form.Group className="mb-3">
        <Form.Label>Mã (5 ký tự)</Form.Label>
        <div className="d-flex gap-2">
          {(() => {
            const codeField = register("code");
            return (
              <Form.Control
                {...codeField}
                onChange={(e) => {
                  const upper = e.target.value.toUpperCase();
                  setValue("code", upper, { shouldValidate: true });
                  if (typeof codeField.onChange === "function")
                    codeField.onChange({ ...e, target: { ...e.target, value: upper } });
                }}
                maxLength={5}
                placeholder="ABCDE"
                autoComplete="off"
                isInvalid={!!errors.code}
              />
            );
          })()}
          <Button variant="outline-secondary" type="button" onClick={() => setValue("code", generateCode())}>
            Random
          </Button>
        </div>
        {errors.code && <div className="text-danger small mt-1">{errors.code.message}</div>}
      </Form.Group>

      <div className="row g-2">
        <div className="col-sm-6">
          <Form.Group className="mb-3">
            <Form.Label>Kiểu giảm</Form.Label>
            <Form.Select {...register("valueType")} isInvalid={!!errors.valueType}>
              <option value="fixed">Giá tiền</option>
              <option value="percent">Phần trăm</option>
            </Form.Select>
            {errors.valueType && <div className="text-danger small mt-1">{errors.valueType.message}</div>}
          </Form.Group>
        </div>
        <div className="col-sm-6">
          <Form.Group className="mb-3">
            <Form.Label>Giá trị</Form.Label>
            <Form.Control
              type="number"
              min={0}
              step="1"
              {...register("value", { valueAsNumber: true })}
              isInvalid={!!errors.value}
            />
            <div className="form-text">{valueType === "percent" ? "% đơn hàng" : "VND"}</div>
            {errors.value && <div className="text-danger small mt-1">{errors.value.message}</div>}
          </Form.Group>
        </div>
      </div>

      <div className="row g-2">
        <div className="col-sm-6">
          <Form.Group className="mb-3">
            <Form.Label>Số lần tối đa</Form.Label>
            <Form.Control
              type="number"
              min={0}
              max={10}
              step="1"
              {...register("maxUsage", { valueAsNumber: true })}
              isInvalid={!!errors.maxUsage}
            />
            {errors.maxUsage && <div className="text-danger small mt-1">{errors.maxUsage.message}</div>}
          </Form.Group>
        </div>
        <div className="col-sm-6">
          <Form.Group className="mb-3">
            <Form.Label>Giá trị đơn tối thiểu</Form.Label>
            <Form.Control
              type="number"
              min={0}
              step="1000"
              {...register("minOrderValue", { valueAsNumber: true })}
              isInvalid={!!errors.minOrderValue}
            />
            {errors.minOrderValue && <div className="text-danger small mt-1">{errors.minOrderValue.message}</div>}
          </Form.Group>
        </div>
      </div>

      <Form.Check
        className="mb-3"
        type="switch"
        id="discount-active"
        label="Đang hoạt động"
        {...register("isActive")}
        checked={!!watch("isActive")}
        onChange={(e) => {
          setValue("isActive", e.target.checked, { shouldValidate: true });
        }}
      />

      <div className="d-flex justify-content-end">
        <Button type="submit" disabled={isLoading || isUpdating}>
          {isLoading || isUpdating ? "Đang lưu..." : "Lưu"}
        </Button>
      </div>
    </Form>
  );
};

export default DiscountCreateForm;
