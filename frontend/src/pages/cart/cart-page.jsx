import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import {
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
  useGetProductsInfoForOrderMutation,
  useLazyGetCartQuery,
} from "#services";
import { formatCurrency } from "#utils";
import CartItemRow from "#components/cart/cart-item-row";

import "./cart-page.scss";
import { toast } from "react-toastify";
import { deleteCartFromList, updateCartList } from "#features/user-profile-slice";

const GUEST_CART_KEY = "guest_cart";
const SELECTED_CART_KEY = "selected_cart_items";
const DEFAULT_SHIPPING = [
  { method: "Ship Nhanh", fee: 30000, note: "Nhận từ 2-3 ngày" },
  { method: "Hỏa tốc", fee: 60000, note: "Nhận trong ngày" },
];

const buildTotals = (items = []) => {
  const subtotal = items.reduce((sum, item) => sum + (item?.variant?.price || 0) * item.quantity, 0);
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, itemsCount };
};

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

const persistGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("guest-cart-updated"));
};

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user?.token;

  const [guestCart, setGuestCart] = useState(() => loadGuestCart());
  const [shippingMethod, setShippingMethod] = useState(DEFAULT_SHIPPING[0]);
  const [refreshGuestInfo] = useGetProductsInfoForOrderMutation();
  const [selectedProducts, setSelectedProducts] = useState([]);

  const cart_list = useSelector((state) => state.userProfile.cart_list);
  // const { data: cartDataRes, isLoading, isFetching } = useGetCartQuery(undefined, { skip: !isLoggedIn || cart_list.length !== 0 });
  const [getCartDataRes, { isLoading, isFetching }] = useLazyGetCartQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [deleteCartItem] = useDeleteCartItemMutation();
  const [cartData, setCartData] = useState();

  useEffect(() => {
    console.log("Fetching cart data...");
    getCartDataRes()
      .then((data) => {
        const cartDataRes = data?.data;
        setCartData(cartDataRes || {});
      });
  }, [dispatch, getCartDataRes]);

  // Refresh guest cart info from backend to display accurate names/prices
  useEffect(() => {
    if (isLoggedIn) return;
    const stored = loadGuestCart();
    setGuestCart(stored);
    if (!stored.length) return;
    const payload = stored
      .filter((item) => item?.variant?.sku && item.product_id)
      .map((item) => ({ product_id: item.product_id, sku: item.variant.sku, qty: item.quantity }));

    if (!payload.length) return;
    refreshGuestInfo(payload)
      .unwrap()
      .then((res) => {
        const infoList = res?.dt || [];
        if (!infoList.length) return;
        const merged = stored.map((item) => {
          const matched = infoList.find(
            (info) => info.product_id === item.product_id && info.variant?.sku === item.variant?.sku
          );
          if (!matched) return item;
          return {
            ...item,
            product_name: matched.product_name,
            category_name: matched.category_name,
            variant: { ...item.variant, price: matched.variant.price },
            image_url: matched.image_url || item.image_url,
            available_stock: matched.available_stock,
          };
        });
        setGuestCart(merged);
        persistGuestCart(merged);
      })
      .catch(() => { });
  }, [isLoggedIn, refreshGuestInfo]);

  // const carts = isLoggedIn ? cartData?.dt?.carts || [] : guestCart;
  const carts = isLoggedIn ? cart_list || [] : guestCart;
  const shippingOptions = isLoggedIn ? cartData?.dt?.shippingOptions || DEFAULT_SHIPPING : DEFAULT_SHIPPING;

  // keep selected items synced with current cart data (and persisted for checkout)
  useEffect(() => {
    if (isLoggedIn && !cartData) return;
    if (!carts?.length) {
      setSelectedProducts([]);
      persistSelectedCart([]);
      return;
    }
    const savedSelection = loadSelectedCart();
    if (!savedSelection.length) return;
    const matched = carts.filter((item) =>
      savedSelection.some(
        (saved) => saved.product_id === item.product_id && saved.variant?.sku === item.variant?.sku
      )
    );
    setSelectedProducts(matched);
    persistSelectedCart(matched);
  }, [carts, isLoggedIn, cartData]);

  useEffect(() => {
    if (!shippingOptions.length) return;
    setShippingMethod((prev) => {
      if (!prev) return shippingOptions[0];
      const stillExists = shippingOptions.find((opt) => opt.method === prev.method);
      return stillExists || shippingOptions[0];
    });
  }, [shippingOptions]);

  const totals = useMemo(() => {
    // const baseTotals = isLoggedIn ? cartData?.dt?.totals : buildTotals(guestCart);
    const baseTotals = buildTotals(selectedProducts);
    const shippingFee = shippingMethod?.fee || 0;
    const subtotal = baseTotals?.subtotal || 0;
    const estimatedTotal = subtotal + shippingFee;
    return { ...baseTotals, shippingFee, estimatedTotal };
  }, [isLoggedIn, cartData, guestCart, shippingMethod, selectedProducts]);

  const handleQuantityChange = (item, nextQty) => {
    if (nextQty <= 0) {
      toast.warning("Đã đạt giới hạn số lượng tối thiểu");
      return;
    }
    const safeQty = Math.max(1, Math.min(nextQty, item.available_stock || nextQty));
    if (isLoggedIn) {
      updateCartItem({ product_id: item.product_id, sku: item.variant.sku, quantity: safeQty })
        .unwrap()
        .then((data) => {
          dispatch(updateCartList(data?.dt?.update_item))
          setCartData(data)
        })
        .catch((e) => { console.error("Failed to update cart item:", e); toast.error("Không thể cập nhật số lượng"); });
      return;
    }
    const updated = guestCart.map((ci) =>
      ci.product_id === item.product_id && ci.variant.sku === item.variant.sku
        ? { ...ci, quantity: safeQty }
        : ci
    );
    setGuestCart(updated);
    persistGuestCart(updated);
  };

  const toggleSelection = (item, isChecked) => {
    setSelectedProducts((prev) => {
      if (isChecked) {
        const exists = prev.some(
          (p) => p.product_id === item.product_id && p.variant?.sku === item.variant?.sku
        );
        const next = exists ? prev : [...prev, item];
        persistSelectedCart(next);
        return next;
      }
      const next = prev.filter(
        (p) => !(p.product_id === item.product_id && p.variant?.sku === item.variant?.sku)
      );
      persistSelectedCart(next);
      return next;
    });
  };

  const removeFromSelection = (item) => {
    setSelectedProducts((prev) => {
      const next = prev.filter(
        (p) => !(p.product_id === item.product_id && p.variant?.sku === item.variant?.sku)
      );
      persistSelectedCart(next);
      return next;
    });
  };

  const handleRemove = (item) => {
    if (isLoggedIn) {
      deleteCartItem({ product_id: item.product_id, sku: item.variant.sku })
        .unwrap()
        .then((data) => {
          dispatch(deleteCartFromList(data?.dt?.removed_item))
          setCartData(data)
          removeFromSelection(item);
        })
        .catch((e) => { console.error("Failed to remove cart item:", e); toast.error("Không thể xóa sản phẩm"); });
      return;
    }
    const filtered = guestCart.filter(
      (ci) => !(ci.product_id === item.product_id && ci.variant.sku === item.variant.sku)
    );
    setGuestCart(filtered);
    persistGuestCart(filtered);
    removeFromSelection(item);
  };

  // const isBusy = isLoading || isFetching || isUpdatingCart || isDeleting;
  const isBusy = isLoading || isFetching;
  const isEmpty = !carts || carts.length === 0;

  const onCheckout = () => {
    if (isEmpty || !selectedProducts.length) {
      toast.warn("Vui lòng chọn sản phẩm muốn mua");
      return;
    }
    persistSelectedCart(selectedProducts);
    persistGuestCart(guestCart);
    navigate("/checkout");
  };

  return (
    <section className="cart-page section">
      <Container>
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="mb-0">Giỏ hàng</h2>
            <p className="text-muted mb-0">Xem lại các sản phẩm bạn đã thêm</p>
          </Col>
          <Col className="text-end">
            <Link to="/san-pham" className="btn btn-outline-primary btn-sm">Tiếp tục mua sắm</Link>
          </Col>
        </Row>

        {isBusy && (
          <div className="d-flex justify-content-center my-4">
            <Spinner animation="border" />
          </div>
        )}

        {!isBusy && isEmpty && (
          <Card className="p-4 text-center">
            <h5>Giỏ hàng của bạn đang trống</h5>
            <p className="text-muted">Hãy thêm vài sản phẩm để bắt đầu thanh toán.</p>
            <Link to="/san-pham" className="btn btn-primary">Khám phá sản phẩm</Link>
          </Card>
        )}

        {!isBusy && !isEmpty && (
          <Row className="g-4">
            <Col lg={8}>
              <div className="cart-items-wrapper">
                {carts.map((item) => (
                  <div key={`${item.product_id}-${item.variant?.sku}`}>
                    <Form.Check
                      type="checkbox"
                      className="mb-2"
                      label="Chọn sản phẩm này"
                      checked={selectedProducts.some(
                        (p) => p.product_id === item.product_id && p.variant?.sku === item.variant?.sku
                      )}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        toggleSelection(item, isChecked);
                      }}
                    />
                    <CartItemRow
                      item={item}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemove}
                    />
                  </div>
                ))}
              </div>
            </Col>
            <Col lg={4}>
              <Card className="cart-summary">
                {selectedProducts.length > 0 ? (
                  <Card.Body>
                    <Card.Title>Tóm tắt đơn</Card.Title>
                    <div className="d-flex justify-content-between">
                      <span>Tạm tính</span>
                      <strong>{formatCurrency(totals.subtotal || 0)}</strong>
                    </div>

                    <Form.Group className="mt-3">
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

                    <div className="d-flex justify-content-between mt-3">
                      <span>Phí vận chuyển</span>
                      <strong>{formatCurrency(totals.shippingFee || 0)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mt-3 total-line">
                      <span>Tổng cộng</span>
                      <strong>{formatCurrency(totals.estimatedTotal || 0)}</strong>
                    </div>

                    <Button
                      className="w-100 mt-3"
                      onClick={onCheckout}
                      disabled={isEmpty || isBusy || !selectedProducts.length}
                    >
                      Tiến hành thanh toán
                    </Button>
                    <Alert variant="light" className="mt-3 mb-0">
                      Phí và giảm giá sẽ được áp dụng ở bước thanh toán.
                    </Alert>
                  </Card.Body>
                ) : (
                  <Card.Body>
                    <Alert variant="warning">
                      Vui lòng chọn ít nhất một sản phẩm để tiếp tục thanh toán.
                    </Alert>
                  </Card.Body>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </section>
  );
};

export default CartPage;
