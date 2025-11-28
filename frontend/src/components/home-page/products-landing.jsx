import { useEffect, useState } from "react";

import { useGetProductFilterQuery } from "#services/product-services";
import Product from "#components/common/product";
import { Col, Container, Row } from "react-bootstrap";
import { de } from "zod/v4/locales";

const ProductLanding = ({ query, title = "Tiêu đề", description = "Mô tả" }) => {

  const { data, isLoading, isFetching } = useGetProductFilterQuery(query)
  const [products, setProducts] = useState(data?.dt?.products || []);
  useEffect(() => {
    if (!data) return;
    setProducts(data?.dt?.products || []);
  }, [data]);

  return (
    <section className="trending-product section" style={{ marginTop: "12px" }}>
      <Container>
        <Row>
          <Col xs={12}>
            <div className="section-title">
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </Col>
        </Row>
        <Row>
          {products.length > 0 && products.map(product => (
            <Product key={product.id} product={product} />
          ))}
        </Row>
      </Container>
    </section>
  );
}

export default ProductLanding;