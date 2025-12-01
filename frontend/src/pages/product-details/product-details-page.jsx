import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Row, Col, Container, Form } from "react-bootstrap";
import { useLocation, useParams } from "react-router-dom";
import parse from "html-react-parser";

import "./product-details-page.scss";
import Ratings from "#components/product-details/ratings";
import Comments from "#components/product-details/Comments";
import { formatCurrency } from "#utils";
import { useRenderCount, useTpsGetState, useTpsSelector } from "#custom-hooks";
import { productDetailsHooks } from "#component-hooks/use-product-details-hooks";
import { setProduct, setRatings } from "#features/product-details-slice";
import { useAddToCartMutation, useGetRatingsByProductQuery } from "#services";
import { useGetProductByIdQuery } from "#services/product-services";
// import { useGetProductByIdQuery } from "#services/admin-services";

const GUEST_CART_KEY = "guest_cart";
const loadGuestCart = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY)) || [];
  } catch (error) {
    return [];
  }
};

const persistGuestCart = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("guest-cart-updated"));
};

const ProductDetails = () => {
  useRenderCount("ProductDetails", "ui");
  const userToken = useTpsGetState(state => state?.auth?.user?.token, false);
  const userId = useTpsGetState(state => state?.auth?.user?._id, false);
  const { state: { productId } } = useLocation();
  const dispatch = useDispatch();
  const [addToCart, { isLoading: isAddingCart }] = useAddToCartMutation();
  const { data } = useGetProductByIdQuery(productId)
  const { data: ratingData } = useGetRatingsByProductQuery({ productId: productId, userId });
  useEffect(() => {
    console.log(data, userId);
    if (!data?.dt) return;
    dispatch(setProduct(data?.dt || {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, dispatch])
  useEffect(() => {
    console.log(ratingData);
    if (!ratingData) return;
    dispatch(setRatings(ratingData || {}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratingData])
  const { product } = useTpsSelector(state => state.productDetails, {
    includeProps: ["product"],
  });
  const {
    imagesSlider
  } = productDetailsHooks.useInitTinySlider("#product-imgs-slider", "#thumbnails", product);
  const {
    productVariants, selectedVariant, setSelectedVariant
  } = productDetailsHooks.useProductVariants(product);
  const displayPrice = formatCurrency((selectedVariant && selectedVariant.price) || product?.price || 0);

  const handleAddToCart = () => {
    if (!product?._id || !selectedVariant) return;
    const payload = {
      product_id: product._id,
      variant: { sku: selectedVariant.sku },
      quantity: 1,
    };
    if (userToken) {
      addToCart(payload);
      return;
    }
    const current = loadGuestCart();
    const existingIndex = current.findIndex(
      (ci) => ci.product_id === product._id && ci.variant?.sku === selectedVariant.sku
    );
    if (existingIndex !== -1) {
      current[existingIndex].quantity += 1;
    } else {
      current.push({
        product_id: product._id,
        product_name: product.product_name,
        variant: {
          sku: selectedVariant.sku,
          price: selectedVariant.price,
          attributes: selectedVariant.attributes || [],
        },
        quantity: 1,
        image_url: selectedVariant.imageUrl,
        available_stock: selectedVariant.getOrigin()?.stock,
      });
    }
    persistGuestCart(current);
  };

  const renderTechnical = (attrArr = []) => {
    const visibleAttrs = attrArr.filter(attr => attr.is_show_in_table);

    if (!visibleAttrs.length) return null;

    return (
      <table className="tps-technical-table-content">
        <tbody>
          {visibleAttrs.map(({ attribute, value }, index) => (
            <tr key={index}>
              <td>{attribute}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* <!-- Start Breadcrumbs --> */}
      {/* <Breadcrumbs /> */}
      {/* <!-- End Breadcrumbs --> */}

      {/* <!-- Start Item Details --> */}
      <section className="item-details section">
        <Container>
          <div className="top-area">
            <Row className="align-items-center">
              <Col lg={6} md={12} xs={12}>

                <ProductImagesSlider images={imagesSlider} />

              </Col>
              <Col lg={6} md={12} xs={12}>
                <div className="product-info">
                  <h2 className="title">{product?.product_name}</h2>
                  {/* <p className="category"><i className="lni lni-tag"></i> Drones:<Link to="#">Action cameras</Link></p> */}
                  {/* <h3 className="price">$850<span>$945</span></h3> */}
                  <h3 className="price">{displayPrice}</h3>
                  <p className="info-text">{product?.short_description}</p>
                  {/* <ColorBatteryQuantity /> */}

                  <VariantSelector {...{ productVariants, selectedVariant, setSelectedVariant }} />

                  <div className="bottom-content">
                    <Row className="align-items-end">
                      <Col lg={4} md={4} xs={12}>
                        <div className="button cart-button">
                          <button
                            className="btn"
                            style={{ width: "100%" }}
                            onClick={handleAddToCart}
                            disabled={!selectedVariant || isAddingCart}
                          >
                            Thêm vào giỏ
                          </button>
                        </div>
                      </Col>
                      <Col lg={4} md={4} xs={12}>
                        <div className="wish-button">
                          <button className="btn"><i className="lni lni-reload"></i>So sánh</button>
                        </div>
                      </Col>
                      <Col lg={4} md={4} xs={12}>
                        <div className="wish-button">
                          <button className="btn"><i className="lni lni-heart"></i>Yêu thích</button>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <div className="product-details-info">
            <Row className="g-4">
              <Col md={7} sm={12} xs={12}>
                <div className="info-card product-technical-specifications">
                  <div className="info-card__header d-flex align-items-center justify-content-between">
                    <h6 className="mb-0">Thông số kỹ thuật</h6>
                    <span className="info-card__badge">Xem tất cả</span>
                  </div>
                  {
                    selectedVariant &&
                    selectedVariant.getOrigin().Attributes.findIndex(attr => attr.is_show_in_table) !== -1 &&
                    renderTechnical(selectedVariant.getOrigin().Attributes)
                  }
                </div>

                <div className="info-card product-highlight">
                  <h6>Đặc điểm nổi bật</h6>
                  <p className="mb-0">{parse(product?.detail_description || "")}</p>
                </div>
              </Col>
              <Col md={5} sm={12} xs={12}>
                <div className="info-card coming-soon-card text-center h-100 d-flex flex-column justify-content-center">
                  <span className="coming-soon-card__label">Sắp ra mắt</span>
                  <h5>Ưu đãi đặt trước</h5>
                  <p>Đăng ký để nhận thông tin khi sản phẩm có hàng và ưu đãi độc quyền.</p>
                  <button type="button" className="btn btn-outline-light mt-2 align-self-center">Nhắc tôi</button>
                </div>
              </Col>
            </Row>
            {/* <OldDetails /> */}
          </div>
        </Container>
      </section>
      {/* <!-- End Item Details --> */}
      <Ratings />
      <Comments productId={productId} />
    </>
  )
}

const ProductImagesSlider = ({ images }) => {
  return (
    <div className="product-images">
      <div id="gallery">
        <div id="product-imgs-slider">
          {/* <img src="/assets/images/product-details/01.jpg" alt="#" />
          <img src="/assets/images/product-details/02.jpg" alt="#" />
          <img src="/assets/images/product-details/03.jpg" alt="#" />
          <img src="/assets/images/product-details/04.jpg" alt="#" />
          <img src="/assets/images/product-details/05.jpg" alt="#" /> */}
          {images.map((imgUrl, index) => (
            <img key={index} src={imgUrl} alt={`Product Img ${index + 1}`} />
          ))}
        </div>
        <div className="product-images-controls">
          <div className="images" id="thumbnails">
            {images.map((imgUrl, index) => (
              <img key={index} src={imgUrl} alt={`Thumbnail ${index + 1}`} />
            ))}
          </div>
          <div id="controls-thumbnails" className="thumbnails-controls">
            <div>
              <span><i className="lni lni-chevron-left"></i></span>
            </div>
            <div>
              <span><i className="lni lni-chevron-right"></i></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const VariantSelector = ({ productVariants, selectedVariant, setSelectedVariant }) => {
  return (
    <Form.Group className="variant-selector">
      <Form.Label htmlFor="variant-sku">Chọn phiên bản</Form.Label>
      <div className="variant-options">
        {productVariants.map(variant => {
          const isActive = selectedVariant?.sku === variant.sku;
          return (
            <Form.Label
              key={variant.sku}
              className={`variant-card${isActive ? " variant-card--active" : ""}`}
            >
              <Form.Check
                key={variant.sku + "-input"}
                className="variant-card__input"
                type="radio"
                name="variant-sku"
                value={variant.sku}
                checked={isActive}
                onChange={() => setSelectedVariant(variant)}
              />
              <div key={variant.sku + "-image"} className="variant-card__image">
                <img src={variant.imageUrl} alt={"img"} />
              </div>
              <div key={variant.sku + "-text"} className="variant-card__text">
                {variant.attributes.length > 0 && (
                  variant.attributes.map((attr, idx) => (
                    <span key={variant.sku + "-attr-" + idx} className="variant-card__name">{attr.value}</span>
                  ))
                )}
                <span className="variant-card__price">{formatCurrency(variant.price)}</span>
              </div>
            </Form.Label>
          );
        })}
      </div>
    </Form.Group>
  )
}

// eslint-disable-next-line
const Breadcrumbs = () => {
  return (
    <div className="breadcrumbs">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-md-6 col-12">
            <div className="breadcrumbs-content">
              <h1 className="page-title">Single Product</h1>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-12">
            <ul className="breadcrumb-nav">
              <li><a href="index.html"><i className="lni lni-home"></i> Home</a></li>
              <li><a href="index.html">Shop</a></li>
              <li>Single Product</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line
const ColorBatteryQuantity = () => {
  return (
    <Row className="row">
      <Col lg={4} md={4} xs={12}>
        <div className="form-group color-option">
          <label className="title-label" htmlFor="size">Choose color</label>
          <div className="single-checkbox checkbox-style-1">
            <input type="checkbox" id="checkbox-1" />
            <label htmlFor="checkbox-1"><span></span></label>
          </div>
          <div className="single-checkbox checkbox-style-2">
            <input type="checkbox" id="checkbox-2" />
            <label htmlFor="checkbox-2"><span></span></label>
          </div>
          <div className="single-checkbox checkbox-style-3">
            <input type="checkbox" id="checkbox-3" />
            <label htmlFor="checkbox-3"><span></span></label>
          </div>
          <div className="single-checkbox checkbox-style-4">
            <input type="checkbox" id="checkbox-4" />
            <label htmlFor="checkbox-4"><span></span></label>
          </div>
        </div>
      </Col>
      <div className="col-lg-4 col-md-4 col-12">
        <div className="form-group">
          <label htmlFor="color">Battery capacity</label>
          <select className="form-control" id="color">
            <option>5100 mAh</option>
            <option>6200 mAh</option>
            <option>8000 mAh</option>
          </select>
        </div>
      </div>
      <div className="col-lg-4 col-md-4 col-12">
        <div className="form-group quantity">
          <label htmlFor="color">Quantity</label>
          <select className="form-control">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </select>
        </div>
      </div>
    </Row>
  )
}

// eslint-disable-next-line
const OldDetails = () => {
  return (
    <div className="single-block">
      <Row>
        <Col lg={6} xs={12}>
          <div className="info-body custom-responsive-margin">
            <h4>Chi tiết</h4>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
              irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.</p>
            <h4>Features</h4>
            <ul className="features">
              <li>Capture 4K30 Video and 12MP Photos</li>
              <li>Game-Style Controller with Touchscreen</li>
              <li>View Live Camera Feed</li>
              <li>Full Control of HERO6 Black</li>
              <li>Use App for Dedicated Camera Operation</li>
            </ul>
          </div>
        </Col>
        <Col lg={6} xs={12}>
          <div className="info-body">
            <h4>Specifications</h4>
            <ul className="normal-list">
              <li><span>Weight:</span> 35.5oz (1006g)</li>
              <li><span>Maximum Speed:</span> 35 mph (15 m/s)</li>
              <li><span>Maximum Distance:</span> Up to 9,840ft (3,000m)</li>
              <li><span>Operating Frequency:</span> 2.4GHz</li>
              <li><span>Manufacturer:</span> GoPro, USA</li>
            </ul>
            <h4>Shipping Options:</h4>
            <ul className="normal-list">
              <li><span>Courier:</span> 2 - 4 days, $22.50</li>
              <li><span>Local Shipping:</span> up to one week, $10.00</li>
              <li><span>UPS Ground Shipping:</span> 4 - 6 days, $18.00</li>
              <li><span>Unishop Global Export:</span> 3 - 4 days, $25.00</li>
            </ul>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default ProductDetails;
