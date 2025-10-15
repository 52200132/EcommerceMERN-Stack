import { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, InputGroup, Table } from 'react-bootstrap';
import EditDetailsModal from './Modal/EditDetailsModal';

const AddProduct = () => {
  const [product, setProduct] = useState({
    product_name: '',
    brand_id: '',
    hashtag: '',
    quantity_sold: 0,
    price_min: 0,
    price_max: 0,
    short_description: '',
    detail_description: '',
    Images: [{ url: '', is_primary: true }],
    Variants: [{
      sku: '',
      price: 0,
      stock: 0,
      Images: [{ url: '', is_primary: true }],
      Attributes: [{ attribute: '', value: '', type: 'appearance' }]
    }],
    is_active: true,
  });

  const [showEditModal, setShowEditModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (index, field, value) => {
    const updatedImages = [...product.Images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setProduct({ ...product, Images: updatedImages });
  };

  const addImage = () => {
    setProduct({
      ...product,
      Images: [...product.Images, { url: '', is_primary: false }]
    });
  };

  const removeImage = (index) => {
    const updatedImages = [...product.Images];
    updatedImages.splice(index, 1);
    setProduct({ ...product, Images: updatedImages });
  };

  const handleVariantChange = (variantIndex, field, value) => {
    const updatedVariants = [...product.Variants];
    updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], [field]: value };
    setProduct({ ...product, Variants: updatedVariants });
  };

  const handleVariantImageChange = (variantIndex, imageIndex, field, value) => {
    const updatedVariants = [...product.Variants];
    updatedVariants[variantIndex].Images[imageIndex] = {
      ...updatedVariants[variantIndex].Images[imageIndex],
      [field]: value
    };
    setProduct({ ...product, Variants: updatedVariants });
  };

  const addVariantImage = (variantIndex) => {
    const updatedVariants = [...product.Variants];
    updatedVariants[variantIndex].Images.push({ url: '', is_primary: false });
    setProduct({ ...product, Variants: updatedVariants });
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    const updatedVariants = [...product.Variants];
    updatedVariants[variantIndex].Images.splice(imageIndex, 1);
    setProduct({ ...product, Variants: updatedVariants });
  };

  const handleAttributeChange = (variantIndex, attrIndex, field, value) => {
    const updatedVariants = [...product.Variants];
    updatedVariants[variantIndex].Attributes[attrIndex] = {
      ...updatedVariants[variantIndex].Attributes[attrIndex],
      [field]: value
    };
    setProduct({ ...product, Variants: updatedVariants });
  };

  const addAttribute = (variantIndex) => {
    const updatedVariants = [...product.Variants];
    updatedVariants[variantIndex].Attributes.push({ attribute: '', value: '', type: 'appearance' });
    setProduct({ ...product, Variants: updatedVariants });
  };

  const removeAttribute = (variantIndex, attrIndex) => {
    const updatedVariants = [...product.Variants];
    updatedVariants[variantIndex].Attributes.splice(attrIndex, 1);
    setProduct({ ...product, Variants: updatedVariants });
  };

  const addVariant = () => {
    setProduct({
      ...product,
      Variants: [
        ...product.Variants,
        {
          sku: '',
          price: 0,
          stock: 0,
          Images: [{ url: '', is_primary: true }],
          Attributes: [{ attribute: '', value: '', type: 'appearance' }]
        }
      ]
    });
  };

  const removeVariant = (index) => {
    const updatedVariants = [...product.Variants];
    updatedVariants.splice(index, 1);
    setProduct({ ...product, Variants: updatedVariants });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the product data to your API
    console.log('Submitting product:', product);
    // Call API to save product
  };

  return (
    <Container className="my-4">
      <h2 className="mb-4">Thêm sản phẩm mới</h2>
      <Form onSubmit={handleSubmit}>
        <Card className="mb-4">
          <Card.Header>Thông tin cơ bản</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên sản phẩm</Form.Label>
                  <Form.Control
                    type="text"
                    name="product_name"
                    value={product.product_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thương hiệu</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand_id"
                    value={product.brand_id}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Hashtag</Form.Label>
                  <Form.Control
                    type="text"
                    name="hashtag"
                    value={product.hashtag}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng đã bán</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity_sold"
                    value={product.quantity_sold}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Mô tả ngắn</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="short_description"
                    value={product.short_description}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                {/* <Form.Group className="mb-3">
                  <Form.Label>Mô tả chi tiết</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="detail_description"
                    value={product.detail_description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </Form.Group> */}
                <Button variant="outline-primary" onClick={() => setShowEditModal(true)}>Chỉnh sửa mô tả chi tiết</Button>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="is-active"
                label="Kích hoạt sản phẩm"
                name="is_active"
                checked={product.is_active}
                onChange={(e) => setProduct({ ...product, is_active: e.target.checked })}
              />
            </Form.Group>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>Hình ảnh sản phẩm</Card.Header>
          <Card.Body>
            {product.Images.map((image, index) => (
              <Row key={`image-${index}`} className="mb-3 align-items-center">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>URL hình ảnh</Form.Label>
                    <Form.Control
                      type="text"
                      value={image.url}
                      onChange={(e) => handleImageChange(index, 'url', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      label="Ảnh chính"
                      checked={image.is_primary}
                      onChange={(e) => handleImageChange(index, 'is_primary', e.target.checked)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2} className="text-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeImage(index)}
                    disabled={product.Images.length === 1}
                  >
                    Xoá
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={addImage}>+ Thêm ảnh</Button>
          </Card.Body>
        </Card>

        <Card className="mb-4">
          <Card.Header>Phiên bản sản phẩm</Card.Header>
          <Card.Body>
            {product.Variants.map((variant, variantIndex) => (
              <div key={`variant-${variantIndex}`} className="border rounded p-3 mb-4">
                <h5>Phiên bản {variantIndex + 1}</h5>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Mã SKU</Form.Label>
                      <Form.Control
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleVariantChange(variantIndex, 'sku', e.target.value)}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giá</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(variantIndex, 'price', parseInt(e.target.value))}
                          required
                        />
                        <InputGroup.Text>VND</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Số lượng</Form.Label>
                      <Form.Control
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(variantIndex, 'stock', parseInt(e.target.value))}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <h6 className="mt-3">Thuộc tính</h6>
                <Table size="sm" className="mb-3">
                  <thead>
                    <tr>
                      <th>Tên thuộc tính</th>
                      <th>Giá trị</th>
                      <th>Loại</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variant.Attributes.map((attr, attrIndex) => (
                      <tr key={`attr-${variantIndex}-${attrIndex}`}>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={attr.attribute}
                            onChange={(e) => handleAttributeChange(variantIndex, attrIndex, 'attribute', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={attr.value}
                            onChange={(e) => handleAttributeChange(variantIndex, attrIndex, 'value', e.target.value)}
                            required
                          />
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={attr.type}
                            onChange={(e) => handleAttributeChange(variantIndex, attrIndex, 'type', e.target.value)}
                          >
                            <option value="appearance">Appearance</option>
                            <option value="technology">Technology</option>
                          </Form.Select>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => removeAttribute(variantIndex, attrIndex)}
                            disabled={variant.Attributes.length === 1}
                          >
                            Xoá
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <Button size="sm" variant="outline-secondary" onClick={() => addAttribute(variantIndex)}>+ Thêm thuộc tính</Button>

                <h6 className="mt-3">Hình ảnh phiên bản</h6>
                {variant.Images.map((image, imageIndex) => (
                  <Row key={`variant-image-${variantIndex}-${imageIndex}`} className="mb-2 align-items-center">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Control
                          type="text"
                          placeholder="URL hình ảnh"
                          value={image.url}
                          onChange={(e) => handleVariantImageChange(variantIndex, imageIndex, 'url', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Check
                          type="checkbox"
                          label="Ảnh chính"
                          checked={image.is_primary}
                          onChange={(e) => handleVariantImageChange(variantIndex, imageIndex, 'is_primary', e.target.checked)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="text-end">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeVariantImage(variantIndex, imageIndex)}
                        disabled={variant.Images.length === 1}
                      >
                        Xoá
                      </Button>
                    </Col>
                  </Row>
                ))}
                <div className="mt-2 mb-3">
                  <Button size="sm" variant="outline-secondary" onClick={() => addVariantImage(variantIndex)}>+ Thêm ảnh</Button>
                </div>

                {product.Variants.length > 1 && (
                  <div className="text-end">
                    <Button variant="danger" onClick={() => removeVariant(variantIndex)}>Xoá phiên bản</Button>
                  </div>
                )}
              </div>
            ))}
            <Button variant="secondary" onClick={addVariant}>+ Thêm phiên bản sản phẩm</Button>
          </Card.Body>
        </Card>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <Button variant="secondary" className="me-md-2">Huỷ bỏ</Button>
          <Button variant="primary" type="submit">Lưu sản phẩm</Button>
        </div>
      </Form>

      {/* Các modal */}
      <EditDetailsModal
        show={showEditModal}
        setShow={setShowEditModal}
        setHide={setShowEditModal}
      />
    </Container>
  );
};

export default AddProduct;