import React, { useEffect } from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import Product from '../components/Product';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { listProducts } from '../redux/actions/productActions';

const HomePage = () => {
  const dispatch = useDispatch();

  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  return (
    <>
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <Row className="text-center">
            <Col>
              <h1 className="display-4 fw-bold">TechStore</h1>
              <p className="lead">
                Khám phá bộ sưu tập laptop, chuột, bàn phím và tai nghe chất lượng cao
              </p>
              <p>
                Từ các thương hiệu hàng đầu với mức giá tốt nhất
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Categories Section */}
      <Container className="my-5">
        <h2 className="text-center mb-4">Danh mục sản phẩm</h2>
        <Row className="text-center">
          <Col md={3} className="mb-3">
            <div className="category-card p-4 border rounded">
              <i className="fas fa-laptop fa-3x text-primary mb-3"></i>
              <h5>Laptop</h5>
              <p>Laptop từ các thương hiệu hàng đầu</p>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="category-card p-4 border rounded">
              <i className="fas fa-mouse fa-3x text-success mb-3"></i>
              <h5>Chuột</h5>
              <p>Chuột gaming và văn phòng</p>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="category-card p-4 border rounded">
              <i className="fas fa-keyboard fa-3x text-warning mb-3"></i>
              <h5>Bàn phím</h5>
              <p>Bàn phím cơ và membrane</p>
            </div>
          </Col>
          <Col md={3} className="mb-3">
            <div className="category-card p-4 border rounded">
              <i className="fas fa-headphones fa-3x text-info mb-3"></i>
              <h5>Tai nghe</h5>
              <p>Tai nghe gaming và âm thanh</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Products Section */}
      <Container>
        <h2 className="text-center mb-4">Sản phẩm nổi bật</h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default HomePage;