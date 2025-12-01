import { formatCurrency } from '#utils';
import { Link, useNavigate } from 'react-router-dom';
import slugify from 'slugify';

const Product = ({ product }) => {
	const {
		_id,
		product_name,
		image,
		category_name = "category",
		price_min,
		originalPrice,
		rating,
		quantity_sold,
		// reviewCount,
		isNew,
		salePercentage
	} = product;
	const navigate = useNavigate();
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

	const categorySlug = slugify(category_name, { lower: true, trim: true });
	console.log('Category Slug:', categorySlug);

	return (
		<div className="col-lg-2 col-md-4 col-sm-6 col-12"
			onClick={() => navigate(`san-pham/${categorySlug}/${_id}`, { state: { productId: _id } })}
		>
			{/* Start Single Product */}
			<div className="single-product">
				<div className="product-image">
					<img src={image} alt={product_name} />
					{isNew && <span className="new-tag">New</span>}
					{salePercentage && <span className="sale-tag">-{salePercentage}%</span>}
					{/* <div className="button">
						<Link to={`/${categorySlug}/${_id}`} className="btn">
							<i className="lni lni-cart"></i> Thêm vào giỏ
						</Link>
					</div> */}
				</div>
				<div className="product-info">
					<span className="category">{category_name}</span>
					<h4 className="title">
						<Link to={`/${categorySlug}/${_id}`}>{product_name}</Link>
					</h4>
					<ul className="review">
						{renderStars(rating)}
						<li><span>{rating} • Đã bán {quantity_sold}</span></li>
					</ul>
					<div className="price">
						<span>{formatCurrency(price_min)}</span>
						{originalPrice && originalPrice > price_min && (
							<span className="discount-price">{formatCurrency(originalPrice)}</span>
						)}
					</div>
				</div>
			</div>
			{/* End Single Product */}
		</div>
	);
};

export default Product;