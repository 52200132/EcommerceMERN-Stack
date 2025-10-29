import { Link } from 'react-router-dom';

const Product = ({ product }) => {
    const {
        id,
        name,
        image,
        category,
        price,
        originalPrice,
        rating,
        // reviewCount,
        isNew,
        salePercentage
    } = product;

    // Generate star rating
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<li key={i}><i className="lni lni-star-filled"></i></li>);
        }

        if (hasHalfStar) {
            stars.push(<li key="half"><i className="lni lni-star"></i></li>);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<li key={`empty-${i}`}><i className="lni lni-star"></i></li>);
        }

        return stars;
    };

    return (
        <div className="col-lg-3 col-md-6 col-12">
            {/* Start Single Product */}
            <div className="single-product">
                <div className="product-image">
                    <img src={image} alt={name} />
                    {isNew && <span className="new-tag">New</span>}
                    {salePercentage && <span className="sale-tag">-{salePercentage}%</span>}
                    <div className="button">
                        <Link to={`/product/${id}`} className="btn">
                            <i className="lni lni-cart"></i> Add to Cart
                        </Link>
                    </div>
                </div>
                <div className="product-info">
                    <span className="category">{category}</span>
                    <h4 className="title">
                        <Link to={`/product/${id}`}>{name}</Link>
                    </h4>
                    <ul className="review">
                        {renderStars(rating)}
                        <li><span>{rating} Review(s)</span></li>
                    </ul>
                    <div className="price">
                        <span>${price}</span>
                        {originalPrice && originalPrice > price && (
                            <span className="discount-price">${originalPrice}</span>
                        )}
                    </div>
                </div>
            </div>
            {/* End Single Product */}
        </div>
    );
};

export default Product;