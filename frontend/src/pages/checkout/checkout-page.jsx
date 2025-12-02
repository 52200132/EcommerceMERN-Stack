import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { Controller } from "react-hook-form";
import Select from "react-select";
import { useNavigate } from "react-router-dom";

import {
  useGetCartQuery,
  useGetAddressesQuery,
  useAddAddressMutation,
  useCreateOrderMutation,
  useApplyDiscountCodeMutation,
  useGetProductsInfoForOrderMutation,
  useGetProfileQuery,
} from "#services";
import { formatCurrency } from "#utils";
import { useAddressForm } from "#custom-hooks";
import { setCartList } from "#features/user-profile-slice";

import "./checkout-page.scss";

const DEFAULT_SHIPPING = [
  { method: "Ship Nhanh", fee: 30000, note: "Nhận từ 2-3 ngày" },
  { method: "Hỏa tốc", fee: 60000, note: "Nhận trong ngày" },
];
const GUEST_CART_KEY = "guest_cart";
const SELECTED_CART_KEY = "selected_cart_items";
const DEFAULT_COUNTRY = "Vietnam";

const loadGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch (error) {
    return [];
  }
};

const loadSelectedCart = () => {
  try {
    return JSON.parse(localStorage.getItem(SELECTED_CART_KEY)) || [];
  } catch (error) {
    return [];
  }
};

const persistSelectedCart = (items) => {
  localStorage.setItem(SELECTED_CART_KEY, JSON.stringify(items));
};

