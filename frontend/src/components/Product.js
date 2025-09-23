import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card className="my-3 p-3 rounded product-card">
      <Link to={`/product/${product._id}`}>
        <Card.Img
          src={product.image}
          variant="top"
          className="product-image"
          alt={product.name}
        />
      </Link>

      <Card.Body>
        <Link to={`/product/${product._id}`} className="text-decoration-none">
          <Card.Title as="div">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="div">
          <Rating
            value={product.rating}
            text={`${product.numReviews} đánh giá`}
          />
        </Card.Text>

        <Card.Text as="h3" className="text-primary">
          {product.price.toLocaleString('vi-VN')} ₫
        </Card.Text>

        <Card.Text as="div" className="text-muted">
          <small>{product.brand}</small>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;