import { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import MultiImageUpload from './multi-image-upload';
import Variants from './components/variants';

import { setImages } from 'redux-tps/features/product-slice';
import { setShow, changeContent } from 'redux-tps/features/modal-slice';
import { createTriggerAction } from 'redux-tps/features/component-action-slice';
// import TinyMCE from '../tiny-mce';

const AddProduct = () => {
  const dispatch = useDispatch();
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

  useEffect(() => {
    dispatch(createTriggerAction({ triggerKey: 'upload_action' }))
  }, [dispatch])

  const handleShowModalForEditDetails = () => {
    dispatch(changeContent({
      title: 'Thêm mô tả chi tiết',
      componentName: 'TinyMCE'
    }));
    dispatch(setShow());
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the product data to your API
    console.log('Submitting product:', product);
    // Call API to save product
  };

  console.log('RENDER: add-product');
  return (
    <Container className="my-4">
      <h2 className="mb-4">Thêm sản phẩm mới</h2>
      <Form onSubmit={handleSubmit}>
        <Form>
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

        </Form>
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
                <Button variant="outline-primary" onClick={handleShowModalForEditDetails}>Chỉnh sửa mô tả chi tiết</Button>
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
          <MultiImageUpload
            {...{ uploadsApi: true, uploadToServer: true }}
            selector={(state) => state.product.Images}
            action={images => setImages({ images })}
          />
          {/* <button onClick={() => { dispatch(setImages([])) }}>Lưu hình ảnh</button> */}
        </Card>

        <Card className="mb-4">
          <Card.Header>Phiên bản sản phẩm</Card.Header>
          <Card.Body>
    
            <Variants />
            
          </Card.Body>
        </Card>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <Button variant="secondary" className="me-md-2">Huỷ bỏ</Button>
          <Button variant="primary" type="submit">Lưu sản phẩm</Button>
        </div>
      </Form>

    </Container>
  );
};

export default AddProduct;