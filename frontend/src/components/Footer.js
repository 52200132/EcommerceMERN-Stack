import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <Row>
          <Col md={4}>
            <h5>TechStore</h5>
            <p>
              Cửa hàng điện tử hàng đầu với các sản phẩm laptop, chuột, bàn phím, 
              tai nghe chất lượng cao.
            </p>
          </Col>
          <Col md={4}>
            <h5>Liên kết</h5>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-light">Giới thiệu</a></li>
              <li><a href="/contact" className="text-light">Liên hệ</a></li>
              <li><a href="/privacy" className="text-light">Chính sách bảo mật</a></li>
              <li><a href="/terms" className="text-light">Điều khoản dịch vụ</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Liên hệ</h5>
            <p>
              <i className="fas fa-phone"></i> +84 123 456 789<br />
              <i className="fas fa-envelope"></i> info@techstore.com<br />
              <i className="fas fa-map-marker-alt"></i> Hồ Chí Minh, Việt Nam
            </p>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col className="text-center">
            <p>&copy; 2023 TechStore. Tất cả quyền được bảo lưu.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;