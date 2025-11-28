import { Row, Col, Card, Button, Form } from "react-bootstrap";

import { formatCurrency } from "#utils";

const CartItemRow = ({ item, onQuantityChange, onRemove }) => {
  const handleChange = (e) => {
    const nextQty = Number(e.target.value) || 1;
    onQuantityChange(item, nextQty);
  };

  return (
    <Card className="cart-item mb-3">
      <Card.Body>
        <Row className="align-items-center g-3">
          <Col xs={3} md={2} className="cart-item__image">
            {item.image_url ? (
              <img src={item.image_url} alt={item.product_name || 'product'} />
            ) : (
              <div className="placeholder bg-light" />
            )}
          </Col>
          <Col xs={9} md={6}>
            <h6 className="mb-1">{item.product_name || 'Sản phẩm'}</h6>
            <div className="text-muted small">SKU: {item.variant?.sku}</div>
            {item.variant?.attributes?.length > 0 && (
              <div className="attr-list">
                {item.variant.attributes.map((attr) => (
                  <span key={`${item.variant.sku}-${attr.attribute}-${attr.value}`} className="badge bg-light text-dark me-1">
                    {attr.attribute}: {attr.value}
                  </span>
                ))}
              </div>
            )}
            {item.available_stock !== undefined && (
              <div className="text-muted small mt-1">
                Tồn kho: {item.available_stock} {item.available_stock === 0 && '(đã hết)'}
              </div>
            )}
          </Col>
          <Col xs={6} md={2} className="text-md-end">
            <div className="price">{formatCurrency(item?.variant?.price || 0)}</div>
            <div className="text-muted small">/ sản phẩm</div>
          </Col>
          <Col xs={6} md={2} className="text-md-end">
            <Form.Control
              type="number"
              min={1}
              value={item.quantity}
              onChange={handleChange}
              className="quantity-input"
            />
            <div className="fw-semibold mt-2">{formatCurrency((item?.variant?.price || 0) * item.quantity)}</div>
            <Button
              variant="link"
              size="sm"
              className="text-danger p-0 mt-1"
              onClick={() => onRemove(item)}
            >
              Xóa
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default CartItemRow;