const buildTotalsFromItems = (items = [], shippingFee = 0, discount = 0, pointsUsed = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item?.variant?.price || 0) * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal + shippingFee - discount - pointsUsed * 1000);
  return { subtotal, grandTotal };
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user?.token;

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState(DEFAULT_SHIPPING[0]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [notes, setNotes] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");
  const [pointsToUse, setPointsToUse] = useState(0);
  const [guestInfo, setGuestInfo] = useState({ username: "", email: "" });
  const addressFormMethods = useAddressForm({ includeCountry: false });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [guestCart, setGuestCart] = useState(() => loadGuestCart());
  const [selectedCartItems, setSelectedCartItems] = useState(() => loadSelectedCart());
  const [itemsForOrder, setItemsForOrder] = useState([]);
  const [orderResult, setOrderResult] = useState(null);
  const [stepError, setStepError] = useState("");

  const { data: cartData, isLoading: loadingCart } = useGetCartQuery(undefined, { skip: !isLoggedIn });
  const { data: addressesData, refetch: refetchAddresses } = useGetAddressesQuery(undefined, { skip: !isLoggedIn });
  const { data: profileData } = useGetProfileQuery(undefined, { skip: !isLoggedIn });
  const availablePoints = profileData?.dt?.points || 0;
  const {
    trigger: triggerAddressForm,
    getValues: getAddressValues,
    setValue: setAddressValue,
    watch: watchAddressForm,
  } = addressFormMethods;

  const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();
  const [createOrder, { isLoading: isPlacingOrder, isError: isOrderError, data: dataCreatedOrder }] = useCreateOrderMutation();
  const [applyDiscountCode, { isLoading: isApplyingCode }] = useApplyDiscountCodeMutation();
  const [fetchProductsInfo, { isLoading: loadingItemsInfo }] = useGetProductsInfoForOrderMutation();

  const allCartItems = isLoggedIn ? cartData?.dt?.carts || [] : guestCart;
  const shippingOptions = isLoggedIn ? cartData?.dt?.shippingOptions || DEFAULT_SHIPPING : DEFAULT_SHIPPING;
  const hasNoItems = !selectedCartItems || selectedCartItems.length === 0;

  const isSameItem = (a, b) => a.product_id === b.product_id && a.variant?.sku === b.variant?.sku;

  useEffect(() => {
    if (isLoggedIn && !cartData) return;
    if (!allCartItems?.length) {
      setSelectedCartItems([]);
      persistSelectedCart([]);
      return;
    }
    const savedSelection = loadSelectedCart();
    const baseSelection = savedSelection.length ? savedSelection : allCartItems;
    const matched = allCartItems.filter((item) =>
      baseSelection.some(
        (selected) => selected.product_id === item.product_id && selected.variant?.sku === item.variant?.sku
      )
    );
    setSelectedCartItems(matched);
    persistSelectedCart(matched);
  }, [allCartItems, isLoggedIn, cartData]);

  useEffect(() => {
    if (!isLoggedIn) {
      setAddressValue("isDefault", true);
    }
  }, [isLoggedIn, setAddressValue]);

  useEffect(() => {
    if (!shippingOptions.length) return;
    setShippingMethod((prev) => {
      if (!prev) return shippingOptions[0];
      const stillExists = shippingOptions.find((opt) => opt.method === prev.method);
      return stillExists || shippingOptions[0];
    });
  }, [shippingOptions]);

  useEffect(() => {
    if (!isLoggedIn || selectedAddressId || !addressesData?.dt?.length) return;
    const defaultAddress = addressesData.dt.find((addr) => addr.isDefault) || addressesData.dt[0];
    setSelectedAddressId(defaultAddress?._id || null);
  }, [isLoggedIn, addressesData, selectedAddressId]);

  // Fetch normalized items for order (price, variant info)
  useEffect(() => {
    if (!selectedCartItems || !selectedCartItems.length) {
      setItemsForOrder([]);
      return;
    }
    const payload = selectedCartItems
      .filter((item) => item?.variant?.sku && item.product_id)
      .map((item) => ({ product_id: item.product_id, sku: item.variant.sku, qty: item.quantity }));
    fetchProductsInfo(payload)
      .unwrap()
      .then((res) => {
        const info = res?.dt || [];
        const merged = info.map((infoItem) => {
          const matched = selectedCartItems.find(
            (ci) => ci.product_id === infoItem.product_id && ci.variant?.sku === infoItem.variant?.sku
          );
          return { ...infoItem, image_url: matched?.image_url || infoItem.image_url };
        });
        setItemsForOrder(merged);
      })
      .catch(() => { });
  }, [selectedCartItems, fetchProductsInfo]);

  const discountValue = appliedDiscount?.discount || 0;
  const totals = useMemo(() => {
    const baseTotals = buildTotalsFromItems(itemsForOrder, shippingMethod?.fee || 0, discountValue, pointsToUse);
    return { ...baseTotals, shippingFee: shippingMethod?.fee || 0 };
  }, [itemsForOrder, shippingMethod, discountValue, pointsToUse]);

  const maxPointByTotal = Math.max(
    0,
    Math.floor((totals.subtotal + (shippingMethod?.fee || 0) - discountValue) / 1000)
  );
  const maxUsablePoints = Math.min(availablePoints, maxPointByTotal);

  useEffect(() => {
    setPointsToUse((prev) => Math.min(prev, maxUsablePoints));
  }, [maxUsablePoints]);

  const handleApplyDiscount = async () => {
    if (!discountInput) return;
    try {
      const res = await applyDiscountCode({ code: discountInput, total_amount: totals.subtotal }).unwrap();
      setAppliedDiscount({ code: discountInput, ...res.dt });
      setDiscountError("");
    } catch (error) {
      setAppliedDiscount(null);
      setDiscountError(error?.em || "Không áp dụng được mã giảm giá");
    }
  };

  const validateAddressForm = async () => {
    const isValid = await triggerAddressForm();
    if (!isValid) {
      setStepError("Vui long kiem tra dia chi giao hang");
      return null;
    }
    return { country: DEFAULT_COUNTRY, ...getAddressValues() };
  };

  const handleStep1Next = async () => {
    try {
      if (isLoggedIn) {
        if (!useNewAddress && !selectedAddressId) {
          setStepError("Vui long chon dia chi nhan hang");
          return;
        }
        if (useNewAddress) {
          const addressPayload = await validateAddressForm();
          if (!addressPayload) return;
          const res = await addAddress(addressPayload).unwrap();
          const addresses = res?.dt || [];
          const newId = addresses[addresses.length - 1]?._id;
          setSelectedAddressId(newId);
          refetchAddresses();
        }
      } else {
        const addressPayload = await validateAddressForm();
        if (!addressPayload) return;
        if (!guestInfo.username || !guestInfo.email) {
          setStepError("Vui long nhap ho ten va email");
          return;
        }
      }
      setStepError("");
      setCurrentStep(2);
    } catch (error) {
      setStepError(error?.em || "Khong the luu dia chi");
    }
  };

  const handlePlaceOrder = async () => {
    if (!itemsForOrder.length) {
      setStepError("Giỏ hàng trống.");
      return;
    }
    setStepError("");
    const payload = {
      Items: itemsForOrder,
      discount_code: appliedDiscount?.code || undefined,
      points_used: pointsToUse,
      shipping_address_id: selectedAddressId,
      shipment: shippingMethod,
      payment_method: paymentMethod,
      notes,
    };

    if (!isLoggedIn) {
      const guestAddress = { country: DEFAULT_COUNTRY, ...getAddressValues(), isDefault: true };
      payload.username = guestInfo.username;
      payload.email = guestInfo.email;
      payload.Addresses = [guestAddress];
      payload.shipping_address = guestAddress;
    }

    try {
      const res = await createOrder(payload).unwrap();
      setOrderResult(res?.dt);
      setCurrentStep(4);
      if (isLoggedIn) {
        const remainingItems = allCartItems.filter(
          (cartItem) => !selectedCartItems.some((selected) => isSameItem(cartItem, selected))
        );
        dispatch(setCartList(remainingItems));
      } else {
        const remainingGuestItems = guestCart.filter(
          (cartItem) => !selectedCartItems.some((selected) => isSameItem(cartItem, selected))
        );
        setGuestCart(remainingGuestItems);
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(remainingGuestItems));
        window.dispatchEvent(new Event("guest-cart-updated"));
      }
      localStorage.removeItem(SELECTED_CART_KEY);
    } catch (error) {
      setStepError(error?.em || "Không thể tạo đơn hàng, vui lòng thử lại");
    }
  };

  const steps = [
    { id: 1, label: "Địa chỉ giao hàng" },
    { id: 2, label: "Thanh toán & vận chuyển" },
    { id: 3, label: "Xác nhận" },
  ];

  const renderStepBadge = (step) => {
    const isActive = step.id === currentStep;
    const isDone = step.id < currentStep;
    return (
      <div key={step.id} className={`step-badge${isActive ? " active" : ""}${isDone ? " done" : ""}`}>
        <span className="step-badge__number">{step.id}</span>
        <span className="step-badge__label">{step.label}</span>
      </div>
    );
  };

  const renderAddressSection = () => (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>Địa chỉ giao hàng</Card.Title>
        {isLoggedIn ? (
          <>
            <Form.Check
              type="switch"
              id="use-new-address"
              label="Nhập địa chỉ mới"
              checked={useNewAddress}
              onChange={(e) => setUseNewAddress(e.target.checked)}
              className="mb-3"
            />
            {!useNewAddress && (
              <div className="address-list">
                {addressesData?.dt?.length ? (
                  addressesData.dt.map((addr) => (
                    <Form.Check
                      key={addr._id}
                      type="radio"
                      name="shipping-address"
                      id={addr._id}
                      className="mb-2"
                      label={`${addr.receiver} | ${addr.phone} | ${addr.street}, ${addr.ward}, ${addr.district}`}
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                    />
                  ))
                ) : (
                  <Alert variant="light">Bạn chưa có địa chỉ. Vui lòng thêm mới.</Alert>
                )}
              </div>
            )}
            {useNewAddress && (
              <CheckoutAddressForm form={addressFormMethods} />
            )}
          </>
        ) : (
          <>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    value={guestInfo.username}
                    onChange={(e) => setGuestInfo({ ...guestInfo, username: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={guestInfo.email}
                    onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <CheckoutAddressForm form={addressFormMethods} />
          </>
        )}
      </Card.Body>
    </Card>
  );

  const renderPaymentSection = () => (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>Vận chuyển & Thanh toán</Card.Title>
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Phương thức vận chuyển</Form.Label>
              <Form.Select
                value={shippingMethod?.method}
                onChange={(e) =>
                  setShippingMethod(
                    shippingOptions.find((opt) => opt.method === e.target.value) || shippingOptions[0]
                  )
                }
              >
                {shippingOptions.map((opt) => (
                  <option key={opt.method} value={opt.method}>
                    {opt.method} (+{formatCurrency(opt.fee)})
                  </option>
                ))}
              </Form.Select>
              {shippingMethod?.note && <small className="text-muted">{shippingMethod.note}</small>}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Phương thức thanh toán</Form.Label>
              <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="COD">COD</option>
                <option value="banking">Chuyển khoản</option>
                <option value="credit_card">Thẻ tín dụng</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row className="g-3 mt-1">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Mã giảm giá</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã 5 ký tự"
                  maxLength={5}
                />
                <Button variant="outline-primary" onClick={handleApplyDiscount} disabled={isApplyingCode}>
                  Áp dụng
                </Button>
              </div>
              {appliedDiscount && (
                <small className="text-success">Đã áp dụng mã {appliedDiscount.code}</small>
              )}
              {discountError && <small className="text-danger d-block">{discountError}</small>}
            </Form.Group>
          </Col>
          {isLoggedIn && (
            <Col md={6}>
              <Form.Group>
                <Form.Label>Điểm tích lũy</Form.Label>
                <div className="d-flex gap-2 align-items-center">
                  <Form.Control
                    type="number"
                    min={0}
                    value={pointsToUse}
                    onChange={(e) => setPointsToUse(Math.max(0, Number(e.target.value) || 0))}
                  />
                  <Badge bg="light" text="dark">Tối đa {maxUsablePoints} điểm</Badge>
                </div>
                <small className="text-muted">1 điểm = 1.000đ. Bạn có {availablePoints} điểm.</small>
              </Form.Group>
            </Col>
          )}
        </Row>

        <Form.Group className="mt-3">
          <Form.Label>Ghi chú</Form.Label>
          <Form.Control as="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Form.Group>
      </Card.Body>
    </Card>
  );

  const renderReviewSection = () => {
    const guestAddress = watchAddressForm();
    return (
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Kiem tra thong tin</Card.Title>
          <div className="mb-2">
            <strong>Nguoi nhan: </strong>
            {isLoggedIn
              ? addressesData?.dt?.find((a) => a._id === selectedAddressId)?.receiver || "Chua chon"
              : guestInfo.username}
          </div>
          <div className="mb-2"><strong>Dia chi:</strong> {isLoggedIn
            ? addressesData?.dt?.find((a) => a._id === selectedAddressId)?.street
            : `${guestAddress.street}, ${guestAddress.ward}, ${guestAddress.district}`}</div>
          <div className="mb-2"><strong>Thanh toan:</strong> {paymentMethod}</div>
          <div className="mb-2"><strong>Van chuyen:</strong> {shippingMethod?.method} ({formatCurrency(shippingMethod?.fee || 0)})</div>
          {notes && <div className="text-muted">Ghi chu: {notes}</div>}
        </Card.Body>
      </Card>
    );
  };

  if (hasNoItems && !loadingCart && !loadingItemsInfo) {
    return (
      <section className="checkout-page section">
        <Container>
          <Card className="p-4 text-center">
            <h5>Giỏ hàng trống</h5>
            <Button variant="primary" onClick={() => navigate("/san-pham")}>
              Tiếp tục mua sắm
            </Button>
          </Card>
        </Container>
      </section>
    );
  }

  const isLoadingPage = loadingCart || loadingItemsInfo;

  return (
    <section className="checkout-page section">
      <Container>
        <div className="d-flex gap-2 mb-3 flex-wrap">
          {steps.map((step) => renderStepBadge(step))}
        </div>

        {isLoadingPage && (
          <div className="d-flex justify-content-center my-4"><Spinner animation="border" /></div>
        )}

        {!isLoadingPage && currentStep < 4 && (
          <Row className="g-4">
            <Col lg={8}>
              {currentStep === 1 && renderAddressSection()}
              {currentStep === 2 && renderPaymentSection()}
              {currentStep === 3 && renderReviewSection()}

              {stepError && <Alert variant="danger">{stepError}</Alert>}

              <div className="d-flex justify-content-between mt-3">
                {currentStep > 1 && (
                  <Button variant="outline-secondary" onClick={() => setCurrentStep((prev) => prev - 1)}>
                    Quay lại
                  </Button>
                )}
                {currentStep === 1 && (
                  <Button onClick={handleStep1Next} disabled={isAddingAddress}>
                    Tiếp tục
                  </Button>
                )}
                {currentStep === 2 && (
                  <Button onClick={() => setCurrentStep(3)}>
                    Xem lại đơn hàng
                  </Button>
                )}
                {currentStep === 3 && (
                  <Button onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                    Xác nhận đặt hàng
                  </Button>
                )}
              </div>
            </Col>
            <Col lg={4}>
              <OrderSummary
                items={itemsForOrder}
                totals={totals}
                discount={discountValue}
                shippingMethod={shippingMethod}
                pointsUsed={pointsToUse}
              />
            </Col>
          </Row>
        )}

        {currentStep === 4 && (
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="p-4 text-center">
                <h4>Đặt hàng thành công</h4>
                <p className="text-muted">Chúng tôi đã gửi email xác nhận tới bạn.</p>
                <div className="mb-2">Mã đơn hàng: <strong>{orderResult?._id}</strong></div>
                <div className="mb-3">Tổng thanh toán: <strong>{formatCurrency(orderResult?.grand_total || totals.grandTotal)}</strong></div>
                <div className="d-flex gap-2 justify-content-center">
                  <Button variant="primary" onClick={() => navigate("/san-pham")}>Tiếp tục mua sắm</Button>
                  {isLoggedIn && <Button variant="outline-primary" onClick={() => navigate("/thong-tin-ca-nhan/lich-su-mua-hang")}>Xem đơn của tôi</Button>}
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </section>
  );
};

const selectControlStyles = (hasError) => ({
  control: (base) => ({
    ...base,
    fontSize: "1rem",
    fontWeight: "400",
    boxShadow: "var(--bs-box-shadow-inset)",
    borderColor: hasError ? "var(--bs-form-invalid-border-color)" : "var(--bs-border-color)",
    cursor: "text",
    "&:hover": { borderColor: hasError ? "var(--bs-danger)" : "var(--bs-border-color)" },
  }),
});

const CheckoutAddressForm = ({ form }) => {
  const {
    register,
    control,
    formState: { errors },
    setValue,
    watch,
    selectOptions: { provincesOptions, districtsOptions, wardsOptions },
    selectLoading: { provincesLoading, districtsLoading, wardsLoading },
    handleProvinceChange,
    handleDistrictChange,
    provinceCode,
    districtCode,
  } = form;

  const isDefault = watch("isDefault");

  return (
    <Row className="g-3 mt-1">
      <Col md={6}>
        <Form.Group>
          <Form.Label>Nguoi nhan</Form.Label>
          <Form.Control isInvalid={!!errors.receiver} {...register("receiver")} />
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.receiver && errors.receiver.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>So dien thoai</Form.Label>
          <Form.Control isInvalid={!!errors.phone} {...register("phone")} />
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.phone && errors.phone.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Tinh/Thanh pho</Form.Label>
          <Controller
            control={control}
            name="province"
            render={({ field: { value, onChange, ref } }) => (
              <Select
                classNamePrefix="tps"
                placeholder="Chon tinh/thanh pho"
                isLoading={provincesLoading}
                options={provincesOptions}
                value={provincesOptions.find((option) => option.value === value) || null}
                onChange={(selectedOption) => handleProvinceChange(selectedOption, onChange)}
                inputRef={ref}
                styles={selectControlStyles(!!errors.province)}
              />
            )}
          />
          <Form.Control hidden isInvalid={!!errors.province} />
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.province && errors.province.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Quan/Huyen</Form.Label>
          <Controller
            control={control}
            name="district"
            render={({ field: { value, onChange, ref } }) => (
              <Select
                classNamePrefix="tps"
                placeholder="Chon quan/huyen"
                isLoading={districtsLoading}
                options={districtsOptions}
                value={districtsOptions.find((option) => option.value === value) || null}
                onChange={(selectedOption) => handleDistrictChange(selectedOption, onChange)}
                inputRef={ref}
                isDisabled={!provinceCode}
                styles={selectControlStyles(!!errors.district)}
              />
            )}
          />
          <Form.Control hidden isInvalid={!!errors.district} />
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.district && errors.district.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Phuong/Xa</Form.Label>
          <Controller
            control={control}
            name="ward"
            render={({ field: { value, onChange, ref } }) => (
              <Select
                classNamePrefix="tps"
                placeholder="Chon phuong/xa"
                isLoading={wardsLoading}
                options={wardsOptions}
                value={wardsOptions.find((option) => option.value === value) || null}
                onChange={(selectedOption) => onChange(selectedOption?.value || "")}
                inputRef={ref}
                isDisabled={!districtCode}
                styles={selectControlStyles(!!errors.ward)}
              />
            )}
          />
          <Form.Control hidden isInvalid={!!errors.ward} />
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.ward && errors.ward.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Duong</Form.Label>
          <Form.Control isInvalid={!!errors.street} {...register("street")} />
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.street && errors.street.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Ma buu chinh</Form.Label>
          <Form.Control isInvalid={!!errors.postalCode} {...register("postalCode")} />
          <Form.Control.Feedback type="invalid" className="d-block">
            {errors.postalCode && errors.postalCode.message}
          </Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={12} className="d-flex align-items-center">
        <Form.Check
          type="switch"
          id="checkoutAddressDefault"
          label="Dat lam dia chi mac dinh"
          {...register("isDefault")}
          checked={!!isDefault}
          onChange={(event) => setValue("isDefault", event.target.checked)}
          className="mb-2"
        />
      </Col>
    </Row>
  );
};

const OrderSummary = ({ items = [], totals = {}, discount, shippingMethod, pointsUsed }) => {
  return (
    <Card className="order-summary">
      <Card.Body>
        <Card.Title>Chi tiết đơn hàng</Card.Title>
        <div className="order-summary__items">
          {items.map((item) => (
            <div key={`${item.product_id}-${item.variant?.sku}`} className="d-flex justify-content-between mb-2">
              <div>
                <div className="fw-semibold">{item.product_name}</div>
                <div className="text-muted small">SKU: {item.variant?.sku} x {item.quantity}</div>
              </div>
              <div className="fw-semibold">{formatCurrency((item?.variant?.price || 0) * item.quantity)}</div>
            </div>
          ))}
        </div>
        <hr />
        <div className="d-flex justify-content-between">
          <span>Tạm tính</span>
          <span>{formatCurrency(totals.subtotal || 0)}</span>
        </div>
        <div className="d-flex justify-content-between mt-2">
          <span>Vận chuyển</span>
          <span>{formatCurrency(shippingMethod?.fee || 0)}</span>
        </div>
        {discount > 0 && (
          <div className="d-flex justify-content-between mt-2 text-success">
            <span>Giảm giá</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        {pointsUsed > 0 && (
          <div className="d-flex justify-content-between mt-2 text-success">
            <span>Dùng điểm ({pointsUsed})</span>
            <span>-{formatCurrency(pointsUsed * 1000)}</span>
          </div>
        )}
        <div className="d-flex justify-content-between mt-3 total-line">
          <span>Tổng thanh toán</span>
          <strong>{formatCurrency(totals.grandTotal || 0)}</strong>
        </div>
        <small className="text-muted d-block mt-2">Điểm tích lũy dự kiến: {Math.floor((totals.grandTotal || 0) / 10000)} điểm</small>
      </Card.Body>
    </Card>
  );
};

export default CheckoutPage;
